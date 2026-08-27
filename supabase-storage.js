(function () {
  'use strict';

  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const TABLE = 'portfolio_state';
  const ROW_ID = 1;
  const EDITOR_STATE_KEY = 'krishna_portfolio_v4';
  const EXPERIENCES_KEY = 'krishna_experiences';
  const SESSION_KEY = 'portfolio_editor_session';
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  let syncing = false;
  let saveTimer = null;
  let remoteRaw = '';
  let remoteState = null;
  let cvMeta = null;
  let enhancementsReady = false;

  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  function session() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
  }

  function headers(extra) {
    const current = session();
    const base = { apikey: SUPABASE_KEY };
    if (current && current.access_token) base.Authorization = 'Bearer ' + current.access_token;
    return Object.assign(base, extra || {});
  }

  function tableUrl() { return SUPABASE_URL + '/rest/v1/' + TABLE; }
  function objectUrl(path) { return SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path; }
  function publicUrl(path) { return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + path; }

  function safeFileName(name) {
    const dot = name.lastIndexOf('.');
    const base = (dot > 0 ? name.slice(0, dot) : name).replace(/[^a-z0-9_-]/gi, '_').slice(0, 80) || 'file';
    const ext = dot > 0 ? name.slice(dot).replace(/[^.a-z0-9]/gi, '').slice(0, 12) : '';
    return base + ext;
  }

  async function errorFor(response, fallback) {
    const details = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      return new Error('Your editor session does not have permission to do that. Sign in again and confirm the Supabase policies are installed.');
    }
    return new Error(fallback + ' (' + response.status + ')' + (details ? ': ' + details : ''));
  }

  async function signInEditor() {
    const current = session();
    if (current && current.access_token) return current;
    const email = prompt('Editor email (your Supabase Auth user):');
    if (!email) throw new Error('Editor sign-in was cancelled.');
    const password = prompt('Editor password:');
    if (!password) throw new Error('Editor sign-in was cancelled.');
    const response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: email.trim(), password })
    });
    if (!response.ok) throw await errorFor(response, 'Sign-in failed');
    const data = await response.json();
    if (!data.access_token) throw new Error('Sign-in did not return a usable editor session.');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    return data;
  }

  async function uploadFile(file, folder) {
    if (!file) throw new Error('No file selected.');
    if (file.size > MAX_FILE_SIZE) throw new Error('“' + file.name + '” is larger than 25 MB. Please use a smaller file.');
    await signInEditor();
    const path = 'evidence/' + folder + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + safeFileName(file.name);
    const response = await fetch(objectUrl(path), {
      method: 'POST',
      headers: headers({ 'Content-Type': file.type || 'application/octet-stream', 'cache-control': '3600', 'x-upsert': 'false' }),
      body: file
    });
    if (!response.ok) throw await errorFor(response, 'File upload failed');
    const url = publicUrl(path);
    return {
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      path,
      url,
      downloadUrl: url + '?download=' + encodeURIComponent(file.name)
    };
  }

  async function deleteFile(path) {
    if (!path) return;
    await signInEditor();
    const response = await fetch(objectUrl(path), { method: 'DELETE', headers: headers() });
    if (!response.ok && response.status !== 404) throw await errorFor(response, 'File deletion failed');
  }

  function dataUrlToBlob(dataUrl) {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) throw new Error('Invalid image data.');
    const mime = (dataUrl.slice(0, comma).match(/^data:([^;]+)/) || [])[1] || 'application/octet-stream';
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function uploadImage(dataUrl, label) {
    const blob = dataUrlToBlob(dataUrl);
    const subtype = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
    const file = new File([blob], safeFileName((label || 'image') + '.' + subtype), { type: blob.type });
    return (await uploadFile(file, 'images')).url;
  }

  async function migrateImages(state) {
    if (!state || !state.images) return state;
    const jobs = [];
    if (typeof state.images.portrait === 'string' && state.images.portrait.startsWith('data:image/')) {
      jobs.push(uploadImage(state.images.portrait, 'portrait').then(url => { state.images.portrait = url; }));
    }
    Object.keys(state.images).forEach(id => {
      if (id === 'portrait' || !Array.isArray(state.images[id])) return;
      state.images[id].forEach((src, index) => {
        if (typeof src === 'string' && src.startsWith('data:image/')) {
          jobs.push(uploadImage(src, id + '_' + index).then(url => { state.images[id][index] = url; }));
        }
      });
    });
    await Promise.all(jobs);
    return state;
  }

  function addCvToState(state) {
    if (cvMeta) state.cv = cvMeta;
    else if (remoteState && remoteState.cv) state.cv = remoteState.cv;
    return state;
  }

  async function saveRemote(raw) {
    if (syncing) return;
    let state;
    try { state = JSON.parse(raw); } catch (_) { return; }
    syncing = true;
    const status = document.getElementById('modeStatus');
    try {
      await signInEditor();
      state = await migrateImages(state);
      state = addCvToState(state);
      const response = await fetch(tableUrl() + '?on_conflict=id', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({ id: ROW_ID, data: state, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw await errorFor(response, 'Cloud save failed');
      remoteState = state;
      remoteRaw = JSON.stringify(state);
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') window.__portfolio.restore(state);
      updateCvUI();
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Portfolio cloud save error:', error);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Cloud save failed';
      alert(error.message || 'Cloud save failed.');
    } finally {
      syncing = false;
    }
  }

  function queueSave(raw) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveRemote(raw), 450);
  }

  async function loadRemote() {
    const status = document.getElementById('modeStatus');
    try {
      const response = await fetch(tableUrl() + '?id=eq.' + encodeURIComponent(ROW_ID) + '&select=data&limit=1', {
        headers: headers({ 'Cache-Control': 'no-cache' })
      });
      if (!response.ok) throw await errorFor(response, 'Cloud load failed');
      const rows = await response.json();
      if (rows[0] && rows[0].data) {
        remoteState = rows[0].data;
        cvMeta = remoteState.cv || null;
        remoteRaw = JSON.stringify(remoteState);
        syncing = true;
        if (window.__portfolio) window.__portfolio.restore(remoteState);
        syncing = false;
        updateCvUI();
        status.textContent = 'Synced online ✓';
      } else {
        remoteState = null;
        remoteRaw = '';
        status.textContent = 'Portfolio ready';
      }
    } catch (error) {
      syncing = false;
      console.error('Portfolio cloud load error:', error);
      if (status) status.textContent = 'Cloud unavailable';
    }
  }

  function createSchoolFitSection() {
    if (document.getElementById('school-fit')) return;
    const footer = document.querySelector('footer');
    if (!footer) return;
    const section = document.createElement('section');
    section.id = 'school-fit';
    section.innerHTML = `
      <div class="container">
        <div class="section-label">14 · What I Bring to a School</div>
        <h2 class="section-title">A teacher who brings subject depth into practice</h2>
        <p class="section-desc">A concise view of the contribution I aim to make as a History / Social Science teacher.</p>
        <div class="grid-3" style="margin-top:18px;">
          <div class="card"><div class="card-label">Subject depth</div><h3>Strong History foundation</h3><p>Academic study in History supports accurate content, contextual understanding, and thoughtful use of historical sources.</p></div>
          <div class="card"><div class="card-label">Pedagogy</div><h3>Purposeful lesson design</h3><p>I plan from learning goals, use clear explanations and active tasks, and build assessment into the lesson rather than adding it at the end.</p></div>
          <div class="card"><div class="card-label">Adaptability</div><h3>Different routes to learning</h3><p>Scaffolds, visuals, discussion, timelines, source work, and extension tasks can help different learners reach meaningful understanding.</p></div>
          <div class="card"><div class="card-label">Assessment</div><h3>Evidence-led improvement</h3><p>I use questioning, written work, short checks, and feedback to identify what learners understand and what needs reteaching.</p></div>
          <div class="card"><div class="card-label">Contribution</div><h3>Resource-minded and collaborative</h3><p>I enjoy developing worksheets, timelines, source-based activities, and classroom resources that can be shared and improved with colleagues.</p></div>
          <div class="card"><div class="card-label">Professional growth</div><h3>Reflective practice</h3><p>Observation, teaching experience, feedback, and reflection are treated as part of an ongoing process of becoming a better teacher.</p></div>
        </div>
      </div>`;
    footer.before(section);
    const nav = document.getElementById('navLinks');
    if (nav && !nav.querySelector('a[href="#school-fit"]')) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#school-fit';
      a.textContent = 'What I Bring';
      a.addEventListener('click', () => nav.classList.remove('open'));
      li.appendChild(a);
      nav.appendChild(li);
    }
  }

  function addEvidenceGuidance() {
    const targets = [
      ['my-work', 'Evidence goal: upload 2–3 strong lesson plans, 2–3 classroom resources, and 1–2 assessment examples. Prefer real work over decorative material.'],
      ['assessment', 'Evidence goal: include one concrete assessment with the task, what it checked, and how feedback or the result informed the next step.'],
      ['differentiation', 'Evidence goal: show one real adapted task or resource with the learner need, scaffold / extension, and intended learning outcome.']
    ];
    targets.forEach(([id, text]) => {
      const section = document.getElementById(id);
      if (!section || section.querySelector('.evidence-goal')) return;
      const p = document.createElement('p');
      p.className = 'evidence-goal';
      p.textContent = text;
      p.style.cssText = 'margin-top:14px;padding:10px 14px;border-left:3px solid var(--gold);background:rgba(184,134,11,.07);color:var(--muted);font-size:.84rem;border-radius:8px;';
      const container = section.querySelector('.container');
      const title = container && container.querySelector('.section-title');
      if (title) title.after(p);
    });
  }

  function addCompletionDates() {
    const items = document.querySelectorAll('#academic-journey .timeline-item');
    items.forEach(item => {
      const title = item.querySelector('h3');
      if (!title || item.querySelector('.completion-note')) return;
      const text = title.textContent || '';
      if (/B\.Ed\.|M\.A\. History/i.test(text)) {
        const note = document.createElement('div');
        note.className = 'completion-note';
        note.textContent = 'Expected completion: add month / year in Edit mode';
        note.style.cssText = 'font-size:.75rem;color:var(--accent2);margin-top:4px;font-style:italic;';
        item.appendChild(note);
      }
    });
  }

  function addCvControls() {
    if (document.getElementById('cvEditorInput')) return;
    document.querySelectorAll('.hero-cta .disabled, #contact .cta-button.disabled').forEach(el => {
      if (/CV|PDF/i.test(el.textContent || '')) {
        el.classList.add('cv-disabled');
        const link = document.createElement('a');
        link.className = 'cta-button cv-download-link';
        link.textContent = 'Download CV';
        el.parentNode.insertBefore(link, el);
      }
    });

    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'cvEditorInput';
    input.accept = 'application/pdf,.pdf';
    input.style.display = 'none';
    document.body.appendChild(input);

    const heroCtas = document.querySelector('.hero-cta');
    const footerCtas = document.querySelector('#contact .container .footer-grid > div:first-child > div:last-child');
    [heroCtas, footerCtas].forEach(container => {
      if (!container) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cta-button cv-edit-control';
      button.textContent = 'Upload / replace CV';
      button.style.display = 'none';
      button.addEventListener('click', () => input.click());
      container.appendChild(button);
    });

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a PDF CV.');
        return;
      }
      const status = document.getElementById('modeStatus');
      try {
        if (status) status.textContent = 'Uploading CV…';
        const uploaded = await uploadFile(file, 'cv');
        cvMeta = uploaded;
        updateCvUI();
        if (window.__portfolio && typeof window.__portfolio.saveToStorage === 'function') window.__portfolio.saveToStorage();
      } catch (error) {
        alert(error.message || 'The CV could not be uploaded.');
      } finally {
        if (status && document.body.classList.contains('editing')) status.textContent = 'Edit';
      }
    });
  }

  function updateCvUI() {
    const meta = cvMeta || (remoteState && remoteState.cv);
    const links = document.querySelectorAll('.cv-download-link');
    const disabled = document.querySelectorAll('.cv-disabled');
    const editControls = document.querySelectorAll('.cv-edit-control');
    if (meta && meta.url) {
      links.forEach(link => {
        link.href = meta.downloadUrl || meta.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Download CV';
        link.style.display = '';
      });
      disabled.forEach(el => el.style.display = 'none');
    } else {
      links.forEach(link => link.style.display = 'none');
      disabled.forEach(el => {
        el.textContent = 'CV not uploaded yet';
        el.style.display = '';
      });
    }
    editControls.forEach(el => el.style.display = document.body.classList.contains('editing') ? 'inline-block' : 'none');
  }

  function styleAndPolish() {
    if (!document.getElementById('portfolio-cloud-polish')) {
      const style = document.createElement('style');
      style.id = 'portfolio-cloud-polish';
      style.textContent = `
        .cv-download-link{display:none}.view-mode .cv-edit-control{display:none!important}
        .cv-edit-control{border:0;cursor:pointer}.evidence-goal{max-width:850px}
        #school-fit .card{height:100%}
        .deleted-section{display:none!important}
        .legacy-certificate-layout,.legacy-professional-development{display:none!important}
      `;
      document.head.appendChild(style);
    }
    addCvControls();
    updateCvUI();
  }

  function bootEnhancements() {
    if (enhancementsReady) return;
    enhancementsReady = true;
    createSchoolFitSection();
    addEvidenceGuidance();
    addCompletionDates();
    styleAndPolish();
  }

  // Cloud is the source of truth for portfolio content. The existing editor still
  // calls localStorage internally, but those portfolio reads/writes are routed here
  // and are not persisted in browser storage.
  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage && (key === EDITOR_STATE_KEY || key === EXPERIENCES_KEY) && typeof value === 'string' && !syncing) {
      if (key === EDITOR_STATE_KEY) queueSave(value);
      return;
    }
    return originalSetItem.call(this, key, value);
  };

  Storage.prototype.getItem = function (key) {
    if (this === localStorage && key === EDITOR_STATE_KEY) return remoteRaw || null;
    if (this === localStorage && key === EXPERIENCES_KEY) {
      if (remoteState && Array.isArray(remoteState.experiences)) return JSON.stringify(remoteState.experiences);
      return null;
    }
    return originalGetItem.call(this, key);
  };

  Storage.prototype.removeItem = function (key) {
    if (this === localStorage && (key === EDITOR_STATE_KEY || key === EXPERIENCES_KEY)) return;
    return originalRemoveItem.call(this, key);
  };

  window.PortfolioCloud = {
    signInEditor,
    uploadFile,
    deleteFile,
    getCv: () => cvMeta || (remoteState && remoteState.cv) || null
  };

  window.addEventListener('load', () => {
    bootEnhancements();
    const waitForPortfolio = () => {
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') {
        bootEnhancements();
        loadRemote();
      } else {
        setTimeout(waitForPortfolio, 50);
      }
    };
    waitForPortfolio();
  });
})();
