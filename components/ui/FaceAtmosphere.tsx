"use client";

import { useEffect, useRef } from "react";

/* Atmosphere layer for /face.
   Left (UTILITY): darkness with a turbulent edge creeping toward the seam —
   it devours faster while the pointer is on that side. Grain drifts upward.
   Right (MEANING): rings of light bloom, expand and fade; warm motes drift.
   Pure 2D canvas, pointer-events none, reduced-motion renders one still frame. */

interface Grain { x: number; y: number; s: number; v: number; a: number }
interface Ring { x: number; y: number; born: number }

export default function FaceAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // which half the pointer is on: -1 left/top, 1 right/bottom, 0 none
    let side = 0;
    const vertical = () => w < 640; // halves stack on small screens
    const onMove = (e: PointerEvent) => {
      side = vertical() ? (e.clientY < h / 2 ? -1 : 1) : e.clientX < w / 2 ? -1 : 1;
    };
    const onLeave = () => {
      side = 0;
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);

    const rand = (i: number, k: number) => {
      // deterministic pseudo-random so the still frame is stable
      const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const grains: Grain[] = Array.from({ length: 160 }, (_, i) => ({
      x: rand(i, 1),
      y: rand(i, 2),
      s: 0.5 + rand(i, 3) * 1.3,
      v: 0.015 + rand(i, 4) * 0.05,
      a: 0.12 + rand(i, 5) * 0.3,
    }));
    const motes: Grain[] = Array.from({ length: 70 }, (_, i) => ({
      x: rand(i, 6),
      y: rand(i, 7),
      s: 0.8 + rand(i, 8) * 1.6,
      v: 0.006 + rand(i, 9) * 0.02,
      a: 0.1 + rand(i, 10) * 0.25,
    }));
    const rings: Ring[] = [];
    let ringSeed = 0;
    let nextRing = 0;
    let devour = 0.06;
    let last = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const vert = vertical();
      ctx.clearRect(0, 0, w, h);

      // ---- left / top: darkness that devours ----
      const target = side === -1 ? 0.24 : 0.06;
      devour += (target - devour) * Math.min(1, dt * 1.4);
      const span = vert ? h / 2 : w / 2; // size of the half along the devour axis
      const reach = span * (0.38 + devour * 1.5);
      const drawDark = (inset: number, alpha: number) => {
        ctx.beginPath();
        const steps = 56;
        if (!vert) {
          ctx.moveTo(0, 0);
          for (let i = 0; i <= steps; i++) {
            const y = (h / steps) * i;
            const wob =
              Math.sin(y * 0.011 + t * 0.8) * 22 +
              Math.sin(y * 0.029 - t * 1.6) * 10 +
              Math.sin(y * 0.071 + t * 2.7) * 4;
            ctx.lineTo(reach - inset + wob, y);
          }
          ctx.lineTo(0, h);
        } else {
          ctx.moveTo(0, 0);
          for (let i = 0; i <= steps; i++) {
            const x = (w / steps) * i;
            const wob =
              Math.sin(x * 0.011 + t * 0.8) * 16 +
              Math.sin(x * 0.029 - t * 1.6) * 8 +
              Math.sin(x * 0.071 + t * 2.7) * 3;
            ctx.lineTo(x, reach - inset + wob);
          }
          ctx.lineTo(w, 0);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(4,6,10,${alpha})`;
        ctx.fill();
      };
      drawDark(0, 0.28);
      drawDark(18, 0.26);
      drawDark(40, 0.24);

      // grain rising through the dark
      ctx.fillStyle = "rgba(207,214,224,1)";
      for (const g of grains) {
        g.y -= g.v * dt;
        if (g.y < 0) g.y += 1;
        const gx = vert ? g.x * w : g.x * span;
        const gy = vert ? g.y * span : g.y * h;
        ctx.globalAlpha = g.a * (0.5 + 0.5 * Math.sin(t * 2 + g.x * 20));
        ctx.fillRect(gx, gy, g.s, g.s);
      }
      ctx.globalAlpha = 1;

      // ---- right / bottom: rings of light ----
      const rate = side === 1 ? 0.7 : 1.6;
      if (t > nextRing) {
        ringSeed += 1;
        rings.push({
          x: vert ? 0.1 + rand(ringSeed, 11) * 0.8 : 0.55 + rand(ringSeed, 11) * 0.4,
          y: vert ? 0.55 + rand(ringSeed, 12) * 0.4 : 0.15 + rand(ringSeed, 12) * 0.7,
          born: t,
        });
        nextRing = t + rate * (0.6 + rand(ringSeed, 13) * 0.8);
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        const age = t - r.born;
        const life = 2.6;
        if (age > life) {
          rings.splice(i, 1);
          continue;
        }
        const k = age / life;
        const radius = 14 + k * 150;
        const alpha = (1 - k) * (side === 1 ? 0.5 : 0.32);
        const cx = r.x * w;
        const cy = r.y * h;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250,246,238,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(224,168,102,${alpha * 0.45})`;
        ctx.stroke();
      }

      // warm motes drifting in the light
      ctx.fillStyle = "rgba(250,236,214,1)";
      for (const m of motes) {
        m.y -= m.v * dt;
        if (m.y < 0) m.y += 1;
        const mx = vert ? m.x * w : span + m.x * span;
        const my = vert ? span + m.y * span : m.y * h;
        ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(t * 1.3 + m.x * 17));
        ctx.beginPath();
        ctx.arc(mx, my, m.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />;
}
