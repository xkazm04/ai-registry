---
name: adopt-bp
category: workflow
memory: project
tags: onboarding, blueprint, app-structure, lens-scan, product-tree, benchmark, providers
description: "Onboard any codebase into the bp product blueprint. Checks which artifacts the repo already has (context map, app-structure v3 map, events, lens-scan store, registration) and produces only what is missing: a v3 map with domains, capabilities, features and evidence-based stages; an events log from git history; static metrics in the lens-scan store; LLM judgement facets, proposals and coverage; then validates with bp's own validator and registers the repo so bp's project switcher shows it. Deterministic work runs in scripts/adopt.mjs; the model only names the product tree and judges code, in batches that can fan out or be benchmarked across providers with scripts/bench.mjs. Invoke with /adopt-bp [<repo path>] [--check] [--slug s --name n]."
argument-hint: "[<repo path>] [--check] [--slug <slug>] [--name <name>] [--bp <bp checkout>]"
version: 1.3.0
---

# adopt-bp - a repo in, a blueprint out

bp (the product blueprint) draws any repo that has `<repo>/.ai/lens-scan/app-structure.json`
(app-structure v3, spec: `<bp>/docs/standard/app-structure-v3.md`). `/adopt-bp` makes that file and
everything beside it, for a repo bp has never seen, and leaves a rescan path for later.

`S` below is this skill's directory; `node $S/scripts/adopt.mjs <cmd> --root <repo> --bp <bp>`.
`--bp` defaults to `$ADOPT_BP_ROOT`, then a sibling `../bp`.

**adopt-bp onboards; /lens-scan measures from then on.** This skill needs its sibling
`lens-scan` in the same skills lane and writes nothing to the store itself: every run,
measurement, coverage row and proposal goes through lens-scan's `store.mjs`, every static
metric through its `footprint.mjs` (the catalog is lens-scan's `references/metrics.md`), and
every facet refresh through its `structure.mjs` in merge mode. So the onboarding baseline and
every later `/lens-scan` run are one series, and a lens-scan phase 1 keeps the product tree
adopt-bp declared (`provenance.product_tree: adopt-bp`). Rerun adopt-bp when the product tree
changed; run `/lens-scan` to re-measure, propose against standards and execute what people approved.

## What gets written

| Artifact | Where | By |
|---|---|---|
| v3 map: code tree, product tree, stages, built-in lenses, facets | `<repo>/.ai/lens-scan/app-structure.json` | seed + you (phase A) + measure + judge |
| events (feature-added, stage) from git history | `<repo>/.ai/lens-scan/events.jsonl` (append-only) | events |
| lens-scan store: runs, measurements, proposals, coverage, activity | `<repo>/.ai/lens-scan/scan.db` (lens-scan's DDL, identical to `<bp>/docs/standard/lens-scan-store.sql`) | measure + judge, through lens-scan `store.mjs` |
| working files (inventory, tree, batches, judgement, report) | `<repo>/.ai/lens-scan/work/` | all |
| `.ai/lens-scan/` in `.gitignore` (left alone when git already ignores it, e.g. via `.git/info/exclude`; the exclude file instead when `.gitignore` has uncommitted edits); the product in `<bp>/bp.products.local.json`; a lens-scan overlay `.claude/lens-scan/config.md` when absent | repo, bp | register |
| `ADOPT.md` summary | `<repo>/.ai/lens-scan/` | report |

Nothing else in the repo changes. Never commit in the target repo unless the operator asks; its
tree may carry another session's work.

## The run

0. **Check.** `adopt.mjs check`. It lists each artifact as ok / missing / stale and what is needed.
   `--check` on the invocation stops here and reports. On a rescan (a map exists), every later step
   keeps the product tree, facets and project lenses (spec section 11) and appends to history.
   - **No context map** (the code tree): build one first. If the ai-registry `project-populate`
     skill is available, run its context lane; otherwise write `context-map.json` yourself in v2 shape
     (`groups[]` with `name`, `domain`; `contexts[]` with `name`, `group`, `category`, `description`,
     `file_paths[]`, `entry_points[]`), 1 context per cohesive module of roughly 5-40 files, covering
     every source file that ships. Then continue.
   - **A nested map** (`groups[].contexts[]` with camelCase keys such as `filePaths`, as Vibeman
     writes it) is read as v2 through lens-scan's `structure.mjs` (`ungrouped[]` contexts keep no
     group; with no declared entry points, a `page`/`layout`/`route` file among a context's own files
     stands in). The file is never rewritten. Contexts the curated map owns nowhere (shipping files no
     context lists) go in `work/context-supplement.json` (`{"contexts": [...]}`, v2 shape); every
     command appends them. Never hand-edit a curated map to make adoption fit.
   - **Stale map** (over 10% of mapped files gone): say so and rebuild the code tree first.
1. **Seed.** `adopt.mjs seed [--slug s --name n]`: skeleton v3 map (code tree from the context map,
   the six built-in lenses copied from bp) and `work/inventory.json` (per context: files, lines,
   tests, entry points, first/last commit).
2. **Phase A - product tree (you).** Follow `references/product-tree.md`: write
   `work/product-tree.json`, then `adopt.mjs tree`. It refuses a broken tree by name; fix and rerun.
3. **Events.** `adopt.mjs events`: feature-added at the first commit of a feature's files, a stage
   event at `stage_since` (or the last commit). Append-only.
4. **Measure.** `adopt.mjs measure`: lens-scan's `footprint.mjs --lens all` per feature
   (development: loc, files, depCount, testRatioPct; security: secretHits, unsafeSinks;
   design: rawLiterals, or `applicable: false` with no UI component file), plus the map-only
   development fields status, lastCommit and stalled.
5. **Phase B - judgement (you).** `adopt.mjs batches [--size 8]` (each feature carries the
   registry techniques that govern it, from the repo's `.ai/registry-map.json`), then follow
   `references/judgement.md` for every `work/batches/NN.json`, writing `work/judgement/NN.json`.
   Fan out to subagents when your harness has them. Then `adopt.mjs judge --model <your model id>`:
   one lens-scan measure run per lens, `standardsPct` derived from that run's coverage rows
   (lens-scan's rule; no standard, no number), one propose run that never re-proposes an open or
   declined item. A judgement also sets each lens's choice fields that the manifest declares (design
   `status`, `a11y`, `specDrift`; security `dataClass`, `review`; development `humanReviewed`) and
   each proposal's triage (`tier` 0-3, `risk_class`); a value outside the manifest's list is refused.
6. **Validate.** `adopt.mjs validate`: bp's validator (schema, references, facet types, events) plus
   coverage, placement and staging checks. Do not finish on a failing validate.
7. **Register.** `adopt.mjs register [--slug s --name n]` (skip with `--no-register` in a benchmark
   workspace). Then `adopt.mjs report` writes `ADOPT.md`.
8. **Hand back** in five lines: the check before/after, counts (domains, capabilities, features by
   stage), the three proposals that matter most, what you could not measure and why, and the URL
   `http://localhost:3000/?product=<slug>` (bp's dev server).

## Rules

- **Evidence over coverage.** Absent means unmeasured; never write 0 or a guess to fill a gap.
  A stage without evidence is a wrong stage.
- **Scripts own the files.** Never hand-edit `app-structure.json`, `events.jsonl` or `scan.db`;
  write the work files and let `adopt.mjs` merge, so every run is validated the same way.
- **Liveness.** A feature is `live` only if its surface renders: trace entry points to a mount.
  An API or service feature is live only if a live surface or an external consumer calls it; when
  its only callers sit in a deprecated surface, it shares that surface's stage.
- **Deprecated code is not a backlog.** Judge a deprecated feature for security (it still runs)
  and mark design `applicable: false`; propose only security fixes or its removal. Look for a
  salvage/removal plan in the docs before proposing anything on legacy code.
- **Budget.** Phase A reads the inventory and opens files only to settle names and stages. Phase B
  reads code; that is where the tokens go. On a repo over ~150 features, judge the biggest batches
  first and report how many were judged.

## Project overlay

Optional `<repo>/.claude/adopt-bp/config.md` (frontmatter only): `bp:` the bp checkout, `slug:` and
`name:` for the product, `batch_size:` (default 8), `skip_lenses:` (e.g. `[design]` for a repo
with no UI). Absent: `overlay: defaults` - bp from `--bp`, `$ADOPT_BP_ROOT` or a sibling `../bp`;
slug and name from the context map's project. Flags on the invocation win over the overlay.

**Hand-off to /lens-scan.** adopt-bp writes the first baseline (runs, measurements, proposals,
coverage) through the same DDL. Ongoing measurement per lens belongs to `/lens-scan` when the repo
has it; a rescan with adopt-bp is for when the product tree itself changed.

## Benchmarking providers

`scripts/bench.mjs` runs this same skill in parallel seats (Claude, Codex, Grok CLIs) on throwaway
worktrees of one repo and scores what each produced: validator pass, coverage, measured and judged
facets, proposals, wall time and reported cost. `--phase judgement` runs only phase B on an already adopted repo (the offload shape: the product tree stays, a provider judges); an interrupted seat resumes in its worktree and keeps the batches it finished. `promote` merges a seat's new store runs into the repo's store and validates; it never deletes the store directory, so it is safe while bp has the store open. Use it to decide which provider takes the heavy
phase B on large repos. Score with `bench.mjs score`, then verify a blind sample of claims against
the code (12 proposals and 6 stages per seat): counts measure volume, only verification measures truth.

**What the first bench measured** (pof, 147 contexts / ~3.8k files, 2026-10-12, all seats `@high`):

| Seat | Wall | Reported cost | Features | Proposals | Verified true (proposals / stages) | Actionable |
|---|---|---|---|---|---|---|
| codex `gpt-6.1-sol` | 27 min | subscription (8.0M in, 98% cached; 33k out) | 68 | 57 | 12/12 / 5/6 | 4/12 |
| claude `claude-sonnet-5-5` | 30 min | $29.62 | 101 | 234 | 9/12 / 5/6 | 2/12 |
| grok `grok-4.7` | 37 min | $4.60 | 88 | 44 | 8/12 (1 false) / 4/6 | 1/12 |

Guidance that follows: Codex is the default seat for a whole adoption (most precise, right feature
size, cheapest on a subscription). Grok is the metered fallback for phase B at scale (about a sixth
of Sonnet's cost, full lens coverage) when its proposals are verified before anyone acts on them.
Sonnet is the most exhaustive and the noisiest: use it when coverage rows matter more than a short
review queue. Re-bench before trusting this table on a different stack.

```
node $S/scripts/bench.mjs run   --target <repo> --seats codex:gpt-6.1-sol@high,claude:claude-sonnet-5-5@high,grok:grok-4.7@high [--bp <bp>] [--out <dir>] [--ceiling-min 120]
node $S/scripts/bench.mjs run   --phase judgement --target <adopted repo> --seats <one or more> ...   # phase B only, from the repo's adopted state
node $S/scripts/bench.mjs score --out <dir>
node $S/scripts/bench.mjs promote --out <dir> --seat <seat-id> [--force]   # copy the winner into the repo, register it
node $S/scripts/bench.mjs clean --out <dir> [--keep <seat-id>]
```

---

<!-- clause: skill-reflection v6 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the task's MAIN checkout: local,
gitignored run output inside the task's own repository, never a write into the registry.
A run that worked in a linked worktree logs in the main checkout that worktree belongs to
(`git rev-parse --git-common-dir`, minus `/.git`) - a disposable worktree takes the line
with it when it is removed. `log-run.mjs` resolves this on its own.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill adopt-bp --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"adopt-bp","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null` (with `log-run.mjs`, omit `--tokens-est`); exact figures are measured
  later from transcripts - never guess one.
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
