"use client";

import { useState, type FormEvent } from "react";
import { useContent } from "@/components/content-provider";
import { PageHeading, CVLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { linkedIn, safeUrl } from "@/lib/content";

export function ContactPage() {
  const { profile } = useContent();
  const [copyStatus, setCopyStatus] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Email address copied.");
    } catch {
      setCopyStatus("Please select and copy the email address above.");
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `Teaching enquiry${form.get("school") ? ` — ${form.get("school")}` : ""}`;
    const body = `Hello Krishna,\n\n${form.get("message")}\n\n${form.get("name")}\n${form.get("school")}\n${form.get("email")}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraftStatus(
      "Your email draft is ready to open. Nothing has been sent by this website. If no email app opens, use the email address alongside this form.",
    );
  }
  return (
    <div className="shell">
      <PageHeading
        label="Contact"
        title="Let’s start a conversation."
        description="For school teaching opportunities, academic work, and educational collaboration."
      />
      <div className="contact-layout">
        <section className="contact-details">
          <p className="eyebrow">Write to me</p>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email}
            <Icon />
          </a>
          <button className="text-link copy-button" onClick={copyEmail}>
            Copy email address
            <Icon name="copy" />
          </button>
          <p className="meta" role="status">
            {copyStatus}
          </p>
          <dl className="contact-facts">
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>From {profile.availability}</dd>
            </div>
            <div>
              <dt>Work preferences</dt>
              <dd>{profile.workPreferences}</dd>
            </div>
            <div>
              <dt>Eligibility</dt>
              <dd>{profile.eligibility}</dd>
            </div>
          </dl>
          <div className="actions">
            <CVLink />
            <a
              className="text-link"
              href={safeUrl(profile.linkedin) || linkedIn}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              <Icon />
            </a>
          </div>
        </section>
        <form className="contact-form" onSubmit={submit}>
          <h2>Prepare an email enquiry.</h2>
          <p className="meta">
            This form opens a draft in your email application.
          </p>
          <label htmlFor="contact-name">
            Your name
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              maxLength={120}
            />
          </label>
          <label htmlFor="contact-email">
            Email address
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
            />
          </label>
          <label htmlFor="contact-school">
            School or organisation <span className="meta">(optional)</span>
            <input
              id="contact-school"
              name="school"
              autoComplete="organization"
              maxLength={200}
            />
          </label>
          <label htmlFor="contact-message">
            Your message
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              maxLength={5000}
            />
          </label>
          <button className="button button-primary" type="submit">
            Open email draft
            <Icon name="mail" />
          </button>
          <p className="meta" role="status">
            {draftStatus}
          </p>
        </form>
      </div>
    </div>
  );
}
