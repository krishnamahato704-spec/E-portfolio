# Ordinary entry and responsive headings

The live portfolio must match the approved design through ordinary navigation, without a special replay URL. Each new Home document starts its opening, including reloads, navigation from another page and a newly opened tab. Reduced-motion, data-saving, direct-fragment and history-restoration behavior remains available.

The homepage's Education & Credentials title split words at narrow desktop and phone widths. Its editorial column could be narrower than the longest word; phone section headers also placed the title beside its action link. The global emergency word-wrap rule hid overflow by breaking words. Homepage display headings now keep words intact, the education column has enough space, and phone editorial titles and links occupy separate rows. The largest phone gallery and contact type scales with available width.

Verification uses actual rendered glyph positions rather than only checking page overflow. It covers 320, 375, 390, 768, 800, 900, 1024, 1159, 1280 and 1440 pixels. Local and public CSS are compared after normalizing release query strings; the app browser is inspected separately. The real content, routes, landmarks, hooks and backend behavior remain unchanged.

Real mobile emulation also reproduced an initial resize notification that cancelled the opening even though its measured stage dimensions had not changed. Resize now dismisses the sequence only when the actual stage geometry changes. The existing identity checks include a touch/mobile first visit.

The gallery's nine-pixel padding exposed the next deferred slide at the edge of its clipped window, showing an unloaded image icon. A border of the same size and color retains the white frame and clips slides at the correct inner edge. Images intentionally waiting for a source remain visually hidden until requested, so browser fallback icons cannot peek through a rotated edge. Original files, deferred loading and gallery controls are retained.
