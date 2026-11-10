# Iris opening and Home curiosity lens

10 November 2026 update: the lens now cycles through the approved homepage photos with matched captions and a short fade. See [VARIED_PHOTO_LENS.md](VARIED_PHOTO_LENS.md). The notes below describe the earlier single-photo implementation and its original verification.

The current colors and type are the [oat/apricot/coral and Manrope theme](OAT_CORAL_THEME.md). The motion behavior below remains; references to the earlier indigo typography describe the preceding appearance.

9 November 2026. The opening and Home now share a circular aperture motif. The typography, indigo/paper palette, factual content and original gallery remain intact.

The name enters through line masks. A circular hole opens through the paper into the live atlas, accompanied by a thin ring and crosshair. Native even-odd clipping interpolates64 circle points over1150ms after1050ms. The whole opening remains bounded by2.6seconds. Unsupported clipping falls back to a finite fade. Skip, Escape, focus, scroll, resize, page hiding and motion preferences dismiss it. The session key is versioned so the new opening can be seen once in an existing browser session; `?intro=replay` and Replay intro explicitly repeat it.

On Home, a decorative circular lens follows the pointer with inertia. It reveals the first approved photograph already present in the teaching gallery and uses that photograph's actual caption. Its ring and crosshair match the opening. A brief desktop demonstration makes the effect visible without first requiring pointer movement. The normal cursor and all existing links remain; the lens sits beneath the text and ignores pointer input.

The photograph has a dark scrim in Teacher mode and a light scrim in Student mode to protect foreground text. The photo window is240–340px on desktop and180px on phones. A short tap on noninteractive background produces a bounded ring/photo response. Movement beyond9px or a press longer than450ms is not treated as a tap. The effect never prevents touch scrolling. The original gallery remains the accessible source of the full photo and caption.

The controller uses the existing24fps atlas render loop, capped pixel density, visibility logic and Pause motion button. It adds no observer, independent continuous loop, animation framework, external media or new font. Reduced motion, data saving, visitor pause and hidden/offscreen states settle the effects. The next scheduled frame also settles them when a browser updates its motion preference before delivering its change event.

Implementation: `src/opening-sequence.js`, `src/styles/opening-sequence.css`, `src/curiosity-lens.js` and the existing atlas JS/CSS. Repeated initialization removes old lens nodes and listeners. All original homepage IDs, link destinations and data hooks remain; Supabase, owner authentication, contact handling, Vercel and GitHub workflow configuration are unchanged.

Project-only final style capture: `captured-teacher-portfolio-iris-and-curiosity-lens-6f0a7d5f5ddb`, supplied contrast checks passed. Its style manifest contains colors, fonts and motion rules only; no photograph or private content was copied to the shared library. Existing font and media notices remain.

Verification: build passed for13 static pages;101/101 unit tests; static checks for116 files. Opening62/62 and curiosity-lens34/34 checks passed in Chromium and WebKit. Existing browser311/311 and headline/film/gallery86/86 checks passed during integration; the final lens timing/resume follow-up was covered by the focused34-check suite and unit checks. Original12 homepage IDs,34 href destinations and18 data-hook names were retained. No backend, auth, contact, dependency, CI or Vercel configuration file changed.

The opening recording runs naturally. Separate controlled-time screenshots verify the real native iris hole at start/middle/end, including center/corner hit testing, fallback and resize behavior. The Home recording shows the actual pointer interaction; phone screenshots show the tap response. Text and controls remain readable and usable. Automated checks are not a complete accessibility or field-performance audit. Supabase writes and production deployment were not exercised. Nothing was committed, pushed or deployed.
