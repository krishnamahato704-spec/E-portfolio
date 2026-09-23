import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GALLERY_ITEMS,
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
  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

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
    const currentIndex = GALLERY_ITEMS.findIndex((i) => i.id === lightboxItem.id);
    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % GALLERY_ITEMS.length;
      setLightboxItem(GALLERY_ITEMS[nextIndex]);
      onSelectItem?.(GALLERY_ITEMS[nextIndex]);
    }
  }, [lightboxItem, onSelectItem]);

  const handlePrev = useCallback(() => {
    if (!lightboxItem) return;
    const currentIndex = GALLERY_ITEMS.findIndex((i) => i.id === lightboxItem.id);
    if (currentIndex >= 0) {
      const prevIndex = (currentIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
      setLightboxItem(GALLERY_ITEMS[prevIndex]);
      onSelectItem?.(GALLERY_ITEMS[prevIndex]);
    }
  }, [lightboxItem, onSelectItem]);

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
    // Auto focus close button for accessibility
    closeBtnRef.current?.focus();

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
            {GALLERY_CATEGORIES.map((cat) => (
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
                <img
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
              Every lesson plan, artifact, and recorded inquiry forms an enduring pedagogical foundation.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FULLSCREEN LIGHTBOX VIEWER                                         */}
      {/* ================================================================== */}
      {lightboxItem && (
        <div
          className="gallery-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onClick={handleCloseLightbox}
        >
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
              aria-label="Previous image"
            >
              ‹
            </button>

            {/* Main Visual Display */}
            <div className="lightbox-image-stage">
              <img
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
              aria-label="Next image"
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
                <strong>Archival Source Context:</strong>{' '}
                {'context' in lightboxItem ? lightboxItem.context : (lightboxItem as CertificateItem).verifiedContext}
              </div>

              <div className="lightbox-actions-strip">
                <a
                  href={lightboxItem.highResUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-action-btn primary"
                >
                  View Original High-Resolution Archive ↗
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
        </div>
      )}
    </section>
  );
}
