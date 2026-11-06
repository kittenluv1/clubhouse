-- Reviews were readable by anyone with the anon key, exposing user_email.
-- Admin SELECT is needed for .insert().select() during moderation.

begin;

drop policy if exists "Anyone can view reviews" on public.reviews;

drop policy if exists "Users can view own reviews" on public.reviews;
create policy "Users can view own reviews"
  on public.reviews for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Admin can view reviews" on public.reviews;
create policy "Admin can view reviews"
  on public.reviews for select to authenticated
  using ((auth.jwt() ->> 'email') = 'clubhouseucla@gmail.com');

drop policy if exists "Admin can view rejected reviews" on public.rejected_reviews;
create policy "Admin can view rejected reviews"
  on public.rejected_reviews for select to authenticated
  using ((auth.jwt() ->> 'email') = 'clubhouseucla@gmail.com');

drop policy if exists "Profiles visible for FK checks" on public.profiles;

commit;
