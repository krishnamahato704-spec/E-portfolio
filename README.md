# Krishna Mahato — Teaching portfolio

The existing 2D teaching portfolio retains its full-width avatar video, editorial layout, GitHub Pages hosting and Supabase project. Navigation uses a compact dropdown beneath the Menu button. It uses a small static generator with progressive browser interactions.

## Development and checks

Node 22 or later is required. `npm ci` installs locked dependencies. `npm run build` generates complete pages and the one-page résumé, then packages `dist/`. `npm run preview` serves that folder at `http://127.0.0.1:3000/E-portfolio/`.

Run `npm run lint`, `npm test`, `npm run test:browser` and `npm run test:accessibility`. Install browser binaries using `npx playwright install --with-deps chromium firefox webkit`. The existing responsive suite covers 320–1440px, keyboard navigation, no-JS/script failure, reduced motion, video lifecycle and mocked owner editing. The accessibility suite checks all 13 routes at mobile/desktop widths across Chromium, Firefox and WebKit. It rejects serious/critical axe findings, overflow, page errors and broken menu navigation. These checks do not certify WCAG compliance.

An installed Chrome may be selected with `CHROME_PATH`. `TEST_ENGINES` can narrow local accessibility diagnostics; CI always runs all three engines. The loopback HTTP preview omits only CSP's `upgrade-insecure-requests` directive because WebKit otherwise upgrades localhost resources to unavailable HTTPS. Production keeps the complete CSP.

## Content and releases

`src/content.js` is the reviewed repository content model and schema. A normal local/PR build uses it. Production Actions fetches and validates one Supabase `portfolio_public` snapshot, then uses that same object for every page, the résumé, metadata and the packaged browser content module. A failed production read stops a new release; the existing deployment stays available.

Public visits do not fetch/replace content. Navigation, filters, lightboxes, print and email drafts remain client interactions. Production combines CSS imports into one stylesheet and stamps first-party imports/links with commit/content digests. The cursor stops requesting animation frames when idle. The avatar pauses offscreen, behind navigation and in a hidden tab, while respecting manual pauses and reduced motion.

Owner Studio saves to Supabase with schema 7 and an optimistic `updated_at` condition. It does not commit changes to GitHub. Actions checks published content every 15 minutes and skips unchanged releases; scheduled runs can be delayed by GitHub. Main pushes, manual runs and repository dispatch also trigger builds. Each successful release records its content digest in `release.json`. No GitHub secret is exposed to Studio.

## Studio and evidence

Open `/admin/` directly and sign in with the existing owner account. There is no public signup. Auth tokens stay in memory. Preview covers every public route. Export/import preserves unpublished drafts. Public uploads use reviewed copies, approved MIME/extension pairs and a 6 MB limit. New certificate/gallery uploads are marked pending review until approved. Private source uploads go to the owner-only bucket and cannot be attached to public content. Removing a reference does not delete its stored original.

The supplied photographs, PDFs and PowerPoint originals remain. Digital Pedagogy and Finland presentations also have exported PDF versions for browser viewing. The Gemini badge remains pending verification and is hidden from recruiter listings. Permission for the identifiable Pehchaan and Sports Day photographs was confirmed by the owner on 2 October 2026; keep the actual permission records private.

The PDF résumé selects three education entries, two main teaching experiences and relevant evidence/learning; the build rejects more than one page. The web résumé contains the fuller record. The contact form prepares a `mailto:` draft and neither stores nor sends messages.

## Deployment

Set GitHub Pages source to **GitHub Actions**. The single `Portfolio CI and Pages` workflow validates PRs and builds/deploys the tested `dist/` artifact from main. No branch/root publishing step is needed. Existing `/E-portfolio/` URLs and nested pages remain valid.

The generator includes clean canonical URLs, Open Graph/Twitter metadata, CSP-authorized ProfilePage/Person JSON-LD, accurate content-based sitemap history and a project-aware 404 page. Admin is `noindex,nofollow` and absent from the public footer. Authentication/RLS enforce editing access.

## Supabase and security

Project `oyqevsygintkjrkfbzpx` uses public `portfolio_public` row 1 and retained owner-only legacy `portfolio_state`. Both tables have RLS. Anonymous users can read published content but cannot read legacy data or write either table. Owner-only policies preserve Studio updates. `portfolio-media` remains public for reviewed evidence; `portfolio-private-source` is private for raw work/permission records. See `supabase/README.md` for recovered history and the separate inspected schema baseline.

`src/config.js` contains only the publishable key, project URL, existing owner UUID and canonical URL. Never add a service/secret key to public code. External authored links require HTTPS, text is escaped, object embeds/remote scripts are blocked, and draft imports are validated. Enable [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) where supported, and enroll the owner in MFA. The connected advisor still reports password protection disabled.

See `docs/RESEARCH_IMPLEMENTATION.md` for the research changes, verification limits and owner-supplied evidence still needed.
