import type { MetadataRoute } from "next";
import { canonical, basePath } from "@/lib/content";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [`${basePath}/admin/`, `${basePath}/src/`],
    },
    sitemap: `${canonical}sitemap.xml`,
  };
}
