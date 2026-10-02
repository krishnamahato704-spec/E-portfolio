"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Media } from "./ui";

const notes = [
  {
    title: "The starting question",
    pages: "Pages 1–3",
    text: "The plan starts with prior-knowledge questions. These ask learners to recall the meaning of democracy and other forms of government before a new explanation.",
  },
  {
    title: "Ways into the idea",
    pages: "Pages 4–5",
    text: "A concept diagram, photographs, discussion, and written responses provide several ways to encounter the idea. The document does not specify individual adaptations.",
  },
  {
    title: "What the evidence shows",
    pages: "Pages 5–6",
    text: "Assessment prompts are present. Completed student responses and the final reflection are not included, so the file supports a review of planning.",
  },
];
export function DocumentNotes({ image }: { image: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  return (
    <section
      className="document-notes"
      aria-label="Explore notes on the lesson plan"
    >
      <figure>
        <Media src={image} alt="First page of the Democracy lesson plan" />
        <figcaption className="meta">
          Original lesson plan · Page 1 of 6
        </figcaption>
      </figure>
      <div className="notes-panel">
        <p className="eyebrow">Look a little closer</p>
        <h2>Behind the plan.</h2>
        <div className="notes-tabs" role="tablist" aria-label="Document notes">
          {notes.map((note, i) => (
            <button
              key={note.title}
              ref={(element) => {
                buttons.current[i] = element;
              }}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-controls={`${id}-panel-${i}`}
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? (i + 1) % notes.length
                    : event.key === "ArrowLeft"
                      ? (i + notes.length - 1) % notes.length
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? notes.length - 1
                          : -1;
                if (next >= 0) {
                  event.preventDefault();
                  setActive(next);
                  buttons.current[next]?.focus();
                }
              }}
            >
              {String(i + 1).padStart(2, "0")}
              <span className="sr-only"> · {note.title}</span>
            </button>
          ))}
        </div>
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={active}
            role="tabpanel"
            id={`${id}-panel-${active}`}
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
            initial={reduced ? false : { opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduced ? 1 : 0.6 }}
            transition={{ duration: reduced ? 0 : 0.1 }}
          >
            <p className="meta">{notes[active].pages}</p>
            <h3>{notes[active].title}</h3>
            <p>{notes[active].text}</p>
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
