---
name: ci-bootstrap
description: "Give a project its first real CI gate, built only from commands the repo already declares, and ratcheted so it goes green on day one. Use when a repo has no CI, has CI that has never passed, or has CI nobody trusts."
category: ci-cd
memory: project
version: 0.1.0
tags: bootstrap, gate, ratchet, workflow, first-ci
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
