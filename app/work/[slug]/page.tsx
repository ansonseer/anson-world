import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";
import { statusLabel } from "@/lib/site-data";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: `${p.title} · ANSON WORLD`,
    description: p.summary,
    openGraph: {
      title: p.title,
      description: p.summary,
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const tone =
    p.status === "failed-experiment"
      ? "border-[var(--human)]/50 text-[var(--human)]"
      : p.status === "in-progress"
        ? "border-[var(--machine-signal)]/50 text-[var(--machine-signal)]"
        : "border-[var(--machine)]/50 text-[var(--machine)]";

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:px-8">
      <nav className="font-lab mb-14 flex items-center gap-6 text-xs tracking-[0.2em] text-[var(--muted)]">
        <Link href="/profile#work" className="transition-colors hover:text-[var(--text)]">
          ← ALL WORK
        </Link>
        <Link href="/" className="transition-colors hover:text-[var(--text)]">
          THE LAB
        </Link>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{p.title}</h1>
          <span
            className={`font-lab whitespace-nowrap rounded-sm border px-2 py-1 text-[10px] tracking-[0.15em] ${tone}`}
          >
            {statusLabel[p.status as keyof typeof statusLabel] ?? p.status.toUpperCase()}
          </span>
        </div>
        <p className="font-lab mt-4 border-l-2 border-[var(--line)] pl-4 text-xs leading-6 text-[var(--muted)]">
          {p.honestLine}
        </p>
        {p.stack.length > 0 && (
          <p className="font-lab mt-4 text-[11px] tracking-[0.1em] text-[var(--muted)]">
            {p.stack.join(" · ")}
          </p>
        )}
      </header>

      <article
        className="note-body mt-10 leading-8 text-[var(--text)]/90"
        dangerouslySetInnerHTML={{ __html: p.html }}
      />

      <div className="font-lab mt-14 border-t border-[var(--line)] pt-6 text-xs leading-6 text-[var(--muted)]">
        Have a workflow that hurts?{" "}
        <a
          href="mailto:suneric0228@gmail.com?subject=A%20workflow%20that%20hurts"
          className="text-[var(--text)] underline underline-offset-4 hover:text-[var(--human-soft)]"
        >
          Talk to Anson
        </a>
      </div>
    </main>
  );
}
