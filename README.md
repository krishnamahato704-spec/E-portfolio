# Krishna Mahato — Academic portfolio

A React and Next.js portfolio built from the approved editorial blueprint. The public UI uses Tailwind CSS, GSAP, and Framer Motion, with light/dark themes, selected teaching evidence, research, searchable resources, and accessible mobile layouts.

Work lives on `ui-refactor-academic`. Supabase services, content validation, authentication, schemas, and the original owner studio are preserved.

## Run locally

Use Node.js 22 or later and the committed lockfile.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/E-portfolio/`.

```sh
npm run lint
npm run build
npm run typecheck
npm test
npm run test:browser
npm run preview
```

Browser tests use Playwright Chromium. Install it with `npx playwright install chromium`, or select an existing Chrome through `CHROME_PATH`. Reports and screenshots are written to ignored `outputs/browser-checks/`.

## Structure

```text
app/                       Next.js routes, metadata, fonts, theme tokens, styles
frontend/components/       Shared navigation, records, media, motion, and filters
frontend/pages/            Public page compositions
frontend/lib/              UI types, URL adapters, case studies, and SEO
src/                       Preserved content, Supabase services, and owner studio
assets/                    Existing documents, photos, previews, and fonts
scripts/                   Static builds, packaging, and browser checks
```

Public routes include `/`, `/teaching/`, `/research/`, `/about/`, `/resources/`, `/credentials/`, `/contact/`, `/resume/`, `/gallery/`, and four teaching cases. `/profile/` remains supported with a canonical pointing to `/about/`.

## Content and rendering

Next.js pre-renders public pages from the reviewed snapshot. The React provider calls the unchanged `src/cloud.js` loader and existing merge/validation functions. Explicitly removed collections stay removed. During a service outage or without JavaScript, static content remains readable.

Late content does not replace an active form or interrupt reading. A pending valid update is applied on the next route change. The bundled CV is offered only when corresponding content matches; edited profiles use the current printable résumé unless the owner supplies a CV URL.

Studio edits do not update the repository or search-engine snapshot automatically. Updating that snapshot remains a separate reviewed content change and build.

## Motion and themes

GSAP loads separately for subtle section entrances. Framer Motion handles page entrances, mobile navigation, image previews, and document notes. Native smooth scrolling preserves browser behavior. Reduced-motion preferences disable movement and smooth scrolling.

The initial theme follows the system. Explicit choices are stored locally and applied before first paint. Fonts and known evidence previews are self-hosted. Responsive display images are generated during the build; original evidence files stay intact. Media reserves space and has readable error fallbacks. A thin loading indicator follows actual pending navigation without hiding the current page.

## Owner studio

`/admin/` embeds the original studio at `/admin/studio.html`. Its scripts and styles are copied verbatim. Sign-in, owner checks, optimistic publishing, draft import/export, and uploads remain in the original modules. No auth replacement or database migration is introduced.

The contact form opens an email draft. It does not store submissions or send email. The résumé supports printing and saving as PDF.

## Build and deployment

`npm run build` refreshes the existing generated documents and CV, prepares assets, exports Next.js, and packages `dist/`. Generated `public/`, `.next/`, `out/`, and `dist/` folders are ignored. Only `dist/` is the deployment artifact.

GitHub Pages must use the **GitHub Actions** deployment source. Serving the repository root would serve retained legacy HTML. The Pages workflow publishes the artifact when work reaches `main`; pushing the UI branch runs review checks without merging or deploying it.

Canonical URLs, social metadata, Person structured data, sitemap, robots rules, and a static 404 are included. Owner routes are noindex.

`npm run build:legacy` retains the previous compatibility build. It overwrites `dist/` with the old site, so run `npm run build` again before reviewing or publishing Next.js.
