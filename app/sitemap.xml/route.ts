import { getDeadnoteEntries, getProjects } from "@/lib/content";

export const dynamic = "force-static";

const BASE = "https://ansonseer.world";

export function GET() {
  const urls: { loc: string; priority: number }[] = [
    { loc: `${BASE}/`, priority: 1.0 },
    { loc: `${BASE}/face`, priority: 0.8 },
    { loc: `${BASE}/profile`, priority: 0.9 },
    { loc: `${BASE}/notes`, priority: 0.8 },
    ...getProjects().map((p) => ({ loc: `${BASE}/work/${p.slug}`, priority: 0.7 })),
    ...getDeadnoteEntries().map((e) => ({ loc: `${BASE}/notes/${e.slug}`, priority: 0.6 })),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority.toFixed(1)}</priority></url>`)
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
