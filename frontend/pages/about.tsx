"use client";

import { useContent } from "@/components/content-provider";
import {
  PageHeading,
  Media,
  SectionHeading,
  CVLink,
  ContactBand,
} from "@/components/ui";
import { Education, ExperienceList } from "@/components/records";

export function AboutPage() {
  const content = useContent();
  return (
    <div className="shell">
      <PageHeading
        label="About / Academic background"
        title="History, education, and the classroom."
        description={content.profile.summary}
      />
      <section className="about-introduction" data-reveal>
        <figure>
          <Media
            src={content.profile.portrait}
            alt={`Portrait of ${content.profile.name}`}
            width={1154}
            height={1400}
            className="about-portrait"
          />
          <figcaption className="meta">
            {content.profile.name} · {content.profile.location}
          </figcaption>
        </figure>
        <div className="prose">
          <p className="eyebrow">A continuing inquiry</p>
          <h2>Why I teach History.</h2>
          <p>{content.about}</p>
          <p>{content.preparation}</p>
          <CVLink />
        </div>
      </section>
      <section className="section">
        <SectionHeading
          label="Academic record"
          title="Education & continued study."
        />
        <Education full />
      </section>
      <section className="section">
        <SectionHeading
          label="Experience"
          title="Learning in real classrooms."
        />
        <ExperienceList full />
      </section>
      <section className="section" data-reveal>
        <SectionHeading
          label="Practice & skills"
          title="What I bring to the classroom."
        />
        <ul className="competency-list">
          {content.competencies.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <dl className="profile-facts">
          <div>
            <dt>Teaching interests</dt>
            <dd>{content.profile.roles.join(" · ")}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>{content.profile.languages.join(" · ")}</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>From {content.profile.availability}</dd>
          </div>
          <div>
            <dt>Work preferences</dt>
            <dd>{content.profile.workPreferences}</dd>
          </div>
        </dl>
      </section>
      <ContactBand />
    </div>
  );
}
