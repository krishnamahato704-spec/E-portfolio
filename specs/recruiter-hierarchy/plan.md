# Recruiter Hierarchy Implementation Plan

**Goal:** Keep the distinctive opening while making teaching identity and evidence easier to find.

**Architecture:** Existing vanilla HTML render functions supply static and client views. Reorder Home sections in src/editorial.js, adapt the final atlas CSS layer and update the decorative lens's source lookup to the relocated gallery. Keep the native iris lifecycle unchanged.

**Tech stack:** Existing HTML, CSS, ES modules, Canvas2D, native animations and local Manrope.

**Spec:** spec.md in this directory.

## Tasks

- Reuse the current project-only warm theme; import no new assets.
- Update src/editorial.js with a primary identity, teacher/academic mode copy and linked Democracy preview; keep all original hooks and data-driven records.
- Put contents navigation and selected evidence before gallery/identity. Preserve film controls within their existing handler scope and gallery behavior.
- Adjust src/styles/atlas-portfolio.css for a large name, readable scope, secondary identity labels, lesson preview and phone layout. Keep both full backgrounds.
- Resolve the existing photo-lens source from the relocated gallery in the same main element; retain source validation and motion controls.
- Verify current unit/content tests, desktop/phone layouts and Chromium/WebKit opening, atlas, lens and recruiter journeys. Confirm infrastructure invariants.
- Record actual style changes, update source delivery and show the local preview.

## Review focus

Owner-edited qualifications and removed/replaced evidence must not inherit stale default data. Phone controls must remain clear of the fixed shortcuts. Moving sections must not break gallery/lens media, film controls, anchor navigation or no-JavaScript links. Student mode and Replay must retain their state. The larger identity must fit320px and short laptops.
