---
name: lens-scan
description: "Measure a product feature by feature through one lens - development, security or design - and record hard numbers over time in a local store inside the repo, then propose backlog items that each name the metric they move and the expected delta against a registry or house standard, and execute only the items a person approved in the review UI. Use when a team needs the current state of a product measured with care (company setting, history, human approval) rather than a solo backlog mass-resolved: before a hardening milestone, to baseline a lens, to turn a better pattern into a house standard and propagate it to every similar site. Sibling of scan-sweep, which lands what it can prove on its own; lens-scan never decides, it measures, proposes and executes what was approved. Modes: measure, propose, execute, propagate, status."
argument-hint: "[measure|propose|execute|propagate|status] [--lens development|security|design] [--scope <group|context|feature>]"
category: workflow
memory: project
version: 1.1.0
tags: measure, metrics, lens, backlog, approval, house-standards, propagation, sqlite
---
# Lens scan

Measure the current state of a product through **one lens at a time** and keep the
numbers. Every run leaves typed measurements in a store the product repo owns, so the
second scan is a comparison and the tenth is a trend. Proposals come out of the
numbers, each naming the metric it moves and by how much, and nothing is built until a
person has approved it in the review UI - any app-structure v3.1 viewer that reads the
store, shows the scan live and writes proposal decisions back (the only write it makes).

This is `scan-sweep`'s sibling and reuses its doctrine **by reference**:

- the lens prose: [scan-sweep lenses](../scan-sweep/references/lenses.md), mapped onto
  the three lenses in [lenses-map.md](references/lenses-map.md);
- the evidence ladder: [scan-sweep evidence](../scan-sweep/references/evidence.md);
- worktree execution: [scan-sweep Lane B](../scan-sweep/references/ab-lane.md).

When those files are not reachable beside this skill, say `scan-sweep: unavailable` in
the run header and run only the static and declared-command methods; never improvise
a lens from memory.

The difference is the contract. `scan-sweep` mass-resolves a solo backlog and lands
what it proves. `lens-scan` works where several people own the product: it chases
numbers carefully, proposes **fewer, measurable** items, and treats a human decision as
the only gate into execution.

## Invocation

```
/lens-scan                                   # = measure, the overlay's default lens and scope
/lens-scan measure --lens design --scope <capability>
/lens-scan propose --lens development        # backlog items from the latest measurements
/lens-scan execute                           # only approved items, one worktree each
/lens-scan propagate                         # child proposals for a landed baseline upgrade
/lens-scan status                            # what waits for a decision, what is running; changes nothing
```

`--scope` takes a capability slug (a context group), a context name, or a feature slug;
several are comma-separated. Without one, the static method covers every feature and
the judgement and harness methods take the overlay's `default_scope`.

## The store

One SQLite file per product: `.ai/lens-scan/scan.db` (gitignored; the DDL is
[store.sql](references/store.sql), `user_version 1`). **The agent never writes SQL.**
`node ${CLAUDE_SKILL_DIR}/scripts/store.mjs` is the only writer; every subcommand
prints JSON (`--help` lists them). The rules it enforces are the method's rules:

- **No row means unmeasured.** A metric that cannot be measured is omitted, never
  written as 0 or as a placeholder. A 0 is a measurement.
- Every measurement carries `method` (`static | probe | harness | judgement`) and
  `evidence` (`file:line`, a command, or the counting rule).
- Writes go only into a `running` run, and every write bumps the run's `updated_at`,
  which is how the review UI follows a scan live.
- `approved` and `declined` are human decisions the review UI writes. The CLI refuses
  them. The skill moves an approved item to `executing`, `done` or `failed`, and
  nothing else.

`activity` rows are the scan's live feed. Write one at every step a person watching
would want to see: `reading` when you open a feature, `measured`, `proposed`,
`executing`, `committed`, `note`, `error`. The `measure` and `propose` subcommands log
their own row.

## 0. Subscribe

Read, in this order, and print one header line per source:

1. **The overlay** (`## Project overlay` below). Absent: `overlay: defaults`.
2. **The house layer**, `<repo>/.ai/house/` ([house.md](references/house.md)):
   `profile.md` (who the users are, the industry, the constraints, the brand, the
   stack) and `standards/<registry-subject>.md` (house rules that override or extend
   registry techniques **by slug**). Absent: say `house: none` and warn that the run
   judges on registry knowledge and defaults alone, so its proposals may be out of
   touch with the company.
3. **The registry subjects** through `.ai/registry-map.json`, exactly as
   [scan-sweep §6](../scan-sweep/SKILL.md) reads them: the context's subjects, each
   subject's golden path verbatim from the index (never a path built from a slug), the
   techniques whose `use_when` matches the lens. Log the consult to
   `.ai/consults.jsonl` as §6 does. No registry declared: `registry: none`.

**Precedence.** A house rule beats the registry technique it overrides; a technique
nobody overrides applies as written; a house `extends` line adds to the technique and
both apply. Say which won whenever a proposal depends on it.

## 1. Structure

**A repo bp has never seen starts with `/adopt-bp`**, not here. It writes the declared product tree
(domains, capabilities, roadmap-sized features with evidence-backed stages), the events log, the first
baseline and the registration, all through this skill's `store.mjs` and `footprint.mjs`, so its baseline
and every later lens-scan run are one series. From then on this skill keeps the numbers current; a
rescan with `/adopt-bp` is for when the product tree itself changed.

```
node ${CLAUDE_SKILL_DIR}/scripts/structure.mjs --map <context_map> --lenses <standard_lenses> \
  --db .ai/lens-scan/scan.db --out .ai/lens-scan/app-structure.json \
  --project-slug <slug> --project-name "<name>"
```

**Merge, never overwrite.** When the structure already holds a declared product tree
(any `provenance.product_tree` but `contexts`: one `/adopt-bp` wrote, or one a person keeps
by hand), phase 1 regenerates only the code tree, the `standard_lenses` manifests and the
metric values from the store. Features, stages, domains, capabilities, milestones, KPIs,
project lenses, switched-off lenses and non-metric facet values (`status`, `applicable`,
overrides) are kept as they are. The output names the mode (`merge` | `1:1`), any feature
context the code tree no longer has (`dangling_feature_contexts`: say so, the tree needs an
`/adopt-bp` rescan) and any context it renamed.

Without a declared tree it converts the context map (v2) **contexts as features 1:1**
(`provenance.product_tree: contexts`): domain = `group.domain`, capability = group,
feature = context (`kind` = its category, `tags` = the use cases that list it, `summary` =
its description). Stage, priority and milestone are omitted, never guessed. `--fresh`
forces this mapping over an existing file.

Either way the code tree is the context map's, with a repeated context name renamed
`<name>-<group slug>` (the rule `/adopt-bp` uses), the lens manifests in
`standard_lenses` are embedded, and the store's latest measurement per (feature, lens,
metric) becomes the facet value. Re-run it after every measure phase: same inputs, same
bytes, so an unchanged tree is not rewritten. A context map that is missing or stale is
reported, not regenerated by this skill.

## 2. Measure

```
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs run-start --phase measure --lenses <lens> --scope '<json>' --model <id>
```

Then, per feature in scope, the four methods in this order. The metric catalog, units,
better-direction and the exact counting rule per metric are
[metrics.md](references/metrics.md); measure only keys it lists.

- **Static** - scripts that count. `footprint.mjs --run <id> --lens <lens|all>` writes
  `loc`, `files`, `depCount`, `testRatioPct` (development), `secretHits`, `unsafeSinks`
  (security) and `rawLiterals` (design), with the pattern sets in the script as evidence.
  Directory entries in `file_paths` expand to their tracked files. A feature with no UI
  component file gets no `rawLiterals` row and is named in `no_ui`: mark its design facet
  not applicable rather than measuring nothing forever. A judgement pass may still strike
  a pattern false positive with `file:line` and a reason.
- **Harness** - screenshots and runtime readings (`axeViolations`, `minTextPx`,
  `consoleErrors`) through the overlay's `## Harness` commands. Each screenshot is a
  `shot` row: path under the store directory (`shots/<feature>/<run>-<size>-<theme>.png`),
  size, theme, harness module, and the harness report as JSON.
- **Probe** - timed paths (`p50Ms`, `p95Ms`) through the overlay's `## Probes` commands.
- **Judgement** - read the feature's files once, then judge them through the lens's
  mapped scan-sweep lenses ([lenses-map.md](references/lenses-map.md)) and the
  governing techniques and house rules. Write the counts (`findingsHigh`,
  `undesignedStates`, `dupSites`, ...) and one `coverage` row per standard line judged:
  `conformant | deviation | not-applicable | unknown`, with `file:line` evidence.
  `standardsPct` is derived from those rows (metrics.md).

**A feature with no overlay mapping for a method is simply not measured by that
method.** Never guess a harness module or a timed path from a file name; record a
`note` activity and move on. Close with `run-end --status done` (or `failed` with a
note), then re-run phase 1.

## 3. Propose

```
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs run-start --phase propose --lenses <lens>
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs propose --run <id> --feature <f> --lens <lens> --kind fix \
  --metric <key> --expected-delta <signed number> --standard <tag> --size S --risk 3 \
  --title "<imperative, one line>" --body-file <tmp.md>
```

Every item names:

- `metric` and `expected_delta`: the key it moves, and the signed change in the
  metric's own unit (`-12` axe violations, `+20` testRatioPct). A fix that moves no
  catalog metric is not a lens-scan item; leave it to another skill.
- `standard`: `<subject>/<technique>` for a registry technique,
  `house:<subject>/<line-id>` for a house rule, `none` when nothing governs it.
- `size` (`XS..XL`) and `risk` (1-10).
- `body` in scan-sweep's five sections, in order: **Summary / Description / Flow /
  Expected impact / Evaluation**. The Evaluation's Before is the stored measurement;
  its After is the expected value and the rung that predicts it
  ([evidence ladder](../scan-sweep/references/evidence.md)).

Prefer three items that each move a number to ten that each describe a smell. Before
proposing, read `proposals` for the feature: never re-propose an open or declined
item; a declined one is re-proposed only with new evidence, and the body says what is
new. Status is `proposed`. Close the run.

## 4. Approval

People approve or decline in the review UI, which writes `status`, `decided_by`,
`decided_at` and `decision_note`. **The skill never self-approves**, never asks for a
blanket approval in chat, and never edits a decision. `status` mode reports what
waits:

```
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs proposals --status proposed
node ${CLAUDE_SKILL_DIR}/scripts/store.mjs proposals --status approved
```

and prints, per item, the title, `metric: before -> expected`, the standard and the
age. A decline note is input to the next propose phase; read it.

## 5. Execute

`run-start --phase execute`, then for each `approved` item, highest expected value per
size first, under the [Lane B worktree doctrine](../scan-sweep/references/ab-lane.md)
(one worktree per item or write-set group, never `npm ci` through a junction, the
director merges):

1. `proposal-update --id <p> --status executing`; `activity --kind executing`.
2. **Re-measure before** with the same method the item's metric was measured with. If
   the Before has moved since the proposal, say so in the body of the commit; if the
   item is already moot, record `failed` with the reason.
3. Build the change in the worktree, judged against the item's `standard` as it
   reads today (the house rule wins where one exists).
4. **Re-measure after on the real change**, run the overlay's gates.
5. Record `--after-value <n> --result-sha <sha>` and `--status done`, with a
   `committed` activity.

A change that does not move its metric in the expected direction, or breaks a gate,
is reverted and recorded `failed` with the measured after value. **Never tune a
change silently until it passes**, never edit a test or a gate to make a metric move,
and never widen an item past what was approved: a second change is a new proposal.
Re-run phases 1 and 2 on the touched features so the store holds the post-change
numbers.

## 6. Propagate

When a finding generalizes (a better table pattern, a shared error boundary), the
propose phase emits a `baseline-upgrade` item: an edit to
`.ai/house/standards/<subject>.md` that adds or changes one rule line, with the
**site signature** (a grep pattern and/or the structure query that finds similar
code) recorded in its body. Once it is approved and landed, a propagation run
(`run-start --phase propagate`) finds every similar site and emits one `propagation`
child proposal per site (`--parent <upgrade id>`), judged against the upgraded house
rule. When three or more sites share the shape, the first child is the extraction of
a shared component and the others depend on it. The full flow, including how sites
are found and what makes a signature good, is
[propagation.md](references/propagation.md).

## Reporting

End every phase with: the run id, lenses, scope, features measured per method, the
metrics written, items proposed or executed with their deltas, what was skipped and
why (no mapping, unmeasurable, house rule missing), and the header lines from phase 0.
Never report a metric you did not store.

## Project overlay

Everything project-specific lives in `.claude/lens-scan/config.md` in the consuming
repo; the skill runs on the defaults without it. YAML frontmatter for scalars, `##`
sections for the command maps.

| Key | Default | Meaning |
| --- | --- | --- |
| `context_map` | `context-map.json` | The v2 context map phase 1 converts. |
| `standard_lenses` | none (warn; no manifests embedded) | Directory of `lens-manifest/1` files to embed. |
| `store` | `.ai/lens-scan/scan.db` | The store; the directory must be gitignored. |
| `structure_out` | `.ai/lens-scan/app-structure.json` | Where phase 1 writes. |
| `project_slug` / `project_name` | from the context map | The structure's project. |
| `house` | `.ai/house` | The house layer root. |
| `default_lens` | `development` | The lens when `--lens` is absent. |
| `default_scope` | none (ask once) | The judgement/harness scope when `--scope` is absent. |
| `bundle_stats` | none (`bundleKb` unmeasured) | A per-feature bundle stats file, when one exists. |
| `## Gates` | `.ai/manifest.yaml` capabilities | The verification commands phase 5 runs, verbatim. |
| `## Harness` | none (harness metrics unmeasured) | `feature -> module, sizes, themes, command`; the command writes a PNG and a JSON report. |
| `## Probes` | none (`p50Ms`/`p95Ms` unmeasured) | `feature -> timed path command`; the command prints the timings. |
| `## Skill improvement log` | none | One dated line per reflection (see below). |

A feature absent from `## Harness` or `## Probes` is not measured by that method;
the overlay is the whole mapping, never a hint.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"lens-scan@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill lens-scan --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"lens-scan","outcome":…,
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
