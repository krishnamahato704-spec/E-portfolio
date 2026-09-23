// 3D Perspective Card Tilt Interaction
// Adds subtle tactile physical depth to portfolio cards and evidence frames

export function init3DTilt(root = document) {
  if (typeof window === 'undefined') return;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || prefersReduced) return;

  const cards = root.querySelectorAll('.interactive-3d-card, .milestone-card, .curated-cred-card, .archive-record, .resource-row, .portrait-frame');

  cards.forEach(card => {
    let bounds = null;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.2s ease';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = mouseX / bounds.width - 0.5;
      const yPct = mouseY / bounds.height - 0.5;

      const tiltX = -yPct * 8; // max 8 deg tilt
      const tiltY = xPct * 8;

      card.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(6px)`;
    };

    const onMouseLeave = () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease';
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      bounds = null;
    };

    card.addEventListener('mouseenter', onMouseEnter, { passive: true });
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });
}
