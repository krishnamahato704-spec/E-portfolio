# Warm teaching portfolio preview

16 October 2026. The owner approved adapting Mentora's warm appearance after the template comparison. Local preview: http://127.0.0.1:4187/?review=mentora-warm-20261016 while the preview server is running. No commit, push, deployment, database write or purchase was made.

## Applied changes

- Cream reading canvas, chocolate headings/footer, warm highlight areas and copper actions shared across all 13 routes. The header, selected navigation, filters, favicon and résumé accents match.
- The existing Home video remains behind the details under a chocolate scrim. Its right edge is dark enough for light gallery captions even over a white video frame. The first-session opening and all pause/hide, preference and off-screen handling remain.
- The five-photo compilation keeps its existing images, captions, original viewers and controls. A narrow cream photo border replaces the large enclosing card. Cream controls retain 44px minimum touch targets and a visible light keyboard-focus ring.
- Source Serif 4/Source Sans 3, recruiter shortcuts, authentic content, selected original background illustrations and document frames remain. No new dependency, font or media download was added.

The current tokens and composition are recorded in `DESIGN_SYSTEM.md`. Mentora supplied visual direction only; the adaptation uses project CSS. No Hostinger source code, stock photographs, logos, fonts or sample claims were imported. Third-party template redistribution rights have not been verified, so the style was captured only as a project reference. Source records remain in `assets/credits/design-theme.md`.

## Verification

| Check | Result |
| --- | --- |
| Build | 13 routes, packaged local preview and one-page résumé generated |
| Static checks | 90 source/script/test files and JSON passed |
| Unit suite | 69/69 passed |
| Palette checks | 182/182 checked text, dark-surface and control-border pairs passed |
| Opening and gallery | 132/132 passed in Chromium and WebKit |
| Route accessibility | 52 checks across Chromium and WebKit, no serious/critical failures or failed layout/navigation checks |
| Responsive/print | 52/52 route/width checks at 320, 390, 768 and 1440px passed in Chromium |
| Moving Home media | 8/8 passed at the same four widths in Chromium and WebKit |
| Light gallery captions over brightest film | 6.65:1 white and 5.45:1 warm-light text contrast; both exceed 4.5:1 |
| Résumé | Remains one page, verified dates retained, rendered and visually inspected |
| Whitespace | `git diff --check` passed |

An initial unit run could not reach its sandboxed local test server; it passed when rerun with local-server permission. An initial accessibility run lost its server during a concurrent preview rebuild. All final browser checks above ran against the completed build, without another rebuild during the runs. No product-code change was needed for either test interruption.

All routes were captured at phone and desktop widths. Home, Teaching Evidence, Experience, Credentials and the résumé were visually inspected. Current screenshots, layout results and film-caption contrast calculations are under `outputs/warm-theme-20261016/`. These checks do not establish full WCAG conformance, physical-device or screen-reader performance. The previously recorded Firefox Windows runtime limitation remains.

## Library and publication

The project style was saved as `captured-teaching-portfolio-mentora-inspired-warm-appeara-5766738bd269`, with passing capture contrast checks. Shared-library validation passed for 6,918 entries, 7,166 unique files, 33 licence records and 5,858 SVGs. The capture stores palette, typography, spacing, scrim and gallery rules without photographs or personal content. Earlier Botanical variants remain historical records.

Push and publication require approval of this preview. Source-evidence and hosted setup items remain recorded in `PRIVATE_EVIDENCE_CHECKLIST.md` and `PUBLISHING_AND_SECURITY.md`.

The owner subsequently approved publishing this preview on 16 October. The production release and final direct-link correction are recorded in `WARM_RELEASE_2026-10-16.md`.
