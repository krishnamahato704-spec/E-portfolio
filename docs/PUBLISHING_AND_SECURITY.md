# Publishing and security follow-up

15 October 2026 follow-up, updated 16 October. The owner approved publishing the reviewed warm portfolio on 16 October. The approved source release uses the existing Git integration, as recorded in `WARM_RELEASE_2026-10-16.md`. New deploy-hook credentials and a content-only test publication are separate from that source release.

## Actual release path

Owner Studio saves validated, version-checked content to Supabase. The scheduled `deploy.yml` workflow checks the published row, builds a consistent snapshot and deploys GitHub Pages after its checks. Its scheduled job does not itself deploy Vercel. The Owner Studio message now makes this distinction explicit.

The Vercel configuration builds `dist` with the existing Node build and loads Supabase content when run on Vercel. Git-integrated source releases and content-only changes are separate triggers. A read-only dashboard inspection on 15 October confirmed that `e-portfolio` is connected to `krishnamahato704-spec/E-portfolio`, with production on `main`. The production deployment shown was commit `9419cde0e515c09ce5e4052c3a869364f9840fc4`, dated 12 October. Git settings explicitly stated that the project has no deploy hooks.

The prepared `vercel-content` workflow job can request a rebuild after successful scheduled/content checks when a `VERCEL_DEPLOY_HOOK` repository secret is configured. It reports the missing setup clearly when that secret is absent. No hook was created or called in this local revision. A database save alone does not confirm that the primary Vercel address has updated.

The bridge follows [Vercel's deploy-hook documentation](https://vercel.com/docs/deploy-hooks). After approval, create or verify the intended project/branch hook and store its URL only as the `VERCEL_DEPLOY_HOOK` GitHub Actions secret. Do not enable it against an unreviewed production target.

After preview approval, confirm the intended production source, review the build environment and create the hook only with approval for the new persistent deployment credential. Store it in the repository Actions secret and verify one content-only rebuild using an authorised test record or unpublished preview. Confirm the HTML, résumé and `release.json` content digest/timestamp all come from the same snapshot. Restore/remove the test record through the owner workflow and repeat verification. Do not expose webhook URLs or tokens in source, logs or chat.

## Prepared protections

`vercel.json` now sets `X-Content-Type-Options: nosniff`, same-origin framing, a strict referrer policy and disables unused camera, microphone and location permissions. An HTTP CSP adds `frame-ancestors 'self'`; it is enforced alongside the existing restrictive HTML CSP. Same-origin PDF previews remain allowed. Verify actual response headers after an approved Vercel deployment; local static serving does not prove hosted configuration.

The current Supabase security advisor still reports leaked-password protection disabled. The dashboard confirms that the organisation is on Free. [Supabase's password-security documentation](https://supabase.com/docs/guides/auth/password-security) states that leaked-password protection is available on Pro and above. This cannot be enabled on the current plan without a paid upgrade; do not buy one automatically.

Read-only SQL checks on 15 October found row-level security enabled on both `portfolio_public` and legacy `portfolio_state`. Anonymous users can select the public content row and cannot insert or update either table; anonymous legacy reads are denied. Authenticated writes retain owner-specific `USING`/`WITH CHECK` policies. The legacy read policy also remains owner-specific. These observations do not replace an actual owner sign-in/publication test. No schema, RLS, bucket, authentication setting or live content is modified by this revision.

The live schema 8 content still contains the earlier yearless observation date. The local normaliser applies the owner-confirmed 2025 date to those exact placeholders while preserving other edits and removals, so an approved build can use a consistent snapshot without publishing a database change in advance. Local and merged live content signatures were compared again for this revision.

## Migration history restored locally

The working tree originally deleted `supabase/migrations/20260924163206_explicit_portfolio_api_grants.sql`. The live migration list records `20260924163206` as applied, and the read-only grant/policy checks agree with the intended restrictions. After the owner's request to complete the remaining work, the exact file was restored from `HEAD`; its Git diff is empty. No migration was rerun and no live database grant was changed.
