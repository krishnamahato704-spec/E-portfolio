(function () {
  'use strict';

  const CORE_URL = 'https://cdn.jsdelivr.net/gh/krishnamahato704-spec/E-portfolio@c6029eeca2fe1344591e7d735604b1d2a7e719ba/supabase-storage.js';
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';
  const STORAGE_KEY = 'krishna_portfolio_v4';
  let gallery = [];
  let originalRestore = null;
  let cloudDeletePatched = false;

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
      section.innerHTML = '<div class="container"><div class="section-label">Recruiter Snapshot</div><h2 class="section-title">The essentials at a glance</h2><div class="snapshot-grid"><div class="snapshot-item"><strong>Target roles</strong><span>TGT History / Social Science<br>PGT History</span></div><div class="snapshot-item"><strong>Subjects</strong><span>History · Economics · English</span></div><div class="snapshot-item"><strong>Academic background</strong><span>B.A. History &amp; Economics<br>B.Ed. · M.A. History</span></div><div class="snapshot-item"><strong>Core strengths</strong><span>Historical Thinking<br>Lesson Planning · Assessment · Differentiated Support</span></div><div class="snapshot-item"><strong>Teaching exposure</strong><span>School Observation<br>5-week Teaching Internship</span></div></div></div>';
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

    function installEditorEntry() {
      if (document.body.dataset.editorEntryReady === '1') return;
      document.body.dataset.editorEntryReady = '1';
      document.addEventListener('keydown', event => {
        if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'e') document.getElementById('editBtn')?.click();
      });
      if (new URLSearchParams(location.search).get('edit') === '1') document.getElementById('editBtn')?.click();
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
          return await originalDelete(path);
        } catch (firstError) {
          // A previous delete may have removed the object while its metadata
          // remained in the portfolio row. Treat that stale-object response as
          // already deleted so the metadata can still be cleaned up.
          if (/\(400\)|not found|does not exist/i.test(firstError?.message || '')) return;
          // Supabase access tokens can expire while the editor tab remains open.
          // Re-authenticate once, then retry the same delete request.
          try {
            sessionStorage.removeItem('portfolio_editor_session');
            await window.PortfolioCloud.signInEditor();
            return await originalDelete(path);
          } catch (secondError) {
            throw new Error('File deletion failed after re-authentication. Please confirm the storage DELETE policy is installed in Supabase.');
          }
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
        <li><a href="#why-history">Why History</a></li>
        <li><a href="#philosophy">Teaching Philosophy</a></li>
        <li><a href="#history-teaching">Subject Expertise</a></li>
        <li><a href="#thinkers">Thinkers</a></li>
        <li><a href="#experiences">Experience</a></li>
        <li><a href="#my-work">Teaching Evidence</a></li>
        <li><a href="#assessment">Assessment</a></li>
        <li><a href="#differentiation">Inclusive Practice</a></li>
        <li><a href="#skills">Competencies</a></li>
        <li><a href="#certificates">Certificates</a></li>
        <li><a href="#reflection">Reflection</a></li>
        <li><a href="#contact">Contact</a></li>`;
      if (window.PortfolioCloud?.getCv?.()) nav.insertAdjacentHTML('beforeend', '<li><a class="nav-cv-link" href="#hero">CV</a></li>');
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
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
      const portraitWrap = document.querySelector('.portrait-wrap');
      if (!portraitWrap) return;
      let top = portraitWrap.querySelector('.cv-top-wrap');
      if (!top) {
        top = document.createElement('div');
        top.className = 'cv-top-wrap';
        portraitWrap.insertBefore(top, portraitWrap.firstChild);
      }
      const cv = document.querySelector('.hero-cta .cv-download-link, .cv-top-wrap .cv-download-link');
      if (cv && cv.parentElement !== top) top.appendChild(cv);
      const edit = document.querySelector('.hero-cta .cv-edit-control, .cv-top-wrap .cv-edit-control');
      if (edit && edit.parentElement !== top) top.appendChild(edit);
      document.querySelectorAll('.hero-cta .cv-disabled').forEach(el => el.remove());
      const link = top.querySelector('.cv-download-link');
      if (link) {
        link.textContent = 'Download CV';
        link.setAttribute('aria-label', 'Download CV');
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

    function finish() {
      buildGallery();
      polishHero();
      addRecruiterSnapshot();
      addProcessRails();
      installEditorEntry();
      addThinkingLab();
      updatePublicEmptyStates();
      orderEditorialSections();
      applyLocalGallery();
      patchRestore();
      patchCloudDelete();
      addTeachingScope();
      renderGallery();
      ensureCompletionYear();
      fixNavigation();
      fixSectionNumbers();
      moveCvToTop();
      ensureCvDeleteControl();
      patchPresentationActivities();
      replaceEmojiIcons();
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
