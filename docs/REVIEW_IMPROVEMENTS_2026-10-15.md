# Local review revision

Historical usability revision. The owner approved a more noticeable green theme on 16 October; see `BOTANICAL_THEME_2026-10-16.md` for the current preview. Colours, backgrounds and card treatments described below refer to the earlier revision.

15 October 2026. Ready for owner review at http://127.0.0.1:4187/?review=final-2025 while the local preview server is running. Nothing has been committed, pushed or deployed for this revision. The previously deleted migration history file has been restored from HEAD after checking the live record; unrelated untracked files remain untouched.

## Delivered

- Larger authentic portrait, current studies, joining availability and direct teaching scope in the Home introduction. Internship, additional teaching and work preferences follow without repeating those facts.
- Existing school photograph beside the desktop introduction. The illustrative film pauses after the opening and plays only through Play film; Close film restores the photograph and focus. Phone layouts lead with the introduction and offer the film beneath it.
- Card padding corrected after owner feedback: 28px on desktop, 20px on phones and 18px at 320px. The internship strip no longer has an unpadded nested panel.
- Compact Evidence/Credentials headers, earlier files on phones, fewer background illustrations, smaller document displays and a shorter phone philosophy section with its original text and portraits retained.
- Phone evidence descriptions now use the full card width; compact thumbnails sit beside titles. Original file access and viewers remain intact.
- Consistent terracotta primary actions, shared body text, KM/name branding and labelled planning/ongoing/completed badge treatments. Existing light route backgrounds and self-hosted fonts remain.
- Visible opening skip and explicit music choice. No music on unrelated gestures; first-session opening only; no automatic film on reduced-motion/data-saving connections. Fixed a WebKit pointer-focus bug found by the new sound check.
- Owner-confirmed observation period, 1–4 December 2025, applied to pages, resource metadata, web/PDF résumé and the regenerated 17-page journal. The original scan is preserved. Narrow compatibility corrections retain later owner edits and removals. Actual local document sizes are labelled; unknown remote sizes are not guessed.
- Responsive classroom-material previews: 57,758 and 213,648 bytes at 360/720px, preserving the 558,032-byte original and original-file access. These derivatives remain in this project; no general reuse rights are inferred.
- Vercel HTTP protections and an optional content-rebuild bridge prepared locally. Owner Studio's success message now distinguishes saving database content from an updated static Vercel release.
- Genuine offline static checks, recruiter checks added to CI, current design documentation and a private evidence/permission checklist.
- Photo permission recorded from the owner's 15 October statement. A private lesson case-study worksheet prepares the missing completed evidence without inventing pupil outcomes or mentor comments.
- Migration `20260924163206` confirmed in the live history; its exact local file restored without applying database changes. PDFs explicitly marked binary in Git to prevent text line-ending conversion.

## Observed layout

At 390px width, the first Evidence record begins about 598px from the top, compared with approximately 1,288px in the earlier review. Home availability begins around 420px after the padding correction. The philosophy section is about 1,475px tall, compared with the earlier approximately 2,206px. These are local layout observations, not loading-speed or recruiter-research results.

Twenty screenshots/layout checks cover Home, Evidence, Credentials, Experience and Contact at 320/390/768/1440px, with no horizontal overflow or page errors. Desktop and phone Home/Evidence/philosophy screenshots were inspected. The latest captures are under `outputs/portfolio-review-20261015/`.

## Verification

| Check | Observed result |
| --- | --- |
| Build | 13 generated routes, one-page résumé and packaged preview |
| Static checks | 86 source/script/test files and JSON configuration passed |
| Unit suite | 67/67 passed, including confirmed-year compatibility, removal and later-edit checks |
| Functional browser suite | 309/309 passed after the photograph/film revision |
| Opening/gallery suite | 102/102 passed in Chromium and WebKit, including optional playback and return to photograph |
| Recruiter access | 208/208 passed in Chromium and WebKit |
| Route accessibility | 52 checks in Chromium/WebKit, zero failures |
| Final Home spacing and axe | 8/8 checks at four widths in both engines, zero violations |
| Palette contrast | 130/130 text/action pairs passed |
| Observation and PDF flow | Desktop/mobile date, four-day record, live merge, PDF viewer, download and focus passed |
| PDF checks | One-page résumé and 17-page journal rendered and inspected; 2025 present in both |
| Working-tree whitespace | `git diff --check` passed with PDFs correctly treated as binary |
| Content comparison | Repository matches validated/merged live schema 8 content, timestamp 2026-10-04T16:30:13.693024+00:00; year correction is local, no live write |

Reports remain in `outputs/browser-checks`, `outputs/redesign`, `output/portfolio-design-review`, `outputs/portfolio-review-20261015`, `outputs/portfolio-final-refinement` and `outputs/amity-browser`. The unit media-range test required local-server sandbox access; its rerun passed. The observation browser script was corrected to check visible images instead of trying to scroll hidden phone decoration into view, then passed. The release bridge is tested with mocked requests; no real hook was called. Automated checks do not establish complete WCAG conformance. Physical phones, screen-reader use, low-end animation frame rates and real owner sign-in/publication remain unverified. Firefox's previously recorded Windows runtime failure was not retried.

## Library record

The local library search found the existing Linen editorial and Source Serif 4 assets. This implementation reuses the portfolio's existing Source Sans 3/Source Serif 4 files and notices; it adds no framework theme.

Final project style captured as `captured-teaching-portfolio-photograph-led-editorial-8fc278ab68d0`, separate from general assets. The Home strong border is now `#897568`; the new capture passes its contrast checks. The earlier capture remains a historical variant. Library integrity validation passed for 6,914 entries, 7,158 unique asset files, 33 licence records and 5,858 parsed SVGs. No photographs, personal copy, student records or credentials are stored in this style capture.

## Remaining source and hosted work

The owner must supply completed lesson evidence and mentor feedback. Use `LESSON_CASE_STUDY_WORKSHEET.md` and `PRIVATE_EVIDENCE_CHECKLIST.md`. The observation year is now confirmed as 2025. The owner says permission was obtained before photographing; this statement is recorded without claiming that written public-publication records were inspected. Existing photographs are retained.

Read-only Vercel inspection confirmed the correct GitHub repository/main production branch and that the project has no deploy hooks. After approval, configure the content hook/Actions secret and verify a content-only rebuild, hosted response headers and consistent page/PDF/release digests. Supabase remains on Free; leaked-password protection requires Pro or above, so no upgrade is made. RLS and current anonymous/owner grants were checked again. Migration history is restored locally. See `PUBLISHING_AND_SECURITY.md` for these observed facts and the approval boundary.

Push and publication require explicit approval of this preview.
