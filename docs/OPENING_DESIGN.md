# Task 2 — navigation and opening

The existing ink, ivory, brass and sage foundation remains intact. Only the global navigation, homepage hero and transition into the existing portfolio are redesigned.

## Opening composition

A near-full-screen ink surface sets the name in large Source Serif 4, with the surname in brass italic. The original teaching statement, study summary, availability and authentic portrait remain in use. The visual is framed by a fine corner mark and faint contour-like lines. Mobile uses a compact horizontal portrait composition below the copy and actions; tablet and desktop use separate text and portrait columns.

“Explore My Teaching” links to the existing teaching route. “View Résumé” links to the existing printable résumé. A continue link leads to the transition immediately before the unchanged recruiter summary.

The status line derives from an ongoing internship record, with teacher-education fallback only when a B.Ed. record is in progress. It disappears in favor of a neutral portfolio line when neither condition applies. It is not an online-presence indicator.

## Navigation and motion

Sticky navigation includes Profile, Teaching, Resources, Credentials, Résumé and Let’s Connect. The home header is nearly transparent over the ink hero and becomes opaque ivory after scrolling; inner pages use ivory. Existing active-route indicators are retained, including Teaching on teaching case pages.

The mobile panel contains normal navigation links in a modal dialog. It moves focus to Profile, traps Tab within the panel, closes on Escape or link activation, restores scroll state and focus, makes the background inert, and cleans up on desktop resize and page lifecycle events. No-JavaScript navigation stays visible.

The entrance uses eight explicit steps: navigation, label, name, statement, portrait, status, actions, then secondary annotation. It finishes within 800ms on desktop, with simpler mobile reveals. The name has a masked reveal; faint background detail drifts only where desktop scroll timelines are supported. A slow opacity change marks the evidence-derived status dot. Reduced-motion disables all these effects. Cloud content refresh never replays the entrance.

## Files

- `src/views.js`: header, homepage opening and transition; other view output unchanged.
- `src/opening.css`: scoped navigation/opening styles.
- `src/navigation.js`: accessible mobile panel and scrolled-header behavior.
- `src/styles.css`: registers the opening layer/import and masked name entrance.
- `src/motion.js`: uses explicit hero step ordering.
- `src/app.js`: initializes navigation once and updates changed-module cache versions.
- `src/admin.js`: updates only the view import version so owner preview uses the new opening.
- `assets/no-script.css`: preserves visible navigation without JavaScript.
- `scripts/build.mjs`: updates CSS/application cache versions.
- `tests/navigation.browser.html` and `.js`: navigation and status regressions.
- Twelve generated HTML pages: shared header/cache versions; only homepage main changes.

Task 3 is not included. No Supabase content, schema or storage changes.

## Audit and reference study

The reference repository (https://github.com/lohithadamisetti123/cinematic-portfolio, commit 7ac64d8b7852618897fb7fa157590a402096450d) uses React, Framer Motion stagger variants and a fixed video layer; Lenis is a dependency. Its HeroSection and App were inspected for separation of visual/content layers and reveal sequencing only. No source, branding, custom cursor, video or metallic treatment was copied.

This portfolio uses static generated pages, native ES modules, CSS animation and IntersectionObserver. No Framer Motion or other motion dependency existed; no new dependency was added. Native smooth scrolling and optional CSS scroll timelines provide the first transition without pinning. An archival line physically continues from the hero into the next section label.

Asset audit: the repository has portrait.webp (128,904 bytes), four certificate images, two self-hosted serif font files and no classroom video. A read-only check of the published Supabase record confirmed the same portrait, an empty gallery, no separate uploaded CV, and the ongoing Panchsheel internship. The existing /resume/ route and print/save-PDF button remain the résumé action. An authentic classroom photo or short teaching video could enrich a future iteration; none was fabricated.

## Validation

- Static build: 12 pages. Node regression suite: 18 tests passed.
- Existing browser suites: 38 assertions passed. New navigation fixture: 11 cases passed; native keyboard, scroll restoration and breakpoint checks also passed.
- All 12 routes at 320, 390, 768 and 1440px: no document overflow or JavaScript page errors. Hero also reviewed at 1024px laptop width.
- Real portrait loading, résumé navigation and print action, no-JavaScript links, modal keyboard behavior, live reduced-motion preference and scope preservation verified.
- Local desktop load: 0 layout shift, 0 observed long tasks, approximately 321KB uncompressed same-origin resources; no video or new font/download dependency. These are local observations, not field performance scores.
- At 200% text size, the new header and hero reflow. An existing text link in a later content section exceeds the viewport; later-section styling is outside this task and was left unchanged.
- All inner-page view output and homepage output from the recruiter summary onward compare byte-for-byte equal to Task 1. Owner previews use the updated view module; owner data/write logic is unchanged.
