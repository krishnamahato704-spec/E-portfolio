import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultContent as content} from '../src/content.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function generateResume(c=content) {
 const stamp=new Date('2026-09-17T00:00:00Z');
 const doc=new PDFDocument({size:'A4',margin:38,info:{Title:'Krishna Mahato - Teaching Resume',Author:c.profile.name,CreationDate:stamp,ModDate:stamp}});
 const output=fs.createWriteStream(path.join(root,'assets/krishna-mahato-resume.pdf'));doc.pipe(output);
 const ink='#202a2e',muted='#525b5f',accent='#8a2b2b';
 const plain=s=>String(s??'').replace(/[–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"');
 const text=(value,size=9.2,face='Helvetica',color=ink)=>doc.font(face).fontSize(size).fillColor(color).text(plain(value),{lineGap:1.5});
 const section=title=>{doc.moveDown(.35);text(title.toUpperCase(),10,'Helvetica-Bold',accent);doc.moveDown(.1);const y=doc.y;doc.strokeColor('#c8c2b8').lineWidth(.6).moveTo(38,y).lineTo(557,y).stroke();doc.moveDown(.2);};
 text(c.profile.name.toUpperCase(),22,'Helvetica-Bold');
 text('Developing History, Social Science & English educator',11,'Helvetica',accent);
 doc.moveDown(.25);text(`${c.profile.location} | ${c.profile.email}`,9,'Helvetica',muted);
 doc.fontSize(8.5).text('krishnamahato704-spec.github.io/E-portfolio/',{link:'https://krishnamahato704-spec.github.io/E-portfolio/'});
 section('Profile and role interests');
 text(c.profile.summary);doc.moveDown(.2);
 text('Roles of interest: '+c.profile.roles.join(' | '));
 text('Availability: '+c.profile.availability+' | '+c.profile.workPreferences);
 text(c.profile.eligibility);text(c.profile.targetBoards);
 section('Education');
 for(const q of c.qualifications){
  text(`${q.title} | ${q.status} | ${q.period}`,9.5,'Helvetica-Bold');
  text(q.place,9);if(q.note)text(q.note,8.5,'Helvetica',muted);
  if(q.expected&&!/expected/i.test(q.note||''))text('Expected completion: '+q.expected,8.5,'Helvetica',muted);
  doc.moveDown(.2);
 }
 section('Teaching and observation experience');
 for(const e of c.experiences){
  text(e.institution||e.title,10,'Helvetica-Bold');
  text(`${e.type} | ${e.period} | ${e.status}`,8.5,'Helvetica',muted);
  for(const item of e.points)text('• '+item,8.5);
  doc.moveDown(.25);
 }
 section('Selected teaching evidence');
 const lesson=c.resources.find(r=>r.id==='democracy-lesson-plan'||/24c7a756/.test(r.url));
 if(lesson)text(`${lesson.title} | ${lesson.grade} | ${lesson.date}. Six-page Social Science plan with diagnostic questioning, visual resources, guided practice and an independent assessment task. Completed student work and reflection are not included.`,8.5);
 section('Professional learning');
 for(const cert of c.certificates.filter(x=>['Presentation','Professional learning'].includes(x.category))){text(`${cert.title} | ${cert.date}`,9,'Helvetica-Bold');text(cert.description,8.5);}
 section('Skills and languages');
 text(c.competencies.join(' · '),8.5);text('Languages: '+c.profile.languages.join(' · '),8.5);
 doc.end();await new Promise((resolve,reject)=>{output.on('finish',resolve);output.on('error',reject);});
 console.log('Generated résumé from the shared portfolio content.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateResume();
