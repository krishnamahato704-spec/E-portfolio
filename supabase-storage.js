(function () {
  'use strict';

  // Keep the proven cloud-storage implementation from the last stable commit,
  // then apply the UI/UX fixes below without rewriting the main portfolio.
  const CORE_URL = 'https://raw.githubusercontent.com/krishnamahato704-spec/E-portfolio/c6029eeca2fe1344591e7d735604b1d2a7e719ba/supabase-storage.js';

  function loadCore() {
    return fetch(CORE_URL, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('Could not load portfolio cloud core.'); return r.text(); })
      .then(code => {
        const coreScript = document.createElement('script');
        coreScript.textContent = code + '\n//# sourceURL=supabase-storage-core.js';
        document.head.appendChild(coreScript);
      });
  }

  function installFixes() {
    const body = document.body;
    if (!body || body.dataset.portfolioFixesInstalled === '1') return;
    body.dataset.portfolioFixesInstalled = '1';

    const STORAGE_KEY = 'krishna_portfolio_v4';
    let gallery = [];
    let galleryLoaded = false;
    let originalRestore = null;
    let originalSave = null;

    const style = document.createElement('style');
    style.id = 'portfolio-final-fixes';
    style.textContent = `
      /* Section 7 / presentation & activity content: never crop text or controls. */
      #experiences, #experiences .container, #experiences .card, #experiences .experience-card,
      #experiences .grid-2, #experiences .grid-3, #history-teaching, #history-teaching .card,
      .presentation-activities, .presentation-activities * { overflow: visible !important; height: auto !important; min-height: 0; }
      #experiences .grid-3 > .card, #experiences .grid-2 > .experience-card { min-width: 0; word-break: normal; overflow-wrap: anywhere; }
      #history-teaching .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] { overflow: visible; }
      @media (max-width:860px) {
        #history-teaching .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] { grid-template-columns:1fr !important; }
        #history-teaching .card > div[style*="grid-template-columns:1fr auto 1fr auto 1fr"] > span { display:none; }
        #experiences .grid-3, #experiences .grid-2 { grid-template-columns:1fr !important; }
      }

      /* Recruiter CV: prominent near the top, not buried in the footer. */
      #navbar .nav-cv-link { color:#fff !important; background:var(--accent2) !important; font-weight:800 !important; }
      .hero-cta .cv-download-link { order:-10; background:var(--accent2); border-color:var(--accent2); box-shadow:0 6px 18px rgba(139,26,43,.18); }
      footer .cv-download-link, footer .cv-disabled, footer .cv-edit-control { display:none !important; }

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

      /* Prevent the caption caret from being reset while cloud autosave runs. */
      .editing .img-caption, .editing [data-editable] { caret-color:var(--text); }
    `;
    document.head.appendChild(style);

    function ensureCompletionYear() {
      const fields = [
        ['t4_title', 'B.Ed.'],
        ['t5_title', 'M.A. History']
      ];
      fields.forEach(([key, fallback]) => {
        const el = document.querySelector('[data-editable="' + key + '"]');
        if (!el || el.parentElement.querySelector('.expected-2027')) return;
        const note = document.createElement('div');
        note.className = 'expected-2027';
        note.textContent = 'Expected completion: 2027';
        note.style.cssText = 'font-size:.78rem;color:var(--accent2);font-style:italic;margin-top:4px;';
        el.parentElement.appendChild(note);
      });
    }

    function fixNavigation() {
      const nav = document.getElementById('navLinks');
      if (!nav) return;
      const contact = nav.querySelector('a[href="#contact"]')?.closest('li');
      if (contact) nav.appendChild(contact);
      let cv = nav.querySelector('.nav-cv-link');
      if (!cv) {
        const li = document.createElement('li');
        cv = document.createElement('a');
        cv.className = 'nav-cv-link';
        cv.href = '#hero';
        cv.textContent = 'CV';
        li.appendChild(cv);
        const contactLi = nav.querySelector('a[href="#contact"]')?.closest('li');
        if (contactLi) nav.insertBefore(li, contactLi);
        else nav.appendChild(li);
      }
      cv.addEventListener('click', () => nav.classList.remove('open'));
    }

    function moveCvToTop() {
      const hero = document.querySelector('.hero-cta');
      if (!hero) return;
      const cv = hero.querySelector('.cv-download-link');
      if (cv) {
        hero.prepend(cv);
        cv.textContent = 'Download CV';
      }
      document.querySelectorAll('#contact .cv-download-link, #contact .cv-disabled').forEach(el => el.remove());
    }

    function buildGallery() {
      if (document.getElementById('portfolio-gallery')) return;
      const footer = document.querySelector('footer');
      if (!footer) return;
      const section = document.createElement('section');
      section.id = 'portfolio-gallery';
      section.innerHTML = `
        <div class="container">
          <div class="section-label">14 · Gallery</div>
          <h2 class="section-title">Classroom &amp; Professional Gallery</h2>
          <p class="section-desc">Add selected internship, teaching, professional-development, and classroom photographs. Use only photographs you are permitted to publish.</p>
          <div id="portfolioGalleryGrid" class="gallery-grid"></div>
          <div id="portfolioGalleryEmpty" class="gallery-empty">No gallery images added yet. Your gallery can grow throughout your internship.</div>
          <label class="gallery-upload" id="portfolioGalleryUpload" for="portfolioGalleryInput">📸 Add images to gallery<br><small>You can select multiple images at once.</small></label>
          <input id="portfolioGalleryInput" type="file" accept="image/*" multiple hidden>
        </div>`;
      footer.before(section);
      fixNavigation();
      renderGallery();
      document.getElementById('portfolioGalleryInput').addEventListener('change', uploadGalleryFiles);
    }

    function renderGallery() {
      const grid = document.getElementById('portfolioGalleryGrid');
      const empty = document.getElementById('portfolioGalleryEmpty');
      if (!grid || !empty) return;
      grid.innerHTML = '';
      if (!gallery.length) { empty.style.display = ''; return; }
      empty.style.display = 'none';
      gallery.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'gallery-card';
        const wrap = document.createElement('div');
        wrap.className = 'gallery-image-wrap';
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.caption || item.name || 'Portfolio photograph';
        wrap.appendChild(img);
        const remove = document.createElement('button');
        remove.className = 'gallery-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => removeGalleryItem(index));
        card.appendChild(wrap);
        card.appendChild(remove);
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.contentEditable = document.body.classList.contains('editing') ? 'true' : 'false';
        caption.textContent = item.caption || 'Add a caption.';
        caption.addEventListener('input', () => {
          item.caption = caption.textContent;
          savePortfolioState();
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
      } catch (error) {
        console.error(error);
        alert(error.message || 'Gallery upload failed.');
      } finally {
        if (status) status.textContent = 'Edit';
      }
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
      } catch (error) {
        alert(error.message || 'The image could not be removed.');
      }
    }

    function getBaseState() {
      try {
        return originalSave && window.__portfolio ? window.__portfolio.snapshot() : {};
      } catch (_) { return {}; }
    }

    function savePortfolioState() {
      const state = getBaseState();
      state.gallery = gallery;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function patchPortfolioRestore() {
      if (!window.__portfolio || originalRestore) return;
      originalRestore = window.__portfolio.restore;
      originalSave = window.__portfolio.saveToStorage;
      window.__portfolio.restore = function (data) {
        // During editing, a remote autosave must never rebuild the DOM underneath
        // the user's caret. This is the source of the old caption-jump bug.
        const active = document.activeElement;
        if (document.body.classList.contains('editing') && active && active.isContentEditable) return;
        if (data && Array.isArray(data.gallery)) gallery = data.gallery.filter(x => x && x.url);
        originalRestore.call(window.__portfolio, data);
        renderGallery();
        ensureCompletionYear();
        fixNavigation();
        moveCvToTop();
      };
      window.__portfolio.saveToStorage = savePortfolioState;
    }

    function loadGalleryFromState(data) {
      if (data && Array.isArray(data.gallery)) gallery = data.gallery.filter(x => x && x.url);
      galleryLoaded = true;
      renderGallery();
    }

    function makeExistingResourceDeleteSafe() {
      // The existing evidence cards already expose Delete in Edit mode. Ensure the
      // controls remain visible and usable even if a long filename is present.
      document.querySelectorAll('.resource-item').forEach(item => {
        item.style.minWidth = '0';
        const link = item.querySelector('.resource-link');
        if (link) link.style.minWidth = '0';
      });
    }

    function patchPresentationActivities() {
      document.querySelectorAll('h1,h2,h3,h4,h5,h6,.card,.experience-card,.evidence-card').forEach(el => {
        const text = (el.textContent || '').trim().toLowerCase();
        if (text.includes('presentation') || text.includes('activities')) {
          const target = el.closest('.card, .experience-card, .evidence-card') || el;
          target.classList.add('presentation-activities');
        }
      });
    }

    function start() {
      loadCore().then(() => {
        patchPortfolioRestore();
        buildGallery();
        ensureCompletionYear();
        fixNavigation();
        moveCvToTop();
        patchPresentationActivities();
        makeExistingResourceDeleteSafe();

        // Re-run after the core's load handler restores cloud state.
        window.addEventListener('load', () => {
          patchPortfolioRestore();
          buildGallery();
          ensureCompletionYear();
          fixNavigation();
          moveCvToTop();
          patchPresentationActivities();
          makeExistingResourceDeleteSafe();
        });

        // If cloud state arrives after our patch, the wrapped restore will populate it.
        const originalLoad = window.__portfolio && window.__portfolio.restore;
        if (window.__portfolio && !galleryLoaded) {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try { loadGalleryFromState(JSON.parse(saved)); } catch (_) {}
          }
        }
      }).catch(error => {
        console.error(error);
        // Keep the portfolio usable even if the cloud core cannot be fetched.
        buildGallery();
        fixNavigation();
        moveCvToTop();
      });
    }

    start();
  }

  loadCoreBootstrap();

  function loadCoreBootstrap() {
    // The stable core is fetched and evaluated first. Then the fixes are installed.
    loadCore().then(() => installFixes()).catch(error => {
      console.error('Portfolio cloud bootstrap failed:', error);
      installFixes();
    });
  }
})();
