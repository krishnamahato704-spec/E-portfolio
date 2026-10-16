# Botanical theme preview

The later Home film and photo-compilation follow-up is recorded in `HOME_MEDIA_2026-10-16.md`. Its background playback/gallery behaviour supersedes the earlier static Home arrangement below.

16 October 2026. The owner asked to implement all six theme recommendations and provide a preview, then corrected the removal of background images. The corrected preview is http://127.0.0.1:4187/?review=restored-backgrounds-20261016 while the local server is running. No commit, push, production deployment, database write or paid purchase was made.

## Applied changes

- One shared Botanical green palette across all 13 routes, replacing the different pastel page schemes. Navigation, selected filters, headings, actions and the favicon use matching green roles.
- Deep-green Home introduction and footer with light text. The introduction uses open copy with the existing internal spacing; the authentic desktop photograph retains its viewer. Phones lead with the portrait and teaching information.
- Light reading canvas, sage highlights and white evidence/credential cards. Ordinary reading, education and philosophy sections use spacing and rules in place of extra framed panels.
- Selected original margin illustrations, faint desktop photo accents and compact illustrated section gaps are restored. Fewer scenes and lower opacity reduce repetition; flat opaque reading surfaces protect text. The desktop introduction retains its faint CSS contour detail.
- Source Sans 3/Source Serif 4 retained. Heading sizes are more consistent; small descriptive labels and record fields use ordinary case. The one-page résumé uses matching green and ink colours.
- Existing first-session opening, skip/music controls, optional film playback, original documents, galleries, filters, mobile shortcuts and content remain available. The confirmed 2025 observation date is retained.

## Verification

The following full-theme checks preceded the background correction. Correction-specific results follow below.

| Check | Result |
| --- | --- |
| Build | 13 generated routes, packaged preview, one-page résumé |
| Static checks | 87 source/script/test files plus JSON configuration passed |
| Unit suite | 67/67 passed |
| Functional browser suite | 309/309 passed |
| Opening/gallery suite | 102/102 passed in Chromium/WebKit |
| Recruiter access | 208/208 passed in Chromium/WebKit |
| Route accessibility | 52 Chromium/WebKit checks, zero failures |
| Palette checks | 182/182 text, dark-surface and control-border pairs passed; shared palette verified |
| Theme/layout checks | 52/52 route/width combinations at 320/390/768/1440px; no overflow or page errors |
| PDF | Remains one page, verified dates retained, rendered and visually inspected |
| Whitespace | `git diff --check` passed |

All 13 routes were captured at desktop and phone widths. Representative Home, Evidence, Credentials, Experience, About and Contact screens were visually inspected, along with the résumé. Captures and layout results are in `outputs/botanical-theme-20261016/`. Browser reports also remain under the existing browser/recruiter output folders.

The checks do not establish full WCAG conformance or physical-device/screen-reader performance. Firefox's previously recorded Windows runtime limitation remains. Real owner sign-in, hosted publication and Vercel content-hook activation were outside this local visual update.

## Asset rights and capture

Botanical was found in the existing shared library. Its JSON, CSS and reuse notice matched their recorded hashes. The reuse notice is packaged in `assets/licences/LIBRARY-REUSE.txt`; modifications are recorded in `assets/credits/design-theme.md`. Existing font notices remain. No new font, framework or media download was needed.

The initial green project style was captured separately from general reusable themes as `captured-teaching-portfolio-botanical-72bb5a3a5f9a`, with passing capture contrast checks. It remains a historical variant. The capture stores style information only, including the colour roles, layout, spacing and media-control rules.

## Verified background correction

The owner objected to the blanket removal of background images. The corrected CSS restores two selected margin illustrations per desktop page, plus a faint existing published-photo accent when available. Phones retain one smaller margin illustration and compact images between sections. Ordinary text areas have flat opaque canvas-coloured surfaces; evidence and credential cards remain white. The green palette, real content and original asset files are preserved.

Fresh checks after this correction: build succeeded; static checks passed for 87 files; 67/67 unit tests and 182/182 palette checks passed. The 52 route/width checks verified visible background images, protected reading surfaces, responsive layout without overflow, noninteractive decoration and print hiding. The 52 Chromium/WebKit accessibility checks reported zero failures. Desktop Evidence/Experience and phone Evidence captures were visually inspected. Current captures and layout results are in `outputs/botanical-backgrounds-20261016/`.

The corrected style was saved under the project as `captured-teaching-portfolio-botanical-with-original-backg-48085bd81078`, with passing capture contrast checks. No photographs or personal content were copied into the shared library. The corrected local preview is http://127.0.0.1:4187/resources/?review=restored-backgrounds-20261016.

The remaining source-evidence and hosted setup items are recorded in `PRIVATE_EVIDENCE_CHECKLIST.md` and `PUBLISHING_AND_SECURITY.md`. Push and publication still require approval of the preview.
