# Interior Pages Implementation Plan

**Goal:** Extend the accepted homepage design into a coherent set of useful interior pages.

**Architecture:** Add three scoped CSS layers after the existing atlas/opening layers and before print. Reuse the semantic HTML and original content. The shared layer owns navigation, typography, footer, filters, Résumé and Contact; separate layers own teaching records and collections.

**Tech stack:** Existing static HTML, CSS cascade layers, vanilla modules, locally licensed Manrope and native viewers/forms.

**Spec:** spec.md in this directory.

## Tasks

- Save the current generated HTML/CSS and accepted Home measurements.
- Add src/styles/interior-portfolio.css for shared public-page layout, floating navigation, readable type and the Résumé/Contact designs.
- Add src/styles/interior-records.css for About, Experience and the teaching detail pages.
- Add src/styles/interior-collections.css for Evidence, Credentials and Gallery.
- Register these layers in scripts/build-styles.mjs without changing application or backend modules.
- Build and inspect every target page on desktop and phone. Check content/metadata preservation, Home stability, contrast, text fitting, menus, filters, viewers and print through targeted and existing tests.
- Save actual reusable style data project-only, update documentation and package complete source with a running preview.

## Review focus

Long headings and email addresses must wrap on320px. Filtered grids must reflow and retain hidden states. All original media must remain visible in the appropriate viewer. Fixed navigation/phone shortcuts must not block focus or actions. Print must continue to show the full web résumé. Owner authentication, production data and deployment settings must remain untouched.
