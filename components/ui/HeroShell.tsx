"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Lab = dynamic(() => import("@/components/three/Lab"), {
  ssr: false,
  // while the three.js chunk streams in, show the locked B-1 key art instead of a blank frame
  loading: () => (
    <div
      className="absolute inset-0 bg-cover bg-center opacity-70"
      style={{ backgroundImage: "url(/worlds/lab-hero.webp)" }}
      aria-hidden
    />
  ),
});

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

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function FallbackHero({ onEnter }: { onEnter: () => void }) {
  // tier-0 hero: the locked B-1 key art carries the scene when WebGL can't
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/worlds/lab-hero.webp)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(4,6,10,0.75) 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-end justify-center pb-[18%]">
        <button
          onClick={onEnter}
          className="pointer-events-auto rounded-sm border border-[var(--seam)]/50 bg-black/40 px-5 py-2.5 font-lab text-[11px] tracking-[0.3em] text-[var(--text)] backdrop-blur-sm transition-all hover:bg-[var(--seam)]/10"
        >
          ENTER →
        </button>
      </div>
    </div>
  );
}

export default function HeroShell() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const [entering, setEntering] = useState(false);
  const [fade, setFade] = useState(false);

  const enter = () => {
    if (entering || fade) return;
    if (reduced || webgl === false) {
      setFade(true);
      setTimeout(() => router.push("/face"), 420);
      return;
    }
    setEntering(true);
    setFade(true);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--bg)]">
      {/* background layer: 3D lab or graceful fallback — all interaction lives on the figures */}
      <div className="absolute inset-0" aria-hidden={webgl !== false}>
        {webgl === false ? (
          <FallbackHero onEnter={enter} />
        ) : (
          <Lab
            entering={entering}
            onEntered={() => router.push("/face")}
            onRequestEnter={enter}
            reducedMotion={reduced}
          />
        )}
      </div>

      {/* the recruiter escape hatch — the one piece of chrome that stays (PLAN §8),
          visible from first paint, quiet enough to disappear into the corner */}
      <Link
        href="/profile"
        className={`absolute bottom-5 right-6 z-10 font-lab text-[10px] tracking-[0.3em] text-[var(--muted)] opacity-50 transition-opacity hover:opacity-100 ${
          entering ? "pointer-events-none !opacity-0" : ""
        }`}
      >
        PROFILE →
      </Link>

      {/* enter-the-observer blackout */}
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity ${
          fade ? "opacity-100 duration-[1300ms]" : "opacity-0 duration-300"
        }`}
      />
    </div>
  );
}
