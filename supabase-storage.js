(function () {
  'use strict';

  const CORE_URL = 'https://raw.githubusercontent.com/krishnamahato704-spec/E-portfolio/c6029eeca2fe1344591e7d735604b1d2a7e719ba/supabase-storage.js';
  const STORAGE_KEY = 'krishna_portfolio_v4';
  let gallery = [];
  let originalRestore = null;
  let sectionsConsolidated = false;

  function loadCore() {
    return fetch(CORE_URL, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('Could not load portfolio cloud core.'); return r.text(); })
      .then(code => {
        const script = document.createElement('script');
        script.textContent = code + '\n//# sourceURL=supabase-storage-core.js';
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
      footer .cv-download-link, footer .cv-disabled, footer .cv-edit-control { display:none !important; }
      #navbar .nav-cv-link { color:#fff !important; background:var(--accent2) !important; font-weight:800 !important; }

      /* Compact 8-section recruiter structure. */
      body > section.merged-source-section { display:none !important; }
      .merged-subsection { margin-top:30px; padding-top:26px; border-top:1px solid var(--border); }
      .merged-subsection:first-of-type { margin-top:20px; padding-top:0; border-top:0; }
      .merged-subsection .merged-subsection-label { font-size:.68rem; text-transform:uppercase; letter-spacing:.13em; color:var(--accent2); font-weight:800; margin-bottom:3px; }
      .merged-subsection .merged-subtitle { font-family:var(--serif); font-size:clamp(1.45rem,2.8vw,2.05rem); line-height:1.1; letter-spacing:-.02em; margin:3px 0 9px; }
      .merged-subsection .section-desc { max-width:760px; }
      .merged-subsection > .container { width:100%; margin:0; padding:0; }
      .merged-subsection > .container > .section-controls { display:none !important; }
      #profile, #academic-journey, #experiences, #my-work, #why-history, #skills, #reflection { scroll-margin-top:76px; }
      #experiences #portfolio-gallery { background:none; padding:30px 0 0; border:0; }
      #experiences #portfolio-gallery > .container { width:100%; padding:0; }
      #experiences #portfolio-gallery .section-label, #experiences #portfolio-gallery .section-title, #experiences #portfolio-gallery > .container > .section-desc { display:none; }
      #experiences #portfolio-gallery .gallery-grid { margin-top:14px; }
      @media (max-width:760px) { .cv-top-wrap { width:min(280px,70vw); } }

      /* Final gallery */
      #portfolio-gallery { background:linear-gradient(135deg,var(--bg),#ece8e0); }
      #portfolio-gallery .gallery-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; margin-top:18px; }
      #portfolio-gallery .gallery-card { position:relative; background:var(--card); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); min-width:0; }
      #portfolio-gallery .gallery-image-wrap { aspect-ratio:4/3; background:#e8e4dd; display:flex; align-items:center; justify-content:center; overflow:hidden; }
      #portfolio-gallery .gallery-image-wrap img { width:100%; height:100%; object-fit:cover; }
      #portfolio-gallery .gallery-caption { padding:10px 12px 13px; color:var(--muted); font-size:.86rem; min-height:42px; }
      .editing #portfolio-gallery .gallery-caption { outline:1px dashed var(--border); outline-offset:-3px; background:rgba(31,58,95,.03); }
      #portfolio-gallery .gallery-remove { display:none; position:absolute; right:8px; top:8px; z-index:2; border:0; background:rgba(139,26,43,.92); color:#fff; border-radius:7px; padding:6px 9px; cursor:pointer; font-size:.75rem; font-weight:700; }
      .editing #portfolio-gallery .gallery-remove { display:block; }
      #portfolio-gallery .gallery-empty { padding:30px 18px; text-align:center; color:var(--muted); border:1px dashed var(--border); border-radius:12px; background:rgba(255,255,255,.5); }
      #portfolio-gallery .gallery-upload { margin-top:14px; display:none; padding:14px; border:2px dashed rgba(31,58,95,.3); border-radius:12px; text-align:center; color:var(--muted); cursor:pointer; background:var(--card); }
      .editing #portfolio-gallery .gallery-upload { display:block; }
      @media (max-width:760px) { #portfolio-gallery .gallery-grid { grid-template-columns:1fr 1fr; } }
      @media (max-width:500px) { #portfolio-gallery .gallery-grid { grid-template-columns:1fr; } }
    `;
    document.head.appendChild(style);

    function consolidateSections() {
      if (sectionsConsolidated) return;
      const groups = [
        { target:'profile', label:'01 · Profile', title:'At a glance', sources:[] },
        { target:'academic-journey', label:'02 · Qualifications', title:'Qualifications & academic foundation', sources:[] },
        { target:'experiences', label:'03 · Experience & Evidence', title:'Experience, internships & professional evidence', sources:[] },
        { target:'my-work', label:'04 · Teaching Practice', title:'Teaching evidence, assessment & inclusive practice', sources:['assessment','differentiation'] },
        { target:'why-history', label:'05 · History & Teaching Approach', title:'History, teaching philosophy & intellectual influences', sources:['philosophy','history-teaching','thinkers'] },
        { target:'skills', label:'06 · Skills & Professional Development', title:'Skills, competencies & professional development', sources:['certificates','school-fit'] },
        { target:'reflection', label:'07 · Reflection & Growth', title:'Reflection, learning & professional growth', sources:[] },
      ];

      groups.forEach(group => {
        const target = document.getElementById(group.target);
        if (!target) return;
        const label = target.querySelector(':scope > .container > .section-label');
        const title = target.querySelector(':scope > .container > .section-title');
        if (label) label.textContent = group.label;
        if (title) title.textContent = group.title;

        group.sources.forEach(sourceId => {
          const source = document.getElementById(sourceId);
          if (!source || source === target) return;
          const sourceContainer = source.querySelector(':scope > .container');
          const targetContainer = target.querySelector(':scope > .container');
          if (!sourceContainer || !targetContainer) return;
          const block = document.createElement('div');
          block.className = 'merged-subsection';
          block.dataset.mergedFrom = sourceId;
          Array.from(sourceContainer.children).forEach(child => {
            if (child.classList && child.classList.contains('section-controls')) return;
            if (child.classList && child.classList.contains('section-label')) child.className = 'merged-subsection-label';
            else if (child.classList && child.classList.contains('section-title')) {
              child.classList.remove('section-title');
              child.classList.add('merged-subtitle');
            }
            block.appendChild(child);
          });
          targetContainer.appendChild(block);
          source.classList.add('merged-source-section');
        });
      });

      const gallery = document.getElementById('portfolio-gallery');
      const experienceTarget = document.getElementById('experiences');
      if (gallery && experienceTarget) {
        const experienceContainer = experienceTarget.querySelector(':scope > .container');
        if (experienceContainer && !experienceContainer.querySelector('#portfolio-gallery')) experienceContainer.appendChild(gallery);
      }

      const contactLabel = document.querySelector('#contact .section-label');
      if (contactLabel) contactLabel.textContent = '08 · Contact';
      sectionsConsolidated = true;
    }

    function fixNavigation() {
      const nav = document.getElementById('navLinks');
      if (!nav) return;
      nav.innerHTML = `
        <li><a href="#hero">Home</a></li>
        <li><a href="#profile">Profile</a></li>
        <li><a href="#academic-journey">Qualifications</a></li>
        <li><a href="#experiences">Experience &amp; Evidence</a></li>
        <li><a href="#my-work">Teaching Practice</a></li>
        <li><a href="#why-history">History &amp; Approach</a></li>
        <li><a href="#skills">Skills &amp; Development</a></li>
        <li><a href="#reflection">Reflection</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a class="nav-cv-link" href="#hero">CV</a></li>`;
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
    }

    function fixSectionNumbers() {
      consolidateSections();
      const map = {
        profile:'01 · Profile',
        'academic-journey':'02 · Qualifications',
        experiences:'03 · Experience & Evidence',
        'my-work':'04 · Teaching Practice',
        'why-history':'05 · History & Teaching Approach',
        skills:'06 · Skills & Professional Development',
        reflection:'07 · Reflection & Growth'
      };
      Object.keys(map).forEach(id => {
        const el = document.querySelector('#' + id + ' > .container > .section-label');
        if (el) el.textContent = map[id];
      });
      const contact = document.querySelector('#contact .section-label');
      if (contact) contact.textContent = '08 · Contact';
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
      const disabled = document.querySelector('.hero-cta .cv-disabled');
      if (disabled && !top.querySelector('.cv-download-link')) {
        disabled.classList.remove('cv-disabled');
        disabled.classList.add('cv-download-link');
        disabled.textContent = 'Download CV';
        top.appendChild(disabled);
      }
      const link = top.querySelector('.cv-download-link');
      if (link) {
        link.textContent = 'Download CV';
        link.setAttribute('aria-label', 'Download CV');
      }
      document.querySelectorAll('#contact .cv-download-link, #contact .cv-disabled, #contact .cv-edit-control').forEach(el => el.remove());
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
        caption.addEventListener('input', () => { item.caption = caption.textContent; savePortfolioState(); });
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
    }

    function patchRestore() {
      if (!window.__portfolio || originalRestore) return;
      originalRestore = window.__portfolio.restore;
      window.__portfolio.restore = function (data) {
        const active = document.activeElement;
        if (document.body.classList.contains('editing') && active && active.isContentEditable) return;
        if (data && Array.isArray(data.gallery)) gallery = data.gallery.filter(x => x && x.url);
        originalRestore.call(window.__portfolio, data);
        consolidateSections();
        renderGallery();
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
      applyLocalGallery();
      patchRestore();
      consolidateSections();
      renderGallery();
      ensureCompletionYear();
      fixNavigation();
      fixSectionNumbers();
      moveCvToTop();
      patchPresentationActivities();
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
