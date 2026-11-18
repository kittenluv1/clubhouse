-- Rate limit new reviews per user.

begin;

create index if not exists reviews_user_created_idx
  on public.reviews (user_id, created_at);

create or replace function public.reviews_rate_limit()
returns trigger
language plpgsql
security definer -- count all of the user's reviews, whatever RLS lets them read
set search_path = public
as $$
declare
  max_reviews constant int := 30;
  recent int;
begin
  -- Serialize this user's inserts so concurrent requests can't both pass.
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  select count(*) into recent
  from public.reviews
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';

  if recent >= max_reviews then
    raise exception 'Review rate limit exceeded'
      using errcode = 'P0429';
  end if;

  return new;
end;
$$;

revoke all on function public.reviews_rate_limit() from public, anon, authenticated;

drop trigger if exists reviews_rate_limit on public.reviews;
create trigger reviews_rate_limit
  before insert on public.reviews
  for each row execute function public.reviews_rate_limit();

commit;
