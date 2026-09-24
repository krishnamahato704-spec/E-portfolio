import { assetUrl } from '../runtime';
// Verified Teaching Portfolio Data for Krishna Mahato
// Grounded strictly in authentic records from content.js, evidence.js, and views.js

export interface TeachingItem {
  id: string;
  title: string;
  category: 'Lesson Plans' | 'Teaching Practice' | 'TLM & Resources' | 'Assessments' | 'Reflections' | 'Academic Research';
  subject: string;
  grade?: string;
  topic: string;
  date: string;
  duration?: string;
  context: string;
  institution: string;
  type: string;
  description?: string;
  thumbnail: string;
  documentUrl?: string;
  documentLabel?: string;
  isFeatured?: boolean;
  planningEvidenceNote?: string;
  evidencePoints: string[];
  tags: string[];
  caseStudy?: {
    overview: string;
    objectives: string[];
    approach: string;
    stages?: {
      step: string;
      title: string;
      pages: string;
      content: string;
    }[];
    assessmentChecks?: {
      tier: string;
      description: string;
    }[];
    materials: string[];
    reflection: string;
  };
}

export const TEACHING_CATEGORIES = [
  'All',
  'Lesson Plans',
  'Teaching Practice',
  'TLM & Resources',
  'Assessments',
  'Reflections',
  'Academic Research',
] as const;

export type CategoryFilter = typeof TEACHING_CATEGORIES[number];

export const TEACHING_ITEMS: TeachingItem[] = [
  {
    id: 'democracy-lesson-plan',
    title: 'Democracy · Lesson Plan No. 6',
    category: 'Lesson Plans',
    subject: 'Social Science',
    grade: 'Class IX-B',
    topic: 'Forms of Government & Democratic Citizen Participation',
    date: '25 July 2026',
    duration: '40 Minutes',
    context: 'Amity University School Practicum · Session 2026–27',
    institution: 'Panchsheel Balak Inter-College / Amity Institute of Education',
    type: 'Structured Inquiry Lesson Plan (PDF · 6 Pages)',
    thumbnail: assetUrl('assets/democracy-plan-preview.webp'),
    documentUrl: assetUrl('assets/democracy-lesson-plan.pdf'),
    documentLabel: 'Read Complete 6-Page Lesson Plan (PDF)',
    isFeatured: true,
    planningEvidenceNote: 'This is verified planning evidence, not a report of a delivered lesson. Completed student work and supervisor remarks are not included.',
    evidencePoints: [
      'Structured 40-minute lesson designed for Class IX-B secondary learners.',
      'Sequenced from diagnostic prior-knowledge interrogation to conceptual explanation and accountable citizenship.',
      'Includes concept diagrams, visual source photographs (elections & protest), guided practice, and independent tasks.',
      'Features a dedicated post-lesson reflective protocol across 4 diagnostic dimensions.',
    ],
    tags: ['Class IX-B', 'Social Science', '40 Min', '6 Pages', 'Democratic Inquiry', 'Inquiry-Based'],
    caseStudy: {
      overview: 'Lesson Plan No. 6 is an Amity University school-practicum blueprint for Social Science, Class IX-B, session 2026–27. It plans a 40-minute face-to-face lesson structured around interactive inquiry rather than rote memorization.',
      objectives: [
        'Recall the foundational meaning and defining features of democratic governance.',
        'Distinguish between forms of government (monarchy, oligarchy, dictatorship, direct & indirect democracy).',
        'Analyze the role of recurring elections and peaceful citizen protest in ensuring state accountability.',
        'Cultivate respect for divergent viewpoints and responsible constitutional citizenship.',
      ],
      approach: 'Inquiry-first pedagogy: opening with diagnostic prompts based on prior knowledge (Lincoln definition, historical Sabha & Samiti) before introducing comparative concept diagrams and visual historical photographs.',
      stages: [
        {
          step: 'Stage 01',
          title: 'Context & Shared Intention',
          pages: 'Pages 1–2 in original plan',
          content: 'Establish clear learning objectives, behavioral outcomes, and required multi-modal teaching aids. Ground the lesson in mutual respect and democratic dialogue.',
        },
        {
          step: 'Stage 02',
          title: 'Prior Knowledge Interrogation',
          pages: 'Page 3 in original plan',
          content: 'Begin with what learners already know. Diagnostic questions ask learners to define democracy, explore Lincoln’s formulation, and contrast it with monarchy and oligarchy, connecting back to early participatory models.',
        },
        {
          step: 'Stage 03',
          title: 'Explanation & Visual Dialogue',
          pages: 'Pages 4–5 in original plan',
          content: 'A concept diagram outlines direct vs. indirect democracy and parliamentary vs. presidential models (comparing India and the USA). Photographs of election booths and peaceful protests foster dialogue on accountability.',
        },
        {
          step: 'Stage 04',
          title: 'Learner Activity & Multi-modal Support',
          pages: 'Pages 3–5 in original plan',
          content: 'Combines oral discourse, chalkboard synthesis, visual source analysis, and structured written response tasks to provide multiple routes to conceptual understanding.',
        },
        {
          step: 'Stage 05',
          title: 'Formative Assessment Checks',
          pages: 'Pages 3 & 5 in original plan',
          content: 'Structured across diagnostic recall, guided definition practice, and independent evaluation prompts asking learners to defend the necessity of peaceful protest.',
        },
        {
          step: 'Stage 06',
          title: 'Teacher Reflection Protocol',
          pages: 'Page 6 in original plan',
          content: 'Post-lesson inquiry reviewing student engagement, challenging concepts requiring re-teaching, observed learner misunderstandings, and tomorrow’s pedagogical adjustments.',
        },
      ],
      assessmentChecks: [
        { tier: 'Diagnostic', description: 'Recall democracy and contrast with other forms of government prior to new explanation.' },
        { tier: 'Guided Practice', description: 'Define democracy, name three forms of governance, and explain the mechanism of free elections.' },
        { tier: 'Independent Practice', description: 'Explain the essential role of peaceful protest in maintaining institutional accountability.' },
        { tier: 'Evaluation', description: 'Synthesize reasons for comparing democracy favorably with alternative political models.' },
      ],
      materials: [
        'Quotation visual cards & blackboard synthesis',
        'Direct vs Indirect democracy comparative concept diagram',
        'Archival election and peaceful protest photographs',
        'Student guided response sheets',
      ],
      reflection: 'The plan includes dedicated reflective fields to record learner questions and instructional adjustments. Connecting observed student misunderstandings to specific teaching adaptations is an ongoing focus of my developing practice.',
    },
  },
  {
    id: 'panchsheel-internship',
    title: '16-Week Supervised School Teaching Internship',
    category: 'Teaching Practice',
    subject: 'Social Science, History & English',
    grade: 'Classes 6–9 & Class 11',
    topic: 'Comprehensive Secondary & Senior Secondary Classroom Teaching',
    date: '16 July – 31 October 2026',
    duration: '16 Weeks',
    context: 'Supervised B.Ed. Practicum · Session 2026–27',
    institution: 'Panchsheel Balak Inter-College',
    type: 'School Teaching Practicum',
    thumbnail: assetUrl('assets/evidence/tlm-exhibition.webp'),
    isFeatured: true,
    evidencePoints: [
      'Undertaking a comprehensive 16-week school internship with regular classroom teaching across Tuesday through Saturday.',
      'Direct instructional responsibility for Social Science in Classes 6–9 and select History units in Class 11.',
      'Teaching English in Classes 6 and 8 as an official B.Ed. pedagogy subject.',
      'Delivered over 15 complete instructional units using self-authored pedagogical lesson blueprints.',
      'Active leadership in school life: assembly coordination, Janmashtami, Independence Day exhibitions, and Sports Day.',
    ],
    tags: ['16 Weeks', 'Classes 6–9', 'Class 11 History', 'TGT English', 'Supervised Teaching', 'Classroom Leadership'],
    caseStudy: {
      overview: 'A full-time, supervised 16-week school internship at Panchsheel Balak Inter-College. This placement provides continuous, immersive classroom exposure spanning secondary Social Science, senior secondary History, and middle school English.',
      objectives: [
        'Bridge teacher education pedagogy with live daily classroom pacing, discipline, and engagement.',
        'Deliver curriculum units aligned with school syllabi and state board requirements.',
        'Facilitate student participation through structured questioning, board organisation, and formative checks.',
        'Participate fully in the wider institutional and co-curricular life of the school.',
      ],
      approach: 'Constructivist, inquiry-led teaching adapted to high-energy, diverse secondary classrooms. Emphasis on structured blackboard work, relatable examples from daily civics and geography, and clear learner expectations.',
      materials: [
        'Self-prepared lesson plans and TLM charts',
        'Classroom blackboard layouts and concept maps',
        'School textbooks and supplementary source extracts',
        'Display boards for national festivals and historical exhibits',
      ],
      reflection: 'Daily classroom teaching reinforced that lesson pacing must remain fluid. Frequent substitution periods honed my ability to quickly gauge a class’s baseline mood and pivot to engaging discussion routines.',
    },
  },
  {
    id: 'pehchaan-field-teaching',
    title: 'Foundational Literacy, Numeracy & ULLAS Adult Education',
    category: 'Teaching Practice',
    subject: 'Foundational Literacy & Adult Education',
    grade: 'Nursery, LKG, UKG & Adult Community Learners',
    topic: 'Activity-Based & Competency-Based Foundational Learning',
    date: '1 June – 6 July 2026',
    duration: '80 Hours (5 Weeks)',
    context: 'NTCC Non-Formal Education Internship',
    institution: 'Pehchaan The Street School',
    type: 'Community Teaching Internship',
    thumbnail: assetUrl('assets/evidence/pehchaan-collage.webp'),
    documentUrl: assetUrl('assets/evidence/ntcc-community-report.pdf'),
    documentLabel: 'View Official 80-Hour Teaching Certificate',
    isFeatured: true,
    evidencePoints: [
      'Completed 80 documented hours of on-ground non-formal community teaching.',
      'Delivered foundational literacy and numeracy to young learners in Nursery, LKG, and UKG.',
      'Employed play-based, competency-based, and tactile instructional methods.',
      'Facilitated ULLAS (Understanding Lifelong Learning for All in Society) literacy sessions for 5 adult learners.',
      'Developed essential adaptive classroom management in flexible outdoor and non-formal settings.',
    ],
    tags: ['80 Hours', 'Foundational Literacy', 'Numeracy', 'ULLAS Adult Literacy', 'Community Education'],
    caseStudy: {
      overview: 'An intensive 80-hour on-ground teaching internship at Pehchaan The Street School. Focus was placed on reaching children and adult community members who had experienced interrupted or zero formal schooling.',
      objectives: [
        'Build early phonemic awareness, letter recognition, and basic counting through sensory and activity-based games.',
        'Create a safe, encouraging, and dignity-centered learning atmosphere for first-generation learners.',
        'Deliver foundational adult-literacy modules under the national ULLAS framework to empower community members.',
      ],
      approach: 'Experiential and multi-sensory: using slate work, story circles, flashcards, and repetitive participatory rhymes to establish fundamental literacy milestones.',
      materials: [
        'Chalk slates and physical counting manipulatives',
        'Bilingual Hindi/English alphabet cards',
        'ULLAS adult literacy workbooks and practical everyday numeracy exercises',
      ],
      reflection: 'Teaching in an open community space stripped away all institutional assumptions. It proved that learner engagement is driven by genuine respect, clear voice modulation, and micro-affirmations rather than rigid disciplinary authority.',
    },
  },
  {
    id: 'nep-2020-presentation',
    title: 'Rootedness in India: NEP 2020 & Indian Knowledge Systems (IKS)',
    category: 'Academic Research',
    subject: 'Teacher Education & Pedagogical Policy',
    topic: 'Integrating Indian Knowledge Systems into Modern Teacher Education',
    date: '10 March 2026',
    context: 'National Seminar · GAIL Sponsored',
    institution: 'Amity Institute of Education · Sponsored by GAIL India Limited',
    type: 'Academic Seminar Presentation & Research Paper',
    thumbnail: assetUrl('assets/evidence/rootedness-iks.webp'),
    documentUrl: assetUrl('assets/evidence/rootedness-iks.pdf'),
    documentLabel: 'View National Seminar Certificate',
    isFeatured: true,
    evidencePoints: [
      'Co-authored and presented research paper at a national academic conference.',
      'Analyzed National Education Policy (NEP 2020) frameworks emphasizing multidisciplinary rootedness.',
      'Proposed classroom methods to connect indigenous historical traditions with critical scientific inquiry.',
      'Delivered oral presentation and engaged in academic discussion with senior university educators.',
    ],
    tags: ['NEP 2020', 'Indian Knowledge Systems', 'Teacher Education', 'National Seminar', 'Research'],
    caseStudy: {
      overview: 'Presented at the National Seminar on "Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education" at Amity University, sponsored by GAIL India Ltd.',
      objectives: [
        'Examine NEP 2020 guidelines on integrating cultural heritage and local context into teacher education curriculums.',
        'Demonstrate that Indian Knowledge Systems offer rich epistemological models for experiential, inquiry-based learning.',
        'Provide actionable curriculum recommendations for preservice social science teacher training.',
      ],
      approach: 'Critical policy analysis combined with pedagogical curriculum design.',
      materials: [
        'Academic paper manuscript and conference slide presentation',
        'NEP 2020 policy document and NCF-SE curriculum frameworks',
      ],
      reflection: 'Synthesizing historical scholarship with national policy strengthened my conviction that modern education achieves its greatest relevance when learners understand their cultural roots while thinking critically about the global future.',
    },
  },
  {
    id: 'classroom-observation-amity',
    title: 'School Observation Practicum (Classes 6–12)',
    category: 'Teaching Practice',
    subject: 'Social Science & History',
    grade: 'Classes 6–12',
    topic: 'Classroom Culture, Questioning Techniques & Pedagogical Pacing',
    date: '24–28 November 2025',
    duration: '5 Days',
    context: 'Secondary & Senior Secondary School Observation',
    institution: 'Amity International School, Mayur Vihar',
    type: 'School Observation Practicum',
    thumbnail: '',
    evidencePoints: [
      'Observed live Social Science and History teaching across middle, secondary, and senior secondary classes.',
      'Analyzed master educators’ questioning hierarchies, wait-time strategies, and board management.',
      'Studied learner engagement strategies during complex historical topic explanations.',
      'Attended morning assemblies, co-curricular functions, and student-led health awareness initiatives.',
    ],
    tags: ['Classes 6–12', 'Classroom Culture', 'Questioning Routines', 'Pedagogical Observation'],
    caseStudy: {
      overview: 'Five-day intensive observation placement at Amity International School, Mayur Vihar. Provided an analytical window into how established educators navigate classroom dynamics across varied grade levels.',
      objectives: [
        'Observe how teachers translate theoretical lesson objectives into real-time classroom dialogue.',
        'Document student participation patterns and effective strategies for drawing reluctant speakers into discussion.',
        'Study how digital boards and physical whiteboards are integrated seamlessly into 40-minute class periods.',
      ],
      approach: 'Non-participant qualitative observation with structured analytical field notes focusing on teacher discourse, student questions, and transition pacing.',
      materials: ['Observation field journal and pedagogical rubric notes'],
      reflection: 'Observing master teachers demonstrated that effective questioning is not about testing memory, but about opening spaces where students can articulate hypotheses and test them against historical evidence.',
    },
  },
  {
    id: 'visual-tlm-concept-maps',
    title: 'Inquiry Before Recall: Concept Maps & Visual TLM',
    category: 'TLM & Resources',
    subject: 'Social Science / Civics & History',
    grade: 'Classes 7–9',
    topic: 'Comparative Systems Concept Diagrams & Visual Evidence Sources',
    date: 'July 2026',
    context: 'Classroom Visual Teaching Aids · Session 2026–27',
    institution: 'Panchsheel Balak Inter-College',
    type: 'Visual Teaching-Learning Material (TLM)',
    thumbnail: assetUrl('assets/evidence/tlm-documentation.webp'),
    documentUrl: assetUrl('assets/democracy-lesson-plan.pdf'),
    documentLabel: 'View Integrated Visual TLM in Lesson Plan',
    evidencePoints: [
      'Comparative concept diagrams mapping direct democracy, representative democracy, parliamentary and presidential systems.',
      'High-impact visual evidence: authentic photographs of voting queues and peaceful constitutional protests.',
      'Chalkboard synthesis templates structuring student observations into clean categorical columns.',
      'Supports differentiated learning by offering pictorial and schematic access to abstract political concepts.',
    ],
    tags: ['Concept Maps', 'Visual TLM', 'Comparative Politics', 'Differentiated Access'],
    caseStudy: {
      overview: 'A suite of visual teaching-learning materials developed to shift Social Science classrooms away from textual memorization toward visual and evidence-based analysis.',
      objectives: [
        'Provide immediate visual scaffolding for abstract governance structures.',
        'Enable students to decode photographs as historical and civic evidence.',
        'Support learners who struggle with dense textbook paragraphs to participate actively in oral discussions.',
      ],
      approach: 'Multi-modal scaffolding: visual stimuli precede verbal debate and written synthesis.',
      materials: [
        'Comparative governance diagrams',
        'Historical event photograph cards',
        'Student visual decoding worksheets',
      ],
      reflection: 'When students examine an authentic photograph of citizens standing in line to vote, the concept of "universal adult franchise" stops being a dry definition and becomes a living civic choice.',
    },
  },
  {
    id: 'formative-assessment-checks',
    title: 'Formative Assessment & Diagnostic Prompt System',
    category: 'Assessments',
    subject: 'Social Science & History',
    grade: 'Classes 8–9',
    topic: 'Three-Tier Formative Evaluation (Diagnostic, Guided & Independent)',
    date: 'July 2026',
    context: 'Continuous Classroom Assessment Blueprint',
    institution: 'Panchsheel Balak Inter-College',
    type: 'Assessment Instrument & Questioning Blueprint',
    thumbnail: assetUrl('assets/democracy-plan-preview.webp'),
    evidencePoints: [
      'Diagnostic pre-assessment questions targeting baseline misconceptions before instructional delivery.',
      'In-flight guided practice checks: oral definitions, categorization exercises, and peer verification.',
      'Independent evaluative prompts requiring learners to defend reasoning with constitutional evidence.',
      'Formative feedback mechanism designed to inform subsequent day lesson adjustments.',
    ],
    tags: ['Formative Assessment', 'Diagnostic Checks', 'Bloom’s Taxonomy', 'Inquiry Evaluation'],
    caseStudy: {
      overview: 'A structured continuous assessment blueprint embedded into daily 40-minute secondary lesson designs, moving away from high-stakes terminal tests toward formative diagnostic feedback.',
      objectives: [
        'Assess prior knowledge without punitive scoring.',
        'Check conceptual clarity during the lesson to catch misunderstandings in real time.',
        'Promote higher-order evaluative thinking through source-grounded independent prompts.',
      ],
      approach: 'Tiered questioning matching Bloom’s cognitive progression: recall → distinguish → explain → evaluate.',
      materials: ['Diagnostic oral questioning cards', 'Exit slips and guided response sheets'],
      reflection: 'Formative checks are only valuable if the teacher is willing to change course when a diagnostic reveals confusion. Assessment must actively reshape tomorrow’s lesson.',
    },
  },
  {
    id: 'pedagogical-reflection-protocol',
    title: 'The Reflective Practitioner Protocol',
    category: 'Reflections',
    subject: 'Teacher Education / Professional Growth',
    topic: 'Post-Lesson Diagnostic Review & Continuous Pedagogical Adjustment',
    date: '2026–Present',
    context: 'B.Ed. Practicum Reflection Architecture',
    institution: 'Amity Institute of Education',
    type: 'Reflective Teaching Framework',
    thumbnail: assetUrl('assets/portrait.webp'),
    evidencePoints: [
      'Four-point reflective matrix: student engagement, concept re-teaching, observed errors, and future adjustments.',
      'Connects observed classroom dialogue directly to targeted adaptations in lesson planning.',
      'Grounded in Vygotskian scaffolding and Deweyan experiential learning principles.',
      'Maintains intellectual honesty regarding the current stage of preservice teacher development.',
    ],
    tags: ['Teacher Reflection', 'Pedagogical Growth', 'Inquiry Loop', 'Vygotsky & Dewey'],
    caseStudy: {
      overview: 'A structured post-lesson inquiry protocol developed during B.Ed. teacher education to build the habit of deliberate self-critique after every classroom session.',
      objectives: [
        'Systematically record what sparked spontaneous curiosity during a lesson.',
        'Pinpoint specific conceptual stumbling blocks that require different analogies or TLM.',
        'Formulate actionable teaching adjustments for the following class meeting.',
      ],
      approach: 'Honest self-documentation connecting student evidence with instructional modification.',
      materials: ['Daily practicum logbook and supervisor feedback rubric'],
      reflection: 'A great lesson plan is not a script to be performed blindly; it is a hypothesis. Reflection is the process of examining the experiment and learning how to teach better next time.',
    },
  },
];
