# Portfolio design preview

16 October 2026. This revision applies the owner's approved Mentora-inspired warm appearance. The owner approved the local preview for publication on 16 October; release scope is recorded in `WARM_RELEASE_2026-10-16.md`. The Botanical and 15 October reports describe earlier versions.

## Typography and colour

Keep self-hosted Source Sans 3 for body text, controls and the personal name, and Source Serif 4 semibold for headings. Retain their packaged OFL notices. No additional font or framework is required.

Every route uses the same warm academic palette. Home's introduction and the footer use chocolate with light text. Long records use cream backgrounds and light document panels. Primary actions and selected filters use copper; headings use chocolate. Status colours still carry their existing labelled meanings. Primary action buttons retain a minimum 48px height, including when phone labels wrap.

| Role | Colour |
| --- | --- |
| Reading canvas | `#FBF7F0` |
| Default document surface | `#FFFDF9` |
| Warm highlight | `#F2E7D9` |
| Main text | `#30251F` |
| Secondary text | `#6D5849` |
| Primary actions | `#965333` |
| Action hover and focus | `#754026` |
| Headings, hero and footer | `#3B2E26` |
| Control borders | `#8D7360` |
| Decorative rules | `#DED0C0` |

Planning evidence has a blue badge, ongoing/in-progress records amber and completed records green. Text labels carry the meaning as well as colour. Page-wide action colours do not imply different actions between routes.

## Composition

Home leads with a larger authentic portrait, current degrees in progress, teaching identity, earliest joining and current teaching scope. Current internship, additional teaching and relocation preferences follow. Evidence precedes the journey and education. Detailed roles and subjects remain expandable.

The introduction is open copy over the existing muted film, with a chocolate scrim, copper primary and outlined secondary actions. It keeps 28px internal space on desktop, 20px on phones and 18px at 320px. The scrim uses `#30241D` at 95% on the left, 90% through 48% width and 75% on the right; phones use 90%. The darker right edge protects the gallery captions even over bright footage. Original background illustrations appear below the introduction.

A five-photo compilation sits beside the introduction on desktop and below it on phones. It uses existing published school, teaching-material and community photographs, retaining their captions and original image viewers. Slides move horizontally every six seconds with pause, previous/next, keyboard and swipe controls. Focus and manual navigation stop rotation until explicitly restarted. Hover, off-screen and hidden-page states pause rotation; page restoration preserves the pause and selection. Reduced motion/data saving keep it static unless requested. Only the first original photograph appears without JavaScript. Removed, pending and replaced records remain governed by current content. The fixed Résumé, Evidence and Contact links retain safe-area spacing, keyboard clearance, no-JavaScript navigation and print hiding.

The gallery has no outer card. A 6px cream image border, light captions over the dark scrim and separate cream controls keep the photograph distinct. Controls retain 44px minimum touch targets. Keyboard focus uses a light outline with a 5px offset. Print uses dark captions and hides controls/video.

Film/gallery controls reserve their real layout space before enhancement, while remaining invisible, inert and hidden from assistive technology. Initialisation enables them without moving direct fragment targets. The no-JavaScript stylesheet removes unavailable controls.

Teaching Evidence leads into searchable, labelled light records with warm thumbnail areas. Phone descriptions use the card's full reading width, with a smaller thumbnail beside the title. The mobile decorative document display is omitted; the side note follows the collection. Credentials use light card bodies and warm image areas, and omit their decorative certificate fan on phones. Original records and galleries retain their existing viewers and removal rules.

After owner feedback, selected original illustrations are restored at reduced repetition and opacity: two margin subjects and a faint published-photo accent per desktop page, with one smaller subject scene on phones. Compact section interludes show the original subject images at 76px tall on desktop and 56px on phones. The earlier blanket hide rule was removed. Original assets remain untouched.

Ordinary reading sections, education summaries and philosophy copy use spacing and rules instead of additional framed panels. Flat canvas-coloured surfaces protect text from the underlying artwork. Evidence, credentials, photographs and contact forms retain useful frames. Decoration is noninteractive, excluded from the accessibility tree and hidden in print.

The Home philosophy retains both archival portraits, sources, influence descriptions and all three existing principles. Smaller portraits sit beside the copy on phones instead of occupying separate tall blocks. Headings use a consistent scale; small descriptive labels and field names use ordinary case. Shared reading sizes and line lengths remain intact.

## Opening and media

The first eligible session visit uses a 2.2-second film hold and 1-second dissolve. Visible Skip to portfolio and Enable music buttons appear on the initial poster and remain during the sequence. Skip works through the blocking bootstrap even when the app module is unavailable. Music is requested only by its own button and stops on dismissal or completion. Unrelated keys and pointer gestures do not start it.

Refreshes and internal returns in the same session do not replay the full-screen opening. `?intro=1` requests an explicit opening preview. The same muted video continues as the Home background when eligible, using one decoder. Reduced motion and data-saving/2G connections prevent automatic film and photo rotation. Fragment entry bypasses the opening; the background pauses when Home is off screen. Missing scripts, blocked storage, media failure and a four-second watchdog preserve readable Home. Pause film and Hide film respect manual choices; Hide film returns focus to the playback control. Music never continues behind the portfolio.

Local document sizes come from their actual files through generated metadata; unknown remote sizes are left unlabelled. The original classroom-material image is preserved, with responsive 360/720px WebP previews. Essential portrait and first evidence imagery have deliberate loading priority and intrinsic dimensions.

## Sources and build

Edit source files, not generated route HTML or combined CSS. `home-media.css` follows `portfolio-theme.css` and precedes print. Shared route colours remain in `page-palettes.css`, with matching fallback tokens. `npm run build` regenerates file metadata, 13 pages, CSS, the one-page résumé and `dist`. The résumé uses matching brown/copper accents on white paper.

Mentora's public preview supplied visual direction; the adaptation uses original project CSS and the existing fonts/media. No Hostinger template code, photographs, fonts or sample claims were imported, and template redistribution rights are unverified. The preceding Botanical source notice remains packaged for provenance. Source details are in `assets/credits/design-theme.md`. No additional font, framework, image, music or paid dependency is introduced. The shared library records the current composition only as a project-specific style reference.

The owner confirmed the observation period as 1–4 December 2025 on 15 October 2026. Pages, metadata, the résumé and the typeset journal use that date. Narrow compatibility corrections replace the exact earlier placeholders in schema 8 content while preserving other owner edits and removals. The original scanned journal remains untouched.

Owner authentication, optimistic publishing, schema 8 and private storage remain in the existing architecture. The prepared HTTP headers and optional content-release bridge require an approved hosted release and configuration verification. See [publishing and security](PUBLISHING_AND_SECURITY.md) and the [private evidence checklist](PRIVATE_EVIDENCE_CHECKLIST.md).
