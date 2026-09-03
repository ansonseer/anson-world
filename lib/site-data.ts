// Prototype data layer.
// Phase 1a replaces this file with the MDX loader over /content — the copy below
// is transcribed from content/projects/*.mdx and content/kb/facts.md, and must
// stay consistent with the Fact Record (content/kb/facts.md).
// "delivered" is a whitelist: only the two projects marked shipped may use it (facts.md #7–8).

export type ProjectStatus =
  | "shipped"
  | "built-v1-demo"
  | "in-progress"
  | "failed-experiment";

export interface Project {
  title: string;
  slug: string;
  status: ProjectStatus;
  honestLine: string;
  summary: string;
  side: "machine" | "human";
}

export const projects: Project[] = [
  {
    title: "Shoe Locator",
    slug: "shoe-locator",
    status: "shipped",
    honestLine:
      "Paid pilot delivered to a Sydney footwear logistics company — after a first version nobody asked for.",
    summary:
      "A warehouse that ran on one senior worker's memory; now any order is found in two scans, from the phone browser. The hard part wasn't the code — it was who made the case.",
    side: "machine",
  },
  {
    title: "Clinic WeChat Assistant",
    slug: "clinic-wechat-bot",
    status: "shipped",
    honestLine:
      "Phase 1 delivered & live: idempotent webhook intake. Phase 2 (retrieval + guardrails + evals) in development — not delivered.",
    summary:
      "A Sydney vet clinic's front desk drowned in repeated calls. The hard part isn't the model — it's proving the system runs unattended, safely.",
    side: "machine",
  },
  {
    title: "Crew — a decision instrument",
    slug: "crew",
    status: "in-progress",
    honestLine:
      "v2 built & tested (2026-07); in personal trial — still backfilling my own decision data. Not publicly released.",
    summary:
      "A personal case-law system: record real decisions with their reasoning, then make the archive argue with you before the next one.",
    side: "machine",
  },
];

export const failedExperiments: Project[] = [
  {
    title: "Retail Pricing Tool",
    slug: "retail-pricing-tool",
    status: "failed-experiment",
    honestLine: "Working demo, real client — the delivery failed. Never adopted.",
    summary:
      "A bilingual receiving & pricing ledger for a two-store retail operation. Built well, landed badly — the public write-up says why.",
    side: "machine",
  },
  {
    title: "Job Agent",
    slug: "job-agent",
    status: "failed-experiment",
    honestLine: "Built. Adopted by no one.",
    summary:
      "A five-agent job-search pipeline. What I believed, what broke, and what it changed in how I build — written up as a story, not hidden.",
    side: "machine",
  },
];

export const identity = {
  name: "Anson Sun",
  handle: "Ansonseer",
  oneLiner:
    "AI engineer & builder. I walk into real operations — warehouse floors, clinics, logistics companies — watch how work actually happens, then build AI systems for it. Bilingual delivery, 中文 / English.",
  location: "Sydney, Australia",
  email: "suneric0228@gmail.com",
  github: "https://github.com/ansonseer",
  x: "https://x.com/Ansonseer",
};

export const statusLabel: Record<ProjectStatus, string> = {
  shipped: "DELIVERED",
  "built-v1-demo": "BUILT · V1 + DEMO",
  "in-progress": "IN PROGRESS",
  "failed-experiment": "FAILED",
};
