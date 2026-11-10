# Teacher & Forever Student redesign

Base revision: `69e18b177e3f5051558cfd088117d70d8d9cc735` on main. Prepared 9 November 2026.

The homepage now introduces the teaching identity through large sentences, pairs classroom practice with continued study, and presents the existing documents as editorial evidence rows. The teaching journey, qualifications, certifications, Tagore and Vygotsky influences, three teaching principles and contact destinations remain complete.

## Code and integration

- `src/editorial.js`: homepage opening, paired identity, evidence and journey output. Other route content is retained.
- `src/styles/reading-room.css`: final presentation layer before print; warm paper, dark ink, yellow-green emphasis and a dark manifesto. Shared navigation and controls use the same palette.
- `src/reading-room.js`: optional identity emphasis, active anchor index and bounded image previews, with cleanup for page lifecycle and preference changes.
- `src/motion.js`: starts/stops these aids with the existing application lifecycle. Existing headline, film, photo gallery and reveal behavior remains connected.
- `scripts/build-styles.mjs`: includes the new CSS layer. Edit source modules, then regenerate HTML/CSS with the existing build.

The Supabase configuration, backend modules, owner authentication, contact handler, Vercel configuration and GitHub workflows are unchanged. The contact form retains its existing email-draft behavior. No remote writes, deployment, commit or push was performed.

## References and reuse

[Andreas Kruszakin](https://andreas.vision/) informed the sentence-led hierarchy, quieter labels, reading rhythm and separation between work and personal perspective. Its current rendered DOM and content were inspected. Direct screenshot inspection was unavailable; no claim is made about matching its exact animation timings.

The three Awwwards references are [Mike Wilcock's project hover preview](https://www.awwwards.com/inspiration/project-hover-preview-mike-wilcock), [Good Measure Studio's sticky navigation](https://www.awwwards.com/inspiration/sticky-navigation-good-measure-studio), and [Oaksun Studio's text reveal](https://www.awwwards.com/inspiration/text-reveal-animation-oaksun-studio). The portfolio uses original vanilla implementations adapted to school recruitment and teaching evidence. A listing in Awwwards Elements does not establish that this redesign or each listed element won an award.

No reference-site source code, images, video or proprietary fonts were copied. Source Sans 3 and Source Serif 4 reuse the portfolio's existing local font files and licence notices. Original portfolio media and attribution links are preserved. The theme capture is project-specific and does not put personal media into the general asset library.

## Build and preview

Use Node 22 or newer and the existing lockfile:

```sh
npm ci
npm run build
npm run dev
```

Open `http://localhost:3000/E-portfolio/`. The complete source and generated root pages are included. `dist/` is the static deployment package and includes all public routes and assets. The existing Vercel/Pages release logic still decides the content source and canonical URLs.

The optional new interaction checks run with `node scripts/check-reading-room.mjs` after installing Chromium and WebKit through Playwright. The existing test and browser commands remain unchanged. See `VERIFICATION.md` for observed results.
