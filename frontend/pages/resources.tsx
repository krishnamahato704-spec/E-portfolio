"use client";

import { PageHeading, ContactBand } from "@/components/ui";
import { ResourceLibrary } from "@/components/resource-library";

export function ResourcesPage() {
  return (
    <div className="shell">
      <PageHeading
        label="Resources / Original materials"
        title="Open the work. Read the details."
        description="Lesson planning, community work, and teacher-education presentations. Each record identifies its source and evidence status."
      />
      <ResourceLibrary />
      <ContactBand />
    </div>
  );
}
