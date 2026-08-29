---
name: kpi-sim
contexts: tracked
category: testing
memory: project
description: KPI Simulation - measure a project's KPIs locally, simulate user behavior with UAT-style Characters, and predict real-world targets from web benchmarks, writing a result.json the Personas app ingests into its KPI module (env-tagged simulated series + proposal-gated adjustments). Engine doctrine mirrors src/features/teams/sub_kpis/kpiSimPrompt.ts - the app dispatches the same contract into managed repos as a Fleet Dev-runner session, so most target repos never need this skill installed. Invoke with `/kpi-sim run [--l2] [--kpi <id>] [--project-root <path>]` or `/kpi-sim predict`.
version: 1.1.0
argument-hint: "run [--l2] [--kpi <id>] [--project-root <path>] | predict"
---

# KPI Simulation (engine reference)

> **Maintenance: authority = `src/features/teams/sub_kpis/kpiSimPrompt.ts`**
> (+ `src-tauri/src/commands/infrastructure/kpi_sim.rs` for ingest guardrails).
> When this file and they disagree, fix THIS file.
> Design + phasing: [`docs/plans/kpi-simulation-skill.md`](../../../docs/plans/kpi-simulation-skill.md).

**Distribution:** the canonical engine is the dispatch prompt — the app runs it
*into* managed repos via a Fleet session (`kpi-sim:<project>` key). This skill
is for hand-running the operation from a CLI, or per-repo adoption via the
passport Skills module.

## Standalone run — preconditions and lifecycle

1. **`kpi-sim/snapshot.json` must exist at the repo root** — ground truth
   (project identity + every managed KPI + env axis). Only the app writes it
   (`dev_tools_kpi_sim_prepare`); no snapshot → stop and have the user trigger
   the sim from the KPI dashboard once. KPI ids in output MUST come from it
   verbatim. Status `"proposed"` KPIs await review — never re-propose (by id
   or name) or measure them; context only.
2. **Write `kpi-sim/runs/<YYYY-MM-DD-HHmm>/result.json` + `report.md`.** Only
   writes: that run dir + appending `kpi-sim/` to `.gitignore` if needed.
   Never touch app code, config, or KPIs.
3. **Ingest** is app-side (`dev_tools_kpi_sim_ingest`): auto on Fleet session
   exit, or the dashboard's Import button. Picks the newest run dir with
   `result.json` and no `ingested.json` marker; idempotent. A valid run:
   parseable JSON, ≤1 MiB, ≤50 measurements, ≤8 proposals; bad rows are
   skipped and reported, not fatal.

## result.json (exact schema: kpiSimPrompt.ts OUTPUT_CONTRACT)

```
{ "sim_run_id": "<run dir name>",
  "measurements": [ { kpi_id, value, env: "local"|"test", confidence: 0-1,
                      evidence: { ..., cert: "L1"|"L2" }, note } ],
  "proposals":    [ { kind: "adopt_measure_config"|"adjust_target"|"retire"|"new_kpi",
                      kpi_id, payload, rationale, citations: [] } ],
  "findings":     [ { title, description, kpi_id?, evidence } ] }
```

`new_kpi` payload = a full KPI (name, description, category, measure_kind,
measure_config, unit, direction, baseline_value, target_value, cadence);
`adjust_target` payload = `{"target_value": <n>, "target_date"?: "YYYY-MM-DD"}`.

## The three epistemic classes (never blend)

| Class | KPIs | What you do | Lands as |
|---|---|---|---|
| 1 — measurable locally | technical/quality with a runnable procedure | author/verify `measure_config` (cmd + parse), RUN it | `adopt_measure_config` proposal, evidence = verified value + output tail |
| 2 — simulated user behavior | user-facing outcomes (completion, time-to-value) | 3–5 Characters (reuse `uat/characters/` if present — never invent a second cast) walk KPI-bound journeys over the CODE (L1); `--l2` adds live driving | measurements, env `local` (repo cmds) or `test` (walks/live), evidence = `{characters, completed, journals}` + confidence |
| 3 — real traffic/value | users, revenue, retention | web-research 2–4 comparable products; NEVER emit a measurement | `adjust_target` / `new_kpi` / `retire` proposals with citations |

Honestly unsimulatable → one finding, skip. **Never invent a number.**

## Hard rules (ingester-enforced — violations are dropped)

- Every measurement carries `evidence`; evidence-free rows are refused.
- `env` is `local`/`test` only — `production` is real telemetry's channel and
  is rejected. Simulated rows never advance `current_value`/pace (app-side).
- ≤8 proposals per run; prefer adjust/adopt over inventing. All KPI mutations
  are proposals — applied only after a human accepts.
- A failing command = a class-1 gap (finding), never a reason to fabricate.

## Modes

- `run` — full pass, L1-only by default. `--l2`: probe for a driver in order —
  documented test/automation harness → Playwright/Puppeteer already in
  devDependencies (minimal per-journey script) → plain HTTP curl. Act → wait
  to settle → capture REAL output and judge that, not your expectation. No
  mechanism / app won't start → one "no live-simulation path" finding + L1
  fallback; never fake L2. L2 rows: env `test`, `"cert":"L2"` in evidence.
- `predict` — class-3-only research refresh: 2–4 current, named benchmarks →
  proposals + findings. **`"measurements": []` REQUIRED**; every proposal
  needs ≥1 citation. No repo commands, no journey walks.
- `--kpi <id>` scopes to one snapshot KPI; `--project-root <path>` when run
  outside the target repo.

## Orchestration

Classify every snapshot KPI into exactly one class, fan out research via the
Task/Agent tool (sonnet-class; keep synthesis in this session), run class-1
commands and class-2 walks. Before finishing: adversarially re-check
result.json — delete any value you cannot trace to evidence, validate it
parses, print measurements/proposals/findings counts.

## App context coverage (Personas-managed repos)

This skill declares `contexts: tracked` — the Personas app measures per-context memory coverage for it. When run inside a Personas-managed repo (a `.personas/` dir exists, or the app dispatched this run), before finishing append JSON lines to `.personas/memory-outbox.jsonl` at the repo root (append, never rewrite) — one node per context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name from .claude/codebase-context.md>","skill":"kpi-sim"}
```

**Which name — this is the part that silently fails.** The ingest anchors a node
by matching `context` against the names the app actually knows, case-insensitively.
A name it does not recognize is NOT an error: the node is stored with a null
context and simply never counts toward coverage. Use the **product-level context
names in `.claude/codebase-context.md`** (49 names under 8 groups — the taxonomy
CLAUDE's project map describes). Do NOT use repo-root `context-map.json`: it is a
stale (2026-07-10) Vibeman auto-map with 236 mechanical names like
`tauri:engine [3/10]` and `plugins/dev-tools [2/3]`, none of which the app knows.

Always set both `"skill":"kpi-sim"` and `"context":"<name>"` — together they drive the per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the session ends. Skip silently when not Personas-managed.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"kpi-sim@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/kpi-sim/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - kpi-sim` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/kpi-sim` in a consuming repo is a symlink to `<registry>/skills/kpi-sim` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/kpi-sim` and `git -C <registry> commit -m "skill(kpi-sim): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/kpi-sim/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/kpi-sim` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
