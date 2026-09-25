import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function generateNTCCReportPDF() {
  const outputPath = path.join(root, 'assets/amity-ntcc-community-work-report.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: 'Amity University - Community Work and Adult Literacy (EDCW100) Report',
      Author: 'Krishna Mahato',
      Subject: 'B.Ed. NTCC Community Work Report - Pehchaan The Street School and ULLAS Adult Literacy',
      Keywords: 'Community Work, Adult Literacy, ULLAS Programme, Pehchaan The Street School, B.Ed, Amity University'
    }
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const colors = {
    primary: '#1e3a8a',
    secondary: '#8a2b2b',
    dark: '#1e293b',
    muted: '#475569',
    lightLine: '#cbd5e1',
    boxBg: '#f8fafc'
  };

  const plain = s => String(s ?? '').replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

  const addHeader = title => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.muted).text('AMITY UNIVERSITY UTTAR PRADESH · AMITY INSTITUTE OF EDUCATION', 40, 25);
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text('B.Ed. NTCC Course: Community Work (EDCW100)', 40, 36);
    doc.strokeColor(colors.lightLine).lineWidth(0.5).moveTo(40, 48).lineTo(555, 48).stroke();
    doc.y = 60;
  };

  const addFooter = pageNum => {
    const y = 800;
    doc.strokeColor(colors.lightLine).lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke();
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text('Krishna Mahato · Enrollment No: A3410525022', 40, y + 6);
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text(`Page ${pageNum}`, 510, y + 6);
  };

  // --- PAGE 1: TITLE PAGE ---
  doc.rect(30, 30, 535, 782).lineWidth(1.5).strokeColor(colors.primary).stroke();
  doc.rect(34, 34, 527, 774).lineWidth(0.5).strokeColor(colors.secondary).stroke();

  doc.y = 70;
  doc.font('Helvetica-Bold').fontSize(26).fillColor(colors.primary).text('AMITY UNIVERSITY', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.muted).text('UTTAR PRADESH', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.dark).text('AMITY INSTITUTE OF EDUCATION', { align: 'center' });

  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(colors.secondary).text('COMMUNITY WORK REPORT', { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica-Oblique').fontSize(12).fillColor(colors.dark).text('Submitted in partial fulfilment of the requirements for the NTCC Course under', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary).text('BACHELOR OF EDUCATION (B.Ed.)', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(colors.dark).text('Academic Session: 2025 - 2027', { align: 'center' });

  doc.moveDown(2);
  const boxTop = doc.y;
  doc.rect(70, boxTop, 455, 140).fillAndStroke('#f1f5f9', colors.lightLine);
  doc.y = boxTop + 14;

  const metaRow = (label, val) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.dark).text(label, 85, doc.y, { width: 170, continued: false });
    doc.font('Helvetica').fontSize(10).fillColor(colors.dark).text(`:  ${val}`, 260, doc.y - 12);
    doc.moveDown(0.2);
  };

  metaRow('Student Name', 'Krishna Mahato');
  metaRow('Enrollment Number', 'A3410525022');
  metaRow('Programme', 'Bachelor of Education (B.Ed.)');
  metaRow('Course Code & Title', 'Community Work (EDCW100)');
  metaRow('Institution', 'Amity Institute of Education');
  metaRow('Duration of Community Work', '31 May 2026 to 06 July 2026 (5 Weeks)');
  metaRow('Total Community Work Hours', '130 Hours (80h NGO + 50h ULLAS)');

  doc.moveDown(2.5);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.primary).text('NGO / COLLABORATING ORGANISATION', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.secondary).text('Pehchaan The Street School', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(colors.muted).text('Morna Village Slum Area, Sector 35, Noida, Uttar Pradesh', { align: 'center' });

  doc.moveDown(2);
  const guideY = doc.y;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.dark).text('INDUSTRY GUIDE:', 70, guideY);
  doc.font('Helvetica').fontSize(10).text('Mr. Akash Tandon', 70, guideY + 15);
  doc.font('Helvetica-Oblique').fontSize(9).text('Founder & Trustee', 70, guideY + 28);
  doc.font('Helvetica').fontSize(9).text('Pehchaan The Street School', 70, guideY + 40);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.dark).text('FACULTY GUIDE:', 340, guideY);
  doc.font('Helvetica').fontSize(10).text('Dr. Neetu Mishra Shukla', 340, guideY + 15);
  doc.font('Helvetica-Oblique').fontSize(9).text('Associate Professor', 340, guideY + 28);
  doc.font('Helvetica').fontSize(9).text('Amity Institute of Education, Noida', 340, guideY + 40);

  doc.y = 750;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.dark).text('Date of Submission: 20 July 2026 · Place: Noida, UP', { align: 'center' });

  // --- PAGE 2: DECLARATION & CERTIFICATE ---
  doc.addPage();
  addHeader();
  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.primary).text('DECLARATION & CERTIFICATE OF AUTHENTICITY', { align: 'center' });
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.secondary).text('STUDENT DECLARATION');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark).text(
    'I, Krishna Mahato, student of Bachelor of Education (B.Ed.), Amity Institute of Education, Amity University Uttar Pradesh (Enrollment No. A3410525022), hereby declare that the community work report titled "Community Work and Adult Literacy" submitted in partial fulfilment of the requirements for the award of the degree of Bachelor of Education is an authentic record of original community teaching work carried out by me under the academic supervision of Dr. Neetu Mishra Shukla and field mentorship of Mr. Akash Tandon.',
    { lineGap: 3, align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text('Date: 20/07/2026\nPlace: Noida\n\nKrishna Mahato (A3410525022)');

  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.secondary).text('INSTITUTIONAL CERTIFICATE');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark).text(
    'This is to certify that the community work report titled "Community Work and Adult Literacy" submitted by Krishna Mahato (Enrollment Number A3410525022) to Amity Institute of Education, Amity University Uttar Pradesh, in partial fulfilment of the requirements for the B.Ed. degree, represents faithful work carried out under our supervision. The work has been verified through Turnitin plagiarism check (6% similarity index) and complies with university guidelines.',
    { lineGap: 3, align: 'justify' }
  );

  doc.moveDown(2.5);
  const certY = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).text('Prof. (Dr.) Alka', 60, certY);
  doc.font('Helvetica').fontSize(9).text('Head of Department\nAmity Institute of Education\nAmity University Uttar Pradesh', 60, certY + 14);

  doc.font('Helvetica-Bold').fontSize(10).text('Dr. Neetu Mishra Shukla', 340, certY);
  doc.font('Helvetica').fontSize(9).text('Faculty Guide / Associate Professor\nAmity Institute of Education\nAmity University Uttar Pradesh', 340, certY + 14);

  addFooter(2);

  // --- PAGE 3: ABSTRACT & COMMUNITY PROFILE ---
  doc.addPage();
  addHeader();
  doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.primary).text('1. EXECUTIVE ABSTRACT');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.dark).text(
    'This comprehensive report documents a five-week community engagement internship (1 June 2026 to 6 July 2026) completed by Krishna Mahato, a prospective teacher in the B.Ed. programme at Amity Institute of Education, Amity University Uttar Pradesh. Undertaken as part of course Community Work (EDCW100), the project fulfilled dual objectives: (1) delivering competency-based foundational literacy and numeracy to 4-6 year old kindergarten learners (Nursery, LKG, UKG) for 80 verified hours at Pehchaan The Street School in the Sector 35 Morna Village slum area of Noida; and (2) designing and conducting 50 hours of adult literacy and critical life-skills sessions for five non-literate and semi-literate community workers (security guards and sanitation cleaners aged 20-45) under the Government of India\'s ULLAS (Understanding Lifelong Learning for All in Society) initiative.',
    { lineGap: 3, align: 'justify' }
  );

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.secondary).text('Key Empirical Metrics:');
  const metrics = [
    'Total Engagement Duration: 5 Weeks (1 June 2026 - 6 July 2026)',
    'Child Education Practice: 80 Verified On-Ground Teaching Hours (Annexure 4 Certificate)',
    'Kindergarten Cohort: 25+ Children across Nursery, LKG, and UKG (Ages 4-6)',
    'Adult Literacy Practice: 50 Hours of Instructional Sessions under ULLAS / NILP Scheme',
    'Adult Cohort: 5 Adult Learners (2 Security Guards, 3 Cleaners; Ages 20-45)',
    'Assessment Outcomes: Post-assessment demonstrated >60% score achievement in foundational skills',
    'Official Turnitin Similarity Index: 6% (Original academic documentation)'
  ];
  for (const m of metrics) {
    doc.font('Helvetica').fontSize(9).fillColor(colors.dark).text(`•  ${m}`, { indent: 15 });
  }

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary).text('2. COMMUNITY PROFILE & BACKGROUND');
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.dark).text(
    'The on-ground field engagement took place at the Morna Village community centre in Sector 35, Noida. Learners comprised children from migrant laborer and informal-settlement families. Baseline diagnostic testing in Week 1 revealed marked learning vulnerabilities: several children enrolled in Class 4 at local municipal schools could not construct basic sentences or recognize Hindi/English alphabets accurately. Consequently, pedagogical intervention was anchored in foundational phonics, multi-sensory tracing, and tiered ability-based grouping.',
    { lineGap: 3, align: 'justify' }
  );
  addFooter(3);

  // --- PAGE 4: PEHCHAAN 80-HOUR CHILD EDUCATION BREAKDOWN ---
  doc.addPage();
  addHeader();
  doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.primary).text('3. CHILD EDUCATION INTERVENTION (80 HOURS)');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.dark).text(
    'The 80-hour kindergarten instructional sequence was executed collaboratively across 5 weeks, integrating competency-based pedagogy, play-based numeracy, and continuous diagnostic evaluation:',
    { lineGap: 2.5 }
  );

  doc.moveDown(0.8);
  const weeks = [
    {
      w: 'Week 1 (1–6 June 2026) · 14 Hours',
      act: 'Organizational induction by Founder Akash Tandon; baseline diagnostic evaluation of 25+ children; ability-based grouping; motor skills development (line and circle tracing); alphabet recognition A-Z; number chanting 1-100; daily 15-minute shape drawing.'
    },
    {
      w: 'Week 2 (8–14 June 2026) · 18 Hours',
      act: 'Structured worksheet tracing for non-writers; alphabet recitation; numbers 1-50 writing and identification; elimination alphabet loop game; geometric shape drawing (creating helicopters, dolls, and vehicles using circles, rectangles, and squares); robotics workshop observation.'
    },
    {
      w: 'Week 3 (15–21 June 2026) · 18 Hours',
      act: 'Differentiated instruction: English phonetic word association (A for Axe, Apple; B for Ball); Hindi Varnamala introduction; interactive student callouts; mathematics differentiated into single-digit addition and subtraction alongside number sequencing.'
    },
    {
      w: 'Week 4 (22–28 June 2026) · 12 Hours',
      act: 'Vocabulary-to-illustration activities; bilingual word-building; 2-digit addition with carry-over scaffolding; daily public speaking and hesitation-removal exercises; alphabet-picture matching handouts.'
    },
    {
      w: 'Week 5 (29 June – 6 July 2026) · 18 Hours',
      act: 'Storytelling reading circle (oral retellings including rabbit-tortoise fable); "Maths Market" real-world currency simulation (calculating fruit costs, e.g., 3 apples at Rs 5); comprehensive 40-mark diagnostic post-assessment; "Mystery Bag" vocabulary acting/drawing game; revision and farewell.'
    }
  ];

  for (const item of weeks) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.secondary).text(item.w);
    doc.font('Helvetica').fontSize(9).fillColor(colors.dark).text(item.act, { lineGap: 2, indent: 10 });
    doc.moveDown(0.4);
  }

  doc.moveDown(0.5);
  doc.rect(40, doc.y, 515, 30).fillAndStroke('#eff6ff', colors.primary);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary).text('TOTAL NGO CHILD EDUCATION HOURS: 80 HOURS VERIFIED', 50, doc.y + 9, { align: 'center' });

  addFooter(4);

  // --- PAGE 5: ULLAS ADULT LITERACY WORK (50 HOURS) ---
  doc.addPage();
  addHeader();
  doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.primary).text('4. ULLAS ADULT LITERACY INITIATIVE (50 HOURS)');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.dark).text(
    'Conducted under the centrally sponsored New India Literacy Programme (NILP / ULLAS) aligned with NEP 2020. The curriculum provided foundational numeracy, spoken communication, legal signature capability, and functional life literacy for adult workers.',
    { lineGap: 2.5 }
  );

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.secondary).text('Adult Learner Profiles:');
  const learners = [
    { no: '1', name: 'Anshul', age: '30', occ: 'Security Guard', prior: 'Completed Class 8th · Needed spoken English, digital apps & formal writing' },
    { no: '2', name: 'Ram Lakhan', age: '20', occ: 'Security Guard', prior: 'Completed Class 8th · Counseled to pursue secondary school completion' },
    { no: '3', name: 'Gyashi Lal', age: '45', occ: 'Sanitation Cleaner', prior: 'Never attended school · Started from alphabet tracing, counting & signatures' },
    { no: '4', name: 'Teeja', age: '40', occ: 'Sanitation Cleaner', prior: 'Never attended school · Empowered with legal signature & utility bill literacy' },
    { no: '5', name: 'Jyothi', age: '28', occ: 'Sanitation Cleaner', prior: 'Completed Class 8th · Advanced through Hindi reading & household budgeting' }
  ];

  for (const l of learners) {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(colors.dark).text(`${l.no}. ${l.name} (${l.age} yrs, ${l.occ})`, { indent: 10 });
    doc.font('Helvetica').fontSize(9).fillColor(colors.muted).text(`   Background: ${l.prior}`, { indent: 15 });
  }

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.secondary).text('5-Week Adult Curriculum Progression (10 Hours / Week = 50 Hours):');
  const adultWeeks = [
    'Week 1: Learner profiling; bifurcation into dual streams (spoken communication vs basic writing/reading).',
    'Week 2: Official signature training (replacing thumbprints); form-filling practice; basic market arithmetic.',
    'Week 3: Literature & value-based reading: Hindi reading of the Bhagavad Gita and English reading of Paulo Coelho\'s "The Alchemist" to expand horizons.',
    'Week 4: Functional digital & financial literacy: Smartphone navigation, computer literacy, electricity/water bill comprehension, family budget recording.',
    'Week 5: Comprehensive evaluation: reading comprehension passages, spoken Hindi/English fluency checks, and practical money calculation assessments.'
  ];
  for (const aw of adultWeeks) {
    doc.font('Helvetica').fontSize(9).fillColor(colors.dark).text(`•  ${aw}`, { indent: 10, lineGap: 2 });
  }

  doc.moveDown(0.6);
  doc.rect(40, doc.y, 515, 30).fillAndStroke('#fef2f2', colors.secondary);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.secondary).text('TOTAL ULLAS ADULT LITERACY HOURS: 50 HOURS VERIFIED', 50, doc.y + 9, { align: 'center' });

  addFooter(5);

  // --- PAGE 6: PEDAGOGY, CLOs & REFLECTION ---
  doc.addPage();
  addHeader();
  doc.font('Helvetica-Bold').fontSize(15).fillColor(colors.primary).text('5. COURSE LEARNING OUTCOMES & REFLECTION');
  doc.moveDown(0.4);

  const clos = [
    { code: 'CLO 1 (Remember)', text: 'Internalized ethical norms of community education, punctuality, and professional accountability in informal learning spaces.' },
    { code: 'CLO 2 (Understand)', text: 'Recognized socio-economic determinants of education; appreciated literacy as an engine of dignity and poverty alleviation.' },
    { code: 'CLO 3 (Apply)', text: 'Operationalized competency-based instruction, activity learning, and conflict-resolution strategies in lively nursery environments.' },
    { code: 'CLO 4 (Analyze)', text: 'Critically evaluated personal teaching strengths; acknowledged early hesitancy and the indispensable need for rigorous lesson planning.' },
    { code: 'CLO 5 (Evaluate)', text: 'Appraised pedagogical methods, demonstrating that hybridizing traditional drill with learner-centric simulations maximizes retention.' },
    { code: 'CLO 6 (Create)', text: 'Authored diagnostic test instruments (40-mark UKG sheet), custom visual-motor maze worksheets, and experiential math simulations.' }
  ];

  for (const c of clos) {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(colors.secondary).text(c.code);
    doc.font('Helvetica').fontSize(9).fillColor(colors.dark).text(c.text, { indent: 10, lineGap: 1.5 });
    doc.moveDown(0.3);
  }

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(colors.primary).text('6. CHALLENGES ENCOUNTERED & SOLUTIONS ADOPTED');
  doc.moveDown(0.3);
  const challenges = [
    'Wide Disparity in Baseline Skills: Resolved through diagnostic ability-based grouping and split-group instruction.',
    'Restless Attention Spans in 4-6 Year Olds: Addressed by integrating kinetic games (Hands Up/Down, Mystery Bag, breathing pauses).',
    'Adult Learner Self-Consciousness & Hesitation: Countered through non-judgmental positive reinforcement and practical real-life examples (bills, wages).',
    'Resource Scarcity in Slum Classroom: Leveraged low-cost locally available items, reusable chalkboards, and self-illustrated flashcards.'
  ];
  for (const ch of challenges) {
    doc.font('Helvetica').fontSize(9).fillColor(colors.dark).text(`•  ${ch}`, { indent: 10, lineGap: 2 });
  }

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.dark).text('CONCLUSION & INSTITUTIONAL RECORD:');
  doc.font('Helvetica').fontSize(9).fillColor(colors.muted).text(
    'This community internship stands as verified evidence of Krishna Mahato\'s pedagogical commitment, demonstrating versatile competence in both early-childhood foundational education and adult social transformation.',
    { lineGap: 2 }
  );

  addFooter(6);

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  console.log('Successfully generated amity-ntcc-community-work-report.pdf');
}

export async function generateUKGTestPDF() {
  const outputPath = path.join(root, 'assets/ukg-assessment-test.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: 'UKG Diagnostic Assessment Test - Foundational Literacy & Numeracy',
      Author: 'Krishna Mahato',
      Subject: 'Pehchaan The Street School - Kindergarten Diagnostic Test Sheet'
    }
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const colors = { primary: '#1e3a8a', dark: '#0f172a', muted: '#475569' };

  doc.rect(30, 30, 535, 782).lineWidth(1.5).strokeColor(colors.primary).stroke();

  doc.y = 50;
  doc.font('Helvetica-Bold').fontSize(18).fillColor(colors.primary).text('PEHCHAAN THE STREET SCHOOL', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.dark).text('UKG DIAGNOSTIC ASSESSMENT TEST', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(colors.muted).text('Subject: Foundational Literacy & Numeracy · Total Marks: 40', { align: 'center' });

  doc.moveDown(1);
  const infoY = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).text('Student Name: _______________________', 50, infoY);
  doc.text('Class: UKG', 300, infoY);
  doc.text('Date: ____________', 420, infoY);

  doc.moveDown(1.5);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  const section = (title, marks) => {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.primary).text(`${title} (${marks})`);
    doc.moveDown(0.2);
  };

  section('Section A: English Alphabet - Fill in the Missing Letters', '5 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a)  A,  ___,  C,  ___,  E', 60);
  doc.text('b)  F,  ___,  H,  ___,  J', 60);
  doc.text('c)  K,  ___,  M,  ___,  O', 60);
  doc.text('d)  P,  ___,  R,  ___,  T', 60);
  doc.text('e)  U,  ___,  W,  ___,  Y', 60);

  section('Section B: Hindi Varnamala - Missing Akshar', '5 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a)  अ,  ___,  इ,  ___,  उ', 60);
  doc.text('b)  ऊ,  ___,  ए,  ___,  ओ', 60);
  doc.text('c)  क,  ___,  ग,  ___,  ङ', 60);
  doc.text('d)  च,  ___,  ज,  ___,  ञ', 60);
  doc.text('e)  ट,  ___,  ड,  ___,  ण', 60);

  section('Section C: Number Sequence (1 - 100)', '5 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a)  11,  ___,  13,  ___,  15                  b)  24,  ___,  26,  ___,  28', 60);
  doc.text('c)  47,  ___,  49,  ___,  51                  d)  68,  ___,  70,  ___,  72', 60);
  doc.text('e)  89,  ___,  91,  ___,  93', 60);

  section('Section D: Count the Shapes and Write the Total', '5 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a)  ▲ ▲ ▲ ▲ ▲                                =  [      ]', 60);
  doc.text('b)  ● ● ● ● ● ● ●                            =  [      ]', 60);
  doc.text('c)  ■ ■ ■ ■                                  =  [      ]', 60);
  doc.text('d)  ★ ★ ★ ★ ★ ★                              =  [      ]', 60);
  doc.text('e)  ♥ ♥ ♥                                    =  [      ]', 60);

  section('Section E: Picture-Word Association', '5 Marks');
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.dark);
  doc.text('Identify and write the name: (1) Apple  (2) Ball / Football  (3) Mango  (4) Cat  (5) Sun', 60);

  section('Section F: Basic Single-Digit Addition', '8 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a) 2 + 3 = _____      b) 4 + 2 = _____      c) 5 + 3 = _____      d) 6 + 2 = _____', 60);
  doc.text('e) 7 + 1 = _____      f) 3 + 5 = _____      g) 4 + 4 = _____      h) 5 + 2 = _____', 60);

  section('Section G: Basic Single-Digit Subtraction', '7 Marks');
  doc.font('Helvetica').fontSize(10).fillColor(colors.dark);
  doc.text('a) 5 - 2 = _____      b) 6 - 1 = _____      c) 8 - 3 = _____      d) 9 - 4 = _____', 60);
  doc.text('e) 7 - 2 = _____      f) 10 - 5 = _____     g) 8 - 2 = _____', 60);

  doc.y = 750;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.primary).text('All the Best! ★ Keep Learning', { align: 'center' });

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  console.log('Successfully generated ukg-assessment-test.pdf');
}

await generateNTCCReportPDF();
await generateUKGTestPDF();
