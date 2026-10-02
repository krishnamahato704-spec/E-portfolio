"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useContent } from "./content-provider";
import { Media, EmptyState } from "./ui";
import { Icon } from "./icons";
import { mediaUrl, type GalleryItem } from "@/lib/content";

export function Gallery() {
  const { gallery } = useContent();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    if (!selected && dialog.current?.open) dialog.current?.close();
  }, [selected]);
  return (
    <>
      <div className="gallery-grid">
        {gallery.map((record) => (
          <figure key={record.id}>
            <button
              className="gallery-image"
              onClick={() => setSelected(record)}
              aria-label={`Enlarge ${record.title}`}
            >
              <Media src={record.image} alt={record.title} />
              <span aria-hidden="true">
                <Icon />
              </span>
            </button>
            <figcaption>
              <p className="eyebrow">{record.category}</p>
              <h3>{record.title}</h3>
              <p className="meta">{record.context}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      {!gallery.length && (
        <EmptyState>No gallery images are currently published.</EmptyState>
      )}
      <dialog
        ref={dialog}
        className="image-dialog"
        aria-label={selected?.title || "Image preview"}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
      >
        {selected && (
          <m.div
            className="dialog-content"
            initial={reduced ? false : { opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="icon-button dialog-close"
              onClick={() => setSelected(null)}
              aria-label="Close image preview"
              autoFocus
            >
              <Icon name="close" />
            </button>
            <Media
              src={selected.image}
              alt={selected.title}
              className="dialog-image"
              sizes="(max-width: 767px) 92vw, 960px"
            />
            <div className="dialog-caption">
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <p className="meta">{selected.context}</p>
              <a className="text-link" href={mediaUrl(selected.image)}>
                Open original image
                <Icon />
              </a>
            </div>
          </m.div>
        )}
      </dialog>
    </>
  );
}
