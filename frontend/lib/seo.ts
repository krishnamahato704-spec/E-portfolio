import type { Metadata } from "next";
import { canonical } from "./content";

export function pageMetadata(
  title: string,
  description: string,
  path = "",
): Metadata {
  const url = `${canonical}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · Krishna Mahato`,
      description,
      url,
      type: "website",
      images: [
        {
          url: `${canonical}assets/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Krishna Mahato — History and education portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Krishna Mahato`,
      description,
      images: [`${canonical}assets/og-image.jpg`],
    },
  };
}
