import { usePortfolioContent } from '../PortfolioContent';
import { galleryItems, certificates } from '../data/galleryData';
import { EvidenceImage } from './EvidenceImage';
import { Modal } from './Modal';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  GALLERY_CATEGORIES,
  GalleryItem,
  GalleryCategoryFilter,
  CertificateItem,
} from '../data/galleryData';

interface VisualGalleryProps {
  selectedItem?: GalleryItem | CertificateItem | null;
  onSelectItem?: (item: GalleryItem | CertificateItem | null) => void;
  onHoverItem?: (id: string | null) => void;
}

export function VisualGallery({
  selectedItem = null,
  onSelectItem,
  onHoverItem,
}: VisualGalleryProps) {
  const content = usePortfolioContent();
  const GALLERY_ITEMS = useMemo(() => galleryItems(content), [content]);
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryFilter>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | CertificateItem | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sync external selected item into lightbox
  useEffect(() => {
    if (selectedItem) {
      setLightboxItem(selectedItem);
    }
  }, [selectedItem]);

  // Filter gallery items based on selected category
  const filteredItems = useMemo(() => GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  }), [GALLERY_ITEMS, activeCategory]);

  // Lightbox navigation helpers
  const handleOpenLightbox = (item: GalleryItem | CertificateItem) => {
    setLightboxItem(item);
    onSelectItem?.(item);
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxItem(null);
    onSelectItem?.(null);
  }, [onSelectItem]);

  const handleNext = useCallback(() => {
    if (!lightboxItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === lightboxItem.id);
    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % filteredItems.length;
      setLightboxItem(filteredItems[nextIndex]);
      onSelectItem?.(filteredItems[nextIndex]);
    }
  }, [lightboxItem, onSelectItem, filteredItems]);

  const handlePrev = useCallback(() => {
    if (!lightboxItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === lightboxItem.id);
    if (currentIndex >= 0) {
      const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      setLightboxItem(filteredItems[prevIndex]);
      onSelectItem?.(filteredItems[prevIndex]);
    }
  }, [lightboxItem, onSelectItem, filteredItems]);

  // Keyboard accessibility: Escape to close, Left/Right for navigation
  useEffect(() => {
    if (!lightboxItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxItem, handleCloseLightbox, handleNext, handlePrev]);

  return (
    <section id="visual-gallery" className="visual-gallery-section" aria-label="Moments from the Journey Gallery">
      <div className="content-container">
        {/* Section Header */}
        <header className="visual-gallery-header">
          <div className="gallery-meta-bar">
            <span className="gallery-tag">CHAPTER 06 · VISUAL DOCUMENTATION</span>
            <span className="gallery-status-pill">
              Curated Photographic Evidence &amp; Artifacts
            </span>
          </div>

          <h2 className="gallery-title">
            Moments from the <em>Journey</em>
          </h2>
          <p className="gallery-lead">
            Teaching, creating and learning — beyond the lesson plan. Visual records from school practicums, foundational literacy field sessions, research seminars, and educational artifacts.
          </p>

          {/* Lightswind-inspired Clean Category Filter Tabs */}
          <div className="gallery-filter-bar" role="group" aria-label="Filter gallery items by category">
            {GALLERY_CATEGORIES.filter(cat => cat === 'All' || GALLERY_ITEMS.some(item => item.category === cat)).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`gallery-filter-btn ${activeCategory === cat ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="filter-item-count">
                    {GALLERY_ITEMS.filter((i) => i.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Editorial Masonry Grid (DOM Fallback & Complementary Experience) */}
        <div className="gallery-masonry-grid">
          {filteredItems.map((item, idx) => (
            <figure
              key={item.id}
              className={`gallery-card ${item.featured ? 'is-featured' : ''} ${item.aspect}`}
              onMouseEnter={() => onHoverItem?.(item.id)}
              onMouseLeave={() => onHoverItem?.(null)}
              onClick={() => handleOpenLightbox(item)}
              tabIndex={0}
              role="button"
              aria-label={`View ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenLightbox(item);
                }
              }}
            >
              <div className="gallery-img-wrap">
                <EvidenceImage
                  src={item.fallbackImage}
                  alt={item.caption || item.title}
                  className="gallery-thumb-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="gallery-card-hover-overlay">
                  <span className="view-lens-indicator">Examine Document ↗</span>
                </div>
                <span className="gallery-card-category-badge">{item.category}</span>
              </div>

              <figcaption className="gallery-card-caption">
                <div className="caption-top-line">
                  <span className="caption-number">0{idx + 1}</span>
                  {item.date && <span className="caption-date">{item.date}</span>}
                </div>
                <h3 className="caption-title">{item.title}</h3>
                <p className="caption-summary">{item.caption}</p>
                <div className="caption-context-tag">{item.context}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Subtle Transition Horizon to Closing */}
        <div className="gallery-closing-transition">
          <div className="transition-rule-line" />
          <div className="transition-inner">
            <span className="transition-tag">THE ARCHIVAL HORIZON</span>
            <p className="transition-text">
              Lesson plans, classroom materials and reflections from my teacher education.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FULLSCREEN LIGHTBOX VIEWER                                         */}
      {/* ================================================================== */}
      {lightboxItem && (
        <Modal className="gallery-lightbox-backdrop" aria-labelledby="lightbox-title" onClose={handleCloseLightbox}>
          <div
            ref={lightboxRef}
            className="gallery-lightbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              className="lightbox-close-btn"
              onClick={handleCloseLightbox}
              aria-label="Close visual viewer"
            >
              ✕
            </button>

            {/* Navigation Previous */}
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={handlePrev}
              aria-label="Previous image" hidden={!GALLERY_ITEMS.some(item => item.id === lightboxItem.id)}
            >
              ‹
            </button>

            {/* Main Visual Display */}
            <div className="lightbox-image-stage">
              <EvidenceImage
                src={lightboxItem.fallbackImage || lightboxItem.image}
                alt={'caption' in lightboxItem ? lightboxItem.caption : lightboxItem.description}
                className="lightbox-main-img"
              />
            </div>

            {/* Navigation Next */}
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={handleNext}
              aria-label="Next image" hidden={!GALLERY_ITEMS.some(item => item.id === lightboxItem.id)}
            >
              ›
            </button>

            {/* Information Footer */}
            <div className="lightbox-info-pane">
              <div className="lightbox-meta-strip">
                <span className="lightbox-category-tag">{lightboxItem.category}</span>
                {'date' in lightboxItem && lightboxItem.date && (
                  <span className="lightbox-date">{lightboxItem.date}</span>
                )}
              </div>

              <h2 id="lightbox-title" className="lightbox-title">
                {lightboxItem.title}
              </h2>

              <p className="lightbox-caption">
                {'caption' in lightboxItem ? lightboxItem.caption : lightboxItem.description}
              </p>

              <div className="lightbox-context-line">
                <strong>Context:</strong>{' '}
                {'context' in lightboxItem ? lightboxItem.context : (lightboxItem as CertificateItem).verifiedContext}
              </div>

              <div className="lightbox-actions-strip">
                <a
                  href={lightboxItem.highResUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-action-btn primary"
                >
                  Open original file ↗
                </a>
                <button
                  type="button"
                  className="lightbox-action-btn secondary"
                  onClick={handleCloseLightbox}
                >
                  Return to Gallery (Esc)
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
