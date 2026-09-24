# Portfolio media, build and database repair

The current remote main (2f6c3b9) had lost the React source and its Vite configuration while retaining React dependencies. Its lockfile omitted those dependencies, so Actions run 35994773216 failed at npm ci. The deployment workflow uploaded the repository root. This change restores the existing tested 3D implementation from 72f105d on top of current main, keeps the newer content, and deploys only validated dist output.

## Changes

- Added all 16 supplied files: eight activity images, a badge, three certificate PDFs, two report/presentation PDFs and two PowerPoint files. Original documents are preserved. NTCC and IKS generated substitutes now resolve to the supplied originals.
- Added 14 responsive WebP previews (768 KB total versus 2.77 MB for the full preview set). Previews load lazily; original PowerPoint/PDF files are only downloaded when opened. Gallery textures use smaller previews and retain source proportions.
- Removed fixed image masks and crop-on-hover effects. Added intrinsic dimensions, contain sizing, full-image lightboxes, and separate teal, slate, copper and plum section colours.
- Connected gallery, certificates, document library and 3D gallery to shared published content. Added editable document URLs and gallery captions/context to the owner editor. Preserved explicit empty collections and existing authentication/optimistic locking.
- Kept assets/ as the single tracked media source. public/assets is generated. Legacy URLs for replaced media remain available through build aliases.
- Removed unused certificate/report/preview generators, generated certificate SVGs, superseded previews, duplicate video, alternate lockfile and root-upload deployment workflow. Original personal video and active legacy editor/detail-page modules are retained.
- Applied explicit_portfolio_api_grants to Supabase. Both public tables have RLS; anon has SELECT only; authenticated has SELECT/INSERT/UPDATE subject to owner-only policies. Existing primary keys already cover the id=1 lookup; the performance advisor reports no issues, so no redundant indexes were added.

## Validation

- Fresh dependency installation succeeded; audit reported zero vulnerabilities.
- TypeScript check and production build pass.
- 39 unit checks pass, including all 16 supplied media records and file signatures.
- 84 production Chrome checks pass, including source aspect ratios, download links, mobile widths, keyboard dialogs, no-WebGL, missing media, reduced motion and unavailable Supabase.
- Database transaction checks confirmed anonymous reads, no anonymous UPDATE/TRUNCATE privileges, zero non-owner updated rows, and one owner updated row. The transaction was rolled back.
- GitHub review and final deployment are checked after pushing this change; the task completion and PR record link the resulting Actions runs.

## Remaining limits

The lazily loaded 3D bundle is about 1.08 MB minified (296 KB gzip), so Vite still emits its advisory chunk-size warning. The original digital pedagogy PowerPoint is 12.8 MB and is download-only. Finland's cover preview comes from the deck's embedded thumbnail. The Gemini badge has no recipient name or verification URL; it is labelled as a supplied badge. Original documents are not fact-corrected or rewritten.

Supabase's security advisor reports leaked-password protection disabled. The connected database tools do not expose this Auth configuration. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. Table permissions, owner RLS and storage policies remain separate from that setting.

## Exact file inventory

Paths are relative to the repository root. “Added/restored” includes the React files recovered from the prior working revision, not a replacement site. Generated build folders, local backups and test screenshots are ignored and excluded.

### Modified (21)

- `.github/workflows/review.yml`
- `.gitignore`
- `README.md`
- `assets/krishna-mahato-resume.pdf`
- `credentials/index.html`
- `gallery/index.html`
- `index.html`
- `package-lock.json`
- `package.json`
- `profile/index.html`
- `resources/index.html`
- `resume/index.html`
- `scripts/build.mjs`
- `src/admin.js`
- `src/content.js`
- `src/evidence.js`
- `src/styles.css`
- `src/views.js`
- `teaching/pehchaan/index.html`
- `tests/portfolio.test.mjs`
- `tsconfig.json`

### Deleted (15)

- `.github/workflows/deploy.yml`
- `assets/amity-ntcc-community-work-report.pdf`
- `assets/certificate-5.svg`
- `assets/certificate-5.webp`
- `assets/certificate-6.svg`
- `assets/certificate-6.webp`
- `assets/certificate-7.svg`
- `assets/certificate-7.webp`
- `assets/certificate-8.webp`
- `assets/hero-video.mp4`
- `assets/roots-to-wings-iks-presentation.pdf`
- `bun.lock`
- `scripts/generate-certificates.mjs`
- `scripts/generate-ntcc-pdf.mjs`
- `scripts/generate-previews.mjs`

### Added or restored (78)

- `.github/workflows/pages.yml`
- `assets/evidence/diksha-ai.pdf`
- `assets/evidence/diksha-ai.webp`
- `assets/evidence/finland-education.pptx`
- `assets/evidence/finland-education.webp`
- `assets/evidence/gemini-badge.webp`
- `assets/evidence/independence-day.webp`
- `assets/evidence/krishna-da.pptx`
- `assets/evidence/krishna-da.webp`
- `assets/evidence/mock-election-activity.webp`
- `assets/evidence/mock-election-class8.webp`
- `assets/evidence/nptel-writing.pdf`
- `assets/evidence/nptel-writing.webp`
- `assets/evidence/ntcc-community-report.pdf`
- `assets/evidence/ntcc-community-report.webp`
- `assets/evidence/pehchaan-collage.webp`
- `assets/evidence/previews/diksha-ai.webp`
- `assets/evidence/previews/independence-day.webp`
- `assets/evidence/previews/krishna-da.webp`
- `assets/evidence/previews/mock-election-activity.webp`
- `assets/evidence/previews/mock-election-class8.webp`
- `assets/evidence/previews/nptel-writing.webp`
- `assets/evidence/previews/ntcc-community-report.webp`
- `assets/evidence/previews/pehchaan-collage.webp`
- `assets/evidence/previews/rootedness-iks.webp`
- `assets/evidence/previews/school-house-placards.webp`
- `assets/evidence/previews/sports-day-artwork.webp`
- `assets/evidence/previews/suraasa-linkedin.webp`
- `assets/evidence/previews/tlm-documentation.webp`
- `assets/evidence/previews/tlm-exhibition.webp`
- `assets/evidence/rootedness-iks.pdf`
- `assets/evidence/rootedness-iks.webp`
- `assets/evidence/school-house-placards.webp`
- `assets/evidence/sports-day-artwork.webp`
- `assets/evidence/suraasa-linkedin.pdf`
- `assets/evidence/suraasa-linkedin.webp`
- `assets/evidence/tlm-documentation.webp`
- `assets/evidence/tlm-exhibition.webp`
- `docs/media-cleanup-report.md`
- `scripts/check-production.mjs`
- `scripts/preserve-pages.mjs`
- `scripts/stage-assets.mjs`
- `src/App.tsx`
- `src/PortfolioContent.tsx`
- `src/components/ActionResearch.tsx`
- `src/components/ActionResearch3D.tsx`
- `src/components/CameraController.tsx`
- `src/components/CertificatesGallery.tsx`
- `src/components/DocumentLibrary.tsx`
- `src/components/EducatorWorkspace.tsx`
- `src/components/EvidenceImage.tsx`
- `src/components/HeroVideo.tsx`
- `src/components/JourneyTimeline.tsx`
- `src/components/Modal.tsx`
- `src/components/Scene3D.tsx`
- `src/components/SceneBoundary.tsx`
- `src/components/StudyLights.tsx`
- `src/components/TeachingPortfolio.tsx`
- `src/components/TeachingStudio3D.tsx`
- `src/components/TlmExhibition.tsx`
- `src/components/TlmExhibition3D.tsx`
- `src/components/VisualGallery.tsx`
- `src/components/VisualGallery3D.tsx`
- `src/components/WorkspaceCanvas.tsx`
- `src/data/actionResearchData.ts`
- `src/data/galleryData.ts`
- `src/data/teachingData.ts`
- `src/data/tlmData.ts`
- `src/image-dimensions.json`
- `src/index.css`
- `src/main.tsx`
- `src/media.js`
- `src/repair.css`
- `src/runtime.ts`
- `src/vite-env.d.ts`
- `supabase/migrations/20260924163206_explicit_portfolio_api_grants.sql`
- `tests/media.test.mjs`
- `vite.config.ts`
