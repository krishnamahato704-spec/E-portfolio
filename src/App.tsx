import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene3D } from './components/Scene3D';
import { CameraController } from './components/CameraController';
import { JourneyTimeline, MILESTONES } from './components/JourneyTimeline';
import { TeachingPortfolio } from './components/TeachingPortfolio';
import { TlmExhibition } from './components/TlmExhibition';
import { ActionResearch } from './components/ActionResearch';
import { CertificatesGallery } from './components/CertificatesGallery';
import { VisualGallery } from './components/VisualGallery';
import { CategoryFilter } from './data/teachingData';
import { TlmCategory } from './data/tlmData';
import { GalleryItem, CertificateItem } from './data/galleryData';
import { defaultContent } from './content';
import './index.css';

export function App() {
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(-1);
  const [camStats, setCamStats] = useState({ x: 0.2, y: 1.4, z: 4.4, progress: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [hoveredTeachingItemId, setHoveredTeachingItemId] = useState<string | null>(null);

  // TLM & Classroom Projects state
  const [activeTlmCategory, setActiveTlmCategory] = useState<TlmCategory>('All');
  const [hoveredTlmProjectId, setHoveredTlmProjectId] = useState<string | null>(null);

  // Action Research state
  const [activeResearchStageId, setActiveResearchStageId] = useState<string>('stage-problem');
  const [hoveredResearchEvidenceId, setHoveredResearchEvidenceId] = useState<string | null>(null);

  // Visual Gallery & Certificates state
  const [activeGalleryItem, setActiveGalleryItem] = useState<GalleryItem | CertificateItem | null>(null);
  const [hoveredGalleryItemId, setHoveredGalleryItemId] = useState<string | null>(null);

  // Viewport resize tracking for mobile optimization
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop mouse parallax tracking normalized [-1, 1]
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const profile = defaultContent.profile;

  const handleSelectMilestone = (index: number) => {
    const el = document.getElementById(`milestone-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Determine current active focal object description for HUD
  let currentTargetLabel = 'Workspace Overview';
  if (scrollProgress < 0.12) {
    currentTargetLabel = 'Study Workspace Overview';
  } else if (scrollProgress < 0.24) {
    currentTargetLabel = 'Open Study Journal';
  } else if (scrollProgress < 0.44) {
    if (activeMilestoneIndex >= 0 && MILESTONES[activeMilestoneIndex]) {
      currentTargetLabel = `Milestone: ${MILESTONES[activeMilestoneIndex].year} · ${MILESTONES[activeMilestoneIndex].title.split(' ')[0]}`;
    } else {
      currentTargetLabel = 'Archival Milestones Plinth';
    }
  } else if (scrollProgress < 0.60) {
    if (hoveredTeachingItemId) {
      currentTargetLabel = `Exhibition: ${hoveredTeachingItemId}`;
    } else if (activeCategory !== 'All') {
      currentTargetLabel = `Teaching Studio: ${activeCategory}`;
    } else {
      currentTargetLabel = 'Teaching Studio & Resource Gallery';
    }
  } else if (scrollProgress < 0.74) {
    if (hoveredTlmProjectId) {
      currentTargetLabel = `Learning Lab: ${hoveredTlmProjectId.replace('tlm-', '')}`;
    } else if (activeTlmCategory !== 'All') {
      currentTargetLabel = `TLM Focus: ${activeTlmCategory}`;
    } else {
      currentTargetLabel = 'Learning Lab & TLM Exhibition';
    }
  } else if (scrollProgress < 0.86) {
    if (hoveredResearchEvidenceId) {
      currentTargetLabel = `Inquiry Focus: ${hoveredResearchEvidenceId.replace('stage-', '')}`;
    } else {
      currentTargetLabel = `Action Research: ${activeResearchStageId.replace('stage-', '').toUpperCase()}`;
    }
  } else if (scrollProgress < 0.93) {
    if (hoveredGalleryItemId) {
      currentTargetLabel = `Credential: ${hoveredGalleryItemId.replace('cert-', '')}`;
    } else {
      currentTargetLabel = 'Credentials & Achievements Wall';
    }
  } else {
    if (hoveredGalleryItemId) {
      currentTargetLabel = `Gallery Focus: ${hoveredGalleryItemId.replace('gallery-', '')}`;
    } else {
      currentTargetLabel = 'Moments from the Journey Gallery';
    }
  }

  return (
    <div id="scroll-root">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Fullscreen Persistent React Three Fiber Canvas                    */}
      {/* -------------------------------------------------------------------- */}
      <div className="webgl-canvas-container" aria-hidden="true">
        <Canvas
          shadows
          camera={{ position: [0.2, 1.4, isMobile ? 5.4 : 4.4], fov: isMobile ? 50 : 42 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <Scene3D
            mouseRef={mouseRef}
            scrollProgress={scrollProgress}
            activeMilestoneIndex={activeMilestoneIndex}
            isMobile={isMobile}
            activeCategory={activeCategory}
            hoveredTeachingItemId={hoveredTeachingItemId}
            activeTlmCategory={activeTlmCategory}
            hoveredTlmProjectId={hoveredTlmProjectId}
            activeStageId={activeResearchStageId}
            hoveredEvidenceId={hoveredResearchEvidenceId}
            activeGalleryItemId={activeGalleryItem?.id || null}
            hoveredGalleryItemId={hoveredGalleryItemId}
            onHoverGalleryItem={setHoveredGalleryItemId}
            onSelectGalleryItem={setActiveGalleryItem}
          />
          <CameraController
            mouseRef={mouseRef}
            isMobile={isMobile}
            activeCategory={activeCategory}
            hoveredTeachingItemId={hoveredTeachingItemId}
            activeTlmCategory={activeTlmCategory}
            hoveredTlmProjectId={hoveredTlmProjectId}
            activeStageId={activeResearchStageId}
            hoveredEvidenceId={hoveredResearchEvidenceId}
            hoveredGalleryItemId={hoveredGalleryItemId}
            onCameraUpdate={setCamStats}
            onScrollProgress={setScrollProgress}
            onActiveMilestone={setActiveMilestoneIndex}
          />
        </Canvas>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Live 3D Camera Telemetry HUD                                      */}
      {/* -------------------------------------------------------------------- */}
      <div className="camera-hud" aria-live="polite">
        <div className="hud-title">3D Workspace Viewport</div>
        <div className="hud-row">
          <span>Camera:</span>
          <strong>[{camStats.x.toFixed(2)}, {camStats.y.toFixed(2)}, {camStats.z.toFixed(2)}]</strong>
        </div>
        <div className="hud-row">
          <span>Focal Target:</span>
          <strong title={currentTargetLabel}>{currentTargetLabel}</strong>
        </div>
        <div className="hud-row">
          <span>Scroll Transition:</span>
          <strong>{camStats.progress}%</strong>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. HTML Content Layers (Semantic Scrollable Storytelling)           */}
      {/* -------------------------------------------------------------------- */}
      <div className="html-content-layers">
        {/* Navigation Bar */}
        <header className="top-nav">
          <div className="content-container nav-inner">
            <a href="#hero" className="nav-brand">
              <span className="brand-monogram">KM<span>.</span></span>
              <div className="brand-info">
                <span className="brand-name">{profile.name}</span>
                <span className="brand-tagline">History, Social Science &amp; English Educator</span>
              </div>
            </a>
            <nav className="nav-links">
              <a href="#hero" className="nav-link">The Workspace</a>
              <a href="#about" className="nav-link">About</a>
              <a href="#journey" className="nav-link">Journey</a>
              <a href="#teaching" className="nav-link">Teaching</a>
              <a href="#tlm-exhibition" className="nav-link">TLMs</a>
              <a href="#action-research" className="nav-link">Inquiry</a>
              <a href="#credentials" className="nav-link">Credentials</a>
              <a href="#visual-gallery" className="nav-link">Gallery</a>
              <a href={`mailto:${profile.email}`} className="nav-cta">Connect ↗</a>
            </nav>
          </div>
        </header>

        {/* Section 1: Hero Section */}
        <section id="hero" className="hero-section">
          <div className="content-container">
            <div className="hero-content">
              <span className="hero-eyebrow">
                {profile.eyebrow}
              </span>
              <h1 className="hero-title">
                Krishna <em>Mahato</em>
              </h1>
              <p className="hero-statement">
                {profile.headline}
              </p>

              <div className="hero-badges">
                <span className="hero-badge">B.Ed. &amp; M.A. History in Progress</span>
                <span className="hero-badge">Available from {profile.availability}</span>
                <span className="hero-badge">Noida · Relocation Welcome</span>
              </div>

              <div className="hero-actions">
                <a href="#teaching" className="btn-primary">
                  Explore Teaching Portfolio ↓
                </a>
                <a href="#visual-gallery" className="btn-secondary">
                  Moments from the Journey ↓
                </a>
              </div>
            </div>
          </div>

          <div className="scroll-hint">
            <span>Scroll to enter the educator's study</span>
            <span aria-hidden="true">↓</span>
          </div>
        </section>

        {/* Section 2: About Section (Camera approaches the open journal) */}
        <section id="about" className="about-section">
          <div className="content-container">
            <div className="about-editorial-grid">
              <div className="about-narrative-column">
                <span className="section-eyebrow">CHAPTER 01 · ABOUT THE EDUCATOR</span>
                <h2 className="section-title">
                  Rooted in History.<br />
                  <em>Committed to Secondary Education.</em>
                </h2>

                <div className="narrative-cards-stack">
                  {/* Narrative Block 1: The Foundation */}
                  <article className="narrative-card">
                    <span className="narrative-label">01 / DISCIPLINARY FOUNDATION</span>
                    <h3 className="narrative-title">Disciplinary Grounding in History &amp; Social Inquiry</h3>
                    <p className="narrative-body">
                      Graduated with B.A. (Hons.) in History from Motilal Nehru College, University of Delhi (2020–2023), followed by M.A. in History at Indira Gandhi National Open University. My scholarship focuses on medieval and modern Indian social structures, historical methods, and critical reading of primary sources.
                    </p>
                    <div className="quote-callout">
                      <blockquote>
                        "{defaultContent.about}"
                      </blockquote>
                      <cite>— Teaching Philosophy Note, Amity Institute of Education</cite>
                    </div>
                  </article>

                  {/* Narrative Block 2: Teacher Preparation */}
                  <article className="narrative-card">
                    <span className="narrative-label">02 / PROFESSIONAL PREPARATION</span>
                    <h3 className="narrative-title">Rigorous Pedagogical Training (B.Ed. 2024–2026)</h3>
                    <p className="narrative-body">
                      Pursuing Bachelor of Education at Amity Institute of Education, Amity University, Noida. Specialized in Social Science and English pedagogy, diagnostic lesson design, experiential classroom strategies, and continuous formative assessment aligned with NEP 2020.
                    </p>
                    <p className="narrative-body" style={{ marginTop: '12px' }}>
                      {defaultContent.preparation}
                    </p>
                  </article>

                  {/* Narrative Block 3: Developing Practice */}
                  <article className="narrative-card">
                    <span className="narrative-label">03 / CLASSROOM INQUIRY IN PRACTICE</span>
                    <h3 className="narrative-title">Supervised School Teaching &amp; Student Dialogue</h3>
                    <p className="narrative-body">
                      Currently developing through a 16-week supervised B.Ed. school internship at Panchsheel Balak Inter-College, facilitating Social Science, English, and History classrooms. Grounded in creating structured questioning routines, formative checks, and inclusive learning environments.
                    </p>
                    <div className="teaching-tags">
                      <span className="teaching-tag">Primary Source Analysis</span>
                      <span className="teaching-tag">Democratic Inquiry</span>
                      <span className="teaching-tag">Multilingual Instruction</span>
                      <span className="teaching-tag">Formative Assessment</span>
                    </div>
                  </article>
                </div>

                <div className="about-action-strip">
                  <a href="#journey" className="btn-primary">
                    Follow the Milestone Timeline ↓
                  </a>
                  <a href="./assets/krishna-mahato-resume.pdf" download="krishna-mahato-resume.pdf" className="btn-secondary">
                    Download Résumé PDF ↓
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Journey / Timeline Experience (Camera travels through milestones) */}
        <JourneyTimeline
          activeMilestoneIndex={activeMilestoneIndex}
          onSelectMilestone={handleSelectMilestone}
        />

        {/* Section 4: Teaching Portfolio & Exhibition Studio */}
        <TeachingPortfolio
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onHoverItem={setHoveredTeachingItemId}
        />

        {/* Section 5: Learning Lab / TLM & Classroom Projects Exhibition */}
        <TlmExhibition
          activeCategory={activeTlmCategory}
          onSelectCategory={setActiveTlmCategory}
          onHoverProject={setHoveredTlmProjectId}
        />

        {/* Section 6: Action Research & Classroom Inquiry Experience */}
        <ActionResearch
          activeStageId={activeResearchStageId}
          onSelectStage={setActiveResearchStageId}
          onHoverEvidence={setHoveredResearchEvidenceId}
        />

        {/* Section 7: Formal Certificates & Credentials Gallery */}
        <CertificatesGallery
          onSelectCertificate={(cert) => setActiveGalleryItem(cert)}
          onHoverCertificate={(id) => setHoveredGalleryItemId(id)}
        />

        {/* Section 8: Moments from the Journey — Visual Memory Gallery */}
        <VisualGallery
          selectedItem={activeGalleryItem}
          onSelectItem={setActiveGalleryItem}
          onHoverItem={setHoveredGalleryItemId}
        />

        {/* Closing Academic Strip */}
        <footer className="study-footer">
          <div className="content-container footer-inner">
            <div>
              <p className="footer-mantra">History. Inquiry. Possibility.</p>
              <p className="footer-sub" style={{ fontSize: '0.8125rem', color: '#8c8273', marginTop: '4px' }}>
                Pedagogical portfolio of Krishna Mahato · Social Science, History &amp; English Educator
              </p>
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} Krishna Mahato · B.Ed. Practicum Archive</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
