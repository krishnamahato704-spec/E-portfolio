"use client";

import { useEffect, useState } from "react";

export function CaseContents({
  sections,
}: {
  sections: readonly { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id || "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(entry.target.id.replace("case-", ""));
        });
      },
      { rootMargin: "-112px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((section) => {
      const element = document.getElementById(`case-${section.id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);
  const position =
    Math.max(
      0,
      sections.findIndex((section) => section.id === active),
    ) + 1;
  return (
    <aside className="case-contents">
      <div className="contents-heading">
        <p className="eyebrow">Inside this record</p>
        <span className="meta">
          {String(position).padStart(2, "0")} /{" "}
          {String(sections.length).padStart(2, "0")}
        </span>
      </div>
      <nav aria-label="Case study contents">
        {sections.map((section, i) => (
          <a
            key={section.id}
            href={`#case-${section.id}`}
            aria-current={active === section.id ? "location" : undefined}
          >
            <span>0{i + 1}</span>
            {section.label}
          </a>
        ))}
      </nav>
      <p className="meta">
        Read the context,
        <br />
        then follow the evidence.
      </p>
    </aside>
  );
}
