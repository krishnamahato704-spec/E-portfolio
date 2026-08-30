(function () {
  'use strict';

  const CORE_URL = 'https://cdn.jsdelivr.net/gh/krishnamahato704-spec/E-portfolio@c6029eeca2fe1344591e7d735604b1d2a7e719ba/supabase-storage.js';
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';
  const STORAGE_KEY = 'krishna_portfolio_v4';
  const SESSION_KEY = 'portfolio_editor_session';
  const SAFE_FILE_TYPES = /^(image\/(jpeg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|text\/(plain|csv))$/i;
  const SAFE_FILE_EXTENSIONS = /\.(jpe?g|png|gif|webp|pdf|docx?|pptx?|xlsx?|csv|txt)$/i;
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  let gallery = [];
  let originalRestore = null;
  let cloudDeletePatched = false;
  let uploadValidationPatched = false;
  let editorAuthPatched = false;

    function loadCore() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CORE_URL + '?v=1';
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Could not load portfolio cloud core.'));
      document.head.appendChild(script);
    });
  }

  function installFixes() {
    if (!document.body || document.body.dataset.portfolioFinalFixes === '1') return;
    document.body.dataset.portfolioFinalFixes = '1';

    const style = document.createElement('style');
    style.id = 'portfolio-final-fixes';
    style.textContent = `
      #experiences, #experiences .container, #experiences .card, #experiences .experience-card,
      #experiences .grid-2, #experiences .grid-3, #history-teaching, #history-teaching .card,
      .presentation-activities, .presentation-activities * { overflow: visible !important; height: auto !important; min-height: 0; }
      #experiences .grid-2 > *, #experiences .grid-3 > * { min-width: 0; overflow-wrap:anywhere; }
      @media (max-width:860px) {
        #experiences .grid-2, #experiences .grid-3 { grid-template-columns:1fr !important; }
        #history-teaching .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] { grid-template-columns:1fr !important; }
        #history-teaching .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] > span { display:none; }
        .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] { grid-template-columns:1fr !important; }
        .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] > span { display:none; }
      }

      /* Clean recruiter-facing CV placement: directly above the portrait. */
      .hero-cta .cv-download-link, .hero-cta .cv-disabled { display:none !important; }
      .cv-top-wrap { display:flex; flex-direction:column; align-items:center; gap:8px; margin-bottom:12px; width:min(240px,50vw); }
      .cv-top-wrap .cv-download-link { width:100%; background:var(--accent2); border-color:var(--accent2); box-shadow:0 6px 18px rgba(139,26,43,.18); }
      .cv-top-wrap .cv-download-link:hover, .cv-top-wrap .cv-download-link:focus-visible { background:#6f1322; border-color:#6f1322; }
      .cv-top-wrap .cv-download-link.cv-disabled { background:#e8e4dd; color:var(--muted); border-color:var(--border); box-shadow:none; cursor:not-allowed; }
      .cv-top-wrap .cv-edit-control { width:100%; }
      .cv-top-wrap .cv-delete-control { width:100%; background:transparent; color:var(--accent2); border:1px solid var(--accent2); }
      body:not(.editing) .cv-edit-control, body:not(.editing) .cv-delete-control { display:none !important; }
      footer .cv-download-link, footer .cv-disabled, footer .cv-edit-control { display:none !important; }
      #navbar .nav-cv-link { color:#fff !important; background:var(--accent2) !important; font-weight:800 !important; }

      section { scroll-margin-top:76px; }
      @media (max-width:760px) { .cv-top-wrap { width:min(280px,70vw); } }

      /* Final gallery */
      #portfolio-gallery { background:#fbf8f1; }
      body { background:#f6f1e8 !important; }
      section:not(#hero) { background:#f6f1e8 !important; }
      section:nth-of-type(odd):not(#hero) { background:#fbf8f1 !important; }
      .card, .evidence-card, .profile-item { box-shadow:0 6px 18px rgba(26,45,70,.08); }
      .card:hover, .evidence-card:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(26,45,70,.12); }
      #portfolio-gallery .gallery-grid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:14px; margin-top:18px; }
      #portfolio-gallery .gallery-card { position:relative; background:var(--card); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); min-width:0; }
      #portfolio-gallery .gallery-image-wrap { min-height:120px; background:#e8e4dd; display:flex; align-items:center; justify-content:center; overflow:hidden; }
      #portfolio-gallery .gallery-image-wrap img { width:100%; height:auto; max-height:280px; object-fit:contain; }
      #portfolio-gallery .gallery-caption { padding:10px 12px 13px; color:var(--muted); font-size:.86rem; min-height:42px; }
      .editing #portfolio-gallery .gallery-caption { outline:1px dashed var(--border); outline-offset:-3px; background:rgba(31,58,95,.03); }
      #portfolio-gallery .gallery-remove { display:none; position:absolute; right:8px; top:8px; z-index:2; border:0; background:rgba(139,26,43,.92); color:#fff; border-radius:7px; padding:6px 9px; cursor:pointer; font-size:.75rem; font-weight:700; }
      .editing #portfolio-gallery .gallery-remove { display:block; }
      #portfolio-gallery .gallery-empty { padding:30px 18px; text-align:center; color:var(--muted); border:1px dashed var(--border); border-radius:12px; background:rgba(255,255,255,.5); }
      #portfolio-gallery .gallery-upload { margin-top:14px; display:none; padding:14px; border:2px dashed rgba(31,58,95,.3); border-radius:12px; text-align:center; color:var(--muted); cursor:pointer; background:var(--card); }
      .editing #portfolio-gallery .gallery-upload { display:block; }
      @media (max-width:980px) { #portfolio-gallery .gallery-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
      @media (max-width:640px) { #portfolio-gallery .gallery-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; } }
      @media (max-width:420px) { #portfolio-gallery .gallery-grid { grid-template-columns:1fr; } }

      .hero .portrait-img { box-shadow:0 10px 24px rgba(20,36,54,.16); }
      .recruiter-snapshot { background:#fffdf8 !important; color:var(--text); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
      .recruiter-snapshot .section-label { color:var(--accent2); }
      .recruiter-snapshot .section-title { color:var(--accent); }
      .snapshot-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; margin-top:16px; }
      .snapshot-item { padding:16px 14px; border:1px solid var(--border); border-top:3px solid var(--accent2); background:#fff; box-shadow:none; }
      .snapshot-item strong { display:block; color:var(--accent); font-size:.7rem; text-transform:uppercase; letter-spacing:.12em; margin-bottom:6px; }
      .snapshot-item span { color:#263444; font-size:.94rem; line-height:1.45; }
      .process-rail { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:16px 0 4px; }
      .process-rail span { padding:8px 12px; border-radius:999px; background:rgba(184,134,11,.12); border:1px solid rgba(184,134,11,.32); color:var(--accent); font-size:.76rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
      .process-rail i { color:var(--gold); font-style:normal; font-size:1.1rem; }
      @media (max-width:980px) { .snapshot-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
      @media (max-width:600px) { .snapshot-grid { grid-template-columns:1fr 1fr; } .snapshot-item { padding:12px; } .process-rail { gap:5px; } .process-rail span { font-size:.68rem; padding:7px 9px; } }
      @media (max-width:420px) { .snapshot-grid { grid-template-columns:1fr; } }
      /* Visitor mode is the default: editing controls are opt-in. */
      body:not(.editing) #modeBar { display:none !important; }
      body:not(.editing) .view-only-placeholder { display:none !important; }
      .view-mode .upload-zone:not(:has(img)):not(:has(.resource-item)), .view-mode .academic-img:not(:has(img)) { display:none !important; }
      .view-mode .cert-upload:not(:has(img)) { display:none !important; }
      .thinking-lab { margin-top:18px; padding:26px 18px 20px; border:1px solid rgba(31,58,95,.2); border-top:3px solid var(--gold); background:#fbf8f1; color:var(--text); box-shadow:0 8px 20px rgba(20,36,54,.08); text-align:center; }
      .thinking-lab .lab-core { display:inline-flex; align-items:center; justify-content:center; width:190px; padding:10px 16px; border-bottom:2px solid var(--gold); color:var(--accent); font:700 1.05rem Georgia,serif; letter-spacing:.08em; text-transform:uppercase; }
      .thinking-lab .lab-nodes { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-top:18px; }
      .thinking-lab button { border:1px solid rgba(31,58,95,.28); padding:8px 12px; background:#fff; color:var(--accent); cursor:pointer; font:600 .78rem var(--font); transition:.2s; }
      .thinking-lab button:hover, .thinking-lab button.active { background:var(--gold-light); color:#1a1a2e; transform:translateY(-2px); }
      .thinking-lab .lab-note { min-height:1.4em; margin-top:12px; color:var(--muted); font-size:.9rem; }
      #profile .profile-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      #thinkers .card > div:first-child > span { display:inline-flex; width:52px; height:52px; align-items:center; justify-content:center; border:1px solid var(--border); color:var(--accent2); font-family:var(--serif); font-size:1rem !important; font-weight:700; }
      .public-empty-state { margin-top:14px; padding:18px; border:1px solid var(--border); border-left:3px solid var(--gold); color:#374151; background:#fffdf8; }
      .editing .public-empty-state { display:none !important; }
      :focus-visible { outline:3px solid #8b1a2b; outline-offset:3px; }
      html, body { max-width:100%; overflow-x:hidden; }
      @media (max-width:600px) { #profile .profile-grid { grid-template-columns:1fr; } .thinking-lab .lab-core { width:132px; font-size:.9rem; } .process-rail { align-items:stretch; } .process-rail span { flex:1 1 100%; text-align:center; } .process-rail i { display:none; } }
      @media (prefers-reduced-motion:reduce) { *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:.01ms !important; } }

      /* Forest Academic Library: restrained, warm and entirely two-dimensional. */
      :root {
        --bg:#f6f0e3; --card:#fffdf8; --text:#242b28; --muted:#56635d;
        --accent:#173f35; --accent2:#6f2934; --gold:#a88745; --gold-light:#d7bd7d;
        --border:#d9ceb9; --shadow:0 8px 22px rgba(16,46,39,.09); --radius:8px;
      }
      html { scroll-padding-top:76px; }
      body { background:#f6f0e3 !important; color:#242b28; font-size:17px; line-height:1.72; }
      #navbar { height:68px; background:#102e27 !important; border-bottom:2px solid #a88745; backdrop-filter:none; }
      #navbar .container { width:min(1280px,96%); }
      .nav-brand { font-family:var(--serif); letter-spacing:.02em; }
      .nav-brand span { color:#d7bd7d; }
      .nav-links { flex-wrap:nowrap; gap:2px; }
      .nav-links a { color:rgba(255,253,248,.82); border-radius:2px; padding:9px 10px; font-size:.78rem; text-transform:uppercase; letter-spacing:.055em; }
      .nav-links a:hover, .nav-links a:focus-visible, .nav-links a.active { color:#fffdf8; background:rgba(255,253,248,.09); box-shadow:inset 0 -2px #d7bd7d; }
      .nav-editor-entry { border:1px solid rgba(215,189,125,.72) !important; color:#fffdf8 !important; background:transparent !important; font-weight:800 !important; cursor:pointer; }
      .nav-editor-entry:hover { background:#a88745 !important; color:#102e27 !important; }
      .nav-editor-entry { font:800 .72rem var(--font); min-height:36px; padding:8px 10px; text-transform:uppercase; letter-spacing:.07em; }
      section:not(#hero), section:nth-of-type(odd):not(#hero), #portfolio-gallery { background:#f6f0e3 !important; }
      section:nth-of-type(even):not(#hero) { background:#ede2cc !important; }
      section { padding:clamp(46px,6vw,72px) 0; border-color:#d9ceb9; }
      .container { width:min(1160px,94%); }
      .hero { padding:clamp(58px,8vw,94px) 0 64px; background:#ede2cc !important; border-bottom:1px solid #cdbb9b; position:relative; }
      .hero::before { content:""; position:absolute; inset:0 auto 0 0; width:10px; background:#173f35; }
      .hero::after { content:"ARCHIVE · PEDAGOGY · INQUIRY"; position:absolute; right:3%; bottom:14px; color:rgba(23,63,53,.38); font:700 .65rem var(--font); letter-spacing:.22em; }
      .hero-grid { grid-template-columns:minmax(0,1.35fr) minmax(230px,.65fr); gap:clamp(30px,6vw,76px); }
      .hero h1 { color:#102e27; font-size:clamp(3rem,7vw,5.7rem); line-height:.88; }
      .hero h1 em { color:#6f2934; }
      .hero .lead { color:#35453e; font-size:1.15rem; }
      .portrait-img { width:min(250px,64vw); border:7px solid #fffdf8; border-radius:3px; box-shadow:10px 10px 0 #819b82, 0 15px 28px rgba(16,46,39,.16); object-fit:cover; }
      .section-label { color:#6f2934; font-size:.72rem; letter-spacing:.18em; }
      .section-title { color:#173f35; font-size:clamp(2rem,4vw,3.25rem); }
      .section-desc, .card p, .profile-note { color:#56635d; font-size:1rem; }
      .card, .evidence-card, .profile-item, .snapshot-item { border-radius:4px; border-color:#d9ceb9; box-shadow:none; background:#fffdf8; }
      .card:hover, .evidence-card:hover { transform:translateY(-2px); box-shadow:0 10px 22px rgba(16,46,39,.10); }
      .card { border-top:2px solid #819b82; }
      .feature-block { background:#173f35 !important; border-radius:4px; }
      .tag, .skill-pill { border-radius:2px; background:#ede2cc; color:#173f35; border-color:#cdbb9b; }
      .cta-button { border-radius:3px; min-height:46px; padding:11px 18px; background:#173f35; border-color:#173f35; text-transform:uppercase; letter-spacing:.06em; }
      .cta-button:hover, .cta-button:focus-visible { background:#6f2934; border-color:#6f2934; }
      .cta-button.secondary { color:#173f35; background:transparent; border-color:#819b82; }
      .hero-cta .cv-download-link { display:inline-flex !important; }
      .hero-cta .cv-download-link[hidden] { display:none !important; }
      .hero-cta .cv-edit-control { display:none !important; }
      .timeline { border-left-color:#819b82; }
      .timeline-item::before { background:#a88745; border-radius:0; box-shadow:0 0 0 4px #f6f0e3; }
      .recruiter-snapshot { background:#fffdf8 !important; }
      .snapshot-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
      .snapshot-item { border-top:0; border-left:4px solid #819b82; }
      .snapshot-item strong { color:#6f2934; }
      .process-rail span { border-radius:2px; background:#fffdf8; border-color:#cdbb9b; color:#173f35; }
      .thinking-lab { background:#fffdf8; border-color:#d9ceb9; border-top-color:#a88745; box-shadow:none; }
      .thinking-lab button { background:#f6f0e3; color:#173f35; border-color:#819b82; border-radius:2px; }
      .thinking-lab button:hover, .thinking-lab button.active { background:#173f35; color:#fffdf8; }
      footer { background:#102e27 !important; border-top:4px solid #a88745; }
      :focus-visible { outline:3px solid #a88745 !important; outline-offset:3px; }

      /* Auth modal and explicit edit entry. */
      .editor-modal[hidden] { display:none !important; }
      .editor-modal { position:fixed; inset:0; z-index:4000; display:grid; place-items:center; padding:20px; background:rgba(16,46,39,.78); }
      .editor-dialog { width:min(460px,100%); background:#fffdf8; border:1px solid #a88745; border-top:7px solid #173f35; box-shadow:0 24px 70px rgba(0,0,0,.28); padding:28px; position:relative; }
      .editor-dialog h2 { font:700 2rem/1.05 var(--serif); color:#173f35; margin-bottom:8px; }
      .editor-dialog p { color:#56635d; margin-bottom:18px; }
      .editor-dialog label { display:block; font-size:.78rem; font-weight:800; color:#173f35; letter-spacing:.07em; text-transform:uppercase; margin:12px 0 5px; }
      .editor-dialog input { width:100%; min-height:46px; border:1px solid #a99d87; background:#fff; color:#242b28; padding:10px 12px; font:inherit; border-radius:2px; }
      .editor-dialog-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
      .editor-dialog-status { min-height:1.45em; margin-top:12px !important; color:#6f2934 !important; font-size:.88rem; }
      .editor-close { position:absolute; top:10px; right:10px; border:0; background:transparent; color:#173f35; font-size:1.4rem; min-width:40px; min-height:40px; cursor:pointer; }
      body.modal-open { overflow:hidden; }

      /* One clear authenticated toolbar; never visible to visitors. */
      body:not(.editing) #modeBar { display:none !important; }
      #modeBar { background:#102e27; border:1px solid #a88745; border-radius:4px; max-width:min(980px,96vw); }
      #modeBar .mode-btn { min-height:38px; border-radius:2px; font-size:.74rem; }
      #modeBar .mode-status { color:#d7bd7d; }
      #modeBar #editBtn, #modeBar #resetBtn, #modeBar #modeHint, #modeBar .edit-lock { display:none !important; }
      .editor-toolbar-btn { border:1px solid rgba(255,253,248,.24) !important; }
      .editor-toolbar-btn.logout { color:#ffd9d9; }

      /* Consistent editor-only media management. */
      .media-action-bar { display:none; gap:7px; flex-wrap:wrap; align-items:center; justify-content:center; margin:10px 0 2px; width:100%; }
      .editing .media-action-bar { display:flex; }
      .media-action-bar button, .resource-action { min-height:34px; border:1px solid #819b82; background:#fffdf8; color:#173f35; padding:6px 10px; border-radius:2px; font:700 .74rem var(--font); cursor:pointer; }
      .media-action-bar .danger, .resource-action.danger { color:#6f2934; border-color:#b78d94; }
      .resource-actions { display:flex; gap:5px; margin-left:auto; }
      .resource-action { display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
      body:not(.editing) .resource-action.replace, body:not(.editing) .resource-action.danger { display:none !important; }
      .resource-item { gap:9px; align-items:center; }
      .resource-icon { width:34px; height:34px; border:1px solid #cdbb9b; background:#ede2cc; display:inline-flex; align-items:center; justify-content:center; color:#173f35; font-size:0; flex:0 0 auto; }
      .resource-icon::after { content:"DOC"; font:800 .58rem var(--font); letter-spacing:.03em; }
      .resource-icon[data-kind="PDF"]::after { content:"PDF"; }
      .resource-icon[data-kind="Word"]::after { content:"DOC"; }
      .resource-icon[data-kind="Slides"]::after { content:"PPT"; }
      .resource-icon[data-kind="Sheet"]::after { content:"XLS"; }
      .resource-icon[data-kind="Image"]::after { content:"IMG"; }
      .resource-delete { display:none !important; }
      .gallery-image-wrap { aspect-ratio:4/3; min-height:0 !important; }
      #portfolio-gallery .gallery-image-wrap img { width:100%; height:100%; max-height:none; object-fit:cover; }
      .public-empty-state { background:#fffdf8; }
      .editing .upload-zone, .editing .cert-upload, .editing .academic-img { background:#fffdf8; border-color:#819b82; }
      .upload-zone img, .cert-upload img, .academic-img img { max-height:320px !important; object-fit:contain !important; }

      @media (max-width:900px) {
        .nav-links { flex-direction:column; flex-wrap:nowrap; background:#102e27 !important; max-height:calc(100vh - 68px); overflow:auto; }
        .nav-links a { display:block; min-height:44px; padding:12px 18px; }
        .snapshot-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
      @media (max-width:700px) {
        body { font-size:16px; }
        section { padding:42px 0; }
        .hero-grid { grid-template-columns:1fr; text-align:center; }
        .hero .lead, .hero p { margin-left:auto; margin-right:auto; }
        .hero::after { display:none; }
        .snapshot-grid { grid-template-columns:1fr; }
        #modeBar { bottom:8px; width:calc(100% - 16px); max-height:42vh; overflow:auto; border-radius:3px; padding:9px; }
        #modeBar .mode-btn { flex:1 1 42%; min-height:44px; }
        .resource-item { align-items:flex-start; flex-wrap:wrap; }
        .resource-actions { width:100%; margin-left:43px; }
        .resource-action { flex:1; min-height:42px; }
      }
    `;
    document.head.appendChild(style);

    function replaceEmojiIcons() {
      const map = {'📜':'▤','🏛️':'▥','🎓':'▣','🌟':'✦','🔍':'⌕','🛤️':'↗','🌱':'↗','👏':'＋','❤️':'♥','❓':'?','💭':'◌','📖':'▤','🗺️':'⊞','🖼️':'▧','📘':'▤','🎯':'◎','✍️':'✎','📸':'▧','✏️':'✎','🔎':'⌕','🔒':'▣','🕊️':'RT','🌿':'','🧠':'LV'};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = []; let node;
      while ((node = walker.nextNode())) nodes.push(node);
      nodes.forEach(textNode => { let value = textNode.nodeValue; Object.keys(map).forEach(icon => { value = value.split(icon).join(map[icon]); }); textNode.nodeValue = value; });
    }

    function polishHero() {
      const heroLabel = document.querySelector('#hero .section-label');
      if (heroLabel) heroLabel.textContent = 'History Educator · Social Science · Emerging Educator';
      const cta = document.querySelector('#hero .hero-cta');
      if (cta && !cta.querySelector('.explore-portfolio')) {
        const link = document.createElement('a');
        link.className = 'cta-button secondary explore-portfolio'; link.href = '#profile'; link.textContent = 'Explore my portfolio';
        cta.insertBefore(link, cta.firstChild);
      }
    }

    function addRecruiterSnapshot() {
      if (document.getElementById('recruiter-snapshot')) return;
      const hero = document.getElementById('hero');
      const profile = document.getElementById('profile');
      if (!hero || !profile) return;
      const section = document.createElement('section');
      section.id = 'recruiter-snapshot'; section.className = 'recruiter-snapshot';
      section.innerHTML = '<div class="container"><div class="section-label">Recruiter Snapshot</div><h2 class="section-title">The essentials at a glance</h2><div class="snapshot-grid"><div class="snapshot-item"><strong>Target roles</strong><span>TGT History / Social Science<br>PGT History</span></div><div class="snapshot-item"><strong>Subjects</strong><span>History · Economics · English</span></div><div class="snapshot-item"><strong>Academic background</strong><span>B.A. History &amp; Economics<br>B.Ed. · M.A. History</span></div><div class="snapshot-item"><strong>Core strengths</strong><span>Historical Thinking<br>Lesson Planning · Assessment · Differentiated Support</span></div><div class="snapshot-item"><strong>Teaching exposure</strong><span>School Observation<br>5-week Teaching Internship</span></div><div class="snapshot-item"><strong>Languages</strong><span>English · Hindi · Nepali · Maithili</span></div></div></div>';
      hero.after(section);
    }

    function addProcessRails() {
      const rails = [
        ['why-history',['MEMORISATION','QUESTIONING','EVIDENCE','INTERPRETATION','UNDERSTANDING']],
        ['philosophy',['THE WHOLE LEARNER','HOLISTIC DEVELOPMENT','SEEING POTENTIAL','DIFFERENTIATION','REFLECTIVE PRACTICE']],
        ['my-work',['PLAN','TEACH','ASSESS','REFLECT']],
        ['assessment',['CHECK UNDERSTANDING','ANALYSE EVIDENCE','GIVE FEEDBACK','ADJUST INSTRUCTION','CHECK AGAIN']],
        ['differentiation',['SCAFFOLD','OFFER CHOICE','EXTEND','DEEP UNDERSTANDING']],
        ['reflection',['WHAT HAPPENED?','WHAT DID I LEARN?','WHAT WORKED WELL?','WHAT WILL I CHANGE?']]
      ];
      rails.forEach(([id, steps]) => { const section = document.getElementById(id); const container = section?.querySelector(':scope > .container'); if (!container || container.querySelector('.process-rail')) return; const rail = document.createElement('div'); rail.className='process-rail'; rail.setAttribute('aria-label','Teaching process'); rail.innerHTML=steps.map((s,i)=>(i?'<i aria-hidden="true">→</i>':'')+'<span>'+s+'</span>').join(''); const title=container.querySelector('.section-title'); (title?.parentElement || container).appendChild(rail); });
    }

    function readSession() {
      try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
    }

    function validSession() {
      const session = readSession();
      if (!session?.access_token) return false;
      if (!session.expires_at) return true;
      return Number(session.expires_at) * 1000 > Date.now() + 30000;
    }

    function ensureEditorNavEntry() {
      const nav = document.getElementById('navLinks');
      if (!nav || nav.querySelector('.nav-editor-entry')) return;
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nav-links-link nav-editor-entry';
      button.textContent = 'Edit Portfolio';
      button.setAttribute('aria-haspopup', 'dialog');
      button.addEventListener('click', openEditorLogin);
      item.appendChild(button);
      nav.appendChild(item);
    }

    function ensureLoginModal() {
      let modal = document.getElementById('editorLoginModal');
      if (modal) return modal;
      modal = document.createElement('div');
      modal.id = 'editorLoginModal';
      modal.className = 'editor-modal';
      modal.hidden = true;
      modal.innerHTML = `
        <div class="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editorLoginTitle" aria-describedby="editorLoginDescription">
          <button class="editor-close" type="button" aria-label="Close editor login">×</button>
          <div class="section-label">Portfolio owner access</div>
          <h2 id="editorLoginTitle">Edit portfolio</h2>
          <p id="editorLoginDescription">Sign in with the Supabase account authorised to manage this portfolio.</p>
          <form id="editorLoginForm">
            <label for="editorEmail">Email</label>
            <input id="editorEmail" name="email" type="email" autocomplete="username" required>
            <label for="editorPassword">Password</label>
            <input id="editorPassword" name="password" type="password" autocomplete="current-password" required>
            <p class="editor-dialog-status" id="editorLoginStatus" role="status" aria-live="polite"></p>
            <div class="editor-dialog-actions">
              <button class="cta-button secondary editor-cancel" type="button">Cancel</button>
              <button class="cta-button" type="submit">Sign in securely</button>
            </div>
          </form>
        </div>`;
      document.body.appendChild(modal);
      const close = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        modal.querySelector('#editorPassword').value = '';
        modal._returnFocus?.focus?.();
      };
      modal.querySelector('.editor-close').addEventListener('click', close);
      modal.querySelector('.editor-cancel').addEventListener('click', close);
      modal.addEventListener('click', event => { if (event.target === modal) close(); });
      modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
        if (event.key !== 'Tab') return;
        const focusable = Array.from(modal.querySelectorAll('button,input')).filter(el => !el.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      modal.querySelector('#editorLoginForm').addEventListener('submit', async event => {
        event.preventDefault();
        const status = modal.querySelector('#editorLoginStatus');
        const submit = event.currentTarget.querySelector('[type="submit"]');
        const email = modal.querySelector('#editorEmail').value.trim();
        const password = modal.querySelector('#editorPassword').value;
        status.textContent = 'Checking your account…';
        submit.disabled = true;
        try {
          const response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
            method:'POST',
            headers:{ apikey:SUPABASE_KEY, 'Content-Type':'application/json' },
            body:JSON.stringify({ email, password })
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload.access_token) throw new Error(payload.error_description || payload.msg || 'Sign-in failed. Check the email and password.');
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
          status.textContent = 'Signed in. Opening the editor…';
          close();
          document.getElementById('editBtn')?.click();
          setTimeout(() => { enhanceEditorToolbar(); manageMediaControls(); }, 80);
        } catch (error) {
          status.textContent = error.message || 'The editor could not be opened.';
          modal.querySelector('#editorPassword').select();
        } finally { submit.disabled = false; }
      });
      return modal;
    }

    function openEditorLogin(event) {
      event?.preventDefault?.();
      document.getElementById('navLinks')?.classList.remove('open');
      if (validSession()) {
        document.getElementById('editBtn')?.click();
        setTimeout(() => { enhanceEditorToolbar(); manageMediaControls(); }, 80);
        return;
      }
      sessionStorage.removeItem(SESSION_KEY);
      const modal = ensureLoginModal();
      modal._returnFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => modal.querySelector('#editorEmail')?.focus());
    }

    function patchEditorAuthentication() {
      if (editorAuthPatched || !window.PortfolioCloud?.signInEditor) return;
      window.PortfolioCloud.signInEditor = async function () {
        if (validSession()) return readSession();
        sessionStorage.removeItem(SESSION_KEY);
        openEditorLogin();
        throw new Error('');
      };
      editorAuthPatched = true;
    }

    async function logOutEditor() {
      const session = readSession();
      document.getElementById('viewBtn')?.click();
      if (document.body.classList.contains('editing')) return;
      sessionStorage.removeItem(SESSION_KEY);
      if (session?.access_token) {
        fetch(SUPABASE_URL + '/auth/v1/logout', { method:'POST', headers:{ apikey:SUPABASE_KEY, Authorization:'Bearer ' + session.access_token } }).catch(() => {});
      }
      document.getElementById('modeStatus').textContent = 'Signed out';
    }

    function enhanceEditorToolbar() {
      const bar = document.getElementById('modeBar');
      if (!bar || bar.dataset.enhanced === '1') return;
      bar.dataset.enhanced = '1';
      const status = document.getElementById('modeStatus');
      if (status) { status.textContent = 'Edit Mode'; status.setAttribute('aria-live', 'polite'); }
      const previewButton = document.getElementById('viewBtn');
      if (previewButton) previewButton.textContent = 'Preview';
      document.getElementById('editBtn')?.addEventListener('click', () => setTimeout(() => {
        if (document.body.classList.contains('editing') && status) status.textContent = 'Edit Mode';
      }, 0));
      const addButton = (label, className, handler) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'mode-btn editor-toolbar-btn ' + className; button.textContent = label;
        button.addEventListener('click', handler); bar.appendChild(button); return button;
      };
      addButton('Add Content', 'add-content', () => document.getElementById('sectionAddBtn')?.click());
      addButton('Upload File', 'upload-file', () => {
        document.getElementById('my-work')?.scrollIntoView({ behavior:'smooth', block:'start' });
        setTimeout(() => document.getElementById('workInput1')?.click(), 350);
      });
      addButton('Manage CV', 'manage-cv', openCvManager);
      addButton('Log Out', 'logout', logOutEditor);
    }

    function installEditorEntry() {
      ensureLoginModal();
      ensureEditorNavEntry();
      enhanceEditorToolbar();
      if (document.body.dataset.editorEntryReady === '1') return;
      document.body.dataset.editorEntryReady = '1';
      document.addEventListener('keydown', event => {
        if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'e') openEditorLogin(event);
      });
    }

    function addThinkingLab() {
      const section = document.getElementById('history-teaching');
      const container = section?.querySelector(':scope > .container');
      if (!container || container.querySelector('.thinking-lab')) return;
      const lab = document.createElement('div'); lab.className='thinking-lab';
      lab.innerHTML = '<div class="card-label">History Thinking Map</div><div class="lab-core">Historical<br>Thinking</div><div class="lab-nodes"><button type="button">Questioning</button><button type="button">Comparison</button><button type="button">Interpretation</button><button type="button">Primary Sources</button><button type="button">Chronology</button><button type="button">Cause &amp; Consequence</button><button type="button">Change &amp; Continuity</button><button type="button">Source Analysis</button><button type="button">Evidence-Based Reasoning</button><button type="button">Argumentation</button></div><div class="lab-note" aria-live="polite">Select a concept to see how it supports deeper understanding.</div>';
      const note = lab.querySelector('.lab-note');
      lab.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { lab.querySelectorAll('button').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); note.textContent = btn.textContent + ' connects learners to Historical Thinking and deeper understanding.'; }));
      container.appendChild(lab);
    }

    function updatePublicEmptyStates() {
      const certificates = document.getElementById('certificates');
      if (certificates) {
        let empty = certificates.querySelector('.public-empty-state');
        const hasCertificate = !!certificates.querySelector('.cert-upload img');
        if (!empty) {
          empty = document.createElement('p');
          empty.className = 'public-empty-state';
          empty.textContent = 'Professional credentials will be added here as they become available.';
          certificates.querySelector('.container')?.appendChild(empty);
        }
        empty.hidden = hasCertificate;
      }
      document.querySelectorAll('#my-work .evidence-card').forEach(card => {
        let empty = card.querySelector('.public-empty-state');
        const hasEvidence = !!card.querySelector('.resource-item, .evidence-preview img');
        if (!empty) {
          empty = document.createElement('p');
          empty.className = 'public-empty-state';
          empty.textContent = 'Selected teaching evidence will appear here when available.';
          card.appendChild(empty);
        }
        empty.hidden = hasEvidence;
      });
    }

    function patchCloudDelete() {
      if (cloudDeletePatched || !window.PortfolioCloud || typeof window.PortfolioCloud.deleteFile !== 'function') return;
      const originalDelete = window.PortfolioCloud.deleteFile;
      window.PortfolioCloud.deleteFile = async function (path) {
        try {
          if (!validSession()) throw new Error('Your editor session expired. Sign in again before deleting a file.');
          return await originalDelete(path);
        } catch (firstError) {
          // A previous delete may have removed the object while its metadata
          // remained in the portfolio row. Treat that stale-object response as
          // already deleted so the metadata can still be cleaned up.
          if (/\(400\)|not found|does not exist/i.test(firstError?.message || '')) return;
          // Never fall back to the core browser prompt. Expired sessions return
          // to the explicit, accessible login flow on the next edit attempt.
          if (/401|jwt|token|unauthor|session expired/i.test(firstError?.message || '')) {
            sessionStorage.removeItem(SESSION_KEY);
            throw new Error('Your editor session expired. Log out, then use Edit Portfolio to sign in again.');
          }
          throw firstError;
        }
      };
      cloudDeletePatched = true;
    }

    function addTeachingScope() {
      const profile = document.querySelector('#profile > .container');
      if (!profile || profile.querySelector('.teaching-scope-card')) return;
      const card = document.createElement('div');
      card.className = 'card teaching-scope-card';
      card.style.cssText = 'margin-top:18px;border-left:4px solid var(--accent2);';
      card.innerHTML = '<div class="card-label">Teaching scope</div><h3>History · Economics · English</h3><p>History and Economics are supported by academic study, while English is my second B.Ed. pedagogy with internship teaching exposure. Five years of UPSC preparation also support informed teaching of Indian polity, governance and public affairs.</p>';
      profile.appendChild(card);
    }

    function fixNavigation() {
      const nav = document.getElementById('navLinks');
      if (!nav) return;
      nav.innerHTML = `
        <li><a href="#hero">Home</a></li>
        <li><a href="#profile">Profile</a></li>
        <li><a href="#academic-journey">Qualifications</a></li>
        <li><a href="#experiences">Experience</a></li>
        <li><a href="#philosophy">Teaching</a></li>
        <li><a href="#my-work">Teaching Evidence</a></li>
        <li><a href="#skills">Professional Growth</a></li>
        <li><a href="#reflection">Reflection</a></li>
        <li><a href="#contact">Contact</a></li>`;
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
      ensureEditorNavEntry();
    }

    function fixSectionNumbers() {
      const map = {
        profile:'01 · Profile',
        'academic-journey':'02 · Qualifications',
        'why-history':'03 · Why History',
        philosophy:'04 · Teaching Philosophy',
        'history-teaching':'05 · Subject Expertise',
        thinkers:'06 · Thinkers',
        experiences:'07 · Experience',
        'my-work':'08 · Teaching Evidence',
        assessment:'09 · Assessment',
        differentiation:'10 · Inclusive Practice',
        skills:'11 · Competencies',
        certificates:'12 · Certificates',
        reflection:'13 · Reflection & Growth',
        'school-fit':'14 · What I Bring to a School'
      };
      Object.keys(map).forEach(id => {
        const el = document.querySelector('#' + id + ' > .container > .section-label');
        if (el) el.textContent = map[id];
      });
      const contact = document.querySelector('#contact .section-label');
      if (contact) contact.textContent = '15 · Contact';
    }

    function orderEditorialSections() {
      const footer = document.querySelector('footer');
      if (!footer) return;
      ['hero','recruiter-snapshot','profile','academic-journey','why-history','philosophy','history-teaching','thinkers','experiences','my-work','assessment','differentiation','skills','certificates','reflection','portfolio-gallery','school-fit']
        .forEach(id => { const section = document.getElementById(id); if (section) footer.before(section); });
    }

    function moveCvToTop() {
      const cta = document.querySelector('#hero .hero-cta');
      if (!cta) return;
      const cv = document.querySelector('.cv-top-wrap .cv-download-link, .hero-cta .cv-download-link');
      if (cv && cv.parentElement !== cta) cta.insertBefore(cv, cta.querySelector('[href="#contact"]'));
      const edit = document.querySelector('.cv-top-wrap .cv-edit-control, .hero-cta .cv-edit-control');
      if (edit && edit.parentElement !== cta) cta.appendChild(edit);
      document.querySelectorAll('.hero-cta .cv-disabled').forEach(el => el.remove());
      document.querySelectorAll('.cv-top-wrap').forEach(top => { if (!top.children.length) top.remove(); });
      const link = cta.querySelector('.cv-download-link');
      if (link) {
        const meta = window.PortfolioCloud?.getCv?.() || null;
        link.hidden = !meta?.url;
        if (!meta?.url) link.removeAttribute('href');
        link.textContent = 'Download CV';
        link.setAttribute('aria-label', 'Download CV');
        link.setAttribute('download', 'Krishna-Mahato-CV.pdf');
      }
      document.querySelectorAll('#contact .cv-download-link, #contact .cv-disabled, #contact .cv-edit-control').forEach(el => el.remove());
    }

    function sessionHeaders() {
      let token = '';
      try { token = JSON.parse(sessionStorage.getItem('portfolio_editor_session') || 'null')?.access_token || ''; } catch (_) {}
      const headers = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' };
      if (token) headers.Authorization = 'Bearer ' + token;
      return headers;
    }

    async function deleteCv() {
      const meta = window.PortfolioCloud && window.PortfolioCloud.getCv ? window.PortfolioCloud.getCv() : null;
      if (!meta || !meta.url) return;
      if (!confirm('Delete the current CV from the portfolio?')) return;
      const status = document.getElementById('modeStatus');
      try {
        if (status) status.textContent = 'Deleting CV…';
        if (meta.path && window.PortfolioCloud.deleteFile) await window.PortfolioCloud.deleteFile(meta.path);
        const state = window.__portfolio.snapshot();
        state.gallery = gallery;
        state.cv = null;
        const response = await fetch(SUPABASE_URL + '/rest/v1/portfolio_state?id=eq.1', {
          method: 'PATCH', headers: sessionHeaders(), body: JSON.stringify({ data: state, updated_at: new Date().toISOString() })
        });
        if (!response.ok) throw new Error('The CV record could not be updated in Supabase.');
        alert('CV deleted. The page will refresh now.');
        location.reload();
      } catch (error) {
        if (status) status.textContent = 'CV delete failed';
        alert(error.message || 'The CV could not be deleted.');
      }
    }

    function ensureCvDeleteControl() {
      const top = document.querySelector('.cv-top-wrap');
      if (!top || top.querySelector('.cv-delete-control')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cta-button cv-delete-control';
      button.textContent = 'Delete current CV';
      button.style.display = 'none';
      button.addEventListener('click', deleteCv);
      top.appendChild(button);
      const sync = () => { button.style.display = document.body.classList.contains('editing') && window.PortfolioCloud?.getCv?.() ? 'inline-block' : 'none'; };
      sync();
      new MutationObserver(sync).observe(document.body, { attributes:true, childList:true, subtree:true, attributeFilter:['class','style'] });
    }

    function ensureCvManager() {
      let modal = document.getElementById('cvManagerModal');
      if (modal) return modal;
      modal = document.createElement('div');
      modal.id = 'cvManagerModal';
      modal.className = 'editor-modal';
      modal.hidden = true;
      modal.innerHTML = `
        <div class="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="cvManagerTitle">
          <button class="editor-close" type="button" aria-label="Close CV manager">×</button>
          <div class="section-label">Recruiter document</div>
          <h2 id="cvManagerTitle">Manage CV</h2>
          <p class="cv-manager-summary"></p>
          <div class="editor-dialog-actions cv-manager-actions"></div>
        </div>`;
      document.body.appendChild(modal);
      const close = () => { modal.hidden = true; document.body.classList.remove('modal-open'); modal._returnFocus?.focus?.(); };
      modal.querySelector('.editor-close').addEventListener('click', close);
      modal.addEventListener('click', event => { if (event.target === modal) close(); });
      modal.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
      modal._close = close;
      return modal;
    }

    function openCvManager(event) {
      event?.preventDefault?.();
      if (!document.body.classList.contains('editing')) return;
      const modal = ensureCvManager();
      const meta = window.PortfolioCloud?.getCv?.() || null;
      const summary = modal.querySelector('.cv-manager-summary');
      const actions = modal.querySelector('.cv-manager-actions');
      summary.textContent = meta?.name ? 'Current file: ' + meta.name : 'No CV is currently published.';
      actions.innerHTML = '';
      if (meta?.url) {
        const view = document.createElement('a');
        view.className = 'cta-button secondary'; view.href = meta.downloadUrl || meta.url; view.target = '_blank'; view.rel = 'noopener'; view.textContent = 'View / Download';
        actions.appendChild(view);
      }
      const upload = document.createElement('button');
      upload.type = 'button'; upload.className = 'cta-button'; upload.textContent = meta?.url ? 'Replace CV' : 'Upload CV';
      upload.addEventListener('click', () => { modal._close(); document.getElementById('cvEditorInput')?.click(); });
      actions.appendChild(upload);
      if (meta?.url) {
        const remove = document.createElement('button');
        remove.type = 'button'; remove.className = 'cta-button secondary'; remove.textContent = 'Delete CV';
        remove.addEventListener('click', () => { modal._close(); deleteCv(); });
        actions.appendChild(remove);
      }
      modal._returnFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => modal.querySelector('.editor-close')?.focus());
    }

    function validateUpload(file) {
      if (!file) throw new Error('Choose a file to upload.');
      if (file.size > MAX_FILE_BYTES) throw new Error('“' + file.name + '” is larger than the 25 MB upload limit.');
      if (!SAFE_FILE_TYPES.test(file.type || '') && !SAFE_FILE_EXTENSIONS.test(file.name || '')) {
        throw new Error('“' + file.name + '” is not a supported image, PDF, Word, PowerPoint, spreadsheet, CSV, or text file.');
      }
    }

    function patchUploadValidation() {
      if (uploadValidationPatched || !window.PortfolioCloud?.uploadFile) return;
      const originalUpload = window.PortfolioCloud.uploadFile;
      window.PortfolioCloud.uploadFile = async function (file, folder) {
        validateUpload(file);
        if (!validSession()) {
          sessionStorage.removeItem(SESSION_KEY);
          throw new Error('Your editor session expired. Use Edit Portfolio to sign in again.');
        }
        return originalUpload(file, folder);
      };
      uploadValidationPatched = true;
    }

    function portraitPlaceholder() {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23ede2cc'/%3E%3Crect x='34' y='34' width='332' height='432' fill='none' stroke='%23819b82' stroke-width='3'/%3E%3Ctext x='200' y='245' text-anchor='middle' font-family='Georgia,serif' font-size='28' fill='%23173f35'%3EKrishna Mahato%3C/text%3E%3Ctext x='200' y='280' text-anchor='middle' font-family='Arial,sans-serif' font-size='13' letter-spacing='2' fill='%2356635d'%3EPROFILE PHOTOGRAPH%3C/text%3E%3C/svg%3E";
    }

    function addImageActionBar(zone) {
      if (!zone || zone.querySelector(':scope > .media-action-bar')) return;
      const input = zone.querySelector('input[type="file"]');
      const caption = zone.querySelector('.img-caption');
      const bar = document.createElement('div');
      bar.className = 'media-action-bar';
      const button = (label, className, action) => {
        const el = document.createElement('button'); el.type = 'button'; el.className = className || ''; el.textContent = label;
        el.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); action(); }); bar.appendChild(el);
      };
      button(input?.multiple ? 'Add images' : 'Upload / replace', '', () => input?.click());
      button('View', '', () => { const img = zone.querySelector('img'); if (img?.src) window.open(img.src, '_blank', 'noopener'); });
      if (caption) button('Edit caption', '', () => { caption.focus(); const selection = window.getSelection(); selection?.selectAllChildren(caption); selection?.collapseToEnd(); });
      button('Delete', 'danger', () => {
        const remove = zone.querySelector('.img-remove-btn');
        if (remove) remove.click();
        else {
          const img = zone.querySelector('img');
          if (!img || !confirm('Delete this image from the portfolio?')) return;
          img.remove();
          const svg = zone.querySelector('svg'); if (svg) svg.style.display = '';
          window.__portfolio?.saveToStorage?.();
          manageMediaControls();
        }
      });
      zone.appendChild(bar);
    }

    function addPortraitActions() {
      const wrap = document.querySelector('.portrait-wrap');
      const portrait = document.getElementById('portraitImg');
      if (!wrap || !portrait || wrap.querySelector(':scope > .portrait-actions')) return;
      const bar = document.createElement('div');
      bar.className = 'media-action-bar portrait-actions';
      bar.innerHTML = '<button type="button">Upload / replace</button><button type="button">View</button><button type="button" class="danger">Delete</button>';
      const buttons = bar.querySelectorAll('button');
      buttons[0].addEventListener('click', event => { event.stopPropagation(); portrait.click(); });
      buttons[1].addEventListener('click', event => { event.stopPropagation(); window.open(portrait.src, '_blank', 'noopener'); });
      buttons[2].addEventListener('click', event => {
        event.stopPropagation();
        if (!confirm('Remove the current profile photograph?')) return;
        portrait.src = portraitPlaceholder();
        window.__portfolio?.saveToStorage?.();
      });
      wrap.appendChild(bar);
    }

    function resourceFolder(listId) {
      return { workResources1:'lesson-plans', workResources2:'teaching-resources', workResources3:'assessment-evidence' }[listId] || 'documents';
    }

    async function replaceResource(listId, index) {
      const sourceInput = document.getElementById({ workResources1:'workInput1', workResources2:'workInput2', workResources3:'workInput3' }[listId]);
      if (!sourceInput || !window.PortfolioCloud) return;
      const picker = document.createElement('input');
      picker.type = 'file'; picker.accept = sourceInput.accept; picker.hidden = true; document.body.appendChild(picker);
      picker.addEventListener('change', async () => {
        const file = picker.files?.[0]; picker.remove(); if (!file) return;
        const status = document.getElementById('modeStatus');
        try {
          status.textContent = 'Replacing file…';
          const uploaded = await window.PortfolioCloud.uploadFile(file, resourceFolder(listId));
          const state = window.__portfolio.snapshot();
          const old = state.resources?.[listId]?.[index];
          if (!old) throw new Error('The original file could not be found.');
          state.resources[listId][index] = uploaded;
          window.__portfolio.restore(state);
          window.__portfolio.saveToStorage();
          if (old.path) await window.PortfolioCloud.deleteFile(old.path);
          setTimeout(manageMediaControls, 120);
        } catch (error) { alert(error.message || 'The file could not be replaced.'); }
        finally { status.textContent = 'Edit Mode'; }
      }, { once:true });
      picker.click();
    }

    function manageResourceActions() {
      document.querySelectorAll('.resource-list').forEach(list => {
        Array.from(list.querySelectorAll('.resource-item')).forEach((item, index) => {
          if (item.querySelector('.resource-actions')) return;
          const link = item.querySelector('.resource-link');
          const kind = item.querySelector('.resource-size')?.textContent?.trim() || 'Document';
          const icon = item.querySelector('.resource-icon');
          if (icon) icon.dataset.kind = kind;
          const actions = document.createElement('div'); actions.className = 'resource-actions';
          const view = document.createElement('a'); view.className = 'resource-action'; view.href = link?.href || '#'; view.target = '_blank'; view.rel = 'noopener'; view.textContent = 'View';
          const download = document.createElement('a'); download.className = 'resource-action'; download.href = link?.href || '#'; download.download = link?.getAttribute('download') || ''; download.textContent = 'Download';
          const replace = document.createElement('button'); replace.type = 'button'; replace.className = 'resource-action replace'; replace.textContent = 'Replace'; replace.addEventListener('click', () => replaceResource(list.id, index));
          const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'resource-action danger'; remove.textContent = 'Delete'; remove.addEventListener('click', () => item.querySelector('.resource-delete')?.click());
          actions.append(view, download, replace, remove); item.appendChild(actions);
        });
      });
    }

    async function replaceGalleryImage(index) {
      const picker = document.createElement('input');
      picker.type = 'file'; picker.accept = 'image/jpeg,image/png,image/gif,image/webp'; picker.hidden = true; document.body.appendChild(picker);
      picker.addEventListener('change', async () => {
        const file = picker.files?.[0]; picker.remove(); if (!file) return;
        const old = gallery[index];
        const status = document.getElementById('modeStatus');
        try {
          status.textContent = 'Replacing image…';
          const uploaded = await window.PortfolioCloud.uploadFile(file, 'gallery');
          gallery[index] = { ...uploaded, caption:old?.caption || '' };
          renderGallery();
          savePortfolioState();
          if (old?.path) await window.PortfolioCloud.deleteFile(old.path);
        } catch (error) { alert(error.message || 'The gallery image could not be replaced.'); }
        finally { status.textContent = 'Edit Mode'; }
      }, { once:true });
      picker.click();
    }

    function manageGalleryActions() {
      document.querySelectorAll('#portfolioGalleryGrid .gallery-card').forEach((card, index) => {
        if (card.querySelector('.media-action-bar')) return;
        const image = card.querySelector('img');
        const caption = card.querySelector('.gallery-caption');
        const bar = document.createElement('div'); bar.className = 'media-action-bar';
        const add = (label, className, handler) => {
          const button = document.createElement('button'); button.type = 'button'; button.className = className || ''; button.textContent = label; button.addEventListener('click', handler); bar.appendChild(button);
        };
        add('View', '', () => { if (image?.src) window.open(image.src, '_blank', 'noopener'); });
        add('Replace', '', () => replaceGalleryImage(index));
        add('Edit caption', '', () => { caption?.focus(); const selection = window.getSelection(); if (caption && selection) { selection.selectAllChildren(caption); selection.collapseToEnd(); } });
        add('Delete', 'danger', () => card.querySelector('.gallery-remove')?.click());
        card.appendChild(bar);
      });
    }

    function manageMediaControls() {
      document.querySelectorAll('.upload-zone, .cert-upload, .academic-img').forEach(addImageActionBar);
      addPortraitActions();
      manageResourceActions();
      manageGalleryActions();
    }

    function ensureCompletionYear() {
      [['t4_title'], ['t5_title']].forEach(([key]) => {
        const el = document.querySelector('[data-editable="' + key + '"]');
        if (!el || el.parentElement.querySelector('.expected-2027')) return;
        const note = document.createElement('div');
        note.className = 'expected-2027';
        note.textContent = 'Expected completion: 2027';
        note.style.cssText = 'font-size:.78rem;color:var(--accent2);font-style:italic;margin-top:4px;';
        el.parentElement.appendChild(note);
      });
    }

    function patchPresentationActivities() {
      document.querySelectorAll('h1,h2,h3,h4,h5,h6,.card,.experience-card,.evidence-card').forEach(el => {
        const text = (el.textContent || '').trim().toLowerCase();
        if (/presentation\s*(?:and|&)\s*activities/.test(text)) (el.closest('.card, .experience-card, .evidence-card') || el).classList.add('presentation-activities');
      });
    }

    function buildGallery() {
      if (document.getElementById('portfolio-gallery')) return;
      const footer = document.querySelector('footer');
      if (!footer) return;
      const section = document.createElement('section');
      section.id = 'portfolio-gallery';
      section.innerHTML = `
        <div class="container">
          <div class="section-label">Gallery</div>
          <h2 class="section-title">Classroom &amp; Professional Gallery</h2>
          <p class="section-desc">Add selected internship, teaching, professional-development, and classroom photographs. Use only photographs you are permitted to publish.</p>
          <div id="portfolioGalleryGrid" class="gallery-grid"></div>
          <div id="portfolioGalleryEmpty" class="gallery-empty">No gallery images added yet. Your gallery can grow throughout your internship.</div>
          <label class="gallery-upload" id="portfolioGalleryUpload" for="portfolioGalleryInput">📸 Add images to gallery<br><small>You can select multiple images at once.</small></label>
          <input id="portfolioGalleryInput" type="file" accept="image/*" multiple hidden>
        </div>`;
      footer.before(section);
      document.getElementById('portfolioGalleryInput').addEventListener('change', uploadGalleryFiles);
      renderGallery();
    }

    function renderGallery() {
      const grid = document.getElementById('portfolioGalleryGrid');
      const empty = document.getElementById('portfolioGalleryEmpty');
      if (!grid || !empty) return;
      grid.innerHTML = '';
      empty.style.display = gallery.length ? 'none' : '';
      gallery.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'gallery-card';
        const wrap = document.createElement('div');
        wrap.className = 'gallery-image-wrap';
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.caption || item.name || 'Portfolio photograph';
        wrap.appendChild(img);
        card.appendChild(wrap);
        const remove = document.createElement('button');
        remove.className = 'gallery-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.onclick = () => removeGalleryItem(index);
        card.appendChild(remove);
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.contentEditable = document.body.classList.contains('editing') ? 'true' : 'false';
        caption.textContent = item.caption || 'Add a caption.';
        caption.addEventListener('input', () => {
          item.caption = caption.textContent;
          if (window.__portfolio && typeof window.__portfolio.markDirty === 'function') window.__portfolio.markDirty();
        });
        card.appendChild(caption);
        grid.appendChild(card);
      });
    }

    async function uploadGalleryFiles(event) {
      if (!document.body.classList.contains('editing')) return;
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (!files.length || !window.PortfolioCloud) return;
      const status = document.getElementById('modeStatus');
      try {
        if (status) status.textContent = 'Uploading gallery…';
        for (const file of files) {
          const uploaded = await window.PortfolioCloud.uploadFile(file, 'gallery');
          gallery.push({ name: uploaded.name, path: uploaded.path, url: uploaded.url, downloadUrl: uploaded.downloadUrl, caption: '' });
        }
        renderGallery();
        savePortfolioState();
      } catch (error) { alert(error.message || 'Gallery upload failed.'); }
      finally { if (status) status.textContent = 'Edit'; }
    }

    async function removeGalleryItem(index) {
      if (!document.body.classList.contains('editing')) return;
      const item = gallery[index];
      if (!item || !confirm('Remove this image from the gallery?')) return;
      try {
        if (item.path && window.PortfolioCloud) await window.PortfolioCloud.deleteFile(item.path);
        gallery.splice(index, 1);
        renderGallery();
        savePortfolioState();
      } catch (error) { alert(error.message || 'The image could not be removed.'); }
    }

    function savePortfolioState() {
      if (!window.__portfolio) return;
      const base = window.__portfolio.snapshot();
      base.gallery = gallery;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
      if (typeof window.__portfolio.markSaved === 'function') window.__portfolio.markSaved();
      const status = document.getElementById('modeStatus');
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saving…';
    }

    function patchRestore() {
      if (!window.__portfolio || originalRestore) return;
      originalRestore = window.__portfolio.restore;
      window.__portfolio.restore = function (data) {
        const active = document.activeElement;
        if (document.body.classList.contains('editing') && active && active.isContentEditable) return;
        if (data && Array.isArray(data.gallery)) gallery = data.gallery.filter(x => x && x.url);
        originalRestore.call(window.__portfolio, data);
        renderGallery();
        updatePublicEmptyStates();
        orderEditorialSections();
        ensureCompletionYear();
        fixNavigation();
        fixSectionNumbers();
        moveCvToTop();
      };
      window.__portfolio.saveToStorage = savePortfolioState;
    }

    function applyLocalGallery() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (Array.isArray(data.gallery)) gallery = data.gallery.filter(x => x && x.url);
      } catch (_) {}
    }

    function installContentObserver() {
      if (document.body.dataset.contentObserverReady === '1') return;
      document.body.dataset.contentObserverReady = '1';
      let scheduled = false;
      new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          manageMediaControls();
          replaceEmojiIcons();
          updatePublicEmptyStates();
        });
      }).observe(document.body, { childList:true, subtree:true });
    }

    function finish() {
      buildGallery();
      polishHero();
      addRecruiterSnapshot();
      addProcessRails();
      patchEditorAuthentication();
      installEditorEntry();
      addThinkingLab();
      updatePublicEmptyStates();
      orderEditorialSections();
      applyLocalGallery();
      patchRestore();
      patchCloudDelete();
      patchUploadValidation();
      addTeachingScope();
      renderGallery();
      ensureCompletionYear();
      fixNavigation();
      fixSectionNumbers();
      moveCvToTop();
      ensureCvDeleteControl();
      ensureCvManager();
      patchPresentationActivities();
      replaceEmojiIcons();
      manageMediaControls();
      installContentObserver();
      document.querySelectorAll('.resource-item').forEach(item => {
        item.style.minWidth = '0';
        const link = item.querySelector('.resource-link');
        if (link) link.style.minWidth = '0';
      });
    }

    loadCore()
      .then(() => {
        finish();
        window.addEventListener('load', finish);
        setTimeout(finish, 1200);
      })
      .catch(error => { console.error('Portfolio cloud bootstrap failed:', error); finish(); });
  }

  installFixes();
})();
