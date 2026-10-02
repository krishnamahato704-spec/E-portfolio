import type { MetadataRoute } from "next";
import { canonical } from "@/lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "teaching/",
    "research/",
    "about/",
    "resources/",
    "credentials/",
    "contact/",
    "resume/",
    "gallery/",
    "teaching/democracy/",
    "teaching/pehchaan/",
    "teaching/mock-election/",
    "teaching/observation/",
  ].map((path) => ({ url: `${canonical}${path}` }));
}
