# Loading and motion improvements

16 October 2026. Performance changes following the approved warm release (`709e031`). The owner requested publication on 17 October; release verification is recorded in `PERFORMANCE_RELEASE_2026-10-17.md`.

The portfolio remains a static HTML/CSS site with native JavaScript modules and a Node build. Public pages display the published build snapshot without waiting for Supabase. A framework migration would add work without addressing the measured problems.

## Changes

- The opening has a 1.8-second startup budget measured from navigation. If scripts arrive too late, the page becomes readable and retains the muted background film. A fast first visit keeps the existing 3.2-second opening. Skipped openings count as the session visit, preventing a later reload from replaying them.
- A separate poster cover keeps the background video's layout steady. Phone cropping follows decoded video frames using compositor translation, with an animation-frame fallback. Dismissal, navigation, resizing and motion preferences cancel the callbacks. The dissolve uses a smaller frame snapshot and one video decoder. Skip and music controls sit above the cover.
- The first gallery photo loads initially. Other sources are assigned on manual selection or shortly before eligible rotation. The gallery decodes the replacement before sliding; slow or failed images leave the working photo visible. Rapid clicks preserve the most recent selection. Keyboard focus, original viewers, pause, swipe, data saving and cached-page restoration remain available.
- Home and ordinary pages no longer download the timeline, teaching philosophy and Democracy controllers. Those modules load only where their interfaces exist. Initial headings and navigation stay still; unread sections can fade without translating the content.
- Search and filter rows reserve their space before enhancement, preventing the document list from jumping downward. Unavailable controls remain inert. The no-JavaScript stylesheet hides them while keeping the full collection readable.
- Supporting browsers use a 160ms native page crossfade. Ordinary links remain functional in other browsers and reduced-motion mode. Intent prefetch is limited to two same-origin public documents, excluding owner sign-in, downloads, queries, fragments and data-saving/slow connections.
- The build prioritises the main fonts and Home media modules. Packaged media/font URLs carry hashes of their actual files. Vercel's proposed immutable cache rule applies only to those versioned assets. PDFs, content identities, private uploads and remote URLs keep their existing handling. Local previews default to `no-cache`; `--cache` allows a production-style comparison.

The warm palette, typography, original background illustrations, authentic photographs, document access and content are retained. No runtime dependencies were added. The owner editor still validates owner identity, uses request timeouts, rejects conflicting content updates and keeps private uploads separate. No database, authentication or storage settings were changed.

## Measurements

Chromium laboratory samples, with a 390px phone viewport, 4x CPU slowdown, 4 Mbps download and 80ms latency. Each cold sample began with an empty browser context. These are individual local runs, not field Core Web Vitals or a physical-phone benchmark. The final cache sample uses the proposed cache policy on a local server.

| Measurement | Before | After |
| --- | ---: | ---: |
| Cold phone Home becomes readable | 6.32s | 1.85s |
| Cold phone Home LCP | 1.73s | 1.58s |
| Cold phone Home layout shift (CLS) | 0.019 | 0 |
| Cold phone Home time in long tasks | 1,293ms | 338ms |
| Cold desktop Home with intentional opening | 3.38s | 3.37s |
| Cold desktop media/resource transfer in the observation window | 4.41 MB | 3.49 MB |
| Home script requests | 11 | 8 |
| About / Teaching Evidence script requests | 8 | 5 |

In the final production-style cache sample, phone Home became readable in 0.30s on return, with no transferred subresource bytes recorded; Teaching Evidence and About became readable in 0.36s and 0.32s. All three recorded zero CLS. The comparable no-cache Home sample became readable in 1.93s, also with zero CLS. Desktop retains the intended opening duration on prompt first loads.

The cache sample still transferred the video again on desktop, while the phone reused it. Media cache behavior varies by browser/range requests; the local server does not reproduce every Vercel response header. Verify actual cache headers and film reuse after an approved deployment. Cold phone transfer totals also depend on how much video finishes loading during the observation window, so they are not used to claim a bandwidth reduction.

The earlier live audit caught Home remaining covered for about 6.9s in one desktop run. That observation helped diagnose late startup; it is not used as a direct live-versus-local speed comparison. Initial filter insertion moved the phone document list by about 200px. The final delayed-script regression confirms its position stays stable.

Raw local profiles and screenshots are under `outputs/performance-20261016/`; the temporary profiler is under `work/performance-20261016/`. The profile names are `local-before`, `local-final` (no-cache) and `local-final-cache`. No concurrent browser audits ran during these performance samples.

## Verification

| Check | Result |
| --- | --- |
| Build | 13 routes packaged; one-page résumé generated |
| Unit suite | 70/70 passed, including backend safeguards and asset fingerprints |
| Static checks | 93 source/script/test files and JSON configuration passed |
| Performance regressions | 34/34 passed in Chromium and WebKit |
| Full browser suite | 309/309 passed |
| Film and gallery lifecycle | 132/132 passed in Chromium and WebKit after the final visual correction |
| Recruiter access | 210/210 passed in Chromium and WebKit |
| Route accessibility | 52 checks; zero failures in Chromium and WebKit |
| Palette contrast | 182/182 checked pairs passed |
| Current npm advisory audit | Zero reported dependency vulnerabilities |
| Whitespace | `git diff --check` passed |

Desktop and phone screenshots were visually inspected. The final phone screenshots confirm that skip and music controls are visible above the film in both engines. Browser checks include original viewers, mobile menus, search, downloads, no-JavaScript/script-failure behavior, focus, reduced motion and responsive overflow. Tests were updated to wait for actual image decoding and motion-preference events, and to distinguish inactive deferred slides from visible photographs. Regressions reproduced late startup and unnecessary loading before the fixes.

An initial sandboxed unit run could not start its loopback server; the authorized rerun passed. The Windows Firefox runtime remains unavailable, as recorded for the prior release. No physical-device or screen-reader test, hosted owner sign-in or live backend write was performed. Automated checks do not establish complete accessibility conformance.

## Documentation and style record

Implementation follows current primary documentation for [video loading](https://web.dev/learn/performance/video-performance), [video-frame callbacks](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), [native page transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition) and [document prefetch](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch). Context7 was also used to check current MDN guidance. Browser support for native transitions is limited, so normal navigation remains the fallback.

The project-specific style/motion snapshot is saved as `captured-teaching-portfolio-warm-appearance-with-smooth-l-eb9c5fc83f9d`. Capture contrast checks passed. Shared-library validation passed for 6,919 entries, 7,168 unique files, 33 licence records and 5,858 SVGs. The snapshot contains style rules, not personal content or photographs. Existing third-party notices remain in place.

Local preview: http://127.0.0.1:4187/?review=performance-20261016. The owner approved publication on 17 October 2026.
