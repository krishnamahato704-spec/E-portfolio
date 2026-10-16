# Home background film and photo gallery

16 October 2026. The owner asked for the background video behind the Home details again and a moving compilation of photographs in place of the single right-hand image. Local preview: http://127.0.0.1:4187/?review=home-film-gallery-20261016 while the preview server is running. No commit, push, deployment, database change or purchase was made.

The existing muted illustrative film now fills the Home introduction beneath a green scrim. It continues after the first-session opening, with Pause film and Hide film controls below the details. Playback pauses off screen and in hidden tabs. Reduced-motion and data-saving preferences prevent automatic playback. The opening's music remains optional and stops when the opening ends; the background film has no automatic audio.

The gallery uses five photographs from current published portfolio records. It sits on the right on desktop and below the details on phones. It slides every six seconds and includes play/pause, previous/next, keyboard arrows and horizontal swipe. Hover temporarily stops rotation; keyboard focus or manual navigation stops it until Play photos is selected. Reduced-motion and data-saving visitors start with a still image. Returning from a cached page preserves the selected photograph and paused state. Only the active photograph's original-image link is focusable.

The gallery filters unavailable, removed, unpublished or duplicate records. Without JavaScript, the first photograph remains usable. Existing green colours, original decorative backgrounds, captions, document links and portfolio content remain. No new media, fonts, framework or dependency was downloaded.

## Verification

| Check | Result |
| --- | --- |
| Build | 13 routes and packaged preview; one-page résumé regenerated |
| Unit suite | 69/69 passed |
| Static checks | 90 source/script/test files and JSON passed |
| Opening and gallery | 132/132 passed in Chromium and WebKit |
| Recruiter access | 208/208 passed in Chromium and WebKit |
| Route accessibility | 52 checks across Chromium and WebKit; zero failures |
| Palette | 182/182 checked pairs passed |
| Home media and layout | 8/8 passed at 320, 390, 768 and 1440px in both browsers |
| Whitespace | `git diff --check` passed |

The Home media checks confirmed actual muted background playback, five visible gallery records, no horizontal overflow and no page errors. The joining information remained within the first 800px of viewport height. Desktop and phone screenshots were visually inspected. The gallery checks also covered hover, focus, manual controls, original-image viewer, swipe, reduced motion, data saving and cached-page restoration. Screenshots and layout results are in `outputs/home-media-20261016/`.

These checks do not establish full WCAG conformance or physical-device, screen-reader or low-end-device performance. Firefox's previously recorded Windows runtime limitation remains. Hosted sign-in and publication are outside this local Home update.

## Style capture and publication

The updated style was saved separately from general themes as project entry `captured-teaching-portfolio-botanical-film-and-photo-gall-618ae4085a0b`. Its capture contrast checks passed. Shared-library validation passed for 6,917 entries, 7,164 unique asset files, 33 licence records and 5,858 parsed SVGs. The capture contains the actual colour, typography, scrim, gallery layout and motion rules, without photographs or personal content. Existing asset and font notices remain in the project.

Push and publication require the owner's approval of the local preview. Other source-evidence and hosted setup items remain recorded in `PRIVATE_EVIDENCE_CHECKLIST.md` and `PUBLISHING_AND_SECURITY.md`.
