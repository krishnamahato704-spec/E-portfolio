# Opening before the first homepage paint

The original static homepage could paint before the deferred application downloaded and created the iris overlay. A delayed-app regression reproduced the exposed homepage followed by a late opening.

Home now loads the small classic `src/opening-startup.js` in the document head before its stylesheet. Eligible first visits receive a temporary paper cover using the existing iris background. The application claims that cover and removes it only after attaching the actual iris, within the same JavaScript task. No frame is intentionally left uncovered between those states.

Repeat sessions, direct fragments, reduced motion, data saving, slow connections and unavailable animation support bypass the startup cover. Interaction or page hiding releases it. A four-second watchdog exposes the normal page if application loading fails or stalls; an application arriving after that expiry cannot play an automatic late intro. Explicit Replay still works. Without JavaScript, the page remains its normal static document. The existing landmarks and heading remain semantic and the decorative cover does not capture pointer input.

The startup file has a different name from the removed legacy audio-opening bootstrap, which remains excluded by the existing package test. CSP, authentication, contact handling, routing and workflows are unchanged. No new asset, font, palette, dependency or animation loop was introduced.

Release verification includes first-paint traces in Chromium/WebKit with delayed or blocked scripts, repeat visits, forced replay, preferences and watchdog fallback, alongside existing unit, opening, browser, identity, recruiter, palette, accessibility and performance checks. Reports are local outputs; public publication is verified against the released source commit and hosted pages.

The required recruiter-access check also caught a pre-existing regression in the new phone Evidence layout. The decorative duplicate paper fan now stays on desktop, and phone guidance follows the file collection, so the first teaching file starts within the required first-screen range. Real file thumbnails, captions, filters and destinations remain available. Desktop composition is retained.
