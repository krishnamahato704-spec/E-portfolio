import { useContext } from 'react';
import { MotionContext } from './WorkspaceCanvas';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CategoryFilter } from '../data/teachingData';

interface TeachingStudio3DProps {
  activeCategory: CategoryFilter;
  hoveredItemId: string | null;
  isMobile: boolean;
  scrollProgress: React.RefObject<number>;
}

export function TeachingStudio3D({
  activeCategory,
  hoveredItemId,
  isMobile,
  scrollProgress,
}: TeachingStudio3DProps) {
  const reduced = useContext(MotionContext);
  const groupRef = useRef<THREE.Group>(null);
  const lessonPlanBoardRef = useRef<THREE.Group>(null);
  const internshipFolioRef = useRef<THREE.Group>(null);
  const tlmStandRef = useRef<THREE.Group>(null);
  const assessmentBoxRef = useRef<THREE.Group>(null);
  const researchPlaqueRef = useRef<THREE.Group>(null);

  // Smooth micro-motion and responsive elevation based on active category & hover
  useFrame((state, delta) => {
    if (reduced) return;
    delta = Math.min(delta, .05);
    if (!groupRef.current) return;

    // Subtly reveal & float the studio as scroll enters the Teaching Portfolio zone (p > 0.55)
    const studioVisibility = THREE.MathUtils.clamp((scrollProgress.current - 0.40) / 0.04, 0, 1);
    groupRef.current.position.y = THREE.MathUtils.lerp(-0.3, 0, studioVisibility);

    // Target positions for each exhibition artifact based on active category and hovered cards
    const isLessonActive = activeCategory === 'Lesson Plans' || hoveredItemId === 'democracy-lesson-plan';
    const isPracticeActive = activeCategory === 'Teaching Practice' || hoveredItemId === 'panchsheel-internship' || hoveredItemId === 'pehchaan-field-teaching';
    const isTlmActive = activeCategory === 'TLM & Resources' || hoveredItemId === 'visual-tlm-concept-maps';
    const isAssessmentActive = activeCategory === 'Assessments' || hoveredItemId === 'formative-assessment-checks';
    const isResearchActive = activeCategory === 'Academic Research' || hoveredItemId === 'nep-2020-presentation';

    // Lerp individual exhibition pedestals
    if (lessonPlanBoardRef.current) {
      const targetZ = isLessonActive ? 0.35 : 0;
      const targetY = isLessonActive ? 0.08 : 0;
      lessonPlanBoardRef.current.position.z = THREE.MathUtils.damp(lessonPlanBoardRef.current.position.z, targetZ, 4, delta);
      lessonPlanBoardRef.current.position.y = THREE.MathUtils.damp(lessonPlanBoardRef.current.position.y, targetY, 4, delta);
      lessonPlanBoardRef.current.rotation.y = THREE.MathUtils.damp(
        lessonPlanBoardRef.current.rotation.y,
        -0.08 + (isLessonActive ? 0.04 : 0),
        3,
        delta
      );
    }

    if (internshipFolioRef.current) {
      const targetZ = isPracticeActive ? 0.3 : 0;
      const targetY = isPracticeActive ? 0.06 : 0;
      internshipFolioRef.current.position.z = THREE.MathUtils.damp(internshipFolioRef.current.position.z, targetZ, 4, delta);
      internshipFolioRef.current.position.y = THREE.MathUtils.damp(internshipFolioRef.current.position.y, targetY, 4, delta);
    }

    if (tlmStandRef.current) {
      const targetZ = isTlmActive ? 0.28 : 0;
      const targetY = isTlmActive ? 0.06 : 0;
      tlmStandRef.current.position.z = THREE.MathUtils.damp(tlmStandRef.current.position.z, targetZ, 4, delta);
      tlmStandRef.current.position.y = THREE.MathUtils.damp(tlmStandRef.current.position.y, targetY, 4, delta);
    }

    if (assessmentBoxRef.current) {
      const targetZ = isAssessmentActive ? 0.25 : 0;
      assessmentBoxRef.current.position.z = THREE.MathUtils.damp(assessmentBoxRef.current.position.z, targetZ, 4, delta);
    }

    if (researchPlaqueRef.current) {
      const targetZ = isResearchActive ? 0.25 : 0;
      researchPlaqueRef.current.position.z = THREE.MathUtils.damp(researchPlaqueRef.current.position.z, targetZ, 4, delta);
    }
  });

  return (
    <group ref={groupRef} position={[4.2, 0, 1.8]}>
      {/* 1. STUDIO RESOURCE WALL (Architectural backdrop) */}
      <group position={[0, 1.4, -2.6]}>
        {/* Acoustic wood paneling backdrop */}
        <mesh receiveShadow>
          <boxGeometry args={[7.4, 4.6, 0.15]} />
          <meshStandardMaterial color="#1a1410" roughness={0.88} metalness={0.12} />
        </mesh>

        {/* Studio Cork Display Board with Brass Trim */}
        <mesh position={[0, 0.35, 0.08]} receiveShadow>
          <boxGeometry args={[6.6, 3.2, 0.06]} />
          <meshStandardMaterial color="#2d221a" roughness={0.92} metalness={0.08} />
        </mesh>
        {/* Brass outer frame */}
        <mesh position={[0, 0.35, 0.11]}>
          <boxGeometry args={[6.72, 3.32, 0.02]} />
          <meshStandardMaterial color="#c59b27" roughness={0.35} metalness={0.85} wireframe={false} />
        </mesh>

        {/* Board Title Plaque */}
        <group position={[0, 1.78, 0.12]}>
          <mesh>
            <boxGeometry args={[2.8, 0.32, 0.02]} />
            <meshStandardMaterial color="#110d0a" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[2.7, 0.24, 0.01]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* Studio Wall Gallery Light Fixture */}
        <group position={[0, 2.15, 0.55]}>
          {/* Light arm */}
          <mesh position={[0, 0, -0.25]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
            <meshStandardMaterial color="#c59b27" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Light reflector bar */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[2.4, 0.08, 0.16]} />
            <meshStandardMaterial color="#c59b27" metalness={0.9} roughness={0.2} />
          </mesh>

        </group>
      </group>

      {/* 2. THE MASTER LESSON PLAN DISPLAY EASEL (Centerpiece) */}
      <group ref={lessonPlanBoardRef} position={[-0.85, 0.45, -1.2]}>
        {/* Studio Floor Easel Stand */}
        <group position={[0, -0.6, 0]}>
          {/* Tripod legs */}
          <mesh position={[-0.45, 0, -0.1]} rotation={[0.05, 0, 0.12]}>
            <cylinderGeometry args={[0.025, 0.02, 1.8, 8]} />
            <meshStandardMaterial color="#2c1d11" roughness={0.7} />
          </mesh>
          <mesh position={[0.45, 0, -0.1]} rotation={[0.05, 0, -0.12]}>
            <cylinderGeometry args={[0.025, 0.02, 1.8, 8]} />
            <meshStandardMaterial color="#2c1d11" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.55]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 1.8, 8]} />
            <meshStandardMaterial color="#2c1d11" roughness={0.7} />
          </mesh>
          {/* Horizontal crossbar shelf */}
          <mesh position={[0, 0.35, 0.05]}>
            <boxGeometry args={[1.5, 0.06, 0.12]} />
            <meshStandardMaterial color="#3a2717" roughness={0.6} />
          </mesh>
        </group>

        {/* Mounted Lesson Plan Board: Democracy No. 6 */}
        <mesh position={[0, 0.65, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.35, 1.75, 0.04]} />
          <meshStandardMaterial color="#f7f3e8" roughness={0.75} metalness={0.05} />
        </mesh>
        {/* Parchment border & technical title bar */}
        <mesh position={[0, 1.35, 0.125]}>
          <boxGeometry args={[1.2, 0.18, 0.01]} />
          <meshStandardMaterial color="#1a2530" roughness={0.4} />
        </mesh>
        {/* Gold lesson clip */}
        <mesh position={[0, 1.54, 0.14]}>
          <boxGeometry args={[0.32, 0.08, 0.04]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Faux lesson diagram boxes on sheet */}
        <group position={[0, 0.65, 0.125]}>
          {/* Comparative Concept Diagram Box */}
          <mesh position={[-0.28, 0.28, 0]}>
            <planeGeometry args={[0.55, 0.42]} />
            <meshBasicMaterial color="#e8eff5" />
          </mesh>
          <mesh position={[0.28, 0.28, 0]}>
            <planeGeometry args={[0.55, 0.42]} />
            <meshBasicMaterial color="#fdf2e9" />
          </mesh>
          {/* Formative assessment lines */}
          <mesh position={[0, -0.22, 0]}>
            <planeGeometry args={[1.15, 0.48]} />
            <meshBasicMaterial color="#ebe6dc" />
          </mesh>
        </group>

        {/* Mini Accent Spot for Lesson Plan */}

      </group>

      {/* 3. PRACTICUM & INTERNSHIP ARCHIVAL REGISTER (Left Shelf) */}
      <group ref={internshipFolioRef} position={[-2.4, 0.35, -1.5]}>
        {/* Wooden Pedestal Shelf */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[1.4, 0.7, 0.9]} />
          <meshStandardMaterial color="#241a13" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.46, 0.04, 0.96]} />
          <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Stack of Teacher Practicum Logbooks & Registers */}
        <group position={[-0.1, 0.18, 0]} rotation={[0, 0.15, 0]}>
          {/* Bottom Register: Panchsheel Balak Inter-College 16-Week Log */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.75, 0.12, 0.95]} />
            <meshStandardMaterial color="#1b2a47" roughness={0.6} />
          </mesh>
          {/* Gold spine label */}
          <mesh position={[-0.38, 0, 0]}>
            <boxGeometry args={[0.02, 0.09, 0.7]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Middle Folio: Pehchaan Street School 80-Hour Field Journal */}
          <mesh position={[0.02, 0.11, 0.02]} rotation={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.08, 0.9]} />
            <meshStandardMaterial color="#6e2d1d" roughness={0.65} />
          </mesh>

          {/* Top Sheet: Amity Observation Field Notes */}
          <mesh position={[0.04, 0.17, 0.01]} rotation={[0, 0.08, 0]}>
            <boxGeometry args={[0.62, 0.03, 0.8]} />
            <meshStandardMaterial color="#f4ede0" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* 4. TEACHING-LEARNING MATERIALS (TLM) PLINTH & SOURCE MAP (Right) */}
      <group ref={tlmStandRef} position={[1.4, 0.35, -1.4]}>
        {/* Pedestal */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.7, 0.9]} />
          <meshStandardMaterial color="#241a13" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.56, 0.04, 0.96]} />
          <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Slanted Presentation Stand */}
        <group position={[0, 0.22, -0.05]} rotation={[-0.32, 0, 0]}>
          {/* Walnut easel plate */}
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.85, 0.04]} />
            <meshStandardMaterial color="#352417" roughness={0.7} />
          </mesh>
          {/* Comparative Concept Map Display Sheet */}
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.02, 0.78]} />
            <meshStandardMaterial color="#f8f4ea" roughness={0.7} />
          </mesh>
          {/* Visual TLM Diagram Elements */}
          <mesh position={[-0.26, 0.12, 0.03]}>
            <planeGeometry args={[0.38, 0.28]} />
            <meshBasicMaterial color="#30475e" />
          </mesh>
          <mesh position={[0.26, 0.12, 0.03]}>
            <planeGeometry args={[0.38, 0.28]} />
            <meshBasicMaterial color="#c06c84" />
          </mesh>
          {/* Bottom connecting flow indicator */}
          <mesh position={[0, -0.22, 0.03]}>
            <planeGeometry args={[0.85, 0.18]} />
            <meshBasicMaterial color="#dcd6c8" />
          </mesh>
        </group>

        {/* Rolled Historical Timeline Scroll beside the stand */}
        <group position={[0.55, 0.12, 0.25]} rotation={[0, 0.4, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.75, 16]} />
            <meshStandardMaterial color="#e8dfce" roughness={0.85} />
          </mesh>
          {/* Gold ribbon tie */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.06, 16]} />
            <meshStandardMaterial color="#c59b27" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 5. FORMATIVE ASSESSMENT INSTRUMENT PLINTH (Front-Right) */}
      <group ref={assessmentBoxRef} position={[0.7, 0.05, 0.2]}>
        {/* Polished Teak Ballot & Exit-Slip Box */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.28, 0.42]} />
          <meshStandardMaterial color="#402816" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Brass trim & slot */}
        <mesh position={[0, 0.142, 0]}>
          <boxGeometry args={[0.32, 0.015, 0.04]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Brass diagnostic plaque */}
        <mesh position={[0, 0, 0.212]}>
          <boxGeometry args={[0.35, 0.1, 0.01]} />
          <meshStandardMaterial color="#c59b27" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Stack of diagnostic prompt cards */}
        <mesh position={[-0.42, -0.06, 0.05]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.35, 0.06, 0.48]} />
          <meshStandardMaterial color="#faf6ee" roughness={0.9} />
        </mesh>
      </group>

      {/* 6. ACADEMIC RESEARCH & POLICY DISCIPLINE (Front-Left) */}
      <group ref={researchPlaqueRef} position={[-0.7, 0.05, 0.2]}>
        {/* Hardbound Seminar Volume: NEP 2020 & IKS in Teacher Education */}
        <group rotation={[0, -0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.09, 0.82]} />
            <meshStandardMaterial color="#1a3b32" roughness={0.5} metalness={0.15} />
          </mesh>
          {/* Gold embossed title stripe */}
          <mesh position={[0, 0.046, -0.1]}>
            <boxGeometry args={[0.5, 0.005, 0.12]} />
            <meshStandardMaterial color="#e5c158" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Brass bookmark ruler placed diagonally */}
          <mesh position={[0.1, 0.05, 0.05]} rotation={[0, 0.35, 0]}>
            <boxGeometry args={[0.035, 0.008, 0.55]} />
            <meshStandardMaterial color="#c59b27" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
