# Backend history

All seven remote migration records are represented in `migrations/`. The first four were recovered from their recorded SQL, without changing the database's history status. The October security migration's filename matches the version actually applied by the connected Supabase tool.

Earlier dashboard SQL created `portfolio_public` and owner policies without migration records. The historical scripts therefore are not a complete verified reset sequence. `schema-baseline.sql` records the current tables, grants, buckets and policies separately, for review/reconstruction on a fresh Supabase project. Do not execute both approaches blindly or rerun the baseline against this existing database. The owner UUID must correspond to the intended Auth account.

Current frontend/publication source: `portfolio_public`, row 1. `portfolio_state` is retained as private legacy data. Storage uses public reviewed copies in `portfolio-media` and owner-only raw sources/permission records in `portfolio-private-source`.

Verification after the October change: anonymous legacy SELECT privilege is false; public SELECT privilege is true; owner sees one legacy row and another authenticated identity sees zero. Both tables retain RLS. Security advisor has only the existing leaked-password-protection warning. No anonymous table write privileges were added.
