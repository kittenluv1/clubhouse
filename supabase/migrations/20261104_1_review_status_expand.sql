-- Review consolidation
begin;

alter table public.reviews
  add column status text not null default 'approved'
    constraint reviews_status_check check (status in ('pending', 'approved', 'rejected'));
alter table public.reviews alter column updated_at set default now();
alter table public.reviews alter column user_id drop default;

create or replace function public.update_club_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_club text := old.club_id;
begin
  -- An OrganizationID rename cascades here after the club row already has the new id.
  if tg_op = 'UPDATE' and old.club_id is distinct from new.club_id
     and not exists (select 1 from clubs where "OrganizationID" = old.club_id) then
    old_club := new.club_id;
  end if;

  if tg_op = 'UPDATE'
     and (old.status, old_club, old.overall_satisfaction, old.time_commitment_rating,
          old.inclusivity_rating, old.social_community_rating, old.competitiveness_rating)
         is not distinct from
         (new.status, new.club_id, new.overall_satisfaction, new.time_commitment_rating,
          new.inclusivity_rating, new.social_community_rating, new.competitiveness_rating) then
    return null;
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.status = 'approved' then
    update clubs set
      satisfaction_sum = coalesce(satisfaction_sum, 0) - coalesce(old.overall_satisfaction, 0),
      time_commitment_sum = coalesce(time_commitment_sum, 0) - coalesce(old.time_commitment_rating, 0),
      inclusivity_sum = coalesce(inclusivity_sum, 0) - coalesce(old.inclusivity_rating, 0),
      social_community_sum = coalesce(social_community_sum, 0) - coalesce(old.social_community_rating, 0),
      competitiveness_sum = coalesce(competitiveness_sum, 0) - coalesce(old.competitiveness_rating, 0),
      total_num_reviews = greatest(0, coalesce(total_num_reviews, 0) - 1)
    where "OrganizationID" = old_club;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.status = 'approved' then
    update clubs set
      satisfaction_sum = coalesce(satisfaction_sum, 0) + coalesce(new.overall_satisfaction, 0),
      time_commitment_sum = coalesce(time_commitment_sum, 0) + coalesce(new.time_commitment_rating, 0),
      inclusivity_sum = coalesce(inclusivity_sum, 0) + coalesce(new.inclusivity_rating, 0),
      social_community_sum = coalesce(social_community_sum, 0) + coalesce(new.social_community_rating, 0),
      competitiveness_sum = coalesce(competitiveness_sum, 0) + coalesce(new.competitiveness_rating, 0),
      total_num_reviews = coalesce(total_num_reviews, 0) + 1
    where "OrganizationID" = new.club_id;
  end if;

  return null;
end;
$$;

with approved as (
  select club_id, count(*) n,
    sum(overall_satisfaction::float8) sat, sum(time_commitment_rating::float8) tim,
    sum(inclusivity_rating::float8) inc, sum(social_community_rating::float8) soc,
    sum(competitiveness_rating::float8) com
  from public.reviews where status = 'approved' group by club_id
),
expected as (
  select c."OrganizationID" id, coalesce(a.n, 0)::int n, coalesce(a.sat, 0) sat, coalesce(a.tim, 0) tim,
    coalesce(a.inc, 0) inc, coalesce(a.soc, 0) soc, coalesce(a.com, 0) com
  from public.clubs c left join approved a on a.club_id = c."OrganizationID"
)
update public.clubs c set
  total_num_reviews = e.n, satisfaction_sum = e.sat, time_commitment_sum = e.tim,
  inclusivity_sum = e.inc, social_community_sum = e.soc, competitiveness_sum = e.com
from expected e
where c."OrganizationID" = e.id
  and (coalesce(c.total_num_reviews, 0), coalesce(c.satisfaction_sum, 0), coalesce(c.time_commitment_sum, 0),
       coalesce(c.inclusivity_sum, 0), coalesce(c.social_community_sum, 0), coalesce(c.competitiveness_sum, 0))
      is distinct from (e.n, e.sat, e.tim, e.inc, e.soc, e.com);

create or replace function public.reviews_before_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated')
     and (new.id, new.user_id, new.user_email, new.user_alias, new.created_at)
         is distinct from (old.id, old.user_id, old.user_email, old.user_alias, old.created_at) then
    raise exception 'id, user_id, user_email, user_alias and created_at cannot be changed'
      using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_before_update on public.reviews;
create trigger reviews_before_update
  before update on public.reviews
  for each row execute function public.reviews_before_update();

drop policy if exists "Users can submit pending reviews" on public.reviews;
create policy "Users can submit pending reviews"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "Users can resubmit own reviews" on public.reviews;
create policy "Users can resubmit own reviews"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id and status in ('approved', 'rejected'))
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "Users can delete own rejected reviews" on public.reviews;
create policy "Users can delete own rejected reviews"
  on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id and status = 'rejected');

create or replace function public.is_approved_review(review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from reviews where id = review_id and status = 'approved');
$$;

drop policy if exists "Enable insert for users based on user_id" on public.review_likes;
drop policy if exists "Users can like approved reviews" on public.review_likes;
create policy "Users can like approved reviews"
  on public.review_likes for insert to authenticated
  with check ((select auth.uid()) = user_id and public.is_approved_review(review_id));

create index if not exists reviews_club_approved_idx
  on public.reviews (club_id, created_at desc) where status = 'approved';
create index if not exists reviews_pending_queue_idx
  on public.reviews (updated_at) where status = 'pending';
create index if not exists reviews_user_status_idx
  on public.reviews (user_id, status);

commit;
