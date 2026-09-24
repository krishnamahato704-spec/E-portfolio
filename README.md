# Krishna Mahato — Teaching portfolio

React, TypeScript, Vite and React Three Fiber portfolio published to GitHub Pages at `/E-portfolio/`. The existing profile, teaching detail pages, resource library and Supabase owner editor remain available.

## Development and checks

Use Node.js 22 or newer. Install with `npm ci`, then use `npm run dev`. Run `npm run lint`, `npm run build`, `npm test` and `npm run test:browser` before publishing. Browser checks require Chrome; set `CHROME_PATH` to its executable. Use `npm run preview` to inspect the built site.

The build regenerates saved detail pages without overwriting the React entry, stages assets, builds Vite into `dist/`, and copies the editor and detail routes into that output. Only `dist/` is deployed. The review workflow validates pull requests; the Pages workflow validates and deploys main.

## Content and media

- `src/App.tsx` and `src/components/`: accessible page, native dialogs, personal video and 3D environments.
- `src/content.js`: local snapshot, versioned compatibility merge and validation.
- `src/media.js`: metadata for the supplied photographs, certificates, reports and presentations.
- `src/PortfolioContent.tsx`: shared published content for the gallery, credentials, document library and 3D gallery.
- `assets/`: single tracked asset source. Supplied PDF and PowerPoint files are preserved in `assets/evidence/`; WebP previews keep their proportions.
- `src/image-dimensions.json`: intrinsic sizes and responsive preview paths.
- `public/assets/`: generated Vite input, ignored by Git. Old direct media URLs are recreated during staging where needed.
- `src/views.js`, `src/app.js`, `src/admin.js` and legacy styles: saved detail pages and owner editing. These remain active code.

Images use intrinsic sizes, contain sizing and lazy loading. Large originals download only when opened. The 3D bundle loads separately, caps resolution and reduces work on mobile, reduced-motion and low-power devices. Content remains readable if WebGL or Supabase fails.

## Supabase

Project `oyqevsygintkjrkfbzpx`, public content in `public.portfolio_public`, row `id = 1`. `src/config.js` contains public connection settings. The editor uses Supabase Auth and optimistic locking. Never add service-role credentials to frontend code.

Both public tables have RLS. Anonymous visitors receive SELECT only. Authenticated users receive SELECT, INSERT and UPDATE, with existing owner-only write policies using USING and WITH CHECK. The grant repair is recorded under `supabase/migrations/`. The legacy state table and media bucket are preserved.

Editor changes update the database, not the repository snapshot. Refresh `src/content.js` and rebuild when updating saved detail-page content. Compatibility merging preserves explicitly emptied collections.

The Gemini image is a supplied badge, not a named certificate. Uploaded originals are kept as supplied; their contents have not been rewritten. See `docs/media-cleanup-report.md` for this repair's checks, limitations and file inventory.
