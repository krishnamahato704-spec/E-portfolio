# Editorial motion — Task 1 handoff

Branch: `feature/editorial-motion`  
Base: `702ab83fa04c3244893a8c8b3ff57852554922fc`  
Date: 11 September 2026

## 1. Changes

Added a restrained first-load hero sequence, selective scroll entrances, short group staggers, a gold rule beneath “Less recall. More reasoning.”, refined button/link and certificate interactions, and a 3px oxblood reading-progress indicator. The existing three-stage school experience motif now uses oxblood rules with small gold marks. Content, routes, typography, palette and the Supabase editor remain intact.

## 2. Files

- `src/motion.js`: reusable initialization and cleanup, hero/reveal behavior and scroll progress.
- `src/app.js`: lifecycle hooks before and after public content replacement and for page history restoration.
- `src/styles.css`: motion layer, reduced-motion/print safeguards and restrained editorial accents.
- `src/views.js`: three explicit directional/fade hooks for profile facts, documentary evidence and the pull quote.
- `scripts/build.mjs` and all 12 generated HTML pages: refreshed asset versions and matching static markup.
- `tests/motion.browser.html`, `tests/motion.browser.js`: browser lifecycle/accessibility checks.
- `tests/app.browser.html`, `tests/app.browser.js`: isolated asynchronous public-read fixtures.
- `.github/workflows/review.yml`: run the existing non-deploying review workflow on this branch.
- This handoff document.

`src/content.js`, `src/cloud.js`, `src/config.js`, `src/admin.js` and all image/font assets are unchanged. No database schema, data, authentication or storage changes were made.

## 3. Motion system

`initMotion({initial:true})` runs after initial event wiring. The hero uses six steps: eyebrow, name, statement, detail, actions and frame. Desktop duration is 480ms, with 45ms increments and a maximum 225ms delay. Movement is 20px. Other entrances use the existing 360ms `--slow` token and 18px movement. Groups repeat a bounded 0/45/90ms stagger rather than accumulating long delays.

`data-motion="fade-up|fade-left|fade-right|fade"` provides reusable variants. Nested entrance targets are excluded so a card and its child text do not both move. On screens up to 650px, entrances use 12px vertical movement, 300ms duration and no stagger delay.

IntersectionObserver starts each offscreen entrance once, then unobserves it. Already-visible refreshed content stays still. `cleanupMotion()` disconnects both observers, cancels pending animation frames, aborts listeners, clears active entrance classes and removes progress. It runs before Supabase replaces `<main>`, on page hide and before every reinitialization. History restoration reinitializes without replaying the hero.

## 4. Accessibility

The resting document is fully visible. Content is never assigned a hidden waiting state: entrance classes only run finite CSS animations. Missing JavaScript or IntersectionObserver therefore leaves readable content. Focus immediately cancels animation on the focused element and its enclosing entrance. Forms and controls are not reveal targets.

Reduced motion disables animations, transitions, unnecessary transforms and the progress bar. A preference change immediately tears down JavaScript effects; turning motion back on does not replay the page. Print rules force visible, static content. Admin, résumé and 404 routes do not initialize decorative JavaScript motion. The progress bar is aria-hidden and ignores pointer events.

## 5. Performance

No dependencies, remote scripts or new media assets. Entrance animation uses opacity and transform; hover lifts are 2px. Scroll updates are passive and coalesced into one requestAnimationFrame, with no perpetual frame loop. ResizeObserver recalculates progress when image/content layout changes. Geometry reads are batched before entrance-class writes. Existing image dimensions remain unchanged.

## 6. Considered and omitted

- Portrait parallax: the framed portrait already provides depth; scrolling it would add movement without improving the composition.
- Cross-page transitions: the site uses complete static documents and native navigation. No navigation interception or new router was introduced. Chapter headings provide a short entrance instead.
- Paper grain: existing paper/sheet colors already communicate the material; a new texture would add little and could reduce clarity.
- Certificate zoom: removed the existing 3.5% hover scale in favor of a 2px lift and subtle shadow.
- Individual paragraph animation and long stagger chains: omitted to keep reading immediate.

## 7. Verification

- Rebuilt all 12 static routes.
- All 12 existing regression cases passed, covering content compatibility, escaping/URLs, validation, upload restrictions, all generated route links, static fallback and cloud authorization/conflict handling. Local execution used the available JavaScript runtime with the original assertion callbacks; the branch review workflow runs the normal Node test command.
- 60 browser layout checks: every route at 360, 390, 768, 1024 and 1440px. No horizontal document overflow; exactly one h1 per route.
- 9 browser motion checks passed: finite hero, repeated initialization, replacement without hero replay, focus cancellation, preference change, missing observer fallback, reduced-motion CSS, route exclusions and idempotent cleanup.
- 17 application-fixture assertions passed across populated resources, late contact input and failed public reads. These exercise the real application module with isolated responses and make no Supabase writes.
- Mobile menu opening, Escape and focus return; actual resource empty-state filtering; required contact fields; email-copy success feedback; browser back navigation and one restored progress bar checked.
- Progress reaches the document end (fractional browser scroll rounding measured 0.999904).
- All four credential previews and the portrait load. Local image/font Git blob hashes match the original repository exactly.
- Desktop and mobile screenshots inspected, including hero, progression/approach and credentials. Refined certificate motion and progress/header contrast after the first implementation.
- No console errors in the final inspected application and motion-test sessions.

Reproduce:

```sh
node scripts/build.mjs
node --test tests/*.test.mjs
node scripts/serve.mjs
```

Then open `/tests/motion.browser.html` and `/tests/app.browser.html?case=resources`, `?case=contact`, `?case=failure`. Every fixture reports pass/fail visibly. Browser tests are manual and are not run by the existing Node CI job.

## 8. Verification limits

No known regression was found in the tested flows. Authenticated owner login, uploads and publishing were not exercised; no owner credentials were supplied and no production writes were performed. Existing authorization tests pass. Reduced-motion JavaScript was tested with a controlled preference object and the actual reduced-motion CSS declarations in a forced fixture; the user's OS preference was not changed. No Lighthouse score, quantified performance improvement, physical-device coverage or printed-PDF pagination claim is made.

## 9. Visual assessment and next task

The original editorial hierarchy remains clear. The hero sequence is short, mobile entrances are simpler, and the teaching progression feels continuous without becoming a new large component. The progress indicator is legible against the header track. Certificate documents remain uncropped. Content is stable once an entrance completes.

Task 2 should start from `feature/editorial-motion`. No final PR, merge or production deployment is part of Task 1.
