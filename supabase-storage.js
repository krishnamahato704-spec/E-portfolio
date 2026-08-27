(function () {
  'use strict';

  // CLOUD-ONLY PORTFOLIO STORAGE
  // Portfolio state is stored in Supabase Postgres; images remain in Supabase Storage.
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4e8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const TABLE = 'portfolio_state';
  const EDITOR_STATE_KEY = 'krishna_portfolio_v4';
  const ROW_ID = 'default';

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  let syncing = false;
  let saveTimer = null;

  function tableUrl() {
    return SUPABASE_URL + '/rest/v1/' + TABLE;
  }

  function objectUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path;
  }

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

  async function uploadImage(dataUrl, label) {
    const blob = dataUrlToBlob(dataUrl);
    const ext = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const safe = String(label || 'image').replace(/[^a-z0-9_-]/gi, '_').slice(0, 60);
    const path = 'portfolio-v5/' + safe + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9) + '.' + ext;
    const response = await fetch(objectUrl(path), {
      method: 'POST',
      headers: Object.assign({}, headers, {
        'x-upsert': 'true',
        'cache-control': '31536000'
      }),
      body: blob
    });
    if (!response.ok) throw new Error('Image upload failed (' + response.status + '): ' + await response.text().catch(() => ''));
    return publicUrl(path);
  }

  async function migrateImages(state) {
    if (!state || !state.images) return state;
    const jobs = [];
    const replace = (value, label) => {
      if (typeof value !== 'string' || !value.startsWith('data:image/')) return Promise.resolve(value);
      return uploadImage(value, label);
    };

    if (typeof state.images.portrait === 'string' && state.images.portrait.startsWith('data:image/')) {
      jobs.push(replace(state.images.portrait, 'portrait').then(url => { state.images.portrait = url; }));
    }

    Object.keys(state.images).forEach(id => {
      if (id === 'portrait' || !Array.isArray(state.images[id])) return;
      state.images[id] = state.images[id].slice();
      state.images[id].forEach((src, index) => {
        if (typeof src === 'string' && src.startsWith('data:image/')) {
          jobs.push(replace(src, id + '_' + index).then(url => { state.images[id][index] = url; }));
        }
      });
    });

    await Promise.all(jobs);
    return state;
  }

  async function saveRemote(raw) {
    if (syncing) return;
    let state;
    try { state = JSON.parse(raw); } catch (_) { return; }

    syncing = true;
    const status = document.getElementById('modeStatus');
    try {
      state = await migrateImages(state);
      const response = await fetch(tableUrl() + '?id=eq.' + encodeURIComponent(ROW_ID), {
        method: 'PATCH',
        headers: Object.assign({}, headers, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ state: state, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Cloud state save failed (' + response.status + '): ' + await response.text().catch(() => ''));

      if (window.__portfolio && typeof window.__portfolio.restore === 'function') window.__portfolio.restore(state);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Portfolio cloud save error:', error);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Cloud save failed — please try again';
    } finally {
      syncing = false;
    }
  }

  function queueSave(raw) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveRemote(raw); }, 250);
  }

  async function loadRemote() {
    const status = document.getElementById('modeStatus');
    try {
      const response = await fetch(tableUrl() + '?id=eq.' + encodeURIComponent(ROW_ID) + '&select=state&limit=1', {
        method: 'GET',
        headers: Object.assign({}, headers, { 'Cache-Control': 'no-cache' })
      });

      if (!response.ok) throw new Error('Cloud state load failed (' + response.status + '): ' + await response.text().catch(() => ''));
      const rows = await response.json();
      if (!Array.isArray(rows) || !rows.length || !rows[0].state) {
        if (status) status.textContent = 'New portfolio · ready';
        return;
      }

      const remoteState = typeof rows[0].state === 'string' ? JSON.parse(rows[0].state) : rows[0].state;
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') window.__portfolio.restore(remoteState);
      if (status) status.textContent = 'Synced online ✓';
    } catch (error) {
      console.error('Portfolio cloud load error:', error);
      if (status) status.textContent = 'Cloud unavailable';
    }
  }

  // Disable browser persistence for this portfolio. Cloud is authoritative.
  const ORIGINAL = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear
  };

  Storage.prototype.getItem = function (key) {
    if (this === localStorage) return null;
    return ORIGINAL.getItem.call(this, key);
  };

  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage) {
      if (key === EDITOR_STATE_KEY && typeof value === 'string' && !syncing) queueSave(value);
      return;
    }
    return ORIGINAL.setItem.call(this, key, value);
  };

  Storage.prototype.removeItem = function (key) {
    if (this === localStorage) return;
    return ORIGINAL.removeItem.call(this, key);
  };

  Storage.prototype.clear = function () {
    if (this === localStorage) return;
    return ORIGINAL.clear.call(this);
  };

  try {
    ['krishna_portfolio_v4', 'krishna_portfolio_v5', 'krishna_portfolio_pending_upload', 'krishna_experiences', 'portfolio-theme'].forEach(k => ORIGINAL.removeItem.call(localStorage, k));
  } catch (_) {}

  window.addEventListener('load', function () {
    const wait = function () {
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') loadRemote();
      else setTimeout(wait, 50);
    };
    wait();
  });
})();
