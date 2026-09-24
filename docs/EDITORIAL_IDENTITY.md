# Editorial identity refinement

Prepared 12 September 2026. Branch: feature/editorial-identity, based directly on completed Task 1 commit 617ec129cbe224b04d6f10c10a7d59515b883daa. Intended for one review PR to main; do not merge or publish as part of this task.

## 1. Initial critique
The burgundy homepage panel dominated the educator introduction, especially on mobile. The portrait, academic facts and next steps felt separate. Large repetitive page openings delayed evidence. Teaching entries lacked a strong relationship between dates, institutions and activities. Resources and certificates needed different reading patterns. The first review covered home, profile, teaching, resources, credentials, contact, footer and mobile openings before implementation.

## 2. Design decisions
Keep the existing cream, charcoal and oxblood palette, local serif/sans fonts and factual content. Use a paper-coloured homepage with an enlarged name, mounted portrait and compact academic summary. Give the five main sections numbered chapter headings. Connect the existing classroom stages and dated experience records with fine rules. Keep the teaching philosophy as the main dark section. Present resources as numbered library entries and certificates as full document images with issuer/date definition lists. Use a lighter footer and clearer contact form grouping. This is an educator portfolio with restrained archival cues.

## 3. Rejected ideas
No maps, historical props, parchment textures, invented dates, fabricated resources or new biography. No new animation dependency, scroll hijacking, looping effects or decorative navigation. Avoided adding another dark feature panel to the resource library.

## 4. Changed files
- src/styles.css: editorial identity layer, responsive refinements and removal of competing static stage markers from the motion layer.
- src/views.js: chapter headings, dated experience records, certificate metadata, numbered resource entries and accessible result count.
- src/app.js: resource result count and template cache version.
- src/admin.js: matching template import cache version; editing behaviour unchanged.
- scripts/build.mjs and all 12 generated route documents: asset versions and regenerated templates.
- tests/portfolio.test.mjs and tests/app.browser.js: owner metadata/order, count and hidden-row regressions.
- .github/workflows/review.yml: run validation on the identity branch.
- docs/EDITORIAL_IDENTITY.md: this report.

## 5. Before and after; visual iteration
| Area | Before | After |
|---|---|---|
| Home | Large burgundy opening | Paper spread, charcoal/oxblood name, mounted portrait |
| Teaching | Separate date and generic numbered blocks | Connected dates, clear activity body and original owner order |
| Resources | Heavy dark feature | Light document feature, library rows and live count |
| Credentials | Category-coloured document mounts | Consistent white mounts and explicit issuer/date metadata |
| Profile | Broad prose and fact block | Personal statement with restrained initial and academic sidebar |
| Mobile | Long opening before portrait | Compact portrait/caption pairing and simpler stacked records |

Reviewed the first pass at desktop, tablet and mobile sizes. The second pass raised 10px identity labels to 11px and removed older gold stage marks that competed with the new connecting rule. Rechecked the revised mobile library, teaching opening, contact opening, desktop credentials, desktop profile and tablet homepage. Full-page stitched browser captures occasionally duplicated bands; viewport captures and DOM checks were used to judge actual layout.

## 6. Accessibility
Every route retains one h1, skip navigation and semantic links/forms. Decorative chapter and record numbers are hidden from assistive technology; certificate metadata uses dl/dt/dd. Resource count uses role=status and hidden rows remain display:none. Existing focus indicators, menu Escape behaviour and form labels are retained. Motion regression checks cover focus cancellation, reduced-motion preference changes, actual reduced-motion CSS, missing observer support and cleanup. This is targeted verification, not a complete screen-reader or WCAG audit.

## 7. Responsive checks
All 12 routes checked at 360, 390, 768, 1024 and 1440 pixels: 60 checks, no horizontal document overflow, one h1 per route. The tablet home keeps text and portrait alongside one another; mobile places the portrait below the actions with a compact caption column. Teaching records, library rows and certificate records stack on small screens. Images remain uncropped in certificate mounts.

## 8. Performance
No new font, image, library or network dependency. CSS grows from 46,665 to 71,541 bytes (gzip estimate 9,165 to 13,327; +4,162 bytes). App script grows from 4,392 to 4,557 bytes (gzip +48 bytes); templates grow by 888 bytes (gzip +270). These are local gzip estimates, not measured hosting transfer or a Lighthouse score. Existing motion.js is byte-for-byte unchanged; no new continuous JavaScript work was added. Identity styles are isolated in a named layer for review; a future consolidation could reduce duplicate legacy declarations.

## 9. Tests
- Node test runner: 13/13 tests pass, including all generated route links and fragments, content safety, owner-order preservation and escaped document metadata.
- Browser app fixtures: 19/19 assertions pass across resource refresh, late contact input and failed public read. Includes accurate filtered result count and computed visibility of hidden rows. Fixtures perform no external writes.
- Browser motion fixture: 9/9 checks pass in foreground Chrome. A hidden in-app preview initially failed the 800ms completion deadline; the foreground run completed normally. No production animation change was required.
- Rebuilt all 12 static documents. CI checks build, Node tests and generated-document drift on branch push and PR.
- src/content.js, src/cloud.js, src/config.js and src/motion.js are byte-for-byte unchanged from Task 1.

## 10. Remaining issues and release status
The public resource collection remains empty until the owner publishes files; the existing design example and honest empty state remain available. Authenticated Supabase sign-in, uploads and publishing were not performed; no database or storage mutation was made. Certificate source URLs and factual content remain as supplied. Human visual review and a later explicit merge are still required before this design appears on GitHub Pages.
