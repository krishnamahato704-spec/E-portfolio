"use client";

import { PageHeading, SectionHeading, ContactBand } from "@/components/ui";
import { ResearchPapers } from "@/components/records";
import { ResourceLibrary } from "@/components/resource-library";

export function ResearchPage() {
  return (
    <div className="shell">
      <PageHeading
        label="Research & presentations"
        title="History is a conversation with evidence."
        description="Seminar work and academic presentations on teacher education, Indian Knowledge Systems, and classroom practice."
      />
      <ResearchPapers />
      <section className="section">
        <SectionHeading
          label="Academic materials"
          title="Presentations to explore."
          intro="Original files, with their documented context and attribution."
        />
        <ResourceLibrary presentationsOnly />
      </section>
      <ContactBand />
    </div>
  );
}
