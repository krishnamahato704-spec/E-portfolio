import React, { useState } from 'react';
import {
  RESEARCH_METADATA,
  RESEARCH_STAGES,
  OBSERVATION_MATRIX,
  WEEKLY_RESEARCH_TIMELINE,
  ResearchStage,
} from '../data/actionResearchData';

interface ActionResearchProps {
  activeStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onHoverEvidence: (evidenceId: string | null) => void;
}

export function ActionResearch({
  activeStageId,
  onSelectStage,
  onHoverEvidence,
}: ActionResearchProps) {
  const [selectedCaseStage, setSelectedCaseStage] = useState<ResearchStage | null>(null);
  const [activeTab, setActiveTab] = useState<'stages' | 'matrix' | 'timeline' | 'reading-mode'>('stages');
  const [activeTimelinePhase, setActiveTimelinePhase] = useState<number>(3); // Default to Phase 4 (July 2026)

  const currentStage = RESEARCH_STAGES.find(s => s.id === activeStageId) || RESEARCH_STAGES[0];

  return (
    <section id="action-research" className="action-research-section" aria-labelledby="research-heading">
      <div className="content-container">
        {/* Section Academic Header */}
        <header className="research-header">
          <div className="research-meta-bar">
            <span className="research-tag">CHAPTER 04 · ACTION RESEARCH &amp; CLASSROOM INQUIRY</span>
            <span className="research-status-pill">
              <span className="status-live-dot" aria-hidden="true"></span>
              Supervised Practicum Investigation
            </span>
          </div>

          <h2 id="research-heading" className="research-title">
            From Rote Recall to<br />
            <em>Structured Classroom Inquiry.</em>
          </h2>

          <p className="research-lead">
            An action research inquiry investigating how diagnostic questioning sequences, multi-modal concept diagrams,
            and embedded three-tier formative checks transform student engagement in secondary Social Science.
          </p>

          <div className="research-credentials-strip">
            <span className="cred-item">
              <strong>Investigator:</strong> {RESEARCH_METADATA.investigator}
            </span>
            <span className="cred-sep" aria-hidden="true">·</span>
            <span className="cred-item">
              <strong>Practicum:</strong> Panchsheel Balak Inter-College (Classes 6–9)
            </span>
            <span className="cred-sep" aria-hidden="true">·</span>
            <span className="cred-item">
              <strong>Observation:</strong> Amity International School (Classes 6–12)
            </span>
            <span className="cred-sep" aria-hidden="true">·</span>
            <span className="cred-item">
              <strong>Framework:</strong> NEP 2020 &amp; Vygotskian Scaffolding
            </span>
          </div>

          {/* Research Stage Progress Indicator Bar */}
          <div className="research-stage-indicator-wrap" aria-label="Research inquiry progression">
            <span className="indicator-label">INQUIRY STAGES:</span>
            <div className="research-stage-tracker" role="tablist">
              {RESEARCH_STAGES.map((stage) => {
                const isActive = stage.id === (activeStageId || 'stage-problem');
                return (
                  <button
                    key={stage.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`stage-tracker-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => onSelectStage(stage.id)}
                    onMouseEnter={() => onHoverEvidence(stage.id)}
                    onMouseLeave={() => onHoverEvidence(null)}
                  >
                    <span className="tracker-num">{stage.number}</span>
                    <span className="tracker-name">{stage.eyebrow.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Navigation Tabs for Analytical Views */}
        <div className="research-tabs-bar" role="tablist" aria-label="Action research exploration views">
          <button
            role="tab"
            aria-selected={activeTab === 'stages'}
            className={`research-tab-btn ${activeTab === 'stages' ? 'active' : ''}`}
            onClick={() => setActiveTab('stages')}
          >
            01. Inquiry Stages &amp; Evidence Wall
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'matrix'}
            className={`research-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            02. Observation &amp; Intervention Matrix
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'timeline'}
            className={`research-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            03. Practicum Timeline &amp; Phases
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'reading-mode'}
            className={`research-tab-btn ${activeTab === 'reading-mode' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading-mode')}
          >
            04. Case Study Dossier
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: Inquiry Stages Grid & Evidence Cards                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'stages' && (
          <div className="stages-view-layout">
            <div className="stages-cards-grid">
              {RESEARCH_STAGES.map((stage) => {
                const isSelected = stage.id === (activeStageId || 'stage-problem');
                return (
                  <article
                    key={stage.id}
                    className={`stage-evidence-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onSelectStage(stage.id);
                      setSelectedCaseStage(stage);
                    }}
                    onMouseEnter={() => onHoverEvidence(stage.id)}
                    onMouseLeave={() => onHoverEvidence(null)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStage(stage.id);
                        setSelectedCaseStage(stage);
                      }
                    }}
                  >
                    <header className="card-top">
                      <span className="card-number-badge">STAGE {stage.number}</span>
                      <span className="card-category-tag">{stage.eyebrow}</span>
                    </header>

                    <h3 className="card-heading">{stage.title}</h3>
                    <p className="card-focus-line">
                      <strong>Focus:</strong> {stage.focus}
                    </p>
                    <p className="card-summary">{stage.summary}</p>

                    <ul className="card-details-list">
                      {stage.details.slice(0, 2).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    <div className="card-footer-action">
                      <span className="read-more-btn">
                        Examine Evidence Dossier <span>→</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Stage Quick Lens Sidebar */}
            <aside className="stage-lens-sidebar" aria-label="Active Stage Detail">
              <div className="lens-inner-panel">
                <span className="lens-tag">ACTIVE EVIDENCE DOSSIER</span>
                <span className="lens-stage-id">STAGE {currentStage.number} / 06</span>
                <h3 className="lens-title">{currentStage.title}</h3>
                <p className="lens-focus">{currentStage.focus}</p>
                <div className="lens-divider" />
                <p className="lens-body">{currentStage.summary}</p>

                <div className="lens-details-box">
                  <span className="lens-box-title">Documented In Practicum:</span>
                  <ul>
                    {currentStage.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>

                {currentStage.evidenceDoc && (
                  <div className="lens-actions">
                    <a
                      href={currentStage.evidenceDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lens-doc-link"
                    >
                      <span>📄</span> {currentStage.evidenceLabel || 'Open Document'}
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: Pedagogical Observation & Intervention Matrix              */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'matrix' && (
          <div className="matrix-view-container">
            <div className="matrix-intro-box">
              <p className="matrix-intro-text">
                This comparative matrix structures observational findings gathered during school observation and
                the corresponding classroom interventions formulated for supervised school teaching.
              </p>
            </div>

            <div className="matrix-table-wrap" tabIndex={0} aria-label="Observation and intervention comparative table">
              <table className="pedagogy-matrix-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '22%' }}>Pedagogical Domain</th>
                    <th scope="col" style={{ width: '26%' }}>Baseline Classroom Observation</th>
                    <th scope="col" style={{ width: '28%' }}>Action Research Intervention</th>
                    <th scope="col" style={{ width: '24%' }}>Documented Insight &amp; Context</th>
                  </tr>
                </thead>
                <tbody>
                  {OBSERVATION_MATRIX.map((row) => (
                    <tr key={row.id}>
                      <td className="domain-cell">
                        <strong>{row.domain}</strong>
                        <span className="context-sub">{row.practicumContext}</span>
                      </td>
                      <td className="baseline-cell">
                        <span className="matrix-badge baseline">Observed Need</span>
                        <p>{row.baselineObservation}</p>
                      </td>
                      <td className="intervention-cell">
                        <span className="matrix-badge intervention">Teaching Action</span>
                        <p>{row.actionIntervention}</p>
                      </td>
                      <td className="insight-cell">
                        <span className="matrix-badge insight">Pedagogical Growth</span>
                        <p>{row.pedagogicalInsight}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 40-Minute Lesson Architecture Visualization */}
            <div className="lesson-architecture-block">
              <div className="architecture-header">
                <span className="arch-tag">PRACTICUM INTERVENTION BLUEPRINT</span>
                <h3 className="arch-title">The 40-Minute Inquiry Routine (Lesson Plan No. 6)</h3>
                <p className="arch-subtitle">
                  Structured progression from prior knowledge activation to multi-modal explanation and three-tier formative assessment checks.
                </p>
              </div>

              <div className="routine-phases-grid">
                <div className="phase-card">
                  <div className="phase-time">00 – 08 MINS</div>
                  <h4 className="phase-name">Diagnostic Baseline</h4>
                  <p className="phase-desc">
                    Prior-knowledge inquiry connecting modern voting with historical Sabha/Samiti and Lincoln’s definition.
                  </p>
                  <span className="phase-tag">Diagnostic Check</span>
                </div>

                <div className="phase-card">
                  <div className="phase-time">08 – 22 MINS</div>
                  <h4 className="phase-name">Visual Scaffolding</h4>
                  <p className="phase-desc">
                    Dual-axis concept diagram (India vs. US) and primary source photographs of election lines &amp; civic protest.
                  </p>
                  <span className="phase-tag">Concept Scaffolding</span>
                </div>

                <div className="phase-card">
                  <div className="phase-time">22 – 32 MINS</div>
                  <h4 className="phase-name">Board Matrix Synthesis</h4>
                  <p className="phase-desc">
                    Zoned chalkboard matrix contrasting Monarchy, Oligarchy, Dictatorship, and Democracy with student input.
                  </p>
                  <span className="phase-tag">Classroom Discourse</span>
                </div>

                <div className="phase-card">
                  <div className="phase-time">32 – 40 MINS</div>
                  <h4 className="phase-name">Three-Tier Assessment</h4>
                  <p className="phase-desc">
                    Tiered student response slip (Recall → Guided comparison → Evaluative accountability reasoning).
                  </p>
                  <span className="phase-tag">Formative Check</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: Weekly Practicum & Research Timeline                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'timeline' && (
          <div className="research-timeline-view">
            <div className="timeline-nav-pills">
              {WEEKLY_RESEARCH_TIMELINE.map((item, idx) => (
                <button
                  key={item.phase}
                  className={`timeline-pill-btn ${activeTimelinePhase === idx ? 'is-active' : ''}`}
                  onClick={() => setActiveTimelinePhase(idx)}
                >
                  <span className="pill-phase">{item.phase}</span>
                  <span className="pill-period">{item.period.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Selected Phase Spotlight */}
            {(() => {
              const phase = WEEKLY_RESEARCH_TIMELINE[activeTimelinePhase];
              return (
                <article className="timeline-phase-spotlight">
                  <header className="phase-spotlight-header">
                    <div>
                      <div className="phase-meta-line">
                        <span className="phase-badge">{phase.phase}</span>
                        <span className="phase-period-text">{phase.period}</span>
                        <span className={`phase-status-tag ${phase.status.toLowerCase().replace(' ', '-')}`}>
                          {phase.status}
                        </span>
                      </div>
                      <h3 className="phase-spotlight-title">{phase.title}</h3>
                      <p className="phase-institution">{phase.institution} · <em>{phase.milestoneType}</em></p>
                    </div>
                  </header>

                  <p className="phase-full-desc">{phase.description}</p>

                  <div className="phase-outputs-section">
                    <span className="outputs-header">Documented Artifacts &amp; Evidence:</span>
                    <div className="outputs-list">
                      {phase.keyOutputs.map((output, i) => (
                        <div key={i} className="output-chip">
                          <span className="chip-bullet" aria-hidden="true">✓</span>
                          <span>{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })()}

            {/* Full Vertical Sequence for Accessibility */}
            <div className="full-timeline-vertical-track" aria-label="Sequential practicum record">
              <h4 className="track-heading">Inquiry Trajectory (2025–2027)</h4>
              <div className="vertical-timeline-steps">
                {WEEKLY_RESEARCH_TIMELINE.map((item, i) => (
                  <div
                    key={item.phase}
                    className={`vert-step-item ${activeTimelinePhase === i ? 'highlighted' : ''}`}
                    onClick={() => setActiveTimelinePhase(i)}
                  >
                    <div className="vert-node">
                      <span className="vert-dot" />
                    </div>
                    <div className="vert-content">
                      <span className="vert-period">{item.period}</span>
                      <h5 className="vert-title">{item.title}</h5>
                      <p className="vert-inst">{item.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 4: In-Depth Case Study Dossier (Reading Mode)                */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'reading-mode' && (
          <article className="case-study-dossier" aria-label="Full Case Study Reading Mode">
            <header className="dossier-header">
              <span className="dossier-tag">COMPREHENSIVE PRACTICUM CASE STUDY</span>
              <h3 className="dossier-title">{RESEARCH_METADATA.title}</h3>
              <p className="dossier-subtitle">{RESEARCH_METADATA.subtitle}</p>
              <div className="dossier-meta-grid">
                <div>
                  <strong>Primary Investigator</strong>
                  <p>{RESEARCH_METADATA.investigator}</p>
                </div>
                <div>
                  <strong>Teacher Education Institution</strong>
                  <p>Amity Institute of Education, Amity University</p>
                </div>
                <div>
                  <strong>Practicum School</strong>
                  <p>Panchsheel Balak Inter-College (Classes 6–9)</p>
                </div>
                <div>
                  <strong>Observation Placement</strong>
                  <p>Amity International School, Mayur Vihar</p>
                </div>
              </div>
            </header>

            <div className="dossier-body prose">
              <section className="dossier-section">
                <h4>1. Classroom Context &amp; Research Problem</h4>
                <p>
                  During secondary Social Science instruction, civic institutions and democratic processes are frequently
                  introduced through dense textbook paragraphs. Students routinely memorize stock phrases such as
                  "government of the people, by the people, for the people" but struggle to articulate how accountability
                  mechanisms, periodic elections, and peaceful dissent protect citizens in daily governance.
                </p>
                <p>
                  Observations conducted during a five-day placement at Amity International School, Mayur Vihar confirmed
                  that teacher wait-time averaged under one second, causing rapid recall guesses and disproportionately
                  involving only highly fluent speakers.
                </p>
              </section>

              <section className="dossier-section">
                <h4>2. Action Research Inquiries</h4>
                <ul>
                  <li>
                    <strong>Inquiry 1:</strong> Can framing opening questions around prior knowledge (comparing ancient
                    Sabha/Samiti assemblies with modern universal adult suffrage) increase voluntary learner participation?
                  </li>
                  <li>
                    <strong>Inquiry 2:</strong> Does dual-axis visual scaffolding (contrasting direct vs. indirect democracy
                    and parliamentary vs. presidential models) enable Class IX students to deduce constitutional differences
                    independently?
                  </li>
                  <li>
                    <strong>Inquiry 3:</strong> How does embedding a three-tier formative check system during a 40-minute period
                    shift assessment from terminal testing to real-time instructional adaptation?
                  </li>
                </ul>
              </section>

              <section className="dossier-section">
                <h4>3. Instructional Intervention Architecture</h4>
                <p>
                  As recorded in <strong>Lesson Plan No. 6 (Amity University Practicum, 25 July 2026)</strong>, the lesson
                  was structured into four deliberate pedagogical phases:
                </p>
                <ol>
                  <li>
                    <strong>Phase 1: Diagnostic Activation (Mins 0–8):</strong> Diagnostic questioning exploring familiar
                    decision-making routines before introducing technical terms.
                  </li>
                  <li>
                    <strong>Phase 2: Visual Scaffolding &amp; Primary Sources (Mins 8–22):</strong> Displaying paired photographs
                    of citizen election lines alongside peaceful protest assemblies to explore representation and accountability.
                  </li>
                  <li>
                    <strong>Phase 3: Structured Chalkboard Matrix (Mins 22–32):</strong> Organizing student contributions into
                    a high-contrast four-quadrant blackboard matrix contrasting Monarchy, Oligarchy, Dictatorship, and Democracy.
                  </li>
                  <li>
                    <strong>Phase 4: Three-Tier Formative Response (Mins 32–40):</strong> Administering exit slips containing
                    tiered prompts: diagnostic recall, guided branch matching, and independent evaluative reasoning.
                  </li>
                </ol>
              </section>

              <section className="dossier-section">
                <h4>4. Documented Pedagogical Reflections &amp; Limitations</h4>
                <p>
                  Classroom practice demonstrated that primary source photographs serve as an effective cognitive bridge,
                  allowing students with varied literacy backgrounds to articulate valid analytical points. Planned wait-time
                  (3–5 seconds) produced multi-clause responses with clear reasoning.
                </p>
                <div className="truth-notice-card">
                  <h5>Archival Status &amp; Truth Notice</h5>
                  <p>
                    The portfolio maintains strict integrity regarding published evidence: the current dossier documents
                    <em>curriculum planning, diagnostic instruments, and pedagogical frameworks</em>. Completed student work
                    samples and formal mentor supervisory rubrics are part of the ongoing 16-week internship documentation
                    and will be archived as subsequent milestones.
                  </p>
                </div>
              </section>

              <div className="dossier-download-actions">
                <a
                  href="assets/democracy-lesson-plan.pdf"
                  download="democracy-lesson-plan.pdf"
                  className="btn-primary"
                >
                  Download Complete Lesson Plan PDF (6 Pages) ↓
                </a>
                <a
                  href="assets/krishna-mahato-resume.pdf"
                  download="krishna-mahato-resume.pdf"
                  className="btn-secondary"
                >
                  Download Educator Résumé PDF ↓
                </a>
              </div>
            </div>
          </article>
        )}

        {/* Modal for Deep Stage Inspection */}
        {selectedCaseStage && (
          <div
            className="research-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-stage-title"
            onClick={() => setSelectedCaseStage(null)}
          >
            <div
              className="research-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setSelectedCaseStage(null)}
                aria-label="Close modal"
              >
                ✕
              </button>

              <span className="modal-stage-eyebrow">STAGE {selectedCaseStage.number} · {selectedCaseStage.eyebrow}</span>
              <h3 id="modal-stage-title" className="modal-stage-title">{selectedCaseStage.title}</h3>
              <p className="modal-stage-focus"><strong>Focus:</strong> {selectedCaseStage.focus}</p>

              <div className="modal-body-content">
                <p className="modal-summary">{selectedCaseStage.summary}</p>
                <div className="modal-details-list">
                  <h4>Documented Evidence Points:</h4>
                  <ul>
                    {selectedCaseStage.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="modal-footer-strip">
                {selectedCaseStage.evidenceDoc ? (
                  <a
                    href={selectedCaseStage.evidenceDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-primary-btn"
                  >
                    Examine Document ↗
                  </a>
                ) : null}
                <button
                  className="modal-secondary-btn"
                  onClick={() => setSelectedCaseStage(null)}
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transition Bridge to Certificates / Achievements Section */}
        <div className="academic-transition-bridge" aria-label="Continuing educational trajectory">
          <div className="bridge-content">
            <span className="bridge-tag">NEXT HORIZON · CHAPTER 05</span>
            <h3 className="bridge-title">Credentials, Seminar Presentations &amp; Institutional Milestones</h3>
            <p className="bridge-desc">
              From classroom action research and supervised school teaching to validated academic degrees,
              national webinar certifications, and research paper presentations.
            </p>
          </div>
          <div className="bridge-actions">
            <a href="assets/krishna-mahato-resume.pdf" download="krishna-mahato-resume.pdf" className="btn-secondary">
              Academic Résumé PDF ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
