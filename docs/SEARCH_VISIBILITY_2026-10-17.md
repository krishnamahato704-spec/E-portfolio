# Google Search setup

The owner requested connection to Google Search Console and completion of the submission steps on 17 October 2026. Scope includes the public portfolio verification tag, primary search address, sitemap submission and homepage indexing request. The existing design, teaching facts and backend remain unchanged. No paid purchase or subscription is authorized.

The connected Google account already has full Search Console access. The Vercel property did not exist; it was created through the signed-in Search Console interface. Google supplied the public HTML verification tag now recorded in `src/search-config.json`. This is intended to be published on the homepage and retained for continued ownership verification. No password, OAuth token or other authentication secret is stored in the repository.

Vercel remains the primary search address. GitHub Pages keeps its own delivery origin and relative links, while its canonical links, Open Graph URLs, structured profile URL and sitemap entries prefer the matching Vercel pages. The backup's robots file points to the primary sitemap. Deployment freshness checks continue to inspect each host's own release; this distinction prevents the earlier stale Pages problem from returning.

Plan: publish the real tag and canonical metadata; verify their live output; verify ownership in Google; connect the verified property to GSC Wizard; submit the existing primary sitemap; inspect and request indexing for the homepage. Google controls subsequent crawling, indexing and ranking. Submission alone is not proof of indexing.

Checks: regression tests cover the public verification tag, per-route canonical links, private-page noindex directives and the separation of delivery and search origins. Validate both build targets and retain completion evidence under `outputs/search-setup-20261017/`.
