---
name: daybreak
description: "Spend a ChatGPT/Codex plan on daily fleet hardening under Claude review. Use for a recurring stabilize or optimize pass across the connected projects, when Codex tokens are plentiful and Codex builders alone are not trusted. After one handshake with the operator (projects, strategy, hours, RAM, push consent, focus), Codex gpt-6.1-sol at medium effort surveys each context read-only; the Director triages the findings and rewrites every accepted item into a tight plan; RAM-governed Codex builders implement them in short-path worktrees; the Director reviews every diff and runs the project's gates; one pull request per consenting project comes out. A read-only census strategy measures the two-way gap with the registry: parts rebuilt against an existing standard, and parts the registry lacks. Run records live in the Obsidian vault so each run starts from what the last one learned, and repeated failures are promoted into the Codex brief templates with a version bump. Invoke with /daybreak, /daybreak status, or /daybreak resume."
category: workflow
memory: vault
version: 1.4.1
tags: codex, fleet, stabilize, optimize, census, orchestration, daily
argument-hint: "[status | resume]"
---

# Daybreak - Codex does the reading and typing, the Director does the judging

> The Codex plan has tokens to spare and Codex alone ships mediocre work. So the split is
> fixed: **Codex spends tokens on reading and typing; the Director spends judgment on what
> is worth building, how it must be built, and whether it was.** Nothing Codex wrote
> reaches a pull request unread.

`<registry>` is the ai-registry checkout this skill lives in. `<skill>` is
`<registry>/skills/daybreak`. `<runs>` is `$DAYBREAK_RUNS`, else `~/.daybreak/runs`: it holds
every brief and result, and it is outside any session or worktree because a run outlives
both. Scripts are builtins-only Node:
`node --test skills/daybreak/tests/*.test.mjs` pins them.

## Roles

- **Director (this session, Opus).** Handshake, triage, plan rewrite, dispatch, diff review, gates, landing, retro. Never delegated.
- **Codex surveyors.** `--sandbox read`, one per context. They read and report; they cannot write.
- **Codex builders.** `--sandbox write`, one per plan, in a worktree with nothing else live in it. They do not commit: a linked worktree's git directory lies outside their sandbox, and the Director commits.

## Project overlay

This skill has no overlay file. Each swept project's conventions come from its own `AGENTS.md` or `CLAUDE.md`, and its gates from `.ai/manifest.yaml` or its scripts. Run memory lives in the vault's `Daybreak/` folder: env `DAYBREAK_VAULT`, else the first vault in Obsidian's `obsidian.json`.

## Invocation

- `/daybreak` - a new run, starting at Phase 0.
- `/daybreak resume` - read the newest run directory under `<runs>` and continue at the first project without a landing line (a census: at the first context without a `result.json`); relaunch an interrupted builder with `--resume <sessionId>` from its `result.json`.
- `/daybreak status` - print the last five `Daybreak/ledger.jsonl` lines per project, then stop.

For a recurring run, the operator starts `/loop /daybreak`. Every firing that finds no active run begins at the handshake; **a firing never skips the handshake.**

## Phase 0 - Recall

1. Read the vault's `Daybreak/` (`node <skill>/scripts/vault-ledger.mjs last-sweeps`, and the newest two `Daybreak/runs/` notes). Read this skill's `LESSONS.md` and the failure table in `references/codex-dispatch.md`.
2. Claim the run: `node <registry>/scripts/run-board.mjs`. A builder wait over an hour lapses a claim, so beat it between tranches and re-claim before landing.
3. `codex --version`. If it differs from the version in `references/codex-probe.md`, re-run that file's trivial write and read-only commands in a scratch repo before dispatching anything, and update the file.

## Phase 1 - Pick and read the ground

1. `node <skill>/scripts/pick-projects.mjs --registry-root <registry>`: never-censused first, then the most unjudged pairs, then the oldest sweep. No project counts as synced; the output gives each one's measured coverage. A frozen project (`.ai/freeze.json`, `.ai/FREEZE`, or the vault's `Daybreak/freeze.json`) is dropped.
2. For each candidate, `git fetch`, then record: base branch, ahead/behind against the remote, dirty paths, the project's deadline or freeze record (hackathon rules, `docs/build/STATUS`, `AGENTS.md`), whether it has a remote, and whether it is private. **Work always starts from the remote's base**, whatever the local branch holds; many fleet mains are diverged.
3. Slots: `node <skill>/scripts/ram-governor.mjs --json`. One slot is one Codex process plus its project's gate tooling.

## Phase 2 - Handshake

One AskUserQuestion wave, no more. Show the ranked projects with their coverage, proposed strategy, and an estimate that says how it was derived. Propose `census` until a project has one on record. Collect:

- **Projects** (multiSelect) and **strategy** per project: `census`, `stabilize`, `optimize`, or both of the last two. A `census` skips Phases 3 to 6 and follows Census mode.
- **Budget:** hours available and a RAM ceiling.
- **Push consent per project.** Only a consenting project gets a pushed branch and a PR. It is never carried over from a previous run. No consent, no remote, or a failing push hook means the work stays on the local `daybreak/<date>` branch and the report says so.
- **Focus nudge:** one optional line that steers the lens package.

Write the answers into `<runs>/<date>/handshake.json`. Nothing outside this list is asked until the report.

## Phase 3 - Sync, then survey

Per project, in rank order:

1. **Sync.** If the project has no `.ai/registry-map.json`, run `node <registry>/scripts/build-registry-map.mjs --project <slug>` and carry the map on the daily branch. Read the golden paths for the contexts in scope (`## Knowledge sync`), because the survey brief cites them.
2. **Worktree.** `git worktree add C:/t/db-<slug> -b daybreak/<date> origin/<base>` with `core.longpaths`. Copy any machine-local file the project's gates need. Install the project's dependencies yourself, in that worktree, with its own lockfile command, before any builder starts: the sandbox has no network, and a dependency tree linked from another checkout can be destroyed through the link.
3. **Survey.** One read-only Codex per context from `context-map.json`, least-swept first, from `references/survey-brief.md` with the strategy's lenses filled in from `<registry>/skills/scan-sweep/references/lenses.md`. No context map: use top-level source directories and say so in the report. A read-only sandbox cannot write a findings file, so **the findings come back in the final message**, which `codex-run.mjs` saves as `last.md`.

Dispatch through `references/codex-dispatch.md`.

## Phase 4 - Triage and rewrite (the point of the skill)

For each finding, open the cited file at the cited line, then:

- **Reject** what fails to reproduce from the code, names a path or symbol that does not exist, restates a style preference, or has no way to show it worked. Record the count by reason; rejection rate per lens is what the next run learns from.
- **Grade** the survivors with `<registry>/skills/scan-sweep/references/evidence.md`. Anything that is a direction, an architecture change, irreversible, or loosens a policy goes to the report for the operator and is not built.
- **Rewrite** each survivor with `references/build-brief.md`: exact files, the change in the Director's own words, the check that proves it, and the walls. Codex receives the Director's plan, never its own finding text. Group items that touch one file into one plan; two plans sharing a file run sequentially.

A plan that cannot name its proving check is not ready. Cut it, or demote it to the report.

## Phase 5 - Build under the governor

Re-read `ram-governor.mjs --json` before every dispatch, and take the lower of its slots and the handshake's ceiling. Zero slots means wait for a running builder, then re-read. Launch each builder as a background command so a slow one does not hold the session.

`codex-run.mjs` writes `result.json`. Route on its class:

| Class | Exit | Action |
| --- | --- | --- |
| `done` | 0 | Phase 6. |
| `no-diff` | 12 | Read `last.md`. A reasoned refusal backed by evidence is signal: drop or re-plan. Otherwise once with a sharper plan. |
| `timeout` | 10 | One `--resume <sessionId>`, never `resume --last` (it takes the newest session, which is another builder's). Then split the plan or drop it. |
| `crash` | 11 | One retry after reading the tail of `events.jsonl`. Then drop and record. |

`modelUnknown: true` in a result means the model name was wrong and Codex fell back silently: stop dispatching and fix the name. Every failure is counted by the class names in `references/codex-dispatch.md`.

## Phase 6 - Review and land

Read the whole diff of every builder against its plan. **Reject, and do not commit, when:**

- a file outside the plan changed, or there is unrelated churn;
- a test was deleted, skipped, loosened, or its expected value edited to match the new behavior;
- the plan's proving check does not pass when the Director runs it;
- a catch-all, a type escape, or a suppression was added to make a gate pass;
- the project's gates are worse than on the base commit (measure the base first; a red gate on arrival is not this builder's).

A rejected build gets one rebuild with the rejection reason appended to the plan, then it is dropped. Accepted work is committed one plan per commit, staged by path, following the project's own commit-message rules.

For a consenting project with commits: push `daybreak/<date>` and open one PR with `gh`. The body lists each item with its proof, what was rejected and why, and the Codex tokens spent. Never auto-merge. A project's pre-push hook runs as it would for anyone; a failure is reported, not bypassed.

## Phase 7 - Clean up and learn

1. Remove each worktree with `node <registry>/scripts/remove-worktree.mjs`, never `git worktree remove` (a Windows dependency junction can delete the source checkout). Keep the branch of unpushed work. Stop anything this run started.
2. Write one ledger record per project: `node <skill>/scripts/vault-ledger.mjs append-run --record <json> --note <md>`, with `{ts, project, strategy, contexts[], findings, accepted, built, merged, pr, codexFailures{class:count}, tokensCodexEst, minutes}`. `tokensCodexEst` is the sum of `usage.input_tokens + usage.output_tokens` across this project's `result.json` files. **Omit a value you do not have; never write 0 for unknown.**
3. Report per project: found, rejected by reason, built, landed, PR or branch, Codex tokens, failure classes, and what awaits the operator.
4. **Learn.** A lesson is a measured change in what to look for or how to direct Codex. Record it in `LESSONS.md` against the version used. **A failure class or a rejection reason seen in two runs is promoted**: a new clause in the brief template that would have prevented it, or a lens dropped or sharpened in `survey-brief.md`, plus a row in the failure table, plus a version bump in the same commit. A lesson that lives only in `LESSONS.md` never reaches the next builder. The bump lands through the registry's own gates; it is never made in an installed copy.
5. Release the run-board claim.

## Census mode - measure the two-way gap

No project fully follows the registry, and nobody knows by how much. Parts get rebuilt where a golden path exists (inbound), and parts forged in projects never reach the registry (outbound). A census measures both. **It is read-only: no build, branch, PR, or registry-map write.** A census spans days, so it must be resumable.

**Pilot before the fleet.** The first census of a brief version runs steps 1 to 4 on one project, and the fleet waits for its audit to pass. Audit misses as well as false claims: for each sampled context, also open its largest part and ask whether a `consumes` verdict hides a missed rule. On the first real context the relation flipped between two runs (`LESSONS.md`).

1. **Tree.** A detached worktree per project, at the local base tip when that is ahead of the remote (unpushed work is real code), otherwise at `origin/<base>`. Never read a working tree: sibling WIP is not the project. No dependency install is needed. Record slug-to-tree in `<runs>/<date>/roots.json`.
2. **Read.** `node <skill>/scripts/census-run.mjs census --slug <slug> --tree <tree> --runs <runs>/<date> --registry <registry> --map <checkout>/.ai/registry-map.json --slots <n>`, as a background command. **Scope comes from `git ls-files`, never from registry-map paths, which are capped at 12 per context.** The map only names nearby standards. It writes a manifest of bounded chunks, skips any chunk already `done`, and governs by live RAM.
3. **Collect.** `node <skill>/scripts/census.mjs collect --runs <runs>/<date>/census --roots <runs>/<date>/roots.json --out <runs>/<date>/census.json`. A part whose quote is not in the cited file is dropped, a `consumes` with no standard and no shared part is refused, and coverage is measured from what Codex's commands actually returned. **Under 90% of in-scope files read fails the pilot, however clean the run looks.**
3a. **Judge.** `census-run.mjs judge --census <file> --roots <roots> --runs <runs>/<date> --registry <registry> --out <file>`, as a background command, runs the chain in order and resumes from the last saved stage: merge duplicate rows; adjudicate each `no-standard` against a search of the whole registry; rejudge each `reinvents` for scope, responsibility and consequence, with the broken rule quoted from the standard and the line where the harmful input originates quoted from the code; confirm each `consumes` that names a standard, with a quoted rule and a line of code; then judge each upheld accusation a second time, in a different batch. Only agreement keeps an accusation, and every keeping verdict must name its trigger line again; code checks that line exists. What cannot be backed or was contested becomes `unverified`, and a standard that does not apply makes the part `not-governed`.
3b. **Test the judges first.** Before spending on a changed brief or model: `census.mjs golden-census --golden <skill>/evals/planted/golden.json,~/.daybreak/golden/golden.json --out <g>`, `census-run.mjs judge` on it into its own run dir with roots naming each project's pinned tree and `planted`, then `census.mjs golden-score`. The score feeds the gate. Rows are added after each audit with `golden-add`; a disagreement needs the right answer in `--truth`.
4. **Audit.** `census.mjs sample --census <file> --per-relation 10 --salt <run> --out <sample>` for a pilot; use a salt no earlier audit used. The Director opens each sampled part in the code, judges whether its `relation` is right, and writes `{"<id>":"agree"|"disagree"}`. Then `census.mjs gate --census <file> --audit <audit> --golden <score>`: at least 30 audited, at least 8 each of `reinvents` and `consumes`, at most 20% wrong overall, 15% on `reinvents`, 25% on `consumes`, and a golden score of at least 85% with 90% inbound precision. Exit 0 is a pass and every failure is named. **Do not move the bar after seeing a result.** A failed census files no leads and writes no ledger record, so the project still ranks as never censused.
5. **Report.** `census.mjs report --census <file> --audit <audit>` writes `Daybreak/census/<date>.md`: per-project inbound, outbound, local and unverified, plus shared-part candidates (the same kind and stack in 3 or more projects, with their capabilities).
6. **Leads.** The Director verifies the strongest outbound parts against the code, at most 5 per project, and appends them to that project's `.ai/registry-leads.jsonl` with `"from":"daybreak@<version> census"` and `"because"` saying the code was read and not changed. This is a labeled exception to `## Knowledge sync`, which admits only lessons from landed fixes; `/intake` still decides what survives.
7. **Record.** One ledger line per project with `"strategy":"census"`. Remove the worktrees.

**Verdicts stay out of the maps.** Census judgments are not written to `.ai/registry-map.json`; those belong to `/conform`. Promoting them is a later decision, made with the audited error rate in hand.

## Invariants

- The handshake runs on every run, and push consent never carries over.
- Codex never receives its own finding as its plan, never commits, and never reviews itself.
- `-c model_reasoning_effort=medium` is passed per run. `~/.codex/config.toml` is never edited.
- Every number in a report comes from a file the run wrote. An estimate is labeled as one.

---

<!-- clause: knowledge-sync v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, to `.ai/consults.jsonl` in the task's MAIN checkout (never a disposable worktree), written before the run's first commit - pre-commit consult checks read it: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"daybreak@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill daybreak --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"daybreak","outcome":…,
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
