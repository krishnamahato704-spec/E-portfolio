-- Astra portfolio content model.
-- The legacy public.portfolio_state table remains untouched for rollback.

create table if not exists public.portfolio_public (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.portfolio_public enable row level security;

grant select on public.portfolio_public to anon, authenticated;
grant insert, update on public.portfolio_public to authenticated;

drop policy if exists "Public portfolio is readable" on public.portfolio_public;
drop policy if exists "Portfolio owner can create public content" on public.portfolio_public;
drop policy if exists "Portfolio owner can update public content" on public.portfolio_public;

create policy "Public portfolio is readable"
on public.portfolio_public for select
to anon, authenticated
using (true);

create policy "Portfolio owner can create public content"
on public.portfolio_public for insert
to authenticated
with check ((select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);

create policy "Portfolio owner can update public content"
on public.portfolio_public for update
to authenticated
using ((select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid)
with check ((select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid);

-- Public visitors receive SELECT only. The publishable browser key cannot edit
-- the record; updates require the confirmed owner account above.
