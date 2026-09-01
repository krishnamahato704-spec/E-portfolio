(function () {
  'use strict';

  const SCHEMA_VERSION = 2;
  const STATE_KEY = 'pageBuilder';
  const MAX_HISTORY = 50;
  const MAX_REVISIONS = 5;
  const ALLOWED_TAGS = new Set(['BR', 'STRONG', 'B', 'EM', 'I', 'U', 'SPAN', 'A', 'UL', 'OL', 'LI', 'P', 'SMALL', 'SUP', 'SUB']);
  const TEXT_SELECTOR = '[data-editable],[data-caption],[data-exp-field],h1,h2,h3,h4,h5,h6,p,blockquote,.section-label,.card-label,.tag,.skill-pill,.year,.sub,.meta,.gallery-caption';
  const COMPONENT_SELECTOR = '.card,.experience-card,.evidence-card,.profile-item,.timeline-item,.snapshot-item,.cert-upload,.academic-img,.upload-zone,.gallery-card,.feature-block,.thinking-lab,.cta-button,.tag,.skill-pill';
  const DEFAULT_TOKENS = {
    pageBackground: '#f6f0e3', primary: '#173f35', secondary: '#6f2934', accent: '#a88745',
    text: '#242b28', muted: '#56635d', headingFont: 'Georgia, serif',
    bodyFont: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', radius: '4px', spacing: '16px'
  };
  const LOCAL_TEST_PREFIX = 'portfolio_studio_local_test_';

  const LIBRARY = [
    ['Text', [
      ['heading', 'Heading', 'Large section heading'], ['subheading', 'Subheading', 'Supporting heading'],
      ['paragraph', 'Paragraph', 'Body copy'], ['quote', 'Quote', 'Highlighted quotation'],
      ['caption', 'Caption', 'Small supporting text'], ['label', 'Label', 'Eyebrow or category'],
      ['list', 'List', 'Bulleted list']]],
    ['Layout', [
      ['container', 'Container', 'Responsive content wrapper'], ['box', 'Box', 'Simple styled block'],
      ['card', 'Card', 'Title and description'], ['columns-2', '2 Columns', 'Responsive two-column layout'],
      ['columns-3', '3 Columns', 'Responsive three-column layout'], ['grid', 'Grid', 'Flexible card grid'],
      ['divider', 'Divider', 'Horizontal rule'], ['spacer', 'Spacer', 'Responsive breathing room']]],
    ['Shapes', [
      ['rectangle', 'Rectangle', 'Decorative shape'], ['rounded', 'Rounded rectangle', 'Decorative shape'],
      ['circle', 'Circle', 'Decorative shape'], ['line', 'Horizontal line', 'Decorative divider'],
      ['vertical-line', 'Vertical line', 'Decorative divider']]],
    ['Media', [
      ['image', 'Image', 'Upload to Supabase'], ['gallery', 'Gallery', 'Responsive image collection'],
      ['certificate', 'Certificate', 'Credential card and file'], ['document', 'Document', 'Downloadable evidence'],
      ['cv', 'CV', 'Manage the current CV'], ['evidence', 'Teaching evidence', 'Resource card and upload'],
      ['video', 'Video embed', 'Safe HTTPS video link']]],
    ['Portfolio', [
      ['experience', 'Experience', 'Flexible experience card'], ['qualification', 'Qualification', 'Timeline qualification'],
      ['skill', 'Skill', 'Single skill pill'], ['tag', 'Tag', 'Small subject tag'],
      ['timeline', 'Timeline item', 'Dated milestone'], ['reflection', 'Reflection card', 'Prompt and response'],
      ['assessment', 'Assessment card', 'Assessment practice'], ['resource', 'Teaching resource', 'Evidence resource'],
      ['certificate-card', 'Certificate card', 'Credential details'], ['custom-card', 'Custom card', 'Flexible portfolio card']]],
    ['Actions', [
      ['button', 'Button', 'Primary action'], ['link', 'Link', 'Text link']]]
  ];

  const SECTION_TEMPLATES = [
    ['blank', 'Blank'], ['heading-text', 'Heading + Text'], ['two-columns', 'Two Columns'],
    ['three-columns', 'Three Columns'], ['card-grid', 'Card Grid'], ['image-text', 'Image + Text'],
    ['gallery', 'Gallery'], ['timeline', 'Timeline'], ['evidence', 'Portfolio Evidence'], ['custom', 'Custom']
  ];

  let state = null;
  let selectedId = null;
  let history = [];
  let historyIndex = -1;
  let clipboard = null;
  let dragId = null;
  let editingText = false;
  let previewing = false;
  let ready = false;
  let restoring = false;
  let toastTimer = null;
  let originalSnapshot = null;
  let originalRestore = null;
  let originalSave = null;
  let originalDeleteFile = null;
  const expandedSections = new Set();

  function uid(prefix) {
    if (window.crypto && crypto.randomUUID) return prefix + '_' + crypto.randomUUID();
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function localTestKey() {
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return '';
    const params = new URLSearchParams(location.search);
    if (params.get('editor-test') !== '1') return '';
    return LOCAL_TEST_PREFIX + (params.get('test-key') || 'default');
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function safeText(value) { return String(value == null ? '' : value).replace(/[<>]/g, ''); }
  function safeUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(raw)) return raw;
    return '';
  }

  function sanitizeHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    template.content.querySelectorAll('*').forEach(node => {
      if (!ALLOWED_TAGS.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      Array.from(node.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'style' || !['href', 'target', 'rel'].includes(name)) node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A') {
        const href = safeUrl(node.getAttribute('href'));
        if (!href) node.removeAttribute('href'); else node.setAttribute('href', href);
        node.setAttribute('rel', 'noopener');
        if (/^https?:/i.test(href)) node.setAttribute('target', '_blank');
      }
    });
    return template.innerHTML;
  }

  function plainLabel(el) {
    return (el.getAttribute('aria-label') || el.dataset.builderName || el.querySelector?.('h1,h2,h3,h4,.section-title')?.textContent || el.textContent || el.id || 'Element')
      .replace(/\s+/g, ' ').trim().slice(0, 62);
  }

  function elementType(el) {
    if (el.matches('section')) return 'section';
    if (el.matches('img,.builder-image')) return 'image';
    if (el.matches('.experience-card')) return 'experience';
    if (el.matches('.cert-upload,.certificate-card')) return 'certificate';
    if (el.matches('.timeline-item')) return 'qualification';
    if (el.matches('.skill-pill')) return 'skill';
    if (el.matches('.tag')) return 'tag';
    if (el.matches('.card,.evidence-card,.profile-item,.snapshot-item,.gallery-card,.feature-block')) return 'card';
    if (el.matches('a,.cta-button,button')) return 'button';
    if (el.matches(TEXT_SELECTOR)) return 'text';
    return el.dataset.builderType || 'box';
  }

  function isTextLike(type) {
    return ['text','heading','subheading','paragraph','quote','caption','label','list','skill','tag','button','link'].includes(type);
  }

  function isInfrastructure(el) {
    return !el || !!el.closest('#portfolioStudio,#builderToolbar,#builderToast,#builderDeleteDialog,#builderRevisionDialog,#modeBar,#navbar,.section-controls,.media-action-bar,.resource-actions,.img-remove-btn,.exp-remove-btn,.slot-add-btn');
  }

  function sectionElements(section) {
    const nodes = Array.from(section.querySelectorAll(TEXT_SELECTOR + ',' + COMPONENT_SELECTOR + ',img'));
    return nodes.filter(el => !isInfrastructure(el) && !nodes.some(parent => parent !== el && parent.contains(el) && parent.matches(COMPONENT_SELECTOR) && !el.matches(TEXT_SELECTOR)));
  }

  function readStyle(el) {
    const s = el.style;
    return {
      width: s.width || '', minHeight: s.minHeight || '', height: s.height || '', padding: s.padding || '', margin: s.margin || '',
      background: s.backgroundColor || s.background || '', color: s.color || '', borderStyle: s.borderStyle || '',
      borderWidth: s.borderWidth || '', borderColor: s.borderColor || '', borderRadius: s.borderRadius || '', boxShadow: s.boxShadow || '',
      textAlign: s.textAlign || '', fontFamily: s.fontFamily || '', fontSize: s.fontSize || '', fontWeight: s.fontWeight || '',
      fontStyle: s.fontStyle || '', textDecoration: s.textDecoration || '', lineHeight: s.lineHeight || '', letterSpacing: s.letterSpacing || '',
      textTransform: s.textTransform || '', opacity: s.opacity || '', transform: s.transform || '', gap: s.gap || '',
      gridTemplateColumns: s.gridTemplateColumns || '', objectFit: s.objectFit || '', objectPosition: s.objectPosition || ''
    };
  }

  function applyStyle(el, style) {
    if (!el || !style) return;
    Object.entries(style).forEach(([key, value]) => {
      if (value == null || value === '') el.style[key] = '';
      else el.style[key] = String(value);
    });
  }

  function recordFromElement(el) {
    let id = el.dataset.builderId;
    if (!id) {
      const experienceId = el.closest('[data-id]')?.dataset.id || '';
      const stable = el.dataset.editable || el.dataset.caption || (el.dataset.expField ? experienceId + '_' + el.dataset.expField : '') || el.id;
      id = stable ? 'element_' + stable.replace(/[^a-z0-9_-]/gi, '_') : uid('element');
      el.dataset.builderId = id;
    }
    const type = elementType(el);
    const parentBuilder = el.parentElement?.closest('[data-builder-id]');
    const record = {
      id, type, name: plainLabel(el), added: el.dataset.builderAdded === 'true', locked: el.dataset.builderLocked === 'true',
      visible: el.dataset.builderHidden !== 'true', responsive: { desktop: true, tablet: true, mobile: true },
      style: readStyle(el), className: el.className || '', tag: el.tagName.toLowerCase(),
      parentId: parentBuilder && !parentBuilder.matches('section') ? parentBuilder.dataset.builderId : null
    };
    if (type === 'text' || type === 'button' || ['heading','subheading','paragraph','quote','caption','label','list','skill','tag'].includes(type)) record.content = sanitizeHtml(el.innerHTML);
    if (el.matches('img')) record.media = { url: safeUrl(el.currentSrc || el.src), alt: el.alt || '', caption: '', objectFit: el.style.objectFit || 'cover', position: el.style.objectPosition || '50% 50%' };
    if (el.matches('a')) record.href = safeUrl(el.getAttribute('href'));
    return record;
  }

  function sectionRecord(section, index) {
    let builderId = section.dataset.builderId;
    if (!builderId) {
      builderId = 'section_' + (section.id || uid('untitled')).replace(/[^a-z0-9_-]/gi, '_');
      section.dataset.builderId = builderId;
    }
    const label = section.querySelector(':scope > .container > .section-label,.section-label')?.textContent?.trim() || plainLabel(section) || 'Section';
    return {
      id: builderId,
      domId: section.id || ('section-' + index + '-' + Date.now()),
      type: 'section',
      template: section.dataset.builderTemplate || 'existing',
      name: label,
      navigationLabel: section.dataset.navigationLabel || label.replace(/^\d+\s*[·.-]\s*/, ''),
      showInNavigation: section.dataset.showNavigation !== 'false',
      visible: section.dataset.builderHidden !== 'true' && !section.classList.contains('deleted-section'),
      locked: section.dataset.builderLocked === 'true',
      responsive: { desktop: true, tablet: true, mobile: true },
      style: readStyle(section),
      children: sectionElements(section).map(recordFromElement)
    };
  }

  function assetFromUrl(url, alt, caption) {
    const safe = safeUrl(url);
    if (!safe || safe.startsWith('data:')) return null;
    const pathMatch = safe.match(/\/portfolio-media\/(.+?)(?:\?|$)/);
    const path = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    return { id: uid('asset'), url: safe, path, filename: path.split('/').pop() || '', type: '', size: 0, alt: alt || '', caption: caption || '', status: 'active' };
  }

  function migrateLegacy(base) {
    const legacy = base || {};
    const sections = Array.from(document.querySelectorAll('body > section')).filter(section => !section.classList.contains('legacy-certificate-layout') && !section.classList.contains('legacy-professional-development'));
    const assets = {};
    Object.entries(legacy.images || {}).forEach(([key, value]) => {
      const urls = Array.isArray(value) ? value : [value];
      urls.forEach(url => {
        const asset = assetFromUrl(url, '', legacy.captions?.[key] || '');
        if (asset) assets[asset.id] = asset;
      });
    });
    (legacy.gallery || []).forEach(item => {
      const asset = assetFromUrl(item.url, item.alt, item.caption);
      if (asset) assets[asset.id] = { ...asset, ...item, id: asset.id };
    });
    Object.values(legacy.resources || {}).flat().forEach(item => {
      const asset = assetFromUrl(item.url, item.alt, item.caption);
      if (asset) assets[asset.id] = { ...asset, ...item, id: asset.id };
    });
    if (legacy.cv?.url) {
      const asset = assetFromUrl(legacy.cv.url, 'Curriculum vitae', '');
      if (asset) assets[asset.id] = { ...asset, ...legacy.cv, id: asset.id };
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      migratedFrom: legacy.schemaVersion || 1,
      migratedAt: new Date().toISOString(),
      page: { sections: sections.map(sectionRecord) },
      experiences: clone(legacy.experiences || []), certificates: [], qualifications: [],
      assets, settings: { tokens: clone(DEFAULT_TOKENS), device: 'desktop' },
      pendingOrphans: [], revisions: [], lastSavedAt: legacy.updated_at || null
    };
  }

  function normalizeBuilder(input, legacy) {
    if (!input || Number(input.schemaVersion || 0) < 2 || !input.page || !Array.isArray(input.page.sections)) return migrateLegacy(legacy);
    const next = clone(input);
    next.schemaVersion = SCHEMA_VERSION;
    next.settings = next.settings || {};
    next.settings.tokens = { ...DEFAULT_TOKENS, ...(next.settings.tokens || {}) };
    next.assets = next.assets || {};
    next.pendingOrphans = Array.isArray(next.pendingOrphans) ? next.pendingOrphans : [];
    next.revisions = Array.isArray(next.revisions) ? next.revisions.slice(-MAX_REVISIONS) : [];
    next.page.sections.forEach(section => {
      section.id ||= uid('section'); section.domId ||= uid('section-dom'); section.type = 'section';
      section.children = Array.isArray(section.children) ? section.children : [];
      section.responsive = { desktop: true, tablet: true, mobile: true, ...(section.responsive || {}) };
      section.children.forEach(child => {
        child.id ||= uid('element'); child.style ||= {}; child.visible = child.visible !== false;
        child.responsive = { desktop: true, tablet: true, mobile: true, ...(child.responsive || {}) };
      });
    });
    return next;
  }

  function stateForHistory() {
    captureDom();
    const copy = clone(state);
    copy.revisions = [];
    return copy;
  }

  function pushHistory(label) {
    if (restoring) return;
    const entry = { label: label || 'Change', state: stateForHistory() };
    history = history.slice(0, historyIndex + 1);
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateUndoButtons();
  }

  function commit(label) {
    captureDom();
    pushHistory(label);
    window.__portfolio?.markDirty?.();
    setSaveState('Unsaved changes');
    renderLayers();
    updateInspector();
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    restoreHistory(history[historyIndex].state, 'Undo: ' + history[historyIndex + 1].label);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    restoreHistory(history[historyIndex].state, 'Redo: ' + history[historyIndex].label);
  }

  function restoreHistory(next, label) {
    restoring = true;
    state = clone(next);
    renderState();
    restoring = false;
    window.__portfolio?.markDirty?.();
    setSaveState('Unsaved changes');
    announce(label);
    updateUndoButtons();
  }

  function applyTokens() {
    const t = state.settings.tokens;
    const root = document.documentElement.style;
    root.setProperty('--bg', t.pageBackground);
    root.setProperty('--accent', t.primary);
    root.setProperty('--accent2', t.secondary);
    root.setProperty('--gold', t.accent);
    root.setProperty('--text', t.text);
    root.setProperty('--muted', t.muted);
    root.setProperty('--serif', t.headingFont);
    root.setProperty('--font', t.bodyFont);
    root.setProperty('--radius', t.radius);
    root.setProperty('--builder-standard-spacing', t.spacing);
  }

  function templateMarkup(record) {
    const id = record.id;
    const content = sanitizeHtml(record.content || 'Edit this content');
    const common = `data-builder-id="${id}" data-builder-added="true" data-builder-type="${record.type}"`;
    switch (record.type) {
      case 'heading': return `<h2 ${common} class="section-title builder-added">${content}</h2>`;
      case 'subheading': return `<h3 ${common} class="builder-added">${content}</h3>`;
      case 'paragraph': return `<p ${common} class="builder-added">${content}</p>`;
      case 'quote': return `<blockquote ${common} class="card builder-added">${content}</blockquote>`;
      case 'caption': return `<small ${common} class="builder-added">${content}</small>`;
      case 'label': return `<div ${common} class="section-label builder-added">${content}</div>`;
      case 'list': return `<ul ${common} class="builder-added"><li>First item</li><li>Second item</li></ul>`;
      case 'divider': return `<hr ${common} class="builder-added">`;
      case 'spacer': return `<div ${common} class="builder-spacer builder-added" aria-label="Spacer"></div>`;
      case 'rectangle': case 'rounded': case 'circle': case 'line': case 'vertical-line':
        return `<div ${common} class="builder-shape ${record.type} builder-added" role="img" aria-label="Decorative ${record.type.replace('-', ' ')}"></div>`;
      case 'columns-2': case 'columns-3': case 'grid': {
        const count = record.type === 'columns-3' ? 3 : 2;
        return `<div ${common} class="builder-columns builder-added" style="--builder-columns:${count}">${Array.from({length: count}, (_, i) => `<div class="builder-column">Column ${i + 1}</div>`).join('')}</div>`;
      }
      case 'image': case 'gallery':
        return `<figure ${common} class="builder-image builder-added"><div class="builder-media-placeholder">Select this element, then choose Upload / replace in Properties.</div><figcaption>${safeText(record.media?.caption || 'Add a caption')}</figcaption></figure>`;
      case 'video':
        return `<div ${common} class="card builder-added"><div class="card-label">Video</div><h3>${content || 'Video resource'}</h3><p>Set a safe HTTPS URL in Properties. Videos open in a new tab to protect visitor privacy.</p></div>`;
      case 'button': return `<a ${common} class="cta-button builder-added" href="#">${content || 'Button label'}</a>`;
      case 'link': return `<a ${common} class="builder-added" href="#">${content || 'Link label'}</a>`;
      case 'skill': return `<span ${common} class="skill-pill builder-added">${content || 'New skill'}</span>`;
      case 'tag': return `<span ${common} class="tag builder-added">${content || 'New tag'}</span>`;
      case 'timeline': case 'qualification':
        return `<article ${common} class="timeline-item builder-added"><div class="year">Add date · In progress</div><h3>${content || 'New qualification'}</h3><div class="sub">Add organisation and details</div></article>`;
      case 'experience':
        return `<article ${common} class="experience-card builder-added"><div class="exp-header"><h3>${content || 'New experience'}</h3><span class="exp-status upcoming">Upcoming</span></div><div class="exp-meta"><span class="exp-type">Experience</span><span>Add duration</span></div><div class="card-label">Experience evidence</div><p>Add a description. Images and documents can be added as child elements.</p></article>`;
      case 'certificate': case 'certificate-card':
        return `<article ${common} class="card certificate-card builder-added"><div class="card-label">Certificate</div><h3>${content || 'Certificate title'}</h3><p>Organisation · Date</p><p>Add a credential description and URL.</p><div class="builder-media-placeholder">Upload certificate image or PDF</div></article>`;
      case 'evidence': case 'resource':
        return `<article ${common} class="evidence-card builder-added"><div class="evidence-content"><div class="card-label">Teaching evidence</div><h3>${content || 'Teaching resource'}</h3><p>Add a description, then upload a supporting file.</p><div class="builder-media-placeholder">Upload file</div></div></article>`;
      case 'reflection': case 'assessment': case 'custom-card': case 'card':
        return `<article ${common} class="card builder-added"><div class="card-label">${record.type === 'assessment' ? 'Assessment' : record.type === 'reflection' ? 'Reflection' : 'Portfolio'}</div><h3>${content || 'New card'}</h3><p>Add a description.</p></article>`;
      case 'container': return `<div ${common} class="container builder-added"><p>Add content inside this responsive container.</p></div>`;
      case 'box': default: return `<div ${common} class="builder-added card">${content || 'New box'}</div>`;
    }
  }

  function createSectionDom(record) {
    const section = document.createElement('section');
    section.id = record.domId;
    section.dataset.builderId = record.id;
    section.dataset.builderTemplate = record.template || 'custom';
    section.dataset.customSection = 'true';
    const columns = record.template === 'three-columns' ? 3 : 2;
    let body = '<div class="card"><p data-builder-added="true">Add your content here.</p></div>';
    if (record.template === 'blank') body = '';
    if (record.template === 'two-columns' || record.template === 'three-columns') body = `<div class="builder-columns" style="--builder-columns:${columns}">${Array.from({length: columns}, (_, i) => `<div class="builder-column"><h3>Column ${i + 1}</h3><p>Add content.</p></div>`).join('')}</div>`;
    if (record.template === 'card-grid') body = '<div class="grid-3"><article class="card"><h3>Project one</h3><p>Add details.</p></article><article class="card"><h3>Project two</h3><p>Add details.</p></article><article class="card"><h3>Project three</h3><p>Add details.</p></article></div>';
    if (record.template === 'image-text') body = '<div class="grid-2"><div class="builder-media-placeholder">Add an image</div><article class="card"><h3>Story title</h3><p>Add supporting text.</p></article></div>';
    if (record.template === 'gallery') body = '<div class="grid-3"><div class="builder-media-placeholder">Image 1</div><div class="builder-media-placeholder">Image 2</div><div class="builder-media-placeholder">Image 3</div></div>';
    if (record.template === 'timeline') body = '<div class="timeline"><article class="timeline-item"><div class="year">Add date</div><h3>Milestone</h3><div class="sub">Add details</div></article></div>';
    if (record.template === 'evidence') body = '<div class="grid-3"><article class="evidence-card"><div class="evidence-content"><h3>Evidence item</h3><p>Add a file and reflection.</p></div></article></div>';
    section.innerHTML = `<div class="container"><div class="section-label">${safeText(record.navigationLabel || record.name)}</div><h2 class="section-title">${safeText(record.name || 'New section')}</h2><p class="section-desc">Add a short introduction for this section.</p>${body}</div>`;
    document.querySelector('footer')?.before(section);
    return section;
  }

  function ensureSectionControls(section) {
    if (section.querySelector(':scope > .builder-section-controls')) return;
    const controls = document.createElement('div');
    controls.className = 'builder-section-controls';
    controls.innerHTML = '<button type="button" data-action="up">↑ Section</button><button type="button" data-action="down">↓ Section</button><button type="button" data-action="duplicate">Duplicate</button><button type="button" data-action="add-above">+ Above</button><button type="button" data-action="add-below">+ Below</button>';
    controls.addEventListener('click', event => {
      event.stopPropagation();
      const action = event.target.closest('button')?.dataset.action;
      if (!action) return;
      if (action === 'up') moveSelected(-1);
      if (action === 'down') moveSelected(1);
      if (action === 'duplicate') duplicateSelected();
      if (action === 'add-above') addSection('heading-text', section.dataset.builderId, 'before');
      if (action === 'add-below') addSection('heading-text', section.dataset.builderId, 'after');
    });
    section.prepend(controls);
  }

  function findRecord(id) {
    for (const section of state.page.sections) {
      if (section.id === id) return { record: section, section, parent: state.page.sections };
      const child = section.children.find(item => item.id === id);
      if (child) return { record: child, section, parent: section.children };
    }
    return null;
  }

  function elementFor(id) { return id ? document.querySelector(`[data-builder-id="${CSS.escape(id)}"]`) : null; }

  function captureDom() {
    if (!state || restoring) return;
    state.page.sections.forEach(sectionRecord => {
      const section = elementFor(sectionRecord.id) || document.getElementById(sectionRecord.domId);
      if (!section) return;
      sectionRecord.domId = section.id;
      sectionRecord.name = section.querySelector('.section-title')?.textContent?.trim() || sectionRecord.name;
      sectionRecord.navigationLabel = section.querySelector(':scope > .container > .section-label,.section-label')?.textContent?.trim()?.replace(/^\d+\s*[·.-]\s*/, '') || sectionRecord.navigationLabel;
      sectionRecord.style = readStyle(section);
      sectionRecord.children.forEach(child => {
        const el = elementFor(child.id);
        if (!el) return;
        child.name = plainLabel(el); child.style = readStyle(el);
        child.locked = el.dataset.builderLocked === 'true'; child.visible = el.dataset.builderHidden !== 'true';
        if (child.content !== undefined) {
          if (isTextLike(child.type)) child.content = sanitizeHtml(el.innerHTML);
          else child.content = sanitizeHtml(el.querySelector('h1,h2,h3,h4,h5,h6')?.innerHTML || child.content);
        } else if (el.matches(TEXT_SELECTOR)) child.content = sanitizeHtml(el.innerHTML);
        if (el.matches('img')) child.media = { ...(child.media || {}), url: safeUrl(el.currentSrc || el.src), alt: el.alt || '', objectFit: el.style.objectFit || 'cover', position: el.style.objectPosition || '50% 50%' };
        if (el.matches('a')) child.href = safeUrl(el.getAttribute('href'));
      });
    });
  }

  function renderState() {
    if (!state) return;
    const validIds = new Set(state.page.sections.flatMap(section => [section.id, ...section.children.map(child => child.id)]));
    document.querySelectorAll('[data-builder-added="true"][data-builder-id]').forEach(el => { if (!validIds.has(el.dataset.builderId)) el.remove(); });
    document.querySelectorAll('section[data-builder-template][data-builder-id]').forEach(el => { if (!validIds.has(el.dataset.builderId)) el.remove(); });
    applyTokens();
    const footer = document.querySelector('footer');
    state.page.sections.forEach(sectionRecord => {
      let section = document.getElementById(sectionRecord.domId) || elementFor(sectionRecord.id);
      if (!section && sectionRecord.template !== 'existing') section = createSectionDom(sectionRecord);
      if (!section) return;
      section.dataset.builderId = sectionRecord.id;
      section.dataset.builderLocked = String(!!sectionRecord.locked);
      section.dataset.builderHidden = String(sectionRecord.visible === false);
      section.dataset.navigationLabel = sectionRecord.navigationLabel || sectionRecord.name;
      section.dataset.showNavigation = String(sectionRecord.showInNavigation !== false);
      applyStyle(section, sectionRecord.style);
      footer?.before(section);
      ensureSectionControls(section);
      sectionRecord.children.forEach(child => {
        let el = elementFor(child.id);
        if (!el && child.added) {
          const holder = document.createElement('div');
          holder.innerHTML = templateMarkup(child);
          el = holder.firstElementChild;
          const parent = child.parentId ? elementFor(child.parentId) : null;
          const container = parent || section.querySelector(':scope > .container') || section;
          container.appendChild(el);
        }
        if (!el) return;
        el.dataset.builderId = child.id;
        el.dataset.builderLocked = String(!!child.locked);
        el.dataset.builderHidden = String(child.visible === false);
        el.draggable = document.body.classList.contains('builder-editing') && !child.locked;
        applyStyle(el, child.style);
        if (child.content !== undefined && !editingText) {
          if (isTextLike(child.type)) el.innerHTML = sanitizeHtml(child.content);
          else {
            const heading = el.querySelector('h1,h2,h3,h4,h5,h6');
            if (heading) heading.innerHTML = sanitizeHtml(child.content);
          }
        }
        if (el.matches('a') && child.href !== undefined) el.setAttribute('href', safeUrl(child.href) || '#');
        if (el.matches('img') && child.media) {
          if (safeUrl(child.media.url)) el.src = safeUrl(child.media.url);
          el.alt = child.media.alt || '';
          el.style.objectFit = child.media.objectFit || 'cover';
          el.style.objectPosition = child.media.position || '50% 50%';
        }
        ensureResizeHandle(el);
      });
    });
    rebuildNavigation();
    applyResponsiveVisibility();
    bindCanvas();
    renderLayers();
    updateInspector();
    positionToolbar();
  }

  function rebuildNavigation() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    const editorEntry = nav.querySelector('.nav-editor-entry')?.closest('li');
    const cvEntry = nav.querySelector('.nav-cv-link')?.closest('li');
    nav.innerHTML = '';
    state.page.sections.filter(section => section.showInNavigation !== false && section.visible !== false && section.domId !== 'recruiter-snapshot').forEach(section => {
      const el = document.getElementById(section.domId);
      if (!el) return;
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + section.domId;
      link.textContent = section.domId === 'hero' ? 'Home' : section.navigationLabel || section.name;
      link.addEventListener('click', () => nav.classList.remove('open'));
      li.appendChild(link); nav.appendChild(li);
    });
    const footerContact = document.getElementById('contact');
    if (footerContact) {
      const li = document.createElement('li'); li.innerHTML = '<a href="#contact">Contact</a>'; nav.appendChild(li);
    }
    if (cvEntry) nav.appendChild(cvEntry);
    if (editorEntry) nav.appendChild(editorEntry);
  }

  function applyResponsiveVisibility() {
    const device = state.settings.device || 'desktop';
    state.page.sections.forEach(section => {
      const sectionEl = elementFor(section.id);
      if (sectionEl) sectionEl.classList.toggle('builder-responsive-hidden', section.responsive?.[device] === false);
      section.children.forEach(child => {
        const el = elementFor(child.id);
        if (el) el.classList.toggle('builder-responsive-hidden', child.responsive?.[device] === false);
      });
    });
  }

  function ensureResizeHandle(el) {
    if (!el || el.matches('section') || el.querySelector(':scope > .builder-resize-handle')) return;
    const handle = document.createElement('span');
    handle.className = 'builder-resize-handle'; handle.setAttribute('aria-hidden', 'true');
    handle.addEventListener('pointerdown', startResize);
    el.appendChild(handle);
  }

  function startResize(event) {
    event.preventDefault(); event.stopPropagation();
    const el = event.currentTarget.parentElement;
    const found = findRecord(el.dataset.builderId);
    if (!found || found.record.locked) return;
    const startX = event.clientX, startY = event.clientY;
    const rect = el.getBoundingClientRect();
    const move = moveEvent => {
      const width = Math.max(40, Math.round(rect.width + moveEvent.clientX - startX));
      const height = Math.max(24, Math.round(rect.height + moveEvent.clientY - startY));
      el.style.width = Math.min(width, el.parentElement?.clientWidth || width) + 'px';
      el.style.minHeight = height + 'px';
      found.record.style.width = el.style.width; found.record.style.minHeight = el.style.minHeight;
      positionToolbar();
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      commit('Resize ' + found.record.name);
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up, { once: true });
  }

  function bindCanvas() {
    document.querySelectorAll('[data-builder-id]').forEach(el => {
      if (isInfrastructure(el) || el.dataset.builderBound === 'true') return;
      el.dataset.builderBound = 'true';
      el.addEventListener('click', selectFromEvent);
      el.addEventListener('dblclick', beginInlineEdit);
      el.addEventListener('dragstart', onDragStart);
      el.addEventListener('dragover', event => { if (dragId) event.preventDefault(); });
      el.addEventListener('drop', onDrop);
    });
  }

  function selectFromEvent(event) {
    if (!document.body.classList.contains('builder-editing') || previewing || editingText || isInfrastructure(event.target)) return;
    const target = event.target.closest('[data-builder-id]');
    if (!target) return;
    event.preventDefault(); event.stopPropagation();
    select(target.dataset.builderId);
  }

  function select(id, scroll) {
    document.querySelectorAll('.builder-selected').forEach(el => el.classList.remove('builder-selected'));
    selectedId = id || null;
    const el = elementFor(selectedId);
    if (el) {
      el.classList.add('builder-selected');
      if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateInspector(); renderLayers(); positionToolbar();
  }

  function beginInlineEdit(event) {
    if (!document.body.classList.contains('builder-editing') || previewing) return;
    const target = event.target.closest(TEXT_SELECTOR);
    if (!target || target.closest('[data-builder-locked="true"]')) return;
    const owner = target.closest('[data-builder-id]');
    if (owner) select(owner.dataset.builderId);
    event.preventDefault(); event.stopPropagation();
    editingText = true;
    target.contentEditable = 'true'; target.focus();
    const range = document.createRange(); range.selectNodeContents(target); range.collapse(false);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    const finish = () => {
      target.innerHTML = sanitizeHtml(target.innerHTML);
      target.contentEditable = 'false'; editingText = false;
      target.removeEventListener('blur', finish); commit('Edit text');
    };
    target.addEventListener('blur', finish);
  }

  function onDragStart(event) {
    const el = event.currentTarget;
    const found = findRecord(el.dataset.builderId);
    if (!found || found.record.locked || editingText) { event.preventDefault(); return; }
    dragId = found.record.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragId);
  }

  function onDrop(event) {
    event.preventDefault(); event.stopPropagation();
    const source = findRecord(dragId || event.dataTransfer.getData('text/plain'));
    const targetEl = event.target.closest('[data-builder-id]');
    const target = findRecord(targetEl?.dataset.builderId);
    if (!source || !target || source.record.locked || source.record.id === target.record.id) return;
    if (source.record.type === 'section' && target.record.type === 'section') {
      reorderInArray(state.page.sections, source.record.id, target.record.id);
    } else if (source.section.id === target.section.id && source.record.type !== 'section' && target.record.type !== 'section') {
      reorderInArray(source.section.children, source.record.id, target.record.id);
      const sourceEl = elementFor(source.record.id); const targetNode = elementFor(target.record.id);
      targetNode?.parentNode?.insertBefore(sourceEl, targetNode);
    } else return;
    dragId = null; renderState(); commit('Reorder ' + source.record.name);
  }

  function reorderInArray(array, sourceId, targetId) {
    const from = array.findIndex(item => item.id === sourceId); const to = array.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = array.splice(from, 1); array.splice(to, 0, item);
  }

  function addElement(type) {
    let sectionInfo = findRecord(selectedId);
    let section = sectionInfo?.record.type === 'section' ? sectionInfo.record : sectionInfo?.section;
    if (!section) section = state.page.sections.find(item => item.visible !== false) || state.page.sections[0];
    if (!section) return;
    if (type === 'cv') { document.querySelector('.cv-edit-control,#cvEditorInput')?.click(); announce('CV manager opened'); return; }
    const label = LIBRARY.flatMap(group => group[1]).find(item => item[0] === type)?.[1] || 'Element';
    const record = {
      id: uid('element'), type, name: label, content: ['skill','tag'].includes(type) ? 'New ' + label.toLowerCase() : label,
      added: true, visible: true, locked: false, responsive: { desktop: true, tablet: true, mobile: true }, style: {},
      parentId: sectionInfo && sectionInfo.record.type !== 'section' ? sectionInfo.record.id : null
    };
    if (['image','gallery','certificate','certificate-card','document','evidence','resource'].includes(type)) record.media = { url: '', alt: '', caption: '', objectFit: 'cover', position: '50% 50%' };
    section.children.push(record);
    renderState(); select(record.id, true); commit('Add ' + label);
  }

  function addSection(template, relativeId, placement) {
    const name = template === 'card-grid' ? 'Classroom Projects' : 'New Portfolio Section';
    const record = {
      id: uid('section'), domId: 'custom-section-' + Date.now().toString(36), type: 'section', template: template || 'blank',
      name, navigationLabel: name, showInNavigation: true, visible: true, locked: false,
      responsive: { desktop: true, tablet: true, mobile: true }, style: {}, children: []
    };
    let index = state.page.sections.length;
    if (relativeId) {
      const relativeIndex = state.page.sections.findIndex(item => item.id === relativeId);
      if (relativeIndex >= 0) index = relativeIndex + (placement === 'before' ? 0 : 1);
    }
    state.page.sections.splice(index, 0, record);
    renderState();
    const sectionEl = elementFor(record.id);
    record.children = sectionElements(sectionEl).map(recordFromElement);
    renderState(); select(record.id, true); commit('Add section: ' + name);
    document.body.classList.remove('builder-left-open');
  }

  function duplicateSelected() {
    const found = findRecord(selectedId);
    if (!found || found.record.locked) return;
    const copy = clone(found.record);
    const remap = record => { record.id = uid(record.type === 'section' ? 'section' : 'element'); (record.children || []).forEach(remap); };
    const oldId = copy.id;
    remap(copy); copy.name = (copy.name || 'Element') + ' copy';
    if (copy.type === 'section') {
      copy.domId = 'custom-section-' + Date.now().toString(36); copy.template = copy.template === 'existing' ? 'custom' : copy.template;
      copy.children = copy.children.map(child => ({ ...child, added: true }));
    } else copy.added = true;
    const index = found.parent.findIndex(item => item.id === found.record.id);
    found.parent.splice(index + 1, 0, copy);
    if (copy.type !== 'section') {
      const descendants = found.section.children.filter(item => item.parentId === oldId);
      descendants.forEach((item, offset) => {
        const childCopy = clone(item); childCopy.id = uid('element'); childCopy.parentId = copy.id; childCopy.added = true;
        found.parent.splice(index + 2 + offset, 0, childCopy);
      });
    }
    if (copy.type !== 'section') {
      const original = elementFor(found.record.id);
      if (original) {
        const node = original.cloneNode(true); node.dataset.builderId = copy.id; node.dataset.builderAdded = 'true';
        node.querySelectorAll('[data-builder-id]').forEach(child => child.removeAttribute('data-builder-id'));
        node.querySelectorAll('.builder-resize-handle').forEach(handle => handle.remove());
        original.after(node);
      }
    }
    renderState(); select(copy.id, true); commit('Duplicate ' + found.record.name);
  }

  function requestDelete() {
    const found = findRecord(selectedId);
    if (!found || found.record.locked) return;
    if (found.record.type !== 'section') { performDelete(); return; }
    const dialog = document.getElementById('builderDeleteDialog');
    dialog.querySelector('[data-delete-name]').textContent = found.record.name;
    dialog.classList.add('open'); dialog.querySelector('.danger').focus();
  }

  function performDelete() {
    const found = findRecord(selectedId);
    if (!found || found.record.locked) return;
    const id = found.record.id; const name = found.record.name;
    collectOrphans(found.record);
    found.parent.splice(found.parent.findIndex(item => item.id === id), 1);
    elementFor(id)?.remove();
    selectedId = null;
    document.getElementById('builderDeleteDialog')?.classList.remove('open');
    renderState(); commit('Delete ' + name); announce(name + ' removed. Use Undo to restore it.');
  }

  function collectOrphans(record) {
    const urls = [];
    const scan = item => {
      if (item.media?.url) urls.push(item.media.url);
      (item.children || []).forEach(scan);
    };
    scan(record);
    Object.values(state.assets).forEach(asset => {
      if (urls.includes(asset.url) && asset.path && !state.pendingOrphans.includes(asset.path)) state.pendingOrphans.push(asset.path);
    });
  }

  function moveSelected(delta) {
    const found = findRecord(selectedId);
    if (!found || found.record.locked) return;
    const index = found.parent.findIndex(item => item.id === found.record.id);
    const next = Math.max(0, Math.min(found.parent.length - 1, index + delta));
    if (index === next) return;
    const [item] = found.parent.splice(index, 1); found.parent.splice(next, 0, item);
    renderState(); select(item.id, true); commit('Move ' + item.name);
  }

  function copySelected() {
    const found = findRecord(selectedId); if (!found) return;
    clipboard = clone(found.record); announce(found.record.name + ' copied');
  }

  function pasteSelected() {
    if (!clipboard) return;
    const found = findRecord(selectedId);
    const target = found?.record.type === 'section' ? found.record.children : found?.section?.children;
    if (!target || clipboard.type === 'section') return;
    const copy = clone(clipboard); copy.id = uid('element'); copy.added = true; copy.name = (copy.name || 'Element') + ' copy';
    target.push(copy); renderState(); select(copy.id, true); commit('Paste ' + copy.name);
  }

  function propertyInput(label, key, value, options) {
    const wrap = document.createElement('div'); wrap.className = 'builder-field' + (options?.stack ? ' stack' : '');
    const lab = document.createElement('label'); lab.textContent = label;
    let input;
    if (options?.choices) {
      input = document.createElement('select'); options.choices.forEach(choice => { const option = document.createElement('option'); option.value = choice[0]; option.textContent = choice[1]; input.appendChild(option); });
    } else if (options?.textarea) input = document.createElement('textarea');
    else { input = document.createElement('input'); input.type = options?.type || 'text'; }
    input.value = value == null ? '' : value; input.dataset.property = key; input.setAttribute('aria-label', label);
    if (options?.placeholder) input.placeholder = options.placeholder;
    wrap.append(lab, input); return wrap;
  }

  function propertyCheckbox(label, key, checked) {
    const wrap = document.createElement('div'); wrap.className = 'builder-field';
    const lab = document.createElement('label'); lab.textContent = label;
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!checked; input.dataset.property = key; input.setAttribute('aria-label', label);
    wrap.append(lab, input); return wrap;
  }

  function inspectorSection(title, fields) {
    const section = document.createElement('section'); section.className = 'builder-section';
    const heading = document.createElement('h3'); heading.textContent = title; section.appendChild(heading);
    fields.filter(Boolean).forEach(field => section.appendChild(field)); return section;
  }

  function updateInspector() {
    const panel = document.getElementById('builderInspector');
    if (!panel || !state) return;
    const found = findRecord(selectedId);
    panel.innerHTML = '';
    if (!found) {
      panel.innerHTML = '<div class="builder-inspector-empty"><strong>Nothing selected</strong>Choose any section, card, text, image, tag, or shape on the page.</div>';
      panel.appendChild(inspectorSection('Global design', tokenFields()));
      bindInspector(panel); return;
    }
    const r = found.record; const el = elementFor(r.id);
    const title = document.createElement('div'); title.className = 'builder-panel-header'; title.innerHTML = `<strong>${safeText(r.name || r.type)}</strong><p>${safeText(r.type)} · ${r.locked ? 'Locked' : 'Editable'}</p>`; panel.appendChild(title);
    const body = document.createElement('div'); body.className = 'builder-right-scroll'; panel.appendChild(body);
    const contentFields = [];
    if (r.type === 'section') {
      contentFields.push(propertyInput('Section name', 'name', r.name));
      contentFields.push(propertyInput('Navigation label', 'navigationLabel', r.navigationLabel));
      contentFields.push(propertyCheckbox('Show in navigation', 'showInNavigation', r.showInNavigation !== false));
    } else if (r.content !== undefined || el?.matches(TEXT_SELECTOR)) contentFields.push(propertyInput('Content', 'content', el?.innerHTML || r.content, { textarea: true, stack: true }));
    if (el?.matches('a') || r.href !== undefined || r.type === 'video') contentFields.push(propertyInput('Safe URL', 'href', r.href || '', { placeholder: 'https://…' }));
    if (r.media || el?.matches('img,.builder-image')) {
      contentFields.push(propertyInput('Alt text', 'media.alt', r.media?.alt || ''));
      contentFields.push(propertyInput('Caption', 'media.caption', r.media?.caption || ''));
      contentFields.push(mediaUploadControl(r));
      contentFields.push(propertyInput('Fit', 'media.objectFit', r.media?.objectFit || 'cover', { choices: [['cover','Cover'],['contain','Contain']] }));
      contentFields.push(propertyInput('Position', 'media.position', r.media?.position || '50% 50%', { placeholder: '50% 50%' }));
    }
    if (contentFields.length) body.appendChild(inspectorSection('Content', contentFields));
    if (r.type === 'section') body.appendChild(inspectorSection('Global design', tokenFields()));
    body.appendChild(inspectorSection('Layout & size', [
      propertyInput('Width', 'style.width', r.style?.width || '', { placeholder: 'auto, 420px, 80%' }),
      propertyInput('Min height', 'style.minHeight', r.style?.minHeight || '', { placeholder: 'auto or 180px' }),
      propertyInput('Height', 'style.height', r.style?.height || '', { placeholder: 'auto' }),
      propertyInput('Columns', 'style.gridTemplateColumns', r.style?.gridTemplateColumns || '', { placeholder: 'repeat(3, minmax(0,1fr))' }),
      propertyInput('Internal gap', 'style.gap', r.style?.gap || '', { placeholder: '16px' }),
      propertyInput('Alignment', 'style.textAlign', r.style?.textAlign || '', { choices: [['','Auto'],['left','Left'],['center','Centre'],['right','Right']] })
    ]));
    body.appendChild(inspectorSection('Spacing', [
      propertyInput('Padding', 'style.padding', r.style?.padding || '', { placeholder: '16px or 12px 20px' }),
      propertyInput('Margin', 'style.margin', r.style?.margin || '', { placeholder: '0 auto 16px' })
    ]));
    if (r.type === 'text' || r.content !== undefined || el?.matches(TEXT_SELECTOR)) body.appendChild(inspectorSection('Typography', [
      propertyInput('Font', 'style.fontFamily', r.style?.fontFamily || '', { choices: [['','Theme font'],['Georgia, serif','Georgia'],['Inter, sans-serif','Inter'],['Arial, sans-serif','Arial'],['Trebuchet MS, sans-serif','Trebuchet'],['Courier New, monospace','Courier']] }),
      propertyInput('Size', 'style.fontSize', r.style?.fontSize || '', { placeholder: '18px or 1.1rem' }),
      propertyInput('Weight', 'style.fontWeight', r.style?.fontWeight || '', { choices: [['','Normal'],['400','Regular'],['600','Semibold'],['700','Bold'],['800','Extra bold']] }),
      propertyInput('Style', 'style.fontStyle', r.style?.fontStyle || '', { choices: [['','Normal'],['italic','Italic']] }),
      propertyInput('Decoration', 'style.textDecoration', r.style?.textDecoration || '', { choices: [['','None'],['underline','Underline']] }),
      propertyInput('Line height', 'style.lineHeight', r.style?.lineHeight || '', { placeholder: '1.6' }),
      propertyInput('Letter spacing', 'style.letterSpacing', r.style?.letterSpacing || '', { placeholder: '.02em' }),
      propertyInput('Case', 'style.textTransform', r.style?.textTransform || '', { choices: [['','As typed'],['uppercase','Uppercase'],['lowercase','Lowercase']] }),
      propertyInput('Text colour', 'style.color', colorValue(r.style?.color), { type: 'color' })
    ]));
    body.appendChild(inspectorSection('Background & border', [
      propertyInput('Background', 'style.background', colorValue(r.style?.background), { type: 'color' }),
      propertyInput('Border style', 'style.borderStyle', r.style?.borderStyle || '', { choices: [['','Theme'],['none','None'],['solid','Solid'],['dashed','Dashed'],['dotted','Dotted']] }),
      propertyInput('Border width', 'style.borderWidth', r.style?.borderWidth || '', { placeholder: '1px' }),
      propertyInput('Border colour', 'style.borderColor', colorValue(r.style?.borderColor), { type: 'color' }),
      propertyInput('Radius', 'style.borderRadius', r.style?.borderRadius || '', { placeholder: '4px' }),
      propertyInput('Shadow', 'style.boxShadow', r.style?.boxShadow || '', { placeholder: '0 8px 24px rgba(0,0,0,.1)' }),
      propertyInput('Opacity', 'style.opacity', r.style?.opacity || '', { placeholder: '0–1' }),
      propertyInput('Rotation', 'style.transform', r.style?.transform || '', { placeholder: 'rotate(5deg)' })
    ]));
    body.appendChild(inspectorSection('Visibility & safety', [
      propertyCheckbox('Visible', 'visible', r.visible !== false), propertyCheckbox('Lock element', 'locked', !!r.locked),
      propertyCheckbox('Show on desktop', 'responsive.desktop', r.responsive?.desktop !== false),
      propertyCheckbox('Show on tablet', 'responsive.tablet', r.responsive?.tablet !== false),
      propertyCheckbox('Show on mobile', 'responsive.mobile', r.responsive?.mobile !== false)
    ]));
    const actions = document.createElement('div'); actions.className = 'builder-dialog-actions';
    actions.innerHTML = '<button type="button" data-inspector-action="duplicate">Duplicate</button><button type="button" data-inspector-action="delete" class="danger">Delete</button>';
    body.appendChild(actions);
    bindInspector(panel);
  }

  function colorValue(value) {
    const raw = String(value || '');
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
    const match = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) return '#' + [match[1],match[2],match[3]].map(n => Number(n).toString(16).padStart(2,'0')).join('');
    return '#ffffff';
  }

  function tokenFields() {
    const t = state.settings.tokens;
    return [
      propertyInput('Page background', 'tokens.pageBackground', t.pageBackground, { type: 'color' }),
      propertyInput('Primary', 'tokens.primary', t.primary, { type: 'color' }), propertyInput('Secondary', 'tokens.secondary', t.secondary, { type: 'color' }),
      propertyInput('Accent', 'tokens.accent', t.accent, { type: 'color' }), propertyInput('Text', 'tokens.text', t.text, { type: 'color' }),
      propertyInput('Muted', 'tokens.muted', t.muted, { type: 'color' }),
      propertyInput('Heading font', 'tokens.headingFont', t.headingFont, { choices: [['Georgia, serif','Georgia'],['Inter, sans-serif','Inter'],['Trebuchet MS, sans-serif','Trebuchet']] }),
      propertyInput('Body font', 'tokens.bodyFont', t.bodyFont, { choices: [['Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif','Inter'],['Arial, sans-serif','Arial'],['Georgia, serif','Georgia']] }),
      propertyInput('Standard radius', 'tokens.radius', t.radius), propertyInput('Standard spacing', 'tokens.spacing', t.spacing)
    ];
  }

  function mediaUploadControl(record) {
    const wrap = document.createElement('div'); wrap.className = 'builder-field stack';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'builder-library-item'; button.dataset.mediaUpload = record.id; button.textContent = 'Upload / replace file';
    const input = document.createElement('input'); input.type = 'file'; input.hidden = true; input.accept = record.type.includes('certificate') || record.type === 'document' ? 'image/*,application/pdf' : 'image/*'; input.dataset.mediaInput = record.id;
    wrap.append(button, input); return wrap;
  }

  function bindInspector(panel) {
    panel.querySelectorAll('[data-property]').forEach(input => {
      if (input.type === 'checkbox' || input.type === 'color' || input.tagName === 'SELECT') {
        input.addEventListener('change', onPropertyChange);
        if (input.type === 'color' || input.tagName === 'SELECT') input.addEventListener('input', onPropertyChange);
      } else {
        input.addEventListener('input', onPropertyDraft);
        input.addEventListener('blur', () => commit('Change ' + input.dataset.property));
      }
    });
    panel.querySelectorAll('[data-inspector-action]').forEach(button => button.addEventListener('click', () => button.dataset.inspectorAction === 'duplicate' ? duplicateSelected() : requestDelete()));
    panel.querySelectorAll('[data-media-upload]').forEach(button => button.addEventListener('click', () => panel.querySelector(`[data-media-input="${CSS.escape(button.dataset.mediaUpload)}"]`)?.click()));
    panel.querySelectorAll('[data-media-input]').forEach(input => input.addEventListener('change', uploadSelectedMedia));
  }

  function onPropertyDraft(event) {
    const input = event.currentTarget; const path = input.dataset.property; const value = input.value;
    if (path.startsWith('tokens.')) {
      setNested(state.settings, path, value); applyTokens();
    } else {
      const found = findRecord(selectedId); if (!found) return;
      if (path === 'content') {
        found.record.content = sanitizeHtml(value);
        const el = elementFor(found.record.id);
        if (isTextLike(found.record.type)) el.innerHTML = found.record.content;
        else {
          const heading = el?.querySelector('h1,h2,h3,h4,h5,h6'); if (heading) heading.innerHTML = found.record.content;
        }
      } else {
        setNested(found.record, path, value);
        if (path.startsWith('style.')) applyStyle(elementFor(found.record.id), found.record.style);
        if (path === 'name' && found.record.type === 'section') elementFor(found.record.id)?.querySelector('.section-title')?.replaceChildren(document.createTextNode(safeText(value)));
        if (path === 'navigationLabel' && found.record.type === 'section') elementFor(found.record.id)?.querySelector('.section-label')?.replaceChildren(document.createTextNode(safeText(value)));
      }
    }
    window.__portfolio?.markDirty?.(); setSaveState('Unsaved changes'); positionToolbar();
  }

  function setNested(target, path, value) {
    const keys = path.split('.'); let cursor = target;
    keys.slice(0, -1).forEach(key => { cursor[key] ||= {}; cursor = cursor[key]; });
    cursor[keys.at(-1)] = value;
  }

  function onPropertyChange(event) {
    const input = event.currentTarget; const path = input.dataset.property;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    if (path.startsWith('tokens.')) setNested(state.settings, path, value);
    else {
      const found = findRecord(selectedId); if (!found) return;
      if (path === 'content') found.record.content = sanitizeHtml(value);
      else setNested(found.record, path, value);
      if (path === 'name' && found.record.type === 'section') {
        const title = elementFor(found.record.id)?.querySelector('.section-title'); if (title) title.textContent = safeText(value);
      }
      if (path === 'navigationLabel' && found.record.type === 'section') {
        const label = elementFor(found.record.id)?.querySelector('.section-label'); if (label) label.textContent = safeText(value);
      }
    }
    renderState(); commit('Change ' + path);
  }

  async function uploadSelectedMedia(event) {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    const found = findRecord(event.currentTarget.dataset.mediaInput); if (!file || !found) return;
    if (!window.PortfolioCloud?.uploadFile) { announce('File storage is still loading. Try again shortly.'); return; }
    setSaveState('Uploading…');
    try {
      const uploaded = await window.PortfolioCloud.uploadFile(file, found.record.type.includes('certificate') ? 'certificates' : 'page-builder');
      const oldPath = found.record.media?.path;
      found.record.media = { ...(found.record.media || {}), ...uploaded, url: uploaded.url, path: uploaded.path, filename: uploaded.name || file.name, type: file.type, size: file.size };
      const assetId = uid('asset'); state.assets[assetId] = { id: assetId, ...found.record.media, status: 'active' };
      if (oldPath && !state.pendingOrphans.includes(oldPath)) state.pendingOrphans.push(oldPath);
      let el = elementFor(found.record.id);
      if (file.type.startsWith('image/')) {
        if (el?.matches('figure')) {
          el.querySelector('.builder-media-placeholder')?.remove();
          let img = el.querySelector('img'); if (!img) { img = document.createElement('img'); el.prepend(img); }
          img.src = uploaded.url; img.alt = found.record.media.alt || file.name;
        } else if (el?.matches('img')) el.src = uploaded.url;
      } else if (el) {
        const placeholder = el.querySelector('.builder-media-placeholder') || el;
        placeholder.innerHTML = `<a href="${safeUrl(uploaded.downloadUrl || uploaded.url)}" target="_blank" rel="noopener">${safeText(file.name)}</a>`;
      }
      commit('Upload ' + file.name); announce(file.name + ' uploaded. Save to publish it.');
    } catch (error) { announce(error.message || 'Upload failed.'); }
  }

  function renderLibrary() {
    const target = document.getElementById('builderAddLibrary'); if (!target) return;
    const query = document.getElementById('builderSearch')?.value?.toLowerCase() || '';
    target.innerHTML = '';
    LIBRARY.forEach(([groupName, items]) => {
      const filtered = items.filter(item => (item[1] + ' ' + item[2]).toLowerCase().includes(query));
      if (!filtered.length) return;
      const group = document.createElement('section'); group.className = 'builder-library-group'; group.innerHTML = `<h3>${groupName}</h3><div class="builder-library-grid"></div>`;
      const grid = group.querySelector('div');
      filtered.forEach(([type, label, hint]) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'builder-library-item'; button.dataset.addType = type; button.innerHTML = `${safeText(label)}<span>${safeText(hint)}</span>`; grid.appendChild(button);
      });
      target.appendChild(group);
    });
    target.querySelectorAll('[data-add-type]').forEach(button => button.addEventListener('click', () => addElement(button.dataset.addType)));
  }

  function renderSectionTemplates() {
    const target = document.getElementById('builderSections'); if (!target) return;
    target.innerHTML = '<div class="builder-library-group"><h3>Add section template</h3><div class="builder-library-grid"></div></div>';
    const grid = target.querySelector('.builder-library-grid');
    SECTION_TEMPLATES.forEach(([type, label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'builder-library-item'; button.dataset.sectionTemplate = type; button.innerHTML = `${label}<span>Responsive and fully editable</span>`; grid.appendChild(button);
    });
    target.querySelectorAll('[data-section-template]').forEach(button => button.addEventListener('click', () => addSection(button.dataset.sectionTemplate)));
  }

  function renderLayers() {
    const target = document.getElementById('builderLayers'); if (!target || !state) return;
    target.innerHTML = '<ul class="builder-layer-list"></ul>'; const list = target.firstElementChild;
    state.page.sections.forEach(section => {
      if (section.children.some(child => child.id === selectedId)) expandedSections.add(section.id);
      const expanded = expandedSections.has(section.id);
      const li = document.createElement('li'); li.className = 'builder-layer-item' + (section.visible === false ? ' builder-layer-hidden' : ''); li.draggable = !section.locked;
      li.innerHTML = `<div class="builder-layer-row ${section.id === selectedId ? 'selected' : ''}"><button class="builder-layer-toggle" type="button" aria-label="Expand ${safeText(section.name)}">${expanded ? '▾' : '▸'}</button><button class="builder-layer-select" type="button" data-select="${section.id}">${safeText(section.name)}</button><button class="builder-layer-grip" type="button" aria-label="Drag section">${section.locked ? '🔒' : '⋮⋮'}</button></div><ul class="builder-layer-children" ${expanded ? '' : 'hidden'}></ul>`;
      const children = li.querySelector('.builder-layer-children');
      (expanded ? section.children : []).forEach(child => {
        const item = document.createElement('li'); item.className = 'builder-layer-child ' + (child.id === selectedId ? 'selected ' : '') + (child.visible === false ? 'builder-layer-hidden' : ''); item.dataset.select = child.id; item.textContent = (child.locked ? '🔒 ' : '') + (child.name || child.type); children.appendChild(item);
      });
      li.querySelector('.builder-layer-toggle').addEventListener('click', event => { event.stopPropagation(); if (expandedSections.has(section.id)) expandedSections.delete(section.id); else expandedSections.add(section.id); renderLayers(); });
      list.appendChild(li);
    });
    target.querySelectorAll('[data-select]').forEach(item => item.addEventListener('click', event => { event.stopPropagation(); select(item.dataset.select, true); }));
  }

  function setTab(name) {
    document.querySelectorAll('.builder-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === name));
    document.querySelectorAll('[data-tab-panel]').forEach(panel => panel.hidden = panel.dataset.tabPanel !== name);
  }

  function buildUi() {
    if (document.getElementById('portfolioStudio')) return;
    const studio = document.createElement('div'); studio.id = 'portfolioStudio';
    studio.innerHTML = `
      <header class="builder-topbar">
        <div class="builder-brand"><span class="builder-brand-mark">K</span><div><strong>Portfolio Studio</strong><small>Responsive visual editor</small></div></div>
        <div class="builder-device-actions" aria-label="Preview size"><button class="builder-icon-btn active" data-device="desktop" title="Desktop">▰</button><button class="builder-icon-btn" data-device="tablet" title="Tablet">▯</button><button class="builder-icon-btn" data-device="mobile" title="Mobile">▯</button></div>
        <div class="builder-top-right"><span class="builder-save-state" id="builderSaveState" aria-live="polite">Edit mode</span><button class="builder-btn" id="builderPreview">Preview</button><button class="builder-btn primary" id="builderSave">Save</button><button class="builder-btn danger" id="builderExit">Exit</button></div>
        <div class="builder-top-actions"><button type="button" class="builder-icon-btn" id="builderPanelToggle" title="Elements and layers">☰</button><button type="button" class="builder-btn" id="builderAdd"><span class="builder-label">＋ Add</span></button><button type="button" class="builder-btn" id="builderUndo">Undo</button><button type="button" class="builder-btn" id="builderRedo">Redo</button><button type="button" class="builder-btn" id="builderRevisions">Versions</button><button type="button" class="builder-icon-btn" id="builderPropertiesToggle" title="Properties">⚙</button></div>
      </header>
      <aside class="builder-panel left" aria-label="Elements and layers"><div class="builder-panel-header"><strong>Build your page</strong><p>Add content, arrange sections, or select from Layers.</p></div><div class="builder-tabs"><button class="builder-tab active" data-tab="add">Add</button><button class="builder-tab" data-tab="sections">Sections</button><button class="builder-tab" data-tab="layers">Layers</button></div><div class="builder-panel-scroll"><div data-tab-panel="add"><input id="builderSearch" class="builder-search" type="search" placeholder="Search elements"><div id="builderAddLibrary"></div></div><div data-tab-panel="sections" id="builderSections" hidden></div><div data-tab-panel="layers" id="builderLayers" hidden></div></div></aside>
      <aside class="builder-panel right" aria-label="Properties"><div id="builderInspector"></div></aside>`;
    document.body.appendChild(studio);
    const toolbar = document.createElement('div'); toolbar.id = 'builderToolbar'; toolbar.setAttribute('role', 'toolbar'); toolbar.setAttribute('aria-label', 'Selected element controls'); toolbar.innerHTML = '<button data-tool="edit">Edit</button><button data-tool="up">Move up</button><button data-tool="down">Move down</button><button data-tool="duplicate">Duplicate</button><button data-tool="copy">Copy</button><button data-tool="lock">Lock</button><button data-tool="style">Style</button><button data-tool="delete" class="danger">Delete</button>'; document.body.appendChild(toolbar);
    const toast = document.createElement('div'); toast.id = 'builderToast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); document.body.appendChild(toast);
    const deleteDialog = document.createElement('div'); deleteDialog.id = 'builderDeleteDialog'; deleteDialog.className = 'builder-dialog-backdrop'; deleteDialog.innerHTML = '<div class="builder-dialog" role="alertdialog" aria-modal="true" aria-labelledby="builderDeleteTitle"><h2 id="builderDeleteTitle">Delete this section?</h2><p><strong data-delete-name></strong> will be removed from the portfolio. Its media files will be kept safely, and Undo can restore the section.</p><div class="builder-dialog-actions"><button type="button" data-close-dialog>Cancel</button><button type="button" class="danger" data-confirm-delete>Delete section</button></div></div>'; document.body.appendChild(deleteDialog);
    const revisionDialog = document.createElement('div'); revisionDialog.id = 'builderRevisionDialog'; revisionDialog.className = 'builder-dialog-backdrop'; revisionDialog.innerHTML = '<div class="builder-dialog" role="dialog" aria-modal="true" aria-labelledby="builderRevisionTitle"><h2 id="builderRevisionTitle">Saved versions</h2><p>Restore a recent saved builder state without deleting the current version.</p><div class="builder-revision-list"></div><div class="builder-dialog-actions"><button type="button" data-close-dialog>Close</button><button type="button" data-revert-unsaved>Revert unsaved changes</button></div></div>'; document.body.appendChild(revisionDialog);
    renderLibrary(); renderSectionTemplates(); bindUi();
  }

  function bindUi() {
    document.querySelectorAll('.builder-tab').forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.tab)));
    document.getElementById('builderSearch').addEventListener('input', renderLibrary);
    document.getElementById('builderAdd').addEventListener('click', () => { setTab('add'); document.body.classList.add('builder-left-open'); });
    document.getElementById('builderPanelToggle').addEventListener('click', () => document.body.classList.toggle('builder-left-open'));
    document.getElementById('builderPropertiesToggle').addEventListener('click', () => document.body.classList.toggle('builder-right-open'));
    document.getElementById('portfolioStudio').addEventListener('click', event => {
      if (event.target.closest('#builderUndo')) { event.preventDefault(); event.stopPropagation(); undo(); }
      if (event.target.closest('#builderRedo')) { event.preventDefault(); event.stopPropagation(); redo(); }
    }, true);
    document.getElementById('builderPreview').addEventListener('click', togglePreview);
    document.getElementById('builderSave').addEventListener('click', saveNow);
    document.getElementById('builderExit').addEventListener('click', () => document.getElementById('viewBtn')?.click());
    document.getElementById('builderRevisions').addEventListener('click', openRevisions);
    document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => setDevice(button.dataset.device)));
    document.getElementById('builderToolbar').addEventListener('click', event => {
      const tool = event.target.closest('button')?.dataset.tool; if (!tool) return;
      if (tool === 'edit') elementFor(selectedId)?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      if (tool === 'up') moveSelected(-1); if (tool === 'down') moveSelected(1); if (tool === 'duplicate') duplicateSelected();
      if (tool === 'copy') copySelected(); if (tool === 'delete') requestDelete();
      if (tool === 'style') { document.body.classList.add('builder-right-open'); document.querySelector('.builder-panel.right')?.focus?.(); }
      if (tool === 'lock') { const found = findRecord(selectedId); if (found) { found.record.locked = !found.record.locked; renderState(); commit(found.record.locked ? 'Lock element' : 'Unlock element'); } }
    });
    document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('.builder-dialog-backdrop').classList.remove('open')));
    document.querySelector('[data-confirm-delete]').addEventListener('click', performDelete);
    document.querySelector('[data-revert-unsaved]').addEventListener('click', () => { if (history.length) restoreHistory(history[0].state, 'Reverted unsaved changes'); document.getElementById('builderRevisionDialog').classList.remove('open'); });
  }

  function positionToolbar() {
    const toolbar = document.getElementById('builderToolbar'); const el = elementFor(selectedId);
    if (!toolbar || !el || !document.body.classList.contains('builder-editing') || previewing) { toolbar?.classList.remove('visible'); return; }
    const rect = el.getBoundingClientRect();
    toolbar.classList.add('visible');
    const width = toolbar.offsetWidth || 420; const height = toolbar.offsetHeight || 42;
    toolbar.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2)) + 'px';
    toolbar.style.top = Math.max(64, Math.min(window.innerHeight - height - 8, rect.top - height - 10)) + 'px';
    const found = findRecord(selectedId); const lock = toolbar.querySelector('[data-tool="lock"]'); if (lock && found) lock.textContent = found.record.locked ? 'Unlock' : 'Lock';
  }

  function setDevice(device) {
    state.settings.device = device;
    document.body.classList.remove('builder-device-desktop','builder-device-tablet','builder-device-mobile'); document.body.classList.add('builder-device-' + device);
    document.querySelectorAll('[data-device]').forEach(button => button.classList.toggle('active', button.dataset.device === device));
    applyResponsiveVisibility(); announce(device[0].toUpperCase() + device.slice(1) + ' preview');
  }

  function togglePreview() {
    previewing = !previewing; document.body.classList.toggle('builder-preview', previewing);
    document.getElementById('builderPreview').textContent = previewing ? 'Back to edit' : 'Preview';
    if (previewing) select(null); else renderState();
  }

  function revisionSnapshot() {
    const copy = stateForHistory(); copy.revisions = [];
    return { id: uid('revision'), savedAt: new Date().toISOString(), label: 'Saved online', state: { page: copy.page, settings: copy.settings, assets: copy.assets, pendingOrphans: copy.pendingOrphans, schemaVersion: SCHEMA_VERSION } };
  }

  function saveNow() {
    captureDom();
    state.revisions = [...(state.revisions || []), revisionSnapshot()].slice(-MAX_REVISIONS);
    state.lastSavedAt = new Date().toISOString();
    setSaveState('Saving…');
    const testKey = localTestKey();
    if (testKey) {
      localStorage.setItem(testKey, JSON.stringify(state));
      window.__portfolio?.markSaved?.();
      setSaveState('Saved locally ✓');
      announce('Local acceptance state saved.');
      return;
    }
    originalSave?.();
    setTimeout(() => {
      const status = document.getElementById('modeStatus')?.textContent || '';
      setSaveState(/fail/i.test(status) ? 'Save failed' : /saved online/i.test(status) ? 'Saved online ✓' : 'Saving online…');
    }, 700);
  }

  function openRevisions() {
    const dialog = document.getElementById('builderRevisionDialog'); const list = dialog.querySelector('.builder-revision-list'); list.innerHTML = '';
    const revisions = (state.revisions || []).slice().reverse();
    if (!revisions.length) list.innerHTML = '<p>No saved versions yet. Your first Save will create one.</p>';
    revisions.forEach(revision => {
      const item = document.createElement('div'); item.className = 'builder-revision'; item.innerHTML = `<div><strong>${safeText(revision.label || 'Saved version')}</strong><small>${new Date(revision.savedAt).toLocaleString()}</small></div><button type="button">Restore</button>`;
      item.querySelector('button').addEventListener('click', () => {
        const preserved = state.revisions; state = normalizeBuilder({ ...clone(revision.state), revisions: preserved }, {}); renderState(); pushHistory('Restore saved version'); window.__portfolio?.markDirty?.(); setSaveState('Unsaved changes'); dialog.classList.remove('open');
      }); list.appendChild(item);
    });
    dialog.classList.add('open');
  }

  function setSaveState(message) { const el = document.getElementById('builderSaveState'); if (el) el.textContent = message; }
  function announce(message) { const el = document.getElementById('builderToast'); if (!el) return; el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2800); }
  function updateUndoButtons() { const undoButton = document.getElementById('builderUndo'); const redoButton = document.getElementById('builderRedo'); if (undoButton) undoButton.disabled = historyIndex <= 0; if (redoButton) redoButton.disabled = historyIndex >= history.length - 1; document.body.dataset.builderHistory = `${historyIndex}:${history.length}`; }

  function keyboard(event) {
    if (!document.body.classList.contains('builder-editing')) return;
    if (previewing) {
      if (event.key === 'Escape') { event.preventDefault(); togglePreview(); }
      return;
    }
    const typing = editingText || event.target.matches('input,textarea,select,[contenteditable="true"]');
    const mod = event.ctrlKey || event.metaKey;
    if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); saveNow(); return; }
    if (typing) return;
    if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    else if (mod && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); }
    else if (mod && event.key.toLowerCase() === 'c') { event.preventDefault(); copySelected(); }
    else if (mod && event.key.toLowerCase() === 'v') { event.preventDefault(); pasteSelected(); }
    else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); requestDelete(); }
    else if (event.key === 'Escape') { event.preventDefault(); select(null); document.body.classList.remove('builder-left-open','builder-right-open'); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveSelected(-1); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); moveSelected(1); }
  }

  function enterEditor() {
    if (!ready || document.body.classList.contains('builder-editing')) return;
    document.body.classList.add('builder-editing');
    if (!state) state = normalizeBuilder(null, originalSnapshot?.() || {});
    renderState(); history = []; historyIndex = -1; pushHistory('Editor opened'); setDevice(state.settings.device || 'desktop'); setSaveState('Edit mode');
  }

  function leaveEditor() {
    if (!document.body.classList.contains('builder-editing')) return;
    document.body.classList.remove('builder-editing','builder-preview','builder-left-open','builder-right-open','builder-device-tablet','builder-device-mobile');
    previewing = false; select(null); document.querySelectorAll('[data-builder-id]').forEach(el => { el.draggable = false; });
  }

  function installCloudSafety() {
    if (!window.PortfolioCloud?.deleteFile || originalDeleteFile) return;
    originalDeleteFile = window.PortfolioCloud.deleteFile;
    window.PortfolioCloud.deleteFile = async function (path) {
      if (path && state && !state.pendingOrphans.includes(path)) state.pendingOrphans.push(path);
      announce('Media reference removed safely. The storage file is retained for Undo and later cleanup.');
      return { queued: true, path };
    };
    window.PortfolioCloud.cleanupOrphans = async function () {
      throw new Error('Orphan cleanup is intentionally manual so files still referenced elsewhere are never deleted accidentally.');
    };
  }

  function install() {
    if (ready || !window.__portfolio) return;
    originalSnapshot = window.__portfolio.snapshot.bind(window.__portfolio);
    originalRestore = window.__portfolio.restore.bind(window.__portfolio);
    originalSave = window.__portfolio.saveToStorage.bind(window.__portfolio);
    const bootLegacy = originalSnapshot();
    state = normalizeBuilder(bootLegacy[STATE_KEY], bootLegacy);
    const testKey = localTestKey();
    if (testKey) {
      try {
        const savedTestState = JSON.parse(localStorage.getItem(testKey) || 'null');
        if (savedTestState) state = normalizeBuilder(savedTestState, bootLegacy);
      } catch (_) {}
    }

    window.__portfolio.snapshot = function () {
      const legacy = originalSnapshot(); captureDom(); legacy.schemaVersion = SCHEMA_VERSION; legacy[STATE_KEY] = clone(state); return legacy;
    };
    window.__portfolio.restore = function (data) {
      restoring = true;
      originalRestore(data);
      let restoredBuilder = data?.[STATE_KEY];
      const currentTestKey = localTestKey();
      if (currentTestKey) {
        try { restoredBuilder = JSON.parse(localStorage.getItem(currentTestKey) || 'null') || restoredBuilder; } catch (_) {}
      }
      state = normalizeBuilder(restoredBuilder, data || {});
      renderState(); restoring = false;
    };
    window.__portfolio.saveToStorage = function () { captureDom(); return originalSave(); };
    const publicApi = { getState: () => clone(state), migrateLegacy, undo, redo, addElement, addSection, select, render: renderState, sanitizeHtml, acceptance: () => ({ schemaVersion: state.schemaVersion, sections: state.page.sections.length, elements: state.page.sections.reduce((n,s) => n + s.children.length,0), stableIds: new Set(state.page.sections.flatMap(s => [s.id, ...s.children.map(c => c.id)])).size, pendingOrphans: state.pendingOrphans.length }) };
    window.__portfolio.visualEditor = publicApi;
    window.PortfolioStudio = publicApi;
    buildUi(); installCloudSafety();
    ready = true;
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('editing')) enterEditor(); else leaveEditor();
      const status = document.getElementById('modeStatus')?.textContent || '';
      if (/saved online/i.test(status)) setSaveState('Saved online ✓');
      if (/cloud save failed/i.test(status)) setSaveState('Save failed');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true, subtree: false });
    const status = document.getElementById('modeStatus'); if (status) new MutationObserver(() => { const text = status.textContent || ''; if (/saved online/i.test(text)) setSaveState('Saved online ✓'); else if (/saving/i.test(text)) setSaveState('Saving…'); else if (/fail/i.test(text)) setSaveState('Save failed'); }).observe(status, { childList: true, characterData: true, subtree: true });
    document.addEventListener('keydown', keyboard);
    document.addEventListener('click', event => {
      if (!document.body.classList.contains('builder-editing')) return;
      const insideEditor = event.composedPath().some(node => node?.id === 'portfolioStudio' || node?.id === 'builderToolbar' || node?.classList?.contains?.('builder-dialog-backdrop') || node?.dataset?.builderId);
      if (!insideEditor) select(null);
    });
    window.addEventListener('scroll', positionToolbar, { passive: true }); window.addEventListener('resize', positionToolbar);
    renderState();
    if (document.body.classList.contains('editing')) enterEditor();
    // Localhost-only acceptance hook. It cannot run on GitHub Pages and never
    // changes the production owner-authentication path.
    if (localTestKey()) {
      window.__portfolio.setMode('edit');
      enterEditor();
    }
  }

  const wait = () => {
    if (window.__portfolio && window.PortfolioCloud) install();
    else setTimeout(wait, 80);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait); else wait();
})();

