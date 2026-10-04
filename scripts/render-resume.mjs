import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import {defaultContent,publicContent} from '../src/content.js';
const root=path.resolve(import.meta.dirname,'..');
// The PDF is a concise single page. The web résumé retains the complete record.
export async function generateResume(c=defaultContent){
 c=publicContent(c);
 const stamp=new Date('2026-10-04T00:00:00Z');
 const doc=new PDFDocument({size:'A4',margin:36,bufferPages:true,info:{Title:c.profile.name+' — Teaching Résumé',Author:c.profile.name,CreationDate:stamp,ModDate:stamp}});
 const output=fs.createWriteStream(path.join(root,'assets/krishna-mahato-resume.pdf'));doc.pipe(output);
 const plain=s=>String(s??'').replace(/[–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"');
 const ink='#17313d',muted='#52646c';
 const draw=(value,x,y,width,size=9,face='Helvetica',color=ink)=>{doc.font(face).fontSize(size).fillColor(color).text(plain(value),x,y,{width,lineGap:1.5});return doc.y;};
 draw(c.profile.name,36,32,520,23,'Helvetica-Bold');
 draw('History & Social Science Educator',36,62,520,11);
 draw(c.profile.location+' | '+c.profile.email,36,82,520,9,'Helvetica',muted);
 doc.fontSize(8.5).text('krishnamahato704-spec.github.io/E-portfolio/',36,99,{link:'https://krishnamahato704-spec.github.io/E-portfolio/'});
 doc.strokeColor('#c7a96b').lineWidth(1).moveTo(36,120).lineTo(559,120).stroke();
 const left={x:36,width:205,y:136},right={x:269,width:290,y:136};
 const text=(col,value,size=9,face='Helvetica',color=ink)=>{col.y=draw(value,col.x,col.y,col.width,size,face,color)+2;};
 const section=(col,label)=>{col.y+=7;text(col,label.toUpperCase(),9.5,'Helvetica-Bold','#854a2b');doc.strokeColor('#dddcd6').lineWidth(.5).moveTo(col.x,col.y).lineTo(col.x+col.width,col.y).stroke();col.y+=7;};
 section(left,'Professional profile');text(left,c.profile.summary,9);
 text(left,'Available: '+c.profile.availability,9,'Helvetica-Bold');text(left,c.profile.workPreferences,8.8);
 text(left,c.profile.eligibility,8.5,'Helvetica',muted);
 section(left,'Education');
 for(const q of c.qualifications){text(left,q.title,9.2,'Helvetica-Bold');text(left,q.place,8.7);text(left,q.period+' | '+q.status,8.2,'Helvetica',muted);if(q.note)text(left,q.note,8.2,'Helvetica',muted);left.y+=3;}
 section(left,'Roles of interest');for(const role of c.profile.roles)text(left,role,8.7);text(left,'Boards of interest: '+c.profile.targetBoards,8.2,'Helvetica',muted);
 section(left,'Skills & languages');text(left,c.competencies.join(' · '),8.5);text(left,c.profile.languages.join(' · '),8.5);
 section(right,'Teaching & observation experience');
 for(const e of c.experiences){
  text(right,e.institution||e.title,10,'Helvetica-Bold');text(right,e.type+' | '+e.period+' | '+e.status,8.4,'Helvetica',muted);
  const points=e.id==='panchsheel'?(e.points||[]).filter((_,i)=>[0,1,3].includes(i)):(e.points||[]).slice(0,3);
  for(const point of points)text(right,'• '+point,8.8);right.y+=6;
 }
 section(right,'Selected teaching evidence');
 for(const resource of c.resources.filter(x=>x.category==='Lesson plan'||x.id==='ntcc-community-report').slice(0,2)){
  text(right,resource.title,9.1,'Helvetica-Bold');text(right,[resource.grade,resource.date,resource.evidenceStatus].filter(Boolean).join(' | '),8.2,'Helvetica',muted);
 }
 section(right,'Selected credentials');
 const credentials=[c.certificates.find(x=>x.id==='gemini-badge'),c.certificates.find(x=>x.id==='nptel-writing'),c.certificates.find(x=>x.category==='Presentation')].filter(Boolean);
 for(const cert of credentials){text(right,cert.title,9,'Helvetica-Bold');text(right,cert.issuer+' | '+cert.date,8.2,'Helvetica',muted);right.y+=2;}
 // Fail the build instead of silently producing a second page or clipped résumé.
 if(doc.bufferedPageRange().count!==1||Math.max(left.y,right.y)>787){doc.end();throw Error('Résumé exceeds one page: left '+left.y+', right '+right.y+'. Review concise content before publishing.');}
 doc.end();await new Promise((resolve,reject)=>{output.on('finish',resolve);output.on('error',reject);});
 console.log('Generated one-page résumé from shared portfolio content.');
}
