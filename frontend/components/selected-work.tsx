"use client";

import Link from "@/components/portfolio-link";
import { useContent } from "./content-provider";
import { Media, EmptyState } from "./ui";
import { Icon } from "./icons";

export function SelectedWork({ all = false }: { all?: boolean }) {
  const content = useContent();
  const lesson = content.resources.find(
    (record) =>
      record.url.includes("24c7a756-be36-4fd8-9462-6ee980c54736") ||
      record.id === "390973e2-2b0c-43e1-a84d-3557cb60f18f",
  );
  const community = content.experiences.find(
    (record) => record.id === "pehchaan",
  );
  const election = content.gallery.find(
    (record) => record.id === "mock-election-activity",
  );
  const observation = content.experiences.find(
    (record) => record.id === "observation",
  );
  return (
    <div className="selected-work">
      {lesson && (
        <article className="work-feature" data-reveal>
          <Link
            className="work-image document-image"
            href="/teaching/democracy/"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Media src={lesson.thumbnail || ""} alt="" />
            <span className="preview-action" aria-hidden="true">
              Read case study
              <Icon />
            </span>
            <span className="image-index" aria-hidden="true">
              01 / Lesson planning
            </span>
          </Link>
          <div className="work-copy">
            <p className="eyebrow">Social Science · {lesson.grade}</p>
            <h3>
              <Link href="/teaching/democracy/">
                Democracy.
                <br />
                <em>
                  From questions
                  <br className="hidden lg:block" /> to explanation.
                </em>
              </Link>
            </h3>
            <p>{lesson.description}</p>
            <p className="meta">
              {lesson.date} · {lesson.duration} · Planning evidence
            </p>
            <Link className="text-link" href="/teaching/democracy/">
              Read the lesson case study
              <Icon />
            </Link>
          </div>
        </article>
      )}
      <div className="work-pair">
        {community && (
          <article className="work-card" data-reveal>
            <Link
              className="work-image"
              href="/teaching/pehchaan/"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Media
                src={
                  content.gallery.find(
                    (record) => record.id === "pehchaan-collage",
                  )?.image || ""
                }
                alt=""
              />
              <span className="preview-action" aria-hidden="true">
                Explore the record
                <Icon />
              </span>
              <span className="image-index" aria-hidden="true">
                02 / Community teaching
              </span>
            </Link>
            <div className="work-card-copy">
              <p className="eyebrow">Foundational learning · Adult literacy</p>
              <h3>
                <Link href="/teaching/pehchaan/">
                  Learning beyond
                  <br />
                  the school classroom.
                </Link>
              </h3>
              <p>{community.summary}</p>
              <Link className="text-link" href="/teaching/pehchaan/">
                Explore the community internship
                <Icon />
              </Link>
            </div>
          </article>
        )}
        {election && (
          <article className="work-card" data-reveal>
            <Link
              className="work-image"
              href="/teaching/mock-election/"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Media
                src={election.image}
                alt=""
                width={1024}
                height={1536}
                sizes="(max-width: 767px) 38vw, (max-width: 1199px) 20vw, 240px"
              />
              <span className="preview-action" aria-hidden="true">
                Read the materials
                <Icon />
              </span>
              <span className="image-index" aria-hidden="true">
                03 / Teaching materials
              </span>
            </Link>
            <div className="work-card-copy">
              <p className="eyebrow">Civics · Classroom activity</p>
              <h3>
                <Link href="/teaching/mock-election/">
                  Making participation
                  <br />a classroom question.
                </Link>
              </h3>
              <p>{election.description}</p>
              <Link className="text-link" href="/teaching/mock-election/">
                Examine the teaching materials
                <Icon />
              </Link>
            </div>
          </article>
        )}
        {all && observation && (
          <article className="work-card text-work-card" data-reveal>
            <p className="eyebrow">04 / Classroom observation</p>
            <h3>{observation.institution}</h3>
            <p>{observation.summary}</p>
            <p className="meta">{observation.period}</p>
            <Link href="/teaching/observation/" className="text-link">
              Read the observation record
              <Icon />
            </Link>
          </article>
        )}
      </div>
      {!lesson && !community && !election && (
        <EmptyState>
          Selected teaching materials are not currently published.
        </EmptyState>
      )}
    </div>
  );
}
