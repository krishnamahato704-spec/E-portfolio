"use client";

import Link from "@/components/portfolio-link";
import { useContent } from "@/components/content-provider";
import {
  PageHeading,
  Media,
  TextLink,
  EmptyState,
  SectionHeading,
} from "@/components/ui";
import { DocumentNotes } from "@/components/document-notes";
import { CaseContents } from "@/components/case-contents";
import { caseStudies, type CaseSlug } from "@/lib/case-studies";
import { asset, initialContent, mediaUrl } from "@/lib/content";
import { Icon } from "@/components/icons";

export function TeachingCasePage({ slug }: { slug: CaseSlug }) {
  const content = useContent();
  const study = caseStudies[slug];
  const lesson = content.resources.find(
    (record) => record.id === initialContent.resources[0].id,
  );
  const report = content.resources.find(
    (record) => record.id === "ntcc-community-report",
  );
  const experience = content.experiences.find((record) => record.id === slug);
  const election = content.gallery.find(
    (record) => record.id === "mock-election-activity",
  );
  const available =
    slug === "democracy"
      ? !!lesson
      : slug === "mock-election"
        ? !!election
        : !!experience;
  if (!available)
    return (
      <div className="shell">
        <PageHeading label={study.label} title={study.title} />
        <EmptyState>
          This teaching record is not currently published.
        </EmptyState>
        <TextLink href="/resources/">Browse published resources</TextLink>
      </div>
    );
  const document =
    slug === "democracy" ? lesson : slug === "pehchaan" ? report : undefined;
  const changedLesson =
    slug === "democracy" && lesson?.url !== initialContent.resources[0].url;
  return (
    <div className="shell case-page">
      <Link href="/teaching/" className="back-link">
        ← All teaching work
      </Link>
      <PageHeading
        label={study.label}
        title={study.title}
        description={study.description}
      >
        <p className="meta">
          {slug === "democracy"
            ? [
                lesson?.grade,
                lesson?.date,
                lesson?.duration,
                lesson?.evidenceStatus,
              ]
                .filter(Boolean)
                .join(" · ")
            : experience
              ? `${experience.period} · ${experience.status}`
              : election?.context}
        </p>
        {document && (
          <a href={mediaUrl(document.url)} className="button button-primary">
            Read {document.type || "the supporting document"}
            <Icon />
          </a>
        )}
      </PageHeading>
      {changedLesson ? (
        <>
          <Media src={lesson?.thumbnail || ""} alt={lesson?.title || ""} />
          <p className="lead">{lesson?.description}</p>
          <p>
            The published file has changed. Open the current document to review
            its contents.
          </p>
        </>
      ) : (
        <>
          {slug === "democracy" && (
            <DocumentNotes image={lesson?.thumbnail || ""} />
          )}
          {slug === "pehchaan" && (
            <figure className="case-cover">
              <Media
                src={
                  content.gallery.find(
                    (record) => record.id === "pehchaan-collage",
                  )?.image || ""
                }
                alt="Collage of classroom teaching and materials at Pehchaan"
              />
              <figcaption className="meta">
                Community internship · Supplied classroom collage
              </figcaption>
            </figure>
          )}
          {slug === "mock-election" && (
            <div className="case-media-pair">
              {content.gallery
                .filter((record) =>
                  ["mock-election-activity", "mock-election-class8"].includes(
                    record.id,
                  ),
                )
                .map((record) => (
                  <figure key={record.id}>
                    <Media src={record.image} alt={record.title} />
                    <figcaption className="meta">{record.title}</figcaption>
                    <a className="text-link" href={mediaUrl(record.image)}>
                      Open the teaching material
                      <Icon />
                    </a>
                  </figure>
                ))}
            </div>
          )}
          <div className="case-layout">
            <CaseContents sections={study.sections} />
            <article className="case-story prose">
              {study.sections.map((section, i) => (
                <section id={`case-${section.id}`} key={section.id} data-reveal>
                  <p className="eyebrow">
                    0{i + 1} / {section.label}
                  </p>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {"pages" in section && document && (
                    <a
                      className="text-link"
                      href={`${mediaUrl(document.url)}#page=${section.pages}`}
                    >
                      Read page {section.pages} in the original plan
                      <Icon />
                    </a>
                  )}
                </section>
              ))}
            </article>
          </div>
          {slug === "pehchaan" && (
            <section className="section">
              <SectionHeading
                label="Supporting assessment"
                title="The UKG diagnostic document."
              />
              <div className="supporting-artifact">
                <Media
                  src={asset("ukg-assessment-preview.webp")}
                  alt="UKG assessment document preview"
                />
                <div>
                  <p>
                    A 40-mark diagnostic assessment designed during the
                    community internship.
                  </p>
                  <a
                    className="text-link"
                    href={asset("ukg-assessment-test.pdf")}
                  >
                    Open assessment PDF
                    <Icon />
                  </a>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      <section className="case-next">
        <div>
          <p className="eyebrow">Keep exploring</p>
          <h2>The work continues.</h2>
        </div>
        <div>
          <TextLink href="/resources/">Browse original resources</TextLink>
          <TextLink href="/gallery/">View the teaching gallery</TextLink>
        </div>
      </section>
    </div>
  );
}
