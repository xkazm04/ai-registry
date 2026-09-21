---
name: kpi-sim
contexts: tracked
category: testing
memory: project
description: KPI Simulation - measure a project's KPIs locally, simulate user behavior with UAT-style Characters, and predict real-world targets from web benchmarks, writing a result.json the Personas app ingests into its KPI module (env-tagged simulated series + proposal-gated adjustments). Engine doctrine mirrors src/features/teams/sub_kpis/kpiSimPrompt.ts - the app dispatches the same contract into managed repos as a Fleet Dev-runner session, so most target repos never need this skill installed. Invoke with `/kpi-sim run [--l2] [--kpi <id>] [--project-root <path>]` or `/kpi-sim predict`.
version: 1.3.0
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

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill kpi-sim --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"kpi-sim","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
