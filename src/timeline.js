// Progressive enhancement: Teaching Journey scroll progress and active milestone states.
// High-performance scroll tracking via requestAnimationFrame, cached geometry,
// keyboard/details safety, and prefers-reduced-motion fallbacks.

let disposeTimeline = () => {};

export function cleanupTimeline() {
  disposeTimeline();
  disposeTimeline = () => {};
}

export function initTimeline(root = document) {
  cleanupTimeline();

  const container = root.querySelector('.timeline-container');
  if (!container) return;

  const track = container.querySelector('.timeline-track');
  const fill = container.querySelector('.timeline-fill');
  const list = container.querySelector('#experience-list');
  if (!track || !fill || !list) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const signal = events.signal;

  let scrollFrame = 0;
  let recalcFrame = 0;
  let cachedGeometry = null;
  let activeElement = null;

  const stop = () => {
    events.abort();
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
    if (recalcFrame) {
      cancelAnimationFrame(recalcFrame);
      recalcFrame = 0;
    }
    if (activeElement) {
      activeElement.classList.remove('is-active');
      activeElement = null;
    }
  };

  disposeTimeline = stop;

  const handleReducedMotion = () => {
    if (preference.matches) {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      fill.style.transform = 'none';
      if (activeElement) {
        activeElement.classList.remove('is-active');
        activeElement = null;
      }
    } else {
      scheduleRecalculate();
    }
  };

  preference.addEventListener('change', handleReducedMotion, { signal });
  if (preference.matches) {
    fill.style.transform = 'none';
    return;
  }

  // Measure milestone nodes and container offsets
  const recalculate = () => {
    recalcFrame = 0;
    const rows = [...list.querySelectorAll('.milestone-record')];
    const visibleRows = rows.filter(row => !row.hidden && row.offsetParent !== null);

    if (visibleRows.length === 0) {
      track.style.display = 'none';
      fill.style.transform = 'scaleY(0)';
      if (activeElement) {
        activeElement.classList.remove('is-active');
        activeElement = null;
      }
      cachedGeometry = null;
      return;
    }

    track.style.display = '';

    const containerRect = container.getBoundingClientRect();
    const currentScrollY = window.scrollY;

    const milestones = visibleRows.map(row => {
      const node = row.querySelector('.milestone-node') || row;
      const nodeRect = node.getBoundingClientRect();
      const nodeCenterY = (nodeRect.top + nodeRect.height / 2) - containerRect.top;
      const pageY = nodeRect.top + nodeRect.height / 2 + currentScrollY;
      return { row, node, nodeCenterY, pageY };
    });

    const first = milestones[0];
    const last = milestones[milestones.length - 1];

    // Align track line precisely between first and last node centers
    if (milestones.length === 1) {
      track.style.top = Math.round(first.nodeCenterY) + 'px';
      track.style.height = '0px';
    } else {
      track.style.top = Math.round(first.nodeCenterY) + 'px';
      track.style.height = Math.round(last.nodeCenterY - first.nodeCenterY) + 'px';
    }
    track.style.bottom = 'auto';

    cachedGeometry = {
      firstY: first.pageY,
      lastY: last.pageY,
      totalDistance: Math.max(0, last.pageY - first.pageY),
      milestones
    };

    updateProgress();
  };

  const scheduleRecalculate = () => {
    if (!recalcFrame) {
      recalcFrame = requestAnimationFrame(recalculate);
    }
  };

  // Fast scroll write: updates track fill & active milestone
  const updateProgress = () => {
    scrollFrame = 0;
    if (!cachedGeometry || cachedGeometry.milestones.length === 0) return;

    if (preference.matches) {
      fill.style.transform = 'none';
      return;
    }

    // Natural reading gaze focus: approximately 38% from the top of the viewport
    const viewportFocus = window.innerHeight * 0.38;
    const currentFocusY = window.scrollY + viewportFocus;

    const { firstY, lastY, totalDistance, milestones } = cachedGeometry;

    // Progress clamped safely between 0 and 1
    let ratio = 0;
    if (totalDistance > 0) {
      ratio = (currentFocusY - firstY) / totalDistance;
      ratio = Math.max(0, Math.min(1, ratio));
    } else {
      ratio = currentFocusY >= firstY ? 1 : 0;
    }

    fill.style.transform = `scaleY(${ratio.toFixed(4)})`;

    // Locate milestone nearest to reading focus
    let nearest = milestones[0];
    let minDiff = Math.abs(currentFocusY - nearest.pageY);

    for (let i = 1; i < milestones.length; i++) {
      const diff = Math.abs(currentFocusY - milestones[i].pageY);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = milestones[i];
      }
    }

    // Activate nearest milestone when within the journey's vertical span
    const withinSpan = currentFocusY >= (firstY - 120) && currentFocusY <= (lastY + 180);
    const targetRow = withinSpan ? nearest.row : null;

    if (activeElement !== targetRow) {
      if (activeElement) {
        activeElement.classList.remove('is-active');
      }
      if (targetRow) {
        targetRow.classList.add('is-active');
      }
      activeElement = targetRow;
    }
  };

  const scheduleScroll = () => {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(updateProgress);
    }
  };

  // Passive scroll listener for zero-blocking updates
  window.addEventListener('scroll', scheduleScroll, { passive: true, signal });
  window.addEventListener('resize', scheduleRecalculate, { passive: true, signal });

  // Details safety: opening an activity list triggers safe recalculation
  container.addEventListener('toggle', scheduleRecalculate, { capture: true, signal });

  // Collections safety: search and filter changes trigger recalculation
  const searchInput = root.querySelector('#experience-search');
  searchInput?.addEventListener('input', scheduleRecalculate, { signal });
  const filterButtons = root.querySelectorAll('[data-experience-filter]');
  filterButtons.forEach(btn => btn.addEventListener('click', scheduleRecalculate, { signal }));

  // ResizeObserver on timeline container for layout and font changes
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(scheduleRecalculate);
    ro.observe(container);
    signal.addEventListener('abort', () => ro.disconnect());
  }

  // Initial calculation on next paint cycle
  scheduleRecalculate();
}
