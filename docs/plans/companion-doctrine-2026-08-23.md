# Plan: companion doctrine into the registry, /spark made portable, kp assistant designed

Date: 2026-08-23. Orchestrator: main session (Fable 5). Builders: Opus subagents.
Decision (operator): the registry holds the DOCTRINE (design + runtime best practice);
UI and runtime are tailored per stack (first: kp). No code package lane. Personas' brain
stays where it is and serves as the evidence source; the doctrine evolves through kp
assistant design cycles.

## Phase 1 - companion doctrine (ai-registry, branch `forge/companion`)

Deliverable: 3 new subjects under `knowledge/software-engineering/llm-agent/`, each a
golden path + techniques (with `use_when`) + Athena `applications/rust--*.md` /
`react--*.md`, gate-clean (`scripts/check-bundles.mjs`), index rebuilt, rules regenerated.

| Subject | Owns | Must NOT own (already owned) |
|---|---|---|
| `companion-identity` | constitution vs self-model split (law never self-written; self-model only via anchored, gated diffs); disk-as-truth/DB-as-index; operator model + human gating; one mind / many mouths; the "app down stops tools not self" second door | memory tiers, consolidation, decay, recall (`agent-memory`) |
| `companion-runtime` | metered LLM seam (no unmetered entry; one ledger row per leg); host seam traits (store / llm-leg / turn stream) so a runtime travels between stacks; headless turn API; pressure-not-clock background cycles; op envelope + approval-gated action catalog with ONE source of truth (the cockpit post-mortem); attention/signal economy boundary to `proactive-nudges` | nudge budgets/quiet windows (`proactive-nudges`), voice engines (`voice-io`), cost ledgers (`cost-metering`) |
| `conversation-orchestration` | PROGRESS beat grammar; narration timeline promote-on-finish; recall preview strip; turn-summary chip; quick-reply chips; two-dimensions doctrine (full chat vs quick-info orb); guided walkthrough (non-dimming glow + captioned rail); companion avatar layers | transcript scroll/turn model/markdown (`chat-transcript`), session resume |

Process: each builder first writes a `docs/subject-proposal-<slug>.md` boundary paragraph
(grep proof + adjacent-subject table, per `docs/harvest-brief.md`), then the files.
"Already owned by X" is a valid outcome: fold into X as a technique, do not duplicate.
Evidence sources: `personas/docs/features/companion/*.md`, `src-tauri/src/companion/brain/**`
(mod.rs / sleep_cycle/mod.rs / retrieval.rs / identity.rs / oneshot.rs headers),
`docs/architecture/companion-fleet-orchestration.md`, `.claude/skills/athena/brain.py`.

Gate: `node scripts/check-bundles.mjs`, `node scripts/build-index.mjs`, rules regen;
orchestrator reviews every golden path for purity + for being a standard, not a description.

## Phase 2 - /spark portable (ai-registry, branch `skill/spark-1.1`)

- 2a. `skills/spark/SKILL.md` v1.1.0: strip project specifics into the overlay contract
  (`.claude/spark/config.md` in the consuming repo: vault path, gates, ledger/decision-mirror
  rituals as optional hooks, context-map source). Fallback vault `<repo>/.spark/`. Body
  generic per `docs/skills-lane.md`; `node scripts/check-skills.mjs --since main` green.
- 2b. Personas overlay `.claude/spark/config.md` carrying what the body used to hardcode
  (no behaviour change for Personas).
- 2c. kp: add `spark` to `.ai/manifest.yaml skills:`, write `.claude/spark/config.md`
  (gates: `npm run typecheck`, `npm run lint`, `npm run test:unit`; context map source;
  vault `Obsidian/kp` if present else `.spark/`), `node scripts/link-registry.mjs --project kp`.

## Phase 3 - `/spark` the kp assistant (kp repo, this session, operator in the loop)

Run `/spark` with the idea: "a personal assistant in kp following the companion doctrine:
memory + identity + chat + voice plane, first-time onboarding of the assistant". Director
= this session; scouts read kp's voice-conversation-plane, role-intake, candidate
surfaces; design waves ask the operator the key questions (UI surface, capability scale,
first-run onboarding, name/identity, memory scope) - `/consult` the three new subjects
before wave 1 so the questions are doctrine-shaped. Build via Opus builders in a kp
worktree. Retro feeds back into both `skills/spark/LESSONS.md` and, where the doctrine
proved wrong or thin, the Phase 1 subjects (that is the design-cycle loop the operator asked for).

## Order

Phase 1 and 2 run in parallel (independent repos/branches). Phase 3 starts after 2c links
spark into kp and Phase 1's rules are linked into kp (`knowledge.domains` already includes
software-engineering, so the regenerated rule picks the subjects up automatically).
