import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultContent,publicContent} from '../src/content.js';
import {sourceDate} from './load-published-content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function generateResume(c=defaultContent,{updatedAt=sourceDate()}={}) {
 const stamp=new Date(process.env.SOURCE_DATE_EPOCH?Number(process.env.SOURCE_DATE_EPOCH)*1000:updatedAt);
 if(!Number.isFinite(stamp.getTime()))throw Error('Invalid résumé source date');
 const doc=new PDFDocument({size:'A4',margin:38,info:{Title:'Krishna Mahato - TGT Social Science / History Resume',Author:c.profile.name,CreationDate:stamp,ModDate:stamp}});
 let pageCount=1;doc.on('pageAdded',()=>pageCount++);
 const output=fs.createWriteStream(path.join(root,'assets/krishna-mahato-resume.pdf'));doc.pipe(output);
 const finished=new Promise((resolve,reject)=>{output.on('finish',resolve);output.on('error',reject);doc.on('error',reject);});
 const ink='#202a2e',muted='#525b5f',accent='#76542c';
 const plain=s=>String(s??'').replace(/[–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"');
 const text=(value,size=9.2,face='Helvetica',color=ink)=>doc.font(face).fontSize(size).fillColor(color).text(plain(value),{lineGap:1.5});
 const section=title=>{doc.moveDown(.5);text(title.toUpperCase(),10,'Helvetica-Bold',accent);doc.moveDown(.12);const y=doc.y;doc.strokeColor('#c8c2b8').lineWidth(.6).moveTo(38,y).lineTo(557,y).stroke();doc.moveDown(.3);};
 text(c.profile.name.toUpperCase(),22,'Helvetica-Bold');
 text('History & Social Science Educator | B.Ed. Candidate',11,'Helvetica',accent);
 doc.moveDown(.4);text(`${c.profile.location} | ${c.profile.email}`,9,'Helvetica',muted);
 doc.fontSize(9).text('krishnamahato704-spec.github.io/E-portfolio/',{link:'https://krishnamahato704-spec.github.io/E-portfolio/'});
 section('Profile and availability');
 text(c.profile.summary);
 text(`Available ${c.profile.availability} | ${c.profile.workPreferences}`,9);
 text(c.profile.eligibility,8.5);
 section('Education');
 for(const q of c.qualifications.filter(q=>!/Class X/.test(q.title)).slice(0,3)){
  text(`${q.title} | ${q.status} | ${q.period}`,9.5,'Helvetica-Bold');text(q.place,9);
  if(q.note)text(q.note,8.5,'Helvetica',muted);
  else if(q.expected)text('Expected completion: '+q.expected,8.5,'Helvetica',muted);
  doc.moveDown(.2);
 }
 section('Teaching experience');
 for(const e of c.experiences.filter(e=>['panchsheel','pehchaan'].includes(e.id))){
  text(e.institution||e.title,10,'Helvetica-Bold');
  text(`${e.type} | ${e.period} | ${e.status}`,8.5,'Helvetica',muted);
  const selected=e.id==='panchsheel'?[e.points[0],e.points[1],e.points.find(p=>/15 lessons/.test(p))]:[e.points[0],e.points.find(p=>/ULLAS/.test(p))];
  for(const item of selected.filter(Boolean))text('• '+item,9);
  if(e.id==='pehchaan'&&c.certificates.some(x=>/80 hours/.test(x.title)))text('• Completion certificate records 80 hours of teaching internship.',9);
  doc.moveDown(.3);
 }
 section('Selected teaching evidence');
 const lesson=c.resources.find(r=>/Democracy/.test(r.title));
 if(lesson)text(`${lesson.title} | ${lesson.grade} | ${lesson.date}. Diagnostic questioning, visual resources, discussion and written practice. Planning evidence; assessed learner outcomes are not published.`,9);
 section('Selected professional learning');
 for(const id of ['nptel-writing','diksha-ai']){
  const cert=publicContent(c).certificates.find(x=>x.id===id);
  if(cert)text(`${cert.title} | ${cert.issuer} | ${cert.date}`,8.5);
 }
 section('Skills and languages');
 text(c.competencies.join(' · '),9);text('Languages: '+c.profile.languages.join(' · '),9);
 doc.end();await finished;
 if(pageCount!==1)throw Error(`Recruiter résumé exceeded one page (${pageCount}). Reduce selected content before publishing.`);
 console.log('Generated a one-page résumé from the release content.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateResume();
