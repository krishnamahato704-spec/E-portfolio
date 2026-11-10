/** A small, deterministic atlas drawn around the opening page's typography. */
import {createCuriosityLens} from './curiosity-lens.js?v=editorial-20261004';
let dispose = () => {};

export function cleanupAtlasField() {
  dispose();
  dispose = () => {};
}

export function initAtlasField(root = typeof document === 'undefined' ? null : document.querySelector('#main')) {
  cleanupAtlasField();
  if (!root?.querySelector) return;
  const hero = root.matches?.('.opening-hero') ? root : root.querySelector('.opening-hero');
  const canvas = hero?.querySelector('[data-atlas-field]');
  if (!canvas?.getContext) return;
  const context = canvas.getContext('2d', { alpha: true });
  const doc = hero.ownerDocument;
  const win = doc?.defaultView;
  if (!context || !win?.Path2D) return;

  const events = new AbortController();
  const options = { signal: events.signal };
  const passive = { ...options, passive: true };
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = win.navigator.connection;
  const lens = createCuriosityLens(hero,{signal:events.signal});
  const controls = hero.querySelector('[data-atlas-controls]');
  const buttons = [...hero.querySelectorAll('button[data-atlas-mode]')];
  const status = hero.querySelector('[data-atlas-status]');
  const pauseButton = hero.querySelector('[data-atlas-pause]');
  const teacherCopy = hero.querySelector('[data-atlas-copy="teacher"]');
  const studentCopy = hero.querySelector('[data-atlas-copy="student"]');
  let width = 1, height = 1, ratio = 1, bounds, visible = false;
  let frame = 0, lastFrame = -Infinity, islands = [], stations = [];
  let mode = hero.dataset.atlasSelection === 'student' ? 'student' : 'teacher';
  let userPaused = hero.dataset.atlasPaused === 'true';
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  const limited = () => preference.matches || Boolean(connection?.saveData);
  const staticField = () => limited() || userPaused;
  const syncPause = () => {
    if (!pauseButton) return;
    pauseButton.hidden = false;
    pauseButton.disabled = limited();
    pauseButton.textContent = limited() ? 'Motion off' : userPaused ? 'Play motion' : 'Pause motion';
    pauseButton.setAttribute('aria-label', limited() ? 'Atlas motion is off for your preferences' : userPaused ? 'Play atlas motion' : 'Pause atlas motion');
    pauseButton.setAttribute('aria-pressed', String(staticField()));
  };
  const measure = () => canvas.getBoundingClientRect?.() || hero.getBoundingClientRect();
  const stop = () => { if (frame) win.cancelAnimationFrame(frame); frame = 0; };

  // Contours are cached once at the rendered size. Animation changes transforms,
  // never the hundreds of vertices that make up each island.
  const makeContours = () => {
    const student = mode === 'student';
    const shapes = student
      ? [[-.055, .43, .32, .63, 1.3], [1.055, .56, .35, .60, 4.2], [.53, 1.16, .67, .43, 2.7], [.68, -.26, .53, .39, 5.4]]
      : [[-.035, .53, .30, .67, .5], [1.035, .36, .33, .61, 3.3], [.55, 1.13, .65, .36, 1.8], [.32, -.29, .45, .40, 4.1]];
    const palette = student ? ['#8F6F56', '#C3986C', '#B35532'] : ['#E5AE8D', '#F6CEAC', '#FFB27C'];
    islands = shapes.map(([x, y, rx, ry, phase], index) => {
      const cx = width * x, cy = height * y;
      const lines = [];
      for (let level = 0; level < 43; level++) {
        const scale = .12 + level * .023;
        const path = new win.Path2D();
        const drift = (1 - scale) * Math.sin(phase) * .11;
        for (let point = 0; point <= 220; point++) {
          const angle = point / 220 * Math.PI * 2;
          const wave = 1 + .14 * Math.sin(angle * 3 + phase + scale * 1.8)
            + .065 * Math.sin(angle * 7 - phase + scale * 2.2)
            + .025 * Math.cos(angle * 13 + phase * 2);
          const px = width * rx * (Math.cos(angle) * scale * wave + drift);
          const py = height * ry * (Math.sin(angle) * scale * wave + drift * .24);
          if (point) path.lineTo(px, py); else path.moveTo(px, py);
        }
        path.closePath();
        lines.push({ path, color: palette[level % 13 === 0 ? 2 : level % 5 === 0 ? 1 : 0],
          alpha: level % 5 === 0 ? .72 : .35 + (level % 4) * .065,
          weight: level % 13 === 0 ? 1.1 : .65 });
      }
      return { x: cx, y: cy, lines, phase, depth: .55 + index * .16, opacity:index===2?.75:1 };
    });
    stations = [];
    const grid = width < 600 ? 34 : 47;
    for (let y = grid; y < height; y += grid) {
      for (let x = grid; x < width; x += grid) {
        const nx = x / width, ny = y / height;
        if (nx > .19 && nx < .81 && ny > .18 && ny < .77) continue;
        const hash = Math.sin(x * .121 + y * .317) * 43758.5453;
        const random = hash - Math.floor(hash);
        if (random > .37) continue;
        stations.push({ x, y, cross: random < .075, bright: random < .13 });
      }
    }
  };

  const draw = (time = 0) => {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const calm = staticField();
    const pulse = calm ? 0 : Math.sin(time * .00016) * 2;
    for (const island of islands) {
      context.save();
      context.translate(island.x + pointerX * island.depth, island.y + pointerY * island.depth + pulse);
      context.rotate(calm ? 0 : pointerX * .00023 * (island.phase > 3 ? -1 : 1));
      for (const line of island.lines) {
        context.strokeStyle = line.color;
        context.globalAlpha = line.alpha * island.opacity;
        context.lineWidth = line.weight;
        context.stroke(line.path);
      }
      context.restore();
    }
    context.save();
    context.translate(pointerX * .18, pointerY * .18);
    for (const station of stations) {
      context.globalAlpha = station.bright ? .8 : .32;
      context.fillStyle = station.bright ? (mode==='student'?'#9E3D2D':'#FFE7C5') : (mode==='student'?'#9C7A63':'#E4AD8A');
      const size = station.bright ? 2 : 1;
      context.fillRect(station.x, station.y, size, size);
      if (station.cross) {
        context.fillRect(station.x - 3, station.y, 7, 1);
        context.fillRect(station.x, station.y - 3, 1, 7);
      }
    }
    context.restore();
    // A soft empty center lets the oversized type read clearly at every size.
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.translate(width * .5, height * .45);
    context.scale(width * .38, height * .36);
    const quiet = context.createRadialGradient(0, 0, .4, 0, 0, 1);
    quiet.addColorStop(0, 'rgba(0,0,0,1)');
    quiet.addColorStop(.65, 'rgba(0,0,0,.94)');
    quiet.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = quiet;
    context.fillRect(-1, -1, 2, 2);
    context.restore();
    lens.render(time,{width,height,bounds,visible,reduced:preference.matches,saveData:Boolean(connection?.saveData),paused:userPaused,hidden:doc.hidden,opening:hero.dataset.openingActive==='true'});
  };

  const tick = time => {
    frame = 0;
    if (events.signal.aborted || !visible || doc.hidden || staticField()) {lens.hide();syncPause();return;}
    if (time - lastFrame >= 1000 / 24) {
      pointerX += (targetX - pointerX) * .075;
      pointerY += (targetY - pointerY) * .075;
      draw(time);
      lastFrame = time;
    }
    frame = win.requestAnimationFrame(tick);
  };
  const schedule = () => {
    stop();
    syncPause();
    if (events.signal.aborted || !visible || doc.hidden) {lens.hide();return;}
    if (staticField()) {
      pointerX = 0; pointerY = 0;
      draw();
    } else frame = win.requestAnimationFrame(tick);
  };
  const updateVisibility = () => {
    bounds = measure();
    const wasVisible = visible;
    visible = bounds.bottom > 0 && bounds.top < win.innerHeight && bounds.right > 0 && bounds.left < win.innerWidth;
    if (visible !== wasVisible) schedule();
  };
  const resize = () => {
    bounds = measure();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    ratio = Math.min(win.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    makeContours();
    visible = bounds.bottom > 0 && bounds.top < win.innerHeight && bounds.right > 0 && bounds.left < win.innerWidth;
    if (visible && !doc.hidden) draw();
    schedule();
  };
  const selectMode = (next, manual = false) => {
    mode = next;
    hero.dataset.atlasMode = mode;
    if (manual) hero.dataset.atlasSelection = mode;
    if (teacherCopy) teacherCopy.hidden = mode !== 'teacher';
    if (studentCopy) studentCopy.hidden = mode !== 'student';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.atlasMode === mode)));
    makeContours();
    if (visible && !doc.hidden) draw();
    if (manual && status) status.textContent = `${mode === 'teacher' ? 'Teacher' : 'Student'} perspective`;
    schedule();
  };
  for (const button of buttons) {
    button.addEventListener('click', () => {
      if (button.dataset.atlasMode === 'teacher' || button.dataset.atlasMode === 'student') selectMode(button.dataset.atlasMode, true);
    }, options);
  }
  pauseButton?.addEventListener('click', () => {
    if (limited()) return;
    userPaused = !userPaused;
    hero.dataset.atlasPaused = String(userPaused);
    // Refresh the lens eligibility before a new pointer event can arrive.
    if(!userPaused&&visible&&!doc.hidden)draw(win.performance?.now?.()||0);
    schedule();
  }, options);
  hero.addEventListener('pointermove', event => {
    if (staticField() || event.pointerType === 'touch' || !bounds) return;
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      targetX = 0; targetY = 0; return;
    }
    targetX = ((event.clientX - bounds.left) / width - .5) * 34;
    targetY = ((event.clientY - bounds.top) / height - .5) * 28;
  }, passive);
  hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; }, passive);
  win.addEventListener('resize', resize, passive);
  win.addEventListener('scroll', updateVisibility, passive);
  doc.addEventListener('visibilitychange', schedule, options);
  preference.addEventListener('change', schedule, options);
  connection?.addEventListener?.('change', schedule, options);
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.inert = true;
  if (controls) { controls.hidden = false; controls.inert = false; controls.removeAttribute('aria-hidden'); }
  selectMode(mode);
  resize();
  dispose = () => {
    stop();
    lens.dispose();
    events.abort();
    delete hero.dataset.atlasMode;
    if (controls) { controls.hidden = true; controls.inert = true; }
    if (pauseButton) pauseButton.hidden = true;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    islands = []; stations = [];
  };
}
