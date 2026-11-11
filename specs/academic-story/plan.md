# Implementation plan

Keep the static HTML and JavaScript architecture. Add a summary renderer above the existing Home opening, retaining its h1 and removing the duplicate summary from About. Add nonmutating shared chronology helpers for public lists and résumé generation. Render one dated academic timeline with concurrent current studies explicitly labelled.

Add a final screen style layer before print. Use the existing Manrope body font and licensed Source Serif 4 italic for the summary headline. Reuse the cream, apricot, dark ink and terracotta palette. Card folds, borders and shallow shadows provide enclosure. A small progressive enhancement handles bounded pointer tilt and preference changes without extra tab stops or hidden text.

Validate with build, lint, unit and chronology tests, the existing browser checks where available, and focused rendered desktop/mobile, filtering, no-JavaScript, keyboard, reduced-motion and print checks. Save review images and a patch in the workspace outputs. Capture only reusable project style information in the asset library.

The Home journey uses a full-width deep terracotta chapter with a vertical timeline. Education uses an oat chapter with a horizontal dated ledger on wide screens and a vertical rail on smaller screens. Professional Learning uses a quieter cream band. Replay intro scrolls to the original scene below the added summary. The owner authorized production publication on 12 November 2026; after local checks, use a normal main-branch push and follow Pages/Vercel builds to completion.
