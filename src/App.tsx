import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { HeroVideo } from './components/HeroVideo';
import { SceneBoundary } from './components/SceneBoundary';
import { assetUrl, useMedia, usePageVisible } from './runtime';
import { loadContent } from './cloud';
const WorkspaceCanvas = lazy(() => import('./components/WorkspaceCanvas'));
import { JourneyTimeline } from './components/JourneyTimeline';
import { TeachingPortfolio } from './components/TeachingPortfolio';
import { TlmExhibition } from './components/TlmExhibition';
import { ActionResearch } from './components/ActionResearch';
import { CertificatesGallery } from './components/CertificatesGallery';
import { VisualGallery } from './components/VisualGallery';
import { CategoryFilter } from './data/teachingData';
import { TlmCategory } from './data/tlmData';
import { GalleryItem, CertificateItem } from './data/galleryData';
import { defaultContent, mergeContent, validateContent } from './content';
import './index.css';
import './repair.css';

export function App() {
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollProgress = useRef(0);
  const [section, setSection] = useState(0);
  const [content, setContent] = useState(defaultContent);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const isMobile = useMedia('(max-width: 767px)');
  const lowPower = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  const pageVisible = usePageVisible();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(-1);
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

  useEffect(() => {
    let current = true;
    loadContent().then(row => { if (current) setContent(validateContent(mergeContent(row.content))); }).catch(() => {});
    return () => { current = false; };
  }, []);

  // Desktop mouse parallax tracking normalized [-1, 1]
  useEffect(() => {
    if (isMobile || reducedMotion || lowPower) return;
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isMobile, reducedMotion, lowPower]);

  const profile = content.profile;
  const resumeUrl = /^https:\/\//i.test(profile.cv) ? profile.cv : assetUrl('assets/krishna-mahato-resume.pdf');

  const handleSelectMilestone = (index: number) => {
    const el = document.getElementById(`milestone-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    }
  };

  return (
    <div id="scroll-root" data-section={section}>
      <HeroVideo reducedMotion={reducedMotion} lowPower={lowPower} mobile={isMobile} />
      <div className="webgl-canvas-container" aria-hidden="true">
        <SceneBoundary><Suspense fallback={<div className="scene-loading">Loading the study…</div>}>
          <WorkspaceCanvas mouseRef={mouseRef} scrollProgress={scrollProgress}
            activeMilestoneIndex={activeMilestoneIndex} isMobile={isMobile}
            reducedMotion={reducedMotion} lowPower={lowPower} pageVisible={pageVisible} section={section}
            onSection={setSection} onActiveMilestone={setActiveMilestoneIndex}
            activeCategory={activeCategory} hoveredTeachingItemId={hoveredTeachingItemId}
            activeTlmCategory={activeTlmCategory} hoveredTlmProjectId={hoveredTlmProjectId}
            activeStageId={activeResearchStageId} hoveredEvidenceId={hoveredResearchEvidenceId}
            activeGalleryItemId={activeGalleryItem?.id || null} hoveredGalleryItemId={hoveredGalleryItemId}
            onHoverGalleryItem={setHoveredGalleryItemId} onSelectGalleryItem={setActiveGalleryItem} />
        </Suspense></SceneBoundary>
      </div>
      <div className="reading-scrim" aria-hidden="true" />
      <a href="#main-content" className="skip-link">Skip to portfolio content</a>
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
            <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="portfolio-nav"
              onClick={() => setMenuOpen(open => !open)}>Menu</button>
            <nav id="portfolio-nav" aria-label="Portfolio" className={`nav-links ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen(false)} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>
              <a href="#hero" className="nav-link">The Workspace</a>
              <a href="#about" className="nav-link">About</a>
              <a href="#journey" className="nav-link">Journey</a>
              <a href="#teaching" className="nav-link">Teaching</a>
              <a href="#tlm-exhibition" className="nav-link">TLMs</a>
              <a href="#action-research" className="nav-link">Inquiry</a>
              <a href="#credentials" className="nav-link">Credentials</a>
              <a href="#visual-gallery" className="nav-link">Gallery</a>
              <a href="#contact" className="nav-cta">Connect ↗</a>
            </nav>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>
        {/* Section 1: Hero Section */}
        <section id="hero" className="hero-section">
          <div className="content-container">
            <div className="hero-content">
              <span className="hero-eyebrow">
                {profile.eyebrow}
              </span>
              <h1 className="hero-title">
                {profile.name}
              </h1>
              <p className="hero-statement">
                {profile.headline}
              </p>

              <div className="hero-badges">
                <span className="hero-badge">B.Ed. &amp; M.A. History in Progress</span>
                <span className="hero-badge">Available from {profile.availability}</span>
                <span className="hero-badge">{profile.location} · {profile.workPreferences}</span>
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
                      {content.qualifications.filter(q => q.title.startsWith('B.A.') || q.title.startsWith('M.A.')).map(q => `${q.title} · ${q.place} · ${q.period} · ${q.status}${q.note ? '. ' + q.note : ''}`).join('. ')}
                    </p>
                    <div className="quote-callout">
                      <blockquote>
                        {content.about}
                      </blockquote>
                      <cite>— Krishna Mahato</cite>
                    </div>
                  </article>

                  {/* Narrative Block 2: Teacher Preparation */}
                  <article className="narrative-card">
                    <span className="narrative-label">02 / PROFESSIONAL PREPARATION</span>
                    <h3 className="narrative-title">Teacher Preparation (B.Ed. 2025–2027)</h3>
                    <p className="narrative-body">
                      Pursuing Bachelor of Education at Amity Institute of Education, Amity University, Noida. Specialized in Social Science and English pedagogy, diagnostic lesson design, experiential classroom strategies, and continuous formative assessment aligned with NEP 2020.
                    </p>
                    <p className="narrative-body" style={{ marginTop: '12px' }}>
                      {content.preparation}
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
                  <a href={resumeUrl} download="krishna-mahato-resume.pdf" className="btn-secondary">
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

        <section id="contact" className="contact-section">
          <div className="content-container">
            <span className="section-eyebrow">CONTACT</span>
            <h2 className="section-title">Let’s talk about teaching.</h2>
            <p>{profile.summary}</p>
            <p>Available from {profile.availability}. {profile.workPreferences}.</p>
            <p>{profile.eligibility}</p>
            <div className="hero-actions">
              <a className="btn-primary" href={`mailto:${profile.email}`}>Email {profile.name} ↗</a>
              <a className="btn-secondary" href={resumeUrl}>Read résumé ↗</a>
            </div>
          </div>
        </section>
        </main>
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
