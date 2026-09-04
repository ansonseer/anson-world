import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// The /content directory is the single source of truth (PLAN §0.3).
// This loader feeds the flat pages; the same files later feed AI Anson and the 3D rooms.

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface DeadnoteEntry {
  slug: string; // "day-1"
  title: string;
  summaryEn: string;
  backdrop: string;
  html: string; // rendered body (zh original)
  dayNumber: number;
}

export interface ProjectDoc {
  slug: string;
  title: string;
  status: "shipped" | "built-v1-demo" | "in-progress" | "failed-experiment" | "exercise";
  honestLine: string;
  stack: string[];
  summary: string;
  html: string;
}

/* [FILL: ...] markers are content-intake scaffolding, never public copy.
   Remove the bracketed block itself (which may span lines) so surrounding
   sentences stay intact; any unclosed leftover line is dropped whole. */
function stripFillLines(markdown: string): string {
  return markdown
    .replace(/\[FILL[\s\S]*?\]/g, "")
    .split("\n")
    .filter((line) => !line.includes("[FILL"))
    .map((line) => (line.trim() === "" ? "" : line))
    .join("\n");
}

function renderMarkdown(markdown: string): string {
  return marked.parse(stripFillLines(markdown), { async: false }) as string;
}

export function getDeadnoteEntries(): DeadnoteEntry[] {
  const dir = path.join(CONTENT_ROOT, "deadnote");
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("day-") && f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      const slug = f.replace(/\.md$/, "");
      return {
        slug,
        title: String(data.title ?? slug),
        summaryEn: String(data.summary_en ?? ""),
        backdrop: String(data.scene_backdrop ?? "white-void"),
        html: renderMarkdown(content),
        dayNumber: Number.parseInt(slug.replace("day-", ""), 10) || 0,
        publish: data.publish === true,
      };
    })
    .filter((e) => e.publish)
    .map(({ publish: _publish, ...entry }) => entry)
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export function getDeadnoteEntry(slug: string): DeadnoteEntry | null {
  return getDeadnoteEntries().find((e) => e.slug === slug) ?? null;
}

export function getDeadnoteAbout(): { title: string; html: string } | null {
  const file = path.join(CONTENT_ROOT, "deadnote", "about.md");
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (data.publish !== true) return null;
  return { title: String(data.title ?? "DEADNOTE"), html: renderMarkdown(content) };
}

export function getProjects(): ProjectDoc[] {
  const dir = path.join(CONTENT_ROOT, "projects");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => ({ file: f, ...matter(fs.readFileSync(path.join(dir, f), "utf8")) }))
    .filter(({ data }) => data.draft !== true)
    .map(({ file, data, content }) => {
      return {
        slug: String(data.slug ?? file.replace(/\.mdx?$/, "")),
        title: String(data.title ?? file),
        status: (data.status ?? "in-progress") as ProjectDoc["status"],
        honestLine: String(data.honest_status_line ?? ""),
        stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
        summary: String(data.summary ?? ""),
        html: renderMarkdown(content),
      };
    })
    .sort((a, b) => {
      const order: Record<string, number> = {
        shipped: 0,
        "in-progress": 1,
        "built-v1-demo": 2,
        exercise: 3,
        "failed-experiment": 4,
      };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    });
}

export function getProject(slug: string): ProjectDoc | null {
  return getProjects().find((p) => p.slug === slug) ?? null;
}
