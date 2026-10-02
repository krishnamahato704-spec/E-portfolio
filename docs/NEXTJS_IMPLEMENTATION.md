# Next.js portfolio implementation

The approved design is implemented with Next.js App Router, React, TypeScript, Tailwind CSS, GSAP, and Framer Motion. Public pages are pre-rendered and exported for the existing `/E-portfolio/` GitHub Pages path.

## Design and evidence

Source Serif 4 headings and local Inter text accompany a warm-paper/navy light palette and a separately checked dark palette. Selected teaching work and research appear before the longer academic record. Original documents retain captions, attribution, and evidence status.

The portfolio includes keyboard-operated lesson-plan notes, active case-study navigation, searchable resources, native image dialogs, persistent CV access, a printable résumé, and an email-draft form. The owner's LinkedIn URL is included. eVidyaloka and UrbanPro remain excluded. Missing CENTA/Advanced Statistics credentials are not advertised.

Degree progress, examination status, and availability retain documented wording. Seminar work is labelled as a presentation. Planning materials do not imply student outcomes. The supplied Gemini badge is separately described with its verification limits.

## Backend boundary

This migration does not modify `src/supabase.js`, `src/config.js`, `src/cloud.js`, `src/content.js`, `src/admin.js`, `src/app.js`, or `supabase/`. The React provider imports the existing public loader and merge/validation functions. No table, policy, authentication, or storage change is introduced.

The original studio is copied into the static build and embedded from its own document. UI tests verify that its sign-in form loads. They perform no real sign-in, upload, or database write. Existing tests cover mocked owner checks, authorization failures, upload validation, and optimistic content updates.

## Visual refinement

The visual review caught a collision with Tailwind's container utility. A dedicated `shell` class now preserves the intended mobile margins and desktop reading width. Refinement removed repeated research text, tightened the hero, added document-preview affordances and restrained hover/focus feedback, and introduced active-section navigation for longer case studies.

A thin loading indicator follows Next.js's actual pending-link status. A loading boundary was removed after no-JavaScript checks found that streamed image pages could remain hidden behind it. Current content remains readable while navigating. Media has intrinsic dimensions and readable error fallbacks. Hover movement is capped at 2px, section entrances at 10px/300ms. Native scrolling and the standard pointer remain in use.

## Accessibility and themes

Mobile navigation contains focus and supports Escape, closing, and focus restoration. Image dialogs use native modal behavior. Document tabs support arrow keys, Home, and End. Inputs have visible labels, status messages are announced, and a skip link reaches main content.

Reduced-motion preferences disable movement and smooth scrolling. The theme follows system settings and preserves an explicit choice. A first-paint script prevents a theme flash. Text contrast is checked in both palettes, including enhanced contrast audits.

## Performance and SEO

Static pages need no Next.js server. Fonts and known evidence previews are local. The build creates responsive WebP display variants, keeping downloadable originals unchanged. Lower-page images are lazy-loaded, and the portrait receives a high fetch priority. GSAP and Framer Motion features load in separate chunks. Tailwind scans only the new UI sources.

Packaging normalizes Windows-exported segment filenames to the dot-separated paths Next.js requests in the browser. Checks cover segment responses and client navigation without a full document reload. The local production preview compresses text and caches fingerprinted chunks.

Public routes have descriptive metadata and canonical URLs. Person structured data uses documented profile information. The sitemap includes teaching cases. Owner routes are excluded and noindex. Real-world Core Web Vitals require deployed measurements and are not inferred from local tests.

## Verification and deployment

The production browser suite checks mobile, tablet, and desktop layouts; page margins; theme persistence; system preference; reduced and normal motion; keyboard navigation; resource filters; image dialogs; no-JavaScript readability; failed/successful public reads; empty owner collections; stale-CV prevention; metadata; assets; and studio availability. Key pages receive axe audits in both themes. Existing unit tests continue to check the original content/backend contracts.

The review run passed 368 browser checks and 39 existing unit tests. Four additional delayed-navigation checks passed, covering real loading feedback, preserved content, reduced motion, and completion without a document reload. Lint, TypeScript, and the production build passed.

Local Lighthouse 13.5 measurements on 2 October 2026 scored 100 in all four desktop categories. The simulated mobile run scored 97 for performance and 100 for accessibility, best practices, and SEO, with 1.9s LCP, 170ms total blocking time, and zero measured layout shift. These are lab results from the compressed local production preview with the public content read enabled; they are not deployed field data or an award assessment.

Reports, screenshots, and local performance audits are saved in ignored `outputs/browser-checks/`. Workflows validate and publish `dist/`. GitHub Pages needs the GitHub Actions deployment source. The UI branch is pushed for review; deployment follows the main-branch workflow. No automatic merge or database deployment is included.
