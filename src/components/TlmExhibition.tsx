import { EvidenceImage } from './EvidenceImage';
import { Modal } from './Modal';
import React, { useState, useEffect } from 'react';
import {
  TLM_PROJECTS,
  TLM_CATEGORIES,
  TlmCategory,
  TlmProject,
} from '../data/tlmData';

interface TlmExhibitionProps {
  activeCategory: TlmCategory;
  onSelectCategory: (cat: TlmCategory) => void;
  onHoverProject: (id: string | null) => void;
}

export function TlmExhibition({
  activeCategory,
  onSelectCategory,
  onHoverProject,
}: TlmExhibitionProps) {
  const [selectedProject, setSelectedProject] = useState<TlmProject | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'application' | 'reflection'>('overview');

  // Filter projects based on selected category or subject
  const filteredProjects = TLM_PROJECTS.filter((proj) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Visual TLM' || activeCategory === 'Working Models / Tactile' || activeCategory === 'Classroom Activities') {
      return proj.category === activeCategory;
    }
    if (activeCategory === 'Social Science' || activeCategory === 'English') {
      return proj.subject.includes(activeCategory);
    }
    return true;
  });

  const featuredProject = TLM_PROJECTS.find((p) => p.isFeatured) || TLM_PROJECTS[0];



  return (
    <section id="tlm-exhibition" className="tlm-section">
      <div className="content-container">
        {/* Section Header */}
        <header className="tlm-header">
          <div className="chapter-badge-wrap">
            <span className="chapter-eyebrow">CHAPTER 04 · LEARNING LAB &amp; TLM EXHIBITION</span>
            <span className="curated-pill">Interactive 3D Exhibition</span>
          </div>

          <h2 className="tlm-main-title">
            Teaching-Learning Materials <em>&amp; Classroom Projects.</em>
          </h2>

          <p className="tlm-lead-text">
            Tangible pedagogical tools designed for active student inquiry. Explore physical manipulatives, visual source cards, structured chalkboard matrices, and multi-tier diagnostic prompt systems created for secondary and community classrooms.
          </p>

          {/* Interactive Category / Subject Filters */}
          <div className="tlm-filter-bar" role="group" aria-label="Filter TLM and classroom projects">
            {TLM_CATEGORIES.map((category) => {
              const count =
                category === 'All'
                  ? TLM_PROJECTS.length
                  : TLM_PROJECTS.filter((p) => {
                      if (category === 'Visual TLM' || category === 'Working Models / Tactile' || category === 'Classroom Activities') {
                        return p.category === category;
                      }
                      return p.subject.includes(category);
                    }).length;

              const isSelected = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"

                  aria-pressed={isSelected}
                  onClick={() => onSelectCategory(category)}
                  className={`filter-pill ${isSelected ? 'active' : ''}`}
                >
                  <span className="pill-name">{category}</span>
                  <span className="pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Featured TLM Exhibition Showcase Banner */}
        {featuredProject && (
          <div className="featured-tlm-card">
            <div className="featured-tlm-media">
              <div className="media-frame">
                <EvidenceImage
                  src={featuredProject.image}
                  alt={featuredProject.title}
                  className="featured-tlm-img"
                  loading="lazy"
                />
                <div className="media-overlay-tag">
                  <span>FEATURED INQUIRY TLM</span>
                </div>
              </div>
            </div>

            <div className="featured-tlm-details">
              <div className="meta-badge-row">
                <span className="badge-category">{featuredProject.category}</span>
                <span className="badge-meta">{featuredProject.subject}</span>
                {featuredProject.grade && (
                  <span className="badge-meta">{featuredProject.grade}</span>
                )}
                <span className="badge-meta">{featuredProject.institution}</span>
              </div>

              <h3 className="featured-tlm-title">{featuredProject.title}</h3>

              <p className="featured-tlm-purpose">
                <strong>Pedagogical Purpose:</strong> {featuredProject.purpose}
              </p>

              <div className="featured-tlm-specs-grid">
                <div className="spec-block">
                  <span className="spec-label">Instructional Mechanism</span>
                  <p className="spec-value">{featuredProject.howItWorks}</p>
                </div>
                <div className="spec-block">
                  <span className="spec-label">Classroom Routine</span>
                  <p className="spec-value">{featuredProject.classroomApplication}</p>
                </div>
              </div>

              <div className="featured-tlm-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(featuredProject);
                    setActiveTab('overview');
                  }}
                  className="btn-primary"
                >
                  <span>Explore TLM Case Study</span>
                  <span aria-hidden="true">→</span>
                </button>

                {featuredProject.documentUrl && (
                  <a
                    href={featuredProject.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <span>{featuredProject.documentLabel || 'View Integrated Resource'}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exhibition Gallery Grid of TLM Stations */}
        <div className="tlm-gallery-grid">
          {filteredProjects.map((project) => {
            return (
              <article
                key={project.id}
                className="tlm-project-card" role="button"
                tabIndex={0}
                onMouseEnter={() => onHoverProject(project.id)}
                onMouseLeave={() => onHoverProject(null)}
                onFocus={() => onHoverProject(project.id)}
                onBlur={() => onHoverProject(null)}
                onClick={() => {
                  setSelectedProject(project);
                  setActiveTab('overview');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProject(project);
                    setActiveTab('overview');
                  }
                }}
              >
                {/* Visual Thumbnail Frame */}
                <div className="card-thumb-container">
                  <EvidenceImage
                    src={project.image}
                    alt={project.title}
                    className="card-thumb-img"
                    loading="lazy"
                  />
                  <span className="card-category-ribbon">{project.category}</span>
                </div>

                {/* Card Content Info */}
                <div className="card-body">
                  <div className="card-meta-tags">
                    <span className="meta-subject">{project.subject}</span>
                    {project.grade && <span className="meta-grade">{project.grade}</span>}
                    <span className="meta-date">{project.date}</span>
                  </div>

                  <h3 className="card-title">{project.title}</h3>

                  <p className="card-purpose-excerpt">{project.purpose}</p>

                  <div className="card-materials-preview">
                    <span className="materials-icon" aria-hidden="true">⚙</span>
                    <span className="materials-summary">
                      {project.materials.slice(0, 2).join(' · ')}
                    </span>
                  </div>

                  <div className="card-tags-list">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-chip">{tag}</span>
                    ))}
                  </div>

                  <div className="card-action-link">
                    <span>Examine Project Station</span>
                    <span aria-hidden="true" className="action-arrow">→</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Full Project Detail Modal / Lightbox                                 */}
      {/* -------------------------------------------------------------------- */}
      {selectedProject && (
        <Modal className="modal-backdrop" aria-labelledby="tlm-modal-title" onClose={() => setSelectedProject(null)}>
          <div
            className="modal-container tlm-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="modal-header">
              <div className="modal-header-meta">
                <span className="modal-category-tag">{selectedProject.category}</span>
                <span className="modal-subject-tag">{selectedProject.subject}</span>
                {selectedProject.grade && (
                  <span className="modal-grade-tag">{selectedProject.grade}</span>
                )}
                <span className="modal-date-tag">{selectedProject.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="modal-close-btn"
                aria-label="Close project modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-scrollable">
              {/* Title & Origin */}
              <h2 id="tlm-modal-title" className="modal-project-title">
                {selectedProject.title}
              </h2>
              <p className="modal-institution-line">
                Developed for: <strong>{selectedProject.institution}</strong> · Topic: <em>{selectedProject.topic}</em>
              </p>

              {/* Large High-Res Image Display */}
              <div className="modal-image-showcase">
                <EvidenceImage
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="modal-showcase-img"
                />
                <div className="image-caption-bar">
                  <span>Verified Classroom Artifact Preview · {selectedProject.institution}</span>
                </div>
              </div>

              {/* Tab Navigation for Deep Pedagogical Inspection */}
              <div className="modal-tabs-nav" role="group">
                <button
                  type="button"

                  aria-pressed={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                >
                  Purpose &amp; Mechanism
                </button>
                <button
                  type="button"

                  aria-pressed={activeTab === 'materials'}
                  onClick={() => setActiveTab('materials')}
                  className={`modal-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                >
                  Materials &amp; Components
                </button>
                <button
                  type="button"

                  aria-pressed={activeTab === 'application'}
                  onClick={() => setActiveTab('application')}
                  className={`modal-tab-btn ${activeTab === 'application' ? 'active' : ''}`}
                >
                  Classroom Use &amp; Student Task
                </button>
                <button
                  type="button"

                  aria-pressed={activeTab === 'reflection'}
                  onClick={() => setActiveTab('reflection')}
                  className={`modal-tab-btn ${activeTab === 'reflection' ? 'active' : ''}`}
                >
                  Pedagogical Reflection
                </button>
              </div>

              {/* Tab Content 1: Overview & Purpose */}
              {activeTab === 'overview' && (
                <div className="tab-pane">
                  <div className="pane-section">
                    <h4 className="pane-title">Pedagogical Purpose</h4>
                    <p className="pane-text">{selectedProject.purpose}</p>
                  </div>

                  <div className="pane-section">
                    <h4 className="pane-title">Instructional Mechanism (How It Works)</h4>
                    <p className="pane-text">{selectedProject.howItWorks}</p>
                  </div>

                  <div className="pane-section">
                    <h4 className="pane-title">Target Concept &amp; Topic</h4>
                    <p className="pane-text">{selectedProject.topic}</p>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Materials & Construction */}
              {activeTab === 'materials' && (
                <div className="tab-pane">
                  <h4 className="pane-title">Materials &amp; Physical Construction</h4>
                  <p className="pane-subtitle">
                    Tangible classroom components utilized during instructional implementation:
                  </p>
                  <ul className="materials-checklist">
                    {selectedProject.materials.map((mat, mIdx) => (
                      <li key={mIdx} className="materials-item">
                        <span className="bullet-mark" aria-hidden="true">✔</span>
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab Content 3: Classroom Application & Student Task */}
              {activeTab === 'application' && (
                <div className="tab-pane">
                  <div className="pane-section">
                    <h4 className="pane-title">How It Can Be Used in Class</h4>
                    <p className="pane-text">{selectedProject.classroomApplication}</p>
                  </div>

                  <div className="pane-section highlight-box">
                    <h4 className="pane-title">Assigned Student Task / Activity Prompt</h4>
                    <p className="pane-text task-callout">{selectedProject.studentTask}</p>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Reflection */}
              {activeTab === 'reflection' && (
                <div className="tab-pane">
                  <div className="reflection-block">
                    <span className="reflection-quote-icon" aria-hidden="true">“</span>
                    <p className="reflection-quote">{selectedProject.reflection}</p>
                    <span className="reflection-signature">
                      — Krishna Mahato · Reflective Teaching Notes
                    </span>
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="modal-footer-actions">
                {selectedProject.documentUrl && (
                  <a
                    href={selectedProject.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <span>{selectedProject.documentLabel || 'Open Supporting Document (PDF)'}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="btn-secondary"
                >
                  Close Exhibition Panel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
