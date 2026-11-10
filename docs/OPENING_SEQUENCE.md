# Atlas opening

The latest opening replaces the shutters described below with a circular iris and adds the Home curiosity lens. Current behavior and verification are recorded in [SIGNATURE_MOTION.md](SIGNATURE_MOTION.md).

9 November 2026. The opening adds a short name reveal and a staggered shutter transition to the interactive atlas design. It uses the existing local fonts and original CSS/native Web Animations API code.

The subsequent [typography and color refinement](TYPE_COLOR_REFINEMENT.md) changes the display family to Instrument Serif and the shutter background to warm paper. The sequence and controls remain the same; the earlier capture below records the preceding appearance.

The selected Awwwards references are [Indisea's masked hero opening](https://www.awwwards.com/inspiration/a-loader-that-releases-a-masked-hero-indisea), [Matthew Pothier's curtain reveal](https://www.awwwards.com/inspiration/curtain-reveal-page-transistions-matthew-pothier-portfolio) and [Basis's pre-loader and reveal](https://www.awwwards.com/inspiration/pre-loader-and-reveal-animation-basis). The source titles, attribution and effect metadata were verified. Their embedded clips were not watched. The implementation is an original interpretation of line masks, curtains and a coordinated hero reveal; it does not reproduce their choreography. No reference-site code, assets or fonts were imported.

The large mixed-serif name and spare text follow the editorial direction already established from Andreas.vision. Eight pale-blue shutters uncover the cobalt atlas; the hero title and supporting controls settle in sequence. The full sequence is bounded by 2.6 seconds and includes no loading percentage or audio.

Automatic playback happens once per session on an eligible home visit. `?intro=replay` requests an explicit preview; the Replay intro button also starts it. Both retain reduced-motion/data-saving restrictions. Fragment destinations, hidden tabs, slow connections and repeated visits bypass automatic playback. Skip intro, Escape, scrolling, focus on another control and page hiding dismiss it. Navigation and mobile shortcuts remain available. The overlay is decorative, inert and ignores pointer events; main remains interactive.

The Student perspective stays selected during replay. Cleanup cancels animations, timers and listeners; restored history pages do not automatically replay. Missing JavaScript leaves the static atlas and existing links.

Implementation: `src/opening-sequence.js`, `src/styles/opening-sequence.css`, the replay hook in `src/editorial.js` and lifecycle wiring in `src/motion.js`. `scripts/check-opening.mjs` checks both Chromium and WebKit and records the real sequence. Existing backend, Owner Studio, contact handling and deployment configuration remain unchanged.

The early `src/page-transition-boot.js` observes incoming native transition readiness before the app loads. Chromium can cancel that promise before its later pagereveal event exposes it. Both incoming and outgoing handlers catch only expected cancellation names; unexpected errors remain visible. The existing content security policy is unchanged.

The style-only snapshot is saved under the teacher-portfolio project as `captured-teacher-portfolio-shutter-opening-3fec31cd216c`. All six supplied contrast pairs passed. The library labels the snapshot partial because it records only the opening's actual color roles.
