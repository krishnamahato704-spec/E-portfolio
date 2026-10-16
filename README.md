# Krishna Mahato · Teaching portfolio

An editorial teaching portfolio for Krishna Mahato, a developing History and Social Science educator. English remains a documented B.Ed. pedagogy subject. The public repository and published Supabase content supply the facts and authentic evidence.

## Run and verify

Use Node.js 22 or later.

```sh
npm ci
npm run build
npm run dev
npm run lint
npm test
npx playwright install chromium
npm run test:browser
npm run test:identity
npm run test:recruiters
```

The local preview runs at http://127.0.0.1:3000/ and also supports `/E-portfolio/`. Browser checks use a separate server on port 4173. On Windows they use installed Microsoft Edge; CI uses Playwright Chromium.

## Architecture

- Thirteen generated static pages preserve Home, Profile/About, Teaching/Experience, Resources/Teaching Evidence, Credentials, Gallery, Résumé, Contact, Owner Studio, three teaching details and 404 URLs.
- `src/content.js` contains the public snapshot, legacy compatibility and validation, including the Amity observation journal: six resources, eight credentials and eight gallery images. The read-only audit on 5 October 2026 found the published row last updated at `2026-10-04T16:30:13.693024+00:00`.
- `src/views.js`, `src/editorial.js` and `src/view-helpers.js` provide shared page layouts, escaping, navigation and media mapping. Existing detailed lesson and philosophy content remain available.
- `src/styles/*.css` contains design tokens and separate component, layout, page, navigation, motion and print styles. The build generates a single `src/styles.css` bundle.
- `src/app.js` uses the exact reviewed release content and wires filtering, printing and email draft preparation.
- `src/opening-boot.js` selects the first-session film cover before paint; `src/identity.js` provides a 3.2-second opening with visible Skip to portfolio and Enable music controls. Music is loaded only after its own button is selected. Escape, scroll, focus, failure fallbacks and reduced motion preserve readable content. Refreshes do not automatically replay the opening.
- `src/viewer.js` uses native dialogs for image/PDF previews, gallery arrows and swipe. `src/hero-gallery.js` handles the Home photo compilation, manual navigation, six-second rotation and pause/preferences. Original evidence links remain available without JavaScript.
- `scripts/render-resume.mjs` generates the concise one-page PDF from shared portfolio data. The web/print résumé retains the full record. A changed live record uses the current print view unless a current PDF is supplied.
- `scripts/package-site.mjs` prepares the public `dist` artifact used by the existing GitHub Pages workflow.

Home leads with the authentic portrait, study status, joining availability and current teaching scope. The muted illustrative film plays behind the introduction on eligible connections, under a chocolate scrim. Pause film and Hide film remain available; decoding pauses off screen and respects manual choices. Five existing published photographs rotate beside the details on desktop and below them on phones, with original captions/viewers, previous/next controls and a rotation pause. A narrow cream photo border replaces the large enclosing card; captions and controls remain legible over the dark scrim. Focus or manual navigation stops rotation until explicitly restarted; hover, off-screen and hidden-page states pause it. Reduced motion/data saving prevent automatic film or photo rotation. The first eligible session visit retains the brief skippable opening and explicit music choice; refreshes keep the background without replaying the opening. Current internship, additional teaching and relocation preferences follow. Selected evidence precedes the journey and education. Phones retain fixed Résumé, Evidence and Contact shortcuts.

The Home introduction uses a chocolate overlay on the film; the footer uses solid chocolate. Reading areas use a shared cream canvas, warm highlights and light document cards. Selected original illustrations appear softly in page margins, with faint photograph accents on desktop and compact illustrated gaps between sections. Flat opaque surfaces protect text. Ordinary text sections use spacing and rules. Evidence and credentials begin with a compact heading and lead into the actual records; original files, filters and viewers are retained. Smaller classroom-material previews keep the original image untouched. Background decoration is silent, noninteractive and hidden in print.

Every page uses the approved warm cream, chocolate and copper palette, inspired by the Mentora visual reference and implemented in the existing project CSS. Source Sans 3 provides body text and the personal name; Source Serif 4 supplies headings. Planning, ongoing and completed badges use separate labelled treatments. The current design is described in `docs/DESIGN_SYSTEM.md`; the warm follow-up is recorded in `docs/WARM_THEME_2026-10-16.md`. The Botanical and 15 October reports describe earlier versions. Theme source rights and modifications are recorded in `assets/credits/design-theme.md`.

The Amity observation record uses a rebuilt 17-page reflective journal with daily notes, original photographs and edited first-person reflections. Its dates are 1–4 December 2025 and its duration is four days. The scan omits the year; the owner confirmed 2025 on 15 October 2026. The original scan is preserved. See [the journal source record](docs/AMITY_JOURNAL_2026-10.md) for generation and compatibility details. The Pehchaan certificate belongs only to the Pehchaan experience. A private [lesson case-study worksheet](docs/LESSON_CASE_STUDY_WORKSHEET.md) prepares the missing completed evidence without fabricating it.

## Supabase and Owner Studio

Public reads continue to use `public.portfolio_public`, row `id = 1`. Public settings are in `src/config.js`. The publishable key is browser-safe; database and storage authorization depend on the existing Supabase policies. No service credential belongs in this repository.

Owner Studio remains at `/admin/`. Sign in with the existing owner account, edit or upload, preview, then publish. Authentication tokens remain in memory. Publishing retains its optimistic `updated_at` conflict check; removing a reference does not delete its stored file. Reviewed public copies are limited to 6 MB. New certificates and gallery uploads remain pending until approved. Private source uploads stay authenticated and cannot be attached to public content.

Owner Studio saves schema 8 content to Supabase. Scheduled Actions validates a snapshot and deploys GitHub Pages. The prepared Vercel content bridge requires a verified VERCEL_DEPLOY_HOOK secret; until configured, a database save alone does not confirm an updated Vercel release. See `docs/PUBLISHING_AND_SECURITY.md`. Each build uses one snapshot for static pages, browser interactions and the PDF. Every release records a content digest in `release.json`. Failed production reads stop the new release. `scripts/audit-public-content.mjs` performs a read-only public-content audit and updates that local snapshot; it never publishes database changes.

Contact prepares a `mailto:` draft for the visitor to review and send. It does not store messages or claim delivery.

## Deployment and checks

The existing main-branch GitHub Pages workflow runs the build, lint, unit tests, browser checks and opening checks before uploading `dist`. The review workflow also checks generated HTML, CSS, sitemap and résumé for drift. Vercel uses the same `dist` artifact configured by `vercel.json`.

`npm run lint` performs offline syntax, local module, conflict-marker, unsafe-code and JSON checks. The automated checks cover content safety, owner edits, upload validation, late/offline Supabase reads, keyboard navigation, accessible previews, reduced motion, print behavior, eight viewport widths and desktop/mobile axe audits. `npm run test:palettes` checks 182 text/action, dark-surface and control-border pairs across all 13 routes, requiring 4.5:1 for text and 3:1 for control boundaries. It also verifies that the approved shared palette stays consistent and runs in review CI. Browser reports and screenshots are written to `outputs/browser-checks/`; current theme screenshots are in `outputs/warm-theme-20261016/`.

See [the approved design release](docs/APPROVED_DESIGN_RELEASE.md) and [QA record](docs/QA.md) for the current changes and verification limits. The previous [recruiter redesign review](docs/RECRUITER_REDESIGN_REVIEW.md) remains a historical record. The earlier [editorial audit](docs/EDITORIAL_REDESIGN_2026-10.md) retains content provenance. Real owner authentication and production publishing were not exercised; their test paths use isolated mocks.

The additional accessibility suite checks every route on mobile and desktop with Chromium, Firefox and WebKit. Run `npx playwright install chromium firefox webkit`, then `npm run test:accessibility`. Engine subsets can be selected with `TEST_ENGINES`; opening checks use `IDENTITY_TEST_ENGINES`. This Windows machine completed Chromium and WebKit checks; Firefox could not start because of a side-by-side assembly error, even after reinstalling its Playwright bundle. Remote research and database history remain documented in `docs/RESEARCH_IMPLEMENTATION.md` and `supabase/README.md`.

The recruiter access suite starts its own packaged preview on port 4176 and checks mobile links, focus clearance, the direct Home evidence fragment, no-JavaScript access, print and intro behavior. It defaults to Chromium; set RECRUITER_TEST_ENGINES to chromium,webkit after installing both browsers to run both engines. PREVIEW_URL can select an already-running preview.

## Approved release configuration

Vercel production is linked to the main branch of krishnamahato704-spec/E-portfolio. Its existing BUILD_CONTENT_SOURCE setting is supabase. Vercel preview builds also default to Supabase unless explicitly overridden; local and review builds default to the repository snapshot. A failed or invalid published-content read stops the release.

SITE_URL can override the primary origin, which defaults to https://e-portfolio-lake-nine.vercel.app/. Pages builds keep their GitHub Pages origin. The packaged browser config, canonical/Open Graph URLs, sitemap and résumé website link use the same selected origin. No Vercel project or Supabase data was changed during implementation.

`node scripts/serve.mjs --dist` previews the packaged site. `node scripts/capture-approved-design.mjs` captures all 13 routes on desktop and mobile into the local output directory. The changed-file manifest at docs/approved-design-files.txt describes the earlier approved release. The current local revision is recorded in docs/REVIEW_IMPROVEMENTS_2026-10-15.md. Its migration history file was restored from HEAD after checking the live migration record; no migration was rerun. Node 22 or later is required; the Windows PATH currently has Node 20, so use the bundled Node 24 runtime or a supported installed version for builds and checks.
