import { Gallery } from "@/components/gallery";
import { PageHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Teaching Gallery",
  "Photographs and visual records from teaching practice, community work, and teacher education.",
  "gallery/",
);
export default function Page() {
  return (
    <div className="shell">
      <PageHeading
        label="Gallery / Visual records"
        title="Materials, classrooms, and moments of learning."
        description="Original photographs and teaching materials, with their documented context."
      />
      <Gallery />
    </div>
  );
}
