---
title: Work
status: signed-v3   # 2026-09-04: delivery details in from Ao; Shoe Locator arc unified
---

# Work — everything I've built, with honest status

> 状态词表（PLAN §5.2）：`delivered`（真实客户付费/在用——**仅限 facts.md 白名单**）· `built-v1-demo` · `in-progress` · `failed-experiment` · `exercise`（练习品，必须自我声明）。

## Delivered（真实交付——全站唯一可以用这个词的两项）

### Shoe Locator — 悉尼鞋类物流公司（付费试点）
- **Status: shipped.** 完整弧线（facts.md #1）：仓库无库位体系，找货全靠一位资深员工的记忆 → 打工期间做出 V1（当时未部署、老板不知情）→ 换路径：先让带教主管上手，由他向老板说明 → 获批付费试点 → **交付：手机浏览器扫码定位，免装 App，两次扫码找到订单**。
- Stack: Next.js · TypeScript · Prisma · SQLite · 二维码扫描。
- 复盘（原话）：**中小企业的采用决策不由技术优劣决定，由"谁替你说话"决定。**
- Repo private（真实条码，待匿名化）。[FILL: 可公开的 Loom]

### Clinic WeChat Assistant — 悉尼兽医诊所
- **Status: shipped (Phase 1) + in development (Phase 2).**
- 问题：前台大量时间消耗在营业时间/服务项目/价格/预约规则的重复来电上。
- **一期（已打通、在线）**：平台 webhook 进消息，端点立即返回、异步处理；平台会重试慢响应，因此**每个消息 ID 幂等**，否则客户收到两次回复。
- **二期（开发中，不称交付）**：资料切分入库 → 向量检索 → Claude API 生成 → 安全护栏（禁止医疗建议、不确定即转人工、发送前 grounding 校验）→ 用真实来电问题建评测集，上线前测检索命中率、有据率、正确拒答率。
- 一句话（原话）：**这个项目真正难的不是模型，是证明系统可以无人值守地安全运行。**

## Main portfolio

### Crew — a decision instrument
- **Status: in-progress.** v2 built & tested (2026-07)，个人试用中，仍在回填决策数据。未公开发布（facts.md #6）。
- Companion: crew-guardrails — 4 policies, 26 tests green, awaiting partner engine (Ackem) hook wiring.

### LOCKIN — iOS anti-addiction app
- **Status: built-v1-demo.** iOS 17+, SwiftUI, 4 phases code-complete. **Never released on the App Store**（facts.md #5）。[FILL: 一句话核心机制]

### video-use — conversation-driven video editor
- **Status: in-progress, working locally.**（Claude Code skill, ffmpeg）[FILL: 上不上站]

### service-scheduling-system
- **Status: exercise.** Race-safe 预约后台（node:sqlite, BEGIN IMMEDIATE, 半开区间冲突检测）。**Take-home 练习，非客户交付**——站上提及必须带此说明。

## Failed（公开的失败区——最建立信任的部分）

### Retail pricing tool — the failed delivery
- **Status: failed-experiment（点名）.** 双语收货/定价台账，真实两店零售客户。Demo 真、客户真、**交付失败：未被采用**。Repo public: github.com/ansonseer/retail-pricing-tool。
- [FILL: 三段式复盘——当时相信什么？哪里断了？改变了我什么？（提示：Shoe Locator 的"谁替你说话"教训，是不是正是从这里对照出来的？）]

### Job Agent
- **Status: failed-experiment.** 5-agent 求职 pipeline（repo public）。Built, adopted by no one（facts.md #3）。[FILL: 三段式复盘]

## Client / OPC work — summary line
两个真实交付（Shoe Locator 付费试点、兽医诊所 WeChat 助手一期）+ 一个公开的失败交付（定价工具）。一个不多说。
