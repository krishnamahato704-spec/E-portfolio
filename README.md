# Krishna Mahato — Teaching portfolio

The owner's 2D teaching portfolio, with a full-width avatar video, a numbered menu, and separate content pages. There is no React or Three.js renderer. The existing GitHub Pages repository and Supabase project are retained.

## Run and build

Requires Node.js 22 or later. Install the locked dependencies with `npm ci`.

```sh
npm run build
npm run lint
npm test
npm run test:browser
npm run preview
```

Preview runs at http://127.0.0.1:3000/E-portfolio/. Browser checks use Playwright Chromium, or an installed Chrome selected through `CHROME_PATH`. The build generates the static pages and résumé, then packages deployment files into `dist/`. Only that folder is published.

## Architecture

- Thirteen generated HTML pages, including the owner editor and a 404 page.
- `src/views.js`: shared accessible page templates, navigation, footer, URL and text escaping.
- `src/styles.css`: responsive editorial design, keyboard focus, reduced motion and A4 print styles.
- `src/content.js`: reviewed public content snapshot, compatibility adapter and validation.
- `src/cloud.js`: small Supabase REST/Auth/Storage adapter; timeout handling and optimistic content updates.
- `src/app.js`: progressive live content, mobile navigation, resource filters, printable résumé and email draft preparation.
- `src/admin.js`: separately loaded owner workspace; structured editing, preview, draft export/import and file uploads.
- `assets/evidence/`: supplied photographs, certificates, original PDFs and PowerPoint files, with smaller WebP previews.
- `src/media.js` and `src/image-dimensions.json`: supplied-file metadata and intrinsic image proportions.

The static pages contain the complete reviewed content. Supabase refreshes public content progressively. An unavailable service leaves the readable snapshot in place; form input is never replaced by a late response. No client framework, CDN JavaScript or remote font is required.

## Content & database

The existing project is `oyqevsygintkjrkfbzpx`. The public site reads `public.portfolio_public`, row `id = 1`. The legacy `portfolio_state` and `portfolio-media` storage bucket are preserved. The previously applied explicit grants are recorded in `supabase/migrations/20260924163206_explicit_portfolio_api_grants.sql`. Both public tables retain RLS and owner-only writes. This 2D restoration makes no database changes.

The content document supports profile details, education, experiences, teaching practice, credentials, resources and gallery records. Versioned compatibility handling preserves owner edits and explicitly empty collections.

Owner edits are live for JavaScript-enabled visitors. To refresh the no-JavaScript / search-engine snapshot after substantial edits, copy the reviewed content into `src/content.js`, rebuild and commit the generated pages. Changes made in Studio do not automatically modify the GitHub repository.

The supplied candidate information states: M.A. History at IGNOU, first year cleared; CTET applied; available from May 2027. The B.Ed. and M.A. are labelled in progress. The teaching design is explicitly illustrative. No passed CTET claim, invented assessment results or fabricated classroom evidence is present.

## Configuration

No environment variables or private keys are required for GitHub Pages. Public settings are in `src/config.js`:

| Setting | Purpose |
| --- | --- |
| `url` | Existing Supabase URL |
| `key` | Existing public publishable key |
| `ownerId` | Existing owner Auth UUID (not a secret; RLS is the authority) |
| `canonical` | Existing GitHub Pages project URL |

Never add secret / service credentials to this repository. `.env` files are ignored. The frontend needs only a publishable key.

## Owner workspace

Open `/admin/` and sign in using the existing Supabase owner email and password. There is no public signup or client-side authentication bypass. Access tokens remain in memory and are cleared on reload/sign out; the password field is cleared after a sign-in attempt.

Edit the named fields, add or remove collection entries, upload files and preview the draft. Publishing updates only row 1 and checks `updated_at` to avoid overwriting a newer online version. Export your draft before leaving to retain unpublished work. Importing a draft does not publish it.

Files are uploaded under unique `redesign/` paths in the existing public bucket. Uploads are limited to 10 MB and approved MIME/extension pairs. SVG/HTML/executable uploads are rejected. Removing a reference never deletes its stored file. Credentials and images retain original-file links; visitors receive optimized previews.

The public contact form prepares a `mailto:` draft for the visitor to review and send. The website neither stores submissions nor claims to have sent email. The résumé has an A4 print / Save as PDF view; a separate CV PDF can be uploaded through Studio.

## Deployment & review

The repository previously served the root of `main` through GitHub Pages. Generated pages are committed at that same root; the `/E-portfolio/` subpath and deep links are supported. `.nojekyll`, `robots.txt`, `sitemap.xml`, canonical tags, Open Graph metadata and a project-aware 404 page are included.

1. Review the redesign branch / pull request and local preview.
2. Confirm the content and owner login using the existing account.
3. After approval, merge into `main`. Keep GitHub Pages set to deploy from `main` / root.
4. Verify the published home, nested case studies, Studio and résumé.

The review workflow builds, tests and checks generated pages for drift. It does **not** deploy the redesign branch or change production. No additional hosting account is needed.

## Security

Existing RLS was inspected: both portfolio tables have RLS enabled, public reads are allowed, and content inserts/updates require the existing owner UUID. Storage writes are restricted to the owner's authenticated account. Client identity checks supplement, and never replace, those database policies.

All content is escaped as text, executable URL schemes are rejected, uploads are type/size checked, external links use `noopener noreferrer`, and a restrictive Content Security Policy blocks remote scripts and object embeds. Draft import is validated. Auth tokens are not persisted in localStorage.

Supabase's security advisor reports one existing warning: [leaked-password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Enable it in Auth settings when supported by the project plan. No service key was requested or exposed.

See `docs/AUDIT.md` and `docs/QA.md` for the audit, recruiter review and verification limits.
