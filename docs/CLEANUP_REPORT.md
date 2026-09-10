# Task 0 — codebase cleanup report

Completed 10 September 2026 on `refactor/codebase-cleanup`, based on production commit `c279f3433d38ba9a8de41f81cbe8430c4ca5576b`.

## Assessment and scope

The existing architecture is small, coherent and dependency-free. Shared views already generate all twelve pages, while the cloud adapter centralizes requests, validation and optimistic publishing. The useful cleanup was limited to duplicate CSS and public interaction initialization. There was no evidence justifying asset deletion, a framework change or a broad editor rewrite.

The current visual identity, content, routes, generated HTML, assets, metadata, CSP, Supabase configuration and cloud adapter are unchanged. No production or database writes were made. This branch must not be merged as part of Task 0.

## Files changed

| File | Change |
| --- | --- |
| `src/styles.css` | Remove four unused tokens, group identical declarations, remove inherited mobile repetitions. |
| `src/app.js` | Bind public interactions once on the persistent main element; extract focused helpers; protect in-progress pointer interaction and handle already-failed images. |
| `src/admin.js` | Share draft-target resolution between ordinary field changes and uploads. |
| `tests/interactions.test.mjs` | Six regression tests for actual public module behavior through a small DOM boundary double. |
| `tests/admin.test.mjs` | Exercise actual editor, templates and cloud adapter with mocked network responses. |
| `.github/workflows/review.yml` | Include the cleanup branch in existing build/test/drift validation; no deployment step. |
| `README.md` | Correct stale release guidance and document the required branch sequence. |
| `docs/CLEANUP_AUDIT.md` | Findings recorded before source edits. |
| `docs/CLEANUP_REPORT.md` | Results, metrics and verification limits. |

## Removals and consolidation

- Removed four unused spacing tokens: `--space-1`, `--space-4`, `--space-5`, `--space-6`.
- Grouped four sets of identical CSS declarations within their existing layers. This removes six standalone rule blocks while retaining every selector.
- Removed two redundant mobile rule blocks and two redundant mobile font-size declarations. Their inherited values are identical.
- Replaced the old `wire()` initializer with one-time delegation and small named helpers. Detached child listeners were already garbage-collectable; this is a reduction in repeated setup, not a claimed memory-leak fix.
- Removed zero entire selector identities, zero assets, zero routes and zero legacy data paths. No commented-out code or unused imports warranted deletion.

## JavaScript and Supabase

Print, copy, filter and contact controls now work through handlers on the retained main element, including after Supabase replaces its descendants. Stable references avoid repeatedly looking up the main container and mobile navigation. The asynchronous refresh retains the complete static page on failure and respects input, active focus and pointer presses.

Image failures use one captured error handler plus a check for failures that happened before initialization. The existing alternative-text fallback is preserved. Admin field and upload handlers now call the same small `draftTarget()` helper for profile, root and collection entries.

The Supabase adapter, endpoints, authorization checks, upload validation, one-read public refresh, optimistic `updated_at` check, schema and policies remain unchanged. Mocked success tests verify login, one content read, two uploads and one publish, including the retained auth header and version condition. Existing tests cover failed reads, forbidden accounts and zero-row publish conflicts. No real owner credentials or live upload/publish were used.

## Accessibility and performance

Keyboard menu state and Escape focus restoration are regression-tested. Existing semantic markup, labels, focus styling, ARIA states, reduced-motion support and print layer remain intact. The image fallback now also covers cached failures. No new motion or visual treatment was added.

Public control and image listeners no longer need rebinding after a refresh; event setup does not scale with the number of resource buttons or images. Queries are scoped to main where appropriate. The page still performs one public content read, with no new downloads or dependencies. No loading-time or Lighthouse improvement is claimed: the source-size change is negligible and readability was preferred over minification.

## Deliberately retained

Optional gallery/resource styles, editor dialogs, upload controls and image-error styles support dynamic states absent from some default pages. The legacy content adapter still supports saved records. Boundary validation remains both in the editor and adapter. All five images, both fonts, favicon, no-script CSS, asset manifest and font licence are used or required supporting material. Historical redesign audit documents remain historical records.

## Validation

- Before cleanup: build succeeded; all 12 existing tests passed; generated pages matched source.
- After cleanup: build succeeded; all 19 tests passed; `git diff --check` passed.
- All twelve routes were inspected at 320, 768 and 1440px. All 36 before/after comparisons of element geometry and selected computed styles matched exactly, with no horizontal overflow.
- Before/after home screenshots were visually inspected; the rendered layout remained equivalent. These comparisons are layout/style checks, not a pixel-diff image benchmark.
- Generated HTML, sitemap, robots, assets, content, views, cloud adapter and configuration were verified unchanged against the baseline commit.
- Existing route tests check one H1, language, duplicate IDs, local links and fragments, asset paths, CSP and complete static content, including nested teaching routes and 404.
- Regression tests cover mobile menu state/Escape focus, late-response protection, refreshed resource filters, input/offline preservation, cached/new image failures, and single execution of print/copy/contact actions with correct email encoding.
- The browser loaded the real editor through an isolated localhost mock login and content response. Further browser interaction became unavailable during the session. The actual editor module was then tested through DOM/network doubles for profile/root/collection edits, preview open/close, profile/collection uploads and publishing. Temporary browser fixtures were removed.
- Print and motion CSS layers are byte-equivalent to the baseline. The print action is tested; a new operating-system print preview was not completed. No comprehensive browser console or assistive-technology audit is claimed.

## Metrics

Source bytes use LF-normalized UTF-8, excluding Windows line-ending noise. JavaScript totals cover all `src/*.js`; test/document growth is separate.

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| CSS lines | 2,126 | 2,102 | −24 |
| CSS bytes | 43,111 | 42,685 | −426 |
| Source JavaScript lines | 310 | 376 | +66 |
| Source JavaScript bytes | 50,456 | 51,253 | +797 |
| Combined CSS + source JS bytes | 93,567 | 93,938 | +371 (+0.4%) |
| Automated tests | 12 | 19 | +7 |
| Asset files removed | — | 0 | — |

The JavaScript increase comes from separating compressed callbacks into readable functions and adding the cached-image/pointer guards. There is no bundled build artifact to compare. Repository growth consists primarily of the audit/report and regression tests; it is not a meaningful runtime cost.

## Handoff

Leave `main` and the published site unchanged. Task 1 must start from `refactor/codebase-cleanup`, then create `feature/editorial-motion`; the later visual task follows on `feature/editorial-identity`. No motion or identity task was implemented here.
