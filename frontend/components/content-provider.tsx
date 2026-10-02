"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { loadContent } from "../../src/cloud.js";
import { mergeContent, validateContent } from "../../src/content.js";
import { initialContent, type Portfolio } from "@/lib/content";

const ContentContext = createContext<Portfolio>(initialContent);
export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState(initialContent);
  const interacted = useRef(false);
  const pending = useRef<Portfolio | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    const mark = () => {
      interacted.current = true;
    };
    document.addEventListener("pointerdown", mark, { once: true });
    document.addEventListener("keydown", mark, { once: true });
    document.addEventListener("input", mark, { once: true });
    loadContent()
      .then((row) => {
        if (!active) return;
        const candidate = mergeContent(row.content) as Portfolio;
        validateContent(candidate);
        pending.current = candidate;
        if (!interacted.current && window.scrollY < 24) setContent(candidate);
      })
      .catch(() => {
        /* The pre-rendered portfolio remains available offline. */
      });
    return () => {
      active = false;
      document.removeEventListener("pointerdown", mark);
      document.removeEventListener("keydown", mark);
      document.removeEventListener("input", mark);
    };
  }, []);
  useEffect(() => {
    if (pending.current) setContent(pending.current);
  }, [pathname]);
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}
