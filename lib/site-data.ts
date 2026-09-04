// Identity constants and display labels. Project/note content lives in /content
// (single source of truth, PLAN §0.3) and is loaded via lib/content.ts.

export const identity = {
  name: "Anson Sun",
  handle: "Ansonseer",
  oneLiner:
    "AI engineer & builder. I walk into real operations — warehouse floors, clinics, logistics companies — watch how work actually happens, then build AI systems for it. Bilingual delivery, 中文 / English.",
  location: "Sydney, Australia",
  email: "suneric0228@gmail.com",
  github: "https://github.com/ansonseer",
  x: "https://x.com/Ansonseer",
};

export const statusLabel: Record<string, string> = {
  shipped: "DELIVERED",
  "built-v1-demo": "BUILT · V1 + DEMO",
  "in-progress": "IN PROGRESS",
  "failed-experiment": "FAILED",
  exercise: "EXERCISE",
};
