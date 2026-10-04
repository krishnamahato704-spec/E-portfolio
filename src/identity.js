// A symbolic globe: no countries, dates, biography or external media.
export function atlasMarkup() {
 return `<svg class="identity-atlas" viewBox="0 0 600 600" fill="none" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width=".8"><circle cx="300" cy="300" r="230"/><ellipse cx="300" cy="300" rx="145" ry="230"/><ellipse cx="300" cy="300" rx="60" ry="230"/><path d="M70 300h460M95 195h410M95 405h410M163 115h274M163 485h274M300 70v460"/><path d="M40 300h30m460 0h30M300 40v30m0 460v30"/></g></svg>`;
}

let dispose = () => {};
export function cleanupOpening() { dispose(); dispose = () => {}; }

export function initOpening() {
 cleanupOpening();
 const hero = document.querySelector('.opening-hero');
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 if (document.body.dataset.route !== 'home' || !hero || preference.matches || scrollY > 24 || location.hash) return;
 // If browser storage is unavailable, stay still instead of replaying each visit.
 try {
  if (sessionStorage.getItem('portfolio-identity-seen')) return;
  sessionStorage.setItem('portfolio-identity-seen', '1');
 } catch { return; }
 const intro = document.createElement('div');
 intro.className = 'identity-intro';
 intro.setAttribute('role', 'region');
 intro.setAttribute('aria-label', 'Portfolio introduction');
 intro.innerHTML = `<div class="intro-art" aria-hidden="true">${atlasMarkup()}<div class="intro-copy"><span class="intro-km">KM<span>.</span></span><p class="intro-name"></p><p class="intro-role">History &amp; Social Science Educator</p><div class="intro-timeline"><span>History</span><span>Learning</span><span>Teaching</span></div><p class="intro-principles">Inquiry · Evidence · Reflection</p></div></div><button type="button" class="intro-skip">Skip introduction <span aria-hidden="true">→</span></button>`;
 intro.querySelector('.intro-name').textContent = hero.querySelector('h1')?.textContent || 'Krishna Mahato';
 document.body.append(intro);
 const events = new AbortController();
 let timer;
 const finish = () => {
  clearTimeout(timer);
  events.abort();
  const restore = intro.contains(document.activeElement);
  intro.remove();
  if (restore) document.querySelector('#main')?.focus({preventScroll:true});
 };
 dispose = finish;
 intro.querySelector('button').addEventListener('click', finish, {signal:events.signal});
 document.addEventListener('keydown', e => { if (e.key === 'Escape') finish(); }, {signal:events.signal});
 // A visitor can immediately read, navigate, scroll or use any keyboard control.
 document.addEventListener('focusin', e => { if (!intro.contains(e.target)) finish(); }, {signal:events.signal});
 for (const name of ['wheel','touchstart','pointerdown']) {
  document.addEventListener(name, e => { if (!intro.contains(e.target)) finish(); }, {passive:true,signal:events.signal});
 }
 window.addEventListener('scroll', finish, {passive:true,signal:events.signal});
 window.addEventListener('pagehide', finish, {signal:events.signal});
 preference.addEventListener('change', finish, {signal:events.signal});
 intro.addEventListener('animationend', e => { if (e.target === intro) finish(); }, {signal:events.signal});
 timer = setTimeout(finish, 3300);
}
