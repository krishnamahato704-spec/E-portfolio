// Lightswind-inspired Interactive Custom Cursor
// Elegant magnetic cursor with context badges ('EXPLORE', 'VIEW', 'OPEN', 'PDF')
// Active ONLY on desktop devices with fine pointer, auto-disabled on touch and reduced motion.

let cursorEl = null;
let ringEl = null;
let labelEl = null;
let rafId = null;
let mouseX = -100;
let mouseY = -100;
let ringX = -100;
let ringY = -100;

export function initCustomCursor() {
  if (typeof window === 'undefined') return;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || prefersReduced) return;

  if (document.querySelector('.custom-cursor-container')) return;

  const container = document.createElement('div');
  container.className = 'custom-cursor-container';
  container.setAttribute('aria-hidden', 'true');

  cursorEl = document.createElement('div');
  cursorEl.className = 'cursor-dot';

  ringEl = document.createElement('div');
  ringEl.className = 'cursor-ring';

  labelEl = document.createElement('span');
  labelEl.className = 'cursor-label';
  ringEl.appendChild(labelEl);

  container.appendChild(cursorEl);
  container.appendChild(ringEl);
  document.body.appendChild(container);

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorEl) {
      cursorEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
  };

  const updateRing = () => {
    // Lerp ring towards mouse with smooth inertia
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    if (ringEl) {
      ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    }
    rafId = requestAnimationFrame(updateRing);
  };

  const onMouseOver = (e) => {
    const target = e.target.closest('[data-cursor], a, button, summary, .interactive-3d-card, .archive-doc-frame, .milestone-card');
    if (!target || !ringEl) {
      ringEl.classList.remove('is-active', 'is-text');
      labelEl.textContent = '';
      return;
    }

    const customText = target.getAttribute('data-cursor');
    if (customText) {
      ringEl.classList.add('is-active', 'is-text');
      labelEl.textContent = customText;
    } else if (target.classList.contains('archive-doc-frame') || target.querySelector('.archive-cert-img')) {
      ringEl.classList.add('is-active', 'is-text');
      labelEl.textContent = 'VIEW';
    } else if (target.classList.contains('milestone-card') || target.closest('.milestone-record')) {
      ringEl.classList.add('is-active');
      labelEl.textContent = '';
    } else if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'SUMMARY') {
      ringEl.classList.add('is-active');
      labelEl.textContent = '';
    }
  };

  const onMouseOut = (e) => {
    if (!e.relatedTarget && ringEl) {
      ringEl.classList.remove('is-active', 'is-text');
      labelEl.textContent = '';
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
  rafId = requestAnimationFrame(updateRing);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    container.remove();
  };
}

export function cleanupCustomCursor() {
  const container = document.querySelector('.custom-cursor-container');
  if (container) container.remove();
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
