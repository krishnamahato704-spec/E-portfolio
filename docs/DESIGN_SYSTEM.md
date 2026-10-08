# Portfolio design preview

The initial layout was approved on 7 October 2026. The requested page-layout, light-color and full-page background refinements are local previews awaiting review.

The final education-first homepage and corrected page boards from the original chat are the visual reference. Six final boards are readable locally. Owner Studio and 404 follow the approved written brief because their exported image is truncated. Earlier local prototypes and the previous atlas/recruiter layout are historical references.

## Shared styles

- Every route has its own light background and accent palette. Opaque white cards keep documents and text readable.
- Headings, text, links, buttons, navigation, footers and dialogs inherit the route's color tokens. Filled actions use darker accent colors with white text; large areas use pale colors.
- Self-hosted Source Sans 3 for body, controls and the personal name; Source Serif 4 semibold for section headings. The font names were a proposed choice, not established from the PNGs. Adobe's semibold webfont and OFL license are packaged locally.
- Compact KM. navigation, 1240px content maximum, fluid gutters, 12px card corners and a light footer that matches each page.
- Colored illustrations of history, economics, English language learning and lesson planning appear in the margins and gaps from the top to the bottom of each page. Small published photographic accents remain secondary. Opaque panels keep evidence and text readable.
- Each inner page has its own composition. Evidence uses indexed document rows, Credentials a three-column certificate wall, and Gallery a varied photo mosaic. Each becomes a readable phone layout. About preserves the full academic timeline; Home leads with current studies and the latest completed degree.

## Page colors

| Page | Light palette |
| --- | --- |
| Home | Warm ivory and terracotta |
| About | Sage and cream |
| Experience | Powder blue and slate |
| Teaching Evidence | Peach and clay |
| Credentials | Lavender and pearl |
| Résumé | Stone and blue grey |
| Contact | Dusty rose and white |
| Gallery | Ivory and olive |
| Pehchaan | Honey cream and ochre |
| Observation | Aqua and mint |
| Democracy | Periwinkle and blue |
| Owner Studio | Lilac and plum |
| Page not found | Sand and taupe |

The page-palettes stylesheet is the source of the route colors. Its body-scoped tokens work without JavaScript and also color dialogs outside the main content. The build reads the same source for each page's mobile browser theme color. The palette check verifies 130 main text/button pairs at a minimum of 4.5:1, including secondary text on pale surfaces. Photo covers use nearly opaque light gradients behind text. The Home film controls and timing remain intact.

## Page composition

Home: a clearly visible illustrative film beside an ivory introduction panel, with an authentic portrait, compact current-study summary, evidence and résumé actions, and expandable roles and subjects of interest. The Home background film uses 80% opacity and slightly reduced saturation, with no page-wide ivory wash. Phones show a 210px film area above the overlapping text panel, with a small portrait beside the name. Contact is also available in the desktop hero and the mobile shortcut bar. An owner-driven facts strip follows the hero, recording the current internship, subjects actually taught, availability, location and relocation preference. Selected Teaching Evidence comes next, with a large featured plan and smaller supporting material and report cards. Each preview includes its existing description and original-file access. My Teaching Journey precedes the education overview and Professional Learning. My Teaching Philosophy then sits immediately above the closing contact panel, with locally stored archival portraits of Rabindranath Tagore and Lev Vygotsky, the existing influence descriptions and all three owner-authored teaching principles. Warm parchment and pale sage panels keep this section within the Home theme. The fuller classroom implications remain under Experience → My teaching approach. Portrait sources are linked below each photograph and recorded in PHILOSOPHY_PORTRAITS.md. Education & Credentials features B.Ed., M.A. History and the latest completed degree, with a link to the full About timeline.

The contact panel includes availability, the email address, contact and résumé links. Secondary labels use at least 14px text; reading text uses 16px or larger with comfortable line spacing and paragraph widths limited to 68 characters where appropriate. Shared buttons, card corners, photo shadows and section headings remain consistent while individual page layouts and colors stay distinct. The three home evidence previews use existing published material and original-file viewers; the Democracy example retains its Planning evidence label. Owner changes and removals control these summaries.

Public pages have a fixed Résumé, Evidence and Contact bar below 761px. It uses ordinary links, works without JavaScript, marks the relevant current page, and reserves space below the footer including device safe-area padding. Root scroll padding keeps focused fields and end-of-page links above the bar. The bar is hidden during the film introduction and in print, and is omitted from Owner Studio and 404. The Home fragment #teaching-evidence provides a direct application link to the selected work without starting the opening. Résumé and Evidence route URLs also provide direct entry.

About: a framed portrait and an individual photograph beside the Independence Day display, a personal story spread, the full academic timeline, a compact interests strip and a school-display feature. Its background alternates between history, economics, English and lesson-planning illustrations, with small individual-display and library photo accents. Paired history/economics and English/teaching designs fill the gaps around the academic timeline. Group photographs are omitted from this page. Recruiter details remain available in a disclosure.

Experience: a photographic school-practice cover, chronological index, searchable field notes with alternating photographs and text, learning areas and an expandable teaching approach. Pehchaan can match Teaching and Community without changing the database record.

Teaching Evidence: a document desk with genuine plan and activity previews, a side note and compact numbered catalogue rows. Credentials: a centered heading, three original document samples and a certificate wall. Gallery: a large exhibition photograph and a varied mosaic with wide community photographs and a horizontal material record. Every published entry retains its original viewer, context and search/filter controls.

Democracy: a lesson notebook with a classroom-material cover, four planning steps, source PDF aside and six detailed source sections in a disclosure. Its status remains Planning evidence. Pehchaan uses a community photo story, numbered activity notes, certificate and report. Observation uses a campus cover, three photographs from the supplied journal, four daily records and the original journal without inventing a year.

Résumé: a document desk with a compact action sidebar, readable PDF preview and separate full web record. The generated PDF remains one page. Contact: a personal school-display postcard beside the email-draft form. Owner Studio keeps its real authentication, upload, preview and version-checked publish handlers, with a portrait workspace heading. The 404 route uses an original material preview as a misplaced-document illustration.

Photographic accents and photo plates are rendered from the current published records, not fixed CSS image URLs. Owner replacements, removals and pending publication status control decorative uses as well as evidence cards. Original observation photographs are available only while their original journal remains published. Decorative images have empty alternative text; actual photo plates have context and original-file viewers. Subject illustrations are separate design assets, not teaching evidence or owner uploads.

The page-atmosphere layer replaces the old oversized photo watermarks with four subject illustrations and smaller photographic accents. History uses source books, maps, a compass and a magnifying glass. Economics uses a ledger, coins, a scale and symbolic charts. English pedagogy uses literature, a pen and speech bubbles. Teaching uses a lesson notebook, activity cards and a classroom board. Their ochre, terracotta, teal, blue and lilac colors sit alongside each route's existing light palette. The stationary scenes alternate down the full page height. Home starts below the film hero. No teaching evidence or personal photographs were generated. See [the illustration record](SUBJECT_ILLUSTRATIONS.md) for files and prompts.

Subject illustrations retain visible color in the margins. Paired illustrations use near-full color in actual gaps between sections, with three arrangements and light multicolor washes. Their height drops from 172px to 120px on phones. Photographic accents are smaller and use low opacity, reduced saturation and soft fades. Reading sections, forms, cards and exposed headings have opaque white or page-colored surfaces. The decorations have no links, motion or keyboard targets, are hidden from assistive technology, and disappear in print. Image-loading failures leave the light page palette visible.

## Film and motion

A small blocking Home script selects the opening before the first browser paint. Its poster fills the screen while the app and video load, so Home cannot flash before the film. The same video takes over that cover synchronously before playback is awaited. If the app fails, a four-second watchdog reveals the readable portfolio. The first eligible homepage visit then runs the eight-second opening described in the exported chat: full-screen film, gentle zoom, “Hi, my name is” and a large name reveal, then the film settles into Home and reveals navigation and the page content. The same video element is moved into the opening and returned to the hero on completion; no second film is downloaded. The opening starts at full opacity, then softens to the 80% Home treatment as the film settles. Name text uses an ivory panel and the supplied film remains labelled as illustrative. “Play with voice & piano” restarts the sequence with the supplied soundtrack after a visitor action; audio stops at the end or on skip. A clearly labelled “Skip to portfolio” action uses the page's main button color. The muted background film loops independently.

Pause, sound, replay, Escape and skip controls are available. Scrolling or moving focus to the underlying page ends the opening. Reduced motion, blocked storage, unavailable media, blocked autoplay and missing JavaScript preserve a readable static homepage. New Home arrivals and refreshes start with the film even in an existing session. Internal Home links and history returns keep the page ready to read; `?intro=1` explicitly previews it again in an existing session, while still respecting reduced motion. Cleanup returns the video to the hero and restores controls after history navigation. Mobile framing follows the supplied film's changing subject position, keeping the face visible during the transition. The film-opening style layer owns this composition after the page palette layer.

## Source and build

The shared CSS layers supply the base styles. The page-identities layer defines individual layouts; page-palettes supplies route colors and lighter photographic overlays. The film-opening layer supplies the video-first loading state, film treatment and transition. The recruiter-access layer defines shared reading sizes, the compact Home layout, evidence hierarchy and mobile shortcuts. The page-atmosphere layer follows it and supplies the distributed background scenes and protected reading surfaces. The home-philosophy layer adds the portrait panels and responsive principle layout. Print follows these layers and keeps the résumé readable in black on white. src/styles.css and all route HTML are generated by the build. Do not edit generated files independently. Database schema version 8, storage buckets, private-source access and owner publication rules are unchanged.

SITE_URL supplies one origin to HTML, metadata, sitemap, packaged browser config and résumé. Vercel defaults to the configured portfolio domain. Pages builds derive their own origin from the GitHub repository. Review CI explicitly uses the Vercel origin when checking committed generated files.
