(function () {
  'use strict';

  // NEW PORTFOLIO DATA SPACE — intentionally starts completely empty.
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4e8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const STATE_KEY = 'krishna_portfolio_v5';
  const REMOTE_STATE_PATH = 'state/portfolio-v5.json';
  const OLD_KEYS = ['krishna_portfolio_v4', 'krishna_portfolio_pending_upload', 'krishna_experiences', 'portfolio-theme'];
  const ORIGINAL_SET = Storage.prototype.setItem;
  const ORIGINAL_GET = Storage.prototype.getItem;
  let syncing = false;
  let resetDone = false;

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  };

  function publicUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + path;
  }

  function dataUrlToBlob(dataUrl) {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) throw new Error('Invalid data URL');
    const header = dataUrl.slice(0, comma);
    const body = dataUrl.slice(comma + 1);
    const mime = (header.match(/^data:([^;]+)/) || [])[1] || 'application/octet-stream';
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function uploadDataUrl(dataUrl, label) {
    const blob = dataUrlToBlob(dataUrl);
    const ext = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const safeLabel = String(label || 'image').replace(/[^a-z0-9_-]/gi, '_').slice(0, 60);
    const path = 'portfolio-v5/' + safeLabel + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9) + '.' + ext;
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign({}, headers, {'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'true'}),
      body: blob
    });
    if (!response.ok) throw new Error('Image upload failed (' + response.status + '): ' + await response.text().catch(() => ''));
    return publicUrl(path);
  }

  async function uploadStateJson(state) {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + REMOTE_STATE_PATH, {
      method: 'POST',
      headers: Object.assign({}, headers, {'Content-Type': 'application/json', 'x-upsert': 'true', 'cache-control': 'no-cache'}),
      body: blob
    });
    if (!response.ok) throw new Error('State upload failed (' + response.status + '): ' + await response.text().catch(() => ''));
  }

  async function fetchRemoteState() {
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + REMOTE_STATE_PATH + '?t=' + Date.now(), {headers});
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Remote state fetch failed (' + response.status + ')');
    return await response.json();
  }

  async function migrateImages(state) {
    if (!state || !state.images) return state;
    const jobs = [];
    const replace = (value, label) => {
      if (typeof value !== 'string' || !value.startsWith('data:image/')) return Promise.resolve(value);
      return uploadDataUrl(value, label);
    };
    if (typeof state.images.portrait === 'string' && state.images.portrait.startsWith('data:image/')) {
      jobs.push(replace(state.images.portrait, 'portrait').then(url => { state.images.portrait = url; }));
    }
    Object.keys(state.images).forEach(id => {
      if (id === 'portrait' || !Array.isArray(state.images[id])) return;
      state.images[id] = state.images[id].slice();
      state.images[id].forEach((src, index) => {
        if (typeof src === 'string' && src.startsWith('data:image/')) jobs.push(replace(src, id + '_' + index).then(url => { state.images[id][index] = url; }));
      });
    });
    await Promise.all(jobs);
    return state;
  }

  function saveLocal(state) {
    ORIGINAL_SET.call(localStorage, STATE_KEY, JSON.stringify(state));
  }

  async function pushState(raw) {
    if (syncing) return;
    let state;
    try { state = JSON.parse(raw); } catch (_) { return; }
    syncing = true;
    const status = document.getElementById('modeStatus');
    try {
      state = await migrateImages(state);
      saveLocal(state);
      await uploadStateJson(state);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Portfolio cloud save error:', error);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved locally · cloud save failed';
    } finally { syncing = false; }
  }

  async function bootSync() {
    if (resetDone) return;
    resetDone = true;

    // Remove ALL previous local portfolio history. This deliberately does not
    // migrate v4 data. The new v5 portfolio starts clean.
    OLD_KEYS.forEach(key => localStorage.removeItem(key));

    const status = document.getElementById('modeStatus');
    try {
      const remote = await fetchRemoteState();
      if (remote) {
        saveLocal(remote);
        if (status) status.textContent = 'New portfolio synced ✓';
        setTimeout(() => location.reload(), 50);
      } else if (status) {
        status.textContent = 'New portfolio · ready';
      }
    } catch (error) {
      console.error('Portfolio cloud sync error:', error);
      if (status) status.textContent = 'New portfolio · ready';
    }
  }

  Storage.prototype.setItem = function (key, value) {
    ORIGINAL_SET.call(this, key, value);
    if (this !== localStorage || key !== 'krishna_portfolio_v4' || syncing) return;
    // The old editor still writes v4. Mirror it into the NEW v5 cloud state.
    pushState(value);
  };

  window.addEventListener('load', () => setTimeout(bootSync, 150));
})();
