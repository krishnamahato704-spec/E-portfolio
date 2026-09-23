import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CERTIFICATES_DATA, GALLERY_ITEMS, GalleryItem, CertificateItem } from '../data/galleryData';

interface VisualGallery3DProps {
  activeItemId?: string | null;
  hoveredItemId?: string | null;
  onHoverItem?: (id: string | null) => void;
  onSelectItem?: (item: GalleryItem | CertificateItem) => void;
  isMobile: boolean;
  scrollProgress: number;
}

// Subcomponent: Individual 3D Picture Frame in the Visual Gallery
function GalleryPictureFrame({
  item,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  isMobile,
}: {
  item: GalleryItem;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (item: GalleryItem) => void;
  isMobile: boolean;
}) {
  const meshGroupRef = useRef<THREE.Group>(null);
  const [width, height] = item.size3D;

  // Load texture with fallback to local webp
  const texture = useLoader(THREE.TextureLoader, item.fallbackImage);
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  // Smooth floating animation and responsive hover offset
  useFrame((state, delta) => {
    if (!meshGroupRef.current) return;

    // Gentle vertical bobbing based on item id hash
    const idHash = item.id.charCodeAt(item.id.length - 1) * 0.5;
    const hoverFloat = isHovered ? 0.08 : 0;
    const idleFloat = Math.sin(state.clock.elapsedTime * 0.9 + idHash) * 0.025;

    const targetY = item.position3D[1] + hoverFloat + idleFloat;
    const targetZ = item.position3D[2] + (isHovered ? 0.22 : 0);
    const targetScale = isHovered ? 1.05 : isSelected ? 1.03 : 1.0;

    meshGroupRef.current.position.y = THREE.MathUtils.damp(meshGroupRef.current.position.y, targetY, 4, delta);
    meshGroupRef.current.position.z = THREE.MathUtils.damp(meshGroupRef.current.position.z, targetZ, 4, delta);
    meshGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
  });

  return (
    <group
      ref={meshGroupRef}
      position={[item.position3D[0], item.position3D[1], item.position3D[2]]}
      rotation={[item.rotation3D[0], item.rotation3D[1], item.rotation3D[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(item.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
    >
      {/* Frame Shadow Backing */}
      <mesh position={[0, -0.01, -0.04]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshBasicMaterial color="#050708" transparent opacity={0.5} />
      </mesh>

      {/* Frame Moulding (Warm natural oak / walnut) */}
      <mesh position={[0, 0, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.03]} />
        <meshStandardMaterial
          color={isHovered ? '#4d3926' : '#2c221a'}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Archival Inner Passepartout (Linen / Museum Board) */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width + 0.03, height + 0.03]} />
        <meshStandardMaterial color="#f0ece1" roughness={0.9} />
      </mesh>

      {/* The Photograph / Visual Document Plane */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.5}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* Brass Accent Corner Clasps on Featured Items */}
      {item.featured && (
        <>
          <mesh position={[-(width / 2) - 0.02, (height / 2) + 0.02, 0.005]}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
            <meshStandardMaterial color="#d4a853" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[(width / 2) + 0.02, (height / 2) + 0.02, 0.005]}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
            <meshStandardMaterial color="#d4a853" metalness={0.8} roughness={0.3} />
          </mesh>
        </>
      )}

      {/* Subtle Focus Rim Light when hovered */}
      {isHovered && (
        <pointLight
          position={[0, 0, 0.35]}
          intensity={0.6}
          distance={1.6}
          color="#ffeed1"
        />
      )}
    </group>
  );
}

// Subcomponent: Formal Certificate Frame on the Transition Wall
function CertificateFrame({
  cert,
  isHovered,
  onHover,
  onSelect,
}: {
  cert: CertificateItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (item: CertificateItem) => void;
}) {
  const texture = useLoader(THREE.TextureLoader, cert.fallbackImage);
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  const width = 0.95;
  const height = 1.25;

  return (
    <group
      position={cert.position3D}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(cert.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(cert);
      }}
    >
      {/* Frame (Formal Dark Walnut with Gold Inner Rim) */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.035]} />
        <meshStandardMaterial color="#1a1410" roughness={0.6} />
      </mesh>

      {/* Gold Inner Bevel */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width + 0.02, height + 0.02]} />
        <meshStandardMaterial color="#c29b38" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Certificate Image */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.6} toneMapped={false} />
      </mesh>

      {/* Brass Label Plate Beneath Frame */}
      <mesh position={[0, -(height / 2) - 0.05, 0.002]}>
        <planeGeometry args={[0.36, 0.045]} />
        <meshStandardMaterial color="#d4a853" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function VisualGallery3D({
  activeItemId = null,
  hoveredItemId = null,
  onHoverItem,
  onSelectItem,
  isMobile,
  scrollProgress,
}: VisualGallery3DProps) {
  // Only render with full opacity when user is approaching or in this section (progress >= 0.72)
  const isVisible = scrollProgress > 0.70;

  return (
    <group position={[0, 0, 0]} visible={isVisible}>
      {/* ================================================================== */}
      {/* 1. TRANSITION ARCHITECTURE: FORMAL CERTIFICATES WALL               */}
      {/* ================================================================== */}
      <group position={[13.2, 1.4, -2.6]}>
        {/* Gallery Wall Wainscoting Panel */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[3.8, 2.8]} />
          <meshStandardMaterial color="#171d20" roughness={0.95} />
        </mesh>

        {/* Lower Architectural Dado Rail / Moulding */}
        <mesh position={[0, -1.0, 0.04]}>
          <boxGeometry args={[3.85, 0.06, 0.05]} />
          <meshStandardMaterial color="#222b2e" roughness={0.8} />
        </mesh>

        {/* Upper Picture Hanging Rail (Brass) */}
        <mesh position={[0, 1.25, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 3.85, 12]} />
          <meshStandardMaterial color="#d4a853" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Wall Spotlights for Formal Certificate Wall */}
        <pointLight position={[-0.8, 1.3, 1.1]} intensity={0.85} color="#fedc97" distance={4.5} />
        <pointLight position={[0.8, 1.3, 1.1]} intensity={0.85} color="#fedc97" distance={4.5} />
      </group>

      {/* The 4 Formal Certificates on the Wall */}
      {CERTIFICATES_DATA.map((cert) => (
        <CertificateFrame
          key={cert.id}
          cert={cert}
          isHovered={hoveredItemId === cert.id}
          onHover={(id) => onHoverItem?.(id)}
          onSelect={(item) => onSelectItem?.(item)}
        />
      ))}

      {/* ================================================================== */}
      {/* 2. VISUAL MEMORY GALLERY CORRIDOR: MOMENTS FROM THE JOURNEY        */}
      {/* ================================================================== */}
      {/* Subtle Floating Gallery Overhead Light Track */}
      <mesh position={[18.0, 2.6, -1.9]}>
        <boxGeometry args={[7.2, 0.04, 0.06]} />
        <meshStandardMaterial color="#1f282c" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Soft Gallery Ambient & Accent Spotlights */}
      <ambientLight intensity={0.45} color="#fff6e8" />
      <pointLight position={[15.6, 2.3, 0.8]} intensity={1.1} color="#ffeed1" distance={5} />
      <pointLight position={[18.2, 2.3, 0.8]} intensity={1.2} color="#ffe8c2" distance={5} />
      <pointLight position={[20.5, 2.2, 0.7]} intensity={0.9} color="#ffe2b5" distance={4.8} />

      {/* Gallery Plinth / Birch Display Shelf Runner along the bottom */}
      <mesh position={[18.0, 0.2, -2.1]} receiveShadow>
        <boxGeometry args={[7.2, 0.08, 0.8]} />
        <meshStandardMaterial color="#1a1410" roughness={0.7} />
      </mesh>

      {/* The Floating Gallery Picture Frames */}
      {GALLERY_ITEMS.map((item) => (
        <GalleryPictureFrame
          key={item.id}
          item={item}
          isHovered={hoveredItemId === item.id}
          isSelected={activeItemId === item.id}
          onHover={(id) => onHoverItem?.(id)}
          onSelect={(selected) => onSelectItem?.(selected)}
          isMobile={isMobile}
        />
      ))}

      {/* ================================================================== */}
      {/* 3. CALM SPATIAL HORIZON (TRANSITION OUT TOWARD CLOSING)            */}
      {/* ================================================================== */}
      <group position={[23.2, 1.2, -2.8]}>
        {/* Soft Warm Luminescent Boundary Panel */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 3.0]} />
          <meshStandardMaterial color="#12181b" roughness={0.95} />
        </mesh>
        <pointLight position={[0.2, 0.8, 1.2]} intensity={0.5} color="#e5c388" distance={4.0} />
      </group>
    </group>
  );
}
