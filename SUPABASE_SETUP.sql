-- Run once in Supabase Dashboard > SQL Editor.
-- Before running this: create a confirmed Auth user for krishnamahato704@gmail.com
-- in Authentication > Users. Use that user's email and password for Edit mode.
-- Then, in Project Settings > Data API, expose the public.portfolio_state table.

create table if not exists public.portfolio_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- If the table already exists (as in the first portfolio version), add the
-- column used by this site without deleting the existing row or data.
alter table public.portfolio_state add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.portfolio_state enable row level security;
grant select on public.portfolio_state to anon, authenticated;
grant insert, update on public.portfolio_state to authenticated;

drop policy if exists "Anyone can view portfolio state" on public.portfolio_state;
drop policy if exists "Portfolio owner can insert state" on public.portfolio_state;
drop policy if exists "Portfolio owner can update state" on public.portfolio_state;

create policy "Anyone can view portfolio state"
on public.portfolio_state for select
to anon, authenticated
using (true);

create policy "Portfolio owner can insert state"
on public.portfolio_state for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com');

create policy "Portfolio owner can update state"
on public.portfolio_state for update
to authenticated
using ((select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com');

-- Public files allow schools and recruiters to download evidence without logging in.
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio-media', 'portfolio-media', true, 26214400)
on conflict (id) do update set public = true, file_size_limit = 26214400;

drop policy if exists "Portfolio owner can upload evidence" on storage.objects;
drop policy if exists "Portfolio owner can update evidence" on storage.objects;
drop policy if exists "Portfolio owner can delete evidence" on storage.objects;

create policy "Portfolio owner can upload evidence"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com'
);

create policy "Portfolio owner can update evidence"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com'
)
with check (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com'
);

create policy "Portfolio owner can delete evidence"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'krishnamahato704@gmail.com'
);
