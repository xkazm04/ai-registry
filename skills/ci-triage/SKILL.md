---
name: ci-triage
description: "Turn a red build into a located first cause and a scoped fix proposal, without scrolling the whole log or weakening the check. Use when CI fails and you need the actual reason."
category: ci-cd
memory: project
version: 0.1.0
tags: triage, failure, logs, diagnosis, proposal
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
