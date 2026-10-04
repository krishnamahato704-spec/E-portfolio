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
```

The local preview runs at http://127.0.0.1:3000/ and also supports `/E-portfolio/`. Browser checks use a separate server on port 4173. On Windows they use installed Microsoft Edge; CI uses Playwright Chromium.

## Architecture

- Thirteen generated static pages preserve Home, Profile/About, Teaching/Experience, Resources/Teaching Evidence, Credentials, Gallery, Résumé, Contact, Owner Studio, three teaching details and 404 URLs.
- `src/content.js` contains the public snapshot, legacy compatibility and validation, including the Amity observation journal: six resources, eight credentials and eight gallery images. The read-only audit on 5 October 2026 found the published row last updated at `2026-10-04T16:30:13.693024+00:00`.
- `src/views.js`, `src/editorial.js` and `src/view-helpers.js` provide shared page layouts, escaping, navigation and media mapping. Existing detailed lesson and philosophy content remain available.
- `src/styles/*.css` contains design tokens and separate component, layout, page, navigation, motion and print styles. The build generates a single `src/styles.css` bundle.
- `src/app.js` uses the exact reviewed release content and wires filtering, printing and email draft preparation.
- `src/identity.js` adds a finite, skippable opening on the first home visit per session. Reduced motion, blocked storage and direct inner-page visits show the normal portfolio immediately. It never locks scrolling or makes the page inert.
- `src/viewer.js` uses native dialogs for image/PDF previews, gallery arrows and swipe, and visitor-requested film playback. Original evidence links remain available without JavaScript.
- `scripts/render-resume.mjs` generates the concise one-page PDF from shared portfolio data. The web/print résumé retains the full record. A changed live record uses the current print view unless a current PDF is supplied.
- `scripts/package-site.mjs` prepares the public `dist` artifact used by the existing GitHub Pages workflow.

Fonts, photographs, evidence previews and media are local. The real portrait leads the hero, using smaller 360px and 720px copies when appropriate. The existing 11-second illustrative film sits below the primary hero and downloads only when requested. After play, it loops with native controls and a music toggle. A reduced-motion preference change pauses active playback; visitors can still explicitly play it.

The visual system uses warm paper, deep teal, restrained terracotta, serif headings, fine rules and authentic classroom imagery. An abstract globe connects the opening to the hero. Previous artwork and audio provenance remain recorded in `docs/THEME_ASSETS.md`.

The Amity observation record uses a rebuilt 17-page reflective journal with daily notes, original photographs and edited first-person reflections. Its dates are 1–4 December and its duration is four days; no year is supplied by the source. See [the journal source record](docs/AMITY_JOURNAL_2026-10.md) for generation and migration details. The Pehchaan certificate belongs only to the Pehchaan experience.

## Supabase and Owner Studio

Public reads continue to use `public.portfolio_public`, row `id = 1`. Public settings are in `src/config.js`. The publishable key is browser-safe; database and storage authorization depend on the existing Supabase policies. No service credential belongs in this repository.

Owner Studio remains at `/admin/`. Sign in with the existing owner account, edit or upload, preview, then publish. Authentication tokens remain in memory. Publishing retains its optimistic `updated_at` conflict check; removing a reference does not delete its stored file. Reviewed public copies are limited to 6 MB. New certificates and gallery uploads remain pending until approved. Private source uploads stay authenticated and cannot be attached to public content.

Owner Studio publishes schema 8 content. Actions validates a Supabase snapshot every 15 minutes and deploys the same content for static pages, browser interactions and the PDF. Every release records a content digest in `release.json`. Failed production reads stop the new release. `scripts/audit-public-content.mjs` performs a read-only public-content audit and updates that local snapshot; it never publishes database changes.

Contact prepares a `mailto:` draft for the visitor to review and send. It does not store messages or claim delivery.

## Deployment and checks

The existing main-branch GitHub Pages workflow runs the build, lint, unit tests, browser checks and opening checks before uploading `dist`. The review workflow also checks generated HTML, CSS, sitemap and résumé for drift. Vercel uses the same `dist` artifact configured by `vercel.json`.

The automated checks cover content safety, owner edits, upload validation, late/offline Supabase reads, keyboard navigation, accessible previews, reduced motion, print behavior, eight viewport widths and desktop/mobile axe audits. Browser reports and screenshots are written to `outputs/browser-checks/`.

See [the recruiter redesign review](docs/RECRUITER_REDESIGN_REVIEW.md) for the current audit, screenshots, changes and verification limits. The earlier [editorial audit](docs/EDITORIAL_REDESIGN_2026-10.md) retains content provenance. Real owner authentication and production publishing were not exercised; their test paths use isolated mocks.

The additional accessibility suite checks every route on mobile and desktop with Chromium, Firefox and WebKit. Run `npx playwright install chromium firefox webkit`, then `npm run test:accessibility`. Engine subsets can be selected with `TEST_ENGINES`; opening checks use `IDENTITY_TEST_ENGINES`. This Windows machine completed Chromium and WebKit checks; Firefox could not start because of a side-by-side assembly error, even after reinstalling its Playwright bundle. Remote research and database history remain documented in `docs/RESEARCH_IMPLEMENTATION.md` and `supabase/README.md`.
