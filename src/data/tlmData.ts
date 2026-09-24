import { assetUrl } from '../runtime';
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
    "id": "tlm-mock-election",
    "title": "Mock election: ballot box and EVM",
    "category": "Working Models / Tactile",
    "subject": "Social Science",
    "grade": "Classes 6–8",
    "topic": "Elections and participation",
    "image": assetUrl("assets/evidence/tlm-exhibition.webp"),
    "isFeatured": true,
    "purpose": "Make the steps of an election visible through a classroom voting activity.",
    "materials": [
      "Cardboard ballot box",
      "Working EVM board",
      "Classroom activity posters"
    ],
    "howItWorks": "The supplied documentation describes a ballot box made from waste cardboard and a working EVM board.",
    "classroomApplication": "The handwritten record says this material was used in a mock-election lesson plan.",
    "studentTask": "Follow nomination, campaigning, voting and counting, using the activity poster as a guide.",
    "reflection": "The photographs document the model. Completed student responses are not included.",
    "tags": [
      "Civics",
      "Working model",
      "Mock election"
    ],
    "date": "Date not recorded",
    "institution": "Krishna Mahato · Teacher education",
    "documentUrl": assetUrl("assets/evidence/tlm-exhibition.webp"),
    "documentLabel": "Open supplied photograph or poster"
  },
  {
    "id": "tlm-earth",
    "title": "Structure of the Earth",
    "category": "Visual TLM",
    "subject": "Social Science · Geography",
    "grade": "Classes 6–10",
    "topic": "Continents, oceans and Earth layers",
    "image": assetUrl("assets/evidence/tlm-documentation.webp"),
    "purpose": "Use a labelled model to explain the Earth visually.",
    "materials": [
      "Coloured paper",
      "Layered Earth model",
      "Labels"
    ],
    "howItWorks": "The model pairs a globe view with labelled interior layers.",
    "classroomApplication": "The supplied record identifies continents and oceans for Classes 6–8 and Earth structure for Classes 9–10.",
    "studentTask": "Identify features on the model and explain the difference between the surface and interior layers.",
    "reflection": "The documentation records intended classroom uses; it does not include measured learning outcomes.",
    "tags": [
      "Geography",
      "Visual model"
    ],
    "date": "Date not recorded",
    "institution": "Krishna Mahato · Teacher education",
    "documentUrl": assetUrl("assets/evidence/tlm-documentation.webp"),
    "documentLabel": "Open supplied photograph or poster"
  },
  {
    "id": "tlm-election-guide",
    "title": "Mock election classroom activity poster",
    "category": "Classroom Activities",
    "subject": "Social Science",
    "grade": "Class 8",
    "topic": "Election process",
    "image": assetUrl("assets/evidence/mock-election-activity.webp"),
    "purpose": "Give students a visible sequence for a mock election.",
    "materials": [
      "Illustrated activity poster"
    ],
    "howItWorks": "The poster introduces nomination, campaigning, voting and results.",
    "classroomApplication": "Display alongside the ballot box or EVM activity.",
    "studentTask": "Discuss what happens at each stage and take part in the classroom election.",
    "reflection": "This is the supplied planning material; an activity evaluation is not attached.",
    "tags": [
      "Civics",
      "Activity guide"
    ],
    "date": "Date not recorded",
    "institution": "Krishna Mahato · Teacher education",
    "documentUrl": assetUrl("assets/evidence/mock-election-activity.webp"),
    "documentLabel": "Open supplied photograph or poster"
  },
  {
    "id": "tlm-election-invitation",
    "title": "Class 8 mock election invitation",
    "category": "Visual TLM",
    "subject": "Social Science",
    "grade": "Class 8",
    "topic": "Civic participation",
    "image": assetUrl("assets/evidence/mock-election-class8.webp"),
    "purpose": "Invite students to participate in a classroom election.",
    "materials": [
      "Classroom invitation poster"
    ],
    "howItWorks": "The display asks students to choose their candidate and cast a vote.",
    "classroomApplication": "Use before the activity to introduce its purpose.",
    "studentTask": "Read the invitation and discuss how to make a choice.",
    "reflection": "The poster documents preparation for the activity.",
    "tags": [
      "Classroom display",
      "Civics"
    ],
    "date": "Date not recorded",
    "institution": "Krishna Mahato · Teacher education",
    "documentUrl": assetUrl("assets/evidence/mock-election-class8.webp"),
    "documentLabel": "Open supplied photograph or poster"
  }
];
