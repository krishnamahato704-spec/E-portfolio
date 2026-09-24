// Progressive enhancement: Democracy lesson-design scroll-story interaction.
// Tracks reading focus through the 6 instructional stages, synchronizing
// the sticky planning lens, stage counter, vertical local rule, and active stage emphasis.
// Fully accessible, no scroll hijacking, and disabled under prefers-reduced-motion.

let disposeDemocracy = () => {};

export function cleanupDemocracy() {
  disposeDemocracy();
  disposeDemocracy = () => {};
}

export function initDemocracy(root = document) {
  cleanupDemocracy();

  const container = root.querySelector('.democracy-layout');
  if (!container) return;

  const stages = [...container.querySelectorAll('.democracy-stage')];
  if (!stages.length) return;

  const navLinks = [...container.querySelectorAll('.democracy-stage-nav a')];
  const counterEl = container.querySelector('#democracy-stage-counter .active-stage-num');
  const progressBar = container.querySelector('#democracy-progress-bar');
  const activeLabelEl = container.querySelector('#democracy-active-stage-label');

  const totalStages = stages.length;
  let activeIndex = -1;
  let observer = null;
  let scrollFrame = 0;

  const preference = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const events = new AbortController();
  const signal = events.signal;

  const setActiveStage = (index) => {
    if (index < 0 || index >= totalStages || index === activeIndex) return;
    activeIndex = index;

    stages.forEach((stage, i) => {
      if (i === index) {
        stage.classList.add('is-active');
      } else {
        stage.classList.remove('is-active');
      }
    });

    navLinks.forEach((link, i) => {
      if (i === index) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'step');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });

    const displayNum = String(index + 1).padStart(2, '0');
    if (counterEl) {
      counterEl.textContent = displayNum;
    }

    if (progressBar) {
      const pct = Math.round(((index + 1) / totalStages) * 100);
      progressBar.style.height = `${pct}%`;
    }

    if (activeLabelEl) {
      const stageName = navLinks[index]?.querySelector('.st-name')?.textContent || `Stage ${displayNum}`;
      activeLabelEl.textContent = `${displayNum} / ${stageName}`;
    }
  };

  const stop = () => {
    events.abort();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
    stages.forEach(s => s.classList.remove('is-active'));
    navLinks.forEach(l => {
      l.classList.remove('is-active');
      l.removeAttribute('aria-current');
    });
  };

  disposeDemocracy = stop;

  // Initialize with the first stage active so initial state is clear
  setActiveStage(0);

  if (preference.matches) {
    // Under reduced motion, keep stage 1 active or plain static view, no observer or scroll tracking
    return;
  }

  if (typeof preference.addEventListener === 'function') {
    preference.addEventListener('change', () => {
      if (preference.matches) stop();
    }, { signal });
  }

  if ('IntersectionObserver' in window) {
    // Reading focus area: between 15% and 55% from viewport top
    observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length > 0) {
        // Pick entry closest to 35% of viewport height
        visible.sort((a, b) => {
          const targetY = (window.innerHeight || 800) * 0.35;
          const aDist = Math.abs(a.boundingClientRect.top - targetY);
          const bDist = Math.abs(b.boundingClientRect.top - targetY);
          return aDist - bDist;
        });

        const targetId = visible[0].target.id;
        const targetIdx = stages.findIndex(s => s.id === targetId);
        if (targetIdx !== -1) {
          setActiveStage(targetIdx);
        }
      }
    }, {
      rootMargin: '-10% 0px -45% 0px',
      threshold: [0, 0.15, 0.4, 0.7, 1.0]
    });

    stages.forEach(s => observer.observe(s));
  }

  // Keyboard focus instantly updates active stage
  container.addEventListener('focusin', (e) => {
    const stage = e.target.closest('.democracy-stage');
    if (stage) {
      const idx = stages.indexOf(stage);
      if (idx !== -1) setActiveStage(idx);
    }
  }, { signal });

  // Clicking stage nav links smooth-scrolls to stage and activates it immediately
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', () => {
      setActiveStage(idx);
    }, { signal });
  });
}
