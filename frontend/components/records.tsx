"use client";

import Link from "@/components/portfolio-link";
import { useContent } from "./content-provider";
import { EmptyState, TextLink } from "./ui";
import {
  professionalCredentials,
  researchRecords,
  researchTitle,
  isKnownResearch,
  mediaUrl,
} from "@/lib/content";
import { Icon } from "./icons";

export function Education({ full = false }: { full?: boolean }) {
  const { qualifications, profile } = useContent();
  const records = full ? qualifications : qualifications.slice(0, 3);
  return (
    <>
      <div className="timeline-list">
        {records.map((record) => (
          <article key={record.title} className="timeline-row">
            <div className="timeline-date">
              <span>{record.period}</span>
              <span className="status-label">{record.status}</span>
            </div>
            <div>
              <h3>{record.title}</h3>
              <p>{record.place}</p>
              {record.note && <p className="meta">{record.note}</p>}
              {record.expected && (
                <p className="meta">Expected completion · {record.expected}</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <aside className="focus-note">
        <span className="eyebrow">Current focus</span>
        <p>CTET and UGC NET preparation.</p>
        <p className="meta">{profile.eligibility}</p>
      </aside>
    </>
  );
}

export function ExperienceList({ full = false }: { full?: boolean }) {
  const { experiences } = useContent();
  return (
    <div className="timeline-list">
      {experiences.length ? (
        experiences.map((record) => (
          <article key={record.id} className="timeline-row">
            <div className="timeline-date">
              <span>{record.period}</span>
              {record.status && (
                <span className="status-label">{record.status}</span>
              )}
            </div>
            <div>
              <p className="eyebrow">{record.type}</p>
              <h3>{record.institution || record.title}</h3>
              <p>{record.summary}</p>
              {full && (
                <ul className="plain-list">
                  {record.points?.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              {["pehchaan", "observation"].includes(record.id) && (
                <TextLink href={`/teaching/${record.id}/`}>
                  Read the teaching record
                </TextLink>
              )}
            </div>
          </article>
        ))
      ) : (
        <EmptyState>No teaching records are currently published.</EmptyState>
      )}
    </div>
  );
}

export function ResearchPapers({ featured = false }: { featured?: boolean }) {
  const records = researchRecords(useContent());
  return (
    <div className="paper-list">
      {records.length ? (
        records.map((record) => (
          <article
            key={record.title}
            className={`paper-panel ${featured ? "paper-featured" : ""}`}
            data-reveal
          >
            <div className="paper-mark" aria-hidden="true">
              <Icon name="file" width="36" height="36" />
              <span>
                Research
                <br />& inquiry
              </span>
            </div>
            <div>
              <p className="eyebrow">
                {isKnownResearch(record)
                  ? "SETU-TE 2026 · International seminar"
                  : record.category}
              </p>
              <h3>{researchTitle(record)}</h3>
              {isKnownResearch(record) && (
                <p className="paper-authors">
                  Rusha Chaudhauri and Krishna Mahato
                </p>
              )}
              <p>
                {isKnownResearch(record)
                  ? "A co-authored seminar presentation on NEP 2020, Indian Knowledge Systems, and teacher education."
                  : record.description}
              </p>
              <p className="meta">
                {record.issuer} · {record.date}
              </p>
              {featured ? (
                <Link href="/research/" className="text-link">
                  Explore research & presentations
                  <Icon />
                </Link>
              ) : (
                <a
                  className="text-link"
                  href={mediaUrl(record.url || record.image)}
                >
                  View the presentation record
                  <Icon />
                </a>
              )}
            </div>
          </article>
        ))
      ) : (
        <EmptyState>
          No research or presentation records are currently published.
        </EmptyState>
      )}
    </div>
  );
}

export function Credentials({ curated = false }: { curated?: boolean }) {
  const content = useContent();
  let records = professionalCredentials(content);
  if (curated)
    records = records
      .filter((record) =>
        ["nptel-writing", "diksha-ai", "suraasa-linkedin"].includes(
          record.id || "",
        ),
      )
      .slice(0, 3);
  return (
    <div className="credential-list">
      {records.length ? (
        records.map((record) => (
          <article className="credential-row" key={record.title}>
            <div>
              <p className="eyebrow">{record.issuer}</p>
              <h3>{record.title}</h3>
              <p className="meta">{record.date}</p>
              {!curated && <p>{record.description}</p>}
            </div>
            <a
              className="text-link"
              href={mediaUrl(record.url || record.image)}
              aria-label={`View credential: ${record.title}`}
            >
              View credential
              <Icon />
            </a>
          </article>
        ))
      ) : (
        <EmptyState>
          No professional development records are currently published.
        </EmptyState>
      )}
    </div>
  );
}
