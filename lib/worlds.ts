import fs from "node:fs";
import path from "node:path";
import { getDeadnoteAbout, getDeadnoteEntries, getDeadnoteEntry, getProject } from "./content";

/* The explorable world is a graph of rooms (content/worlds.json). Static rooms
   come from the JSON; DEADNOTE entry rooms are generated from the published
   notes. Every room re-presents content that already exists on a flat page,
   which stays the canonical, indexable copy (PLAN §0.3). */

export type Side = "machine" | "human";

export interface Door {
  to: string; // room path ("machine/field") or absolute site URL ("/profile")
  label: string;
  hint?: string;
}

export interface Station {
  heading?: string;
  html: string;
}

export interface Crumb {
  href?: string;
  label: string;
}

export interface RoomView {
  path: string;
  side: Side;
  title: string;
  subtitle?: string;
  intro?: string;
  note?: string;
  backdrop: string;
  doors: Door[];
  stations: Station[];
  crumbs: Crumb[];
  canonical?: string;
  cta?: { label: string; href: string };
}

interface RoomDef {
  side: Side;
  title: string;
  subtitle?: string;
  intro?: string;
  note?: string;
  backdrop?: string;
  doors?: Door[];
  content?: { type: "project" | "deadnote-index"; slug?: string };
}

const BACKDROPS: Record<string, string> = {
  "lab-hero": "/worlds/lab-hero.webp",
  "white-void": "/worlds/white-void.webp",
  "double-warm": "/worlds/double-warm.webp",
};

const CONTACT = "mailto:suneric0228@gmail.com";

function loadDefs(): Record<string, RoomDef> {
  const file = path.join(process.cwd(), "content", "worlds.json");
  return JSON.parse(fs.readFileSync(file, "utf8")).rooms as Record<string, RoomDef>;
}

function resolveBackdrop(key: string | undefined, side: Side): string {
  if (key && BACKDROPS[key]) return BACKDROPS[key];
  return side === "human" ? BACKDROPS["white-void"] : BACKDROPS["lab-hero"];
}

/* a project body becomes one station per <h2> section */
function splitSections(html: string): Station[] {
  return html
    .split(/(?=<h2[^>]*>)/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/);
      return m ? { heading: m[1].replace(/<[^>]+>/g, ""), html: s.slice(m[0].length) } : { html: s };
    })
    .filter((st) => st.html.replace(/<[^>]+>/g, "").trim() || st.heading);
}

/* a note becomes one station per block — read a paragraph at a time */
function splitBlocks(html: string): Station[] {
  const blocks =
    html.match(/<(p|blockquote|h[1-6]|ul|ol)[^>]*>[\s\S]*?<\/\1>/g) ?? [html];
  return blocks
    .filter((b) => b.replace(/<[^>]+>/g, "").trim())
    .map((b) => ({ html: b }));
}

function crumbsFor(defs: Record<string, RoomDef>, roomPath: string, title: string): Crumb[] {
  const segs = roomPath.split("/");
  const crumbs: Crumb[] = [
    { href: "/", label: "THE LAB" },
    { href: "/face", label: "THE FACE" },
  ];
  for (let i = 1; i < segs.length; i++) {
    const prefix = segs.slice(0, i).join("/");
    crumbs.push({ href: `/world/${prefix}`, label: defs[prefix]?.title ?? prefix.toUpperCase() });
  }
  crumbs.push({ label: title });
  return crumbs;
}

export function getAllRoomPaths(): string[] {
  const defs = loadDefs();
  return [...Object.keys(defs), ...getDeadnoteEntries().map((e) => `human/deadnote/${e.slug}`)];
}

export function getRoom(segments: string[]): RoomView | null {
  const defs = loadDefs();
  const roomPath = segments.join("/");

  // DEADNOTE entry rooms are generated from the published notes
  if (segments.length === 3 && segments[0] === "human" && segments[1] === "deadnote") {
    const entry = getDeadnoteEntry(segments[2]);
    if (!entry) return null;
    const entries = getDeadnoteEntries();
    const idx = entries.findIndex((e) => e.slug === entry.slug);
    const doors: Door[] = [];
    if (idx > 0)
      doors.push({ to: `human/deadnote/${entries[idx - 1].slug}`, label: `← ${entries[idx - 1].title.replace("DEADNOTE · ", "")}` });
    if (idx < entries.length - 1)
      doors.push({ to: `human/deadnote/${entries[idx + 1].slug}`, label: `${entries[idx + 1].title.replace("DEADNOTE · ", "")} →` });
    return {
      path: roomPath,
      side: "human",
      title: entry.title,
      subtitle: entry.summaryEn,
      backdrop: resolveBackdrop(entry.backdrop, "human"),
      doors,
      stations: splitBlocks(entry.html),
      crumbs: crumbsFor(defs, roomPath, entry.title.replace("DEADNOTE · ", "")),
      canonical: `/notes/${entry.slug}`,
      cta: { label: "Write to me about this", href: `${CONTACT}?subject=DEADNOTE` },
    };
  }

  const def = defs[roomPath];
  if (!def) return null;

  let stations: Station[] = [];
  let doors: Door[] = def.doors ?? [];
  let canonical: string | undefined;

  if (def.content?.type === "project" && def.content.slug) {
    const project = getProject(def.content.slug);
    if (project) {
      stations = [
        {
          heading: "Status",
          html:
            `<p><em>${project.honestLine}</em></p>` +
            (project.stack.length ? `<p>${project.stack.join(" · ")}</p>` : ""),
        },
        ...splitSections(project.html),
      ];
      canonical = `/work/${project.slug}`;
    }
  } else if (def.content?.type === "deadnote-index") {
    const about = getDeadnoteAbout();
    if (about) stations = splitBlocks(about.html).slice(0, 4);
    doors = [
      ...doors,
      ...getDeadnoteEntries().map((e) => ({
        to: `human/deadnote/${e.slug}`,
        label: e.title.replace("DEADNOTE · ", ""),
        hint: e.summaryEn,
      })),
    ];
    canonical = "/notes";
  }

  return {
    path: roomPath,
    side: def.side,
    title: def.title,
    subtitle: def.subtitle,
    intro: def.intro,
    note: def.note,
    backdrop: resolveBackdrop(def.backdrop, def.side),
    doors,
    stations,
    crumbs: crumbsFor(defs, roomPath, def.title),
    canonical,
    cta:
      def.side === "machine"
        ? { label: "Talk to Anson", href: `${CONTACT}?subject=A%20workflow%20that%20hurts` }
        : undefined,
  };
}
