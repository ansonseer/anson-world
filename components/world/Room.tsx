"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { RoomView } from "@/lib/worlds";

/* RoomTemplate (PLAN §5.4): a backdrop with parallax, a progressive story
   (one station at a time), and doors to the next rooms. Transitions cut to
   black and back — you are teleported, not navigated. */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function Room({ room }: { room: RoomView }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const light = room.side === "human";
  const [revealed, setRevealed] = useState(1);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const bg = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      if (bg.current) bg.current.style.transform = `scale(1.06) translate(${-x * 16}px, ${-y * 10}px)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const go = (to: string) => {
    const href = to.startsWith("/") ? to : `/world/${to}`;
    if (reduced) {
      router.push(href);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => router.push(href), 420);
  };

  const allShown = revealed >= room.stations.length;
  const text = light ? "text-[#241c12]" : "text-[var(--text)]";
  const muted = light ? "text-[#6b5f4d]" : "text-[var(--muted)]";
  const line = light ? "border-[#241c12]/20" : "border-[var(--line)]";
  const card = light
    ? "border-[#241c12]/15 bg-white/55 hover:border-[#241c12]/40 hover:bg-white/75"
    : "border-[var(--line)] bg-[var(--bg-raise)]/80 hover:border-[var(--machine)]/60";

  return (
    <main className={`relative min-h-screen overflow-hidden ${light ? "room-light bg-[#ece8e0]" : "bg-[var(--bg)]"} ${text}`}>
      {/* backdrop + tint */}
      <div
        ref={bg}
        aria-hidden
        className={`absolute inset-0 bg-cover bg-center will-change-transform ${reduced ? "" : "room-drift"}`}
        style={{ backgroundImage: `url(${room.backdrop})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: light
            ? "linear-gradient(180deg, rgba(244,242,236,0.45) 0%, rgba(236,232,224,0.7) 55%, rgba(236,232,224,0.9) 100%)"
            : "linear-gradient(180deg, rgba(7,9,13,0.5) 0%, rgba(7,9,13,0.78) 55%, rgba(7,9,13,0.94) 100%)",
        }}
      />

      {/* HUD */}
      <header className="relative z-10 flex items-start justify-between gap-4 p-6 sm:p-8">
        <nav className={`font-lab flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] tracking-[0.25em] ${muted}`}>
          {room.crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="opacity-50">›</span>}
              {c.href ? (
                <Link href={c.href} className={`transition-colors hover:${light ? "text-[#241c12]" : "text-[var(--text)]"}`}>
                  {c.label}
                </Link>
              ) : (
                <span className={text}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <Link
          href="/profile"
          className={`font-lab shrink-0 text-[10px] tracking-[0.25em] ${muted} underline-offset-4 hover:underline`}
        >
          PROFILE →
        </Link>
      </header>

      {/* the room */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-28 pt-6 sm:px-8 sm:pt-12">
        <div className={`font-lab text-[10px] tracking-[0.35em] ${light ? "text-[#8a6f4d]" : "text-[var(--machine)]"}`}>
          {room.side === "human" ? "THE HUMAN WORLD" : "THE MACHINE WORLD"}
        </div>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{room.title}</h1>
        {room.subtitle && <p className={`mt-3 text-base leading-7 ${muted}`}>{room.subtitle}</p>}
        {room.intro && <p className="mt-6 max-w-xl leading-7">{room.intro}</p>}

        {room.stations.length > 0 && (
          <div className="mt-10 space-y-8">
            {room.stations.slice(0, revealed).map((s, i) => (
              <article key={i} className={reduced ? "" : "fade-up"}>
                {s.heading && (
                  <h2 className={`font-lab mb-3 text-[11px] tracking-[0.3em] ${light ? "text-[#8a6f4d]" : "text-[var(--machine)]"}`}>
                    {s.heading.toUpperCase()}
                  </h2>
                )}
                <div className="note-body leading-8" dangerouslySetInnerHTML={{ __html: s.html }} />
              </article>
            ))}
            {!allShown && (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setRevealed((r) => r + 1)}
                  className={`font-lab rounded-sm border px-5 py-2.5 text-[11px] tracking-[0.3em] transition-colors ${
                    light
                      ? "border-[#241c12]/40 hover:bg-[#241c12]/10"
                      : "border-[var(--seam)]/50 bg-[var(--seam)]/5 hover:bg-[var(--seam)]/15"
                  }`}
                >
                  CONTINUE ↓
                </button>
                <button
                  onClick={() => setRevealed(room.stations.length)}
                  className={`font-lab text-[10px] tracking-[0.25em] ${muted} underline-offset-4 hover:underline`}
                >
                  unfold all
                </button>
              </div>
            )}
          </div>
        )}

        {room.note && <p className={`font-lab mt-10 text-xs leading-6 ${muted}`}>{room.note}</p>}

        {(allShown || room.stations.length === 0) && room.doors.length > 0 && (
          <div className={`mt-14 border-t pt-8 ${line}`}>
            <div className={`font-lab text-[10px] tracking-[0.35em] ${muted}`}>DOORS</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {room.doors.map((d) => (
                <button
                  key={d.to + d.label}
                  onClick={() => go(d.to)}
                  className={`rounded-md border p-5 text-left transition-colors ${card}`}
                >
                  <div className="font-display text-lg font-bold">{d.label}</div>
                  {d.hint && <div className={`mt-1 text-sm leading-6 ${muted}`}>{d.hint}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {(allShown || room.stations.length === 0) && room.cta && (
          <a
            href={room.cta.href}
            className={`font-lab mt-10 inline-block rounded-sm border px-6 py-3 text-xs tracking-[0.25em] transition-colors ${
              light
                ? "border-[#241c12]/40 hover:bg-[#241c12]/10"
                : "border-[var(--seam)]/60 bg-[var(--seam)]/5 hover:bg-[var(--seam)]/15"
            }`}
          >
            {room.cta.label} →
          </a>
        )}
      </section>

      {/* teleport curtain */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-50 bg-black transition-opacity ${
          !entered || leaving ? "opacity-100 duration-[420ms]" : "opacity-0 duration-700"
        }`}
      />
    </main>
  );
}
