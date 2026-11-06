let dispose = () => {};

export function cleanupBackgroundFilm() {
  dispose();
  dispose = () => {};
}

export function initBackgroundFilm() {
  cleanupBackgroundFilm();
  const hero = document.querySelector('.opening-hero');
  const film = hero?.querySelector('.hero-film');
  if (!film) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const events = new AbortController();
  const options = { signal: events.signal };
  const controls = hero.querySelector('[data-film-controls]');
  const pause = hero.querySelector('[data-film-pause]');
  const close = hero.querySelector('[data-film-close]');
  const status = hero.querySelector('.film-status');
  const bounds = hero.getBoundingClientRect();
  let visible = bounds.bottom > 0 && bounds.top < innerHeight;
  const target = document.querySelector(':target');
  // The browser can position a deep link after the application initializes.
  let waitingForFragment = target && !film.hasAttribute('src') && !hero.contains(target) &&
    Boolean(hero.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING);
  const reveal = (hero.getAnimations?.({ subtree: true }) ?? [])
    .filter(animation => animation.animationName === 'hero-intro-reveal');
  let revealed = reveal.length === 0;
  let playbackRequest = 0;

  const limited = () => connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType || '');
  const shouldPlay = () => !events.signal.aborted && !document.hidden && visible &&
    hero.dataset.userPaused !== 'true' && hero.dataset.filmHidden !== 'true' && hero.dataset.filmFailed !== 'true' &&
    (film.dataset.manualPlay || (revealed && !waitingForFragment && !preference.matches && !limited()));
  const sync = () => {
    if (pause) pause.textContent = film.paused ? 'Play film' : 'Pause film';
    if (close) close.hidden = hero.dataset.filmHidden === 'true' || !film.getAttribute('src');
  };
  const play = async () => {
    const request = ++playbackRequest;
    if (!film.getAttribute('src')) film.src = film.dataset.src;
    try {
      await film.play();
      if (events.signal.aborted || request !== playbackRequest) return;
      if (!shouldPlay()) film.pause();
    } catch {
      if (request !== playbackRequest || !shouldPlay()) return;
      film.pause();
      if (status) status.textContent = 'Film playback is unavailable. The portfolio remains ready to read.';
    }
    sync();
  };
  const resume = () => {
    if (film.paused && shouldPlay()) play();
  };

  pause?.addEventListener('click', () => {
    hero.dataset.userPaused = String(!film.paused);
    if (film.paused) {
      hero.dataset.filmHidden = 'false';
      hero.dataset.filmFailed = 'false';
      film.dataset.manualPlay = 'true';
      resume();
    } else {
      film.pause();
      sync();
    }
  }, options);
  close?.addEventListener('click', () => {
    delete film.dataset.manualPlay;
    hero.dataset.userPaused = 'true';
    hero.dataset.filmHidden = 'true';
    film.pause();
    sync();
    pause?.focus({ preventScroll: true });
  }, options);
  film.addEventListener('play', sync, options);
  film.addEventListener('pause', sync, options);
  film.addEventListener('playing', () => {
    if (shouldPlay()) hero.dataset.filmStarted = 'true';
  }, options);
  film.addEventListener('error', () => {
    delete hero.dataset.filmStarted;
    hero.dataset.filmFailed = 'true';
    film.pause();
    sync();
    if (status) status.textContent = 'Film unavailable. Showing the portfolio poster.';
  }, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) film.pause();
    else resume();
  }, options);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (events.signal.aborted) return;
      visible = entries[0].isIntersecting;
      if (visible) resume();
      else {
        waitingForFragment = false;
        film.pause();
      }
    });
    observer.observe(hero);
    events.signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  }
  const preferencesChanged = () => {
    delete film.dataset.manualPlay;
    if (shouldPlay()) resume();
    else film.pause();
    sync();
  };
  preference.addEventListener('change', preferencesChanged, options);
  connection?.addEventListener?.('change', preferencesChanged, options);

  if (controls) {
    controls.inert = false;
    controls.removeAttribute('aria-hidden');
  }
  sync();
  dispose = () => {
    events.abort();
    film.pause();
  };
  if (revealed) resume();
  else Promise.allSettled(reveal.map(animation => animation.finished)).then(() => {
    if (events.signal.aborted) return;
    revealed = true;
    resume();
  });
}
