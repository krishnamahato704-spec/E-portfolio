# Krishna Mahato · Teaching Portfolio

A responsive teaching portfolio for History, Social Science, Economics and English roles.

## Structure

- `index.html` — semantic page content and resilient fallback copy
- `styles.css` — editorial responsive design
- `app.js` — navigation, motion and Supabase content loading
- `SUPABASE_ASTRA_SETUP.sql` — the compact public content model and RLS policies
- `tests/acceptance.mjs` — static acceptance checks

The public page reads the single `public.portfolio_public` record through a Supabase publishable key. If the request is unavailable, the complete built-in page content remains visible. Uploaded portfolio images continue to use the existing `portfolio-media` bucket.

Run the checks with:

```bash
node --check app.js
node tests/acceptance.mjs
```
