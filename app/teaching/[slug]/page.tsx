import { notFound } from "next/navigation";
import { TeachingCasePage } from "@/pages/teaching-case";
import { caseStudies, type CaseSlug } from "@/lib/case-studies";
import { pageMetadata } from "@/lib/seo";
export function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(slug in caseStudies)) return {};
  const record = caseStudies[slug as CaseSlug];
  return pageMetadata(record.title, record.description, `teaching/${slug}/`);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(slug in caseStudies)) notFound();
  return <TeachingCasePage slug={slug as CaseSlug} />;
}
