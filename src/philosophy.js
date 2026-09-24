// Progressive enhancement: Teaching Philosophy active principle observer.
// Highlights active principle in reading focus on desktop,
// with clean cleanup and prefers-reduced-motion safety.

let disposePhilosophy = () => {};

export function cleanupPhilosophy() {
  disposePhilosophy();
  disposePhilosophy = () => {};
}

export function initPhilosophy(root = document) {
  cleanupPhilosophy();

  const container = root.querySelector('.philosophy-sequence');
  if (!container) return;

  const principles = [...container.querySelectorAll('.philosophy-principle')];
  if (!principles.length) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const signal = events.signal;

  let observer = null;
  let activePrinciple = null;

  const setActive = (principle) => {
    if (activePrinciple === principle) return;
    if (activePrinciple) {
      activePrinciple.classList.remove('is-active');
    }
    activePrinciple = principle;
    if (activePrinciple) {
      activePrinciple.classList.add('is-active');
    }
  };

  const stop = () => {
    events.abort();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (activePrinciple) {
      activePrinciple.classList.remove('is-active');
      activePrinciple = null;
    }
  };

  disposePhilosophy = stop;

  if (preference.matches || window.innerWidth <= 900) {
    return;
  }

  preference.addEventListener('change', () => {
    if (preference.matches) stop();
  }, { signal });

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      // Find the intersecting entry closest to the reading focus line (35% from top)
      const intersecting = entries.filter(e => e.isIntersecting);
      if (intersecting.length > 0) {
        // Sort by distance to top of viewport
        intersecting.sort((a, b) => {
          const aDist = Math.abs(a.boundingClientRect.top - window.innerHeight * 0.35);
          const bDist = Math.abs(b.boundingClientRect.top - window.innerHeight * 0.35);
          return aDist - bDist;
        });
        setActive(intersecting[0].target);
      }
    }, {
      rootMargin: '-15% 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    });

    principles.forEach(p => observer.observe(p));
  }

  // Keyboard navigation focus immediately activates the principle
  container.addEventListener('focusin', (e) => {
    const principle = e.target.closest('.philosophy-principle');
    if (principle) setActive(principle);
  }, { signal });
}
