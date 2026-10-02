-- Keep the old builder state available to its owner only. No records are deleted.
revoke all privileges on table public.portfolio_state from anon;
drop policy if exists "Anyone can view portfolio state" on public.portfolio_state;
create policy "Portfolio owner can read legacy state" on public.portfolio_state
  for select to authenticated
  using ((select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);

-- Existing public URLs remain valid. New raw/permission files use private storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-private-source', 'portfolio-private-source', false, 6291456,
  array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;
create policy "Portfolio owner can manage private sources" on storage.objects
  for all to authenticated
  using (bucket_id='portfolio-private-source' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
  with check (bucket_id='portfolio-private-source' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
notify pgrst, 'reload schema';
