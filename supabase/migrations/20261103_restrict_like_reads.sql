-- Apply to prod only after dev's code is on main: main counts likes with the anon client.

begin;

drop policy if exists "Enable read access for all users" on public.review_likes;
drop policy if exists "Users can view own review likes" on public.review_likes;
create policy "Users can view own review likes"
  on public.review_likes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Enable read access for all users" on public.club_likes;
drop policy if exists "Users can view own club likes" on public.club_likes;
create policy "Users can view own club likes"
  on public.club_likes for select to authenticated
  using ((select auth.uid()) = user_id);

commit;
