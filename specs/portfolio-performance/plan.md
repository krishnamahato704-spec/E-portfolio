# Implementation

Keep static HTML/CSS, native modules, Node builds, Vercel and the existing Supabase owner API. Current public navigation makes no REST request to render content. Inspect and preserve owner validation, timeouts, optimistic versioning and build snapshot consistency.

1. Record live and identical local baselines for cold/repeat Home and inner pages, at desktop and 4x CPU/4 Mbps/80ms phone conditions. Treat these as laboratory samples, not field Web Vitals.
2. Bound opening startup in `opening-boot.js`/`identity.js`; remove competing video filters/crop interpolation and schedule compositor crop updates with video-frame callbacks and fallback cancellation.
3. Defer inactive gallery sources in the view helper/media renderer, load/decode selected images before moving the track, and prepare only the next eligible image near rotation.
4. Lazy-load route-specific motion controllers, keep header/reading content stable, add conservative navigation prefetch and native cross-document transitions with normal-navigation fallbacks.
5. Preload critical fonts/Home modules and fingerprint static local media references in packaged HTML/CSS. Cache only fingerprinted assets; retain originals, query handling and content digest consistency.
6. Build, measure again, inspect frames and responsive views, run regressions and existing checks. Record current source documentation and any environment limits. Deliver a local preview; preserve unrelated untracked user files.
