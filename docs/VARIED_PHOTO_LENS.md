# Different photographs in the homepage lens

10 November 2026. The decorative lens now reads every distinct photo already approved for the homepage carousel, including deferred image sources, and keeps each photo paired with its actual caption. It does not alter the carousel's slide selection or activate its deferred images.

Deliberate pointer travel of 16% of the scene width, bounded to 180–320px, requests the next photo after a 900ms cooldown. Re-entry can also advance it; a qualified phone tap requests the next photo. There is no idle photo slideshow or additional animation loop. The initial desktop demonstration remains finite.

The next photo decodes off the page while the current one stays visible. Once ready, the image and its caption fade out over 140ms, switch together and fade in over 220ms through the existing atlas renderer. Failed photos are skipped; an older load completion cannot overwrite a newer selection. Empty and single-photo galleries remain safe. Motion preferences, data saving, visibility, visitor pause, native cursor, control hit targets and tap-versus-scroll rules remain.

Verification: build 13 static pages and the résumé; 111/111 unit tests, including six added source/cycle edge cases; static checks across 122 source/script/test files; 50/50 lens checks in Chromium and WebKit. Browser checks cover actual different photographs and matching captions, unchanged carousel sources, failed/delayed loads, phone taps, preferences and lifecycle behavior. The infrastructure audit retains all original IDs, destinations and hooks, with backend, auth, contact and routing modules unchanged.

No new photo, font, dependency or external code was imported. Actual motion settings are recorded in [varied-lens-theme.json](varied-lens-theme.json) as project-only style data. No media or personal captions are saved to the shared library. The other page designs remain as delivered in [INTERIOR_PAGES.md](INTERIOR_PAGES.md). Nothing was committed, pushed or deployed.
