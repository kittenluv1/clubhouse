-- Allow users to delete their own approved reviews so they can edit
-- and resubmit them through the pending_reviews queue.
alter table public.reviews enable row level security;

drop policy if exists "Users can delete their own reviews" on public.reviews;

create policy "Users can delete their own reviews"
  on public.reviews
  for delete
  to authenticated
  using (auth.uid() = user_id);
