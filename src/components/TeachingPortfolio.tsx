import { DocumentLibrary } from './DocumentLibrary';
import { EvidenceImage } from './EvidenceImage';
import { Modal } from './Modal';
import { useState, useMemo } from 'react';
import {
  TEACHING_ITEMS,
  TEACHING_CATEGORIES,
  TeachingItem,
  CategoryFilter,
} from '../data/teachingData';

interface TeachingPortfolioProps {
  activeCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  onHoverItem: (id: string | null) => void;
}

export function TeachingPortfolio({
  activeCategory,
  onSelectCategory,
  onHoverItem,
}: TeachingPortfolioProps) {
  const [selectedItem, setSelectedItem] = useState<TeachingItem | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Filter items based on category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return TEACHING_ITEMS;
    return TEACHING_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // Featured item: Democracy Lesson Plan No. 6
  const featuredItem = TEACHING_ITEMS.find((item) => item.id === 'democracy-lesson-plan');

  return (
    <section id="teaching" className="teaching-portfolio-section">
      <div className="content-container">
        {/* Section Chapter Header */}
        <div className="portfolio-chapter-marker">
          <span className="chapter-badge">CHAPTER 02</span>
          <span className="chapter-divider" aria-hidden="true" />
          <span className="chapter-label">Teaching Studio &amp; Resource Gallery</span>
        </div>

        <div className="portfolio-editorial-header">
          <h2 className="portfolio-headline">
            Pedagogy in Practice.<br />
            <em>Evidence of classroom inquiry.</em>
          </h2>
          <p className="portfolio-lead">
            An interactive educational exhibition of verified lesson blueprints, supervised school practicum teaching,
            visual teaching-learning materials (TLM), and diagnostic assessment frameworks.
          </p>
        </div>

        {/* 1. FEATURED TEACHING WORK SHOWCASE */}
        {featuredItem && (
          <div className="featured-work-banner">
            <div className="featured-grid">
              {/* Visual Preview Frame */}
              <div className="featured-media-col">
                <div className="featured-image-frame">
                  <EvidenceImage
                    src={featuredItem.thumbnail}
                    alt={featuredItem.title}
                    className="featured-image"
                    loading="lazy"
                  />
                  <div className="featured-image-tag">Featured Practicum Blueprint</div>
                  <div className="featured-meta-strip">
                    <span>Class IX-B · Social Science</span>
                    <span className="featured-date-badge">25 July 2026 · 40 Min</span>
                  </div>
                </div>
              </div>

              {/* Copy & Actions Column */}
              <div className="featured-copy-col">
                <div className="featured-top-meta">
                  <span className="featured-category-tag">Core Teaching Evidence</span>
                  <span className="meta-dot">·</span>
                  <span className="featured-pages-tag">PDF · 6 PAGES</span>
                </div>

                <h3 className="featured-title">{featuredItem.title}</h3>
                <p className="featured-desc">
                  {featuredItem.description || featuredItem.caseStudy?.overview || featuredItem.context}
                </p>

                <div className="featured-points-grid">
                  {featuredItem.evidencePoints.slice(0, 4).map((pt, idx) => (
                    <div key={idx} className="featured-point-item">
                      <span className="point-bullet" aria-hidden="true">✦</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="featured-actions-row">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(featuredItem);
                      setActiveStageIndex(0);
                    }}
                    className="btn-primary"
                  >
                    <span>Explore Lesson Case Study</span>
                    <span aria-hidden="true">→</span>
                  </button>

                  {featuredItem.documentUrl && (
                    <a
                      href={featuredItem.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      <span>Read Original Plan PDF (6 Pages)</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CATEGORY NAVIGATION TABS */}
        <div className="portfolio-filter-bar">
          <div className="portfolio-filter-buttons" role="group" aria-label="Filter teaching categories">
            {TEACHING_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              const count =
                cat === 'All'
                  ? TEACHING_ITEMS.length
                  : TEACHING_ITEMS.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"

                  aria-pressed={isSelected}
                  onClick={() => onSelectCategory(cat)}
                  className={`filter-btn ${isSelected ? 'is-active' : ''}`}
                >
                  <span className="filter-label">{cat}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="portfolio-counter">
            Showing {filteredItems.length} documented artifacts
          </div>
        </div>

        {/* 3. TEACHING PORTFOLIO MASONRY/GRID CARDS */}
        <div className="portfolio-cards-grid">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              onMouseEnter={() => onHoverItem(item.id)}
              onMouseLeave={() => onHoverItem(null)}
              className="teaching-portfolio-card"
            >
              <div className="card-top">
                <div className="card-header-bar">
                  <span className="card-category-badge">{item.category}</span>
                  <span className="card-index-num">#{String(index + 1).padStart(2, '0')}</span>
                </div>

                {/* Thumbnail Preview */}
                {item.thumbnail && (
                  <div className="card-thumbnail-wrap">
                    <EvidenceImage
                      src={item.thumbnail}
                      alt={item.title}
                      className="card-thumb-img"
                      loading="lazy"
                    />
                    <div className="card-thumb-overlay" />
                    {item.grade && <span className="card-grade-pill">{item.grade}</span>}
                    {item.duration && <span className="card-duration-pill">{item.duration}</span>}
                  </div>
                )}

                <h3 className="card-item-title">{item.title}</h3>

                <div className="card-meta-line">
                  <span>{item.institution}</span>
                  {item.date && (
                    <>
                      <span className="meta-sep">·</span>
                      <time>{item.date}</time>
                    </>
                  )}
                </div>

                <p className="card-item-desc">
                  {item.description || item.caseStudy?.overview || item.context}
                </p>

                {/* Tags */}
                <div className="card-tags-row">
                  {item.tags.slice(0, 3).map((tag, tIdx) => (
                    <span key={tIdx} className="card-tag-pill">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="card-bottom-bar">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveStageIndex(0);
                  }}
                  className="card-explore-btn"
                >
                  <span>Examine Case Study</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </button>

                {item.documentUrl && (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-doc-link"
                    title={item.documentLabel || 'View Document'}
                  >
                    <span>Document ↗</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* 4. INTERACTIVE CASE STUDY MODAL */}
        {selectedItem && (
          <Modal className="case-study-modal-backdrop" aria-labelledby="case-study-title" onClose={() => setSelectedItem(null)}>
            <div
              className="case-study-modal-window"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close Case Study"
                className="modal-close-btn"
              >
                ×
              </button>

              {/* Header */}
              <div className="modal-header">
                <div className="modal-meta-bar">
                  <span className="modal-cat-tag">{selectedItem.category}</span>
                  <span className="meta-sep">·</span>
                  <span className="modal-inst">{selectedItem.institution}</span>
                  {selectedItem.date && (
                    <>
                      <span className="meta-sep">·</span>
                      <span className="modal-date">{selectedItem.date}</span>
                    </>
                  )}
                </div>
                <h2 id="case-study-title" className="modal-title">
                  {selectedItem.title}
                </h2>
                <p className="modal-topic">{selectedItem.topic}</p>
              </div>

              {/* Truth & Transparency Notice */}
              {selectedItem.planningEvidenceNote && (
                <div className="modal-truth-notice">
                  <span className="truth-icon" aria-hidden="true">ℹ</span>
                  <p>
                    <strong>Archival Verification:</strong> {selectedItem.planningEvidenceNote}
                  </p>
                </div>
              )}

              {/* Document Banner */}
              {selectedItem.documentUrl && (
                <div className="modal-document-bar">
                  <div className="doc-info-group">
                    <div className="doc-icon-box">PDF</div>
                    <div>
                      <h4 className="doc-title">
                        {selectedItem.documentLabel || 'Primary Document Available'}
                      </h4>
                      <p className="doc-sub">Original verified academic and lesson record</p>
                    </div>
                  </div>
                  <a
                    href={selectedItem.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary doc-action-btn"
                  >
                    <span>Open Document ↗</span>
                  </a>
                </div>
              )}

              {/* Stages Navigation (if applicable) */}
              {selectedItem.caseStudy?.stages && selectedItem.caseStudy.stages.length > 0 && (
                <div className="modal-stages-section">
                  <h4 className="modal-subheading">Six-Stage Instructional Architecture</h4>

                  <div className="stage-pills-nav">
                    {selectedItem.caseStudy.stages.map((stg, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setActiveStageIndex(sIdx)}
                        className={`stage-nav-pill ${activeStageIndex === sIdx ? 'is-active' : ''}`}
                      >
                        {stg.step}: {stg.title.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {selectedItem.caseStudy.stages[activeStageIndex] && (
                    <div className="active-stage-card">
                      <div className="active-stage-header">
                        <span className="stage-step-tag">
                          {selectedItem.caseStudy.stages[activeStageIndex].step}
                        </span>
                        <span className="stage-page-tag">
                          {selectedItem.caseStudy.stages[activeStageIndex].pages}
                        </span>
                      </div>
                      <h5 className="active-stage-title">
                        {selectedItem.caseStudy.stages[activeStageIndex].title}
                      </h5>
                      <p className="active-stage-content">
                        {selectedItem.caseStudy.stages[activeStageIndex].content}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Case Study Details */}
              {selectedItem.caseStudy && (
                <div className="modal-body-content">
                  <div className="content-block">
                    <h4 className="modal-subheading">Case Study Overview</h4>
                    <p className="modal-prose">{selectedItem.caseStudy.overview}</p>
                  </div>

                  {selectedItem.caseStudy.objectives && (
                    <div className="content-block">
                      <h4 className="modal-subheading">Pedagogical Objectives</h4>
                      <ul className="modal-objectives-list">
                        {selectedItem.caseStudy.objectives.map((obj, oIdx) => (
                          <li key={oIdx}>
                            <span className="bullet-accent">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedItem.caseStudy.assessmentChecks && (
                    <div className="content-block">
                      <h4 className="modal-subheading">Formative Assessment Progression</h4>
                      <div className="assessment-checks-grid">
                        {selectedItem.caseStudy.assessmentChecks.map((chk, cIdx) => (
                          <div key={cIdx} className="assessment-check-card">
                            <span className="check-tier-tag">{chk.tier}</span>
                            <p className="check-desc">{chk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="content-block">
                    <h4 className="modal-subheading">Teacher Reflection &amp; Next Steps</h4>
                    <blockquote className="modal-quote">
                      "{selectedItem.caseStudy.reflection}"
                    </blockquote>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="modal-footer-bar">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="btn-secondary modal-close-action"
                >
                  Close Case Study
                </button>
              </div>
            </div>
          </Modal>
        )}
        <DocumentLibrary />
      </div>
    </section>
  );
}
