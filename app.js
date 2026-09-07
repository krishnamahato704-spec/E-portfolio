(function () {
  'use strict';

  const SUPABASE_URL = 'https://oyqevsygintkjrkfbzpx.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';

  const get = (object, path) => path.split('.').reduce((value, key) => value && value[key], object);
  const text = (tag, value, className) => {
    const node = document.createElement(tag);
    node.textContent = value || '';
    if (className) node.className = className;
    return node;
  };

  function setupNavigation() {
    const header = document.querySelector('[data-header]');
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!header || !button || !nav) return;

    const closeMenu = () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    };

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 18), { passive: true });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    nodes.forEach((node) => observer.observe(node));
  }

  function updateSimpleFields(content) {
    document.querySelectorAll('[data-field]').forEach((node) => {
      const value = get(content, node.dataset.field);
      if (typeof value === 'string' && value.trim()) node.textContent = value;
    });

    const email = get(content, 'profile.email');
    if (email) {
      document.querySelectorAll('[data-email-link]').forEach((link) => link.href = `mailto:${email}`);
    }
    const portrait = get(content, 'profile.portrait');
    if (portrait) document.querySelector('[data-portrait]')?.setAttribute('src', portrait);

    const listTypes = {
      'profile.roles': ['li', ''],
      'profile.subjects': ['span', ''],
      'profile.languages': [null, ' · ']
    };
    Object.entries(listTypes).forEach(([path, settings]) => {
      const list = get(content, path);
      const container = document.querySelector(`[data-list="${path}"]`);
      if (!container || !Array.isArray(list) || !list.length) return;
      const [tag, separator] = settings;
      if (!tag) {
        container.textContent = list.join(separator);
        return;
      }
      container.replaceChildren(...list.map((item) => text(tag, item)));
    });
  }

  function renderQualifications(items) {
    const container = document.querySelector('[data-qualifications]');
    if (!container || !Array.isArray(items) || !items.length) return;
    container.replaceChildren(...items.map((item) => {
      const article = document.createElement('article');
      const details = document.createElement('div');
      details.append(text('span', item.status), text('h3', item.title), text('p', item.place));
      article.append(text('time', item.period), details);
      return article;
    }));
  }

  function renderPractice(items) {
    const container = document.querySelector('[data-practice]');
    if (!container || !Array.isArray(items) || !items.length) return;
    container.replaceChildren(...items.map((item) => {
      const article = document.createElement('article');
      article.className = 'practice-card reveal';
      article.append(text('span', item.number), text('h3', item.title), text('p', item.text));
      return article;
    }));
  }

  function renderExperiences(items) {
    const container = document.querySelector('[data-experiences]');
    if (!container || !Array.isArray(items) || !items.length) return;
    container.replaceChildren(...items.map((item) => {
      const article = document.createElement('article');
      article.className = 'experience-card reveal';
      const meta = text('div', '', 'experience-meta');
      meta.append(text('time', item.period), text('span', item.type));
      const body = text('div', '', 'experience-body');
      const list = document.createElement('ul');
      (item.points || []).forEach((point) => list.append(text('li', point)));
      body.append(text('h3', item.title), list);
      article.append(meta, body);
      return article;
    }));
  }

  function renderCompetencies(items) {
    const container = document.querySelector('[data-competencies]');
    if (!container || !Array.isArray(items) || !items.length) return;
    container.replaceChildren(...items.map((item) => text('span', item)));
  }

  function renderCertificates(items) {
    const container = document.querySelector('[data-certificates]');
    if (!container || !Array.isArray(items) || !items.length) return;
    container.replaceChildren(...items.map((item) => {
      const link = document.createElement('a');
      link.className = 'certificate-card reveal';
      link.href = item.image;
      link.target = '_blank';
      link.rel = 'noopener';
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.title;
      image.loading = 'lazy';
      link.append(image, text('span', item.title));
      return link;
    }));
  }

  async function loadPortfolio() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5500);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_public?select=content&id=eq.1`, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Portfolio request failed (${response.status})`);
      const rows = await response.json();
      const content = rows?.[0]?.content;
      if (!content) return;
      updateSimpleFields(content);
      renderQualifications(content.qualifications);
      renderPractice(content.practice);
      renderExperiences(content.experiences);
      renderCompetencies(content.competencies);
      renderCertificates(content.certificates);
    } catch (error) {
      console.info('Using the built-in portfolio content.', error.message);
    } finally {
      window.clearTimeout(timeout);
      setupReveal();
    }
  }

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  setupNavigation();
  loadPortfolio();
})();
