const storage = 'https://oyqevsygintkjrkfbzpx.supabase.co/storage/v1/object/public/portfolio-media/evidence/images/';
export const defaultContent = {
  profile: {
    name: 'Krishna Mahato', email: 'krishnamahato704@gmail.com',
    eyebrow: 'History & Social Science · Emerging educator',
    headline: 'I help students read the past with curiosity, evidence and confidence.',
    summary: 'A developing History and Social Science educator with academic foundations in History and Economics, teacher-education experience, and practical classroom exposure.',
    portrait: storage + '1787826897958_3tk4ud_portrait.jpeg',
    roles: ['TGT History / Social Science', 'PGT History'],
    subjects: ['History', 'Social Science', 'Economics', 'English'],
    languages: ['English', 'Hindi', 'Nepali', 'Maithili'],
    cv: '', availability: 'May 2027', eligibility: 'CTET applied',
  },
  about: 'My interest in History grew from memorising events to asking why they happened, how we know, and what they mean to different people. Studying historical sources and accounts of Partition shaped my wish to teach the subject through evidence and inquiry.',
  preparation: 'Five years of UPSC preparation strengthened my engagement with Indian polity, governance and public affairs. I now bring that wider humanities perspective to teacher education and classroom practice.',
  qualifications: [
    {title:'B.Ed.',place:'Amity Institute of Education, Amity University, Noida',period:'2025–Present',status:'In progress',expected:'2027'},
    {title:'M.A. History',place:'Indira Gandhi National Open University (IGNOU)',period:'2025–Present',status:'In progress',expected:'2027',note:'First year cleared'},
    {title:'B.A. History & Economics',place:'Gurukul Kangri Vishwavidyalaya · CGPA 8.80',period:'2018–2021',status:'Completed'},
    {title:'Class XII · CBSE',place:'CRBVM Senior Secondary School · 89%',period:'2017',status:'Completed'},
    {title:'Class X',place:"Little Angels’ School · 87.75%",period:'2014',status:'Completed'},
  ],
  experiences: [
    {id:'pehchaan',title:'NTCC Internship · Pehchaan The Street School',type:'Five-week teaching internship',period:'1 June – 6 July 2026',points:['Taught foundational literacy and numeracy to Nursery, LKG and UKG learners.','Used competency-based and activity-based methods.','Conducted ULLAS adult-literacy sessions for five learners.','Strengthened classroom-management and community-engagement practice.']},
    {id:'observation',title:'Observation Internship · Amity International School, Mayur Vihar',type:'One-week school observation',period:'May 2026',points:['Observed History and Social Science lessons across classrooms.','Studied questioning, student engagement and classroom-management strategies.','Connected teacher-education theory with daily classroom practice.']},
  ],
  practice:[
    {number:'01',title:'Inquiry before recall',text:'I begin with a question, source or puzzle so that dates and events become evidence in an explanation—not isolated facts.'},
    {number:'02',title:'Different routes, shared depth',text:'Scaffolded prompts, visual sources, discussion and deeper comparison help learners reach the same meaningful understanding.'},
    {number:'03',title:'Assessment that changes teaching',text:'Short checks, source-based tasks and specific feedback reveal what learners understand and what the next lesson must address.'},
  ],
  competencies:['Historical thinking','Source analysis','Lesson planning','Question design','Differentiated support','Formative assessment','Classroom management','Canva','MS Office','Online Classroom'],
  certificates:[
    {title:'Bachelor of Arts',image:storage+'1787898353874_955zgr_certWall1_0.jpeg',issuer:'Gurukula Kangri (Deemed to be University)',date:'Awarded 2021 · Issued 26 December 2022',category:'Academic',description:'Degree certificate recording a CGPA of 8.80.'},
    {title:'Teaching internship · 80 hours',image:storage+'1787898375320_kx4r62_certWall2_0.jpeg',issuer:'Pehchaan The Street School',date:'6 July 2026',category:'Teaching',description:'Certificate of completion as an on-ground intern / teacher.'},
    {title:'Youth as Catalyst in Strengthening Women Safety',image:storage+'1787898492438_n15fxx_certWall3_0.jpeg',issuer:'Pink Shakti Women Safety App',date:'26 November 2025',category:'Professional learning',description:'Participation in the national webinar on women’s safety.'},
    {title:'Rootedness in India: NEP 2020 & teacher education',image:storage+'1787898560665_nhlr6b_certWall4_0.jpeg',issuer:'Amity Institute of Education · Sponsored by GAIL (India) Limited',date:'10 March 2026',category:'Presentation',description:'Co-author and presenter of “Rootedness in India: An analysis of NEP 2020 in Promoting IKS in Teacher Education”.'},
  ],
  resources:[], gallery:[],
};

// Older public rows lack some metadata. Enrich matching entries without replacing
// new owner edits or reintroducing an explicitly emptied collection.
export function mergeContent(live = {}) {
  const result={...structuredClone(defaultContent),...live,profile:{...defaultContent.profile,...live.profile}};
  result.experiences=result.experiences.map(e=>({...e,id:e.id||(/pehchaan/i.test(e.title)?'pehchaan':/amity.*mayur/i.test(e.title)?'observation':e.title)}));
  if(!live.schemaVersion && result.profile.eyebrow==='History educator · Social Science · Emerging educator') result.profile.eyebrow=defaultContent.profile.eyebrow;
  if(Array.isArray(live.certificates)) result.certificates=live.certificates.map(c=>{
    const original=defaultContent.certificates.find(x=>x.image===c.image);
    const legacy=['Graduation certificate','Pehchaan internship certificate','Webinar certificate','Seminar participation certificate'];
    return {...original,...c,...(original && legacy.includes(c.title)?{title:original.title}:{})};
  });
  if(Array.isArray(live.qualifications)) {
    result.qualifications=live.qualifications.map(q=>({...defaultContent.qualifications.find(x=>x.title===q.title),...q,...(!live.schemaVersion&&q.title==='M.A. History'&&q.place==='Postgraduate study in History'?{place:defaultContent.qualifications[1].place,note:'First year cleared'}:{})}));
    if(!live.schemaVersion && live.qualifications.length===4 && !live.qualifications.some(q=>q.title==='Class X')) result.qualifications.push(structuredClone(defaultContent.qualifications[4]));
  }
  return result;
}

export function validateContent(c) {
  if(!c || typeof c!=='object' || !c.profile || !String(c.profile.name||'').trim()) throw new Error('A profile name is required.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.profile.email||'')) throw new Error('Enter a valid contact email.');
  for(const key of ['qualifications','experiences','practice','certificates','resources','gallery','competencies']) if(!Array.isArray(c[key])) throw new Error(`${key} must be a list.`);
  for(const key of ['roles','subjects','languages']) if(!Array.isArray(c.profile[key]) || !c.profile[key].every(x=>typeof x==='string')) throw new Error(`${key} must be a list of text.`);
  for(const key of ['portrait','cv']) if(c.profile[key] && !/^https:\/\//i.test(c.profile[key])) throw new Error(`${key} must use HTTPS.`);
  for(const e of c.experiences) if(!e?.title?.trim() || !Array.isArray(e.points) || !e.points.every(x=>typeof x==='string')) throw new Error('Each experience needs a title and activity list.');
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
