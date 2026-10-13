import type { Metadata } from "next";
import Link from "next/link";
import FaceAtmosphere from "@/components/ui/FaceAtmosphere";

export const metadata: Metadata = {
  title: "The Face — UTILITY / MEANING · Anson World",
  description:
    "One person, two worlds. The left is the machine: efficiency, trade, engineering. The right is the human: philosophy, memory, empathy. Choose where to enter.",
};

const utilityWords = ["efficiency", "trade", "engineering", "ambition", "systems", "survival"];
const meaningWords = ["philosophy", "memory", "empathy", "mortality", "beauty", "uncertainty"];

export default function FacePage() {
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--bg)] sm:flex-row">
      {/* left half — UTILITY, backed by the locked B-1 key art (the dark lab) */}
      <Link
        href="/profile#work"
        className="group relative flex flex-1 grow items-center justify-center overflow-hidden transition-all duration-500 hover:grow-[1.25]"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/worlds/lab-hero.webp)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,9,13,0.5) 0%, rgba(7,9,13,0.35) 45%, rgba(7,9,13,0.7) 100%)",
          }}
        />
        <div className="relative px-8 text-center">
          <div className="font-lab text-[10px] tracking-[0.35em] text-[var(--machine)] opacity-80">
            LEFT FACE · THE MACHINE WORLD
          </div>
          <h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[#c9dcec] drop-shadow-[0_2px_12px_rgba(7,9,13,0.8)] transition-colors duration-500 group-hover:text-white sm:text-6xl">
            UTILITY
          </h2>
          <p className="font-lab mx-auto mt-5 max-w-xs text-xs leading-6 text-[#9fb0c2] drop-shadow-[0_1px_6px_rgba(7,9,13,0.9)]">
            {utilityWords.join(" · ")}
          </p>
          <div className="mt-8 font-lab text-[10px] tracking-[0.3em] text-[#c9dcec] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            ENTER →
          </div>
        </div>
      </Link>

      {/* the seam */}
      <div
        aria-hidden
        className="seam-glow relative z-10 h-px w-full shrink-0 bg-[var(--seam)] shadow-[0_0_24px_2px_rgba(232,241,255,0.5)] sm:h-auto sm:w-px"
      />

      {/* right half — MEANING, backed by the white void (E-final) */}
      <Link
        href="/notes"
        className="group relative flex flex-1 grow items-center justify-center overflow-hidden transition-all duration-500 hover:grow-[1.25]"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url(/worlds/white-void.webp)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,242,236,0.25) 0%, rgba(244,242,236,0.1) 45%, rgba(230,224,212,0.4) 100%)",
          }}
        />
        <div className="relative px-8 text-center">
          <div className="font-lab text-[10px] tracking-[0.35em] text-[#8a6f4d] opacity-90">
            RIGHT FACE · THE HUMAN WORLD
          </div>
          <h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[#241c12] transition-colors duration-500 group-hover:text-[#0f0b06] sm:text-6xl">
            MEANING
          </h2>
          <p className="font-lab mx-auto mt-5 max-w-xs text-xs leading-6 text-[#6b5f4d]">
            {meaningWords.join(" · ")}
          </p>
          <div className="mt-8 font-lab text-[10px] tracking-[0.3em] text-[#241c12] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            ENTER →
          </div>
        </div>
      </Link>

      {/* living atmosphere: darkness devouring on the left, rings of light on the right */}
      <FaceAtmosphere />

      {/* frame chrome */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-start justify-between">
          <Link
            href="/"
            className="pointer-events-auto rounded-sm bg-black/40 px-3 py-1.5 font-lab text-xs tracking-[0.2em] text-[#cfd6e0] backdrop-blur-sm transition-colors hover:text-white"
          >
            ← THE LAB
          </Link>
          <Link
            href="/profile"
            className="pointer-events-auto rounded-sm bg-black/40 px-3 py-1.5 font-lab text-xs tracking-[0.2em] text-[#cfd6e0] backdrop-blur-sm underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            SKIP → 30-SEC PROFILE
          </Link>
        </div>
        <div className="flex justify-center">
          <div className="rounded-sm bg-black/50 px-4 py-2 text-center backdrop-blur-sm">
            <p className="font-display text-sm text-[#e6e9ee]">What is a human for?</p>
            <p className="font-lab mt-1 text-[9px] tracking-[0.2em] text-[#8b94a3]">
              PHASE 2: EACH HALF OPENS INTO A FULL 3D WORLD
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
