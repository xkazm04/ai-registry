---
name: tiger
description: "Hunt a codebase's most valuable feature area and evolve it with a cross-vendor council. Use when you want the product's strongest part made markedly more valuable - not swept for defects - and a person to choose what gets built. tiger ranks feature areas by value evidence (context-map groups and the use cases they serve, git heat, product docs, the bp product tree), writes a territory dossier for the chosen one, and convenes the strongest available CLI seats from different labs (Gemini via agy, GPT via codex, Grok, Claude Opus - any seat that fails its probe is skipped). Round 1 each seat proposes 3-6 anchored evolutionary moves (deepen, extend, connect, leap) blind to the others; round 2 each seat rates the anonymous pool and crossbreeds stronger fusions. The caller judges blind, verifies premises in the code, clusters cross-seat agreement, composes one coherent scope with a thesis, presents it as a multi-select approval, builds only what was chosen with a verify check per item, and keeps a per-seat ledger of what was kept, approved and landed. Invoke with /tiger [<area>] [--seats engine:model@effort,...] [--rounds 1|2], /tiger hunt, /tiger resume <run>, /tiger status."
category: workflow
memory: vault
version: 3.1.0
tags: value, feature-area, multi-model, council, brainstorm, evolution, scope, approval
argument-hint: "[<area> | hunt | resume <run-id> | status] [--seats engine:model@effort,...] [--rounds 1|2] [--ceiling-min 40]"
---

# Tiger - find the strongest part, and make it formidable

Every product has one feature area that carries most of its value: the reason users come,
the part competitors would copy first. Work rarely goes there on purpose. Defect sweeps
spread effort evenly, ideation starts from a blank page, and a single model asked "how do we
improve this?" returns its first good idea. Tiger does the opposite: it **hunts** the
area with the most value behind it, writes a **dossier** every seat reads, has a **council of
seats from different labs** propose evolutionary moves blind and then crossbreed the best
of each other's, **judges** the pool blind with premises verified in code, and hands a
person one **coherent scope** to approve item by item. Only what they choose is built.

**Is:** a deliberate, periodic value pass on one area - a few hours of seat time, a
judged scope, approved work landed with checks. **Is not:** a defect sweep (`/scan-sweep`,
`/explorer`), a product-wide ideation loop (`/perfect`), a UI prototype contest (`/contest`
- three variants per seat, built and judged visually), or a gate (`/council` triages one
finished feature). Tiger is for *what to build next in the part that matters most*.

Tiger 2.x certified LLM call sites; that method is retired (see LESSONS.md). When the hunted
area is LLM-powered, its engine checklist lives on as a lens the dossier may hand to the
seats: `${CLAUDE_SKILL_DIR}/references/llm-lens.md`.

## Project overlay

The overlay is the `tiger/` vault. Everything per-repo lives under it: config, runs, the seat
ledger, the backlog. With no overlay present the skill runs on the defaults below and
creates `tiger/hunts/` at the first `init`.

| Path | What it holds | Default when absent |
|---|---|---|
| `tiger/config.md` | optional overlay: `seats:` (spec list), `exclude:` (areas never hunted), `constraints:` (copied into every dossier), `ceiling_min:`, `rounds:` | the default roster below, no exclusions, ceiling 40, rounds 2 |
| `tiger/hunts.md` | home note: one row per hunt - date, area, thesis, approved / landed counts, link | created at the first record step |
| `tiger/hunts/<date>-<slug>/` | one run: `run.json`, `brief.md`, `prompt-r1.md`, `prompt-r2.md`, `pool.json`, `pool.md`, `verdict.md`, `verdict.json`, `scope.md`, `outcome.md`; `_logs/` (raw seat output, gitignored) | created by `init` |
| `tiger/seats.jsonl` | the seat ledger, one row per seat per run (`ledger` appends) | created by the first `ledger` |
| `tiger/backlog.md` | approved-not-landed items and kept-not-chosen items, rolled forward | created at the first record step |

A **2.x vault** (`tiger/README.md`, `engine/`, `characters/`, `sessions/`, `backlog.md`,
or the older `Tiger.md` / `call-sites/`) stays where it is and is never rewritten: read its
engine notes and backlog as evidence when the hunted area contains LLM call sites, and
append v3 items to its `backlog.md` under a `## tiger 3 hunts` heading rather than starting
a second backlog.

**Vault privacy - the repository's rules outrank this skill's.** Before the first write run
`git check-ignore -v tiger/`. If the path is ignored, write the vault there, leave it
uncommitted, never `git add -f`, and say so in the report (measured in 2.x: on a public repo
ignoring `/tiger/`, 15 of 15 runs force-added private material before this rule).

## The council - seats

A seat is `engine:model@effort`, the contest skill's engine table
(`../contest/scripts/lib/participants.mjs`: headless, self-approving, the operator's own
config excluded). The default roster is the strongest seat each vendor offered on
2026-10-14:

| Seat | Lab |
|---|---|
| `agy:gemini-4-argon@high` | Google (Antigravity CLI; effort rides in the model slug) |
| `codex:gpt-6.1-sol@xhigh` | OpenAI (Codex CLI) |
| `grok:grok-4.7@high` | xAI (Grok CLI) |
| `claude:claude-opus-5-5@xhigh` | Anthropic (a separate headless process, never the judge's own context) |

Newer models land often: `agy models`, `grok models` and the codex config name the current
ones; override with `--seats` or `seats:` in the overlay. **Every seat is probed before every
council** (`tiger.mjs probe`, about 10-15 s and a few cents per seat): a missing CLI, failed
auth, a 402 / quota / seat limit or a wrong reply skips that seat for the run, and the
report names it and why. One seat is enough to run; with zero seats the caller says so,
brainstorms alone into the same pool format, and the report marks the scope
`single-family` - never presented as a council's.

## Modes

- `/tiger [<area>]` - the full hunt below. An `<area>` (a path, a context-map group name,
  or a bp feature slug) skips the area question.
- `/tiger hunt` - Phase 1 only: the ranked table and a recommendation, no council, no writes.
- `/tiger resume <run-id>` - continue a run from its last completed artifact (`run.json`
  rounds, `pool.json`, `verdict.json`, `outcome.md` tell where it stopped).
- `/tiger status` - read `tiger/hunts.md`, `tiger/backlog.md` and `tiger/seats.jsonl`:
  past hunts, open items, which seats' ideas get approved and land. Read-only.

Script: `node ${CLAUDE_SKILL_DIR}/scripts/tiger.mjs <cmd>` - below as `tiger.mjs`.

## Phase 0 - preflight

1. Read the overlay, `tiger/hunts.md` and `tiger/backlog.md` if present. An area hunted in
   the last 60 days is not hunted again unless the person names it - its open backlog items
   are the better next step, and the report says so.
2. Vault privacy check (above).
3. `tiger.mjs probe [--seats ...]` - record the live roster.

## Phase 1 - hunt the most valuable area

`tiger.mjs hunt --root .` prints two tables: **context-map groups** (when `context-map.json`
exists - preferred, because they are named feature areas and carry how many declared use
cases and major flows run through them) and **directory areas** (git heat over 180 days,
weighted by mass; container directories such as `src/` or `components/` are skipped in
favour of their children). It also lists the value sources present: product docs, the bp
product tree, the registry map, perfect's directions ledger, uat Characters, 2.x engine
notes.

Heat is where work went, not where value is. Read the value sources, then pick the area by
**value to users**: the flows the product exists for, what its README sells, what users
would miss first. Churn can mean value or trouble - check which. Exclude what the overlay
excludes and what is plumbing without a user-facing job (infrastructure groups rank high on
churn and rarely win on value - a hunt that picks one says why).

Interactive: ask once (single-select) with the top 3 candidates, each with a one-line case
and its evidence, recommended one first. Unattended or `<area>` given: take it and state
the case in one line.

## Phase 2 - the dossier

`tiger.mjs init --root . --area <path[,path]> [--slug s]` creates the run directory and a
`brief.md` from `${CLAUDE_SKILL_DIR}/references/brief-template.md`. Fill every section; `convene`
refuses a brief with template markers left. The dossier is facts with `path:line` anchors
and sourced numbers, not the caller's ideas: seats evolve what the area does well, so the
"what it does today" section names its strengths precisely, and "recent history" lists
rejected directions so no seat re-proposes them. Subagents may gather facts in parallel
(flows, data, measured state, history); the caller writes the file. Add the overlay's
`constraints:` verbatim. If the area is LLM-powered, append a pointer to `llm-lens.md` and
any 2.x engine notes for its call sites.

## Phase 3 - council round 1 (variation)

`tiger.mjs convene --run tiger/hunts/<id> --round 1 --seats <live roster>` - every seat runs
in parallel in one shared, read-only detached worktree of the dossier's commit (at
`C:/t/tiger-<id>` on Windows, `$TIGER_WORK` to override; short to dodge path-length limits),
with the prompt from `references/seat-round1.md`: 3-6 proposals, at least one `leap` and one
compounding quick win, each with anchors, evidence, effort, risk and an observable `verify`.
Seats run 10-40 minutes; launch the command in the background and wait for it rather than
polling. A change found in the worktree afterwards is recorded in `run.json` as a defect.

Then `tiger.mjs pool --run ...`: parses every seat's JSON block, assigns pool ids (`P01`..),
checks each anchor exists at the commit, and writes `pool.json` (with seats) and `pool.md`
(seats hidden, anchor results inline). A seat whose output did not parse is listed with its
problem; read its `final.md` and recover by hand only if the content is there.

## Phase 4 - council round 2 (selection and crossbreeding)

Default with 2+ live seats; skip with `--rounds 1`. `tiger.mjs convene --round 2` gives each
seat `pool.md` (`references/seat-round2.md`): rate every proposal it did not write, 1-10,
after checking its claims, and crossbreed up to 2 fusions that beat their parents. `pool`
again appends the fusions and computes **peer scores** (own-seat ratings excluded).

## Phase 5 - judge and compose

Follow `${CLAUDE_SKILL_DIR}/references/verdict.md`: read `pool.md` only; verify each
proposal's premise at its anchors; score value x confidence / effort; cluster cross-seat
agreement (the strongest signal a council gives); compose a **scope** of 4-12 items with a
one-sentence thesis, tiered core / supporting / leaps, ordered by dependency, each with its
verify check and source ids; name what was left out and why. Write `verdict.md` (the triage
table and reasoning) and `scope.md` (the scope as the person will read it).

When every seat converged on modest moves, suspect the dossier first: sharpen it and rerun
round 1 rather than presenting a timid scope.

## Phase 6 - the approval gate

Present the thesis in two sentences, then the scope as multi-select questions - one per tier,
core first, up to 4 options each (`verdict.md` has the format). Nothing unselected is built.
Unattended runs stop here with `scope.md` written and its path reported. Write the chosen
ids to `verdict.json` (`kept`, `approved`, `dropped`, `thesis`, `judge`).

Before building, check the selection against the scope's dependencies. An approved item that
depends on one the person left out is a decision they have not made: ask once, single-select -
carry only the minimum the item needs, build the dependency too, or defer the item (firetv
2026-10-15: a leap needed a core item left unticked; the person chose to add it).

## Phase 7 - build what was chosen

In dependency order, for each approved item: re-read its anchors at the current HEAD (the
tree may have moved since the dossier), implement, run its `verify` check and the repo's
own gates, commit with the repo's commit convention (attribution in the body; never
`--no-verify`, never push unless the person asked), then one row in `outcome.md`: item,
commit, verify result with the actual output, notes. Independent items with disjoint files
may go to parallel subagents, one item each, each in its own worktree; the caller reviews
each diff and runs the verify check itself before counting it landed. An item whose verify
check fails is `failed`, kept in `outcome.md` with the output, never quietly dropped or
re-scoped into a pass. Stop and ask when an item turns out to need a decision the person did
not make.

- **Re-measure a decayed premise first.** A number the item stands on (a latency, a count,
  a rate) that was measured before this run is measured again before a spike or a build is
  scoped on it; a premise that moved is reported, and the item may stop there (firetv: a
  "6 s CLI start-up" read 3.1 s at build time, n=10, and its spike was NO-GO).
- **One lane per hot file.** Items whose write sets share a file every item touches (a
  feature's core module, its view model, its types) go to ONE builder in sequence, or wait
  for the earlier item to land; parallel lanes are for genuinely disjoint files. Measured on
  firetv: five parallel lanes on one conversation/view/types core needed a caller-side
  conflict resolution on every rebase, and two item interactions surfaced only there.
- **After resolving a conflict, check the merge, not just the lines.** `node --check` (or the
  stack's parser) on every resolved file - a hunk whose shared tail was a closing `});` drops
  one test's closer when both sides are kept (twice in one run) - then rerun every suite of
  the items the file belongs to. A test broken by another item's intended behaviour is
  re-scoped in its own `test(...)` commit that says which item changed it.

## Phase 8 - record

1. `verdict.json` gains `landed`; `tiger.mjs ledger --run ...` appends per-seat rows to
   `tiger/seats.jsonl` (proposals, anchor accuracy, peer mean, kept, approved, landed, wall
   time, cost where the CLI reports it - codex and agy report none; say "n/a", never imply
   parity) and prints the table for the report.
2. `tiger/hunts.md` gains the run's row; `tiger/backlog.md` gains approved-not-landed items
   and kept-not-chosen items with their pool ids and run link.
3. `tiger.mjs clean --run ...` removes the seats' worktree.
4. Commit the vault (unless it is ignored - see privacy) with the repo's convention.
5. Report: area and why, live seats (and skipped ones with reasons), thesis, approved and
   landed items with verify results, the seat table, cost and wall time, what was left out.

## Rules

- **The person approves; the run never does.** No approval, no build - including in
  unattended runs, which stop at `scope.md`.
- **Seats never write.** They work in a read-only worktree and return JSON; the caller is the
  only writer of the vault and the only one who builds.
- **Judge blind, verify first.** `pool.md` before `pool.json`; a premise checked in code
  before value is scored; a dropped proposal carries its reason.
- **Evolve the strength.** A proposal that discards the area, or is generic hygiene, is out
  of scope unless it unlocks a named value move.
- **Report the roster honestly.** Name skipped seats and why; a scope from one family is
  labelled `single-family`; costs a CLI does not report are `n/a`.
- **Measured state is cited or absent.** Every number in the dossier, the scope and the
  report names its source; "not measured" is a valid entry.

## Telemetry for hardening

The skill is young (3.0.0, 2026-10-14; 3.1.0 after its first full build run, 2026-10-15). Each run's `seats.jsonl` rows and its LESSONS entry
are what the next version is built from. Worth recording in the reflection: which seat's
ideas were kept / approved / landed and whether that held across areas; how often anchors
were wrong per seat; whether round 2 fusions beat their parents in the judge's own scoring;
whether the hunt picked the area the person would have picked; wall time and cost per round.

<!-- clause: knowledge-sync v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, to `.ai/consults.jsonl` in the task's MAIN checkout (never a disposable worktree), written before the run's first commit - pre-commit consult checks read it: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"tiger@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

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
node <registry>/scripts/log-run.mjs --skill tiger --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"tiger","outcome":…,
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
