"use client";

import Image from "next/image";
import Link from "@/components/portfolio-link";
import { useState } from "react";
import { useContent } from "./content-provider";
import { Icon } from "./icons";
import { asset, basePath, cvDestination, mediaUrl } from "@/lib/content";
import responsiveImages from "@/lib/responsive-images.json";

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const local =
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.startsWith(`${basePath}/assets/`);
  return local ? (
    <Link href={href} className={`text-link ${className}`}>
      {children}
      <Icon />
    </Link>
  ) : (
    <a href={href} className={`text-link ${className}`}>
      {children}
      <Icon />
    </a>
  );
}
export function CVLink({ compact = false }: { compact?: boolean }) {
  const target = cvDestination(useContent());
  return (
    <a
      href={target.href}
      download={target.downloadable ? "krishna-mahato-resume.pdf" : undefined}
      className={compact ? "cv-shortcut" : "button button-secondary"}
    >
      {compact ? "CV" : target.downloadable ? "Download CV" : "View current CV"}
      <Icon name={target.downloadable ? "download" : "arrow"} />
    </a>
  );
}
export function SectionHeading({
  number,
  label,
  title,
  intro,
  children,
}: {
  number?: string;
  label?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="section-heading" data-reveal>
      <div>
        {label && (
          <p className="eyebrow">
            {number && <span className="section-number">{number} / </span>}
            {label}
          </p>
        )}
        <h2>{title}</h2>
        {intro && <p className="section-intro">{intro}</p>}
      </div>
      {children}
    </header>
  );
}
export function PageHeading({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      {description && <p className="lead max-w-[65ch]">{description}</p>}
      {children}
    </header>
  );
}
export function Media({
  src,
  alt,
  width = 900,
  height = 636,
  className = "",
  priority = false,
  sizes = "(max-width: 767px) 92vw, (max-width: 1199px) 48vw, 580px",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const url = mediaUrl(src);
  const relativePath = url.startsWith(`${basePath}/assets/`)
    ? url.slice(`${basePath}/assets/`.length)
    : "";
  const responsive = responsiveImages.includes(relativePath);
  const [failedUrl, setFailedUrl] = useState("");
  return url && failedUrl !== url ? (
    <Image
      src={url}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={!responsive}
      loader={
        responsive
          ? ({ width }) =>
              asset(
                `responsive/${relativePath.replace(/\.webp$/, "")}-${width}.webp`,
              )
          : undefined
      }
      className={className}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailedUrl(url)}
    />
  ) : (
    <div
      className={`empty-state media-fallback ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {alt
        ? `${alt} — image temporarily unavailable.`
        : "Image temporarily unavailable."}
    </div>
  );
}
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="empty-state">{children}</p>;
}
export function ContactBand() {
  const { profile } = useContent();
  return (
    <section className="contact-band" id="contact" data-reveal>
      <div>
        <p className="eyebrow">Let’s talk</p>
        <h2>
          Let’s talk
          <br />
          about teaching.
        </h2>
        <p>
          For teaching opportunities, academic work, and educational
          collaboration.
        </p>
        <p className="meta">
          Available from {profile.availability} · {profile.location}
        </p>
      </div>
      <Link className="button button-primary" href="/contact/">
        Get in touch
        <Icon />
      </Link>
    </section>
  );
}
export const portrait = asset("portrait.webp");
