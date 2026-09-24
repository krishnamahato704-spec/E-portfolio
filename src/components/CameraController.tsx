import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const IDS = ['hero', 'about', 'journey', 'teaching', 'tlm-exhibition', 'action-research', 'credentials', 'visual-gallery', 'contact'];
const PHASES = [0, .12, .24, .44, .60, .74, .86, .93, 1, 1];
// Camera targets are the original scene objects, framed in the dedicated scene column.
const POSES = [
  [.2, 2.3, 7, .4, .1, 0], [-.8, 1.3, 3.8, -.8, -.2, .9],
  [-1.8, 1.2, 4.8, -1.6, -.2, .3], [4.2, 1.8, 7.8, 4.2, .8, .2],
  [5.4, 1.7, 5.8, 5.4, .35, -1.2], [9.2, 1.8, 4.7, 9.2, 1, -2.6],
  [13.2, 1.6, 3.8, 13.2, 1.4, -2.4], [18, 1.65, 4.8, 18, 1.35, -2.1],
  [19, 1.5, 6, 18.6, 1.35, -2.1],
];

export function CameraController({ mouseRef, scrollProgress, isMobile, reducedMotion, onSection, onActiveMilestone }: {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollProgress: React.RefObject<number>;
  isMobile: boolean; reducedMotion: boolean;
  onSection: (index: number) => void; onActiveMilestone: (index: number) => void;
}) {
  const { camera, invalidate } = useThree();
  const target = useRef(new Vector3(.2, 2.3, 7));
  const look = useRef(new Vector3(.4, .1, 0));
  const currentLook = useRef(new Vector3(.4, .1, 0));
  const lastSection = useRef(-1);
  const lastMilestone = useRef(-2);

  useEffect(() => {
    const sections = IDS.map(id => document.getElementById(id)!);
    const milestones = Array.from(document.querySelectorAll<HTMLElement>('[id^="milestone-"]'));
    let starts: number[] = [];
    const measure = () => {
      const lastScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      starts = sections.map(el => Math.min(lastScroll, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 96)));
    };
    const update = () => {
      const y = window.scrollY;
      let index = 0;
      for (let i = 1; i < starts.length; i++) if (y >= starts[i]) index = i;
      const span = (starts[index + 1] ?? document.documentElement.scrollHeight) - starts[index];
      const t = MathUtils.clamp((y - starts[index]) / Math.max(span, 1), 0, 1);
      scrollProgress.current = MathUtils.lerp(PHASES[index], PHASES[index + 1], t);
      if (lastSection.current !== index) { lastSection.current = index; onSection(index); }
      let milestone = -1;
      if (index === 2) {
        let nearest = Infinity;
        milestones.forEach((el, i) => {
          const distance = Math.abs(el.getBoundingClientRect().top - window.innerHeight * .35);
          if (distance < nearest) { nearest = distance; milestone = i; }
        });
      }
      if (lastMilestone.current !== milestone) { lastMilestone.current = milestone; onActiveMilestone(milestone); }
      const pose = POSES[index];
      const previous = POSES[Math.max(0, index - 1)];
      const blend = reducedMotion ? 1 : MathUtils.smoothstep(y - starts[index], 0, Math.min(span * .15, 240));
      target.current.set(MathUtils.lerp(previous[0], pose[0], blend), MathUtils.lerp(previous[1], pose[1], blend), MathUtils.lerp(previous[2], pose[2], blend) + (isMobile ? 1 : 0));
      look.current.set(MathUtils.lerp(previous[3], pose[3], blend), MathUtils.lerp(previous[4], pose[4], blend), MathUtils.lerp(previous[5], pose[5], blend));
      if (index === 2 && !reducedMotion) { target.current.x += t * 4; look.current.x += t * 4; }
      if (reducedMotion) { camera.position.copy(target.current); currentLook.current.copy(look.current); camera.lookAt(look.current); }
      invalidate();
    };
    measure(); update();
    const trigger = ScrollTrigger.create({ trigger: '#scroll-root', start: 'top top', end: 'bottom bottom', onUpdate: update, onRefresh: () => { measure(); update(); } });
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(document.getElementById('main-content')!);
    return () => { observer.disconnect(); trigger.kill(); };
  }, [camera, invalidate, isMobile, reducedMotion, scrollProgress, onSection, onActiveMilestone]);

  useFrame((_, rawDelta) => {
    if (reducedMotion) return;
    const delta = Math.min(rawDelta, .05);
    const parallax = isMobile ? 0 : .07;
    camera.position.x = MathUtils.damp(camera.position.x, target.current.x + mouseRef.current.x * parallax, 5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, target.current.y + mouseRef.current.y * parallax, 5, delta);
    camera.position.z = MathUtils.damp(camera.position.z, target.current.z, 5, delta);
    currentLook.current.lerp(look.current, 1 - Math.exp(-5 * delta));
    camera.lookAt(currentLook.current);
  });
  return null;
}
