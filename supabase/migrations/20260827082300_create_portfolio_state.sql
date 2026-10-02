create table if not exists public.portfolio_state (
  id integer primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint portfolio_state_singleton check (id = 1)
);

alter table public.portfolio_state enable row level security;

grant select, insert, update on public.portfolio_state to anon;

grant select, insert, update on public.portfolio_state to authenticated;

drop policy if exists "portfolio state public read" on public.portfolio_state;
drop policy if exists "portfolio state public insert" on public.portfolio_state;
drop policy if exists "portfolio state public update" on public.portfolio_state;

create policy "portfolio state public read" on public.portfolio_state
  for select to anon, authenticated using (true);

create policy "portfolio state public insert" on public.portfolio_state
  for insert to anon, authenticated with check (id = 1);

create policy "portfolio state public update" on public.portfolio_state
  for update to anon, authenticated using (id = 1) with check (id = 1);

