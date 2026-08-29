---
name: ci-triage
description: "Turn a red build into a located first cause and a scoped fix proposal, without scrolling the whole log or weakening the check. Use when CI fails and you need the actual reason."
category: ci-cd
memory: project
version: 0.2.0
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

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/ci-triage/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - ci-triage` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/ci-triage` in a consuming repo is a symlink to `<registry>/skills/ci-triage` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/ci-triage` and `git -C <registry> commit -m "skill(ci-triage): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/ci-triage/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/ci-triage` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
