"use client";

import { useContent } from "@/components/content-provider";
import {
  PageHeading,
  SectionHeading,
  TextLink,
  ContactBand,
} from "@/components/ui";
import { SelectedWork } from "@/components/selected-work";
import { ExperienceList } from "@/components/records";

export function TeachingPage() {
  const { practice } = useContent();
  return (
    <div className="shell">
      <PageHeading
        label="Teaching / Selected work"
        title="Questions, materials, and classroom practice."
        description="Explore the planning, community teaching, and observation behind my development as an educator."
      >
        <TextLink href="/resources/">Browse original teaching files</TextLink>
      </PageHeading>
      <SelectedWork all />
      <section className="section">
        <SectionHeading label="Approach" title="How I think about teaching." />
        <div className="practice-grid">
          {practice.map((item, i) => (
            <article key={item.title}>
              <span className="practice-number">0{i + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading
          label="Teaching journey"
          title="The experience behind the work."
        />
        <ExperienceList full />
      </section>
      <ContactBand />
    </div>
  );
}
