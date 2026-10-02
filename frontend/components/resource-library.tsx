"use client";

import { useId, useMemo, useState } from "react";
import { useContent } from "./content-provider";
import { Media, EmptyState } from "./ui";
import { mediaUrl } from "@/lib/content";
import { Icon } from "./icons";

export function ResourceLibrary({
  presentationsOnly = false,
}: {
  presentationsOnly?: boolean;
}) {
  const { resources } = useContent();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const searchId = useId();
  const available = presentationsOnly
    ? resources.filter((record) => record.category === "Presentation")
    : resources;
  const categories = [
    "All",
    ...new Set(available.map((record) => record.category)),
  ];
  const visible = useMemo(
    () =>
      available.filter(
        (record) =>
          (category === "All" || record.category === category) &&
          [record.title, record.description, record.subject, record.grade]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [available, category, query],
  );
  return (
    <div className="resource-library">
      {!presentationsOnly && (
        <div className="library-controls">
          <div className="search-field">
            <label htmlFor={searchId}>Find a teaching resource</label>
            <input
              id={searchId}
              type="search"
              placeholder="Search by title, subject, or audience"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div
            className="filter-buttons"
            role="group"
            aria-label="Filter by resource type"
          >
            {categories.map((label) => (
              <button
                key={label}
                aria-pressed={category === label}
                onClick={() => setCategory(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="meta result-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? "resource" : "resources"}
        {query && ` matching “${query}”`}
      </p>
      <div className="resource-grid">
        {visible.map((record) => (
          <article className="resource-card" key={record.id}>
            <a
              href={mediaUrl(record.url)}
              className="resource-image"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Media src={record.thumbnail || ""} alt="" />
            </a>
            <div className="resource-copy">
              <p className="eyebrow">{record.category}</p>
              <h3>
                <a href={mediaUrl(record.url)}>{record.title}</a>
              </h3>
              <p>{record.description}</p>
              <p className="meta">
                {[record.grade, record.date].filter(Boolean).join(" · ")}
              </p>
              {record.evidenceStatus && (
                <p className="evidence-label">{record.evidenceStatus}</p>
              )}
              <a href={mediaUrl(record.url)} className="text-link">
                Open {record.type || "document"}
                <Icon />
              </a>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <EmptyState>
          {available.length
            ? "No resources match this search. Try another term or choose All."
            : "No teaching resources are currently published."}
        </EmptyState>
      )}
    </div>
  );
}
