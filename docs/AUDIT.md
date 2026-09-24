# Repository and content audit

Audited 7 September 2026, from main revision `e9aa049` and both existing Supabase content rows.

## Existing implementation

The repository contained `index.html` (146 KB), `supabase-storage.js` (85 KB), `visual-editor.js` (83 KB), `visual-editor.css` (18 KB), an SQL setup script and source-pattern acceptance tests. No package manifest, local assets, framework, build tooling or checked-in deployment workflow was present. GitHub Pages served the static root.

The HTML mixed content, inline CSS, event handlers and editing code. The storage adapter loaded a second implementation from a pinned historical GitHub revision on jsDelivr and overrode styles repeatedly. Content state included editor-resize markup and revisions. The nav collapsed on most desktop sizes. The page had repeated skills / credential markup, unhelpful placeholders, empty gallery/resource sections and a mixture of visual themes.

## Content and media

- Profile, target roles, subject strengths, languages and UPSC preparation.
- B.Ed. and M.A. History in progress; B.A. History & Economics, Class XII and Class X records.
- Five-week NTCC teaching internship at Pehchaan, including Nursery/LKG/UKG literacy and numeracy and ULLAS sessions for five adult learners.
- One-week observation at Amity International School, Mayur Vihar.
- Teaching philosophy, Tagore/Vygotsky influences, source-based historical reasoning, differentiation, formative assessment and a proposed democracy example.
- Portrait and four accessible certificate images in Supabase Storage.
- The Pehchaan certificate records 80 hours and is dated 6 July 2026.
- The webinar certificate documents Pink Shakti's women-safety webinar, 26 November 2025.
- The Amity seminar certificate documents co-authorship/presentation, 10 March 2026, rather than simply participation.
- No CV file, lesson-plan download, assessment artifact or current gallery image was present in the saved state.
- Three legacy runtime-injected presentation/activity links returned HTTP 400: Pehchaan NGO internship.png, Raavan at Dussehra.jpeg and Seminar.jpeg. They were not carried into the redesign.

The current website visibly displayed editing directions such as “Add a caption”, repeated expected-completion labels and prompts to upload evidence. This undermined the recruitment presentation.

## Supabase audit

Project `oyqevsygintkjrkfbzpx` is active. `portfolio_public` contains clean public profile JSON, while `portfolio_state` contains legacy builder data. Both have RLS enabled. Public SELECT policies and owner UUID INSERT/UPDATE policies are present. The public `portfolio-media` bucket stores the existing portrait and certificates. Its owner write policies use the authenticated owner's email. No destructive operation or schema change was necessary.

The security advisor returned only the existing leaked-password-protection warning. Broad default table grants exist, but RLS constrains Data API row access. The redesign does not add functions, views, privileges or a public write endpoint.

## Design and information architecture

The new direction is an editorial teaching portfolio: large serif name treatment, ink/cobalt palette, fine rules, a framed authentic portrait and varied layouts. Mobile uses a compact header, explicit navigation, single-column reading layouts and intentional image presentation. Main body copy is at least 16px; small metadata is secondary.

Navigation groups the material into Profile, Teaching, Resources, Credentials and Contact. The home page gives a brief introduction and selective evidence. Internship and observation detail pages explain their scope. A separate teaching design page makes the proposed nature of the democracy example explicit. The résumé brings recruiting essentials into one printable view.

The legacy editing layers and stale setup SQL were removed on the redesign branch, with the original source preserved in Git history and production. The replacement has no package dependencies and no remote JavaScript. Existing uploaded evidence was optimized locally without modifying the original files.

## Recruiter review

Review questions: Who is the candidate? What can they teach? What is completed? When can they join? What actually happened in the classroom? Which claims have supporting evidence? Can I contact them quickly?

Corrections made during the review:

- Added the owner's clarified IGNOU institution and “first year cleared” progress note.
- Added “CTET applied”; did not claim a pass.
- Made May 2027 joining availability explicit on home, profile, résumé and contact.
- Kept B.Ed. and M.A. marked in progress, and roles labelled as interests.
- Distinguished school observation from direct teaching experience.
- Replaced generic certificate labels with titles/roles verified from the images.
- Removed broken downloads and all public editing prompts.
- Offered a useful printable résumé rather than a disabled CV button.
- Labelled the democracy example as a proposed approach and stated that lesson-plan and assessment files are not yet published.

The remaining content opportunity is real teaching evidence: a complete lesson plan, a linked assessment example and a short reflection on observed learning. These must come from the candidate's real work. They can be added through Studio; none was fabricated to fill the page.
