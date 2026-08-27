(function () {
  'use strict';
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const TABLE = 'portfolio_state';
  const ROW_ID = 'default';
  const EDITOR_STATE_KEY = 'krishna_portfolio_v4';
  const SESSION_KEY = 'portfolio_editor_session';
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  let syncing = false;
  let saveTimer = null;

  function session() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; } }
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
    if (response.status === 401 || response.status === 403) return new Error('Your editor session does not have permission to do that. Sign in again and confirm the Supabase policies are installed.');
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
      method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ email: email.trim(), password })
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
      method: 'POST', headers: headers({ 'Content-Type': file.type || 'application/octet-stream', 'cache-control': '3600', 'x-upsert': 'false' }), body: file
    });
    if (!response.ok) throw await errorFor(response, 'File upload failed');
    const url = publicUrl(path);
    return { name: file.name, type: file.type || 'application/octet-stream', size: file.size, path, url, downloadUrl: url + '?download=' + encodeURIComponent(file.name) };
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
    const binary = atob(dataUrl.slice(comma + 1)); const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  async function uploadImage(dataUrl, label) {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], safeFileName((label || 'image') + '.' + ((blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, ''))), { type: blob.type });
    return (await uploadFile(file, 'images')).url;
  }
  async function migrateImages(state) {
    if (!state || !state.images) return state;
    const jobs = [];
    if (typeof state.images.portrait === 'string' && state.images.portrait.startsWith('data:image/')) jobs.push(uploadImage(state.images.portrait, 'portrait').then(url => { state.images.portrait = url; }));
    Object.keys(state.images).forEach(id => {
      if (id === 'portrait' || !Array.isArray(state.images[id])) return;
      state.images[id].forEach((src, index) => { if (typeof src === 'string' && src.startsWith('data:image/')) jobs.push(uploadImage(src, id + '_' + index).then(url => { state.images[id][index] = url; })); });
    });
    await Promise.all(jobs); return state;
  }

  async function saveRemote(raw) {
    if (syncing) return;
    let state; try { state = JSON.parse(raw); } catch (_) { return; }
    syncing = true;
    const status = document.getElementById('modeStatus');
    try {
      await signInEditor();
      state = await migrateImages(state);
      const response = await fetch(tableUrl() + '?on_conflict=id', {
        method: 'POST', headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({ id: ROW_ID, state, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw await errorFor(response, 'Cloud save failed');
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') window.__portfolio.restore(state);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Portfolio cloud save error:', error);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Cloud save failed';
      alert(error.message || 'Cloud save failed.');
    } finally { syncing = false; }
  }
  function queueSave(raw) { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveRemote(raw), 300); }
  async function loadRemote() {
    const status = document.getElementById('modeStatus');
    try {
      const response = await fetch(tableUrl() + '?id=eq.' + encodeURIComponent(ROW_ID) + '&select=state&limit=1', { headers: headers({ 'Cache-Control': 'no-cache' }) });
      if (!response.ok) throw await errorFor(response, 'Cloud load failed');
      const rows = await response.json();
      if (rows[0] && rows[0].state && window.__portfolio) window.__portfolio.restore(rows[0].state);
      if (status) status.textContent = rows[0] && rows[0].state ? 'Synced online ✓' : 'Portfolio ready';
    } catch (error) { console.error('Portfolio cloud load error:', error); if (status) status.textContent = 'Cloud unavailable'; }
  }

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage && key === EDITOR_STATE_KEY && typeof value === 'string' && !syncing) { queueSave(value); return; }
    return originalSetItem.call(this, key, value);
  };
  window.PortfolioCloud = { signInEditor, uploadFile, deleteFile };
  window.addEventListener('load', () => {
    const waitForPortfolio = () => { if (window.__portfolio && typeof window.__portfolio.restore === 'function') loadRemote(); else setTimeout(waitForPortfolio, 50); };
    waitForPortfolio();
  });
})();
