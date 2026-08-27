(function () {
  'use strict';

  // Persistent image storage for the portfolio. Images are uploaded to Supabase
  // Storage; the portfolio's existing editor continues to use localStorage for
  // text/state, but saved image data URLs are transparently replaced by public URLs.
  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';
  const BUCKET = 'portfolio-media';
  const STATE_KEY = 'krishna_portfolio_v4';
  const PENDING_KEY = 'krishna_portfolio_pending_upload';
  const ORIGINAL_SET = Storage.prototype.setItem;
  const ORIGINAL_GET = Storage.prototype.getItem;
  let handling = false;

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
    const path = 'portfolio/' + safeLabel + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9) + '.' + ext;
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': blob.type || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: blob
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error('Upload failed (' + response.status + '): ' + text);
    }
    return publicUrl(path);
  }

  async function migrateState(raw) {
    let state;
    try { state = JSON.parse(raw); } catch (_) { return raw; }
    if (!state || !state.images) return raw;

    const jobs = [];
    const replaceImage = (value, label) => {
      if (typeof value !== 'string' || !value.startsWith('data:image/')) return Promise.resolve(value);
      return uploadDataUrl(value, label);
    };

    if (typeof state.images.portrait === 'string' && state.images.portrait.startsWith('data:image/')) {
      jobs.push(replaceImage(state.images.portrait, 'portrait').then(url => { state.images.portrait = url; }));
    }

    Object.keys(state.images).forEach(id => {
      if (id === 'portrait') return;
      const value = state.images[id];
      if (!Array.isArray(value)) return;
      state.images[id] = value.slice();
      value.forEach((src, index) => {
        if (typeof src === 'string' && src.startsWith('data:image/')) {
          jobs.push(replaceImage(src, id + '_' + index).then(url => { state.images[id][index] = url; }));
        }
      });
    });

    if (!jobs.length) return raw;
    await Promise.all(jobs);
    return JSON.stringify(state);
  }

  async function persistRemotely(raw) {
    try {
      ORIGINAL_SET.call(localStorage, PENDING_KEY, raw);
      const migrated = await migrateState(raw);
      ORIGINAL_SET.call(localStorage, STATE_KEY, migrated);
      ORIGINAL_SET.call(localStorage, PENDING_KEY, '');
      const status = document.getElementById('modeStatus');
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved online ✓';
    } catch (error) {
      console.error('Supabase image upload error:', error);
      const status = document.getElementById('modeStatus');
      if (status && document.body.classList.contains('editing')) status.textContent = 'Saved locally · upload retry needed';
    }
  }

  Storage.prototype.setItem = function (key, value) {
    ORIGINAL_SET.call(this, key, value);
    if (this !== localStorage || key !== STATE_KEY || handling) return;
    if (typeof value !== 'string' || value.indexOf('data:image/') === -1) return;
    handling = true;
    persistRemotely(value).finally(() => { handling = false; });
  };

  async function bootMigration() {
    const pending = ORIGINAL_GET.call(localStorage, PENDING_KEY);
    const current = ORIGINAL_GET.call(localStorage, STATE_KEY);
    const raw = pending || current;
    if (!raw || raw.indexOf('data:image/') === -1) return;
    handling = true;
    try {
      const migrated = await migrateState(raw);
      ORIGINAL_SET.call(localStorage, STATE_KEY, migrated);
      ORIGINAL_SET.call(localStorage, PENDING_KEY, '');
      // Reload once so the portfolio restores the new public URLs everywhere.
      if (current && current.indexOf('data:image/') !== -1) location.reload();
    } catch (error) {
      console.error('Supabase migration error:', error);
    } finally {
      handling = false;
    }
  }

  // Retry/migrate existing locally saved images shortly after the page loads.
  window.addEventListener('load', () => setTimeout(bootMigration, 250));
})();
