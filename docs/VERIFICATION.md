# Redesign verification

This report describes the earlier reading-room version. The current atlas version is documented in [ATLAS_VERIFICATION.md](ATLAS_VERIFICATION.md).

Prepared 9 November 2026 against main revision `69e18b177e3f5051558cfd088117d70d8d9cc735`.

## Observed results

| Check | Result |
| --- | --- |
| Existing build and package pipeline | 13 complete static pages, one-page résumé and dist built |
| `node --test tests/*.test.mjs` | 87/87 passed |
| `node scripts/lint.mjs` | Passed, 102 source/script/test files |
| `node scripts/check-browser.mjs` | 311/311 passed, including eight viewport widths, real document viewers and app/motion/navigation fixtures |
| `node scripts/check-recruiter-access.mjs` | 210/210 passed in Chromium and WebKit |
| `node scripts/check-reading-room.mjs` | 42/42 passed in Chromium and WebKit |
| `node scripts/check-identity.mjs` | 86/86 passed in Chromium and WebKit |
| `node scripts/check-accessibility.mjs` | 52 route/viewport checks in Chromium and WebKit; zero failed |
| `node scripts/check-performance.mjs --dist` | 38/38 media, caching and navigation regressions passed in Chromium and WebKit |
| `node scripts/check-palette-contrast.mjs` | Existing 182/182 palette contracts passed |
| Actual new colors | Project theme capture contrast passed; rendered axe checks and hover-state contrast passed |

The last font-resolution pass was followed by fresh build, unit, lint, complete browser and Chromium/WebKit reading-room checks. The final reading-room checks include 320, 390, 768, 1024 and 1440px layouts, hover/focus behavior, reduced motion, no JavaScript, index state, identity emphasis and cached-page restoration. Desktop and phone screenshots were inspected.

Checks ran with Node 24.22.1 and the repository's existing dependencies. The shell's default Node 20 does not meet the repository's Node >=22 requirement, so the bundled Node 24 binary was used. Browser/server checks ran with localhost and browser-process access. No tests were weakened or removed.

## Preservation audit

Byte-identical to the base revision: `src/config.js`, `src/cloud.js`, `src/admin.js`, `src/app.js`, `src/content.js`, `vercel.json`, `package.json`, `package-lock.json`, `supabase/` and `.github/`.

All 12 original homepage IDs, 34 original href destinations and 18 original data-hook names remain. Existing semantic landmarks, alternative text, viewer labels, gallery states, film controls, skip link, contact labels and owner sign-in hooks remain. The existing test suite checks dynamic owner changes and removal behavior; additional regressions cover an empty journey and replacement schools/journals.

The default content is unchanged. No qualifications, teaching outcomes or availability dates were invented. Existing local media, PDFs, public links, font licences and portrait attributions remain included.

## Review and limits

A separate code review found owner-removal, preview attribution, preference-change and stacking issues. They were corrected and checked before packaging.

These checks verify the local source and generated package. No new GitHub Actions run, remote authentication session, live contact submission, Supabase write, production deployment or field Core Web Vitals measurement was performed. The existing contact form intentionally opens an email draft; its original handler remains unchanged. Automated axe checks and manual review do not constitute a full WCAG conformance audit.

ChatGPT Canvas was unavailable in this desktop session. Complete editable files, a source archive, a commit patch and a local browser preview are supplied instead.

Theme saved under project `teacher-portfolio` as `captured-teacher-portfolio-reading-room-46c50001a16c`; no personal media was copied into the general design collection.
