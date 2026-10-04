# Krishna Mahato · Teaching portfolio

An academic editorial portfolio for a developing History, Social Science and English educator. The design uses the supplied previews for layout and visual direction; the public repository and Supabase content supply the facts and authentic evidence.

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
```

The local preview runs at http://127.0.0.1:3000/ and also supports `/E-portfolio/`. Browser checks use a separate server on port 4173. On Windows they use installed Microsoft Edge; CI uses Playwright Chromium.

## Architecture

- Thirteen generated static pages preserve Home, Profile/About, Teaching/Experience, Resources/Teaching Evidence, Credentials, Gallery, Résumé, Contact, Owner Studio, three teaching details and 404 URLs.
- `src/content.js` contains the public snapshot, legacy compatibility and validation. It combines the public `portfolio_public` row last updated on 2 October 2026 with the newly supplied Amity observation journal: six resources, eight credentials and eight gallery images.
- `src/views.js`, `src/editorial.js` and `src/view-helpers.js` provide shared page layouts, escaping, navigation and media mapping. Existing detailed lesson and philosophy content remain available.
- `src/styles/*.css` contains design tokens and separate component, layout, page, navigation, motion and print styles. The build generates a single `src/styles.css` bundle.
- `src/app.js` uses the exact reviewed release content and wires filtering, printing and email draft preparation.
- `src/viewer.js` uses native dialogs for keyboard-accessible image/PDF previews and muted hero video playback. Original evidence links remain available without JavaScript.
- `scripts/render-resume.mjs` generates the concise one-page PDF from shared portfolio data. The web/print résumé retains the full record. A changed live record uses the current print view unless a current PDF is supplied.
- `scripts/package-site.mjs` prepares the public `dist` artifact used by the existing GitHub Pages workflow.

Fonts, photographs, evidence previews and media are local. The real portrait is retained. The existing 11-second illustrative film appears beside the introduction with an original soft instrumental score. It loops continuously, trying playback with music and falling back to muted playback if the browser requires a visitor action. A sound button and native pause controls remain available. Reduced-motion visitors see a still preview and can choose to play it. The visible caption beneath the video is removed.

The supplied previews also guide the illustrated paper theme: pale archival maps, a globe, stone fragments, open books, manuscripts and a quill decorate the page edges and section borders. Artwork and audio provenance are recorded in `docs/THEME_ASSETS.md`.

The Amity observation record uses a rebuilt 17-page reflective journal with daily notes, original photographs and edited first-person reflections. Its dates are 1–4 December and its duration is four days; no year is supplied by the source. See [the journal source record](docs/AMITY_JOURNAL_2026-10.md) for generation and migration details. The Pehchaan certificate belongs only to the Pehchaan experience.

## Supabase and Owner Studio

Public reads continue to use `public.portfolio_public`, row `id = 1`. Public settings are in `src/config.js`. The publishable key is browser-safe; database and storage authorization depend on the existing Supabase policies. No service credential belongs in this repository.

Owner Studio remains at `/admin/`. Sign in with the existing owner account, edit or upload, preview, then publish. Authentication tokens remain in memory. Publishing retains its optimistic `updated_at` conflict check; removing a reference does not delete its stored file. Reviewed public copies are limited to 6 MB. New certificates and gallery uploads remain pending until approved. Private source uploads stay authenticated and cannot be attached to public content.

Owner Studio publishes schema 8 content. Actions validates a Supabase snapshot every 15 minutes and deploys the same content for static pages, browser interactions and the PDF. Every release records a content digest in `release.json`. Failed production reads stop the new release. `scripts/audit-public-content.mjs` performs a read-only public-content audit and updates that local snapshot; it never publishes database changes.

Contact prepares a `mailto:` draft for the visitor to review and send. It does not store messages or claim delivery.

## Deployment and checks

The existing main-branch GitHub Pages workflow runs the build, lint, unit tests and browser checks before uploading `dist`. The review workflow also checks generated HTML, CSS, sitemap and résumé for drift. Vercel uses the same `dist` artifact configured by `vercel.json`.

The automated checks cover content safety, owner edits, upload validation, late/offline Supabase reads, keyboard navigation, accessible previews, reduced motion, print behavior, eight viewport widths and desktop/mobile axe audits. Browser reports and screenshots are written to `outputs/browser-checks/`.

See [the redesign audit](docs/EDITORIAL_REDESIGN_2026-10.md) for content provenance, implementation details and verification limits. Real owner authentication and production publishing were not exercised; their test paths use isolated mocks.

The additional accessibility suite checks every route on mobile and desktop with Chromium, Firefox and WebKit. Run `npm run test:accessibility` after installing those browsers. Remote research and database history remain documented in `docs/RESEARCH_IMPLEMENTATION.md` and `supabase/README.md`.
