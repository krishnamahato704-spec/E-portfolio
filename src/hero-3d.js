// Interactive 3D Learning Ecosystem Canvas
// A lightweight, high-performance 3D projection engine built specifically for Krishna Mahato's
// educator portfolio. Projects an armillary sphere, historical inquiry rings, and knowledge nodes.

let animId = null;
let cleanupHandler = null;

export function initHero3D(canvasElement) {
  if (!canvasElement) return;

  const canvas = canvasElement;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // 3D Scene parameters
  let rotX = 0.25;
  let rotY = 0.45;
  let targetRotX = 0.25;
  let targetRotY = 0.45;
  let autoSpeed = prefersReducedMotion ? 0 : 0.003;
  let isHovered = false;
  let mouseX = 0;
  let mouseY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  resize();

  // Knowledge Nodes positioned in 3D sphere
  const nodes = [
    { label: 'HISTORY', radius: 140, theta: 0.2, phi: 0.8, color: '#c8b17d', size: 5 },
    { label: 'POLITY', radius: 135, theta: 1.8, phi: 1.2, color: '#e5decc', size: 4 },
    { label: 'PEDAGOGY', radius: 145, theta: 3.4, phi: 0.5, color: '#c8b17d', size: 4.5 },
    { label: 'SOURCES', radius: 130, theta: 4.8, phi: 2.1, color: '#918a78', size: 4 },
    { label: 'INQUIRY', radius: 150, theta: 2.3, phi: 2.7, color: '#c8b17d', size: 5.5 },
    { label: 'LITERACY', radius: 138, theta: 5.7, phi: 1.6, color: '#e5decc', size: 4 },
    { label: 'EVIDENCE', radius: 142, theta: 1.1, phi: 2.2, color: '#c8b17d', size: 4.5 },
  ];

  // Armillary sphere rings (latitude and longitude)
  const rings = [
    // Equator and latitudes
    { radius: 135, tiltX: 0, tiltY: 0, tiltZ: 0.35, segments: 48, stroke: 'rgba(200, 177, 125, 0.35)', width: 1.4 },
    { radius: 110, tiltX: 0.5, tiltY: 0.3, tiltZ: -0.2, segments: 40, stroke: 'rgba(216, 213, 201, 0.22)', width: 1 },
    { radius: 110, tiltX: -0.5, tiltY: -0.3, tiltZ: 0.2, segments: 40, stroke: 'rgba(216, 213, 201, 0.22)', width: 1 },
    // Colures / Longitudes
    { radius: 135, tiltX: Math.PI / 2, tiltY: 0, tiltZ: 0, segments: 48, stroke: 'rgba(200, 177, 125, 0.28)', width: 1.2 },
    { radius: 135, tiltX: Math.PI / 2, tiltY: Math.PI / 3, tiltZ: 0.2, segments: 48, stroke: 'rgba(145, 138, 120, 0.2)', width: 1 },
    { radius: 135, tiltX: Math.PI / 2, tiltY: -Math.PI / 3, tiltZ: -0.2, segments: 48, stroke: 'rgba(145, 138, 120, 0.2)', width: 1 },
    // Outer Horizon Ring
    { radius: 165, tiltX: 0.2, tiltY: 0.1, tiltZ: 0.8, segments: 54, stroke: 'rgba(200, 177, 125, 0.45)', width: 1.5, dashed: [4, 6] },
  ];

  // Ambient 3D floating dust/particles
  const particles = [];
  for (let i = 0; i < 36; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 360,
      z: (Math.random() - 0.5) * 360,
      size: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.2
    });
  }

  // 3D Point projection mathematics
  function project(p, cx, cy, focalLength = 340) {
    // Rotation Y
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = p.x * cosY + p.z * sinY;
    const z1 = -p.x * sinY + p.z * cosY;

    // Rotation X
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;

    const scale = focalLength / (focalLength + z2 + 200);
    return {
      x: cx + x1 * scale,
      y: cy + y2 * scale,
      z: z2,
      scale: Math.max(0.1, scale)
    };
  }

  function render() {
    if (!width || !height) {
      animId = requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Smooth inertia camera tracking
    if (!prefersReducedMotion) {
      targetRotY += autoSpeed;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;
    }

    // 1. Draw Background Particles (Z < 0)
    for (const pt of particles) {
      pt.y += pt.drift;
      if (pt.y > 180) pt.y = -180;
      if (pt.y < -180) pt.y = 180;

      const proj = project(pt, cx, cy);
      if (proj.z < 0) {
        ctx.fillStyle = `rgba(200, 177, 125, ${pt.opacity * proj.scale})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw Armillary Rings
    for (const ring of rings) {
      ctx.lineWidth = ring.width;
      ctx.strokeStyle = ring.stroke;
      if (ring.dashed) ctx.setLineDash(ring.dashed);
      else ctx.setLineDash([]);

      ctx.beginPath();
      let firstPoint = true;
      const points = [];

      for (let s = 0; s <= ring.segments; s++) {
        const angle = (s / ring.segments) * Math.PI * 2;
        // Point on flat circle
        let px = Math.cos(angle) * ring.radius;
        let py = Math.sin(angle) * ring.radius;
        let pz = 0;

        // Apply Ring Tilts
        if (ring.tiltX) {
          const cy1 = py * Math.cos(ring.tiltX) - pz * Math.sin(ring.tiltX);
          const cz1 = py * Math.sin(ring.tiltX) + pz * Math.cos(ring.tiltX);
          py = cy1; pz = cz1;
        }
        if (ring.tiltY) {
          const cx1 = px * Math.cos(ring.tiltY) + pz * Math.sin(ring.tiltY);
          const cz2 = -px * Math.sin(ring.tiltY) + pz * Math.cos(ring.tiltY);
          px = cx1; pz = cz2;
        }
        if (ring.tiltZ) {
          const cx2 = px * Math.cos(ring.tiltZ) - py * Math.sin(ring.tiltZ);
          const cy2 = px * Math.sin(ring.tiltZ) + py * Math.cos(ring.tiltZ);
          px = cx2; py = cy2;
        }

        const proj = project({ x: px, y: py, z: pz }, cx, cy);
        points.push(proj);

        if (firstPoint) {
          ctx.moveTo(proj.x, proj.y);
          firstPoint = false;
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 3. Central Axis Line
    const axisTop = project({ x: 0, y: -160, z: 0 }, cx, cy);
    const axisBottom = project({ x: 0, y: 160, z: 0 }, cx, cy);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(200, 177, 125, 0.25)';
    ctx.lineWidth = 1;
    ctx.moveTo(axisTop.x, axisTop.y);
    ctx.lineTo(axisBottom.x, axisBottom.y);
    ctx.stroke();

    // 4. Draw Interconnected Network Lines between Nodes
    const projectedNodes = nodes.map(n => {
      const px = n.radius * Math.sin(n.phi) * Math.cos(n.theta);
      const py = n.radius * Math.cos(n.phi);
      const pz = n.radius * Math.sin(n.phi) * Math.sin(n.theta);
      return {
        ...n,
        ...project({ x: px, y: py, z: pz }, cx, cy)
      };
    });

    // Connecting lines between nearby nodes
    ctx.lineWidth = 0.8;
    for (let i = 0; i < projectedNodes.length; i++) {
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const n1 = projectedNodes[i];
        const n2 = projectedNodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.3 * Math.min(n1.scale, n2.scale);
          ctx.strokeStyle = `rgba(200, 177, 125, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }
    }

    // 5. Draw 3D Knowledge Nodes (Depth Sorted)
    projectedNodes.sort((a, b) => a.z - b.z);
    for (const node of projectedNodes) {
      const r = node.size * node.scale;
      const alpha = Math.max(0.2, (node.z + 200) / 400);

      // Outer Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 177, 125, ${0.15 * alpha})`;
      ctx.fill();

      // Node Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = Math.min(1, alpha * 1.3);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Subtle Node Label
      if (node.scale > 0.85) {
        ctx.font = `500 ${Math.round(8.5 * node.scale)}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = `rgba(238, 234, 222, ${0.85 * alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - r - 4);
      }
    }

    // 6. Draw Foreground Particles (Z >= 0)
    for (const pt of particles) {
      const proj = project(pt, cx, cy);
      if (proj.z >= 0) {
        ctx.fillStyle = `rgba(200, 177, 125, ${pt.opacity * 1.4 * proj.scale})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    }
  }

  // Mouse Move Event Listener on Hero
  const heroSection = canvas.closest('.hero') || canvas.parentElement;

  function onMouseMove(e) {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    targetRotY = (x / rect.width) * 1.2 + 0.45;
    targetRotX = -(y / rect.height) * 0.8 + 0.25;
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
    }
  }

  function onTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;
      targetRotY += dx * 0.005;
      targetRotX -= dy * 0.005;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
    }
  }

  function onTouchEnd() {
    isDragging = false;
  }

  window.addEventListener('resize', resize, { passive: true });
  heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
  heroSection.addEventListener('touchstart', onTouchStart, { passive: true });
  heroSection.addEventListener('touchmove', onTouchMove, { passive: true });
  heroSection.addEventListener('touchend', onTouchEnd, { passive: true });

  render();

  cleanupHandler = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    if (heroSection) {
      heroSection.removeEventListener('mousemove', onMouseMove);
      heroSection.removeEventListener('touchstart', onTouchStart);
      heroSection.removeEventListener('touchmove', onTouchMove);
      heroSection.removeEventListener('touchend', onTouchEnd);
    }
  };

  return cleanupHandler;
}

export function cleanupHero3D() {
  if (cleanupHandler) {
    cleanupHandler();
    cleanupHandler = null;
  }
}
