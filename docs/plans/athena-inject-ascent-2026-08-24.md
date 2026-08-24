# Plan: inject the companion (Athena) into ascent

Date: 2026-08-24. Author: the kp operator-companion session (Fable 5, Director).
Executor: a FUTURE session running in C:\Users\kazda\kiro\ascent. Read this whole
file, then the three doctrine subjects, then ascent's own
`docs/AI-SDLC-COMPANION-PLAN.md` - the companion is already ascent's declared
direction (wave 1 shipped 2026-08-14); this plan JOINS it, never fights it.

## What you inherit (do not rediscover)

- **Doctrine** (the contract, not suggestions):
  `knowledge/software-engineering/llm-agent/companion/{companion-identity,companion-runtime,conversation-orchestration}`
  - after the 2026-08-24 deepen wave they also carry kp's lessons:
  structured-visual-replies ("modern web app, not a book"), brain-adoption-consent
  (probe-without-creating, implicit consent only from your OWN writes, memoryless is
  honest), catalog-as-data across process boundaries, claim->run->stamp resolution.
- **A working exemplar in kp** (second product, five triage rounds, live-verified):
  brain door `pipeline/jobfit/companion_brain.py` + `companion_cli.py`; blocks
  contract `companion_blocks.py` + `app/_components/chat/{ChatBlocks,ChatTable,ChatMiniChart}.tsx`;
  single-source catalog `app/_lib/companion-actions.ts` (+ set-equality test);
  consent model `app/_lib/companion-brain.ts`; onboarding step `SetupCompanionStep.tsx`;
  feature doc `docs/features/companion/README.md`.
- **Method**: `/spark` 1.1.0 (registry lane; add to ascent's `.ai/manifest.yaml
  skills:` + relink) with a fresh `.claude/spark/config.md` overlay for ascent.
- **Process lessons** (skills/spark/LESSONS.md 2026-08-24): put the SHARPEST
  architecture fork in wave 1; builders never `git add`; restart long-lived dev
  servers after schema/catalog changes; locale files are the shared-file hazard
  (ascent has no i18n - one hazard gone).

## Ascent substrate (scouted 2026-08-24; verify at execution, repo moves fast)

- Next 16 / React 19 / TS / Tailwind v4 hand-rolled primitives (`src/components/ui/`,
  read `BRAND.md` first) · Prisma 6 + Postgres/Aurora DSQL (JSON as TEXT, no jsonb)
  · Supabase auth · NO i18n · vitest + playwright.
- LLM: provider abstraction, NO use-case registry. Free-form seam
  `src/lib/llm/text.ts:264 resolveTextRunner()` (one consumer today:
  `src/lib/memory/consolidation-engine.ts`). Temperature pinned 0 globally for
  scan reproducibility - chat needs a per-use-case exemption, scans must not get one.
  Keyless default returns null -> the companion must degrade honestly.
- **`OrgMemory` is ~70% of a brain already**: episodic/semantic/procedural/summary
  kinds, confidence, supersede/version, decay/recall/consolidation/reflection pure
  cores with injected RunPrompt. Org-scoped, like ~55 of ascent's tables.
- No chat UI anywhere. SSE plumbing exists once (`src/lib/sse-server.ts`).
  Memory panels (`src/features/shared/memory/*Panel.tsx`) are the nearest turn-shaped UI.
- Background work: Vercel cron (3 HTTP routes) + self-hosted-only autopilot
  (`LoopRun`/`LoopRunLane`, `runClaudeAgent`, gated `ASCENT_AUTOPILOT=1`). NO queue,
  no worker on cloud - the biggest structural gap for sleep cycles.
- Actions half-built: 6 MCP read tools (`src/lib/mcp/tools.ts:47-113`),
  `Recommendation`+`RecommendationEvent`, `buildFixPrompt` + `followups/handoff`
  (human-in-the-loop by construction - THE first action), autopilot arm/stop,
  OrgDecision, OrgAiStance. Consent architecture is mature (roles, HMAC audit log,
  gate policies) - inherit gates, never invent one.
- Mount: `src/components/org/shell/OrgShell.tsx:220-255` (every org page, including
  /org/developer). NOT `/org/[slug]/layout.tsx` (3-line delegate).
- IA collision: "registry" and "memory" are user-facing ascent nouns - the companion
  brain must not reuse them in navigation or copy.

## The wave-1 questions (ask FIRST - each reshapes everything downstream)

1. **Whose companion?** Org-scoped (one mind many members - fits every table, but
   the self-model has no single principal), person-scoped (userId+orgId - new axis
   nothing supports; does her memory cross orgs?), or person-scoped with an
   org-shared lane (the doctrine's one-mind + ascent's tenancy both honored;
   most work). The kp lesson says offer this fork sharply and first. Related:
   does she join the machine-shared `~/.personas/companion-brain` (self-hosted
   installs on the operator's machine - implicit-consent rules apply) or is ascent
   cloud-first so the brain is DB-only? Both can be true by deployment - say so
   in the options.
2. **Brain = OrgMemory extended, or a parallel store?** Recommendation: extend -
   add the person namespace + identity tier to OrgMemory rather than a second
   engine; the doctrine's disk-truth tier applies only where a disk exists
   (self-hosted). A parallel store is the cockpit anti-pattern (two vocabularies).
3. **Actor rung + gates**: draft-only (Recommendations/OrgDecisions/handoff
   prompts) vs dispatching (arm autopilot, schedule rescans) - and which existing
   role gate each action inherits. Per kp's operator ruling: include a per-action
   human-gating knob DERIVED FROM THE CATALOG (a gating field on each action spec,
   surfaced on a settings page; never a parallel list).
4. **Where do cycles run on cloud?** 4th cron route (`/api/cron/companion`,
   budget-bounded, API-provider) vs self-hosted-only cycles (contradicts ascent's
   "every feature on both" law - the repo calls that a bug) vs no cycles v1
   (consolidation on-demand from the reflect panel). Do not let this default silently.

## Suggested phase sequence (mirror kp; compress where ascent is ahead)

- **P0**: link spark into ascent; write `.claude/spark/config.md` (gates from
  package.json: typecheck/lint/vitest; context-map.json exists; no rituals; vault
  `Obsidian/ascent/Spark` if the vault root exists, else `.spark/`). Run
  `/spark an operator companion in ascent following the registry companion doctrine...`
  with THIS FILE as the targeting input.
- **P1 (kp WP1 analog)**: use-case registry for LLM calls (promote `surface` from
  telemetry tag to routing key - `assistant` + `assistant_digest`; per-use-case
  temperature override), brain layer (per wave-1 answers; Prisma migration,
  JSON-as-TEXT), turn runner over `resolveTextRunner` with the metered seam
  (tracklight is the ledger - verify every leg lands there).
- **P2 (WP2 analog)**: chat dock in OrgShell (fixed overlay or third column;
  BRAND.md law; blocks contract PORTED - the fenced kp:table/kp:chart schemas are
  stack-agnostic, renderers rebuilt on ascent primitives; full-bleed rule).
  /prototype 2 directional variants ONLY if the operator wants variants again -
  ask; kp's Colleague direction may transplant directly as the baseline.
- **P3 (WP3 analog)**: action catalog single-source, first action =
  `followups/handoff` (already human-gated), then propose-Recommendation,
  draft-OrgDecision, arm-autopilot (self-hosted). Claim->run->stamp lifecycle.
  Proposal count NEVER on a badge whose click cannot clear it.
  The 6 MCP tools become her grounding/tool surface - reuse, do not duplicate.
- **P4 (WP4 analog)**: first-run introduction. Ascent has NO wizard - use the
  getting-started tour-anchor mechanism instead (a `data-tour` anchored card),
  consent per brain-adoption-consent doctrine (probe-without-creating where a
  disk brain can exist; DB-brain consent is a column per kp's precedent).
- **P5**: retro -> lessons to `skills/spark/LESSONS.md` + deepen candidates to the
  registry; update THIS plan's "verify at execution" notes with what drifted.

## Standing rules for the executing session

- Register the operator's overrides as they land (they will override - kp did 4 times).
- One builder territory per package; builders NEVER stage or commit.
- Live-verify each package against a real dev server; restart it after schema changes.
- Athena-brand vs product-brand: ask, don't assume - kp chose "Candi shell, Athena
  mind"; ascent may choose differently (it has no mascot yet).
- Gather lessons for the registry even when small - the third transplant is where
  the doctrine either hardens or breaks.
