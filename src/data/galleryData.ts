import { assetUrl } from '../runtime';
export interface GalleryItem {
  id: string;
  title: string;
  category: 'Teaching Practice' | 'Field Practice & Community' | 'Lesson Planning & TLM' | 'Research & Presentations' | 'Academic Foundations';
  image: string;
  fallbackImage: string;
  highResUrl: string;
  caption: string;
  context: string;
  date?: string;
  aspect: 'landscape' | 'portrait' | 'square';
  featured?: boolean;
  // 3D Spatial coordinates in the gallery corridor
  position3D: [number, number, number];
  rotation3D: [number, number, number];
  size3D: [number, number]; // [width, height]
  depthLayer: 'foreground' | 'midground' | 'background';
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: 'Academic' | 'Teaching' | 'Professional learning' | 'Presentation';
  image: string;
  fallbackImage: string;
  highResUrl: string;
  description: string;
  verifiedContext: string;
  position3D: [number, number, number];
}

const SUPABASE_BASE = 'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/evidence/images/';

export const CERTIFICATES_DATA: CertificateItem[] = [
  {
    id: 'cert-ba-degree',
    title: 'Bachelor of Arts',
    issuer: 'Gurukula Kangri (Deemed to be University)',
    date: 'Awarded 2021 · Issued 26 December 2022',
    category: 'Academic',
    image: SUPABASE_BASE + '1787898353874_955zgr_certWall1_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-1.webp'),
    highResUrl: SUPABASE_BASE + '1787898353874_955zgr_certWall1_0.jpeg',
    description: 'Degree certificate recording a Bachelor of Arts awarded in 2021 and a CGPA of 8.80 in History and Economics.',
    verifiedContext: 'Undergraduate grounding in historical methods, historiography, and economic structures.',
    position3D: [12.0, 1.4, -2.4],
  },
  {
    id: 'cert-pehchaan-internship',
    title: 'Teaching Internship · 80 Hours',
    issuer: 'Pehchaan The Street School',
    date: '6 July 2026',
    category: 'Teaching',
    image: SUPABASE_BASE + '1787898375320_kx4r62_certWall2_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-2.webp'),
    highResUrl: SUPABASE_BASE + '1787898375320_kx4r62_certWall2_0.jpeg',
    description: 'Certificate of completion confirming 80 hours as an on-ground intern/teacher for foundational learners and adult literacy.',
    verifiedContext: 'Field practicum delivering competency-based foundational numeracy and literacy.',
    position3D: [12.8, 1.4, -2.4],
  },
  {
    id: 'cert-women-safety',
    title: 'Youth as Catalyst in Strengthening Women Safety',
    issuer: 'Pink Shakti Women Safety App',
    date: '26 November 2025',
    category: 'Professional learning',
    image: SUPABASE_BASE + '1787898492438_n15fxx_certWall3_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-3.webp'),
    highResUrl: SUPABASE_BASE + '1787898492438_n15fxx_certWall3_0.jpeg',
    description: 'Participation in the national webinar on women’s safety and youth civic community engagement.',
    verifiedContext: 'Professional learning on inclusive, safe educational and community environments.',
    position3D: [13.6, 1.4, -2.4],
  },
  {
    id: 'cert-nep-iks-presentation',
    title: 'Rootedness in India: NEP 2020 & Teacher Education',
    issuer: 'Amity Institute of Education · Sponsored by GAIL (India) Limited',
    date: '10 March 2026',
    category: 'Presentation',
    image: SUPABASE_BASE + '1787898560665_nhlr6b_certWall4_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-4.webp'),
    highResUrl: SUPABASE_BASE + '1787898560665_nhlr6b_certWall4_0.jpeg',
    description: 'Co-author and presenter on “Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education” at the international seminar.',
    verifiedContext: 'Academic scholarship integrating Indian Knowledge Systems into contemporary teacher education.',
    position3D: [14.4, 1.4, -2.4],
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-democracy-plan',
    title: 'Democracy Lesson Plan · Class IX-B Practicum Framing',
    category: 'Lesson Planning & TLM',
    image: assetUrl('assets/democracy-plan-preview.webp'),
    fallbackImage: assetUrl('assets/democracy-plan-preview.webp'),
    highResUrl: assetUrl('assets/democracy-plan-preview.webp'),
    caption: 'Structured pedagogical blueprint for Class IX Social Science integrating inquiry prompts, visual sources, and formative assessment checks.',
    context: 'Amity Institute of Education school practicum 2026 · Panchsheel Balak Inter-College',
    date: '25 July 2026',
    aspect: 'portrait',
    featured: true,
    position3D: [15.2, 1.35, -1.8],
    rotation3D: [0, -0.12, 0],
    size3D: [1.2, 1.5],
    depthLayer: 'foreground',
  },
  {
    id: 'gallery-nep-presentation',
    title: 'NEP 2020 & Indian Knowledge Systems (IKS) in Teacher Education',
    category: 'Research & Presentations',
    image: SUPABASE_BASE + '1787898560665_nhlr6b_certWall4_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-4.webp'),
    highResUrl: SUPABASE_BASE + '1787898560665_nhlr6b_certWall4_0.jpeg',
    caption: 'Paper presentation on embedding Indian Knowledge Systems and experiential inquiry into teacher education at the international seminar sponsored by GAIL India.',
    context: 'Amity Institute of Education International Seminar · 10 March 2026',
    date: '10 March 2026',
    aspect: 'landscape',
    featured: true,
    position3D: [16.4, 1.5, -2.3],
    rotation3D: [0, -0.05, 0],
    size3D: [1.5, 1.15],
    depthLayer: 'midground',
  },
  {
    id: 'gallery-pehchaan-field',
    title: 'Foundational Literacy & Numeracy Field Teaching',
    category: 'Field Practice & Community',
    image: SUPABASE_BASE + '1787898375320_kx4r62_certWall2_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-2.webp'),
    highResUrl: SUPABASE_BASE + '1787898375320_kx4r62_certWall2_0.jpeg',
    caption: 'Documented 80-hour on-ground teaching internship with foundational learners and adult-literacy participants at Pehchaan The Street School.',
    context: 'Pehchaan The Street School · Summer 2026',
    date: '1 June–6 July 2026',
    aspect: 'portrait',
    featured: false,
    position3D: [17.6, 1.25, -1.7],
    rotation3D: [0, -0.15, 0],
    size3D: [1.1, 1.45],
    depthLayer: 'foreground',
  },
  {
    id: 'gallery-academic-discipline',
    title: 'Academic Discipline in History & Economics',
    category: 'Academic Foundations',
    image: SUPABASE_BASE + '1787898353874_955zgr_certWall1_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-1.webp'),
    highResUrl: SUPABASE_BASE + '1787898353874_955zgr_certWall1_0.jpeg',
    caption: 'Undergraduate graduation degree with honours in History and Economics, providing the historiographical grounding for classroom pedagogy.',
    context: 'Gurukul Kangri Vishwavidyalaya · CGPA 8.80',
    date: 'Awarded 2021',
    aspect: 'landscape',
    featured: false,
    position3D: [18.6, 1.55, -2.4],
    rotation3D: [0, -0.08, 0],
    size3D: [1.4, 1.05],
    depthLayer: 'midground',
  },
  {
    id: 'gallery-practicum-portrait',
    title: 'Educator Practicum Study & Reflective Practice',
    category: 'Teaching Practice',
    image: SUPABASE_BASE + '1787826897958_3tk4ud_portrait.jpeg',
    fallbackImage: assetUrl('assets/portrait.webp'),
    highResUrl: SUPABASE_BASE + '1787826897958_3tk4ud_portrait.jpeg',
    caption: 'Reflective educator portrait during teacher preparation at Amity Institute of Education, focusing on social science inquiry and secondary education.',
    context: 'Amity Institute of Education · Noida',
    date: 'Practicum Session 2025–2026',
    aspect: 'portrait',
    featured: true,
    position3D: [19.7, 1.4, -1.9],
    rotation3D: [0, -0.18, 0],
    size3D: [1.15, 1.5],
    depthLayer: 'foreground',
  },
  {
    id: 'gallery-women-safety-initiative',
    title: 'Youth as Catalyst in Strengthening Women Safety',
    category: 'Research & Presentations',
    image: SUPABASE_BASE + '1787898492438_n15fxx_certWall3_0.jpeg',
    fallbackImage: assetUrl('assets/certificate-3.webp'),
    highResUrl: SUPABASE_BASE + '1787898492438_n15fxx_certWall3_0.jpeg',
    caption: 'National webinar participation and community awareness on women’s safety and institutional protocols.',
    context: 'Pink Shakti Women Safety Initiative · 26 November 2025',
    date: '26 November 2025',
    aspect: 'landscape',
    featured: false,
    position3D: [20.8, 1.45, -2.5],
    rotation3D: [0, -0.06, 0],
    size3D: [1.35, 1.05],
    depthLayer: 'background',
  },
];

export const GALLERY_CATEGORIES = [
  'All',
  'Teaching Practice',
  'Field Practice & Community',
  'Lesson Planning & TLM',
  'Research & Presentations',
  'Academic Foundations',
] as const;

export type GalleryCategoryFilter = (typeof GALLERY_CATEGORIES)[number];
