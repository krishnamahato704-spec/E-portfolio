import { useContext } from 'react';
import { MotionContext } from './WorkspaceCanvas';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TlmCategory } from '../data/tlmData';

interface TlmExhibition3DProps {
  activeCategory: TlmCategory;
  hoveredProjectId: string | null;
  isMobile: boolean;
  scrollProgress: React.RefObject<number>;
}

export function TlmExhibition3D({
  activeCategory,
  hoveredProjectId,
  isMobile,
  scrollProgress,
}: TlmExhibition3DProps) {
  const reduced = useContext(MotionContext);
  const rootGroupRef = useRef<THREE.Group>(null);

  // Individual station refs for hover & category micro-motion
  const comparativeBoardRef = useRef<THREE.Group>(null);
  const tactileTrayRef = useRef<THREE.Group>(null);
  const photoCardsRef = useRef<THREE.Group>(null);
  const assessmentBoxRef = useRef<THREE.Group>(null);
  const boardMatrixRef = useRef<THREE.Group>(null);
  const observationLedgerRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useFrame((_, delta) => {
    if (reduced) return;
    delta = Math.min(delta, .05);
    if (!rootGroupRef.current) return;

    // Reveal and settle into the Learning Lab when scroll enters TLM zone (p >= 0.70)
    const tlmVisibility = THREE.MathUtils.clamp((scrollProgress.current - 0.56) / 0.04, 0, 1);
    rootGroupRef.current.position.y = THREE.MathUtils.lerp(-0.4, 0, tlmVisibility);

    // Active state determinations
    const isComparativeActive =
      hoveredProjectId === 'tlm-comparative-diagrams' ||
      activeCategory === 'Visual TLM' ||
      activeCategory === 'Social Science';
    const isTactileActive =
      hoveredProjectId === 'tlm-phonics-word-builder' ||
      activeCategory === 'Working Models / Tactile' ||
      activeCategory === 'English';
    const isPhotoActive =
      hoveredProjectId === 'tlm-photo-evidence-cards' ||
      activeCategory === 'Visual TLM';
    const isAssessmentActive =
      hoveredProjectId === 'tlm-formative-response-sheets' ||
      activeCategory === 'Classroom Activities';
    const isMatrixActive =
      hoveredProjectId === 'tlm-board-matrix' ||
      activeCategory === 'Visual TLM';
    const isObservationActive =
      hoveredProjectId === 'tlm-observation-questioning-protocol' ||
      activeCategory === 'Classroom Activities';

    const lerpRate = delta * 4;

    // Station 1: Comparative Diagrams Board
    if (comparativeBoardRef.current) {
      const targetY = isComparativeActive ? 0.08 : 0;
      const targetZ = isComparativeActive ? 0.25 : 0;
      comparativeBoardRef.current.position.y = THREE.MathUtils.lerp(
        comparativeBoardRef.current.position.y,
        targetY,
        lerpRate
      );
      comparativeBoardRef.current.position.z = THREE.MathUtils.lerp(
        comparativeBoardRef.current.position.z,
        targetZ,
        lerpRate
      );
    }

    // Station 2: Tactile Tray & Blocks
    if (tactileTrayRef.current) {
      const targetY = isTactileActive ? 0.07 : 0;
      const targetZ = isTactileActive ? 0.22 : 0;
      tactileTrayRef.current.position.y = THREE.MathUtils.lerp(
        tactileTrayRef.current.position.y,
        targetY,
        lerpRate
      );
      tactileTrayRef.current.position.z = THREE.MathUtils.lerp(
        tactileTrayRef.current.position.z,
        targetZ,
        lerpRate
      );
    }

    // Station 3: Photo Cards Pinboard
    if (photoCardsRef.current) {
      const targetY = isPhotoActive ? 0.08 : 0;
      const targetZ = isPhotoActive ? 0.25 : 0;
      photoCardsRef.current.position.y = THREE.MathUtils.lerp(
        photoCardsRef.current.position.y,
        targetY,
        lerpRate
      );
      photoCardsRef.current.position.z = THREE.MathUtils.lerp(
        photoCardsRef.current.position.z,
        targetZ,
        lerpRate
      );
    }

    // Station 4: Formative Box
    if (assessmentBoxRef.current) {
      const targetY = isAssessmentActive ? 0.06 : 0;
      assessmentBoxRef.current.position.y = THREE.MathUtils.lerp(
        assessmentBoxRef.current.position.y,
        targetY,
        lerpRate
      );
    }

    // Station 5: Board Matrix
    if (boardMatrixRef.current) {
      const targetY = isMatrixActive ? 0.08 : 0;
      boardMatrixRef.current.position.y = THREE.MathUtils.lerp(
        boardMatrixRef.current.position.y,
        targetY,
        lerpRate
      );
    }

    // Station 6: Observation Ledger
    if (observationLedgerRef.current) {
      const targetY = isObservationActive ? 0.06 : 0;
      observationLedgerRef.current.position.y = THREE.MathUtils.lerp(
        observationLedgerRef.current.position.y,
        targetY,
        lerpRate
      );
    }

    // Smoothly aim the gallery spotlight toward the hovered station
    if (spotlightRef.current) {
      let targetX = 5.2;
      let targetZ = -2.2;
      if (hoveredProjectId === 'tlm-phonics-word-builder') {
        targetX = 6.4;
        targetZ = -1.8;
      } else if (hoveredProjectId === 'tlm-photo-evidence-cards') {
        targetX = 4.4;
        targetZ = -2.6;
      } else if (hoveredProjectId === 'tlm-formative-response-sheets') {
        targetX = 5.8;
        targetZ = -2.8;
      } else if (hoveredProjectId === 'tlm-board-matrix') {
        targetX = 7.0;
        targetZ = -2.4;
      }
      spotlightRef.current.target.position.set(targetX, 0.4, targetZ);
      spotlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <group ref={rootGroupRef} position={[5.4, 0, -2.4]}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. GALLERY SPOTLIGHT FOR LEARNING LAB STATIONS                     */}
      {/* ------------------------------------------------------------------ */}


      {/* ------------------------------------------------------------------ */}
      {/* 2. THE MAIN LEARNING LAB WORKSHOP TABLE & EXHIBITION BENCH        */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, -0.4, 0]}>
        {/* Table Top Plank: Rich walnut with gold trim */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[4.4, 0.1, 1.6]} />
          <meshStandardMaterial color="#2a1f17" roughness={0.7} metalness={0.15} />
        </mesh>
        {/* Warm Brass Edge Trim */}
        <mesh position={[0, 0.155, 0.8]}>
          <boxGeometry args={[4.42, 0.015, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.155, -0.8]}>
          <boxGeometry args={[4.42, 0.015, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Sturdy Table Trestle Legs */}
        <mesh position={[-1.9, -0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.9, 1.4]} />
          <meshStandardMaterial color="#1a140e" roughness={0.8} />
        </mesh>
        <mesh position={[1.9, -0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.9, 1.4]} />
          <meshStandardMaterial color="#1a140e" roughness={0.8} />
        </mesh>
        {/* Horizontal Stretcher Bar */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[3.8, 0.06, 0.08]} />
          <meshStandardMaterial color="#14100b" roughness={0.85} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 3. STATION 1: MASTER COMPARATIVE SYSTEMS DISPLAY STAND (Featured)   */}
      {/* ------------------------------------------------------------------ */}
      <group ref={comparativeBoardRef} position={[-1.1, -0.05, 0.1]}>
        {/* Display Pedestal Plinth */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[1.0, 0.08, 0.6]} />
          <meshStandardMaterial color="#36291e" roughness={0.6} />
        </mesh>
        {/* Architectural Brass Struts */}
        <mesh position={[-0.32, 0.22, -0.08]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.65, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.32, 0.22, -0.08]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.65, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Upright Comparative Systems Board */}
        <group position={[0, 0.35, 0]} rotation={[-0.12, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.92, 0.68, 0.03]} />
            <meshStandardMaterial color="#18130e" roughness={0.5} />
          </mesh>
          {/* Outer Gold Border */}
          <mesh position={[0, 0, 0.018]}>
            <boxGeometry args={[0.88, 0.64, 0.01]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* High-Contrast Schematic Paper Face */}
          <mesh position={[0, 0, 0.024]}>
            <planeGeometry args={[0.84, 0.6]} />
            <meshStandardMaterial color="#f9f6ed" roughness={0.9} />
          </mesh>
          {/* Schematic Diagram Bars (Parliamentary vs Presidential Columns) */}
          <mesh position={[-0.2, 0.06, 0.028]}>
            <planeGeometry args={[0.34, 0.38]} />
            <meshStandardMaterial color="#1e3a47" roughness={0.8} />
          </mesh>
          <mesh position={[0.2, 0.06, 0.028]}>
            <planeGeometry args={[0.34, 0.38]} />
            <meshStandardMaterial color="#882a24" roughness={0.8} />
          </mesh>
          {/* Center Dividing Arrow / Axis */}
          <mesh position={[0, 0.06, 0.03]}>
            <planeGeometry args={[0.02, 0.38]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Label Badge on Pedestal */}
          <mesh position={[0, -0.38, 0.08]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.02]} />
            <meshStandardMaterial color="#0f0c08" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 4. STATION 2: TACTILE PHONICS & WORD-BUILDING TRAY (FLN Kit)       */}
      {/* ------------------------------------------------------------------ */}
      <group ref={tactileTrayRef} position={[0.3, -0.15, 0.25]} rotation={[0, -0.15, 0]}>
        {/* Shallow Timber Tray with raised lip */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.88, 0.04, 0.55]} />
          <meshStandardMaterial color="#3d2c1d" roughness={0.65} />
        </mesh>
        {/* Felt Base Lining */}
        <mesh position={[0, 0.022, 0]}>
          <boxGeometry args={[0.84, 0.005, 0.51]} />
          <meshStandardMaterial color="#245e43" roughness={0.9} />
        </mesh>

        {/* Tactile Letter Blocks / Tiles arranged in word-family pairs */}
        {/* Block 1: 'C' */}
        <mesh position={[-0.28, 0.05, -0.1]} rotation={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#f7ecd0" roughness={0.5} />
        </mesh>
        {/* Block 2: 'A' */}
        <mesh position={[-0.15, 0.05, -0.09]} rotation={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Block 3: 'T' */}
        <mesh position={[-0.02, 0.05, -0.1]} rotation={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#f7ecd0" roughness={0.5} />
        </mesh>

        {/* Word 2: 'M' - 'A' - 'P' */}
        <mesh position={[-0.28, 0.05, 0.08]} rotation={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#f7ecd0" roughness={0.5} />
        </mesh>
        <mesh position={[-0.15, 0.05, 0.07]} rotation={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.02, 0.05, 0.08]} rotation={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#f7ecd0" roughness={0.5} />
        </mesh>

        {/* Stack of Phonics Flashcards on right side of tray */}
        <group position={[0.24, 0.04, 0]} rotation={[0, 0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.035, 0.35]} />
            <meshStandardMaterial color="#faf6ee" roughness={0.8} />
          </mesh>
          {/* Top card with accent border */}
          <mesh position={[0, 0.02, 0]}>
            <planeGeometry args={[0.23, 0.33]} />
            <meshStandardMaterial color="#fedc97" roughness={0.7} />
          </mesh>
        </group>

        {/* Miniature Wooden Slate Resting against tray */}
        <group position={[0, 0.14, -0.28]} rotation={[-0.4, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.35, 0.02]} />
            <meshStandardMaterial color="#2d2217" roughness={0.7} />
          </mesh>
          {/* Slate writing surface */}
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.64, 0.29]} />
            <meshStandardMaterial color="#1a2022" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 5. STATION 3: PRIMARY SOURCE PHOTO CARDS PINBOARD                   */}
      {/* ------------------------------------------------------------------ */}
      <group ref={photoCardsRef} position={[-0.1, 0.45, -0.65]}>
        {/* Suspended Cork Pinboard with Wood Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.72, 0.03]} />
          <meshStandardMaterial color="#38291b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[1.32, 0.64]} />
          <meshStandardMaterial color="#c2a47a" roughness={0.95} />
        </mesh>

        {/* Photo Card 1: Electoral Queue Placard (Left) */}
        <group position={[-0.35, 0.04, 0.026]} rotation={[0, 0, -0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.34, 0.008]} />
            <meshStandardMaterial color="#faf6ee" roughness={0.7} />
          </mesh>
          {/* Photograph area */}
          <mesh position={[0, 0.02, 0.006]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshStandardMaterial color="#2a3840" roughness={0.6} />
          </mesh>
          {/* Brass Push Pin */}
          <mesh position={[0, 0.14, 0.012]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Photo Card 2: Citizen Peaceful Protest Placard (Right) */}
        <group position={[0.35, -0.02, 0.026]} rotation={[0, 0, 0.03]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.34, 0.008]} />
            <meshStandardMaterial color="#faf6ee" roughness={0.7} />
          </mesh>
          {/* Photograph area */}
          <mesh position={[0, 0.02, 0.006]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshStandardMaterial color="#5e2b24" roughness={0.6} />
          </mesh>
          {/* Brass Push Pin */}
          <mesh position={[0, 0.14, 0.012]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Bottom Evidence Inquiry Prompt Strip */}
        <mesh position={[0, -0.24, 0.026]}>
          <planeGeometry args={[1.0, 0.08]} />
          <meshStandardMaterial color="#130e09" roughness={0.7} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 6. STATION 4: FORMATIVE DIAGNOSTIC ASSESSMENT BOX                  */}
      {/* ------------------------------------------------------------------ */}
      <group ref={assessmentBoxRef} position={[1.4, -0.08, 0.15]} rotation={[0, -0.2, 0]}>
        {/* Slotted Timber Box */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.32, 0.38]} />
          <meshStandardMaterial color="#2c2016" roughness={0.6} />
        </mesh>
        {/* Brass corner brackets */}
        <mesh position={[0, 0.162, 0]}>
          <boxGeometry args={[0.46, 0.01, 0.34]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Ballot / Prompt Slot on Top */}
        <mesh position={[0, 0.168, 0]}>
          <boxGeometry args={[0.26, 0.005, 0.03]} />
          <meshStandardMaterial color="#0a0806" roughness={0.9} />
        </mesh>
        {/* Emerging Diagnostic Prompt Slips sticking out */}
        <mesh position={[-0.02, 0.21, 0]} rotation={[-0.1, 0, 0.05]} castShadow>
          <boxGeometry args={[0.18, 0.1, 0.005]} />
          <meshStandardMaterial color="#fffef7" roughness={0.8} />
        </mesh>
        {/* Stack of Pre-printed Tier Response Sheets beside box */}
        <group position={[-0.35, -0.1, 0]} rotation={[0, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.05, 0.38]} />
            <meshStandardMaterial color="#f6f2e8" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <planeGeometry args={[0.26, 0.35]} />
            <meshStandardMaterial color="#ded7cb" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 7. STATION 5: BLACKBOARD MATRIX DRAFTING SLATE                     */}
      {/* ------------------------------------------------------------------ */}
      <group ref={boardMatrixRef} position={[1.35, 0.42, -0.55]} rotation={[0, -0.22, 0]}>
        {/* Upright Miniature Chalkboard */}
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.58, 0.03]} />
          <meshStandardMaterial color="#302316" roughness={0.7} />
        </mesh>
        {/* Dark Slate Surface */}
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[0.8, 0.52]} />
          <meshStandardMaterial color="#1a2322" roughness={0.95} />
        </mesh>
        {/* Chalk Grid Lines */}
        <mesh position={[0, 0.04, 0.022]}>
          <planeGeometry args={[0.74, 0.005]} />
          <meshStandardMaterial color="#faf6ee" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.08, 0.022]}>
          <planeGeometry args={[0.74, 0.005]} />
          <meshStandardMaterial color="#faf6ee" roughness={0.9} />
        </mesh>
        <mesh position={[-0.1, 0, 0.022]}>
          <planeGeometry args={[0.005, 0.46]} />
          <meshStandardMaterial color="#faf6ee" roughness={0.9} />
        </mesh>
        {/* Chalk Sticks resting in chalk tray */}
        <mesh position={[0, -0.27, 0.035]}>
          <boxGeometry args={[0.82, 0.03, 0.05]} />
          <meshStandardMaterial color="#22180f" roughness={0.8} />
        </mesh>
        <mesh position={[-0.15, -0.25, 0.04]} rotation={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.08, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[-0.05, -0.25, 0.04]} rotation={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.07, 8]} />
          <meshStandardMaterial color="#ffe880" roughness={0.9} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 8. STATION 6: PEDAGOGICAL OBSERVATION PROTOCOL LEDGER             */}
      {/* ------------------------------------------------------------------ */}
      <group ref={observationLedgerRef} position={[-1.75, -0.12, -0.2]} rotation={[0, 0.25, 0]}>
        {/* Open Leatherbound Field Dossier */}
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.05, 0.4]} />
          <meshStandardMaterial color="#3b1f14" roughness={0.7} />
        </mesh>
        {/* Cream Pages with rubric columns */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.5, 0.02, 0.36]} />
          <meshStandardMaterial color="#fbf7ec" roughness={0.9} />
        </mesh>
        {/* Brass Reading Rule / Marker */}
        <mesh position={[0, 0.042, 0]} rotation={[0, 0.05, 0]}>
          <boxGeometry args={[0.42, 0.005, 0.025]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 9. TRANSITION HORIZON: FORWARD RESEARCH PLINTH (Action Research)  */}
      {/* ------------------------------------------------------------------ */}
      {/* Subtle forward hint toward the academic research workspace at x: 2.8, z: -1.8 */}
      <group position={[2.4, 0.1, -1.2]} rotation={[0, -0.3, 0]}>
        {/* Raised Research Stand */}
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.7, 0.6]} />
          <meshStandardMaterial color="#1a140f" roughness={0.7} />
        </mesh>
        {/* Inlaid Brass Plaque */}
        <mesh position={[0, 0.2, 0.31]}>
          <boxGeometry args={[0.65, 0.16, 0.01]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Bound Action Research Dossiers */}
        <mesh position={[-0.15, 0.45, 0]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.32]} />
          <meshStandardMaterial color="#1e3a47" roughness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.43, 0.05]} rotation={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.24, 0.14, 0.34]} />
          <meshStandardMaterial color="#882a24" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
