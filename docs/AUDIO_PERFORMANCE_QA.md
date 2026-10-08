# Audio and performance changes

The regular Home entry offers **Enter with music**. That click starts a new
instrumental acoustic piano melody and the eight-second film introduction.
The owner's spoken recording has been removed from the public asset package.
The continuous background chord, page-change sounds, Web Audio controller and
floating volume widget have also been removed. Pages are silent after the
opening. Old session sound preferences cannot reactivate the removed sounds.

The piano is a locally rendered eight-second melody using Alexander Holm's
Salamander piano samples (CC BY 3.0). Credits and the sample source are in
`assets/opening-music-credits.txt`, linked beside the film controls. The optional
composition script recreates the saved MP3; ordinary builds require no audio
service, extra npm dependency or music engine. The track fades in and out,
contains no vocals and plays at 48% media volume. Audible playback requires a
visitor gesture in browsers. Skip, mute, reduced motion and direct links remain
available. Ending, skipping or leaving the opening stops the music. Replay
starts the same tune.

The film uses a compositor-friendly zoom and crossfade into Home instead of
resizing its layout on every frame. It pauses when its hero is off screen and
preserves an intentional visitor pause. Mobile video framing uses cached
dimensions instead of reading layout on each media update. The opening remains
full screen on phones; the shorter phone hero applies after the introduction.

## Removed and reduced

- Four decorative illustrations now use 640px versions. Their combined file
  size fell from 2,189,224 to 550,502 bytes, approximately 75%. The originals
  and the published evidence files remain available.
- Public pages no longer import the full content data merely to build a contact
  email. The contact form uses its already-rendered, escaped email address.
- Only Home loads the opening module.
- Header scroll updates change the class only when crossing its threshold.
- Unused Home render functions, the old second film controller, cursor script,
  unused opening/redesign stylesheets, and an unused Supabase SDK wrapper and
  dependency were removed. Owner editing still uses the tested HTTP API.
- Vercel caches release-versioned JS/CSS in the browser. Its cache rule requires
  a stamped release version; HTML and unstamped URLs retain normal freshness.

## Local measurements

The same 390px Chromium check used 4x CPU throttling, cold contexts, an
eight-second Home introduction and twelve scroll steps. The earlier optimized opening also
enabled audio. These are single local laboratory runs, not field Core Web
Vitals or a guarantee about every device.

| Page | Image bytes before | Image bytes after | Script bytes before | Script bytes after |
| --- | ---: | ---: | ---: | ---: |
| Home | 3,709,818 | 2,071,096 | 71,819 | 51,628 |
| About | 2,506,844 | 868,122 | 70,315 | 41,287 |
| Teaching Evidence | 3,278,102 | 1,639,380 | 70,315 | 41,287 |

Home layout events fell from 231 to 67 and measured browser task time from
6.13 to 2.90 seconds. Measurements were taken before the final unused-film
controller removal and off-screen pause improvement. Raw reports are saved in
`output/portfolio-design-review/performance-baseline.json` and
`output/portfolio-design-review/performance-optimized.json`.

## Project checks

GitHub's `origin/main` and the Vercel production deployment initially both
matched commit `6205458941762584ad060bd10d8c6879ca698dd4`. The source audit
covered this portfolio's browser modules, render/build pipeline, dependencies,
deployment workflow and configuration, and owner API calls.

Supabase project `oyqevsygintkjrkfbzpx` is ACTIVE_HEALTHY. Its two public tables
each have one row, RLS enabled and primary-key indexes. It has no public custom
functions or Edge Functions. Public browsing reads the generated static release
and makes no database request. No schema, index or Edge Function change was
needed. Vercel returned no error/fatal function log entries in the inspected
30-minute window; a static site's browser problems are not covered by those
logs.

## Verification

Real-browser checks cover the entry gesture, actual piano playback, finite
opening, mute, keyboard skip, mobile full-screen cover, film visibility and
manual pause. They also check that inner pages and normal browsing stay silent,
including sessions with sound enabled by the previous release. The old voice
asset and Web Audio module must be absent from the production package. Existing
page, filter, viewer, print, recruiter-access, content validation and owner
API tests remain.

Required CI runs Chrome/Firefox opening checks on Linux and the same suite in
native macOS WebKit before Pages deploys. The Linux runner provides an audio
output for Firefox. Normal playback checks use native HTMLAudio; failure cases
inject playback errors. There is no Web Audio API dependency in the website.

Desktop and phone opening screenshots and accessibility results are saved in
`output/portfolio-design-review/opening/`. All thirteen pages retain their
approved palettes, subject illustrations, personal photographs and teaching
philosophy.
