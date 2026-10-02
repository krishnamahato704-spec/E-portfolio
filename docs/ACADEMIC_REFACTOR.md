# Academic UI refactor

Branch: `ui-refactor-academic`, based on `main` at `6ab93eb`.

The home page now groups education, teaching and volunteer experience, research, professional learning, teaching practice, and contact information into a readable academic portfolio. The design uses locally hosted Source Serif 4 headings, system sans-serif body text, a warm off-white background, white cards, charcoal text, and navy links and buttons.

The background video, custom cursor, scroll progress decoration, staggered reveals, image scaling, and layered animation styles have been removed. Navigation retains keyboard focus containment, Escape handling, and a native fallback when JavaScript is unavailable. Existing teaching files, detailed case studies, filters, image viewer, and printable CV remain available.

Supabase preservation was checked against SHA-256 hashes taken before editing. `src/supabase.js`, `src/config.js`, `src/cloud.js`, `src/admin.js`, `src/app.js`, `src/content.js`, and every file under `supabase/` are unchanged. No database, authentication, policy, storage, or live-content write was performed. Owner-workspace verification uses mocked requests only.

The home template retains the existing live-rendering selectors. Its CV control is inside the refreshed hero-detail region: edited content uses the current printable CV unless a valid custom CV is provided. The bundled PDF is offered only when the source content still matches it.

The owner specification supplies the eVidyaloka and UrbanPro roles, the SETU-TE 2026 seminar name, and the CTET / UGC NET preparation focus. These are presentation-only additions. Dates, duties, scores, and certificate names have not been invented for those roles. The paper title and lead author come from the existing presentation record. The owner supplied the LinkedIn URL during this task. CENTA and Advanced Statistics details remain unavailable and are labelled accordingly.

Validation:

- Static build and JavaScript syntax checks passed.
- All 39 regression tests passed, including client configuration, content escaping, owner access restrictions, version checks, and upload handling.
- All public routes were checked at 320, 375, 390, 430, 768, 1024, 1280, and 1440 pixels, including JavaScript-disabled and script-failure rendering.
- Browser fixtures cover live content replacement, portrait additions/removals, stale-CV avoidance, search/filter controls, menu focus, and mocked owner editing.
- Rendered text on all 13 routes exceeded 7:1 contrast, including the owner sign-in page. The lowest measured ratio was 7.86:1. This is a rendered text check, not a full WCAG conformance audit.

GitHub Pages continues to deploy only from `main`. The new branch runs the review workflow and does not change production.
