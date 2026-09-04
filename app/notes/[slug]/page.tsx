import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeadnoteEntries, getDeadnoteEntry } from "@/lib/content";

export function generateStaticParams() {
  return getDeadnoteEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDeadnoteEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} · ANSON WORLD`,
    description: entry.summaryEn,
    openGraph: {
      title: entry.title,
      description: entry.summaryEn,
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getDeadnoteEntry(slug);
  if (!entry) notFound();

  const entries = getDeadnoteEntries();
  const idx = entries.findIndex((e) => e.slug === entry.slug);
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx < entries.length - 1 ? entries[idx + 1] : null;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:px-8">
      <nav className="font-lab mb-14 flex items-center gap-6 text-xs tracking-[0.2em] text-[var(--muted)]">
        <Link href="/notes" className="transition-colors hover:text-[var(--text)]">
          ← DEADNOTE
        </Link>
        <Link href="/" className="transition-colors hover:text-[var(--text)]">
          THE LAB
        </Link>
        <Link href="/profile" className="transition-colors hover:text-[var(--text)]">
          PROFILE
        </Link>
      </nav>

      <header>
        <div className="font-lab text-[10px] tracking-[0.3em] text-[var(--muted)]">
          BACKDROP · {entry.backdrop.toUpperCase().replace(/-/g, " ")}
        </div>
        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight">{entry.title}</h1>
        <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">{entry.summaryEn}</p>
      </header>

      <article
        className="note-body mt-10 leading-8 text-[var(--text)]/90"
        dangerouslySetInnerHTML={{ __html: entry.html }}
      />

      <div className="font-lab mt-14 border-t border-[var(--line)] pt-6 text-xs leading-6 text-[var(--muted)]">
        Want to talk about this one?{" "}
        <a
          href="mailto:suneric0228@gmail.com?subject=DEADNOTE"
          className="text-[var(--text)] underline underline-offset-4 hover:text-[var(--human-soft)]"
        >
          Write to me
        </a>
        {" "}— AI Anson joins in Phase 1b.
      </div>

      <nav className="font-lab mt-8 flex justify-between text-xs tracking-[0.15em] text-[var(--muted)]">
        {prev ? (
          <Link href={`/notes/${prev.slug}`} className="transition-colors hover:text-[var(--text)]">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/notes/${next.slug}`} className="transition-colors hover:text-[var(--text)]">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
