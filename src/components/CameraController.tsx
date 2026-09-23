import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CategoryFilter } from '../data/teachingData';
import { TlmCategory } from '../data/tlmData';
import { GALLERY_ITEMS } from '../data/galleryData';

gsap.registerPlugin(ScrollTrigger);

interface CameraControllerProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  isMobile: boolean;
  activeCategory?: CategoryFilter;
  hoveredTeachingItemId?: string | null;
  activeTlmCategory?: TlmCategory;
  hoveredTlmProjectId?: string | null;
  activeStageId?: string | null;
  hoveredEvidenceId?: string | null;
  hoveredGalleryItemId?: string | null;
  onCameraUpdate?: (stats: { x: number; y: number; z: number; progress: number }) => void;
  onScrollProgress?: (progress: number) => void;
  onActiveMilestone?: (index: number) => void;
}

export function CameraController({
  mouseRef,
  isMobile,
  activeCategory = 'All',
  hoveredTeachingItemId = null,
  activeTlmCategory = 'All',
  hoveredTlmProjectId = null,
  activeStageId = null,
  hoveredEvidenceId = null,
  hoveredGalleryItemId = null,
  onCameraUpdate,
  onScrollProgress,
  onActiveMilestone,
}: CameraControllerProps) {
  const { camera } = useThree();

  const progressRef = useRef(0);
  const targetCamPos = useRef(new THREE.Vector3(0.2, 1.4, 4.4));
  const targetLookAt = useRef(new THREE.Vector3(0.4, 0.1, 0.0));
  const currentLookAt = useRef(new THREE.Vector3(0.4, 0.1, 0.0));

  useEffect(() => {
    // Initial camera position for Hero
    const initZ = isMobile ? 5.4 : 4.4;
    const initY = isMobile ? 1.6 : 1.4;
    camera.position.set(0.2, initY, initZ);
    targetCamPos.current.set(0.2, initY, initZ);
    camera.lookAt(0.4, 0.1, 0);

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-root',
      end: 'bottom bottom',
      start: 'top top',
      scrub: 1.0,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        onScrollProgress?.(p);

        // Milestone progression calculation across the Journey corridor (p: 0.24 -> 0.44)
        if (p >= 0.24 && p < 0.44) {
          const journeyT = (p - 0.24) / 0.20;
          const milestoneIdx = Math.min(6, Math.floor(journeyT * 7));
          onActiveMilestone?.(milestoneIdx);
        } else {
          onActiveMilestone?.(-1);
        }

        const pos = new THREE.Vector3();
        const look = new THREE.Vector3();

        if (p < 0.12) {
          // 1. HERO: Full study desk overview
          const t = p / 0.12;
          const easeT = gsap.parseEase('power2.out')(t);

          const startX = isMobile ? 0.0 : 0.2;
          const startY = isMobile ? 1.6 : 1.4;
          const startZ = isMobile ? 5.4 : 4.4;

          const endX = isMobile ? -0.45 : -0.75;
          const endY = isMobile ? 0.8 : 0.55;
          const endZ = isMobile ? 3.2 : 2.3;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(0.4, -0.82, easeT);
          look.y = THREE.MathUtils.lerp(0.1, -0.32, easeT);
          look.z = THREE.MathUtils.lerp(0.0, 0.9, easeT);
        } else if (p < 0.24) {
          // 2. ABOUT: Focused on the open journal and personal reflections
          const t = (p - 0.12) / 0.12;
          const easeT = gsap.parseEase('power1.inOut')(t);

          const startX = isMobile ? -0.45 : -0.75;
          const startY = isMobile ? 0.8 : 0.55;
          const startZ = isMobile ? 3.2 : 2.3;

          const endX = isMobile ? -0.8 : -1.6;
          const endY = isMobile ? 0.85 : 0.65;
          const endZ = isMobile ? 3.0 : 2.1;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(-0.82, -2.0, easeT);
          look.y = THREE.MathUtils.lerp(-0.32, -0.3, easeT);
          look.z = THREE.MathUtils.lerp(0.9, 0.3, easeT);
        } else if (p < 0.44) {
          // 3. JOURNEY: Camera glides along the archival plinth across milestones
          const t = (p - 0.24) / 0.20;
          const easeT = gsap.parseEase('power2.inOut')(t);

          const startX = isMobile ? -0.8 : -1.6;
          const startY = isMobile ? 0.85 : 0.65;
          const startZ = isMobile ? 3.0 : 2.1;

          const endX = isMobile ? 1.6 : 2.8;
          const endY = isMobile ? 0.95 : 0.82;
          const endZ = isMobile ? 4.0 : 3.2;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(-2.0, 3.2, easeT);
          look.y = THREE.MathUtils.lerp(-0.3, -0.15, easeT);
          look.z = THREE.MathUtils.lerp(0.3, 1.8, easeT);
        } else if (p < 0.60) {
          // 4. TEACHING PORTFOLIO: Teaching Studio & Master Lesson Plan Easel
          const t = (p - 0.44) / 0.16;
          const easeT = gsap.parseEase('power2.inOut')(t);

          const startX = isMobile ? 1.6 : 2.8;
          const startY = isMobile ? 0.95 : 0.82;
          const startZ = isMobile ? 4.0 : 3.2;

          const endX = isMobile ? 2.4 : 3.4;
          const endY = isMobile ? 1.3 : 1.25;
          const endZ = isMobile ? 4.5 : 3.6;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(3.2, 3.35, easeT);
          look.y = THREE.MathUtils.lerp(-0.15, 0.65, easeT);
          look.z = THREE.MathUtils.lerp(1.8, 0.6, easeT);

          if (activeCategory === 'Lesson Plans' || hoveredTeachingItemId === 'democracy-lesson-plan') {
            look.x += 0.2;
            look.y += 0.15;
          } else if (activeCategory === 'Teaching Practice') {
            look.x -= 0.6;
            look.y -= 0.1;
          } else if (activeCategory === 'TLM & Resources') {
            look.x += 0.8;
            look.y -= 0.05;
          } else if (activeCategory === 'Assessments') {
            look.x += 0.4;
            look.y -= 0.3;
          }
        } else if (p < 0.74) {
          // 5. LEARNING LAB & TLM EXHIBITION: Front view of hands-on workshop table
          const t = (p - 0.60) / 0.14;
          const easeT = gsap.parseEase('power2.inOut')(t);

          const startX = isMobile ? 2.4 : 3.4;
          const startY = isMobile ? 1.3 : 1.25;
          const startZ = isMobile ? 4.5 : 3.6;

          const endX = isMobile ? 4.4 : 5.4;
          const endY = isMobile ? 1.2 : 1.1;
          const endZ = isMobile ? 3.8 : 2.8;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(3.35, 5.2, easeT);
          look.y = THREE.MathUtils.lerp(0.65, 0.3, easeT);
          look.z = THREE.MathUtils.lerp(0.6, -1.2, easeT);

          if (hoveredTlmProjectId === 'tlm-phonics-word-builder' || activeTlmCategory === 'Working Models / Tactile') {
            look.x += 0.4;
            look.y -= 0.15;
          } else if (hoveredTlmProjectId === 'tlm-photo-evidence-cards') {
            look.x -= 0.35;
            look.y += 0.2;
          } else if (hoveredTlmProjectId === 'tlm-formative-response-sheets') {
            look.x += 0.55;
            look.y -= 0.1;
          }
        } else if (p < 0.86) {
          // 6. ACTION RESEARCH & CLASSROOM INQUIRY WORKSPACE
          const t = (p - 0.74) / 0.12;
          const easeT = gsap.parseEase('power2.inOut')(t);

          const startX = isMobile ? 4.4 : 5.4;
          const startY = isMobile ? 1.2 : 1.1;
          const startZ = isMobile ? 3.8 : 2.8;

          const endX = isMobile ? 7.6 : 9.2;
          const endY = isMobile ? 1.35 : 1.2;
          const endZ = isMobile ? 2.8 : 1.85;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(5.2, 9.2, easeT);
          look.y = THREE.MathUtils.lerp(0.3, 0.95, easeT);
          look.z = THREE.MathUtils.lerp(-1.2, -2.6, easeT);

          if (activeStageId === 'stage-problem' || hoveredEvidenceId === 'stage-problem') {
            look.x -= 0.45;
            look.y -= 0.2;
          } else if (activeStageId === 'stage-observation' || hoveredEvidenceId === 'stage-observation') {
            look.x -= 0.25;
            look.y += 0.15;
          } else if (activeStageId === 'stage-intervention' || hoveredEvidenceId === 'stage-intervention') {
            look.x += 0.1;
            look.y -= 0.1;
          }
        } else if (p < 0.93) {
          // 7. FORMAL CERTIFICATES & CREDENTIALS WALL (Formal Evidence Base)
          const t = (p - 0.86) / 0.07;
          const easeT = gsap.parseEase('power2.inOut')(t);

          const startX = isMobile ? 7.6 : 9.2;
          const startY = isMobile ? 1.35 : 1.2;
          const startZ = isMobile ? 2.8 : 1.85;

          // Camera frames the formal certificate wall at x: 13.2
          const endX = isMobile ? 11.2 : 13.2;
          const endY = isMobile ? 1.45 : 1.38;
          const endZ = isMobile ? 2.6 : 1.95;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(9.2, 13.2, easeT);
          look.y = THREE.MathUtils.lerp(0.95, 1.4, easeT);
          look.z = THREE.MathUtils.lerp(-2.6, -2.4, easeT);
        } else {
          // 8. VISUAL GALLERY: "MOMENTS FROM THE JOURNEY" (Lived Experience)
          const t = (p - 0.93) / 0.07;
          const easeT = gsap.parseEase('power1.inOut')(t);

          const startX = isMobile ? 11.2 : 13.2;
          const startY = isMobile ? 1.45 : 1.38;
          const startZ = isMobile ? 2.6 : 1.95;

          // Camera smoothly glides down the open visual memory corridor (x: 15.0 to 19.8)
          const endX = isMobile ? 16.5 : 18.8;
          const endY = isMobile ? 1.45 : 1.35;
          const endZ = isMobile ? 2.8 : 2.05;

          pos.x = THREE.MathUtils.lerp(startX, endX, easeT);
          pos.y = THREE.MathUtils.lerp(startY, endY, easeT);
          pos.z = THREE.MathUtils.lerp(startZ, endZ, easeT);

          look.x = THREE.MathUtils.lerp(13.2, 18.6, easeT);
          look.y = THREE.MathUtils.lerp(1.4, 1.35, easeT);
          look.z = THREE.MathUtils.lerp(-2.4, -2.1, easeT);

          // Interactive focus adjustment if an image is hovered
          if (hoveredGalleryItemId) {
            const activeItem = GALLERY_ITEMS.find((i) => i.id === hoveredGalleryItemId);
            if (activeItem) {
              look.x = THREE.MathUtils.lerp(look.x, activeItem.position3D[0], 0.3);
              look.y = THREE.MathUtils.lerp(look.y, activeItem.position3D[1], 0.3);
            }
          }
        }

        targetCamPos.current.copy(pos);
        targetLookAt.current.copy(look);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [
    camera,
    isMobile,
    activeCategory,
    hoveredTeachingItemId,
    activeTlmCategory,
    hoveredTlmProjectId,
    activeStageId,
    hoveredEvidenceId,
    hoveredGalleryItemId,
    onScrollProgress,
    onActiveMilestone,
  ]);

  useFrame((_, delta) => {
    const mx = mouseRef.current?.x || 0;
    const my = mouseRef.current?.y || 0;

    // Subtle restrained mouse parallax
    const parallaxX = isMobile ? 0 : mx * 0.12;
    const parallaxY = isMobile ? 0 : my * 0.08;

    const desiredX = targetCamPos.current.x + parallaxX;
    const desiredY = targetCamPos.current.y + parallaxY;
    const desiredZ = targetCamPos.current.z;

    // Smooth lerp for camera translation
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredX, 3.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredY, 3.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredZ, 3.8, delta);

    // Smooth lerp for lookAt target
    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      targetLookAt.current.x,
      4.2,
      delta
    );
    currentLookAt.current.y = THREE.MathUtils.damp(
      currentLookAt.current.y,
      targetLookAt.current.y,
      4.2,
      delta
    );
    currentLookAt.current.z = THREE.MathUtils.damp(
      currentLookAt.current.z,
      targetLookAt.current.z,
      4.2,
      delta
    );

    camera.lookAt(currentLookAt.current);

    onCameraUpdate?.({
      progress: Math.round(progressRef.current * 100),
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    });
  });

  return null;
}
