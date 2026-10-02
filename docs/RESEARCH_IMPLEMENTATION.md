# Research implementation · 2 October 2026

The attached research was read in full and checked against the existing project. The 2D layout, full-width avatar video, static generator and GitHub Pages hosting are retained.

## Content and recruiter flow

- Visible homepage name, teaching identity, study status, location, availability and direct evidence/résumé/contact links.
- CTET remains applied, with the owner's stated 12–13 December 2026 examination window. Individual date/shift is subject to the admit card. This is not a claim that CTET has been passed.
- Pehchaan uses the published 1 June–6 July 2026 period. The observation remains 24–28 November 2025.
- Removed the unsupported “60% improvement demonstrated” assertion from the dossier. Original supplied reports are retained as source documents.
- English remains a documented B.Ed. pedagogy subject and teaching exposure. Primary identity is History and Social Science.
- Gemini badge retained in source/Studio, hidden from public credential and résumé listings pending recipient/date/verification evidence.
- Added a Plan → Teach → Assess → Reflect evidence guide that identifies missing learner scores, methodology, completed school reflections and mentor feedback honestly.
- Both supplied PowerPoint decks exported with PowerPoint's native PDF engine: Digital Pedagogy 10 pages, Finland 16 pages. PDF is the primary viewing link; original PPTX downloads remain.
- The downloadable résumé selects three qualifications, two teaching experiences and relevant learning. Its generator fails deployment if it exceeds one page. The web résumé keeps the fuller record.

## One release, one content snapshot

Production fetches and validates `portfolio_public` once before building. That same saved snapshot generates HTML, PDF, metadata and the packaged content module. Public visits make no live database read and never replace page content. Backend failures stop a new deployment and preserve the previous live release.

Studio uses the shared schema constant and optimistic locking. It still saves to Supabase, not GitHub source files. GitHub Actions checks for content changes at minutes 7, 22, 37 and 52 of each hour; unchanged content skips the build/deployment. Scheduled runs may be delayed by GitHub. Manual workflow/repository dispatch and pushes to main also build releases. No GitHub credential is placed in the browser. Only main may deploy.

Asset versions use the commit/content digest. `release.json` records the deployed snapshot digest and update time. CSS remains one request. JSON-LD is escaped and authorized by an exact CSP hash. Sitemap history changes when rendered content changes. Admin keeps `noindex,nofollow`, is crawlable so the directive can be read, and is absent from the public footer.

## Database and privacy

Recovered four missing migrations from the database's recorded statements. Existing historical statements are preserved, including their old access policies; the later security migration supersedes them. Dashboard-created objects were not recorded by the old migration history. `supabase/schema-baseline.sql` captures the current portfolio tables/policies separately; the history must not be treated as a verified fresh-project reset script.

Anonymous users retain read access to `portfolio_public`, but lose all access to legacy `portfolio_state`. The existing owner retains legacy read/write access; other authenticated users cannot read legacy rows. No legacy records or stored originals were deleted.

Private raw evidence/permission uploads use the new `portfolio-private-source` bucket and owner-only RLS. Reviewed public copies use unique `reviewed/` paths in the existing public bucket. Standard Studio uploads are capped at 6 MB. Private file URLs cannot be attached as public content. HTTPS is required for external authored links.

The owner confirmed documented publication permission for the Pehchaan collage and Sports Day photograph on 2 October 2026. These remain public, with a review note. This confirmation does not constitute an independent inspection of the permission records. Do not put those records in GitHub or public Storage. Existing originals in Git history remain accessible; private future uploads do not retroactively remove historical public files.

## Remaining owner-supplied work

- Completed lesson reflections, anonymised assessed student work, marking rubrics, matched scores/methodology and mentor feedback. These cannot be created as factual evidence by the site implementation.
- Verifiable Gemini credential details before approving that record.
- Owner MFA enrollment and leaked-password protection where the Supabase plan supports it. The connected security advisor still reports leaked-password protection disabled.
- A purchased/owned custom domain and DNS details before domain setup.

Automated accessibility checks cover serious/critical findings and browser navigation/overflow. They do not certify WCAG compliance. Firefox's Windows binary could not start because its side-by-side runtime configuration is missing; all three engines remain mandatory in Linux CI.
