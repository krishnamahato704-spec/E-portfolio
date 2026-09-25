import { suppliedCertificates, suppliedGallery, suppliedResources } from './media.js';
const storage = 'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/evidence/images/';
export const defaultContent = {
  schemaVersion: 7,
  profile: {
    name: 'Krishna Mahato', email: 'krishnamahato704@gmail.com',
    eyebrow: 'History, Social Science & English · Emerging educator',
    headline: 'I help students read the past with curiosity, evidence and confidence.',
    summary: 'Developing History, Social Science and English educator with academic foundations in History and Economics, formal teacher education and supervised classroom experience.',
    portrait: storage + '1787826897958_3tk4ud_portrait.jpeg',
    roles: [
      'TGT Social Science',
      'TGT English (B.Ed. Pedagogy)',
      'PGT History (post-M.A. 2027)'
    ],
    subjects: ['History', 'Social Science', 'Economics', 'English (B.Ed. pedagogy subject)'],
    languages: ['English', 'Hindi', 'Nepali', 'Maithili'],
    cv: '',
    availability: 'May 2027',
    eligibility: 'CTET Paper II applied · Examination expected 12–13 December 2026',
    location: 'Noida, India',
    workPreferences: 'Open to relocation anywhere in India',
    targetClasses: 'Classes 6–10 (TGT) · Classes 11–12 (PGT History post-M.A. 2027)',
    targetBoards: 'Boards of interest: CBSE, ICSE, Cambridge and IB',
  },
  about: 'My interest in History grew from memorising events to asking why they happened, how we know, and what they mean to different people. Studying historical sources and accounts of Partition shaped my commitment to teach through evidence, inquiry and multiple perspectives.',
  preparation: 'Five years of UPSC preparation strengthened my engagement with Indian polity, governance and public affairs. I now bring that wider humanities perspective to teacher education and classroom practice.',
  qualifications: [
    {title:'B.Ed.',place:'Amity Institute of Education, Amity University, Noida',period:'2025–Present',status:'In progress',expected:'2027',note:'Final examinations expected in April 2027 · Pedagogy subjects: Social Science / History & English'},
    {title:'M.A. History',place:'Indira Gandhi National Open University (IGNOU)',period:'2025–Present',status:'In progress',expected:'2027',note:'First year completed and cleared · Final examinations expected in June 2027'},
    {title:'B.A. History & Economics',place:'Gurukul Kangri Vishwavidyalaya · CGPA 8.80',period:'2018–2021',status:'Completed'},
    {title:'Class XII · CBSE',place:'CRBVM Senior Secondary School · 89%',period:'2017',status:'Completed'},
    {title:'Class X',place:"Little Angels’ School, Nepal · 87.75%",period:'2014',status:'Completed'},
  ],
  experiences: [
    {
      id:'panchsheel',
      title:'School Internship · Panchsheel Balak Inter-College',
      institution:'Panchsheel Balak Inter-College',
      type:'Sixteen-week B.Ed. school internship',
      period:'16 July–31 October 2026',
      status:'Ongoing',
      category:'Teaching',
      duration:'16',
      durationUnit:'Weeks',
      summary:'Supervised B.Ed. school internship with classroom teaching across Social Science, English and History.',
      points:[
        'Undertaking a 16-week school internship: teaching Social Science in Classes 6–9 and History in Class 11 on select occasions.',
        'Teaching English in Classes 6 and 8 as an official B.Ed. pedagogy subject.',
        'Assigned classes from Tuesday through Saturday; frequently handling substitution classes.',
        'Delivered at least 15 lessons using self-prepared lesson plans.',
        'Assisted in organising school events, display boards, Independence Day, Janmashtami and Sports Day activities.'
      ]
    },
    {
      id:'pehchaan',
      institution:'Pehchaan The Street School',
      status:'Completed',
      category:'Teaching',
      duration:'5',
      durationUnit:'Weeks',
      summary:'80 hours foundational kindergarten teaching & 50 hours ULLAS adult literacy field practice (Course EDCW100).',
      title:'NTCC Internship · Pehchaan The Street School & ULLAS Adult Literacy',
      type:'Five-week community teaching & adult literacy internship',
      period:'1 June–6 July 2026',
      points:[
        'Completed 80 verified hours teaching foundational literacy and numeracy to Nursery, LKG and UKG learners (ages 4–6) at Pehchaan The Street School in Morna Village, Sector 35, Noida.',
        'Conducted 50 hours of adult literacy and critical life-skills instruction for five community workers (security guards and sanitation cleaners) under the Government of India ULLAS / NILP initiative.',
        'Designed and administered a 40-mark UKG diagnostic assessment test alongside multi-sensory tracing sheets, Maths Market real-world currency simulations, and Mystery Bag vocabulary games.',
        'Authored and submitted a 27-page academic NTCC report (EDCW100) under Faculty Guide Dr. Neetu Mishra Shukla and Founder Akash Tandon, verified with a 6% Turnitin score.'
      ]
    },
    {
      id:'observation',
      institution:'Amity International School, Mayur Vihar',
      status:'Completed',
      category:'Observation',
      duration:'5',
      durationUnit:'Days',
      summary:'Observation of Social Science and History classrooms across Classes 6–12.',
      title:'Observation Internship · Amity International School, Mayur Vihar',
      type:'Five-day school observation',
      period:'24–28 November 2025',
      points:[
        'Observed Social Science and History lessons in Classes 6–12.',
        'Observed school assemblies, morning events and a student-organised PCOS/PCOD awareness programme.',
        'Studied classroom questioning, student engagement and management practices.',
        'Connected teacher-education theory with daily classroom practice.'
      ]
    },
  ],
  practice:[
    {number:'01',title:'Inquiry before recall',text:'I want learners to explain ideas and give reasons. My Democracy plan begins with prior-knowledge questions and includes discussion of elections and protest.'},
    {number:'02',title:'Different routes, shared depth',text:'I aim to support different starting points. The published plan combines a concept diagram, photographs, discussion and written responses; targeted adaptations are a next area to document.'},
    {number:'03',title:'Assessment that changes teaching',text:'I plan checks before, during and after explanation. The Democracy plan includes diagnostic questions, guided practice and an independent task; collecting responses will help me evaluate these choices.'},
  ],
  competencies:['Lesson planning','Historical source analysis','Formative assessment','Differentiated instruction','Classroom management','Google Gemini & AI in Education','Canva & visual TLM','Microsoft Office','Online classroom tools'],
  certificates:[
    {title:'Bachelor of Arts',image:storage+'1787898353874_955zgr_certWall1_0.jpeg',issuer:'Gurukula Kangri (Deemed to be University)',date:'Awarded 2021 · Issued 26 December 2022',category:'Academic',description:'Degree certificate recording a Bachelor of Arts awarded in 2021 and a CGPA of 8.80.'},
    {title:'Teaching internship · 80 hours',image:storage+'1787898375320_kx4r62_certWall2_0.jpeg',issuer:'Pehchaan The Street School',date:'6 July 2026',category:'Teaching',description:'Certificate of completion as an on-ground intern / teacher (80 hours).'},
    {title:'Youth as Catalyst in Strengthening Women Safety',image:storage+'1787898492438_n15fxx_certWall3_0.jpeg',issuer:'Pink Shakti Women Safety App',date:'26 November 2025',category:'Professional learning',description:'Participation in the national webinar on women’s safety (Participant).'},
    {title:'Rootedness in India: NEP 2020 & teacher education',image:storage+'1787898560665_nhlr6b_certWall4_0.jpeg',issuer:'Amity Institute of Education · Sponsored by GAIL (India) Limited',date:'10 March 2026',category:'Presentation',description:'Co-author and presenter on “Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education”.'},
    ...suppliedCertificates,
  ],
  resources:[
    {
      id:'390973e2-2b0c-43e1-a84d-3557cb60f18f',
      title:'Democracy · Lesson Plan No. 6',
      category:'Lesson plan',
      subject:'Social Science',
      grade:'Class IX-B',
      date:'25 July 2026',
      description:'A 40-minute school-practicum plan covering democratic government, elections and citizen participation through questioning, visuals, discussion and written practice.',
      url:'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/redesign/24c7a756-be36-4fd8-9462-6ee980c54736.pdf',
      thumbnail:'assets/democracy-plan-preview.webp',
      type:'Lesson plan (PDF · 6 pages)',
      duration:'40 minutes',
      evidenceStatus:'Planning evidence',
      context:'Amity University school practicum · Session 2026–27'
    },
    {
      id:'mock-election-evm-activity-guide',
      title:'Mock Election Classroom Activity · EVM Simulation Guide',
      category:'Classroom activity & TLM',
      subject:'Social Science (Civics)',
      grade:'Class 8',
      date:'August 2026',
      description:'A structured 4-stage experiential learning guide for conducting classroom mock elections using an Electronic Voting Machine (EVM) simulation: nomination, campaigning, secret balloting, and democratic counting in action.',
      url:'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/redesign/mock-election-evm-activity.pdf',
      thumbnail:'assets/mock-election-evm-activity.webp',
      type:'Activity guide (Infographic & EVM guide)',
      duration:'2 periods (80 minutes)',
      evidenceStatus:'Classroom TLM',
      context:'Panchsheel Balak Inter-College · Class 8 Civics practicum'
    },
    {
      id:'mock-election-class8-announcement',
      title:'Class 8 Mock Election Announcement & Display Poster',
      category:'Classroom display & TLM',
      subject:'Social Science (Civics)',
      grade:'Class 8',
      date:'August 2026',
      description:'Official classroom display board poster designed for school notice boards, introducing Class 8 students to candidate nominations, franchise rights, and democratic participation.',
      url:'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/redesign/mock-election-class8-poster.pdf',
      thumbnail:'assets/mock-election-class8-poster.webp',
      type:'Display poster (Classroom TLM)',
      duration:'Display TLM',
      evidenceStatus:'Classroom TLM',
      context:'Panchsheel Balak Inter-College · Display board'
    },
    {
      id:'notice-writing-english-pedagogy',
      title:'Notice Writing · English Pedagogy & Formative Error Analysis',
      category:'Teaching material',
      subject:'English (B.Ed. Pedagogy)',
      grade:'Classes 6 & 8',
      date:'September 2026',
      description:'An 11-slide instructional unit for secondary English teaching, combining formal notice layout, uncorrected student draft analysis with targeted teacher annotations, and an exemplar writing model.',
      url:'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/redesign/notice-writing-english-pedagogy.pdf',
      thumbnail:'assets/notice-writing-preview.webp',
      type:'Instructional slides (PDF · 11 slides)',
      duration:'40 minutes',
      evidenceStatus:'Classroom TLM',
      context:'Panchsheel Balak Inter-College · B.Ed. English practicum'
    },
    {
      id:'ukg-diagnostic-assessment',
      title:'UKG Diagnostic Assessment & Foundational Skills Evaluation Sheet',
      category:'Assessment',
      subject:'Foundational Literacy & Numeracy (FLN)',
      grade:'Nursery, LKG & UKG (Ages 4–6)',
      date:'June–July 2026',
      description:'Authentic 40-mark diagnostic test instrument (Annexure 2 of NTCC report) administered to kindergarten learners at Pehchaan The Street School. Features English/Hindi alphabet missing letters, counting & shape identification, picture words, and single-digit addition and subtraction.',
      url:storage+'ukg-assessment-test.pdf',
      thumbnail:'assets/ukg-assessment-preview.webp',
      type:'Diagnostic assessment test (PDF)',
      duration:'40 marks assessment',
      evidenceStatus:'Field assessment tool',
      context:'Pehchaan The Street School · Morna Village, Sector 35, Noida'
    },
    ...suppliedResources,
  ],
  gallery: suppliedGallery,
};

// Merge missing fields only. Known pre-v6 records receive narrowly scoped corrections;
// explicit owner edits and empty collections remain authoritative.
export function mergeContent(live = {}) {
  if (!live || typeof live !== 'object' || Array.isArray(live)) live = {};
  live = {...live};
  for (const [key, value] of Object.entries(defaultContent)) {
    if (Array.isArray(value) && !Array.isArray(live[key])) delete live[key];
    if (typeof value === 'string' && typeof live[key] !== 'string') delete live[key];
  }
  if (!live.profile || typeof live.profile !== 'object' || Array.isArray(live.profile)) delete live.profile;
  if (live.profile) {
    live.profile = {...live.profile};
    for (const [key, value] of Object.entries(defaultContent.profile)) {
      if ((Array.isArray(value) && !Array.isArray(live.profile[key])) || (typeof value === 'string' && typeof live.profile[key] !== 'string')) delete live.profile[key];
    }
  }
  const result={...structuredClone(defaultContent),...live,profile:{...defaultContent.profile,...live.profile}};
  const older=(live.schemaVersion||0)<6;
  if(older) {
    const legacy={
      eyebrow:['History & Social Science · Emerging educator','History educator · Social Science · Emerging educator'],
      summary:['A developing History and Social Science educator with academic foundations in History and Economics, teacher-education experience, and practical classroom exposure.'],
      eligibility:['CTET applied · Exam postponed','CTET applied · Paper II examination tentatively expected on 9 October 2026'],
      workPreferences:['Open to relocation anywhere'],
      location:['Noida'],targetClasses:['Classes 6–12'],targetBoards:['CBSE, ICSE, Cambridge and IB']
    };
    for(const [key,values] of Object.entries(legacy))if(values.includes(result.profile[key]))result.profile[key]=defaultContent.profile[key];
    if(JSON.stringify(result.profile.roles)===JSON.stringify(['TGT History / Social Science','PGT History']))result.profile.roles=structuredClone(defaultContent.profile.roles);
  }
  result.experiences=result.experiences.map(e=>{
    const id=e.id||(/panchsheel/i.test(e.title)?'panchsheel':/pehchaan/i.test(e.title)?'pehchaan':/amity.*mayur/i.test(e.title)?'observation':e.title);
    const original=defaultContent.experiences.find(x=>x.id===id);
    const merged={...original,...e,id};
    if(older && id==='observation' && e.period==='May 2026')Object.assign(merged,{period:original.period,type:original.type,duration:original.duration,durationUnit:original.durationUnit});
    if(older && id==='panchsheel' && e.period==='Ongoing') {
      Object.assign(merged,{period:original.period,type:original.type,summary:original.summary});
      if(e.points?.length===1 && e.points[0]==='Undertaking a 16-week school internship at Panchsheel Balak Inter-College.')merged.points=structuredClone(original.points);
    }
    return merged;
  });
  if(!live.schemaVersion && Array.isArray(live.experiences) && result.experiences.length===2 && ['pehchaan','observation'].every(id=>result.experiences.some(e=>e.id===id)))result.experiences.unshift(structuredClone(defaultContent.experiences[0]));
  if(Array.isArray(live.certificates))result.certificates=live.certificates.map(c=>{
    const original=defaultContent.certificates.find(x=>x.image===c.image);
    const legacy=['Graduation certificate','Pehchaan internship certificate','Webinar certificate','Seminar participation certificate'];
    return {...original,...c,...(original&&legacy.includes(c.title)?{title:original.title}:{}),...(older&&/Rusha Chaudhauri|in History and Economics/.test(c.description||'')?{description:original?.description||c.description}:{})};
  });
  if(Array.isArray(live.resources))result.resources=live.resources.map(r=>{
    const original=defaultContent.resources.find(x=>x.url===r.url);
    if(!original)return r;
    const merged={...original,...r};
    if(older) {
      if(['Democracy','Teaching Democracy: More Than a Definition'].includes(r.title))merged.title=original.title;
      if(!r.grade||r.grade==='Classes 6–8 (Middle School)')merged.grade=original.grade;
      if(!r.subject||r.subject==='Social Science / History')merged.subject=original.subject;
      if(!r.description||r.description.startsWith('Structured inquiry lesson plan'))merged.description=original.description;
      if(r.thumbnail==='assets/democracy-thumb.webp')merged.thumbnail=original.thumbnail;
    }
    return merged;
  });

  else if(live.schemaVersion)result.resources=[];
  if(Array.isArray(live.qualifications))result.qualifications=live.qualifications.map(q=>{
    const original=defaultContent.qualifications.find(x=>x.title===q.title);
    return {...original,...q,...(!live.schemaVersion&&q.title==='M.A. History'?{place:original.place,note:'First year cleared · Final examinations expected in June 2027'}:{})};
  });
  if(!live.schemaVersion&&live.qualifications?.length===4&&!live.qualifications.some(q=>q.title==='Class X'))result.qualifications.push(structuredClone(defaultContent.qualifications[4]));
  if(older && Array.isArray(live.practice))result.practice=live.practice.map(p=>{
    const original=defaultContent.practice.find(x=>x.title===p.title);
    return original && /^(I begin with a question, source|Scaffolded prompts, visual sources|Short checks, source-based tasks)/.test(p.text)?{...p,text:original.text}:p;
  });
  if ((live.schemaVersion || 0) < 7) {
    for (const [key, additions] of Object.entries({certificates:suppliedCertificates, gallery:suppliedGallery, resources:suppliedResources})) {
      const rows = result[key];
      if (key === 'resources' && live.schemaVersion && !Array.isArray(live.resources)) continue;
      if (Array.isArray(live[key]) && live[key].length === 0) continue;
      for (const item of additions) if (!rows.some(row => row.id === item.id || row.image === item.image && item.image || row.url === item.url && item.url)) rows.push(structuredClone(item));
    }
    result.schemaVersion = 7;
  }
  return result;
}

export function validateContent(c) {
  if(!c || typeof c!=='object' || !c.profile || !String(c.profile.name||'').trim()) throw new Error('A profile name is required.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.profile.email||'')) throw new Error('Enter a valid contact email.');
  for(const key of ['qualifications','experiences','practice','certificates','resources','gallery','competencies']) if(!Array.isArray(c[key])) throw new Error(`${key} must be a list.`);
  for(const key of ['roles','subjects','languages']) if(!Array.isArray(c.profile[key]) || !c.profile[key].every(x=>typeof x==='string')) throw new Error(`${key} must be a list of text.`);
  for(const key of ['location','workPreferences','targetClasses','targetBoards','eligibility','availability']) if(c.profile[key]!==undefined && (typeof c.profile[key]!=='string'||c.profile[key].length>1000)) throw new Error(`${key} must be text of at most 1000 characters.`);
  for(const key of ['portrait','cv']) if(c.profile[key] && !/^https:\/\//i.test(c.profile[key])) throw new Error(`${key} must use HTTPS.`);
  for(const e of c.experiences) if(!e?.title?.trim() || !Array.isArray(e.points) || !e.points.every(x=>typeof x==='string')) throw new Error('Each experience needs a title and activity list.');
  for(const e of c.experiences) for(const key of ['institution','status','category','duration','durationUnit','summary']) if(e[key]!==undefined && (typeof e[key]!=='string'||e[key].length>1000)) throw new Error(`Experience ${key} must be text of at most 1000 characters.`);
  for(const q of c.qualifications) if(!q?.title?.trim() || !q?.status?.trim()) throw new Error('Each qualification needs a title and status.');
  for(const p of c.practice) if(!p?.title?.trim() || typeof p.text!=='string') throw new Error('Each teaching principle needs a title and description.');
  if(!c.competencies.every(x=>typeof x==='string')) throw new Error('Skills must be text.');
  if(JSON.stringify(c).length>500000) throw new Error('Content is too large. Upload files separately.');
  for(const x of [...c.certificates,...c.resources,...c.gallery]) {
    if(!x.title?.trim()) throw new Error('Each file or image needs a title.');
    const url=x.url||x.image;
    if(!url || !/^https:\/\//i.test(url)) throw new Error('Each file or image needs an HTTPS link.');
  }
  return c;
}
