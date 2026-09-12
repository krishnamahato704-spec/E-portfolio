# Task 1: visual foundation

A modern digital classroom meets a curated history archive. This update changes shared styling only; section markup, factual content, routes and cloud/editor logic are preserved.

## Tokens and primitives

- Ink #202a2e, ivory #f6f3eb, sheet #fffdf8, brass #756039 (hover #584727), light brass #c8b17d for dark surfaces, sage #4f604b, sage surface #e7ebe1. Legacy surface colors now use semantic CSS tokens.
- Self-hosted Source Serif 4 for editorial headings; Segoe UI/Arial for body and controls. Seven named type tokens and type-* utility classes cover display, section, subheading, body, label, caption and metadata. Existing hero type composition is retained.
- 1240px content maximum, fluid gutters, 66ch text measure, fluid 64–128px section-space token, 24–40px card padding and 2px corners. Shared card, stack, auto-grid, text-measure and archive-margin primitives support later tasks.
- Fine existing rules and extremely faint CSS grain provide archival detail. Existing necessary panels share restrained borders and a soft ink shadow.

## Motion usage for future tasks

Use data-motion="fade-up", "masked-text", "image", "stagger", or "section" on an opt-in wrapper inside #main. The existing observer activates these only as content enters view. Stagger applies to direct children, capped at 180ms delay. Use hover-lift for interactive surfaces. data-parallax is an optional desktop CSS scroll-timeline enhancement (8px travel in each direction); unsupported browsers remain static. Do not combine reveal and parallax on the same element; use nested wrappers. Nothing is hidden without JavaScript. Reduced-motion and print disable these effects. No new utilities are attached to section markup in Task 1.

## Changed files

- src/styles.css: tokens, shared visual primitives and motion utilities.
- src/motion.js: prevent child animation completion from prematurely clearing a stagger wrapper.
- scripts/build.mjs: ink browser theme color and stylesheet cache version.
- docs/DESIGN_SYSTEM.md: current system and verification record.
- Generated output: index.html, 404.html, admin/index.html, contact/index.html, credentials/index.html, profile/index.html, resources/index.html, resume/index.html, teaching/index.html, teaching/democracy/index.html, teaching/observation/index.html, teaching/pehchaan/index.html. Only theme color and stylesheet query change in these files.

## Verification

Build: 12 pages. Node: 18 tests passed. Existing browser suites: 38 assertions passed, including search/filter, mocked owner login/upload/preview/publish, observer lifecycle, keyboard visibility and reduced motion. All 12 routes checked at 320, 390, 768 and 1440px with no horizontal document overflow or JavaScript page errors. Desktop and mobile home screenshots visually reviewed. Supabase project was confirmed ACTIVE_HEALTHY; no data/schema/storage changes were needed. Owner writes were tested with local mocks, not a live account session.

Task 1 only. No section redesign or Task 2 work.
