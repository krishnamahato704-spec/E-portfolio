"use client";

import Link from "@/components/portfolio-link";
import { useContent } from "@/components/content-provider";
import {
  CVLink,
  Media,
  SectionHeading,
  TextLink,
  ContactBand,
} from "@/components/ui";
import { SelectedWork } from "@/components/selected-work";
import {
  Credentials,
  Education,
  ExperienceList,
  ResearchPapers,
} from "@/components/records";
import { Icon } from "@/components/icons";

export function HomePage() {
  const content = useContent();
  const { profile } = content;
  const names = profile.name.split(" ");
  return (
    <>
      <section className="hero shell" aria-labelledby="intro-name">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-rule" />
            History, education & research
          </p>
          <h1 id="intro-name">
            {names[0]}
            <br />
            <em>{names.slice(1).join(" ")}.</em>
          </h1>
          <p className="hero-statement">{profile.headline}</p>
          <p className="hero-description">{profile.summary}</p>
          <div className="actions">
            <Link className="button button-primary" href="/research/">
              View Publications
              <Icon />
            </Link>
            <CVLink />
          </div>
          <p className="hero-status">
            <span aria-hidden="true" />
            {profile.location} · Available from {profile.availability}
          </p>
        </div>
        <figure className="hero-figure">
          <div className="portrait-frame">
            <Media
              src={profile.portrait}
              alt={`Portrait of ${profile.name}`}
              width={1154}
              height={1400}
              priority
              sizes="(max-width: 767px) 82vw, (max-width: 1199px) 36vw, 420px"
              className="portrait"
            />
          </div>
          <figcaption>
            <span>
              Historian, Educator,
              <br />
              and Instructional Designer.
            </span>
            <span className="portrait-caption-mark" aria-hidden="true">
              KM / 2026
            </span>
          </figcaption>
        </figure>
      </section>
      <div className="intro-strip">
        <div className="shell intro-strip-inner">
          <p>
            A portfolio of teaching practice
            <br />
            and continuing inquiry.
          </p>
          <a href="#selected-work" className="text-link">
            Explore selected work<span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="shell">
        <section className="section" id="selected-work">
          <SectionHeading
            number="01"
            label="Selected teaching work"
            title="Ideas, put into practice."
            intro="A closer look at the materials, questions, and decisions behind my teaching."
          >
            <TextLink href="/teaching/">View all teaching work</TextLink>
          </SectionHeading>
          <SelectedWork />
        </section>
        <section className="section research-section" id="publications">
          <SectionHeading
            number="02"
            label="Research & presentations"
            title="Reading the past. Thinking ahead."
            intro="Work on history education, teacher preparation, and Indian Knowledge Systems."
          />
          <ResearchPapers featured />
        </section>
        <section className="section practice-section">
          <SectionHeading
            label="My teaching approach"
            title="A question is a place to start."
          />
          <div className="practice-grid">
            {content.practice.map((item, i) => (
              <article key={item.title} data-reveal>
                <span className="practice-number">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section" id="education">
          <SectionHeading
            number="03"
            label="Academic background"
            title="The foundations of my work."
          >
            <TextLink href="/about/">Read my background</TextLink>
          </SectionHeading>
          <Education />
        </section>
        <section className="section" id="experience">
          <SectionHeading
            number="04"
            label="Teaching experience"
            title="Learning through teaching."
          />
          <ExperienceList />
        </section>
        <section className="section" id="development">
          <SectionHeading
            number="05"
            label="Professional development"
            title="There is always more to learn."
          >
            <TextLink href="/credentials/">All credentials</TextLink>
          </SectionHeading>
          <Credentials curated />
        </section>
        <ContactBand />
      </div>
    </>
  );
}
