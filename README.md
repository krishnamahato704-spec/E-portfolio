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
- `src/opening-boot.js` selects the film cover before Home first paints; `src/identity.js` adds the finite, skippable eight-second opening. New Home arrivals and refreshes offer “Enter with sound,” which starts the supplied voice and film. Internal Home links, history returns, reduced motion and fragment links keep the normal portfolio ready to read. Entry and skip also work with blocked session storage. The opening never locks scrolling or makes the page inert.
- `src/viewer.js` uses native dialogs for image/PDF previews, gallery arrows and swipe, and visitor-requested film playback. Original evidence links remain available without JavaScript.
- `scripts/render-resume.mjs` generates the concise one-page PDF from shared portfolio data. The web/print résumé retains the full record. A changed live record uses the current print view unless a current PDF is supplied.
- `scripts/package-site.mjs` prepares the public `dist` artifact used by the existing GitHub Pages workflow.

Home keeps the illustrative film behind an ivory hero, with an authentic portrait beside the name, a short study summary and expandable roles and subjects of interest. “Enter with sound” starts the full-screen film and supplied voice, followed by an eight-second transition into Home. “Skip to portfolio” gives visitors immediate access. Quiet ambience follows at a default volume of 20%, and each public page has a distinct navigation sound. Mute and volume controls retain the visitor’s choices during the session. The voice stops after the introduction, and the film pauses off screen. Pause, replay and reduced-motion fallbacks remain available. Current internship, subjects taught, availability and location appear in a facts strip. Selected evidence comes before the teaching journey and education overview. About retains the full academic timeline. Phones have persistent Résumé, Evidence and Contact links, including no-JavaScript access, safe-area spacing and a print fallback. Fonts, photographs, illustrations and media are packaged locally. See [the audio and performance report](docs/AUDIO_PERFORMANCE_QA.md).

Each page now has colored illustrations of history, economics, English pedagogy and lesson planning in its margins and section gaps, with smaller photographic accents. The page-atmosphere stylesheet retains the distinct light palettes and adds ochre, terracotta, teal and blue details. Visible decorative intervals keep the artwork out of the reading panels. Photographic accents follow owner replacements, removals and publication status; subject artwork is stored separately as design assets. All decorations are silent, noninteractive and hidden in print. Home keeps its film opening. See [the illustration files and prompts](docs/SUBJECT_ILLUSTRATIONS.md).

Every page has its own light palette: sage, powder blue, peach, lavender, stone, rose and related pale colors. Headings, buttons, navigation and light footers inherit the page colors. White cards and light photo overlays keep text readable. Source Sans 3 provides body text and the personal name; Source Serif 4 semibold provides headings. Personal photographs and the original transparent history and books illustrations remain in use. The local design preview is recorded in `docs/DESIGN_SYSTEM.md`.

The Amity observation record uses a rebuilt 17-page reflective journal with daily notes, original photographs and edited first-person reflections. Its dates are 1–4 December and its duration is four days; no year is supplied by the source. See [the journal source record](docs/AMITY_JOURNAL_2026-10.md) for generation and migration details. The Pehchaan certificate belongs only to the Pehchaan experience.

## Supabase and Owner Studio

Public reads continue to use `public.portfolio_public`, row `id = 1`. Public settings are in `src/config.js`. The publishable key is browser-safe; database and storage authorization depend on the existing Supabase policies. No service credential belongs in this repository.

Owner Studio remains at `/admin/`. Sign in with the existing owner account, edit or upload, preview, then publish. Authentication tokens remain in memory. Publishing retains its optimistic `updated_at` conflict check; removing a reference does not delete its stored file. Reviewed public copies are limited to 6 MB. New certificates and gallery uploads remain pending until approved. Private source uploads stay authenticated and cannot be attached to public content.

Owner Studio publishes schema 8 content. Actions validates a Supabase snapshot every 15 minutes and deploys the same content for static pages, browser interactions and the PDF. Every release records a content digest in `release.json`. Failed production reads stop the new release. `scripts/audit-public-content.mjs` performs a read-only public-content audit and updates that local snapshot; it never publishes database changes.

Contact prepares a `mailto:` draft for the visitor to review and send. It does not store messages or claim delivery.

## Deployment and checks

The existing main-branch GitHub Pages workflow runs the build, lint, unit tests, browser checks and opening checks before uploading `dist`. The review workflow also checks generated HTML, CSS, sitemap and résumé for drift. Vercel uses the same `dist` artifact configured by `vercel.json`.

The automated checks cover content safety, owner edits, upload validation, late/offline Supabase reads, keyboard navigation, accessible previews, reduced motion, print behavior, eight viewport widths and desktop/mobile axe audits. `npm run test:palettes` checks 130 main text/button contrast pairs across all 13 light route palettes at a minimum of 4.5:1; it also runs in review CI. Browser reports and screenshots are written to `outputs/browser-checks/`.

See [the approved design release](docs/APPROVED_DESIGN_RELEASE.md) and [QA record](docs/QA.md) for the current changes and verification limits. The previous [recruiter redesign review](docs/RECRUITER_REDESIGN_REVIEW.md) remains a historical record. The earlier [editorial audit](docs/EDITORIAL_REDESIGN_2026-10.md) retains content provenance. Real owner authentication and production publishing were not exercised; their test paths use isolated mocks.

The additional accessibility suite checks every route on mobile and desktop with Chromium, Firefox and WebKit. Run `npx playwright install chromium firefox webkit`, then `npm run test:accessibility`. Engine subsets can be selected with `TEST_ENGINES`; opening checks use `IDENTITY_TEST_ENGINES`. This Windows machine completed Chromium and WebKit checks; Firefox could not start because of a side-by-side assembly error, even after reinstalling its Playwright bundle. Remote research and database history remain documented in `docs/RESEARCH_IMPLEMENTATION.md` and `supabase/README.md`.

The recruiter access suite starts its own packaged preview on port 4176 and checks mobile links, focus clearance, the direct Home evidence fragment, no-JavaScript access, print and intro behavior. It defaults to Chromium; set RECRUITER_TEST_ENGINES to chromium,webkit after installing both browsers to run both engines. PREVIEW_URL can select an already-running preview.

## Approved release configuration

Vercel production is linked to the main branch of krishnamahato704-spec/E-portfolio. Its existing BUILD_CONTENT_SOURCE setting is supabase. Vercel preview builds also default to Supabase unless explicitly overridden; local and review builds default to the repository snapshot. A failed or invalid published-content read stops the release.

SITE_URL can override the primary origin, which defaults to https://e-portfolio-lake-nine.vercel.app/. Pages builds keep their GitHub Pages origin. The packaged browser config, canonical/Open Graph URLs, sitemap and résumé website link use the same selected origin. No Vercel project or Supabase data was changed during implementation.

`node scripts/serve.mjs --dist` previews the packaged site. `node scripts/capture-approved-design.mjs` captures all 13 routes on desktop and mobile into the local output directory. The changed-file manifest is docs/approved-design-files.txt; it excludes unrelated local input files and the existing migration deletion. Node 22 or later is required; the Windows PATH currently has Node 20, so use the bundled Node 24 runtime or a supported installed version for builds and checks.
