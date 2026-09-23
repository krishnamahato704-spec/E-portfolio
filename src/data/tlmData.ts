// Verified Teaching-Learning Materials (TLM) and Classroom Projects Data for Krishna Mahato
// Strictly grounded in authentic records from content.js, evidence.js, and teaching practicum archives

export type TlmCategory =
  | 'All'
  | 'Visual TLM'
  | 'Working Models / Tactile'
  | 'Classroom Activities'
  | 'Social Science'
  | 'English';

export interface TlmProject {
  id: string;
  title: string;
  category: 'Visual TLM' | 'Working Models / Tactile' | 'Classroom Activities';
  subject: string;
  grade?: string;
  topic: string;
  date: string;
  institution: string;
  image: string;
  isFeatured?: boolean;
  purpose: string;
  materials: string[];
  howItWorks: string;
  classroomApplication: string;
  studentTask: string;
  reflection: string;
  documentUrl?: string;
  documentLabel?: string;
  tags: string[];
}

export const TLM_CATEGORIES: TlmCategory[] = [
  'All',
  'Visual TLM',
  'Working Models / Tactile',
  'Classroom Activities',
  'Social Science',
  'English',
];

export const TLM_PROJECTS: TlmProject[] = [
  {
    id: 'tlm-comparative-diagrams',
    title: 'Comparative Systems Concept Diagrams & Visual Evidence Sources',
    category: 'Visual TLM',
    subject: 'Social Science',
    grade: 'Class IX-B',
    topic: 'Comparative Democratic Systems & Constitutional Accountability',
    date: 'July 2026',
    institution: 'Panchsheel Balak Inter-College / Amity Institute of Education',
    image: 'assets/democracy-thumb.webp',
    isFeatured: true,
    purpose:
      'Transition secondary Social Science away from abstract textual definitions into clear visual schematics and comparative structures that support multiple learning starting points.',
    materials: [
      'Dual-axis comparative governance diagrams',
      'Laminated institutional cards (Parliamentary vs Presidential)',
      'Direct vs Indirect democratic classification templates',
      'Comparative country matrices (India vs United States)',
    ],
    howItWorks:
      'The visual diagram maps governance branches (Executive, Legislature, Judiciary) and electoral accountability mechanisms side-by-side. Visual contrast enables learners to immediately see how prime ministerial accountability differs from presidential separation of powers.',
    classroomApplication:
      'Introduced during the guided explanation phase of the 40-minute lesson. Small groups examine the diagram cards to map institutional checks and balances before participating in whole-class dialogue.',
    studentTask:
      'Identify 3 structural differences between direct citizen voting (participatory models) and representative parliamentary systems using the diagram clues.',
    reflection:
      'Visual diagrams prevent cognitive overload for secondary learners encountering constitutional vocabulary for the first time. The diagram served as a persistent reference point throughout the lesson.',
    documentUrl: 'assets/democracy-lesson-plan.pdf',
    documentLabel: 'View Integrated TLM in 6-Page Lesson Plan (PDF)',
    tags: ['Comparative Politics', 'Visual Scaffolding', 'Class IX-B', 'Civics TLM', 'Multi-Modal'],
  },
  {
    id: 'tlm-phonics-word-builder',
    title: 'Multisensory Phonics & Foundational Word-Building Kit',
    category: 'Working Models / Tactile',
    subject: 'English',
    grade: 'Foundational & Primary',
    topic: 'Sound-Symbol Association, Letter Cards & Word Formation',
    date: 'Summer 2026',
    institution: 'Pehchaan The Street School',
    image: 'assets/certificate-2.webp',
    isFeatured: false,
    purpose:
      'Provide concrete, tactile learning aids for first-generation learners and out-of-school children, transforming abstract English alphabet sounds into physical, manipulative learning games.',
    materials: [
      'High-contrast double-sided phonics flashcards',
      'Tactile letter tiles for consonant-vowel combinations',
      'Visual pictorial association cards',
      'Handheld student chalkboards for immediate transcription',
    ],
    howItWorks:
      'Learners select consonant and vowel tiles, pronounce individual phonemes aloud using phonetic cues, and physically slide tiles together to synthesize two- and three-letter words (CVC pattern).',
    classroomApplication:
      'Deployed in open-air community learning circles. The teacher facilitates small peer pods of 3–4 children who take turns assembling words and sounding them out collectively.',
    studentTask:
      'Form 3 rhyming words using the tactile tile set (e.g., -at word family: cat, bat, mat) and transcribe them onto personal chalk slates.',
    reflection:
      'In non-traditional outdoor learning settings, tactile manipulatives sustain attention and remove the anxiety of formal textbooks. Physical manipulation builds confidence before pencil-and-paper writing.',
    documentUrl: 'assets/certificate-2.webp',
    documentLabel: 'View Verified 80-Hour Teaching Record',
    tags: ['FLN', 'Tactile Learning', 'Phonics', 'Pehchaan Internship', 'Foundational English'],
  },
  {
    id: 'tlm-photo-evidence-cards',
    title: 'Primary Source Historical Evidence Cards: Elections & Citizen Voice',
    category: 'Visual TLM',
    subject: 'Social Science',
    grade: 'Class IX',
    topic: 'Source-Based Historical Inquiry & Citizen Participation',
    date: 'July 2026',
    institution: 'Panchsheel Balak Inter-College',
    image: 'assets/democracy-plan-preview.webp',
    isFeatured: false,
    purpose:
      'Train secondary learners to interrogate visual source documents (authentic photographs) as primary historical and civic evidence rather than passive decorative illustrations.',
    materials: [
      'Curated photographic placards depicting authentic voting queues',
      'Visual documentary photographs of peaceful civic demonstrations',
      'Evidence interrogation prompt strips with structured inquiry prompts',
    ],
    howItWorks:
      'Photographs are presented with 3 diagnostic questions: What do you observe? Who is represented? What constitutional right is being exercised? Students analyze visual details (queue composition, placards, setting) to deduce underlying civic principles.',
    classroomApplication:
      'Pairs receive one photograph placard. After 2 minutes of silent observation, partners share details they noticed and articulate what the visual reveals about state accountability.',
    studentTask:
      'Compare a photograph of an election line with a peaceful protest photograph. Write two sentences explaining how both actions hold elected leaders accountable.',
    reflection:
      'Visual sources democratize classroom participation: students who hesitate to quote textbook definitions readily share acute observations when looking at real photographs of fellow citizens.',
    documentUrl: 'assets/democracy-lesson-plan.pdf',
    documentLabel: 'Examine Source Photo Integration in Lesson Plan',
    tags: ['Primary Sources', 'Visual Evidence', 'Civic Voice', 'Inquiry Cards'],
  },
  {
    id: 'tlm-formative-response-sheets',
    title: 'Three-Tier Diagnostic Response Sheets & Formative Prompt System',
    category: 'Classroom Activities',
    subject: 'Social Science',
    grade: 'Classes 8–9',
    topic: 'Continuous Diagnostic, Guided Practice & Evaluative Formative Checks',
    date: 'July 2026',
    institution: 'Panchsheel Balak Inter-College',
    image: 'assets/democracy-plan-preview.webp',
    isFeatured: false,
    purpose:
      'Embed continuous diagnostic evaluation into the 40-minute class flow, ensuring the teacher identifies and addresses misconceptions prior to, during, and after instructional explanation.',
    materials: [
      'Pre-printed three-tier student response slips',
      'Diagnostic baseline prompts (recalling prior models like historical assemblies)',
      'Guided practice concept check boxes',
      'Independent evaluative exit prompts',
    ],
    howItWorks:
      'The response sheet is sequenced in 3 distinct tiers: Tier 1 (Diagnostic) activates baseline memory; Tier 2 (Guided Practice) checks understanding during direct instruction; Tier 3 (Evaluative) prompts independent synthesis.',
    classroomApplication:
      'The teacher uses Tier 1 at minute 5 to gauge baseline readiness. Tier 2 is verified on-the-fly through desk circulation at minute 20. Tier 3 serves as an exit slip at minute 35 to plan the next day’s lesson.',
    studentTask:
      'Complete the Tier 1 definition check, verify the 3 forms of government during guided practice, and supply one reasoned argument evaluating representative democracy.',
    reflection:
      'Formative response sheets transform assessment from a stressful terminal exam into a diagnostic tool that actively guides pedagogical adjustments in real time.',
    documentUrl: 'assets/democracy-lesson-plan.pdf',
    documentLabel: 'Inspect Assessment Prompts in Lesson Record',
    tags: ['Formative Assessment', 'Diagnostic Prompts', 'Exit Slips', 'Pedagogical Evaluation'],
  },
  {
    id: 'tlm-board-matrix',
    title: 'Structured Classroom Chalkboard Synthesis Matrix',
    category: 'Visual TLM',
    subject: 'Social Science',
    grade: 'Class IX-B',
    topic: 'Comparative Matrix: Monarchy, Oligarchy, Dictatorship vs Constitutional Democracy',
    date: 'July 2026',
    institution: 'Panchsheel Balak Inter-College',
    image: 'assets/democracy-thumb.webp',
    isFeatured: false,
    purpose:
      'Provide a clear, disciplined visual anchor on the blackboard that synthesizes whole-class dialogue into a durable categorical matrix during live instruction.',
    materials: [
      'Multi-colored chalk for visual hierarchy',
      'Dual-column comparative board layout blueprint',
      'Student participation vocabulary callouts',
    ],
    howItWorks:
      'The board is deliberately zoned: the left column records Key Terms and Historical Precedents (e.g., Sabha, Samiti); the center displays the Comparative Government Matrix; the right column captures Unresolved Student Questions.',
    classroomApplication:
      'As students contribute features during discussion, their words are synthesized directly into the matrix columns. Students copy the structured board work into their notebooks as a study synthesis.',
    studentTask:
      'Transcribe the completed blackboard comparative matrix and add one contemporary or historical example under each government category.',
    reflection:
      'Deliberate board zoning gives visual structure to fast-moving classroom discussions and ensures that all learners, including visual and deliberate thinkers, leave with clean, coherent notes.',
    documentUrl: 'assets/democracy-lesson-plan.pdf',
    documentLabel: 'Review Board Work Plan in Practicum Blueprint',
    tags: ['Board Work', 'Visual Layout', 'Classroom Synthesis', 'Concept Matrix'],
  },
  {
    id: 'tlm-observation-questioning-protocol',
    title: 'Classroom Questioning Hierarchy & Observation Protocol',
    category: 'Classroom Activities',
    subject: 'Social Science',
    grade: 'Classes 6–12',
    topic: 'Teacher Questioning Sequences, Wait-Time Dynamics & Student Discourse',
    date: 'November 2025',
    institution: 'Amity International School, Mayur Vihar',
    image: 'assets/certificate-3.webp',
    isFeatured: false,
    purpose:
      'Document and operationalize how experienced secondary educators structure inquiry through strategic questioning tiers (recall → analysis → hypothesis → synthesis) and intentional wait-time.',
    materials: [
      'Question taxonomy recording sheet',
      'Classroom discourse quadrant tracking chart',
      'Wait-time stopwatch metric template',
    ],
    howItWorks:
      'Tracks teacher questions across 4 tiers of cognitive depth and maps student response distribution across classroom seating zones, ensuring equitable participation and deeper thinking.',
    classroomApplication:
      'Used during supervised lesson planning and peer-teaching reviews to design questioning scripts that move beyond simple yes/no recall to prompt student-led historical reasoning.',
    studentTask:
      'Participate in a structured "Wait & Revoice" routine where students pause for 5 seconds after a teacher prompt and revoice peer arguments before sharing their own perspective.',
    reflection:
      'Observing master teachers proved that extending wait-time from 1 second to 3–5 seconds dramatically increases the depth, nuance, and voluntary participation of middle and secondary learners.',
    documentUrl: 'assets/certificate-3.webp',
    documentLabel: 'View School Observation Context Record',
    tags: ['Questioning Routines', 'Pedagogical Observation', 'Wait Time', 'Discourse Analysis'],
  },
];
