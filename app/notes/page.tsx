import type { Metadata } from "next";
import Link from "next/link";
import { getDeadnoteAbout, getDeadnoteEntries } from "@/lib/content";

export const metadata: Metadata = {
  title: "DEADNOTE — notes against mortality · ANSON WORLD",
  description:
    "Suppose I died today. Seven years of notes, ages 23 to 30 — published one honest entry at a time.",
};

export default function NotesPage() {
  const entries = getDeadnoteEntries();
  const about = getDeadnoteAbout();

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:px-8">
      <nav className="font-lab mb-14 flex items-center gap-6 text-xs tracking-[0.2em] text-[var(--muted)]">
        <Link href="/" className="transition-colors hover:text-[var(--text)]">
          ← THE LAB
        </Link>
        <Link href="/face" className="transition-colors hover:text-[var(--text)]">
          THE FACE
        </Link>
        <Link href="/profile" className="transition-colors hover:text-[var(--text)]">
          PROFILE
        </Link>
      </nav>

      <header>
        <div className="font-lab text-xs tracking-[0.35em] text-[var(--human)]">
          THE HUMAN WORLD · NOTES
        </div>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight">DEADNOTE</h1>
        <blockquote className="font-display mt-6 border-l-2 border-[var(--human)]/60 pl-5 text-xl font-bold leading-snug text-[var(--human-soft)]">
          "Suppose I died today…"
        </blockquote>
        {about && (
          <div
            className="note-body mt-6 text-sm leading-7 text-[var(--muted)]"
            dangerouslySetInnerHTML={{ __html: about.html }}
          />
        )}
      </header>

      <section className="mt-14 space-y-5">
        {entries.map((e) => (
          <Link
            key={e.slug}
            href={`/notes/${e.slug}`}
            className="block rounded-md border border-[var(--line)] bg-[var(--bg-raise)] p-6 transition-colors hover:border-[var(--human)]/50"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-bold">{e.title}</h2>
              <span className="font-lab text-[10px] tracking-[0.2em] text-[var(--muted)]">
                {e.backdrop.toUpperCase().replace(/-/g, " ")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{e.summaryEn}</p>
          </Link>
        ))}
      </section>

      <p className="font-lab mt-14 text-[11px] leading-6 text-[var(--muted)]">
        {entries.length} of 13 entries written so far are published. The rest wait for review —
        the bar: would I be comfortable with a hiring manager reading this the night before my
        interview?
      </p>
    </main>
  );
}
