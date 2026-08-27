(function () {
  'use strict';

  // CLOUD-ONLY PORTFOLIO STORAGE
  // Portfolio state and images are stored in Supabase Storage.
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4e8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const EDITOR_STATE_KEY = 'krishna_portfolio_v4';
  const REMOTE_STATE_PATH = 'state/portfolio-v5.json';

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  };

  let syncing = false;

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
        'Content-Type': blob.type || 'application/octet-stream',
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
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });

      // IMPORTANT: Storage GET/POST object operations use /object/{bucket}/{path}.
      // The /object/public/... form is only for reading public assets.
      const response = await fetch(objectUrl(REMOTE_STATE_PATH), {
        method: 'POST',
        headers: Object.assign({}, headers, {
          'Content-Type': 'application/json',
          'x-upsert': 'true',
          'cache-control': 'no-cache'
        }),
        body: blob
      });
      if (!response.ok) throw new Error('Cloud state save failed (' + response.status + '): ' + await response.text().catch(() => ''));

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
      // Read the object through the normal Storage object endpoint, not the
      // public endpoint. The publishable key is sent for authorization.
      const response = await fetch(objectUrl(REMOTE_STATE_PATH) + '?t=' + Date.now(), {
        method: 'GET',
        headers: Object.assign({}, headers, { 'cache-control': 'no-cache' })
      });

      if (response.status === 404) {
        if (status) status.textContent = 'New portfolio · ready';
        return;
      }
      if (!response.ok) throw new Error('Cloud state load failed (' + response.status + '): ' + await response.text().catch(() => ''));

      const remoteState = await response.json();
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') {
        window.__portfolio.restore(remoteState);
      }
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

  try {
    ['krishna_portfolio_v4', 'krishna_portfolio_v5', 'krishna_portfolio_pending_upload', 'krishna_experiences', 'portfolio-theme'].forEach(k => ORIGINAL.removeItem.call(localStorage, k));
  } catch (_) {}

  window.addEventListener('load', () => {
    const wait = () => {
      if (window.__portfolio && typeof window.__portfolio.restore === 'function') loadRemote();
      else setTimeout(wait, 50);
    };
    wait();
  });
})();
