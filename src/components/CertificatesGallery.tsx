import { EvidenceImage } from './EvidenceImage';
import React from 'react';
import { CERTIFICATES_DATA, CertificateItem } from '../data/galleryData';

interface CertificatesGalleryProps {
  onSelectCertificate?: (cert: CertificateItem) => void;
  onHoverCertificate?: (id: string | null) => void;
}

export function CertificatesGallery({
  onSelectCertificate,
  onHoverCertificate,
}: CertificatesGalleryProps) {
  return (
    <section id="credentials" className="certificates-formal-section">
      <div className="content-container">
        <header className="certificates-header">
          <div className="certificates-meta-bar">
            <span className="certificates-tag">CHAPTER 05 · PROFESSIONAL CREDENTIALS</span>
            <span className="certificates-count-pill">
              4 Verified Records · Institutional Documentation
            </span>
          </div>

          <h2 className="certificates-title">
            The Work. <em>The Verified Record.</em>
          </h2>
          <p className="certificates-lead">
            Academic degrees, field internship completions, and seminar paper presentations confirming formal preparation in History, English, and Secondary Education.
          </p>
        </header>

        {/* Formal Certificates Grid */}
        <div className="certificates-grid">
          {CERTIFICATES_DATA.map((cert, idx) => (
            <article
              key={cert.id}
              className="certificate-formal-card"
              onMouseEnter={() => onHoverCertificate?.(cert.id)}
              onMouseLeave={() => onHoverCertificate?.(null)}
              onClick={() => onSelectCertificate?.(cert)}
            >
              <div className="cert-card-media-wrap">
                <span className="cert-archive-tag">ARCHIVE / CRED-0{idx + 1}</span>
                <span className="cert-badge">{cert.category}</span>
                <div className="cert-img-container">
                  <EvidenceImage
                    src={cert.fallbackImage}
                    alt={cert.title}
                    className="cert-img-thumbnail"
                    loading="lazy"
                  />
                  <div className="cert-overlay-hint">
                    <span>Examine Record ↗</span>
                  </div>
                </div>
              </div>

              <div className="cert-card-body">
                <h3 className="cert-card-title">{cert.title}</h3>
                <div className="cert-issuer-line">
                  <strong>Issued by:</strong> {cert.issuer}
                </div>
                <div className="cert-date-line">
                  <strong>Date:</strong> {cert.date}
                </div>
                <p className="cert-description">{cert.description}</p>

                <div className="cert-actions-bar">
                  <button
                    type="button"
                    className="cert-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCertificate?.(cert);
                    }}
                  >
                    Inspect Document &amp; Metadata ↗
                  </button>
                  <a
                    href={cert.highResUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-external-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Original Record ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Transition Bridge: Formal Evidence into Lived Experience */}
        <div className="cert-to-gallery-bridge">
          <div className="bridge-icon-track">
            <span className="bridge-arrow">↓</span>
          </div>
          <div className="bridge-text-block">
            <span className="bridge-subtag">TRANSITION TO VISUAL ARCHIVE</span>
            <h4 className="bridge-heading">From Formal Evidence to Lived Experience</h4>
            <p className="bridge-caption">
              Certificates validate credentials; lived teaching moments reveal how inquiry, classroom management, and student engagement breathe life into pedagogical principles.
            </p>
          </div>
          <a href="#visual-gallery" className="btn-secondary bridge-action-btn">
            Explore Moments from the Journey ↓
          </a>
        </div>
      </div>
    </section>
  );
}
