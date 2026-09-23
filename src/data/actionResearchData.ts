// Verified Action Research and Classroom Inquiry Data for Krishna Mahato
// Grounded strictly in authentic records from teaching/democracy/, teaching/observation/,
// content.js, evidence.js, and Amity Institute of Education B.Ed. practicum archives.

export interface ResearchStage {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  focus: string;
  summary: string;
  details: string[];
  evidenceDoc?: string;
  evidenceLabel?: string;
  evidenceType?: string;
}

export interface ObservationMatrixItem {
  id: string;
  domain: string;
  baselineObservation: string;
  actionIntervention: string;
  pedagogicalInsight: string;
  practicumContext: string;
}

export interface WeeklyTimelinePhase {
  phase: string;
  period: string;
  title: string;
  institution: string;
  milestoneType: string;
  description: string;
  keyOutputs: string[];
  status: 'Completed' | 'Ongoing' | 'Next Step';
}

export const RESEARCH_METADATA = {
  title: 'From Rote Recall to Structured Inquiry',
  subtitle:
    'An Action Research Investigation into Questioning Sequences, Multi-Modal Scaffolding, and Three-Tier Formative Checks in Secondary Social Science',
  investigator: 'Krishna Mahato',
  institution: 'Amity Institute of Education · Panchsheel Balak Inter-College',
  context: 'B.Ed. Supervised School Practicum (Class IX-B Social Science)',
  observationContext: 'Amity International School, Mayur Vihar (Classes 6–12)',
  theoreticalAnchor: 'NEP 2020 Experiential Learning & Vygotskian Scaffolding',
  pedagogicalContinuum: ['OBSERVE', 'QUESTION', 'PLAN', 'TEACH', 'ASSESS', 'REFLECT', 'GROW'],
  status: 'Active Practicum Action Research',
  summary:
    'Investigating how transitioning from abstract textbook-driven recall to structured visual concept diagrams, diagnostic questioning sequences, and embedded three-tier formative checks enhances student engagement and critical reasoning in Class IX Social Science.',
};

export const RESEARCH_STAGES: ResearchStage[] = [
  {
    id: 'stage-problem',
    number: '01',
    title: 'Research Problem & Classroom Need',
    eyebrow: 'PROBLEM IDENTIFICATION',
    focus: 'Overcoming Abstract Recall in Secondary Civics',
    summary:
      'In secondary Social Science, constitutional concepts (such as democratic systems, representative accountability, and separation of powers) are conventionally taught through dense textbook definitions, leading students to memorize formulas without understanding institutional mechanisms.',
    details: [
      'Textbook memorization leaves students unable to explain how democratic institutions differ from monarchies or oligarchies.',
      'Students frequently memorize Abraham Lincoln’s definition ("of the people, by the people, for the people") without grasping constitutional checks and balances.',
      'Lack of visual or comparative scaffolding limits participation for learners with diverse reading backgrounds.',
    ],
    evidenceDoc: 'assets/democracy-lesson-plan.pdf',
    evidenceLabel: 'View Lesson Plan No. 6 Context (PDF)',
    evidenceType: 'Practicum Blueprint',
  },
  {
    id: 'stage-observation',
    number: '02',
    title: 'School Observation & Discourse Dynamics',
    eyebrow: 'OBSERVATIONAL INQUIRY',
    focus: 'Classroom Questioning & Student Wait-Time',
    summary:
      'A 5-day school observation at Amity International School, Mayur Vihar (24–28 November 2025) across Classes 6–12 highlighted that teacher wait-time and question framing directly govern classroom discourse depth.',
    details: [
      'Observed that rapid recall questions (under 1 second wait-time) prompted quick student guessing and privileged fluent speakers.',
      'Documented how extending wait-time to 3–5 seconds allowed reflective students to organize multi-clause responses.',
      'Identified the need to structure questions into progressive tiers: diagnostic baseline → analytical inquiry → evaluative reflection.',
    ],
    evidenceDoc: 'assets/certificate-3.webp',
    evidenceLabel: 'View School Observation Record',
    evidenceType: 'Observation Dossier',
  },
  {
    id: 'stage-question',
    number: '03',
    title: 'Research Questions & Inquiry Goals',
    eyebrow: 'INQUIRY FORMULATION',
    focus: 'Core Pedagogical Hypotheses',
    summary:
      'Formulating actionable research questions to guide the instructional intervention during the 16-week school teaching internship.',
    details: [
      'Question 1: Does beginning a lesson with prior-knowledge diagnostic prompts (connecting historical Sabha/Samiti to modern voting) increase voluntary student participation?',
      'Question 2: How do dual-axis comparative concept diagrams and authentic primary source photographs affect students’ ability to distinguish parliamentary from presidential governance?',
      'Question 3: Can a three-tier formative assessment system (diagnostic, guided check, independent task) provide immediate actionable feedback during a 40-minute class period?',
    ],
    evidenceDoc: 'assets/democracy-lesson-plan.pdf',
    evidenceLabel: 'Inspect Planned Inquiries in Lesson Plan',
    evidenceType: 'Curricular Hypothesis',
  },
  {
    id: 'stage-intervention',
    number: '04',
    title: 'Intervention Architecture (The 40-Minute Routine)',
    eyebrow: 'INSTRUCTIONAL INTERVENTION',
    focus: 'Multi-Modal Lesson Pacing & Board Work',
    summary:
      'Designing and deploying a structured 4-phase pedagogical intervention for Class IX-B Social Science (Lesson Plan No. 6, delivered during the 16-week school internship).',
    details: [
      'Phase 1 (Mins 0–8): Diagnostic prior-knowledge activation using student-friendly historical comparisons.',
      'Phase 2 (Mins 8–22): Multi-modal visual scaffolding using dual-axis comparative governance diagrams (India vs. US) and primary source photo cards (elections queue vs. peaceful protest).',
      'Phase 3 (Mins 22–32): Structured chalkboard synthesis matrix categorizing Monarchy, Oligarchy, Dictatorship, and Democracy with student-generated keywords.',
      'Phase 4 (Mins 32–40): Three-tier formative check sheets (Diagnostic Recall, Guided Practice, Evaluative Reasoning Exit Slip).',
    ],
    evidenceDoc: 'assets/democracy-lesson-plan.pdf',
    evidenceLabel: 'Read Complete 6-Page Lesson Architecture (PDF)',
    evidenceType: 'Intervention Plan',
  },
  {
    id: 'stage-evidence',
    number: '05',
    title: 'Evidence Gathering & Assessment Framework',
    eyebrow: 'EVIDENCE & DATA CAPTURE',
    focus: 'Three-Tier Diagnostic & Formative Prompts',
    summary:
      'Establishing authentic assessment checkpoints across the teaching period to collect qualitative pedagogical evidence of student comprehension.',
    details: [
      'Diagnostic Check: Evaluates baseline definitions and distinguishes constitutional government from authoritarian rule prior to explanation.',
      'Guided Practice Check: Evaluates whether students can accurately categorize the 3 governance branches and map direct vs. indirect electoral mechanisms.',
      'Independent Evaluative Check: Asks students to evaluate why ongoing citizen participation and peaceful protest are essential for democratic accountability.',
      'Board Work Transcription: Reviewing student notebooks for organized retention of the comparative blackboard matrix.',
    ],
    evidenceDoc: 'assets/democracy-plan-preview.webp',
    evidenceLabel: 'View Assessment Prompts Preview',
    evidenceType: 'Assessment Protocol',
  },
  {
    id: 'stage-reflection',
    number: '06',
    title: 'Pedagogical Reflection & Professional Growth',
    eyebrow: 'REFLECTIVE SYNTHESIS',
    focus: 'What Worked, Limitations, and Next Evidence',
    summary:
      'Synthesizing pedagogical insights gained across teacher education, supervised practicum, and foundational community teaching.',
    details: [
      'Visual scaffolding democratizes participation: students who hesitate to formulate textbook definitions engage enthusiastically when analyzing real photographs.',
      'Disciplined chalkboard layout provides visual stability, especially for diverse learners needing persistent reference anchors.',
      'Transparent Next Step: The current portfolio documents planning evidence and diagnostic framing; compiling completed pupil work samples and supervisor evaluative rubrics forms the ongoing archival goal.',
    ],
    evidenceDoc: 'assets/krishna-mahato-resume.pdf',
    evidenceLabel: 'Download Full Academic Dossier (PDF)',
    evidenceType: 'Reflective Dossier',
  },
];

export const OBSERVATION_MATRIX: ObservationMatrixItem[] = [
  {
    id: 'matrix-1',
    domain: 'Classroom Questioning & Wait-Time',
    baselineObservation:
      'Rapid recall questioning (< 1 sec wait-time) created hesitation and favoured only a few vocal learners.',
    actionIntervention:
      'Planned tiered questioning script with intentional 3–5 second wait-time and structured peer dialogue.',
    pedagogicalInsight:
      'Extended wait-time directly prompted students to provide reasoned explanations rather than monosyllabic answers.',
    practicumContext: 'Amity Observation → Panchsheel Balak Inter-College',
  },
  {
    id: 'matrix-2',
    domain: 'Instructional Scaffolding & Media',
    baselineObservation:
      'Heavy reliance on textbook reading resulted in student fatigue and passive comprehension of governance.',
    actionIntervention:
      'Integrated dual-axis concept diagrams and primary source evidence photographs (voting lines & civic protests).',
    pedagogicalInsight:
      'Visual contrast enabled students to deduce institutional differences between parliamentary and presidential systems independently.',
    practicumContext: 'Class IX-B Social Science Practicum',
  },
  {
    id: 'matrix-3',
    domain: 'Assessment Dynamic & Feedback Flow',
    baselineObservation:
      'Traditional terminal assessments failed to reveal learner misconceptions until after exams were graded.',
    actionIntervention:
      'Implemented pre-, during-, and post-explanation formative checks (diagnostic, guided check, exit slips).',
    pedagogicalInsight:
      'Real-time response checks provided immediate signals to clarify nuances before moving to subsequent topics.',
    practicumContext: 'Lesson Plan No. 6 Assessment Design',
  },
  {
    id: 'matrix-4',
    domain: 'Foundational & Multi-Level Support',
    baselineObservation:
      'Standardized textual materials alienated learners lacking basic English vocabulary and literacy confidence.',
    actionIntervention:
      'Deployed concrete tactile manipulatives, phonics tiles, and bilingual instruction (English/Hindi).',
    pedagogicalInsight:
      'Tactile hands-on word building lowered emotional barriers and accelerated foundational sound-symbol mastery.',
    practicumContext: 'Pehchaan The Street School (80-Hour Field Teaching)',
  },
];

export const WEEKLY_RESEARCH_TIMELINE: WeeklyTimelinePhase[] = [
  {
    phase: 'Phase 01',
    period: '24–28 November 2025',
    title: 'School Observation Internship',
    institution: 'Amity International School, Mayur Vihar',
    milestoneType: 'Observational Baseline',
    description:
      '5-day intensive school placement observing Social Science and History classrooms across Classes 6–12. Focused on teacher questioning strategies, student participation equity, and classroom routines.',
    keyOutputs: [
      'Questioning hierarchy taxonomy notes',
      'Wait-time dynamics tracking log',
      'Classroom discourse observations',
    ],
    status: 'Completed',
  },
  {
    phase: 'Phase 02',
    period: '10 March 2026',
    title: 'Academic Seminar on NEP 2020 & Experiential Learning',
    institution: 'Amity Institute of Education (GAIL Sponsored)',
    milestoneType: 'Theoretical Synthesis',
    description:
      'Co-authored and presented academic paper on integrating Indian Knowledge Systems (IKS) and experiential pedagogical inquiry into teacher education.',
    keyOutputs: [
      'Co-authored paper presentation',
      'NEP 2020 experiential learning framework',
      'Verified presentation certificate',
    ],
    status: 'Completed',
  },
  {
    phase: 'Phase 03',
    period: '1 June–6 July 2026',
    title: 'Community Field Teaching Internship (80 Hours)',
    institution: 'Pehchaan The Street School',
    milestoneType: 'Tactile Pedagogy & FLN',
    description:
      '5-week on-ground teaching internship facilitating foundational literacy, numeracy (FLN), and ULLAS adult literacy for first-generation and community learners.',
    keyOutputs: [
      'Tactile phonics and word-builder kits',
      'Activity-based numeracy tasks',
      'Verified 80-hour teaching certificate',
    ],
    status: 'Completed',
  },
  {
    phase: 'Phase 04',
    period: 'July 2026',
    title: 'Inquiry Lesson Plan Blueprint Development',
    institution: 'Amity Institute of Education / Panchsheel Balak Inter-College',
    milestoneType: 'Curricular Design',
    description:
      'Formulated Lesson Plan No. 6 for Class IX-B Social Science. Structured the 6-stage inquiry architecture: Context → Prior Knowledge → Visual Explanation → Multi-Modal Activity → Formative Check → Reflection.',
    keyOutputs: [
      '6-page documented lesson plan PDF',
      'Dual-axis comparative governance diagrams',
      'Primary source photo card evidence sets',
    ],
    status: 'Completed',
  },
  {
    phase: 'Phase 05',
    period: '16 July–31 October 2026',
    title: 'Supervised 16-Week School Practicum',
    institution: 'Panchsheel Balak Inter-College',
    milestoneType: 'Classroom Implementation',
    description:
      'Supervised B.Ed. school internship facilitating Social Science (Classes 6–9), English (Classes 6 & 8), and History (Class 11). Delivered 15+ lessons using self-prepared inquiry lesson plans.',
    keyOutputs: [
      '15+ self-prepared inquiry lessons delivered',
      'Zoned chalkboard comparative matrices',
      'School event & display board coordination',
    ],
    status: 'Ongoing',
  },
  {
    phase: 'Phase 06',
    period: 'Upcoming Session 2026–27',
    title: 'Archiving Student Artifacts & Supervisor Rubrics',
    institution: 'Amity Institute of Education Practicum Archive',
    milestoneType: 'Evaluation & Archival Evidence',
    description:
      'Formalizing anonymized student formative response sheets, diagnostic exit slips, and mentor supervisory feedback rubrics to assess concrete learning gains.',
    keyOutputs: [
      'Anonymized student response sheets',
      'Mentor supervisor evaluation rubrics',
      'Action research summative report',
    ],
    status: 'Next Step',
  },
];
