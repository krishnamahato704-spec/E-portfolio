# Atlas portfolio

## Intended result

The opening must make a strong visual impression before a recruiter evaluates the teaching evidence. The previous small headline/photo split and repeated reading sections did not achieve this. Keep the identity Social Science Teacher and Forever Student, current facts, all links and all existing infrastructure.

## Visual direction

An immersive cobalt atlas field, monumental serif typography, floating navigation, a Teacher/Forever Student control that changes the entire composition, and documentary photography below the opening. The generative field uses original contour geometry and responds to pointer movement. Reference inspiration: Andreas's oversized italic type, blue graphic perimeter and floating navigation; Awwwards's monumental headings, large visual surfaces and floating browsing bar. No code, artwork or proprietary fonts from those sites is imported.

## Acceptance

- First viewport visibly differs from the prior left-copy/right-photo composition.
- Name, teaching role, availability, location, résumé and contact remain easy to find.
- The scene control changes color, contour geometry and typographic emphasis; neither choice gates access to content.
- Real photographs and document previews retain native links and existing viewer behavior.
- Every existing ID, landmark, accessibility attribute and runtime hook remains; all real facts come from current content.
- No Supabase, auth, contact, routing, workflow or dependency changes.
- Keyboard, touch, reduced-motion, no-JavaScript and narrow screens remain usable. Canvas is decorative, stops off screen and is static for reduced motion/data saving.

## Implementation plan

1. Recompose opening output in src/editorial.js while keeping exact tested hooks.
2. Add src/atlas-field.js and connect its lifecycle through src/motion.js.
3. Replace the earlier visual hierarchy with a final atlas CSS layer, including a static SVG fallback, floating masthead, large typography, revised photo spread and stronger section scale.
4. Build and inspect real desktop/mobile screenshots and mode changes. Run existing unit/browser checks and targeted scene lifecycle checks; fix regressions without weakening tests.
5. Capture actual project style tokens, update verification notes and provide a running local preview and complete source.
