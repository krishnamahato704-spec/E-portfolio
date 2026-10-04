# Recruiter portfolio redesign — 5 October 2026

Baseline: `480c05b`, matching `origin/main`. Branch: `codex/portfolio-immersive-redesign`.

## Original-site audit

Keep the thirteen generated routes, self-hosted Source Serif / Source Sans fonts, schema 8 content, release snapshot and digest, published Supabase JSON, private source storage, Owner Studio authentication, optimistic publishing conflicts, native evidence dialogs, searchable collections, one-page PDF and print résumé, SEO and deployment workflows. Baseline build passed; 54 unit tests and 311 browser assertions passed.

Improve the human identity hierarchy: the illustrative film occupied the primary visual position while the authentic portrait was small. Recruiter facts were largely behind a disclosure. Evidence previews provided descriptions but did not explain how to read the plan or report. Current school practice lacked its own homepage section. Repeated illustrated backgrounds made sections feel similar.

Simplify repeated theme artwork, duplicated card metadata and equally weighted media. Use one cartographic idea at the opening, more room between sections and stronger contrasts between a featured artifact, the practice record and supporting credentials.

The Amity journal records four days, 1–4 December, with no year. Preserve that correction rather than the older one-week description in the brief. Availability is May 2027; B.Ed. and M.A. remain in progress. CTET remains applied, with no pass claim. Planning evidence does not establish student progress.

## Wix access and visual direction

Wix connector found the existing draft `Krishna Mahato`, ID `7750e7e4-4f59-4030-8024-bb57c7ea7d52`. The Studio reference gallery was opened. Browser/editor control failed before initialization because the local Windows sandbox runner could not start. No Wix page was edited or published and no template was selected. The implementation proceeds using the brief's permitted fallback, with a local prototype for review. It is not an approved Wix export.

Direction: a contemporary museum catalogue. Warm paper, deep teal, restrained terracotta, fine rules, serif display headings and readable sans-serif metadata. The real portrait anchors the hero. Authentic classroom photographs provide the visual substance; the illustrative film sits in a secondary row. Production uses existing semantic views and layered CSS.

## Opening concept

From History to Classroom: a fine timeline draws across an abstract globe, History / Learning / Teaching appear, then KM., the name and professional identity. The paper and lines continue into the hero. A 3.2-second maximum, a visible skip action, once per session, no scroll lock, no video or new runtime. Reduced motion, restored sessions, direct inner-page visits and JavaScript failure show the normal portfolio immediately.

## Scope and safety

Design stays in frontend source. No Supabase schema, policy, content, storage or authentication changes are planned. Anonymous public-row read returned 200; anonymous legacy-state read returned 401. Live owner sign-in and publishing are not exercised against real data. Existing isolated tests cover those paths.

The starting workspace contained a deleted historical migration and untracked teaching PNGs, `bun.lock`, and `output/`. These belong to prior work and are excluded from redesign commits.

Before screenshots and baseline browser report are saved in `outputs/redesign/before/`.

## Review results

Implementation and final validation are recorded here after verification.
