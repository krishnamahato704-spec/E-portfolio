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

### Implemented design

The hero gives the name, History & Social Science identity, portrait, study status, location and May 2027 availability priority. Teaching Evidence, Download Résumé and Contact Krishna remain direct actions. The illustrative film moves into a secondary row and loads only after a visitor requests playback.

The homepage then presents visible recruiter facts, source-derived experience metrics, selected evidence, current Panchsheel practice, the teaching journey, philosophy principles, classroom photographs, credentials and contact. Current practice has its own photograph and verified subject/class scope. Different section layouts replace the repeated illustrated card treatment.

The evidence library gives Democracy a larger preview, class/duration context, planned approach and assessment design. Its detail page adds an original-page overview before the existing six stages and sticky evidence guide. Page links still open the six-page original plan. The blank reflection and mentor fields remain clearly identified; no student outcomes were added.

Experience retains filters, source dates, school/community distinctions, original photographs and the scroll-linked timeline. About, credentials, gallery, résumé and contact share the new typography, spacing and paper surfaces. Gallery captions include the published descriptions; the native viewer adds previous/next controls, arrow keys and horizontal swipe. The résumé stays one PDF page and uses the requested primary identity while keeping the documented English experience.

### Design system and mobile behavior

Paper `#f6f3eb`, sheet `#fffdf8`, ink `#263431`, teal `#193f3b`, terracotta `#a76642` and gold `#c7a96b`. Display text uses the existing locally hosted Source Serif 4; body and metadata use Source Sans 3. Section spacing scales from 40px to 88px. Fine borders and small corners replace heavier repeated artwork. Authentic images are contained when a crop would remove evidence.

At narrow widths the primary actions stack, the portrait follows the identity, quick facts use two columns, evidence cards stack and the lesson guide returns to normal document flow. The existing disclosure navigation and no-JavaScript fallback remain available. There is no new framework, animation package or external font request.

### Validation

| Check | Result |
| --- | --- |
| Dependency install | `npm ci` passed; no reported vulnerabilities |
| Build | 13 routes and one-page PDF generated; `dist` packaged |
| Lint and unit suite | 54/54 passed for each command |
| Functional browser suite | 313/313 passed; eight widths: 320, 375, 390, 430, 768, 1024, 1280, 1440 |
| Opening and gallery suite | 66/66 passed across Chromium and WebKit |
| Additional accessibility suite | 52 route/viewport checks across Chromium and WebKit; zero failures |
| Firefox | Installation completed; browser startup failed before tests with Windows side-by-side assembly error for `mozglue` |

The opening checks cover first/new sessions, refresh and navigation, skip, Escape, Tab, scrolling, live reduced-motion changes, unavailable storage, disabled JavaScript, script failure, absence of film downloads and unchanged main-page geometry. Functional checks retain public/fallback content loading, mocked Owner Studio edits, filters, dialogs, PDFs, print, film controls, email draft preparation, keyboard navigation and GitHub Pages paths. The Vercel preview is checked separately after deployment.

Automated axe and interaction checks are not a full WCAG conformance audit. Real owner login, uploads and publishing were not performed. Low-power hardware, real CPU/frame-rate profiling, screen-reader use and field Core Web Vitals remain unverified.

### Performance

The default portrait drops from 128,904 bytes to 15,906 bytes for the 360px copy or 54,796 bytes for the 720px copy. Known local images now include measured intrinsic dimensions. Lazy evidence previews remain lazy; the film requests no MP4 until play.

Local measurements scroll the entire homepage with reduced motion and decode every visible image, using the same server and viewport for both commits. Total same-origin transfer was approximately 2.55 MB before, 2.15 MB after at 390px/768px and 2.19 MB after at 1440px. That is approximately 15% less on mobile and 14% less on desktop despite the added current-practice photograph. These are local resource totals, not field loading or Core Web Vitals scores.

### Before/after assessment

| Area | Before | Review implementation |
| --- | --- | --- |
| Identity | Film held the primary visual position; portrait was small | Portrait and professional identity lead |
| Recruiter facts | Several facts required opening a disclosure | Six relevant facts appear together |
| Evidence | Similar card previews | Featured lesson with planning/assessment context |
| Current practice | Part of the journey | Dedicated school-practice section with source photograph |
| Gallery | Compact repeated cards | Larger photographs, full captions and collection navigation |
| Mobile | Working responsive foundation | Clear stacked actions and dedicated narrow layouts |
| Motion | Hero film attempted automatic playback | Optional film and finite session opening with immediate dismissal |
| Accessibility | Passing baseline checks | Passing supported-engine checks, proportional image frames, keyboard gallery navigation |

This assessment concerns the interface. No recruiter study was conducted, so the one-minute comprehension goal still needs a person to review the preview.

### Files and review artifacts

- Views and media: `src/editorial.js`, `src/evidence.js`, `src/view-helpers.js`, `src/viewer.js`, `src/app.js`.
- Opening and image metadata: `src/identity.js`, `src/image-dimensions.js`, `assets/portrait-360.webp`, `assets/portrait-720.webp`.
- Styles: `src/styles/{tokens,base,theme,identity}.css`, generated `src/styles.css`, `scripts/build-styles.mjs`.
- Metadata and résumé: `scripts/build.mjs`, `scripts/render-resume.mjs`, generated HTML, page history and `assets/krishna-mahato-resume.pdf`.
- Checks: `scripts/check-browser.mjs`, `scripts/check-identity.mjs`, `scripts/capture-redesign.mjs`, `tests/editorial.test.mjs`, `package.json`, existing review/deploy workflows.
- Documentation: this report, `README.md`, selected screenshots and result JSON in `docs/redesign/`.

The full local comparison is `outputs/redesign/comparison.html`. Before and after captures cover Home at 390/768/1440, Experience, Teaching Evidence, Democracy, Credentials, Résumé, About, Gallery and Contact at 390/1440, plus the mobile menu and opening keyframes. Selected permanent review images are linked below.

| View | Before | After |
| --- | --- | --- |
| Desktop hero | [Before](redesign/before-hero-1440.png) | [After](redesign/after-hero-1440.png) |
| Mobile hero | [Before](redesign/before-hero-390.png) | [After](redesign/after-hero-390.png) |
| Full homepage | [Before](redesign/before-home-1440.png) | [After](redesign/after-home-1440.png) |

[Experience](redesign/experience-1440.png), [evidence library](redesign/evidence-1440.png), [Democracy](redesign/democracy-1440.png), [credentials](redesign/credentials-1440.png), [résumé](redesign/resume-1440.png), [mobile navigation](redesign/mobile-menu.png), [timeline opening](redesign/opening-timeline.png), [identity reveal](redesign/opening-identity.png).

### Backend and security

No Supabase changes were made. Published schema 8 content, RLS, storage authorization, private uploads, owner metadata, in-memory authentication and optimistic publishing conflicts remain in the existing architecture. No new credentials or privileged keys were added. Read-only checks verified public content access and rejection of anonymous state access. Security behavior is supported by the existing tests; this was not a penetration test.

### Review and remaining work

Branch: `codex/portfolio-immersive-redesign`. Local preview: `http://127.0.0.1:3000/E-portfolio/`. The pull request and hosted preview will be linked here once created. Production merge and publication require the owner's explicit approval.

Before merge, review the visual direction and opening on the hosted preview. Direct Wix editing was not completed or approved. Verify Firefox on another machine, check a real low-power phone and screen reader, and exercise real owner sign-in and publishing using a safe review record. Future teaching evidence could include an anonymised completed learner response, marked feedback and a completed lesson reflection, with permission and source context.
