// Keep the existing cursor effect, but animate only while it is catching up.
let dispose = () => {};
let active = false;

export function cleanupCustomCursor() {
  dispose();
  dispose = () => {};
  active = false;
}

export function initCustomCursor() {
  if (typeof window === 'undefined' || active) return;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!pointer.matches || reduced.matches) return;

  const events = new AbortController();
  const signal = events.signal;
  const container = document.createElement('div');
  container.className = 'custom-cursor-container';
  container.setAttribute('aria-hidden', 'true');
  container.hidden = true;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  const label = document.createElement('span');
  label.className = 'cursor-label';
  ring.append(label);
  container.append(dot, ring);
  document.body.append(container);
  active = true;

  let frame = 0, lastTime = 0;
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  const update = time => {
    frame = 0;
    if (document.hidden || container.hidden) return;
    // Use elapsed time so the same movement works on 60 Hz and 120 Hz screens.
    const delta = lastTime ? Math.min(50, time - lastTime) : 1000 / 60;
    lastTime = time;
    const amount = 1 - Math.pow(0.84, delta / (1000 / 60));
    ringX += (mouseX - ringX) * amount;
    ringY += (mouseY - ringY) * amount;
    const moving = Math.hypot(mouseX - ringX, mouseY - ringY) > 0.2;
    if (!moving) { ringX = mouseX; ringY = mouseY; lastTime = 0; }
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    if (moving) frame = requestAnimationFrame(update);
  };
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    container.hidden = true;
    ring.classList.remove('is-active', 'is-text');
    label.textContent = '';
  };
  window.addEventListener('mousemove', event => {
    if (document.hidden) return;
    mouseX = event.clientX; mouseY = event.clientY;
    if (container.hidden) { ringX = mouseX; ringY = mouseY; container.hidden = false; }
    if (!frame) frame = requestAnimationFrame(update);
  }, {passive:true, signal});
  document.addEventListener('mouseover', event => {
    const target = event.target.closest('[data-cursor], a, button, summary, .archive-doc-frame, .milestone-card');
    const text = target?.getAttribute('data-cursor') ||
      (target && (target.classList.contains('archive-doc-frame') || target.querySelector('.archive-cert-img')) ? 'VIEW' : '');
    ring.classList.toggle('is-active', !!target);
    ring.classList.toggle('is-text', !!text);
    label.textContent = text;
  }, {passive:true, signal});
  document.addEventListener('mouseout', event => { if (!event.relatedTarget) hide(); }, {passive:true, signal});
  document.addEventListener('visibilitychange', hide, {signal});
  const changed = () => { if (reduced.matches || !pointer.matches) cleanupCustomCursor(); };
  reduced.addEventListener('change', changed, {signal});
  pointer.addEventListener('change', changed, {signal});
  dispose = () => { hide(); events.abort(); container.remove(); };
  return cleanupCustomCursor;
}
