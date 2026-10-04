// Edited from the owner's 49-page observation journal; no year appears in the source.
export const amityJournalResource={
 id:'amity-observation-journal',experienceId:'observation',
 title:'Amity School Observation · Reflective Journal',category:'Reflective journal',
 subject:'Classroom observation and teacher education',grade:'Observed Classes VIII, IX, X and XII',
 date:'1–4 December',duration:'4 days',type:'PDF · 17 pages',
 context:'Amity International School, Mayur Vihar',
 description:'Edited journal with four daily records, original photographs, reflections and self-reflection. Rebuilt from the supplied handwritten journal; the source does not state a year.',
 evidenceStatus:'Reflective observation record',
 url:'https://krishnamahato704-spec.github.io/E-portfolio/assets/evidence/amity-observation-reflective-journal.pdf',
 thumbnail:'https://krishnamahato704-spec.github.io/E-portfolio/assets/evidence/amity-observation-reflective-journal.webp'
};
export const amityDays=[
 {date:'1 December',title:'Classroom routines and lesson approaches',text:'Observed Social Studies in Classes IX-D and VIII-B with Ms. Nitika, and a Class XII lesson on democracy, the legislature and judiciary with Ms. Priya. Visited the physics and chemistry labs, helped with carnival preparation and discussed observations with peers.',pages:'4–5'},
 {date:'2 December',title:'Examples, reading and practical work',text:'Observed Class X-C examination-answer guidance and a Class XII lesson on Kinship, Caste and Class with Ms. Sushmita. Helped students prepare awareness materials, visited both libraries and watched a biology lesson move from a presentation to microscope work.',pages:'6–7'},
 {date:'3 December',title:'Student activities and learning spaces',text:'Prepared a Roll the Dice carnival board with peers, watched the student-led PCOS/PCOD awareness programme and visited sports, computer, art and sculpture spaces. The notes also record the medical room and school care routines.',pages:'8–9'},
 {date:'4 December',title:'Guidance, assembly and school organisation',text:'Observed Class XII counselling and a student-led assembly, helped prepare noticeboards and visited the Atal Tinkering Lab. A school tour included the Cambridge English class, libraries and labs; the visit ended with coordinator feedback.',pages:'10–12'}
];
export function observationJournal(c){return c.resources.find(x=>x.id===amityJournalResource.id&&(!x.experienceId||x.experienceId==='observation'));}
