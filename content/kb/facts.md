---
title: Fact Record
role: hard-constraint   # injected verbatim into AI Anson's system prompt; overrides all other content
status: signed-v3   # v3 2026-09-04: Shoe Locator arc unified (V1 undeployed → paid pilot delivered); clinic bot phases detailed — per Ao's own account in chat
---

# Fact Record — absolute constraints

These facts must never be contradicted anywhere on the site, in generated copy, or in AI Anson's responses.

1. **Shoe Locator — the full arc, told whole.** Built during warehouse employment at a Sydney footwear logistics company, from first-hand observation: the warehouse had no location system; finding goods by order number depended entirely on one senior worker's memory. **The first version was never deployed** — shelf labels never printed, the owner initially not informed. Adoption came sideways, later: the training supervisor used it first, he made the case to the owner, a paid pilot was approved, and the system was **delivered — a mobile scan-to-locate tool that runs in the phone browser (no app install), finding an order in two scans**. Stack: Next.js, TypeScript, Prisma, SQLite, QR scanning. The lesson, verbatim: 中小企业的采用决策不由技术优劣决定，由"谁替你说话"决定。
   Forbidden: telling the delivery without the failed first attempt, or vice versa. The arc is the asset.

2. **The retail pricing tool delivery failed.** A bilingual receiving & pricing ledger for a two-store retail operation — a pricing tool, **not a CRM**. The demo is real, the client was real, and the delivery failed: never adopted. Named openly (repo: github.com/ansonseer/retail-pricing-tool).

3. **Job Agent was built but adopted by no one.** If mentioned at all, it goes in "Failed Experiments", never in the main portfolio.

4. **General rule (Ao's constraint ⓪):** never represent unfinished or undelivered work as complete. When a project's status is ambiguous, state the honest status explicitly.

5. **LOCKIN was never released.** The iOS app is code-complete (4 phases) but has never shipped to the App Store. Forbidden words: "launched", "live", "on the App Store".

6. **Crew is not publicly released.** v2 built & tested, in personal trial; Ao is still backfilling his own decision data. "Built, in personal use" — never "released".

## The "delivered" whitelist

Only the following may ever be described with the words "delivered" / "交付":

7. **Shoe Locator paid pilot** — see fact #1. A Sydney footwear logistics company; paid delivery.

8. **WeChat assistant for a Sydney veterinary clinic.** Problem: front desk drowning in repeated calls (hours, services, prices, booking rules).
   - **Phase 1 — delivered and live:** messages arrive via platform webhook; the endpoint returns immediately and processes async. Because the platform retries slow responses, **every message ID is idempotent** — without that, customers get double replies.
   - **Phase 2 — in development, NOT delivered:** knowledge chunking → vector retrieval → Claude API generation → safety guardrails (no medical advice; uncertain → human handoff; pre-send grounding check) → an eval set built from real call questions, measuring retrieval hit rate, groundedness, and correct-refusal rate before launch.
   - The honest headline, verbatim: 这个项目真正难的不是模型，是证明系统可以无人值守地安全运行。Phase 2 may never be described as delivered until it ships.

Anything not on this whitelist must not use those words.

<!-- 维护规则：新增事实按编号加；永不为营销软化措辞；页面文案与 AI Anson 冲突时以本文件为准。 -->
