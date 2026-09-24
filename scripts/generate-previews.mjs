import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function renderCard(browser, html, outputPath, width = 800, height = 600) {
  const page = await browser.newPage({ viewport: { width, height, deviceScaleFactor: 2 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, type: 'webp', quality: 90 });
  await page.close();
}

async function main() {
  const browser = await chromium.launch();

  // 1. ULLAS Adult Literacy Preview Card
  const ullasHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin:0; padding:32px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#0f172a; color:#f8fafc; box-sizing:border-box; width:800px; height:600px; display:flex; flex-direction:column; justify-content:space-between; }
      .tag-row { display:flex; justify-content:space-between; align-items:center; }
      .badge { background:#dc2626; color:#fff; font-size:12px; font-weight:700; padding:6px 14px; border-radius:4px; letter-spacing:1px; text-transform:uppercase; }
      .hours { background:#1e293b; color:#94a3b8; border:1px solid #334155; font-size:12px; padding:6px 12px; border-radius:4px; font-weight:600; }
      h1 { font-size:28px; line-height:1.2; margin:16px 0 8px; color:#ffffff; font-family:serif; letter-spacing:-0.5px; }
      .lead { color:#cbd5e1; font-size:14px; line-height:1.5; margin:0 0 20px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
      .card { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:14px 16px; }
      .card h3 { font-size:13px; color:#e2e8f0; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.5px; }
      .learner-list { font-size:12px; color:#94a3b8; line-height:1.6; margin:0; padding-left:16px; }
      .learner-list strong { color:#f1f5f9; }
      .pillars { display:flex; flex-wrap:wrap; gap:8px; }
      .pill { background:#0f172a; border:1px solid #475569; color:#cbd5e1; font-size:11px; padding:4px 10px; border-radius:12px; }
      .footer-bar { display:flex; justify-content:space-between; font-size:11px; color:#64748b; border-top:1px solid #334155; padding-top:12px; }
    </style>
  </head>
  <body>
    <div>
      <div class="tag-row">
        <span class="badge">ULLAS / NILP · NEP 2020</span>
        <span class="hours">50 Verified Instructional Hours</span>
      </div>
      <h1>ULLAS Adult Literacy &amp; Life Skills Initiative</h1>
      <p class="lead">Understanding Lifelong Learning for All in Society · Practical community empowerment with security guards &amp; cleaners in Morna Village, Sector 35, Noida.</p>
      <div class="grid">
        <div class="card">
          <h3>5 Community Learners</h3>
          <ul class="learner-list">
            <li><strong>Anshul (30)</strong> · Security Guard · English &amp; forms</li>
            <li><strong>Ram Lakhan (20)</strong> · Security Guard · Schooling advice</li>
            <li><strong>Gyashi Lal (45)</strong> · Sanitation Cleaner · Signatures</li>
            <li><strong>Teeja (40)</strong> · Sanitation Cleaner · Bills &amp; numeracy</li>
            <li><strong>Jyothi (28)</strong> · Sanitation Cleaner · Budgeting</li>
          </ul>
        </div>
        <div class="card">
          <h3>Curricular Competencies</h3>
          <div class="pillars">
            <span class="pill">Legal Signature Practice</span>
            <span class="pill">Form &amp; Application Filling</span>
            <span class="pill">Electricity &amp; Water Bill Literacy</span>
            <span class="pill">Household Cash Budgeting</span>
            <span class="pill">Hindi Bhagavad Gita Reading</span>
            <span class="pill">English Alchemist Exploration</span>
            <span class="pill">Smartphone &amp; Digital Basics</span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bar">
      <span>Amity Institute of Education · EDCW100 Community Work</span>
      <span>Educator: Krishna Mahato · Enrollment: A3410525022</span>
    </div>
  </body>
  </html>`;

  await renderCard(browser, ullasHtml, path.join(root, 'assets/ullas-adult-literacy-preview.webp'));

  // 2. UKG Assessment Preview Card
  const ukgHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin:0; padding:32px; font-family:"Courier New", Courier, monospace, sans-serif; background:#fcfbf7; color:#1e293b; box-sizing:border-box; width:800px; height:600px; display:flex; flex-direction:column; justify-content:space-between; border:3px solid #1e3a8a; }
      .header-box { text-align:center; border-bottom:2px solid #1e3a8a; padding-bottom:12px; margin-bottom:16px; }
      .org { font-size:16px; font-weight:bold; color:#1e3a8a; letter-spacing:1px; }
      .title { font-size:22px; font-weight:bold; margin:4px 0; color:#0f172a; }
      .sub { font-size:12px; color:#475569; }
      .meta-grid { display:grid; grid-template-columns:1fr 1fr 1fr; font-size:12px; border-bottom:1px dashed #cbd5e1; padding-bottom:8px; margin-bottom:16px; }
      .sec-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:11px; }
      .sec { background:#ffffff; border:1px solid #e2e8f0; border-radius:4px; padding:10px 12px; }
      .sec-title { font-weight:bold; color:#1e3a8a; margin-bottom:6px; font-size:12px; border-bottom:1px solid #f1f5f9; padding-bottom:3px; }
      .sample { line-height:1.5; color:#334155; }
      .stamp { position:absolute; right:48px; bottom:40px; border:2px dashed #dc2626; color:#dc2626; padding:8px 14px; transform:rotate(-6deg); font-weight:bold; font-size:12px; text-transform:uppercase; border-radius:4px; }
      .badge-foot { font-size:11px; color:#64748b; margin-top:12px; text-align:center; }
    </style>
  </head>
  <body style="position:relative;">
    <div>
      <div class="header-box">
        <div class="org">PEHCHAAN THE STREET SCHOOL · NOIDA SECTOR 35</div>
        <div class="title">UKG DIAGNOSTIC ASSESSMENT &amp; FOUNDATIONAL SKILLS</div>
        <div class="sub">Annexure 2 of EDCW100 NTCC Report · Maximum Marks: 40</div>
      </div>
      <div class="meta-grid">
        <span>Target: Nursery, LKG &amp; UKG</span>
        <span>Ages: 4–6 Years</span>
        <span>Improvement: &gt;60% Learning Gain</span>
      </div>
      <div class="sec-grid">
        <div class="sec">
          <div class="sec-title">Section A: English Alphabet (5 M)</div>
          <div class="sample">A, __, C, __, E · F, __, H, __, J<br>K, __, M, __, O · P, __, R, __, T</div>
        </div>
        <div class="sec">
          <div class="sec-title">Section B: Hindi Akshar Varnamala (5 M)</div>
          <div class="sample">अ, __, इ, __, उ · क, __, ग, __, ङ<br>च, __, ज, __, ञ · ट, __, ड, __, ण</div>
        </div>
        <div class="sec">
          <div class="sec-title">Section C &amp; D: Numeracy &amp; Shapes (10 M)</div>
          <div class="sample">Numbers: 11, __, 13, __, 15 · 24, __, 26, __, 28<br>Shapes: ▲ ▲ ▲ ▲ ▲ = [ 5 ] · ● ● ● ● = [ 4 ]</div>
        </div>
        <div class="sec">
          <div class="sec-title">Section F &amp; G: Addition &amp; Subtraction (15 M)</div>
          <div class="sample">2 + 3 = [ 5 ] · 4 + 2 = [ 6 ] · 7 + 1 = [ 8 ]<br>5 - 2 = [ 3 ] · 8 - 3 = [ 5 ] · 9 - 4 = [ 5 ]</div>
        </div>
      </div>
      <div class="stamp">Verified Field Instrument<br>Pehchaan 80h Practicum</div>
    </div>
    <div class="badge-foot">
      Curated by Krishna Mahato · Faculty Guide: Dr. Neetu Mishra Shukla · Amity University Uttar Pradesh
    </div>
  </body>
  </html>`;

  await renderCard(browser, ukgHtml, path.join(root, 'assets/ukg-assessment-preview.webp'));

  // 3. NTCC Report Cover Preview Card
  const coverHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin:0; padding:32px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#1e293b; color:#f8fafc; box-sizing:border-box; width:800px; height:600px; display:flex; flex-direction:column; justify-content:space-between; border:2px solid #334155; }
      .inst-tag { font-size:12px; letter-spacing:1.5px; color:#94a3b8; text-transform:uppercase; font-weight:bold; }
      .main-title { font-family:serif; font-size:32px; color:#ffffff; margin:12px 0 6px; line-height:1.2; }
      .subtitle { font-size:16px; color:#cbd5e1; margin-bottom:20px; }
      .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; background:#0f172a; padding:18px; border-radius:8px; border:1px solid #334155; }
      .meta-item label { display:block; font-size:11px; text-transform:uppercase; color:#64748b; letter-spacing:0.5px; margin-bottom:2px; }
      .meta-item value { font-size:13px; font-weight:600; color:#e2e8f0; }
      .badges { display:flex; gap:10px; margin-top:16px; }
      .badge-pill { background:#3b82f6; color:#fff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; }
      .badge-sub { background:#10b981; color:#fff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; }
      .footer-line { border-top:1px solid #334155; padding-top:12px; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between; }
    </style>
  </head>
  <body>
    <div>
      <div class="inst-tag">Amity Institute of Education · B.Ed. EDCW100</div>
      <div class="main-title">Community Work &amp; Adult Literacy</div>
      <div class="subtitle">Complete 27-Page NTCC Practicum Report &amp; Curricular Evaluation</div>
      <div class="meta-grid">
        <div class="meta-item">
          <label>Candidate</label>
          <value>Krishna Mahato (A3410525022)</value>
        </div>
        <div class="meta-item">
          <label>Faculty Guide</label>
          <value>Dr. Neetu Mishra Shukla (Amity)</value>
        </div>
        <div class="meta-item">
          <label>Field Organisation</label>
          <value>Pehchaan The Street School (Noida)</value>
        </div>
        <div class="meta-item">
          <label>Industry Guide</label>
          <value>Mr. Akash Tandon (Founder)</value>
        </div>
        <div class="meta-item">
          <label>Verified Hours</label>
          <value>130 Hours (80h Child + 50h ULLAS)</value>
        </div>
        <div class="meta-item">
          <label>Academic Session</label>
          <value>2025–2027 · B.Ed. Curriculum</value>
        </div>
      </div>
      <div class="badges">
        <span class="badge-pill">Turnitin 6% Plagiarism Certified</span>
        <span class="badge-sub">6 Course Learning Outcomes (CLOs) Achieved</span>
      </div>
    </div>
    <div class="footer-line">
      <span>Official Submission: 20 July 2026 · Noida, UP</span>
      <span>Format: Academic Archival PDF · 27 Pages</span>
    </div>
  </body>
  </html>`;

  await renderCard(browser, coverHtml, path.join(root, 'assets/ntcc-report-cover-preview.webp'));

  await browser.close();
  console.log('Successfully generated all preview webp assets via Playwright!');
}

main().catch(console.error);
