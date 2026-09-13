import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 36, bottom: 36, left: 40, right: 40 },
  info: {
    Title: 'Krishna Mahato — Résumé',
    Author: 'Krishna Mahato',
    Subject: 'History, Social Science & English Teaching Résumé',
    Keywords: 'Krishna Mahato, History Teacher, Social Science, B.Ed., Resume, Educator',
  }
});

const outputPath = path.resolve('assets/krishna-mahato-resume.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const primary = '#202a2e';
const secondary = '#5a6265';
const accent = '#8a2b2b';
const lineRule = '#d5cebe';

// Helper functions
function drawSectionHeading(title) {
  doc.moveDown(0.4);
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor(accent).text(title.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.15);
  const y = doc.y;
  doc.strokeColor(lineRule).lineWidth(0.75).moveTo(40, y).lineTo(555, y).stroke();
  doc.moveDown(0.3);
}

// Header
doc.fontSize(22).font('Helvetica-Bold').fillColor(primary).text('KRISHNA MAHATO', { align: 'left' });
doc.fontSize(11).font('Helvetica').fillColor(accent).text('Developing History, Social Science & English Educator', { align: 'left' });
doc.moveDown(0.2);
doc.fontSize(8.5).font('Helvetica').fillColor(secondary).text(
  'Noida, India  ·  krishnamahato704@gmail.com  ·  Portfolio: https://krishnamahato704-spec.github.io/E-portfolio/',
  { align: 'left' }
);
doc.moveDown(0.3);

// Professional Profile
drawSectionHeading('Professional Profile & Target Roles');
doc.fontSize(9).font('Helvetica').fillColor(primary).text(
  'Developing educator academically grounded in History and Economics, with formal teacher education and supervised classroom experience. Open to initial recruitment discussions; available for interviews, school visits, and demonstration lessons from February 2027, and full-time joining from May 2027.',
  { lineGap: 2 }
);
doc.moveDown(0.2);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Target Roles: ', { continued: true })
  .font('Helvetica').text('TGT Social Science · TGT English (official B.Ed. pedagogy subject) · PGT History (post-M.A. completion in June 2027).');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Relocation & Boards: ', { continued: true })
  .font('Helvetica').text('Open to relocation anywhere in India · Boards of Interest: CBSE, ICSE, Cambridge and IB.');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Eligibility: ', { continued: true })
  .font('Helvetica').text('CTET Paper II applied (Examination tentatively expected on 9 October 2026).');

// Education
drawSectionHeading('Education');

function eduItem(title, institution, period, statusNote) {
  doc.fontSize(9).font('Helvetica-Bold').fillColor(primary).text(title, { continued: true })
    .font('Helvetica').fillColor(secondary).text(`  |  ${institution}`, { continued: true })
    .font('Helvetica-Bold').fillColor(accent).text(`  [${period}]`, { align: 'right' });
  if (statusNote) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(secondary).text(statusNote);
  }
  doc.moveDown(0.25);
}

eduItem('Bachelor of Education (B.Ed.)', 'Amity Institute of Education, Amity University, Noida', '2025–Present · In progress', 'Expected completion: April 2027. Official Pedagogy Subjects: Social Science / History & English.');
eduItem('Master of Arts in History (M.A.)', 'Indira Gandhi National Open University (IGNOU)', '2025–Present · In progress', 'Expected completion: June 2027. First year completed and cleared.');
eduItem('Bachelor of Arts (B.A. History & Economics)', 'Gurukul Kangri Vishwavidyalaya', '2018–2021 · Completed', 'Graduated with CGPA: 8.80 / 10.00.');
eduItem('Senior Secondary (Class XII · CBSE)', 'CRBVM Senior Secondary School', 'Completed 2017', 'Aggregate Score: 89.00%.');
eduItem('Secondary School (Class X)', 'Little Angels’ School, Nepal (Nepal Board of Secondary Education)', 'Completed 2014', 'Aggregate Score: 87.75%.');

// Supervised Teaching Experience
drawSectionHeading('Supervised Teaching & Classroom Experience');

function expBlock(role, org, dates, bullets) {
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primary).text(role, { continued: true })
    .font('Helvetica').fillColor(secondary).text(`  ·  ${org}`, { continued: true })
    .font('Helvetica-Bold').fillColor(accent).text(`  (${dates})`, { align: 'right' });
  doc.moveDown(0.15);
  for (const b of bullets) {
    doc.fontSize(8.5).font('Helvetica').fillColor(primary).text(`•  ${b}`, { indent: 8, lineGap: 1.5 });
  }
  doc.moveDown(0.3);
}

expBlock(
  'School Internship (16-Week B.Ed. Internship)',
  'Panchsheel Balak Inter-College',
  '16 July – 31 October 2026 · Ongoing',
  [
    'Taught Social Science in Classes 6–9 and History in Class 11 on select occasions.',
    'Taught English in Classes 6 and 8 as an official B.Ed. pedagogy subject.',
    'Assigned classes Tuesday through Saturday; frequently handled substitution classes.',
    'Delivered at least 15 lessons using self-prepared lesson plans with inquiry-based questioning.',
    'Assisted with display boards, co-curricular events, Independence Day, Janmashtami, and Sports Day activities.'
  ]
);

expBlock(
  'NTCC Teaching Internship (5-Week Community Teaching · 80 Hours)',
  'Pehchaan The Street School',
  '1 June – 6 July 2026 · Completed',
  [
    'Taught foundational literacy and numeracy to Nursery, LKG, and UKG learners using competency- and activity-based methods.',
    'Conducted ULLAS adult-literacy sessions for 5 adult learners; gained hands-on classroom management and community engagement practice.'
  ]
);

expBlock(
  'School Observation Internship (5-Day Observation)',
  'Amity International School, Mayur Vihar',
  '24 – 28 November 2025 · Completed',
  [
    'Observed Social Science and History lessons across Classes 6–12, analyzing questioning techniques, student engagement, and routines.',
    'Observed morning events, school assemblies, and a student-organized PCOS/PCOD awareness initiative, connecting theory to daily practice.'
  ]
);

// Academic Presentations & Certifications
drawSectionHeading('Academic Research & Professional Learning');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('NEP 2020 & Teacher Education Seminar (10 March 2026): ', { continued: true })
  .font('Helvetica').text('Co-author and presenter with lead author Rusha Chaudhauri on "Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education" at Amity Institute of Education (sponsored by GAIL India Ltd).');
doc.moveDown(0.2);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Women Safety National Webinar (26 November 2025): ', { continued: true })
  .font('Helvetica').text('Participant in "Youth as Catalyst in Strengthening Women Safety" organized by Pink Shakti Women Safety App.');
doc.moveDown(0.2);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Cambridge Development: ', { continued: true })
  .font('Helvetica').text('Applied for the Cambridge Certification for Pre-Service Teachers (programme not yet commenced).');

// Skills & Languages
drawSectionHeading('Teaching Competencies & Languages');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Core Pedagogical Skills: ', { continued: true })
  .font('Helvetica').text('Lesson planning · Historical source analysis · Formative assessment · Differentiated instruction · Classroom management.');
doc.moveDown(0.15);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Digital & Classroom Tools: ', { continued: true })
  .font('Helvetica').text('Canva · Microsoft Office (Word, PowerPoint, Excel) · Online classroom tools.');
doc.moveDown(0.15);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('Language Proficiencies: ', { continued: true })
  .font('Helvetica').text('English (Listening, Speaking, Reading, Writing) · Hindi (Listening, Speaking, Reading, Writing) · Nepali (Listening, Speaking, Reading, Writing) · Maithili (Listening, Reading).');

doc.end();

stream.on('finish', () => {
  console.log('PDF generated at:', outputPath, 'Size:', fs.statSync(outputPath).size, 'bytes');
});
