# Editorial portfolio redesign, 4 October 2026

The supplied previews guided spacing, warm surfaces, ink headings, visible navigation, the split hero and selective evidence cards. Their people, dates, qualifications and statistics were not copied.

## Source audit

The working tree already contained extensive modifications and deletions when work began. Those edits were retained. The public `portfolio_public` row was read without writing to Supabase. Its last update was `2026-10-02T14:16:23.645889+00:00`.

The static snapshot now includes the published five teaching resources, eight credentials and eight gallery images. Missing assets referenced by that row were recovered from the existing Git objects, or from their existing published URLs when absent from Git. The original public URLs and publication metadata remain in the content model. No database, storage policy, bucket, authentication credential or private file was changed.

The original portrait is used on Home and About. The original video contains one video track, no audio track, and lasts 11.25 seconds. At the owner's request a sibling MP4 adds an original soft instrumental score while copying the original video stream. It appears beside the homepage introduction and loops continuously, trying automatic music playback and falling back to muted video when the browser requires a tap. Native pause controls and a sound button remain available. Reduced-motion visitors see a still preview with a play button. The visible caption underneath is removed; its accessible name still identifies it as an illustrative film.

## Implementation

- Existing routes, static HTML generation, Supabase refresh, schema compatibility, security escaping, owner authentication and optimistic publishing remain in place.
- `src/view-helpers.js` contains route definitions, escaping, media mapping and résumé freshness checks.
- `src/editorial.js` contains the shared navigation, footer and public page layouts. `src/views.js` routes those layouts and preserves the teaching detail URLs. The existing detailed philosophy and lesson evidence remain available.
- `src/styles/*.css` separates tokens, base styles, cards, layouts, pages, navigation, motion and print. The build produces one stylesheet, eliminating chained CSS requests and overlapping legacy override files.
- Source Serif 4 and Source Sans 3 are self-hosted. Adobe's font license is included.
- The facts strip uses the published duration, explicit lesson count, direct teaching classes, actual experience count and exam application status. No student-outcome metric is inferred.
- Native dialogs provide image and PDF previews with keyboard focus restoration and original-file links. Original links also work without JavaScript.
- The résumé remains generated from the shared content. It uses a concise one-page PDF; the print/web version retains the full record. The generator fails if content overflows a page.
- Owner Studio preserves existing categories that are outside its suggested list and retains schema version 7 on publish. Public/private storage behavior is unchanged.
- The existing main-branch GitHub Pages workflow is restored, and the build packages only public pages, modules and assets into `dist`.

## Verification

The build and lint passed, all 44 unit tests passed, and all 322 browser checks passed. Browser results are recorded in `outputs/browser-checks/results.json`, with screenshots beside it. The suite covers all public routes at 320, 375, 390, 430, 768, 1024, 1280 and 1440 pixels; no-JavaScript/script-failure navigation; Supabase replacement and outage behavior; filtering; owner login/upload/publish using isolated mocks; focus containment and restoration; automatic hero playback with a blocked-sound fallback; music controls and session mute choices; continuous film/music looping; reduced motion; image/PDF dialogs; and résumé printing.

Axe runs against desktop and mobile versions of every public route. No critical or serious violations remain. Decorative backgrounds and image contents can require manual contrast review; the ordinary text palette was darkened where the automated check found insufficient contrast.

Real owner password authentication, production upload/publish and email sending were not performed. The contact workflow continues to prepare a visitor-reviewed email draft. No field Core Web Vitals or full WCAG conformance claim is made.

The repository changes and public deployment package are prepared locally. No commit, push, merge or production deployment was performed during this redesign.
