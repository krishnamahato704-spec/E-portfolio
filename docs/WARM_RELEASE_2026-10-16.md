# Approved warm portfolio release

The owner approved publishing the reviewed Mentora-inspired portfolio on 16 October 2026. The approved preview is recorded in `WARM_THEME_2026-10-16.md`. It includes the warm shared theme, original background illustrations, muted Home film, five-photo gallery, recruiter usability improvements and the owner-confirmed 2025 observation date.

## Target and content

The existing Vercel `e-portfolio` project is connected to `krishnamahato704-spec/E-portfolio`, production branch `main`, with primary address https://e-portfolio-lake-nine.vercel.app/. Before release, local HEAD and fetched origin/main both identified `9419cde0e515c09ce5e4052c3a869364f9840fc4`. Publishing uses a normal fast-forward Git push, without force or database changes.

A read-only comparison of the published Supabase row after the existing compatibility normalisation found an exact match with the approved preview. Schema version remains 8; the data update timestamp is `2026-10-04T16:30:13.693024+00:00`. Its content digest is `276642bebf55c9edfa3715914a861ffe76f7d2b98639bb087816d08da8bd9b80`.

The release includes reviewed application/source files, generated pages and résumé, required asset previews/notices, tests, CI configuration and supporting design documentation. Unrelated local PNGs, design archives, debug logs, chat exports, local skill files and the unrelated Bun lockfile are excluded. No pupil responses, mentor records or private source documents are added. The evidence worksheet/checklist are unfilled guidance and remain outside the website package.

## Final deep-link correction

Release verification found a timing-dependent layout shift when opening Home at `#teaching-evidence`. Delayed media modules revealed control rows after native fragment navigation, adding height above the target. Film/gallery controls now occupy their real layout space while remaining invisible, inert and hidden from assistive technology until initialisation. The no-JavaScript stylesheet removes the unavailable controls. The slow-module reproduction changed from a 182.77px shift to zero movement. The final visual arrangement is unchanged.

The recruiter suite now includes a regression that holds the gallery module, records the fragment position and verifies that initialisation preserves that position. All other video/gallery preference, pause, navigation and viewer behavior remains covered by the existing checks.

## Limits

Final local release checks passed: build of 13 routes; static checks for 90 files; 69/69 unit tests; 182/182 palette pairs; 309/309 functional browser checks; 210/210 recruiter checks in Chromium/WebKit; 132/132 film/gallery checks in both browsers; 52 route accessibility checks with zero failed checks; and `git diff --check`. Earlier responsive, moving-media and résumé visual results remain recorded in `WARM_THEME_2026-10-16.md`.

The existing Git-triggered deployment is used. No deploy-hook credential, paid plan, Supabase schema/authentication/storage setting or live content is changed. Real owner sign-in and a content-only publishing cycle are outside this source release. Local browser checks cover Chromium and WebKit; the previously recorded Windows Firefox runtime limitation remains. Automated accessibility results are not full WCAG conformance or a physical-device/screen-reader audit.

Production completion is confirmed separately by the pushed commit, Vercel deployment metadata and live site checks. Local verification outputs are kept under `outputs/warm-release-20261016/` and the existing browser report folders.
