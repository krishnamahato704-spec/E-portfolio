grant usage on schema public to anon, authenticated;
revoke all privileges on table public.portfolio_public, public.portfolio_state from anon, authenticated;
grant select on table public.portfolio_public, public.portfolio_state to anon;
grant select, insert, update on table public.portfolio_public, public.portfolio_state to authenticated;
alter table public.portfolio_public enable row level security;
alter table public.portfolio_state enable row level security;
-- Existing owner-only INSERT/UPDATE policies retain USING/WITH CHECK and cached auth.uid().
-- No DELETE/TRUNCATE/REFERENCES/TRIGGER grant is required by the editor.
notify pgrst, 'reload schema';
