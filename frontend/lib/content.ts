import { defaultContent, mergeContent } from "../../src/content.js";

export interface Profile {
  name: string;
  email: string;
  eyebrow: string;
  headline: string;
  summary: string;
  portrait: string;
  roles: string[];
  subjects: string[];
  languages: string[];
  cv: string;
  availability: string;
  eligibility: string;
  location: string;
  workPreferences: string;
  targetClasses: string;
  targetBoards: string;
  linkedin?: string;
}
export interface Qualification {
  title: string;
  place: string;
  period: string;
  status: string;
  note?: string;
  expected?: string;
}
export interface Experience {
  id: string;
  title: string;
  institution?: string;
  type?: string;
  period: string;
  status?: string;
  summary: string;
  points: string[];
}
export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  thumbnail?: string;
  type?: string;
  subject?: string;
  grade?: string;
  date?: string;
  duration?: string;
  context?: string;
  evidenceStatus?: string;
}
export interface Certificate {
  id?: string;
  title: string;
  image: string;
  issuer: string;
  date: string;
  category: string;
  description: string;
  url?: string;
}
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  context: string;
  image: string;
}
export interface Portfolio {
  schemaVersion: number;
  profile: Profile;
  about: string;
  preparation: string;
  qualifications: Qualification[];
  experiences: Experience[];
  practice: { title: string; text: string }[];
  competencies: string[];
  certificates: Certificate[];
  resources: Resource[];
  gallery: GalleryItem[];
}

export const initialContent = mergeContent() as Portfolio;
export const basePath = "/E-portfolio";
export const canonical = "https://krishnamahato704-spec.github.io/E-portfolio/";
export const linkedIn = "https://www.linkedin.com/in/krishna-mahato-758523176";
export const asset = (path: string) => `${basePath}/assets/${path}`;

export function safeUrl(value = "") {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function mediaUrl(value = "") {
  if (!value) return "";
  if (value.startsWith(`${basePath}/assets/`)) return value;
  if (value === defaultContent.profile.portrait) return asset("portrait.webp");
  const index = defaultContent.certificates
    .slice(0, 4)
    .findIndex((record) => record.image === value);
  if (index >= 0) return asset(`certificate-${index + 1}.webp`);
  if (value.startsWith(canonical))
    return `${basePath}/${value.slice(canonical.length)}`;
  if (/^(\.\/)?assets\//.test(value))
    return `${basePath}/${value.replace(/^\.\//, "")}`;
  if (value.includes("/24c7a756-be36-4fd8-9462-6ee980c54736.pdf"))
    return asset("democracy-lesson-plan.pdf");
  return safeUrl(value);
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, stable(v)]),
    );
  return value;
}
export function cvDestination(content: Portfolio) {
  const custom = safeUrl(content.profile.cv);
  const matches = [
    "profile",
    "qualifications",
    "experiences",
    "competencies",
    "certificates",
    "resources",
  ].every(
    (key) =>
      JSON.stringify(stable(content[key as keyof Portfolio])) ===
      JSON.stringify(stable(initialContent[key as keyof Portfolio])),
  );
  return {
    href:
      custom ||
      (matches ? asset("krishna-mahato-resume.pdf") : `${basePath}/resume/`),
    downloadable: !!custom || matches,
  };
}

export function researchRecords(content: Portfolio) {
  return content.certificates.filter((record) =>
    /presentation|research|publication/i.test(record.category),
  );
}
export function researchTitle(record: Certificate) {
  const original = defaultContent.certificates.find(
    (item) => item.image === record.image,
  );
  return original &&
    original.title === record.title &&
    original.description === record.description
    ? "Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education"
    : record.title;
}
export function isKnownResearch(record: Certificate) {
  return researchTitle(record) !== record.title;
}
export function professionalCredentials(content: Portfolio) {
  return content.certificates.filter(
    (record) =>
      !/presentation|research|publication/i.test(record.category) &&
      !/bachelor|internship|gemini/i.test(record.title),
  );
}
