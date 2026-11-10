# Teacher & Forever Student Implementation Plan

Goal: Implement the editorial redesign in the existing vanilla static generator.

Architecture: Keep content, configuration and backend modules intact. Update homepage output in src/editorial.js and the home philosophy presentation; add one final scoped CSS layer and an isolated progressive-enhancement module imported through src/motion.js. Regenerate complete pages with the existing build.

Tech stack: semantic HTML, CSS cascade layers, JavaScript modules, Node 24 available locally (CI requires Node >=22), existing Playwright and axe checks.

Spec: specs/teacher-forever-student/spec.md

## Global constraints

Preserve all existing IDs, landmarks, accessibility attributes, test hooks, public links and owner content behavior. Do not edit src/config.js, src/cloud.js, src/admin.js, src/app.js, vercel.json, supabase/ or .github/. Keep the exact tested opening and closing section tag signatures. No new framework or remote dependency.

## Implementation

1. Record infrastructure and baseline tests. Build only from the repository's current content without changing the remote content.
2. Update the opening, curated evidence and teaching journey in src/editorial.js. Keep existing classes and add scoped editorial wrappers. Insert a teacher/student paired introduction before evidence while maintaining the evidence → journey → education order.
3. Add src/reading-room.js with initReadingRoom(root) and cleanupReadingRoom(). Implement fine-pointer previews and optional perspective emphasis with labelled buttons. Integrate lifecycle in src/motion.js. Keep all content visible without JS and all substantive links as native anchors.
4. Add src/styles/reading-room.css after gallery-grid and before print in scripts/build-styles.mjs. Scope homepage layout, preserve other routes' layouts, and unify small navigation/control details. Use existing motion for subtle entrance animation. Disable decorative transition effects with reduced motion.
5. Build and run node tests, lint, browser, identity, recruiter, palette, accessibility and performance checks available in this environment. Inspect desktop/mobile screenshots and keyboard/no-JS/reduced-motion cases. Check immutable-file hashes, old IDs/data attributes and links against HEAD.
6. Save theme style tokens with project-only scope, package a ZIP and patch, record precise checks, and open preview/source.

## Review focus

- Owner changes and removed evidence must never revive default facts.
- Preview focus must not intercept viewer anchors or cover the focused link.
- A delayed image/gallery module must not move fragment destinations.
- Touch layouts must show the same evidence without hover.
- Back/forward cache and preference changes must not duplicate event handlers or leave dimmed content.
