"use client";

import Link from "@/components/portfolio-link";
import { useContent } from "./content-provider";
import { linkedIn, safeUrl } from "@/lib/content";
import { Icon } from "./icons";

export function Footer() {
  const { profile } = useContent();
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Link href="/" className="footer-name">
            {profile.name}
            <span>.</span>
          </Link>
          <p>History. Education. A continuing inquiry.</p>
        </div>
        <div className="footer-connect">
          <a className="email-link" href={`mailto:${profile.email}`}>
            {profile.email}
            <Icon />
          </a>
          <div className="footer-social">
            <a
              href={safeUrl(profile.linkedin) || linkedIn}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
            <a
              href="https://github.com/krishnamahato704-spec/E-portfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
            <Link href="/resources/">Resources</Link>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 {profile.name}</span>
        <span className="footer-note">
          Made for reading, learning, and conversation.
        </span>
        <div>
          <Link href="/resume/">Résumé</Link>
          <Link href="/admin/">Owner sign in</Link>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
