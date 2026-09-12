import {initTimeline, cleanupTimeline} from './timeline.js?v=opening-20260912';
import {initPhilosophy, cleanupPhilosophy} from './philosophy.js?v=opening-20260912';

// Progressive enhancement: nothing is hidden while waiting for JavaScript or an observer.
let dispose = () => {};
let heroPlayed = false;

export function cleanupMotion() {
  cleanupTimeline();
  cleanupPhilosophy();
  dispose();
  dispose = () => {};
}

export function initMotion({ initial = false } = {}) {
  cleanupMotion();
  const root = document.querySelector('#main');
  if (!root || ['admin', 'resume', '404'].includes(document.body.dataset.route)) return;
  initTimeline(root);
  initPhilosophy(root);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let observer;
  let resizeObserver;
  let frame = 0;
  let progress;
  const marked = new Set();
  const finish = element => element.classList.remove('motion-enter', 'motion-hero');
  const stop = () => {
    events.abort();
    cleanupTimeline();
    cleanupPhilosophy();
    observer?.disconnect();
    resizeObserver?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    marked.forEach(finish);
    progress?.remove();
  };
  dispose = () => { stop(); events.abort(); };
  // Changing the OS preference immediately stops active motion. Re-enabling
  // does not replay already-read content or add a second listener set.
  preference.addEventListener('change', stop, { signal: events.signal });
  if (preference.matches) return;

  const enter = (element, hero = false) => {
    marked.add(element);
    element.classList.add(hero ? 'motion-hero' : 'motion-enter');
  };
  document.addEventListener('animationend', e => {
    // Stagger children must finish before their parent drops its trigger.
    if (marked.has(e.target) && e.target.dataset.motion !== 'stagger') finish(e.target);
  }, { signal: events.signal });
  document.addEventListener('focusin', e => {
    // A keyboard user never has to wait for the focused control to arrive.
    for (let el = e.target; el && el !== root; el = el.parentElement) finish(el);
  }, { signal: events.signal });

  const hero = root.querySelector('.hero');
  if (hero && initial && !heroPlayed && scrollY < 24) {
    heroPlayed = true;
    const navigation = document.querySelector('.site-header .header-inner');
    if (navigation) { navigation.dataset.motionIndex = '0'; enter(navigation, true); }
    hero.querySelectorAll('[data-hero-step]').forEach(el => {
      el.dataset.motionIndex = el.dataset.heroStep;
      enter(el, true);
    });
  }

  root.querySelectorAll('.snapshot-grid, .school-stages, .practice-grid, #resource-list, .certificate-grid, .gallery-grid').forEach(group => {
    [...group.children].forEach((el, i) => { el.dataset.motionIndex = String(i % 3); });
  });
  const selector = [
    '.section-heading', '.page-heading', '.snapshot-grid > div', '.school-stage',
    '.practice-grid > article', '.experience-row', '.qualification', '.resource-row',
    '.certificate-card', '.gallery-grid > figure', '.profile-facts', '.prose > h2',
    '.evidence-aside', '.note-panel', '.pull-quote', '.influence-row > div',
    '.design-teaser', '.resource-feature', '.presentation-callout', '.closing-section',
    '.contact-layout > section', '.contact-note', '[data-motion]'
  ].join(',');
  const targets = [...root.querySelectorAll(selector)].filter(el =>
    !el.parentElement.closest(selector) && !el.closest('.hero')
  );
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!entry.target.contains(document.activeElement)) enter(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    // Read all geometry before changing classes. Refreshed content already in
    // view stays still; only unread content further down the page is observed.
    const positions = targets.map(el => ({ el, top: el.getBoundingClientRect().top }));
    positions.forEach(({ el, top }) => {
      if (top >= innerHeight - 24) observer.observe(el);
      else if (initial && scrollY < 24 && top >= 0) enter(el);
    });
  }

  progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const updateProgress = () => {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const ratio = distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
  window.addEventListener('scroll', schedule, { passive: true, signal: events.signal });
  window.addEventListener('resize', schedule, { passive: true, signal: events.signal });
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
  }
  schedule();
}
