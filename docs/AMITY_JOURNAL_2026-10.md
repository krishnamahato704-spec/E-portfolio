# Amity observation record

The owner's supplied `1000035936.pdf` is a 49-page scan of a handwritten journal and photographs. It records four observation days, 1–4 December. On 15 October 2026, the owner confirmed the observation year as 2025. The portfolio and typeset journal therefore use 1–4 December 2025. The original scan remains unchanged; the typeset edition records the separate owner confirmation.

The published file is the newly typeset 17-page journal, `assets/evidence/amity-observation-reflective-journal.pdf`. It includes daily entries, edited first-person reflections, photographs cropped from the source and scan-page references. The original scan is not copied into the public package. It remains a reflective student record, with no invented school endorsement or certificate.

`docs/amity-journal.json` holds the reviewed text and crop coordinates. `scripts/create-amity-journal.py` produces the PDF with ReportLab, exports its cover preview, checks the page count and text, and renders every page for review. Its local input renders are under the ignored `outputs/amity-source/` directory. Final review renders are under `outputs/amity-journal-review/`.

The Amity detail view now uses the journal and its daily record. The shared detail view previously selected the Pehchaan teaching certificate for both internships; that selection is now confined to the Pehchaan page. The experience page and shared résumé content use the corrected duration and dates.

Schema 8 narrowly corrects the known old Amity dates in pre-8 cloud content and adds the journal to the known nonempty published resource library. Later owner date edits, explicit empty libraries and schema-8 removals remain authoritative. No authenticated cloud writes or deployment were performed for this update.

The confirmed year also corrects only the exact earlier yearless placeholders during schema-8 loading. Other owner dates, descriptions and removal decisions remain intact. This lets an approved source release use the confirmed date without making a database write before preview approval.

Verification: the PDF has 17 pages and 3,497 words. All pages were rendered and visually checked, with full-size checks of representative text and photograph pages. The build produces all 13 routes and a one-page résumé. All 48 unit checks and 322 browser checks passed. `scripts/check-amity-browser.mjs` additionally reads the current public cloud record without authentication, verifies its migration, and checks the Amity detail, local PDF response, viewer, download control and focus restoration at desktop and mobile widths.
