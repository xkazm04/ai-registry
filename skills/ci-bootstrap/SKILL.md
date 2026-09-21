---
name: ci-bootstrap
description: "Give a project its first real CI gate, built only from commands the repo already declares, and ratcheted so it goes green on day one. Use when a repo has no CI, has CI that has never passed, or has CI nobody trusts."
category: ci-cd
memory: project
version: 0.3.0
tags: bootstrap, gate, ratchet, workflow, first-ci
argument-hint: "[project-root]"
---

# CI bootstrap

Most projects get CI at the wrong moment and in the wrong shape. Too early, it is a
copied template running commands the repo does not have. Too late, it is added in one
push, fails on forty pre-existing problems, and is switched off within a week.

This skill installs a gate that is **true on the day it lands**: it runs only commands
this repository actually declares, it blocks only on stages that pass right now, and
everything else is reported until someone fixes it. A gate that is green on day one is a
gate that stays.

## When to use

- The repo has no CI at all.
- The repo has CI that has never passed, or whose failures nobody reads.
- An agent is about to start making changes at volume and there is nothing catching them.

## Step 1: measure before you gate

Do this first and do not skip it. You cannot ratchet what you have not measured.

Discover the real commands, in this order of authority. **Never invent a command.**

1. `.ai/manifest.yaml` -> `capabilities` (`lint`, `typecheck`, `test`, `build`)
2. The project's own task definitions: `package.json` scripts, `Makefile` targets,
   `justfile` recipes, `pyproject.toml` tool config, `Cargo.toml`
3. Any existing CI config - whatever it runs IS the current gate, and it wins ties

Then run each one locally and record the result. Report the table before writing anything:

```
format     ok        0.8s   npm run format:check
lint       FAIL     4.1s   npm run lint            37 problems
typecheck  ok        9.2s   npx tsc --noEmit
test       ok       22.0s   npm test                104 passed
build      -         -      not configured
```

`not configured` is a real outcome and is reported as itself. A stage with no command in
this repo does not get one made up for it.

## Step 2: place each stage on a rung

Three rungs, and the assignment is decided by the measurement, not by preference.

| rung | goes here when | behaviour |
| --- | --- | --- |
| blocking | the stage passes today | fails the build |
| reporting | the stage fails today | runs, prints, exits 0 |
| absent | no command exists | not in the workflow at all |

The reporting rung is the ratchet. It exists so a pre-existing problem does not block an
unrelated change - which is how gates get deleted - while still being visible on every
run. Each reporting stage gets a one-line comment in the workflow naming what is wrong
and roughly how much: `# 37 lint problems as of <date>; promote to blocking when 0`.

Never put a stage on the reporting rung because it is slow or annoying. Reporting is for
"currently failing", nothing else.

## Step 3: write one workflow, with these five properties

1. **One job per stage, named for the stage.** Not one job running five commands in a
   chain - a chain aborts at the first failure and hides every stage after it, so a
   single early breakage blinds the whole gate.
2. **Path filters that include the workflow itself** and the dependency lockfile. A gate
   that can be edited without running is not a gate. If in doubt, filter coarsely: over-
   triggering costs seconds, under-triggering costs a whole class of unchecked change.
3. **A schedule trigger as well as the change trigger.** A change-only trigger means a
   repo that goes quiet never re-reports, and the last green result stays on the page
   while everything underneath it drifts. Weekly is enough. The scheduled run reports and
   does not block.
4. **No install step the gate does not need.** Keep the gate dependency-light so it is
   fast and so it can be run by anyone debugging it.
5. **Fail on a stage that did not run.** If a command is missing or a glob matched
   nothing, that is a failure of the gate, not a pass. Zero files checked is never green.

## Step 4: wire the same commands locally

The gate's commands and the local pre-push commands are the same commands. Add them to
whatever hook system the repo already has - `lefthook`, `husky`, `pre-commit`. **Never
add a second hook system.** If there is no hook system, do not install one; point the
author at `ci-gate-check` instead, which reads the same declarations.

## Step 5: report

```
CI bootstrap complete.

blocking   format, typecheck, test
reporting  lint (37 problems, 2026-08-21)
absent     build (no command declared)

triggers   push+PR on <paths>, weekly schedule
local      3 stages wired into existing lefthook pre-push
next       fix lint to 0, then promote it to blocking
```

## Rules

- Never invent a command. `not configured` is an honest result; a fabricated passing
  command is a false green with a plausible name on it.
- Never land a gate that is red on the day it lands. Ratchet instead.
- Never chain stages into one job.
- Never let a stage be silently skipped. Not-run, not-configured and passed are three
  different outcomes and must render as three.
- Do not add a second hook system, a second lint config, or a second version of any tool
  the repo already has. One authority per rule.
- Do not raise thresholds or add exemptions to make a stage pass. That is a change to
  what the gate means, and it needs its own commit and a reason.

## Related

- `ci-gate-check` - runs this same gate locally before a push.
- `ci-triage` - what to do when the gate this skill installed goes red.
- Knowledge: `quality-gates` (gate-laddering, ratchet-design, gate-liveness),
  `pipeline-authoring` (change-scoped-work-selection),
  `machine-paced-delivery` (pre-authorship-verification).

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Lane 0 is written on EVERY run; lanes 1-3 are not. Be honest about volume: most runs produce nothing in lanes 1-3. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 0 - RUN LOG** (every run that started work, including failed and aborted ones; skip read-only info modes such as a status peek, and runs cancelled before any work). Append one row to the registry's run log with one command - identity (project, device) and the skill's version are resolved by the script, never typed (`<registry>` resolves as in lane 2 step 4):

```sh
node <registry>/scripts/log-run.mjs --skill ci-bootstrap --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence: what this run produced>" --comment "<free text>"
```

- `--outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted` (stopped by the operator or the harness).
- `--difficulty`: 1 trivial - mechanical, no judgment needed; 2 routine - the method applied as written; 3 demanding - real judgment calls, or one detour; 4 hard - several dead ends, rework, or an operator course-correction; 5 at the edge - partial or failed on the merits, not on tooling. Rate the TASK as this run met it, not the effort you spent.
- `--model` / `--effort`: what you are running as, as your harness states it; omit `--effort` when you cannot see it. `--tokens-est`: the drop in the harness's remaining-token counter from just before this skill was invoked to now; omit it when your harness shows no counter. Exact figures are measured later from the transcript and stored apart - never guess one.
- `--comment` is the self-reflection a reviewer will read: what went well, what the method made harder, where the skill's instructions were wrong, missing or ignored. Specific over polite; no filesystem paths or email addresses (the writer rejects them).
- If the command fails on validation, fix the named field and rerun. If the registry is unreachable, add `--pending` (the row waits in the project's `.ai/`). Never read the run log during a run: it is evidence ABOUT this skill for `/librarian skills`, and an executor that reads its own diagnosis contaminates the next measurement.

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/ci-bootstrap/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - ci-bootstrap` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/ci-bootstrap` in a consuming repo is a symlink to `<registry>/skills/ci-bootstrap` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/ci-bootstrap` and `git -C <registry> commit -m "skill(ci-bootstrap): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/ci-bootstrap/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/ci-bootstrap` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
