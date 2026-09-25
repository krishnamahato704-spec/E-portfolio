import fs from 'fs';
import { execSync } from 'child_process';

// 1. Certificate 5: NCERT - Leveraging AI for Transforming School Education
const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 990" width="1400" height="990">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffefb"/>
      <stop offset="100%" stop-color="#fbf9f2"/>
    </linearGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c59b27"/>
      <stop offset="50%" stop-color="#eac668"/>
      <stop offset="100%" stop-color="#b08415"/>
    </linearGradient>
    <pattern id="cornerPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0,20 Q 10,0 20,20 Q 30,40 40,20" fill="none" stroke="#d4af37" stroke-width="1.2" opacity="0.45"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1400" height="990" fill="url(#bgGrad)"/>

  <!-- Ornate Decorative Outer Frame -->
  <rect x="25" y="25" width="1350" height="940" fill="none" stroke="#c59b27" stroke-width="4"/>
  <rect x="35" y="35" width="1330" height="920" fill="none" stroke="#e8c872" stroke-width="1.5"/>
  <rect x="42" y="42" width="1316" height="906" fill="none" stroke="#b08415" stroke-width="0.8" stroke-dasharray="6,4"/>

  <!-- Corner Flourishes -->
  <g fill="none" stroke="#b08415" stroke-width="2">
    <path d="M 45,85 C 45,55 55,45 85,45" />
    <path d="M 1355,85 C 1355,55 1345,45 1315,45" />
    <path d="M 45,905 C 45,935 55,945 85,945" />
    <path d="M 1355,905 C 1355,935 1345,945 1315,945" />
    <circle cx="85" cy="85" r="8" fill="#d4af37" opacity="0.6"/>
    <circle cx="1315" cy="85" r="8" fill="#d4af37" opacity="0.6"/>
    <circle cx="85" cy="905" r="8" fill="#d4af37" opacity="0.6"/>
    <circle cx="1315" cy="905" r="8" fill="#d4af37" opacity="0.6"/>
  </g>

  <!-- Top Headers & Insignias -->
  <g transform="translate(140, 110)">
    <!-- Ministry Emblem -->
    <g transform="translate(0, 0)">
      <circle cx="20" cy="18" r="14" fill="none" stroke="#334155" stroke-width="2"/>
      <path d="M 12,18 L 28,18 M 20,10 L 20,26" stroke="#334155" stroke-width="1.5"/>
      <text x="20" y="44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">Ministry of Education</text>
      <text x="20" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Government of India</text>
    </g>

    <!-- DIKSHA -->
    <g transform="translate(120, 2)">
      <path d="M 18,5 L 26,18 L 18,31 L 10,18 Z" fill="#0284c7"/>
      <path d="M 18,10 L 23,18 L 18,26 L 13,18 Z" fill="#38bdf8"/>
      <text x="18" y="42" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">DIKSHA</text>
    </g>

    <!-- NCERT Emblem -->
    <g transform="translate(560, -10)">
      <text x="0" y="10" font-family="'Noto Sans', 'Arial', sans-serif" font-size="10" fill="#1e293b" text-anchor="middle">विद्ययाऽमृतमश्नुते</text>
      <circle cx="0" cy="30" r="18" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <path d="M -10,30 C -5,20 5,20 10,30 C 5,40 -5,40 -10,30 Z" fill="#0f172a"/>
      <text x="0" y="60" font-family="'Noto Sans', 'Arial', sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">एन सी ई आर टी</text>
      <text x="0" y="72" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">NCERT</text>
    </g>
  </g>

  <!-- Title Section -->
  <text x="700" y="280" font-family="'Georgia', serif" font-size="30" fill="#1e293b" text-anchor="middle" font-weight="500">National Council of Educational Research and Training</text>
  <text x="700" y="335" font-family="'Arial', 'Helvetica Neue', sans-serif" font-size="42" font-weight="bold" fill="#0284c7" text-anchor="middle" letter-spacing="0.5">Certificate of Completion</text>

  <!-- Certification Content -->
  <text x="700" y="415" font-family="'Georgia', serif" font-size="22" font-style="italic" fill="#475569" text-anchor="middle">This is to certify that</text>
  <text x="700" y="465" font-family="'Georgia', serif" font-size="34" font-weight="bold" fill="#0f172a" text-anchor="middle">Ms. /Mr./ Dr. /Prof Krishna Mahato</text>
  <text x="700" y="515" font-family="'Georgia', serif" font-size="21" font-style="italic" fill="#475569" text-anchor="middle">has successfully completed the course</text>
  <text x="700" y="570" font-family="'Arial', 'Helvetica Neue', sans-serif" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle">Leveraging AI for Transforming School Education</text>
  <text x="700" y="625" font-family="'Georgia', serif" font-size="23" fill="#334155" text-anchor="middle">
    of <tspan font-weight="bold" font-family="'Arial', sans-serif">5</tspan> hours offered by <tspan font-weight="bold">CIET- NCERT, New Delhi</tspan>
  </text>
  <text x="700" y="675" font-family="'Georgia', serif" font-size="22" fill="#334155" text-anchor="middle">
    on <tspan font-weight="bold">4 March 2026</tspan>
  </text>

  <!-- Signatures Grid -->
  <g transform="translate(160, 770)" font-family="'Helvetica Neue', Arial, sans-serif" text-anchor="middle">
    <!-- Sig 1 -->
    <g transform="translate(100, 0)">
      <path d="M -60,25 C -20,10 10,35 60,15 M -40,30 C 0,5 30,20 50,25" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="-70" y1="42" x2="70" y2="42" stroke="#cbd5e1" stroke-width="1"/>
      <text x="0" y="62" font-size="13" font-weight="bold" fill="#0f172a">Prof. Amarendra P. Behera</text>
      <text x="0" y="79" font-size="12" fill="#475569">Joint Director</text>
      <text x="0" y="95" font-size="12" fill="#475569">CIET- NCERT</text>
    </g>

    <!-- Sig 2 -->
    <g transform="translate(390, 0)">
      <path d="M -40,30 C -20,5 -10,35 15,10 C 25,25 45,15 50,30" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="-70" y1="42" x2="70" y2="42" stroke="#cbd5e1" stroke-width="1"/>
      <text x="0" y="62" font-size="13" font-weight="bold" fill="#0f172a">Prof. Indu Kumar</text>
      <text x="0" y="79" font-size="12" fill="#475569">Head, DICT &amp; TD</text>
      <text x="0" y="95" font-size="12" fill="#475569">CIET- NCERT</text>
    </g>

    <!-- Sig 3 -->
    <g transform="translate(680, 0)">
      <path d="M -30,30 L 0,10 L 20,35 L 45,5" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="-70" y1="42" x2="70" y2="42" stroke="#cbd5e1" stroke-width="1"/>
      <text x="0" y="62" font-size="13" font-weight="bold" fill="#0f172a">Dr. Rajesh D</text>
      <text x="0" y="79" font-size="12" fill="#475569">Course Coordinator</text>
      <text x="0" y="95" font-size="12" fill="#475569">CIET- NCERT</text>
    </g>

    <!-- Sig 4 -->
    <g transform="translate(970, 0)">
      <path d="M -45,15 C -20,35 0,10 25,25 C 40,5 50,30 60,10" fill="none" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="-70" y1="42" x2="70" y2="42" stroke="#cbd5e1" stroke-width="1"/>
      <text x="0" y="62" font-size="13" font-weight="bold" fill="#0f172a">Dr. Angel Rathnabai S</text>
      <text x="0" y="79" font-size="12" fill="#475569">Programme Coordinator</text>
      <text x="0" y="95" font-size="12" fill="#475569">CIET- NCERT</text>
    </g>
  </g>
</svg>`;

// 2. Certificate 6: NPTEL - Effective Writing (IIT Roorkee - Elite)
const svg6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 990" width="1400" height="990">
  <defs>
    <linearGradient id="nptelRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>

  <!-- Clean parchment bg -->
  <rect width="1400" height="990" fill="#ffffff"/>
  <rect x="15" y="15" width="1370" height="960" fill="none" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Top "Elite" Curved Badge -->
  <path d="M 600,0 L 800,0 L 780,55 C 750,65 650,65 620,55 Z" fill="url(#nptelRed)"/>
  <text x="700" y="40" font-family="'Georgia', serif" font-size="28" font-style="italic" font-weight="bold" fill="#ffffff" text-anchor="middle">Elite</text>

  <!-- NPTEL Wheel Logo Left -->
  <g transform="translate(130, 80)">
    <circle cx="45" cy="45" r="40" fill="none" stroke="#b91c1c" stroke-width="3"/>
    <path d="M 45,5 L 45,85 M 5,45 L 85,45 M 17,17 L 73,73 M 17,73 L 73,17" stroke="#b91c1c" stroke-width="2"/>
    <circle cx="45" cy="45" r="14" fill="#f59e0b"/>
  </g>

  <!-- Header Titles -->
  <text x="700" y="105" font-family="'Georgia', serif" font-size="38" font-weight="bold" fill="#991b1b" text-anchor="middle" letter-spacing="1">NPTEL ONLINE CERTIFICATION</text>
  <text x="700" y="138" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#334155" text-anchor="middle">(Funded by the MoE, Govt. of India)</text>

  <!-- Skill India Logo Right -->
  <g transform="translate(1180, 50)">
    <circle cx="35" cy="25" r="18" fill="none" stroke="#0284c7" stroke-width="2"/>
    <path d="M 25,25 L 45,25 M 35,15 L 35,35" stroke="#0284c7" stroke-width="1.5"/>
    <text x="35" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">Skill India</text>
    <text x="35" y="74" font-family="'Noto Sans', sans-serif" font-size="11" fill="#475569" text-anchor="middle">कौशल भारत - कुशल भारत</text>
  </g>

  <!-- Elite Medal Rosette Ribbon (Left) -->
  <g transform="translate(90, 240)">
    <path d="M 30,70 L 10,160 L 40,140 L 60,160 L 45,70 Z" fill="#2563eb" opacity="0.9"/>
    <circle cx="45" cy="45" r="42" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="45" cy="45" r="34" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
    <circle cx="45" cy="45" r="26" fill="#f8fafc"/>
    <text x="45" y="50" font-family="'Georgia', serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">ELITE</text>
  </g>

  <!-- Photo Box (Right) -->
  <g transform="translate(1190, 200)">
    <rect x="0" y="0" width="120" height="150" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Krishna Mahato portrait outline -->
    <circle cx="60" cy="55" r="30" fill="#cbd5e1"/>
    <path d="M 25,135 C 25,95 95,95 95,135 Z" fill="#94a3b8"/>
    <text x="60" y="145" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" fill="#475569" text-anchor="middle">Photo Verified</text>
  </g>

  <!-- Certification Details -->
  <text x="700" y="215" font-family="'Georgia', serif" font-size="20" font-style="italic" fill="#475569" text-anchor="middle">This certificate is awarded to</text>
  <text x="700" y="265" font-family="'Helvetica Neue', Arial, sans-serif" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1">KRISHNA MAHATO</text>
  <text x="700" y="310" font-family="'Georgia', serif" font-size="20" font-style="italic" fill="#475569" text-anchor="middle">for successfully completing the course</text>
  <text x="700" y="370" font-family="'Georgia', serif" font-size="38" font-weight="bold" fill="#0f172a" text-anchor="middle">Effective Writing</text>

  <!-- Score Board -->
  <g transform="translate(420, 420)">
    <text x="120" y="32" font-family="'Georgia', serif" font-size="20" fill="#334155">with a consolidated score of</text>
    <rect x="360" y="0" width="80" height="48" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
    <text x="400" y="34" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">76</text>
    <text x="470" y="32" font-family="'Georgia', serif" font-size="24" fill="#334155">%</text>

    <!-- Sub-score tables -->
    <rect x="-100" y="65" width="220" height="42" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <text x="-80" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#334155">Online Assignments</text>
    <text x="80" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">25/25</text>

    <rect x="160" y="65" width="220" height="42" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <text x="180" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#334155">Proctored Exam</text>
    <text x="340" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">51/75</text>
  </g>

  <text x="700" y="580" font-family="'Georgia', serif" font-size="19" fill="#1e293b" text-anchor="middle">
    Total number of candidates certified in this course: <tspan font-weight="bold">4719</tspan>
  </text>

  <!-- Signatures & Dates -->
  <g transform="translate(180, 680)" font-family="'Helvetica Neue', Arial, sans-serif" text-anchor="middle">
    <g transform="translate(60, 0)">
      <path d="M -50,20 C -20,5 0,30 40,10" fill="none" stroke="#0f172a" stroke-width="2"/>
      <text x="0" y="48" font-size="14" font-weight="bold" fill="#0f172a">Prof. Kaushik Ghosh,</text>
      <text x="0" y="66" font-size="12" fill="#475569">Professor (Chemistry)</text>
      <text x="0" y="82" font-size="12" fill="#475569">Coordinator CEC</text>
    </g>

    <g transform="translate(520, 0)">
      <text x="0" y="25" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#0f172a">Jan-Mar 2026</text>
      <text x="0" y="50" font-size="15" fill="#475569">(8 week course)</text>
    </g>

    <g transform="translate(940, 0)">
      <path d="M -50,15 C -10,30 20,5 50,20" fill="none" stroke="#0f172a" stroke-width="2"/>
      <text x="0" y="48" font-size="14" font-weight="bold" fill="#0f172a">Prof. Ranjana Pathania,</text>
      <text x="0" y="66" font-size="12" fill="#475569">Professor (BSBE)</text>
      <text x="0" y="82" font-size="12" fill="#475569">Coordinator (NPTEL)</text>
    </g>
  </g>

  <!-- Bottom Strip -->
  <line x1="60" y1="840" x2="1340" y2="840" stroke="#cbd5e1" stroke-width="1"/>
  <g transform="translate(100, 860)" font-family="'Helvetica Neue', Arial, sans-serif">
    <!-- IIT Roorkee -->
    <circle cx="20" cy="20" r="16" fill="none" stroke="#991b1b" stroke-width="2"/>
    <text x="45" y="26" font-size="15" font-weight="bold" fill="#1e293b">Indian Institute of Technology Roorkee</text>

    <!-- Swayam -->
    <g transform="translate(1000, 0)">
      <rect x="0" y="0" width="140" height="38" rx="4" fill="#0369a1"/>
      <text x="70" y="24" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">swayam</text>
    </g>
  </g>

  <!-- Roll No & QR -->
  <g transform="translate(60, 940)" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" fill="#334155">
    <text x="0" y="15">Roll No: <tspan font-weight="bold">NPTEL26HS108S464700850</tspan></text>
    <text x="600" y="15" text-anchor="middle">To verify the certificate [QR Verified]</text>
    <text x="1270" y="15" text-anchor="end">No. of credits recommended: <tspan font-weight="bold">3</tspan></text>
  </g>
</svg>`;

// 3. Certificate 7: Suraasa - LinkedIn for Teachers
const svg7 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 940" width="1400" height="940">
  <defs>
    <!-- Modern soft atmosphere gradient on right side -->
    <radialGradient id="meshGrad" cx="85%" cy="35%" r="70%" fx="80%" fy="30%">
      <stop offset="0%" stop-color="#ddd6fe" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="#fee2e2" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#e0f2fe" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Clean Background -->
  <rect width="1400" height="940" fill="#ffffff"/>
  <rect width="1400" height="940" fill="url(#meshGrad)"/>

  <!-- Suraasa Logo -->
  <g transform="translate(80, 75)">
    <!-- Butterfly wings in teal, yellow, purple -->
    <path d="M 0,15 C 8,5 20,5 20,18 C 20,28 8,28 0,15 Z" fill="#0d9488"/>
    <path d="M 22,18 C 22,5 34,5 42,15 C 34,28 22,28 22,18 Z" fill="#f59e0b"/>
    <path d="M 10,25 C 16,35 26,35 32,25 C 26,20 16,20 10,25 Z" fill="#7c3aed"/>
    <text x="54" y="24" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="bold" fill="#0f172a" letter-spacing="-0.5">Suraasa</text>
  </g>

  <!-- Main Headline -->
  <text x="80" y="240" font-family="'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="bold" fill="#0f172a" letter-spacing="-1">Certificate of</text>
  <text x="80" y="315" font-family="'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="bold" fill="#0f172a" letter-spacing="-1">Participation</text>

  <!-- Body Content -->
  <text x="80" y="420" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" fill="#64748b">This is to certify that</text>
  <text x="80" y="475" font-family="'Helvetica Neue', Arial, sans-serif" font-size="38" font-weight="bold" fill="#0f172a">Krishna Mahato</text>

  <!-- Detailed Paragraph -->
  <g transform="translate(80, 530)" font-family="'Helvetica Neue', Arial, sans-serif" font-size="21" fill="#334155">
    <text x="0" y="0">attended the webinar on <tspan font-weight="bold" fill="#0f172a">“LinkedIn for Teachers”</tspan> and now</text>
    <text x="0" y="34">possesses a clearer understanding of how to build a</text>
    <text x="0" y="68">strong personal brand, increase visibility, and use it</text>
    <text x="0" y="102">effectively for professional growth as a teacher.</text>
  </g>

  <!-- Signature Section -->
  <g transform="translate(80, 780)">
    <!-- Signature Cursive -->
    <path d="M 0,25 C 20,5 35,35 55,10 C 70,25 90,5 110,20 M 130,15 C 145,5 155,25 175,10" fill="none" stroke="#334155" stroke-width="2.5"/>
    <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">Sudhin Biswas</text>
    <text x="0" y="80" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="#64748b">Director, Suraasa</text>
  </g>

  <!-- Date Section -->
  <g transform="translate(560, 810)" font-family="'Helvetica Neue', Arial, sans-serif">
    <text x="0" y="0" font-size="14" fill="#64748b">Attended on</text>
    <text x="0" y="28" font-size="20" font-weight="bold" fill="#0f172a">Jan 07, 2026</text>
  </g>
</svg>`;

fs.writeFileSync('assets/certificate-5.svg', svg5);
fs.writeFileSync('assets/certificate-6.svg', svg6);
fs.writeFileSync('assets/certificate-7.svg', svg7);

console.log('SVGs written successfully. Converting to WebP...');

execSync('convert -density 150 assets/certificate-5.svg -quality 90 assets/certificate-5.webp');
execSync('convert -density 150 assets/certificate-6.svg -quality 90 assets/certificate-6.webp');
execSync('convert -density 150 assets/certificate-7.svg -quality 90 assets/certificate-7.webp');

console.log('WebPs generated successfully!');
