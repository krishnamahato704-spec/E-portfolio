"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, MotionConfig, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const features = () =>
  import("./motion-features").then((module) => module.default);

export function PageEntrance({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <m.div
      key={pathname}
      initial={reduced || !mounted ? false : { opacity: 0.6, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </m.div>
  );
}

export function MotionSystem({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let revert: (() => void) | undefined;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const disable = () => {
      observer?.disconnect();
      revert?.();
    };
    const timer = window.setTimeout(async () => {
      const { gsap } = await import("gsap");
      if (cancelled || preference.matches || !scope.current) return;
      const context = gsap.context(() => {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              observer?.unobserve(entry.target);
              if (preference.matches) return;
              context.add(() =>
                gsap.fromTo(
                  entry.target,
                  { opacity: 0.75, y: 10 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power1.out",
                    clearProps: "opacity,transform",
                  },
                ),
              );
            });
          },
          { threshold: 0.08 },
        );
        scope.current?.querySelectorAll("[data-reveal]").forEach((element) => {
          if (element.getBoundingClientRect().top >= window.innerHeight)
            observer?.observe(element);
        });
      }, scope);
      revert = () => context.revert();
    }, 400);
    preference.addEventListener("change", disable);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      revert?.();
      preference.removeEventListener("change", disable);
    };
  }, [pathname]);
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user">
        <div ref={scope}>{children}</div>
      </MotionConfig>
    </LazyMotion>
  );
}
