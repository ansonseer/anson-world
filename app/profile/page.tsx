import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";
import { identity, statusLabel } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Quick Profile — Anson Sun",
  description:
    "AI engineer & builder. Two systems delivered, one failed delivery written up publicly. The 30-second version of Anson World.",
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "failed-experiment"
      ? "border-[var(--human)]/50 text-[var(--human)]"
      : status === "in-progress"
        ? "border-[var(--machine-signal)]/50 text-[var(--machine-signal)]"
        : "border-[var(--machine)]/50 text-[var(--machine)]";
  return (
    <span className={`font-lab whitespace-nowrap rounded-sm border px-2 py-1 text-[10px] tracking-[0.15em] ${tone}`}>
      {statusLabel[status] ?? status.toUpperCase()}
    </span>
  );
}

export default function ProfilePage() {
  const all = getProjects();
  const main = all.filter((p) => p.status !== "failed-experiment" && p.status !== "exercise");
  const failed = all.filter((p) => p.status === "failed-experiment");

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:px-8">
      <nav className="font-lab mb-14 flex items-center gap-6 text-xs tracking-[0.2em] text-[var(--muted)]">
        <Link href="/" className="transition-colors hover:text-[var(--text)]">
          ← THE LAB
        </Link>
        <Link href="/face" className="transition-colors hover:text-[var(--text)]">
          THE FACE
        </Link>
        <Link href="/notes" className="transition-colors hover:text-[var(--text)]">
          DEADNOTE
        </Link>
      </nav>

      {/* identity */}
      <header id="top">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{identity.name}</h1>
        <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{identity.oneLiner}</p>
        <div className="font-lab mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
          <span>{identity.location}</span>
          <a href={`mailto:${identity.email}`} className="text-[var(--text)] underline underline-offset-4 hover:text-[var(--human-soft)]">
            {identity.email}
          </a>
          <a href={identity.github} className="underline underline-offset-4 hover:text-[var(--text)]" target="_blank" rel="noreferrer">
            github/ansonseer
          </a>
          <a href={identity.x} className="underline underline-offset-4 hover:text-[var(--text)]" target="_blank" rel="noreferrer">
            x/@{identity.handle}
          </a>
        </div>
        <p className="font-lab mt-8 border-l-2 border-[var(--line)] pl-4 text-xs leading-6 text-[var(--muted)]">
          Every status badge on this page is honest by design: nothing here is called delivered
          unless a real client has it in their hands.
        </p>
      </header>

      {/* work */}
      <section id="work" className="mt-20 scroll-mt-24">
        <h2 className="font-lab text-xs tracking-[0.35em] text-[var(--machine)]">BUILT — THE MACHINE SIDE</h2>
        <div className="mt-6 space-y-6">
          {main.map((p) => (
            <Link key={p.slug} href={`/work/${p.slug}`} className="block">
              <article className="rounded-md border border-[var(--line)] bg-[var(--bg-raise)] p-6 transition-colors hover:border-[var(--machine)]/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="font-lab mt-3 text-xs leading-5 text-[var(--muted)]">{p.honestLine}</p>
                <p className="mt-3 leading-7 text-[var(--text)]/90">{p.summary}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* failed experiments */}
      <section id="experiments" className="mt-20 scroll-mt-24">
        <h2 className="font-lab text-xs tracking-[0.35em] text-[var(--human)]">FAILED — SAID OUT LOUD</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
          What I believed, what broke, what changed my mind — failure written up properly builds
          more trust than another success card.
        </p>
        <div className="mt-6 space-y-6">
          {failed.map((p) => (
            <Link key={p.slug} href={`/work/${p.slug}`} className="block">
              <article className="rounded-md border border-[var(--line)] bg-[var(--bg-raise)] p-6 transition-colors hover:border-[var(--human)]/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="font-lab mt-3 text-xs leading-5 text-[var(--muted)]">{p.honestLine}</p>
                <p className="mt-3 leading-7 text-[var(--text)]/90">{p.summary}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* philosophy */}
      <section id="philosophy" className="mt-20 scroll-mt-24">
        <h2 className="font-lab text-xs tracking-[0.35em] text-[var(--human)]">DEADNOTE — THE HUMAN SIDE</h2>
        <blockquote className="font-display mt-6 border-l-2 border-[var(--human)]/60 pl-5 text-2xl font-bold leading-snug">
          "Suppose I died today…"
        </blockquote>
        <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
          Notes written against mortality, one day at a time — ages 23 to 30. Four entries are
          published; the rest wait for review.
        </p>
        <Link
          href="/notes"
          className="font-lab mt-6 inline-block rounded-sm border border-[var(--human)]/50 bg-[var(--human)]/5 px-6 py-3 text-xs tracking-[0.25em] text-[var(--human-soft)] transition-all hover:bg-[var(--human)]/15"
        >
          READ THE NOTES →
        </Link>
      </section>

      {/* services */}
      <section id="services" className="mt-20 scroll-mt-24">
        <h2 className="font-lab text-xs tracking-[0.35em] text-[var(--machine)]">WORK WITH ME</h2>
        <p className="mt-4 max-w-xl leading-7 text-[var(--text)]/90">
          I don't start from a proposal deck. I start from your actual operation — watch one
          workflow run, find where information dies, then build the smallest system that removes
          that death. Bilingual delivery, 中文 / English. Two systems delivered so far; one failed
          delivery written up publicly, because that's how you should judge a builder.
        </p>
        <ul className="font-lab mt-5 space-y-2 text-xs leading-6 text-[var(--muted)]">
          <li>
            <span className="text-[var(--text)]">THE AUDIT</span> — 60–90 min + a one-page
            automation map with fixed quotes. A$390, credited to any project.
          </li>
          <li>
            <span className="text-[var(--text)]">QUICK WIN</span> — one workflow automated end to
            end, 1–2 weeks. A$1.8k–4.8k fixed.
          </li>
          <li>
            <span className="text-[var(--text)]">INTERNAL SYSTEM</span> — a full staff-facing tool,
            3–6 weeks. A$6.5k–18k, milestone billing.
          </li>
          <li>
            <span className="text-[var(--text)]">FORWARD-DEPLOYED</span> — your AI department,
            monthly. A$1.2k–3.2k/mo.
          </li>
        </ul>
        <a
          href={`mailto:${identity.email}?subject=A%20workflow%20that%20hurts`}
          className="font-lab mt-6 inline-block rounded-sm border border-[var(--seam)]/60 bg-[var(--seam)]/5 px-6 py-3 text-xs tracking-[0.25em] transition-all hover:bg-[var(--seam)]/15"
        >
          TALK TO ANSON →
        </a>
      </section>

      <footer className="font-lab mt-24 border-t border-[var(--line)] pt-6 text-[10px] tracking-[0.2em] text-[var(--muted)]">
        ANSON WORLD · BUILT IN THE OPEN — HONESTY AS AESTHETIC
      </footer>
    </main>
  );
}
