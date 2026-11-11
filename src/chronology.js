// Sort display copies, leaving the owner's saved content and status untouched.
const monthNumbers={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};

export function isCurrentRecord(record) {
 const status=String(record.status||'');
 if(/^completed$/i.test(status.trim()))return false;
 return /ongoing|current|in[ -]progress/i.test(status)||/\b(?:present|ongoing|current)\b/i.test(String(record.period||''));
}

function periodEnd(record) {
 const period=String(record.period||record.date||'');
 const years=[...period.matchAll(/\b(?:19|20)\d{2}\b/g)];
 if(!years.length)return 0;
 const lastYear=years.at(-1);
 const year=Number(lastYear[0]);
 // ISO dates retain their day; textual ranges use the final day and month.
 const iso=[...period.matchAll(/\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/g)].at(-1);
 if(iso&&Number(iso[1])===year)return year*10000+Number(iso[2])*100+Number(iso[3]);
 const beforeYear=period.slice(0,lastYear.index);
 const month=[...beforeYear.matchAll(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi)].at(-1);
 if(!month)return year*10000+1231;
 const day=beforeYear.slice(0,month.index).match(/(\d{1,2})\s*$/);
 return year*10000+monthNumbers[month[0].slice(0,3).toLowerCase()]*100+(day?Number(day[1]):31);
}

function newestFirst(records) {
 return [...records].sort((a,b)=>Number(isCurrentRecord(b))-Number(isCurrentRecord(a))
  ||periodEnd(b)-periodEnd(a)
  ||String(a.title||a.institution||a.id||'').localeCompare(String(b.title||b.institution||b.id||''),'en',{numeric:true}));
}

export const sortQualifications=qualifications=>newestFirst(qualifications);
export const sortExperiences=experiences=>newestFirst(experiences);
