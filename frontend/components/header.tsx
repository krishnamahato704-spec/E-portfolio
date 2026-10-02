"use client";

import Link from "@/components/portfolio-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useContent } from "./content-provider";
import { CVLink } from "./ui";
import { Icon } from "./icons";

const links = [
  { href: "/teaching/", label: "Teaching" },
  { href: "/research/", label: "Research" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      setDark(document.documentElement.dataset.theme === "dark");
    const updateSystem = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("portfolio-theme");
      } catch {
        /* Use the system preference when storage is blocked. */
      }
      if (!saved)
        document.documentElement.dataset.theme = media.matches
          ? "dark"
          : "light";
      sync();
    };
    const updateStorage = (event: StorageEvent) => {
      if (event.key !== "portfolio-theme") return;
      document.documentElement.dataset.theme =
        event.newValue || (media.matches ? "dark" : "light");
      sync();
    };
    const timer = window.setTimeout(sync, 0);
    media.addEventListener("change", updateSystem);
    window.addEventListener("storage", updateStorage);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", updateSystem);
      window.removeEventListener("storage", updateStorage);
    };
  }, []);
  function toggle() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("portfolio-theme", next ? "dark" : "light");
    } catch {
      /* Theme still works when storage is unavailable. */
    }
    setDark(next);
  }
  return (
    <button
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      <span className="sun-icon">
        <Icon name="sun" />
      </span>
      <span className="moon-icon">
        <Icon name="moon" />
      </span>
    </button>
  );
}

export function Header() {
  const { profile } = useContent();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const active = (href: string) => pathname.includes(href.slice(0, -1));
  useEffect(() => {
    if (!open) return;
    const triggerElement = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const elements =
        menu.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    const resize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resize);
      triggerElement?.focus();
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">
              KM<span>.</span>
            </span>
            <span className="brand-caption">
              {profile.name}
              <small>History & education</small>
            </span>
          </Link>
          <nav
            className="hidden md:flex desktop-nav"
            aria-label="Main navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <CVLink compact />
            <ThemeToggle />
            <button
              ref={trigger}
              className="icon-button md:hidden"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-navigation"
            ref={menu}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="mobile-menu"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <div className="mobile-menu-top">
              <span className="eyebrow">Explore the portfolio</span>
              <button
                className="icon-button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(link.href) ? "page" : undefined}
                >
                  <span className="meta">0{i + 1}</span>
                  {link.label}
                  <Icon />
                </Link>
              ))}
            </nav>
            <div className="mobile-menu-bottom">
              <Link href="/resources/" onClick={() => setOpen(false)}>
                Teaching resources ↗
              </Link>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
