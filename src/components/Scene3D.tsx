import React from 'react';
import { Sparkles } from '@react-three/drei';
import { EducatorWorkspace } from './EducatorWorkspace';
import { CategoryFilter } from '../data/teachingData';
import { TlmCategory } from '../data/tlmData';
import { GalleryItem, CertificateItem } from '../data/galleryData';

interface Scene3DProps {
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

export function Scene3D({
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
}: Scene3DProps) {
  return (
    <>
      {/* 3D Educator / Learner Workspace Scene */}
      <EducatorWorkspace
        mouseRef={mouseRef}
        scrollProgress={scrollProgress}
        activeMilestoneIndex={activeMilestoneIndex}
        isMobile={isMobile}
        activeCategory={activeCategory}
        hoveredTeachingItemId={hoveredTeachingItemId}
        activeTlmCategory={activeTlmCategory}
        hoveredTlmProjectId={hoveredTlmProjectId}
        activeStageId={activeStageId}
        hoveredEvidenceId={hoveredEvidenceId}
        activeGalleryItemId={activeGalleryItemId}
        hoveredGalleryItemId={hoveredGalleryItemId}
        onHoverGalleryItem={onHoverGalleryItem}
        onSelectGalleryItem={onSelectGalleryItem}
      />

      {/* Subtle Dust Motes in Sunlit Study Room */}
      <Sparkles
        count={isMobile ? 18 : 36}
        scale={[12, 6, 8]}
        size={2.2}
        speed={0.3}
        opacity={0.35}
        color="#c8b17d"
      />
    </>
  );
}
