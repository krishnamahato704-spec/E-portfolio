# Recruiter experience: staged review and implementation

12 September 2026. Baseline: published editorial identity, main `14d17ad1dd5cb306b905d2574774aa977f8f2069`. Working branch: `feature/recruiter-experience`.

## Stage 1 — Evaluate the supplied prompt

The portfolio already has a distinctive paper/oxblood visual identity and restrained motion. The largest improvement is quicker access to facts and evidence. A school recruiter needs to distinguish target roles from completed qualifications and actual classroom experience.

Approved: a concise recruiter summary, searchable experience/resources/credentials, native activity disclosures, a consistent content model and owner-editor guidance. Rejected: self-assigned skill percentages, automatic carousels, parallax, personalised greetings and a framework/animation-library rewrite. Those add weight or hide information without supplying stronger evidence.

## Stage 2 — Backend and editable facts

The existing `portfolio_public.content` JSONB record remains the content store. JSONB fits this small structured document without additional tables ([Supabase JSON documentation](https://supabase.com/docs/guides/database/json)). Reviewed the [Supabase changelog](https://supabase.com/changelog); this change requires no new API, SDK or exposed table.

Schema version 4 adds optional `profile.location`, `workPreferences`, `targetClasses` and `targetBoards`. The owner confirmed Noida, flexibility to relocate anywhere, classes 6–12, interest in CBSE/ICSE/Cambridge/IB, and CTET applied with the exam postponed. Board names are labelled as interests, not previous experience or qualifications.

Experiences now support editable institution, category, status, duration, duration unit and summary. The existing 16-week Panchsheel internship was previously hard-coded only on the homepage. It is now a shared record, also present in the teaching page, résumé and owner editor. No start date, class assignment or learning outcome was invented. Legacy records gain metadata without overwriting owner edits; explicitly emptied saved collections stay empty.

The public content row was backed up outside the repository, then updated using its exact prior `updated_at` value. The update succeeded at `2026-09-12 05:09:30.995881+00`, and a subsequent query verified version 4, location, eligibility status, board interests and all three experiences. RLS and owner-only write policies remain unchanged. No authentication settings or files were changed.

The security advisor reported pre-existing disabled leaked-password protection. It is an account configuration follow-up, not a regression introduced here: [Supabase remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Stage 3 — Frontend and owner workflow

- Home: shared recruiter facts, joining date, study status, location/relocation, target classes, boards of interest, languages and direct résumé/evidence links.
- Teaching: a current experience record, category filters, search and keyboard-operable native activity disclosures. Search matches school, activity, date and other visible record text.
- Resources: text search combines with category filters and announces the result count. Empty results remain honest.
- Credentials: search by title/issuer/date and filter by category; document images and source links remain available.
- Profile, résumé and contact: shared study status and confirmed location/teaching preferences replace inconsistent hard-coded qualification statements.
- Owner editor: new fields, optional evidence reminders, working preview filters, version-4 publishing and backward-compatible draft import. No arbitrary completeness percentage.
- A late public read preserves typed content, filter choices and an opened activity record.

`src/recruiter.js` contains shared facts and editor reminders; `src/collections.js` handles progressive filtering. All records are present in static HTML. Search controls appear only when JavaScript has wired them; native disclosures work without JavaScript. Styles remain in a named layer, with existing focus and reduced-motion rules retained.

## Stage 4 — Design and school-recruiter assessment

The visual direction is suitable for an emerging educator: readable hierarchy, restrained colour, clear labels and evidence separated from aspirations. The first mobile review found global navigation rules hiding in-page evidence links; these are now scoped to the header. The second pass reduced mobile evidence-link height and removed duplicated ongoing-status labels.

| Recruiter question | Current answer/location |
|---|---|
| Who and which subjects/roles? | Hero, profile and home recruiter summary |
| Where, relocation and joining date? | Home summary, profile, résumé and contact |
| Which classes and boards are sought? | Explicitly labelled interests, not claims of experience |
| Are degrees completed? | Shared in-progress summary and dated education record |
| What is the eligibility-exam status? | CTET applied; exam postponed, as stated by owner |
| What classroom experience exists? | Three experience records; teaching vs observation distinguishable |
| Is there supporting evidence? | Internship/degree/presentation credentials and existing illustrative democracy design |
| Can I save a résumé and contact the candidate? | Printable résumé and email/draft contact flow |

The presentation is ready for review and sharing after the frontend release. It does not establish eligibility for every TGT/PGT vacancy or board. The most valuable next content improvement is an authentic lesson plan and assessment example, followed by confirmed details of current internship responsibilities. Keep proposed lesson designs labelled as proposed; do not invent delivered lessons, student results, references or board experience.

## Validation and practical limits

- 17 Node tests pass: routes/local links, content safety, owner edit preservation, study status changes, optional/escaped recruiter fields and legacy upgrade/removal behaviour.
- 15 new browser checks pass: teaching and credential filters/search, native disclosures, owner editor, preview and mocked publication with optimistic locking.
- Existing app regressions cover successful resource refresh, combined search, late form input, an opened experience record and failed public reads.
- 60 route/width checks: 12 routes at 360, 390, 768, 1024 and 1440 pixels, one h1 each and no horizontal document overflow.
- Desktop/mobile screenshots reviewed using Chromium. This is not a physical-device, Safari/Firefox or full screen-reader audit.
- Authenticated editor behaviour was tested with isolated fake responses. No real owner login, upload or email send was performed.
- Database verification succeeded through the Supabase connector. A separate shell HTTP probe was blocked by the environment's network restriction.

No new framework, font or media asset. Local gzip estimates: stylesheet 13,327 → 13,977 bytes; app 1,752 → 1,499; templates 8,212 → 8,695; content 3,406 → 3,972; new collection/facts helpers total 1,530 bytes. The public bundle grows by about 3 KB compressed overall, not counting unchanged assets. These are estimates, not a Lighthouse or hosting-transfer measurement.

## Integration and continuation

Run `node scripts/build.mjs` after source changes and `node --test tests/*.test.mjs` before committing. CI checks generated-page drift. For local review, set `PORT=4175` and run `node scripts/serve.mjs`. Browser checks live under `tests/`; they do not publish test data.

Source changes are delivered in a review PR; merging main deploys them through the existing GitHub Pages workflow. The backend content upgrade is already applied. A merge has not been requested for this stage.

Read `docs/PORTFOLIO_PROGRESS.md` before resuming. The local `outputs/Portfolio-progress.md` is the latest operational checkpoint. Future stages should add genuine teaching evidence or respond to visual feedback, rather than restarting this redesign.
