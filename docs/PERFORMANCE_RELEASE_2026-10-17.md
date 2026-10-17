# Warm portfolio and performance publication

The owner requested publication on 17 October 2026 after reporting that the portfolio did not show the new design. This authorizes committing the reviewed local changes and publishing through the existing GitHub/Vercel connections. No database changes, private files, new credentials or paid services are part of this release.

## Cause of the stale site

The primary Vercel address served source `709e031bde7e`, including the warm design and photo gallery, but did not yet contain the local performance changes. The GitHub Pages address still served `9419cde0e515`, without the photo gallery. Both were checked directly through their HTML and `release.json`.

The earlier main-branch Pages run was cancelled. Later scheduled runs reported success while skipping build and deployment: the release check compared against the primary Vercel address, which was already up to date. Workflow run `39008692907` confirmed that only the content job ran and all deployment jobs were skipped.

The release check now resolves the deployment's actual site URL, and compares both the published-content digest and the source commit. Scheduled content checks no longer cancel an active source release. A fresh push to main runs the existing required checks and deploys Pages. Vercel builds the same source commit through its existing Git integration. This follows [GitHub's conditional concurrency guidance](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

Two regression tests first reproduced the wrong destination and the missed stale source commit, then passed after correction. The new performance browser suite is included in CI: Chromium on Linux and WebKit on macOS.

The first macOS run also exposed a test expectation left over from the old opening: its delayed application had exceeded the new startup budget, correctly showing Home, but the test waited for an introduction that should no longer start. The test now checks either visible opening controls on a prompt load or readable Home after an expired budget. A 2.2-second application delay exercises the fallback explicitly; the separate performance suite still rejects late introductions.

## Reviewed content and validation

The build fetched the published content once, without editing it. Its normalized digest remains `276642bebf55c9edfa3715914a861ffe76f7d2b98639bb087816d08da8bd9b80`, with data timestamp `2026-10-04T16:30:13.693024+00:00`. The warm palette, original illustrations, muted background film, five-photo gallery and confirmed observation year are retained. Performance changes and the preceding full audits are recorded in `PERFORMANCE_2026-10-16.md`.

Fresh pre-release checks on 17 October passed: build of 13 routes, 72 unit tests, static checks for 94 files, and 34 loading/navigation regressions across Chromium and WebKit. Unrelated PNGs, archives, chat exports, debug logs, local skills and the separate Bun lockfile are excluded from the commit.

## Publication verification

The intended production addresses are https://e-portfolio-lake-nine.vercel.app/ and https://krishnamahato704-spec.github.io/E-portfolio/. Completion requires the pushed main commit, the matching ready Vercel deployment, successful GitHub Pages deployment, and direct checks of both addresses. Verify the warm palette, deferred gallery sources, background film, working manual gallery navigation, document access, versioned asset URLs and production cache headers. Record final deployment metadata and browser results under `outputs/performance-release-20261017/` and report the verified public links in the chat.
