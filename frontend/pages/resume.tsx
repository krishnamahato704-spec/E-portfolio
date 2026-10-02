"use client";

import { useContent } from "@/components/content-provider";
import { Education, ExperienceList, Credentials } from "@/components/records";
import { PageHeading, SectionHeading, CVLink } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ResumePage() {
  const { profile, competencies } = useContent();
  return (
    <div className="shell resume-page">
      <PageHeading
        label="Résumé / Current profile"
        title={profile.name}
        description={profile.summary}
      >
        <p>
          {profile.email} · {profile.location}
          <br />
          Available from {profile.availability}
        </p>
        <div className="actions print-hidden">
          <CVLink />
          <button
            className="button button-secondary"
            onClick={() => window.print()}
          >
            Print / save as PDF
            <Icon name="download" />
          </button>
        </div>
      </PageHeading>
      <section className="section">
        <SectionHeading title="Education" />
        <Education full />
      </section>
      <section className="section">
        <SectionHeading title="Teaching experience" />
        <ExperienceList full />
      </section>
      <section className="section">
        <SectionHeading title="Competencies" />
        <ul className="competency-list">
          {competencies.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="section">
        <SectionHeading title="Professional development" />
        <Credentials />
      </section>
    </div>
  );
}
