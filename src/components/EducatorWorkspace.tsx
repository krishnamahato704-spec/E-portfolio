import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TeachingStudio3D } from './TeachingStudio3D';
import { TlmExhibition3D } from './TlmExhibition3D';
import { ActionResearch3D } from './ActionResearch3D';
import { VisualGallery3D } from './VisualGallery3D';
import { CategoryFilter } from '../data/teachingData';
import { TlmCategory } from '../data/tlmData';
import { GalleryItem, CertificateItem } from '../data/galleryData';

interface WorkspaceProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollProgress: number;
  activeMilestoneIndex: number;
  isMobile: boolean;
  activeCategory?: CategoryFilter;
  hoveredTeachingItemId?: string | null;
  activeTlmCategory?: TlmCategory;
  hoveredTlmProjectId?: string | null;
  activeStageId?: string | null;
  hoveredEvidenceId?: string | null;
  activeGalleryItemId?: string | null;
  hoveredGalleryItemId?: string | null;
  onHoverGalleryItem?: (id: string | null) => void;
  onSelectGalleryItem?: (item: GalleryItem | CertificateItem) => void;
}

export function EducatorWorkspace({
  mouseRef,
  scrollProgress,
  activeMilestoneIndex,
  isMobile,
  activeCategory = 'All',
  hoveredTeachingItemId = null,
  activeTlmCategory = 'All',
  hoveredTlmProjectId = null,
  activeStageId = null,
  hoveredEvidenceId = null,
  activeGalleryItemId = null,
  hoveredGalleryItemId = null,
  onHoverGalleryItem,
  onSelectGalleryItem,
}: WorkspaceProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const globeSphereRef = useRef<THREE.Mesh>(null);
  const penRef = useRef<THREE.Group>(null);
  const journalRef = useRef<THREE.Group>(null);

  // Timeline artifact refs
  const diplomaRef = useRef<THREE.Group>(null);
  const constitutionRef = useRef<THREE.Group>(null);
  const clipboardRef = useRef<THREE.Group>(null);
  const researchScrollRef = useRef<THREE.Group>(null);
  const slateRef = useRef<THREE.Group>(null);
  const internshipRegisterRef = useRef<THREE.Group>(null);

  // Subtle restrained mouse interaction + milestone responsive highlights
  useFrame((_, delta) => {
    const mx = mouseRef.current?.x || 0;
    const my = mouseRef.current?.y || 0;

    // Globe gently reacts to mouse, restrained axial drift
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.y,
        mx * 0.3 + 0.3,
        delta * 3
      );
    }
    if (globeSphereRef.current) {
      globeSphereRef.current.rotation.y += delta * 0.035;
    }

    // Journal micro-tilt
    if (journalRef.current) {
      const targetRotZ = mx * 0.02;
      journalRef.current.rotation.z = THREE.MathUtils.lerp(
        journalRef.current.rotation.z,
        targetRotZ,
        delta * 3
      );
    }

    // Pen parallax
    if (penRef.current) {
      penRef.current.position.y = THREE.MathUtils.lerp(
        penRef.current.position.y,
        -0.37 + my * 0.012,
        delta * 3
      );
    }

    // Dynamic reaction for active timeline milestone artifact
    // Each artifact subtly lifts 0.05 units when active
    const lerpSpeed = delta * 4;

    if (diplomaRef.current) {
      const active = activeMilestoneIndex === 0;
      diplomaRef.current.position.y = THREE.MathUtils.lerp(
        diplomaRef.current.position.y,
        active ? -0.32 : -0.38,
        lerpSpeed
      );
    }
    if (constitutionRef.current) {
      const active = activeMilestoneIndex === 1;
      constitutionRef.current.position.y = THREE.MathUtils.lerp(
        constitutionRef.current.position.y,
        active ? -0.32 : -0.38,
        lerpSpeed
      );
    }
    if (clipboardRef.current) {
      const active = activeMilestoneIndex === 3;
      clipboardRef.current.position.y = THREE.MathUtils.lerp(
        clipboardRef.current.position.y,
        active ? -0.31 : -0.37,
        lerpSpeed
      );
    }
    if (researchScrollRef.current) {
      const active = activeMilestoneIndex === 4;
      researchScrollRef.current.position.y = THREE.MathUtils.lerp(
        researchScrollRef.current.position.y,
        active ? -0.29 : -0.35,
        lerpSpeed
      );
    }
    if (slateRef.current) {
      const active = activeMilestoneIndex === 5;
      slateRef.current.position.y = THREE.MathUtils.lerp(
        slateRef.current.position.y,
        active ? -0.30 : -0.36,
        lerpSpeed
      );
    }
    if (internshipRegisterRef.current) {
      const active = activeMilestoneIndex === 6;
      internshipRegisterRef.current.position.y = THREE.MathUtils.lerp(
        internshipRegisterRef.current.position.y,
        active ? -0.28 : -0.35,
        lerpSpeed
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. EXPANDED STUDY DESK SURFACE & EXTENDED ARCHIVAL PLINTH           */}
      {/* ------------------------------------------------------------------ */}
      {/* Main Wood Desk Surface (Extended to accommodate the journey path) */}
      <mesh position={[0.5, -0.6, 0.4]} receiveShadow>
        <boxGeometry args={[16, 0.35, 9]} />
        <meshStandardMaterial
          color="#291c14"
          roughness={0.42}
          metalness={0.12}
        />
      </mesh>

      {/* Desk Front Brass Inlay Trim */}
      <mesh position={[0.5, -0.44, 4.88]}>
        <boxGeometry args={[15.8, 0.025, 0.03]} />
        <meshStandardMaterial color="#c8b17d" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Archival Desk Blotter Pad */}
      <mesh position={[0.2, -0.42, 0.5]} receiveShadow>
        <boxGeometry args={[7.2, 0.015, 3.8]} />
        <meshStandardMaterial color="#1c2529" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 2. UNFOLDED HISTORICAL MAP / ARCHIVAL PARCHMENT                    */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0.2, -0.41, 0.3]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <mesh receiveShadow>
          <planeGeometry args={[3.2, 2.2]} />
          <meshStandardMaterial
            color="#ede3cc"
            roughness={0.88}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[3.0, 2.0]} />
          <meshBasicMaterial color="#d4c7a9" wireframe={true} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 3. OPEN STUDY JOURNAL / NOTEBOOK (ABOUT SECTION FOCAL OBJECT)      */}
      {/* ------------------------------------------------------------------ */}
      <group ref={journalRef} position={[-0.85, -0.38, 0.9]} rotation={[0, 0.22, 0]}>
        {/* Dark Leather Journal Cover Backing */}
        <mesh position={[0, -0.018, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.56, 0.022, 1.08]} />
          <meshStandardMaterial color="#1f1612" roughness={0.65} metalness={0.15} />
        </mesh>

        {/* Left Open Page */}
        <group position={[-0.37, 0, 0]} rotation={[0, 0, 0.035]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[0.72, 0.02, 1.02]} />
            <meshStandardMaterial color="#faf6eb" roughness={0.92} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0.011, 0]}>
            <planeGeometry args={[0.58, 0.84]} />
            <meshStandardMaterial color="#ede7d4" roughness={0.95} />
          </mesh>
        </group>

        {/* Right Open Page */}
        <group position={[0.37, 0, 0]} rotation={[0, 0, -0.035]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[0.72, 0.02, 1.02]} />
            <meshStandardMaterial color="#faf6eb" roughness={0.92} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0.011, 0]}>
            <planeGeometry args={[0.58, 0.84]} />
            <meshStandardMaterial color="#ede7d4" roughness={0.95} />
          </mesh>
        </group>

        {/* Journal Spine Crease */}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.04, 0.028, 1.04]} />
          <meshStandardMaterial color="#4a3b30" roughness={0.7} />
        </mesh>

        {/* Bookmark Silk Ribbon (Crimson Red) */}
        <mesh position={[0.08, 0.015, 0.2]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.035, 0.005, 0.9]} />
          <meshStandardMaterial color="#882a24" roughness={0.4} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 4. VINTAGE BRASS FOUNTAIN PEN & REST TRAY                          */}
      {/* ------------------------------------------------------------------ */}
      <group ref={penRef} position={[-0.85, -0.37, 1.6]} rotation={[0, -0.15, 0]}>
        <mesh position={[0, -0.01, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.015, 0.9]} />
          <meshStandardMaterial color="#241913" roughness={0.5} />
        </mesh>

        <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.72, 16]} />
          <meshStandardMaterial color="#1a2226" roughness={0.3} metalness={0.6} />
        </mesh>

        <mesh position={[0, 0.01, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.2} metalness={0.88} />
        </mesh>

        <mesh position={[0, 0.01, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.016, 0.08, 16]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 5. CLASSROOM GEOGRAPHIC GLOBE                                      */}
      {/* ------------------------------------------------------------------ */}
      <group ref={globeGroupRef} position={isMobile ? [1.4, 0.3, -0.4] : [1.75, 0.35, -0.3]}>
        <mesh position={[0, -0.74, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.46, 0.07, 32]} />
          <meshStandardMaterial color="#35241b" roughness={0.4} metalness={0.2} />
        </mesh>

        <mesh position={[0, -0.48, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.46, 16]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.25} metalness={0.85} />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.38]} castShadow>
          <torusGeometry args={[0.82, 0.032, 16, 64, Math.PI * 1.15]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.22} metalness={0.88} />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.41]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.76, 16]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.2} metalness={0.9} />
        </mesh>

        <group rotation={[0, 0, 0.41]}>
          <mesh ref={globeSphereRef} castShadow receiveShadow>
            <sphereGeometry args={[0.68, 36, 36]} />
            <meshStandardMaterial color="#2a3d46" roughness={0.35} metalness={0.15} />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.685, 20, 16]} />
            <meshBasicMaterial color="#c8b17d" wireframe={true} transparent opacity={0.35} />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.688, 0.008, 8, 48]} />
            <meshStandardMaterial color="#e5c88b" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 6. CURATED HISTORICAL BOOKS & ACADEMIC VOLUMES                     */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0.7, -0.4, -0.2]}>
        {/* Book 1 (Bottom): Indian & World History */}
        <group position={[0, 0.08, 0]} rotation={[0, 0.12, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.18, 1.85]} />
            <meshStandardMaterial color="#f4efe0" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.44, 0.22, 1.9]} />
            <meshStandardMaterial color="#1b262c" roughness={0.45} metalness={0.15} />
          </mesh>
          <mesh position={[-0.725, 0, 0]}>
            <boxGeometry args={[0.01, 0.14, 1.5]} />
            <meshStandardMaterial color="#c8b17d" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>

        {/* Book 2 (Middle): Social Sciences & Constitutional Governance */}
        <group position={[0.04, 0.28, 0.03]} rotation={[0, -0.08, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.16, 1.7]} />
            <meshStandardMaterial color="#f4efe0" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.34, 0.19, 1.75]} />
            <meshStandardMaterial color="#58241f" roughness={0.48} metalness={0.12} />
          </mesh>
          <mesh position={[-0.675, 0, 0]}>
            <boxGeometry args={[0.01, 0.12, 1.3]} />
            <meshStandardMaterial color="#c8b17d" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>

        {/* Book 3 (Top): Pedagogical Theory & Classroom Inquiry */}
        <group position={[-0.02, 0.44, -0.02]} rotation={[0, 0.2, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.14, 1.55]} />
            <meshStandardMaterial color="#f4efe0" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.24, 0.16, 1.6]} />
            <meshStandardMaterial color="#2d3d34" roughness={0.42} metalness={0.18} />
          </mesh>
        </group>

        {/* Book 4 (Leaning Book resting against the stack) */}
        {!isMobile && (
          <group position={[-0.95, 0.22, 0.1]} rotation={[0, 0.1, -0.42]}>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.16, 1.35, 1.5]} />
              <meshStandardMaterial color="#734e32" roughness={0.5} metalness={0.15} />
            </mesh>
            <mesh position={[-0.082, 0, 0]}>
              <boxGeometry args={[0.006, 1.25, 0.25]} />
              <meshStandardMaterial color="#c8b17d" metalness={0.8} />
            </mesh>
          </group>
        )}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 7. JOURNEY TIMELINE 3D ARTIFACTS (SPATIALLY ARRANGED ON DESK)      */}
      {/* ------------------------------------------------------------------ */}

      {/* Milestone 1: Academic Foundation (2018–2021 Gurukul Kangri Folio) */}
      <group ref={diplomaRef} position={[-2.4, -0.38, 0.2]} rotation={[0, 0.35, 0]}>
        {/* Leather Folio */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.05, 1.6]} />
          <meshStandardMaterial color="#1a252c" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Gold Seal Medallion */}
        <mesh position={[0.4, 0.03, 0.5]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Parchment Edge */}
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[1.2, 0.01, 1.5]} />
          <meshStandardMaterial color="#f7f2e4" roughness={0.9} />
        </mesh>
      </group>

      {/* Milestone 2: Indian Polity & Governance (UPSC Volumes) */}
      <group ref={constitutionRef} position={[-2.2, -0.38, -1.3]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.22, 1.7]} />
          <meshStandardMaterial color="#4a1e1b" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0.05, 0.24, 0]} rotation={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.18, 1.6]} />
          <meshStandardMaterial color="#283339" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Brass Paperweight */}
        <mesh position={[0.3, 0.38, 0.3]} castShadow>
          <cylinderGeometry args={[0.09, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Milestone 4: School Classroom Observation (Clipboard & Field Notes) */}
      <group ref={clipboardRef} position={[2.6, -0.37, 0.8]} rotation={[0, -0.35, 0]}>
        {/* Wooden Clipboard */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.03, 1.5]} />
          <meshStandardMaterial color="#6e4f35" roughness={0.6} />
        </mesh>
        {/* Observation Papers */}
        <mesh position={[0, 0.02, 0.05]} receiveShadow>
          <boxGeometry args={[0.95, 0.015, 1.3]} />
          <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
        </mesh>
        {/* Brass Clip */}
        <mesh position={[0, 0.035, -0.62]} castShadow>
          <boxGeometry args={[0.38, 0.03, 0.15]} />
          <meshStandardMaterial color="#c8b17d" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      {/* Milestone 5: NEP 2020 Seminar Presentation (Rolled Academic Scroll) */}
      {!isMobile && (
        <group ref={researchScrollRef} position={[3.2, -0.35, -0.4]} rotation={[0, 0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.4, 24]} />
            <meshStandardMaterial color="#ede4ce" roughness={0.8} />
          </mesh>
          {/* Crimson Ribbon around scroll */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.085, 0.085, 0.1, 24]} />
            <meshStandardMaterial color="#882a24" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Milestone 6: Pehchaan Street School (Foundational Slate Chalkboard) */}
      <group ref={slateRef} position={[3.5, -0.36, 1.6]} rotation={[0, -0.22, 0]}>
        {/* Wood frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.035, 1.05]} />
          <meshStandardMaterial color="#4a3424" roughness={0.7} />
        </mesh>
        {/* Slate blackboard interior */}
        <mesh position={[0, 0.019, 0]} receiveShadow>
          <boxGeometry args={[1.15, 0.01, 0.85]} />
          <meshStandardMaterial color="#1a2224" roughness={0.95} />
        </mesh>
        {/* White chalk piece */}
        <mesh position={[0.3, 0.03, 0.32]} rotation={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      </group>

      {/* Milestone 7: Panchsheel 16-Week Internship (Practicum Register & Red Pen) */}
      <group ref={internshipRegisterRef} position={[3.6, -0.35, 2.8]} rotation={[0, -0.15, 0]}>
        {/* Large Cloth-Bound School Attendance & Lesson Register */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.07, 1.25]} />
          <meshStandardMaterial color="#2d4239" roughness={0.55} metalness={0.15} />
        </mesh>
        {/* Gold lettering strip */}
        <mesh position={[0, 0.038, 0]}>
          <boxGeometry args={[1.3, 0.005, 0.25]} />
          <meshStandardMaterial color="#c8b17d" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Teacher's Red Correction Pen */}
        <mesh position={[0.4, 0.05, 0.35]} rotation={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.65, 16]} />
          <meshStandardMaterial color="#9e2a2b" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 8. DESK STUDY LAMP & ATMOSPHERE LIGHTING                          */}
      {/* ------------------------------------------------------------------ */}
      <ambientLight intensity={0.7} color="#faf6eb" />

      {/* Key Sunlight / Window Beam */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.9}
        color="#fffcf0"
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.00015}
      />

      {/* Dynamic Desk Lamp that pans with the active study section */}
      <pointLight
        position={[
          scrollProgress < 0.35
            ? -0.7
            : THREE.MathUtils.lerp(-0.7, 2.4, (scrollProgress - 0.35) / 0.65),
          1.5,
          scrollProgress < 0.35 ? 0.9 : 1.6,
        ]}
        intensity={1.3 + scrollProgress * 0.8}
        color="#fedc97"
        distance={9}
        decay={2}
      />

      {/* Secondary Cool Rim Light */}
      <pointLight
        position={[-5, 2, -2]}
        intensity={0.5}
        color="#8faab5"
        distance={12}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 9. TEACHING STUDIO & RESOURCE EXHIBITION GALLERY                  */}
      {/* ------------------------------------------------------------------ */}
      <TeachingStudio3D
        activeCategory={activeCategory}
        hoveredItemId={hoveredTeachingItemId}
        isMobile={isMobile}
        scrollProgress={scrollProgress}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 10. LEARNING LAB / TLM & CLASSROOM PROJECTS EXHIBITION            */}
      {/* ------------------------------------------------------------------ */}
      <TlmExhibition3D
        activeCategory={activeTlmCategory}
        hoveredProjectId={hoveredTlmProjectId}
        isMobile={isMobile}
        scrollProgress={scrollProgress}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 11. ACTION RESEARCH & CLASSROOM INQUIRY WORKSPACE                 */}
      {/* ------------------------------------------------------------------ */}
      <ActionResearch3D
        activeStageId={activeStageId}
        hoveredEvidenceId={hoveredEvidenceId}
        isMobile={isMobile}
        scrollProgress={scrollProgress}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 12. CERTIFICATES & VISUAL MEMORY GALLERY ("MOMENTS FROM JOURNEY") */}
      {/* ------------------------------------------------------------------ */}
      <VisualGallery3D
        activeItemId={activeGalleryItemId}
        hoveredItemId={hoveredGalleryItemId}
        onHoverItem={onHoverGalleryItem}
        onSelectItem={onSelectGalleryItem}
        isMobile={isMobile}
        scrollProgress={scrollProgress}
      />
    </group>
  );
}
