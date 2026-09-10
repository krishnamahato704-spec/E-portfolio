# Teaching journal visual system

This visual update treats Krishna Mahato's portfolio as a considered teaching journal: an oxblood opening spread, warm paper, marginal labels, fine rules and documentary evidence. It suits a History and Social Science educator without adding historical decoration, stock imagery or invented content.

## Shared rules

- `src/styles.css` owns the full system, ordered as reset, tokens, base, components, layout, responsive, motion and print layers.
- Paper `#f7f3eb`, document sheet `#fffdf8`, text `#292628`, secondary text `#625d58`, oxblood `#692b36`, dark sections `#30292c`, and restrained gold `#ddbf88`.
- Source Serif 4 regular and italic provide the literary voice. Both Latin WOFF2 files are self-hosted, total 40,180 bytes, with the SIL Open Font License included. Segoe UI and Arial handle navigation, labels and body text. Georgia remains the serif fallback.
- Body text starts at 16px with 1.75 line height; labels and controls use readable rem units. Small 12–13px type is reserved for secondary labels and metadata.
- Fluid gutters and section spacing, a 1240px maximum container, a 66-character prose measure, 2px control corners, and visible rules replace repeated rounded cards.
- Buttons and filters have a minimum 44px target height. Visible focus uses a 3px outline; dark panels use gold focus outlines. Escape closes the mobile menu and restores focus to its toggle.
- Brief translation and hover effects stay subtle. Reduced-motion rules disable animation and transitions. Static content remains visible while Supabase loads.

## Page treatments

The home page pairs the introduction and joining availability with a framed authentic portrait. The internship feature reads as field notes; the teaching principles use a dark reading surface. Inner pages use marginal chapter labels. Qualifications stay scannable in ruled rows. Certificates pair complete, uncropped document previews with their existing descriptions. Resources use a distinct planning panel. Contact, résumé and Studio share the same typographic and control vocabulary. Print styling removes navigation and decorative surfaces.

## Preservation and validation

- Compared all twelve generated HTML pages with production. They match exactly after normalising only the theme-colour value and stylesheet version query.
- `content.js`, `views.js`, `cloud.js`, `config.js`, `admin.js`, no-script styles, sitemap and robots file remain unchanged.
- All 12 existing Node tests pass; the link validator now correctly ignores query strings when resolving local files.
- Browser-checked every route at 320, 768 and 1440px: no horizontal document overflow and no unlabelled form controls. Also visually reviewed the home and owner editor at 390px.
- Reviewed home, credentials, internship story, contact and the owner editor visually. All four certificates retain original-file links and their existing optimized previews.
- Checked normal rendered text contrast across eleven public/sign-in pages: no sampled text failed the applicable 4.5:1 or large-text 3:1 threshold. This is a focused check, not a claim of a full WCAG audit.
- Verified menu open/Escape/focus return, resource filtering, required contact fields and email-copy success feedback.
- Reviewed print rules, no-script navigation and reduced-motion behavior using isolated local fixtures derived from the exact source. These fixtures were removed before commit. Printed PDF pagination was not tested.
- The owner editor was reviewed using a local rendering of its existing template. No live owner login, upload or database publish was attempted; no credentials were supplied and no Supabase data was changed.
- No runtime dependencies were added. No Lighthouse score is claimed.

The recruiter review focused on fast candidate recognition, legible availability and qualifications, clear distinctions between teaching and observation, and evidence that can be examined easily. All factual wording remains the existing reviewed wording.
