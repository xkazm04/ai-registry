---
name: ci-triage
description: "Turn a red build into a located first cause and a scoped fix proposal, without scrolling the whole log or weakening the check. Use when CI fails and you need the actual reason."
category: ci-cd
memory: project
version: 0.4.0
tags: triage, failure, logs, diagnosis, proposal
argument-hint: "[run-url-or-log]"
---

# CI triage

A red build is a question with a cheap answer and an expensive one. The cheap answer is
the first real error, which is usually one line and usually near the top of one job. The
expensive answer is reading the log. This skill always takes the cheap path first, and
its main discipline is what it refuses to do once it has the answer.

## When to use

- A push or PR went red and you need to know why.
- A build failed and the log is thousands of lines.
- An agent is about to "fix CI" and needs a diagnosis before it starts editing.

## The ladder

Descend only as far as you need. Stop at the first level that answers the question.

1. **Which jobs failed.** Not which are red on the page - which actually failed, as
   opposed to being cancelled or skipped because something upstream failed. A cancelled
   job is not evidence.
2. **Which step in that job.** One step per job fails first; the rest are consequences.
3. **The first real error in that step.** Not the first line containing the word "error".
   Summaries, retry notices and downstream consequences all match that. Look for the line
   carrying a **location** - a file and a position - which is the one that names a cause.
4. **Only if 1-3 do not answer it:** the log tail around the failure, bounded. Say how
   much you read.

If several jobs failed, check whether they failed for the same reason before triaging
each. One broken shared thing produces N red jobs, and fixing it N times is a waste and a
merge conflict.

## Reproduce locally before proposing anything

The gate's command is the command. Run it locally, from the repo's own declarations, and
confirm you see the same failure. Three outcomes:

- **Reproduces.** Good. Fix it locally, verify, then propose.
- **Does not reproduce.** Do not guess at the difference - name it. The usual causes are
  environment (a version, a missing tool, a platform), state (a cache, an artifact from a
  previous step, a leftover file), and non-determinism (ordering, time, concurrency). The
  third means the test is flaky and belongs in `flake-register`, not in a fix.
- **Cannot run locally at all.** Say so, and say what would be needed. A proposal built on
  a failure you could not observe is a guess with a diff attached.

## What to report

Short. Someone is waiting.

```
FAILED  typecheck (job 2 of 6)

first cause
  src/api/user.ts:41  Type 'string | null' is not assignable to type 'string'

scope
  1 job, 1 error. Jobs 3-6 cancelled, not failed.

reproduced
  yes, `npx tsc --noEmit` locally, same line

proposal
  narrow the return type at the call site in src/api/user.ts:38
  NOT: widening the parameter type, which would hide 4 other call sites
```

The `NOT` line is the most valuable line in the report. Say what you rejected and why.

## What this skill will not do

The shortest path to green is almost never the fix, and it is always available. These are
off the table, and stating them here is what makes the skill safe to run unattended:

- Deleting or skipping a failing test.
- Adding an inline suppression, ignore comment, or allowlist entry.
- Widening a type to `any` or its local equivalent.
- Raising a threshold, lowering a severity, or disabling a rule.
- Editing the CI configuration to stop running the failing check.
- Changing a dependency version to satisfy a check.

Each of these is a legitimate change *sometimes*, and every one needs a human author, its
own commit, and a stated reason. None of them is a triage outcome.

If the only path to green is on that list, that is the finding. Report it and stop.

## Land it as a proposal

The fix goes on a branch as a proposal, never straight onto the main branch. The proposal
carries, briefly: the failure as observed, the diagnosis, what was changed and what was
deliberately not, which checks were run to verify, and anything you are unsure about. One
concern per proposal - a branch fixing four unrelated red jobs can only be accepted or
rejected whole.

## Stopping

Bound the attempts. After two failed fixes, stop and report the diagnosis without a patch.
An unbounded fix loop converges on the shortcut list above, because that is what remains
once the real fixes are exhausted. A correct diagnosis with no patch is a good outcome.

## Related

- `ci-gate-check` - run the gate locally so most of these never reach CI.
- `flake-register` - where a non-reproducing intermittent failure goes.
- Knowledge: `machine-paced-delivery` (agent-readable-build-outcomes, proposal-not-push),
  `cicd-monitoring` (failure-drill-down), `test-harness` (flake-lifecycle).

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"ci-triage@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
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
node <registry>/scripts/log-run.mjs --skill ci-triage --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"ci-triage","outcome":…,
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
