// Lightswind-inspired Accessible Document & Media Lightbox
// Allows visitors to examine certificates, lesson plan previews, and teaching materials in full detail

let activeLightbox = null;
let previousFocus = null;
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function initLightbox(root = document) {
  if (typeof window === 'undefined') return;

  const triggers = root.querySelectorAll('.archive-doc-frame, .lightbox-trigger, .gallery-item a');

  triggers.forEach(trigger => {
    if(trigger.dataset.lightboxReady)return;
    trigger.dataset.lightboxReady='true';
    trigger.addEventListener('click', (e) => {
      // Allow Ctrl/Cmd + click to open direct link in new tab
      if (e.metaKey || e.ctrlKey) return;

      const img = trigger.querySelector('img');
      const href = trigger.getAttribute('href') || (img ? img.getAttribute('src') : null);
      if (!href) return;
      const target=new URL(href,location.href);
      if(!['http:','https:'].includes(target.protocol)||!/\.(webp|jpe?g|png)$/i.test(target.pathname))return;

      e.preventDefault();
      openLightbox({
        src: href,
        alt: img ? img.getAttribute('alt') || 'Document preview' : 'Document preview',
        title: trigger.getAttribute('aria-label') || trigger.dataset.title || (img ? img.getAttribute('alt') : 'Document Record'),
        caption: trigger.dataset.caption || '',
        category: trigger.dataset.category || 'ARCHIVE RECORD',
        directLink: href
      }, trigger);
    });
  });
}

function openLightbox(data, triggerElement) {
  closeLightbox();
  previousFocus = triggerElement || document.activeElement;
  data=Object.fromEntries(Object.entries(data).map(([key,value])=>[key,escapeHTML(value)]));

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', data.title);

  overlay.innerHTML = `
    <div class="lightbox-dialog">
      <div class="lightbox-header">
        <div class="lightbox-meta">
          <span class="lightbox-category">${data.category}</span>
          <h2 class="lightbox-title">${data.title}</h2>
        </div>
        <div class="lightbox-actions">
          <a class="lightbox-external-btn" href="${data.directLink}" target="_blank" rel="noopener noreferrer">
            Open Original ↗
          </a>
          <button class="lightbox-close-btn" type="button" aria-label="Close modal viewer">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
      <div class="lightbox-media-container">
        <img class="lightbox-img" src="${data.src}" alt="${data.alt}" loading="eager" decoding="sync">
      </div>
      ${data.caption ? `<div class="lightbox-footer"><p class="lightbox-caption">${data.caption}</p></div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  activeLightbox = overlay;

  const closeBtn = overlay.querySelector('.lightbox-close-btn');
  closeBtn?.focus();

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-dialog')) {
      closeLightbox();
    }
  });

  closeBtn?.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', onKeyDown);

  overlay._cleanup = () => {
    window.removeEventListener('keydown', onKeyDown);
  };
}

export function closeLightbox() {
  if (!activeLightbox) return;
  if (activeLightbox._cleanup) activeLightbox._cleanup();
  activeLightbox.remove();
  activeLightbox = null;
  document.body.style.overflow = '';
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
}
