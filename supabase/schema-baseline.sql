-- Inspected portfolio schema as of 2 October 2026. No content or auth credentials.
-- This is a separate reconstruction reference, not a migration to rerun on production.
-- Supabase-managed auth/storage schemas and roles must already exist.
create table if not exists public.portfolio_public (
 id smallint primary key default 1 check (id=1),
 content jsonb not null,
 updated_at timestamptz not null default now(),
 updated_by uuid
);
create table if not exists public.portfolio_state (
 id integer primary key default 1 check (id=1),
 data jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.portfolio_public enable row level security;
alter table public.portfolio_state enable row level security;
grant usage on schema public to anon, authenticated;
revoke all privileges on public.portfolio_public,public.portfolio_state from anon,authenticated;
grant select on public.portfolio_public to anon;
grant select,insert,update on public.portfolio_public,public.portfolio_state to authenticated;

create policy "Public portfolio is readable" on public.portfolio_public
 for select to anon,authenticated using (true);
create policy "Portfolio owner can create public content" on public.portfolio_public
 for insert to authenticated with check ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can update public content" on public.portfolio_public
 for update to authenticated using ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
 with check ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can read legacy state" on public.portfolio_state
 for select to authenticated using ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can insert state" on public.portfolio_state
 for insert to authenticated with check ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can update state" on public.portfolio_state
 for update to authenticated using ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
 with check ((select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,26214400,array['application/pdf',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp']),
 ('portfolio-private-source','portfolio-private-source',false,6291456,array['application/pdf',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp']);
create policy "Portfolio media public read" on storage.objects
 for select to anon,authenticated using (bucket_id='portfolio-media');
create policy "Portfolio owner can upload evidence" on storage.objects
 for insert to authenticated with check (bucket_id='portfolio-media' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can update evidence" on storage.objects
 for update to authenticated using (bucket_id='portfolio-media' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
 with check (bucket_id='portfolio-media' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
create policy "Portfolio owner can delete evidence" on storage.objects
 for delete to authenticated using (bucket_id='portfolio-media' and (owner_id=(select auth.uid()::text) or (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid));
create policy "Portfolio owner can manage private sources" on storage.objects
 for all to authenticated using (bucket_id='portfolio-private-source' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
 with check (bucket_id='portfolio-private-source' and (select auth.uid())='a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);
