(function () {
  'use strict';

  // CLOUD-ONLY PORTFOLIO STORAGE
  // No portfolio data is persisted in browser localStorage.
  // The existing editor still calls localStorage, so we intercept those calls:
  // saves are sent directly to Supabase and reads are supplied from the cloud.
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4e8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const EDITOR_STATE_KEY = 'krishna_portfolio_v4';
  const REMOTE_STATE_PATH = 'state/portfolio-v5.json';

  const ORIGINAL = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
    key: Storage.prototype.key
  };

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  };

  let remoteState = null;
  let syncing = false;
  let initialized = false;

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
    return new Blob([bytes], {type: mime});
  }

  async function uploadImage(dataUrl, label) {
    const blob = dataUrlToBlob(dataUrl);
    const ext = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const safe = String(label || 'image').replace(/[^a-z0-9_-]/gi, '_').slice(0, 60);
    const path = 'portfolio-v5/' + safe + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9) + '.' + ext;
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign({}, headers, {'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'true'}),
      body: blob
    });
    if (!response.ok) throw new Error('Image upload failed (' + response.status + ')');
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
      remoteState = state;

      const blob = new Blob([JSON.stringify(state)], {type: 'application/json'});
      const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + REMOTE_STATE_PATH, {
        method: 'POST',
        headers: Object.assign({}, headers, {
          'Content-Type': 'application/json',
          'x-upsert': 'true',
          'cache-control': 'no-cache'
        }),
        body: blob
      });
      if (!response.ok) throw new Error('Cloud state save failed (' + response.status + '): ' + await response.text().catch(() => ''));

      // Put the uploaded public URLs back into the visible editor without
      // writing the state to browser storage.
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') {
        window.__portfolio.restore(state);
      }
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Portfolio cloud save error:', error);
      if (status && document.body.classList.contains('editing')) status.textContent = 'Cloud save failed — please try again';
    } finally {
      syncing = false;
    }
  }

  async function loadRemote() {
    const status = document.getElementById('modeStatus');
    try {
      const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + REMOTE_STATE_PATH + '?t=' + Date.now(), {headers});
      if (response.status === 404) {
        initialized = true;
        if (status) status.textContent = 'New portfolio · ready';
        return;
      }
      if (!response.ok) throw new Error('Cloud state load failed (' + response.status + ')');

      remoteState = await response.json();
      initialized = true;

      // Restore the cloud state directly. Nothing is written to localStorage.
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') {
        window.__portfolio.restore(remoteState);
      }
      if (status) status.textContent = 'Synced online ✓';
    } catch (error) {
      console.error('Portfolio cloud load error:', error);
      initialized = true;
      if (status) status.textContent = 'Cloud unavailable';
    }
  }

  // Disable browser persistence for this portfolio. All getItem calls return
  // null so old device-specific history can never override cloud data.
  Storage.prototype.getItem = function (key) {
    if (this === localStorage) return null;
    return ORIGINAL.getItem.call(this, key);
  };

  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage) {
      if (key === EDITOR_STATE_KEY && typeof value === 'string' && !syncing) saveRemote(value);
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

  // Erase any old browser-local portfolio keys that were created before the
  // cloud-only version. This is intentionally best-effort and never stores new data.
  try {
    ['krishna_portfolio_v4', 'krishna_portfolio_v5', 'krishna_portfolio_pending_upload', 'krishna_experiences', 'portfolio-theme'].forEach(k => ORIGINAL.removeItem.call(localStorage, k));
  } catch (_) {}

  // The editor script is loaded before this file, so wait until its public API
  // exists, then fetch the authoritative cloud state and restore it directly.
  window.addEventListener('load', () => {
    const wait = () => {
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') loadRemote();
      else setTimeout(wait, 50);
    };
    wait();
  });
})();
