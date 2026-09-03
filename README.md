# ANSON WORLD

An explorable digital self — part portfolio, part autobiography, part philosophy archive, part AI interface, part business.
**You don't browse it. You enter it.**

## Status

| Phase | Scope | State |
|---|---|---|
| P0 | Content & knowledge base | **← here** — drafted 2026-08-10, awaiting Ao's sign-off ([P0_SIGNOFF.md](P0_SIGNOFF.md)) |
| P1a | Flat crawlable layer, live on Vercel | gated on P0 |
| P1b | 3D lab hero + AI Anson chat → **public launch** | gated on P1a |
| P2 | Split Face + room template (Warehouse, DEADNOTE Day 1) | gated on launch posts |
| P3 | Chamber, decisions, zh-CN, more worlds | backlog |

## Ground rules (full spec: [PLAN.md](PLAN.md))

1. **Content-first.** `/content` is the single source of truth feeding three outputs: flat HTML pages (the primary, crawlable asset), AI Anson's knowledge, and the 3D rooms. The 3D world is an enhancement, never the only copy of anything.
2. **Fact record is law.** [content/kb/facts.md](content/kb/facts.md) can never be contradicted by any page or any AI reply. Honesty is the brand.
3. **Phase gates are hard.** No phase starts before the previous gate passes. Stop rule: if P1 isn't live within 7 working days of starting, the 3D hero degrades to 2.5D and ships anyway.

## Layout

```
PLAN.md              full build spec (locked decisions, schemas, budgets, edge cases)
P0_SIGNOFF.md        what Ao must confirm before any code
content/
  kb/                13-file knowledge base (identity → current + facts.md)
  projects/*.mdx     project pages with honest status lines
  deadnote/          philosophy entries (publish:false by default, see _INTAKE.md)
  services.md        offerings page source
```

App code (Next.js + R3F) arrives in Phase 1a — after the gate.
