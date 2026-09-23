import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RESEARCH_STAGES } from '../data/actionResearchData';

interface ActionResearch3DProps {
  scrollProgress: number;
  activeStageId: string | null;
  hoveredEvidenceId: string | null;
  isMobile: boolean;
}

export function ActionResearch3D({
  scrollProgress,
  activeStageId,
  hoveredEvidenceId,
  isMobile,
}: ActionResearch3DProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const lampLightRef = useRef<THREE.SpotLight>(null);
  const binderRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<Map<string, THREE.Group>>(new Map());

  // Connecting thread coordinates across evidence pins on the corkboard
  const threadPoints = useMemo(() => {
    return [
      new THREE.Vector3(-1.1, 0.35, 0.04), // Problem note
      new THREE.Vector3(-0.35, 0.35, 0.04), // Inquiry question
      new THREE.Vector3(0.65, 0.45, 0.04), // Continuum flow
      new THREE.Vector3(0.25, -0.3, 0.04), // Formative check
      new THREE.Vector3(-0.75, -0.3, 0.04), // Intervention plan
      new THREE.Vector3(1.05, -0.25, 0.04), // Reflective ledger
    ];
  }, []);

  const threadGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(threadPoints, false, 'centripetal', 0.2);
    const points = curve.getPoints(60);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [threadPoints]);

  useFrame((_, delta) => {
    if (!rootGroupRef.current) return;

    // Visibility range for Action Research: scroll progress ~0.72 to 1.00
    // Subtle entry fade from 0.72 to 0.78, full presence through 0.94, elegant hold to 1.0
    const inRange = scrollProgress >= 0.70;
    const targetOpacity = inRange ? Math.min(1, Math.max(0, (scrollProgress - 0.70) / 0.06)) : 0;

    rootGroupRef.current.visible = targetOpacity > 0.01;

    // Micro breathing / subtle scholarly presence
    if (inRange) {
      const activeIdx = RESEARCH_STAGES.findIndex(s => s.id === activeStageId);
      const targetLampX = 10.8 - (activeIdx >= 0 ? activeIdx * 0.3 : 0);

      if (lampLightRef.current) {
        lampLightRef.current.position.x = THREE.MathUtils.damp(
          lampLightRef.current.position.x,
          targetLampX,
          3,
          delta
        );
        lampLightRef.current.intensity = THREE.MathUtils.damp(
          lampLightRef.current.intensity,
          inRange ? 2.2 : 0,
          4,
          delta
        );
      }

      // Slightly lift and tilt binder when in early research stages
      if (binderRef.current) {
        const isBinderActive = activeStageId === 'stage-problem' || activeStageId === 'stage-observation';
        const targetLift = isBinderActive ? 0.03 : 0;
        binderRef.current.position.y = THREE.MathUtils.damp(
          binderRef.current.position.y,
          0.52 + targetLift,
          4,
          delta
        );
      }

      // Animate active/hovered pinboard cards
      RESEARCH_STAGES.forEach(stage => {
        const cardGroup = cardRefs.current.get(stage.id);
        if (cardGroup) {
          const isSelected = stage.id === activeStageId;
          const isHovered = stage.id === hoveredEvidenceId;
          const targetZ = isSelected ? 0.08 : isHovered ? 0.05 : 0.02;
          const targetRotX = isSelected ? -0.04 : 0;

          cardGroup.position.z = THREE.MathUtils.damp(cardGroup.position.z, targetZ, 6, delta);
          cardGroup.rotation.x = THREE.MathUtils.damp(cardGroup.rotation.x, targetRotX, 6, delta);
        }
      });
    }
  });

  return (
    <group ref={rootGroupRef} position={[9.2, 0, -2.6]} visible={false}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. Academic Task Lighting: Desk Task Lamp & Ambient Focus          */}
      {/* ------------------------------------------------------------------ */}
      <spotLight
        ref={lampLightRef}
        position={[10.6, 2.2, -1.8]}
        target-position={[9.2, 0.5, -2.6]}
        color="#ffe3ba"
        intensity={2.2}
        distance={7}
        angle={0.65}
        penumbra={0.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <pointLight position={[9.2, 1.8, -2.4]} color="#ffeedd" intensity={0.6} distance={4} />

      {/* ------------------------------------------------------------------ */}
      {/* 2. The Research Study Desk / Academic Investigation Plinth          */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0, 0, 0]}>
        {/* Main Desktop (Warm Dark Walnut with Chamfered Edge) */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.07, 1.8]} />
          <meshStandardMaterial color="#2d2218" roughness={0.5} metalness={0.12} />
        </mesh>

        {/* Desk Trim Inlay (Warm Beech Accent Stripe) */}
        <mesh position={[0, 0.486, 0.88]}>
          <boxGeometry args={[3.76, 0.005, 0.02]} />
          <meshStandardMaterial color="#b89360" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Sturdy Desk Legs (Dark Bronzed Cast Iron) */}
        <mesh position={[-1.75, 0.22, -0.75]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 16]} />
          <meshStandardMaterial color="#1a1816" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[1.75, 0.22, -0.75]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 16]} />
          <meshStandardMaterial color="#1a1816" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[-1.75, 0.22, 0.75]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 16]} />
          <meshStandardMaterial color="#1a1816" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[1.75, 0.22, 0.75]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 16]} />
          <meshStandardMaterial color="#1a1816" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Foot Stretcher Bar */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[3.45, 0.02, 0.04]} />
          <meshStandardMaterial color="#1f1c19" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Leather Desk Blotter / Writing Pad */}
        <mesh position={[-0.4, 0.487, 0.1]} receiveShadow>
          <boxGeometry args={[1.9, 0.006, 1.1]} />
          <meshStandardMaterial color="#1c2428" roughness={0.8} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Open Action Research Field Binder & Primary Artifacts on Desk   */}
      {/* ------------------------------------------------------------------ */}
      <group ref={binderRef} position={[-0.7, 0.52, 0.1]} rotation={[0.05, 0.12, 0]}>
        {/* Binder Outer Leather Cover */}
        <mesh position={[0, -0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.76, 0.02, 0.52]} />
          <meshStandardMaterial color="#213338" roughness={0.6} />
        </mesh>

        {/* Left Page (Problem Statement & Inquiries) */}
        <mesh position={[-0.18, 0, 0]} rotation={[-0.01, 0.03, 0]} receiveShadow>
          <boxGeometry args={[0.34, 0.008, 0.48]} />
          <meshStandardMaterial color="#f9f7f2" roughness={0.85} />
        </mesh>

        {/* Right Page (Intervention Architecture & 4-Phase Pacing) */}
        <mesh position={[0.18, 0, 0]} rotation={[-0.01, -0.03, 0]} receiveShadow>
          <boxGeometry args={[0.34, 0.008, 0.48]} />
          <meshStandardMaterial color="#f6f3eb" roughness={0.85} />
        </mesh>

        {/* Binder Brass Spine Rings */}
        {[-0.16, -0.06, 0.06, 0.16].map((zOffset, i) => (
          <mesh key={i} position={[0, 0.012, zOffset]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.004, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#c4a56a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}

        {/* Ribbon Marker in Crimson Silk */}
        <mesh position={[0.08, 0.006, 0.2]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.018, 0.002, 0.28]} />
          <meshStandardMaterial color="#8b2626" roughness={0.5} />
        </mesh>

        {/* Brass Reading Ruler / Metric Gauge */}
        <mesh position={[-0.18, 0.01, -0.12]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.26, 0.004, 0.025]} />
          <meshStandardMaterial color="#d4b47a" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Lesson Plan Dossier Folder & Formative Assessment Stack         */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0.7, 0.51, 0.05]} rotation={[0, -0.15, 0]}>
        {/* Manila Practicum Portfolio Folder */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.025, 0.42]} />
          <meshStandardMaterial color="#cfb384" roughness={0.75} />
        </mesh>

        {/* Label Tab on Folder */}
        <mesh position={[0.24, 0.014, -0.14]}>
          <boxGeometry args={[0.08, 0.002, 0.09]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Emerging Lesson Plan Sheets (Lesson Plan No. 6 Blueprint) */}
        <mesh position={[-0.04, 0.018, 0.02]} rotation={[0, 0.05, 0]}>
          <boxGeometry args={[0.48, 0.006, 0.36]} />
          <meshStandardMaterial color="#faf8f3" roughness={0.8} />
        </mesh>

        {/* Stack of Tiered Diagnostic Exit Slips */}
        <mesh position={[0.08, 0.026, 0.06]} rotation={[0, -0.08, 0]}>
          <boxGeometry args={[0.22, 0.012, 0.15]} />
          <meshStandardMaterial color="#f0ede2" roughness={0.85} />
        </mesh>

        {/* Brass Paperclip binding the exit slips */}
        <mesh position={[0.08, 0.035, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.012, 0.002, 8, 16]} />
          <meshStandardMaterial color="#c4a56a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Desk Accessories: Brass Reading Loupe & Diagnostic Ballot Box   */}
      {/* ------------------------------------------------------------------ */}
      <group position={[1.4, 0.51, -0.3]}>
        {/* Slotted Wooden Diagnostic Feedback Ballot Box */}
        <mesh position={[0, 0.09, 0]} castShadow>
          <boxGeometry args={[0.28, 0.18, 0.22]} />
          <meshStandardMaterial color="#3a2a1d" roughness={0.65} />
        </mesh>
        {/* Ballot Slot at Top */}
        <mesh position={[0, 0.182, 0]}>
          <boxGeometry args={[0.14, 0.002, 0.018]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Brass Label Plate: "STUDENT INQUIRY EXIT CHECKS" */}
        <mesh position={[0, 0.09, 0.112]}>
          <boxGeometry args={[0.18, 0.04, 0.004]} />
          <meshStandardMaterial color="#d4b47a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Vintage Brass Magnifying Glass / Loupe */}
      <group position={[-1.3, 0.495, 0.25]} rotation={[0.08, 0.4, 0.02]}>
        {/* Lens Rim */}
        <mesh castShadow>
          <torusGeometry args={[0.065, 0.008, 16, 32]} />
          <meshStandardMaterial color="#c8a86b" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Optical Glass */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.003, 32]} />
          <meshPhysicalMaterial
            transmission={0.9}
            opacity={1}
            transparent
            roughness={0.05}
            ior={1.5}
            color="#ffffff"
          />
        </mesh>
        {/* Turned Rosewood Handle */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.012, 0.01, 0.12, 16]} />
          <meshStandardMaterial color="#301f16" roughness={0.5} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Desk Task Lamp (Articulated Brass Study Lamp)                   */}
      {/* ------------------------------------------------------------------ */}
      <group position={[1.45, 0.485, 0.55]}>
        {/* Heavy Circular Base */}
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.03, 24]} />
          <meshStandardMaterial color="#b38f4d" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Lower Arm */}
        <mesh position={[-0.04, 0.18, -0.06]} rotation={[0.25, 0, 0.15]}>
          <cylinderGeometry args={[0.008, 0.008, 0.35, 12]} />
          <meshStandardMaterial color="#b38f4d" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Arm Joint Elbow */}
        <mesh position={[-0.08, 0.34, -0.12]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#7a5f2e" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[-0.15, 0.42, -0.22]} rotation={[-0.35, 0, -0.25]}>
          <cylinderGeometry args={[0.007, 0.007, 0.28, 12]} />
          <meshStandardMaterial color="#b38f4d" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Conical Lamp Shade */}
        <mesh position={[-0.24, 0.49, -0.32]} rotation={[0.6, 0.4, -0.3]} castShadow>
          <coneGeometry args={[0.09, 0.14, 24, 1, true]} />
          <meshStandardMaterial color="#223035" roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Warm Bulb Emissive Core */}
        <mesh position={[-0.24, 0.48, -0.32]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color="#ffe3ba" emissive="#ffc670" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 7. The Academic Evidence Wall / Inquiry Board Behind the Desk      */}
      {/* ------------------------------------------------------------------ */}
      <group ref={boardRef} position={[0, 1.82, -0.85]}>
        {/* Dark Oak Archival Frame */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.24, 1.64, 0.05]} />
          <meshStandardMaterial color="#1a1410" roughness={0.65} />
        </mesh>

        {/* High-Grade Warm Linen / Cork Evidence Surface */}
        <mesh position={[0, 0, 0.026]} receiveShadow>
          <boxGeometry args={[3.12, 1.52, 0.008]} />
          <meshStandardMaterial color="#c2aa84" roughness={0.9} />
        </mesh>

        {/* Board Top Header Plate: "CLASSROOM ACTION RESEARCH · INQUIRY EVIDENCE WALL" */}
        <mesh position={[0, 0.68, 0.035]}>
          <boxGeometry args={[1.8, 0.06, 0.004]} />
          <meshStandardMaterial color="#23201c" roughness={0.4} />
        </mesh>

        {/* Subtle Connecting Inquiry Thread (Gold Catenary) */}
        <primitive object={new THREE.Line(threadGeometry, new THREE.LineBasicMaterial({ color: 0xd4a853, transparent: true, opacity: 0.65, linewidth: 2 }))} />

        {/* Pinned Artifact Placards (Mapped directly to RESEARCH_STAGES) */}
        {RESEARCH_STAGES.map((stage, idx) => {
          // Calculate grid placement on the corkboard
          const positions: [number, number, number][] = [
            [-1.1, 0.35, 0.04], // 01 Problem Statement
            [-0.35, 0.35, 0.04], // 02 Observation & Wait-Time
            [0.65, 0.45, 0.04], // 03 Pedagogical Continuum
            [-0.75, -0.3, 0.04], // 04 40-Minute Lesson Architecture
            [0.25, -0.3, 0.04], // 05 Assessment Check Matrix
            [1.05, -0.25, 0.04], // 06 Reflective Synthesis & Next Steps
          ];
          const pos = positions[idx] || [0, 0, 0.04];
          const isSelected = stage.id === activeStageId;
          const isHovered = stage.id === hoveredEvidenceId;

          return (
            <group
              key={stage.id}
              ref={el => {
                if (el) cardRefs.current.set(stage.id, el);
                else cardRefs.current.delete(stage.id);
              }}
              position={pos}
            >
              {/* Evidence Card Paper Placard */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.62, 0.46, 0.006]} />
                <meshStandardMaterial
                  color={isSelected ? '#ffffff' : isHovered ? '#faf7f0' : '#f4eee1'}
                  roughness={0.7}
                />
              </mesh>

              {/* Card Header Strip (Archival Stage Tag) */}
              <mesh position={[0, 0.17, 0.004]}>
                <boxGeometry args={[0.56, 0.045, 0.002]} />
                <meshStandardMaterial
                  color={isSelected ? '#1e3838' : '#334145'}
                  roughness={0.5}
                />
              </mesh>

              {/* Simulated Text Lines on Card */}
              {[-0.04, -0.09, -0.14].map((yOff, lineIdx) => (
                <mesh key={lineIdx} position={[-0.02, yOff, 0.004]}>
                  <boxGeometry args={[lineIdx === 2 ? 0.34 : 0.5, 0.012, 0.001]} />
                  <meshStandardMaterial color="#887e72" roughness={0.9} />
                </mesh>
              ))}

              {/* Brass Push-Pin at Top */}
              <group position={[0, 0.205, 0.01]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.016, 12, 12]} />
                  <meshStandardMaterial color="#d4b47a" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.003, 0.003, 0.02, 8]} />
                  <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>

              {/* Active Selection Glow Ring */}
              {isSelected && (
                <mesh position={[0, 0, -0.004]}>
                  <boxGeometry args={[0.66, 0.5, 0.002]} />
                  <meshBasicMaterial color="#d4a853" transparent opacity={0.5} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 8. Transition Horizon to Certificates (Subtle Architectural Wall)  */}
      {/* ------------------------------------------------------------------ */}
      {/* Softly lit wainscoting and framed certificate shelves previewed at distance */}
      <group position={[3.6, 1.4, -0.6]} visible={!isMobile}>
        {/* Subtle Archival Molding Shelf */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.05, 0.22]} />
          <meshStandardMaterial color="#241e19" roughness={0.6} />
        </mesh>
        {/* Faint Profiles of 4 Academic Certificate Frames (Preview only) */}
        {[-0.7, -0.22, 0.26, 0.74].map((xOff, i) => (
          <mesh key={i} position={[xOff, 0.32, -0.02]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[0.42, 0.54, 0.025]} />
            <meshStandardMaterial color="#1a1c1d" roughness={0.5} metalness={0.2} />
          </mesh>
        ))}
        {/* Subtle Ambient Horizon Wash */}
        <pointLight position={[0, 0.6, 0.4]} color="#ffd285" intensity={0.35} distance={3} />
      </group>
    </group>
  );
}
