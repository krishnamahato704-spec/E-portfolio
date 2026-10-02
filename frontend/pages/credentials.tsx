"use client";

import { useContent } from "@/components/content-provider";
import { Credentials } from "@/components/records";
import { PageHeading, SectionHeading } from "@/components/ui";
import { mediaUrl } from "@/lib/content";
import { Icon } from "@/components/icons";

export function CredentialsPage() {
  const { certificates } = useContent();
  const academic = certificates.filter((record) =>
    /bachelor|internship/i.test(record.title),
  );
  const badges = certificates.filter((record) => /gemini/i.test(record.title));
  return (
    <div className="shell">
      <PageHeading
        label="Professional development"
        title="A record of continued learning."
        description="Course completion, participation, and academic records, with the supporting documents available to read."
      />
      <Credentials />
      {academic.length > 0 && (
        <section className="section">
          <SectionHeading
            label="Supporting records"
            title="Academic & teaching certificates."
          />
          <div className="credential-list">
            {academic.map((record) => (
              <article className="credential-row" key={record.title}>
                <div>
                  <p className="eyebrow">{record.issuer}</p>
                  <h3>{record.title}</h3>
                  <p>{record.description}</p>
                  <p className="meta">{record.date}</p>
                </div>
                <a
                  href={mediaUrl(record.url || record.image)}
                  className="text-link"
                >
                  View record
                  <Icon />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
      {badges.length > 0 && (
        <section className="section">
          <SectionHeading
            label="Supplied material"
            title="Educator badge image."
          />
          <div className="credential-list">
            {badges.map((record) => (
              <article className="credential-row" key={record.title}>
                <div>
                  <h3>{record.title}</h3>
                  <p>{record.description}</p>
                </div>
                <a href={mediaUrl(record.image)} className="text-link">
                  View badge image
                  <Icon />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
