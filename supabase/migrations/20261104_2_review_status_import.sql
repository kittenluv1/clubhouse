-- Review consolidation. a failed run rolls back completely.
-- Reviews whose club no longer exists cannot satisfy reviews_club_id_fkey and
-- stay in the old tables.

begin;

do $$
begin
  if exists (select 1 from pg_trigger
             where tgname = 'reviews_before_insert' and tgrelid = 'public.reviews'::regclass) then
    raise exception 'Already applied: re-importing would restore reviews deleted or moderated since';
  end if;
end;
$$;

insert into public.reviews (id, club_id, club_name, review_text,
  membership_start_quarter, membership_start_year, membership_end_quarter, membership_end_year,
  time_commitment_rating, inclusivity_rating, social_community_rating, competitiveness_rating,
  overall_satisfaction, user_alias, user_id, user_email, created_at, updated_at, status)
select p.id, p.club_id, p.club_name, p.review_text,
  p.membership_start_quarter, p.membership_start_year, p.membership_end_quarter, p.membership_end_year,
  p.time_commitment_rating, p.inclusivity_rating, p.social_community_rating, p.competitiveness_rating,
  p.overall_satisfaction, p.user_alias, p.user_id, p.user_email, p.created_at,
  coalesce(p.updated_at, p.created_at at time zone 'UTC'), 'pending'
from public.pending_reviews p
where exists (select 1 from public.clubs c where c."OrganizationID" = p.club_id)
on conflict (id) do nothing;

insert into public.reviews (id, club_id, club_name, review_text,
  membership_start_quarter, membership_start_year, membership_end_quarter, membership_end_year,
  time_commitment_rating, inclusivity_rating, social_community_rating, competitiveness_rating,
  overall_satisfaction, user_alias, user_id, user_email, created_at, updated_at, status)
select r.id, r.club_id, r.club_name, r.review_text,
  r.membership_start_quarter, r.membership_start_year, r.membership_end_quarter, r.membership_end_year,
  r.time_commitment_rating, r.inclusivity_rating, r.social_community_rating, r.competitiveness_rating,
  r.overall_satisfaction, r.user_alias, r.user_id, r.user_email, r.created_at,
  coalesce(r.updated_at, r.created_at at time zone 'UTC'), 'rejected'
from public.rejected_reviews r
where exists (select 1 from public.clubs c where c."OrganizationID" = r.club_id)
on conflict (id) do nothing;

do $$
declare
  missing bigint;
begin
  select count(*) into missing
  from (
    select id, 'pending' as status, club_id from public.pending_reviews
    union all
    select id, 'rejected', club_id from public.rejected_reviews
  ) old
  where exists (select 1 from public.clubs c where c."OrganizationID" = old.club_id)
    and not exists (select 1 from public.reviews r where r.id = old.id and r.status = old.status);
  if missing > 0 then
    raise exception '% reviews were not imported (id already in reviews with another status?)', missing;
  end if;
end;
$$;

alter table public.reviews
  alter column user_id set not null,
  alter column club_id set not null,
  alter column user_alias set not null,
  alter column user_email set not null,
  alter column status set default 'pending';

drop policy if exists "Users can delete their own reviews" on public.reviews;
drop policy if exists "Admins can insert reviews" on public.reviews;
drop policy if exists "Admin can insert reviews" on public.reviews;
drop policy if exists "Admin can view reviews" on public.reviews;

create or replace function public.reviews_before_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.user_email := auth.jwt() ->> 'email';
    new.created_at := now();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_before_insert on public.reviews;
create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

revoke insert, update, delete, truncate on public.pending_reviews, public.rejected_reviews
  from anon, authenticated;

commit;

select status, count(*) as reviews from public.reviews group by status
union all
select 'left behind: club missing', count(*) from (
  select club_id from public.pending_reviews
  union all
  select club_id from public.rejected_reviews
) old
where not exists (select 1 from public.clubs c where c."OrganizationID" = old.club_id);
