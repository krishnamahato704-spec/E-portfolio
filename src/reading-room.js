// Optional reading aids. Native anchors and the evidence viewer keep their
// normal behavior; this module only adds context around them.
let dispose = () => {};

export function cleanupReadingRoom() {
  dispose();
  dispose = () => {};
}

export function initReadingRoom(root = globalThis.document?.querySelector('#main')) {
  cleanupReadingRoom();
  if (!root?.querySelectorAll) return;
  const doc = root.ownerDocument || globalThis.document;
  if (doc?.body?.dataset.route !== 'home') return;

  const links = [...root.querySelectorAll('.editorial-index a[href^="#"]')];
  const groups = [...root.querySelectorAll('[data-identity-lens]')];
  const pairs = [...root.querySelectorAll('[data-identity-pair]')];
  const rows = [...root.querySelectorAll('.selected-evidence-card[data-preview-src], .school-stage[data-preview-src]')]
    .filter(row => row.dataset.previewSrc?.trim() && row.dataset.previewCaption?.trim());
  if (!links.length && !groups.length && !rows.length) return;

  const win = doc.defaultView;
  if (!win) return;
  const events = new win.AbortController();
  const options = {signal: events.signal};
  const validLenses = new Set(['both', 'teacher', 'student']);
  const buttons = groups.flatMap(group => [...group.querySelectorAll('button[data-lens]')])
    .filter(button => validLenses.has(button.dataset.lens));
  const setLens = lens => {
    pairs.forEach(pair => { pair.dataset.lens = lens; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lens === lens)));
  };
  setLens('both');
  groups.forEach(group => { group.hidden = false; });
  buttons.forEach(button => {
    button.type = 'button';
    button.addEventListener('click', () => setLens(button.dataset.lens), options);
  });

  let indexFrame = 0;
  let preview;
  let image;
  let caption;
  let activeRow;
  let activeList;
  let frame = 0;
  let position;
  const closePreview = () => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    position = null;
    activeRow?.classList.remove('is-previewed');
    activeList?.classList.remove('preview-active');
    activeRow = null;
    activeList = null;
    if (preview) {
      preview.hidden = true;
      preview.classList.remove('is-visible');
    }
  };
  dispose = () => {
    events.abort();
    if (indexFrame) win.cancelAnimationFrame(indexFrame);
    indexFrame = 0;
    closePreview();
    preview?.remove();
    links.forEach(link => link.removeAttribute('aria-current'));
    groups.forEach(group => { group.hidden = true; });
    setLens('both');
  };

  if (links.length) {
    const targets = new Map();
    links.forEach(link => {
      let id;
      try { id = decodeURIComponent(link.getAttribute('href').slice(1)); }
      catch { return; }
      const section = id && doc.getElementById(id);
      if (section && root.contains(section)) targets.set(link, section);
    });
    const sections = [...new Set(targets.values())];
    const markSection = section => links.forEach(link => {
      if (targets.get(link) === section) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (sections.length) {
      const header = doc.querySelector('.site-header');
      const index = root.querySelector('.editorial-index');
      const updateIndex = () => {
        indexFrame = 0;
        if (events.signal.aborted) return;
        const bottom = element => element?.getBoundingClientRect().bottom || 0;
        const readingLine = Math.max(Math.max(bottom(header), bottom(index)) + 24, win.innerHeight * .35);
        let current = sections[0];
        sections.forEach(section => {
          if (section.getBoundingClientRect().top <= readingLine) current = section;
        });
        markSection(current);
      };
      const scheduleIndex = () => {
        if (!indexFrame && !events.signal.aborted) indexFrame = win.requestAnimationFrame(updateIndex);
      };
      win.addEventListener('scroll', scheduleIndex, {...options, passive: true});
      win.addEventListener('resize', scheduleIndex, {...options, passive: true});
      scheduleIndex();
    }
  }

  if (!rows.length || !win.matchMedia) return;
  const pointer = win.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = win.navigator?.connection;
  const allowed = () => !events.signal.aborted && pointer.matches &&
    !reducedMotion.matches && !connection?.saveData;

  preview = doc.createElement('div');
  preview.className = 'evidence-hover-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.inert = true;
  preview.hidden = true;
  image = doc.createElement('img');
  image.alt = '';
  image.decoding = 'async';
  caption = doc.createElement('p');
  preview.append(image, caption);
  doc.body.append(preview);

  const width = 280;
  const height = 340;
  const edge = 16;
  const gap = 24;
  const viewport = () => ({
    width: doc.documentElement.clientWidth || win.innerWidth,
    height: doc.documentElement.clientHeight || win.innerHeight,
  });
  const boundedPosition = (row, mode, point) => {
    const bounds = viewport();
    if (bounds.width < width + edge * 2 || bounds.height < height + edge * 2) return null;
    const clampY = value => Math.max(edge, Math.min(value, bounds.height - height - edge));
    if (mode === 'focus') {
      const rect = row.getBoundingClientRect();
      const right = rect.right + gap;
      const left = rect.left - width - gap;
      // When there is no clear side of the row, keep the focused link exposed.
      if (right + width <= bounds.width - edge) return {x: right, y: clampY(rect.top)};
      if (left >= edge) return {x: left, y: clampY(rect.top)};
      return null;
    }
    const x = point.x + gap + width <= bounds.width - edge ? point.x + gap : point.x - width - gap;
    return {
      x: Math.max(edge, Math.min(x, bounds.width - width - edge)),
      y: clampY(point.y - height / 2),
    };
  };
  const schedulePosition = next => {
    position = next;
    if (frame) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      if (!activeRow || !position || !allowed()) return;
      preview.style.transform = `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`;
      preview.hidden = false;
      preview.classList.add('is-visible');
    });
  };
  const showPreview = (row, mode, point) => {
    if (!allowed()) return;
    const next = boundedPosition(row, mode, point);
    if (!next) { closePreview(); return; }
    if (activeRow !== row) {
      closePreview();
      activeRow = row;
      activeList = row.closest('.selected-evidence-grid, .school-stages');
      activeRow.classList.add('is-previewed');
      activeList?.classList.add('preview-active');
      image.src = row.dataset.previewSrc;
      caption.textContent = row.dataset.previewCaption;
    }
    schedulePosition(next);
  };

  rows.forEach(row => {
    row.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      if (row.contains(doc.activeElement)) showPreview(row, 'focus');
      else showPreview(row, 'pointer', {x: event.clientX, y: event.clientY});
    }, options);
    row.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      if (row.contains(doc.activeElement)) showPreview(row, 'focus');
      else showPreview(row, 'pointer', {x: event.clientX, y: event.clientY});
    }, {...options, passive: true});
    row.addEventListener('pointerleave', () => {
      if (row.contains(doc.activeElement)) showPreview(row, 'focus');
      else if (activeRow === row) closePreview();
    }, options);
    row.addEventListener('focusin', () => showPreview(row, 'focus'), options);
    row.addEventListener('focusout', event => {
      if (!row.contains(event.relatedTarget) && activeRow === row) closePreview();
    }, options);
  });
  image.addEventListener('error', closePreview, options);
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePreview();
  }, options);
  win.addEventListener('scroll', closePreview, {...options, capture: true, passive: true});
  win.addEventListener('resize', closePreview, {...options, passive: true});
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) closePreview();
  }, options);
  pointer.addEventListener('change', closePreview, options);
  reducedMotion.addEventListener('change', closePreview, options);
  connection?.addEventListener?.('change', closePreview, options);
}
