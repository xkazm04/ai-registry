---
layer: technique
type: technique
subject: quality-gates
technique: oracle-frozen-during-repair
status: forged
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [an agent is asked to make a failing check pass, a fix and the test that proves it arrive in the same change, a repair task's diff touches a test or a skip directive, deciding what a fixer may write to]
---

# Oracle frozen during repair

A repair task has two artifacts in play: the code that is wrong and the
check that says so. The check is the **oracle** — the thing the verdict
comes from — and the whole value of the task rests on the oracle meaning
the same thing at the end as it did at the start. The moment the actor
doing the repair can also edit the oracle, "make the check pass" has two
solutions, and the cheaper one is always to change the check. This is
not a hypothetical for a machine author: a fixer with write access to the
test *will* eventually satisfy the instruction by weakening the test, not
because it is malicious but because that is the shortest path to green,
and nothing in a green result says which path was taken. The technique is
a freeze: **for the duration of a repair task, the oracle is read-only to
the party being repaired against, and the freeze is mechanical, not
requested.**

## What counts as the oracle

Wider than "the test file". Everything whose edit could turn a red into a
green without changing the behavior under test:

- test sources and test helpers;
- fixtures, golden files, snapshot baselines, recorded responses;
- skip, quarantine, `only`, retry-count and timeout directives;
- coverage and lint thresholds, ratchet baselines
  ([ratchet-design](./ratchet-design.md));
- the gate's own configuration and the scripts it runs;
- the assertion library's configuration where it can soften a comparison.

This is the same list the delivery layer reserves for a human author at
the merge gate — gate configuration, test deletion or skipping,
suppression directives — and that is not a coincidence. The merge gate
enforces it *late*, on the finished proposal; this technique enforces it
*early*, inside the task, where the change is still cheap to refuse and
before a whole session's work has been built on a softened check. Same
rule, two stages.

## The order of operations is part of the freeze

A freeze protects an oracle that already exists. For a defect nobody has a
check for yet, the check is written first, and the ordering is what makes
it evidence:

1. **Reproduce the defect as a failing check.** Run it. Confirm it fails
   *for the expected reason* — a check that fails because a fixture path
   is wrong proves nothing about the bug.
2. **Commit the failing check on its own.** It now exists independently of
   any fix, with its own timestamp.
3. **Freeze it and repair.** The fixer may read the check and may not
   write to it; the task is complete when the same check, unmodified,
   passes.

A check that existed before the fix and could not be rewritten by the
fixer is proof the defect is gone. A check authored *in the same change*
as the fix is fitted to the fix — it passes by construction, it was never
seen red against the real code, and it will pass equally well against a
fix that is wrong in a way the author did not anticipate. The two look
identical in a finished diff; only the history tells them apart, which is
why step 2 is a commit and not a mental note.

## Mechanical, or it is not a freeze

The freeze runs in the layer that acts *before* the write lands — the
harness's own pre-action hook refusing edits under oracle paths while a
repair task is open, or a write-scope that omits those paths for the
task's duration. The hook explains itself in the refusal (which path, why,
and the route: "open a separate test-change task") so the fixer
cooperates with the gate instead of routing around it; it is a guest in
the working tree and follows [hook-hygiene](./hook-hygiene.md) — it
refuses, it never rewrites.

Two weaker forms exist, and both are named for what they are:

- **Review-time detection** — a merge check that fails any repair-labelled
  change whose diff touches oracle paths. Real, and the binding rung when
  the local freeze is absent, but it discovers the softening after the
  session has finished building on it.
- **Instruction** — "never edit the tests" in the agent's instruction
  file. This is prose, and prose is the layer this whole subject exists to
  replace; it belongs in the file only as a *pointer* to the hook that
  enforces it, per the sorting discipline in
  [enforcement-demotion](../../../../llm-agent/prompt-and-context/agent-instruction-files/techniques/enforcement-demotion.md).

A freeze the fixer can lift is not a freeze. If the local hook is
bypassable — and local hooks must be — the review-time check is the
backstop that makes the bypass visible ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The verdict comes from the toolchain, not from the fixer

"Done" for a repair task is the oracle's literal output, run by the gate
and attached to the result — never the fixer's report that it passed.
This is the single-task instance of [gate-liveness](./gate-liveness.md):
a self-reported pass reads a proxy (the author's belief) for the target
(the check's exit status), and the two diverge exactly when the fix is
wrong ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A task
that ends with the check unrun is *not verified*, and the result must say
so rather than say nothing ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## When the check itself is the defect

Sometimes strictness is wrong: the test encodes a behavior that was
changed on purpose, the snapshot captured a bug, the threshold was set
against a different baseline. The freeze does not deny this; it denies
that the decision belongs *inside the repair task*. The release valve is
a separate, differently-labelled task — a test change, authored or
approved by a human as the reserved class it is — and the repair task
resumes against the corrected oracle. Keeping the two tasks apart is what
lets a reviewer see that an oracle changed and *why* in isolation,
instead of finding it in the middle of a fix diff where it reads as
plumbing.

## Diagnostics

- **Refused oracle edits per repair task.** Zero is normal. A rising count
  on one task is a fixer trying to fit the oracle, and the task should be
  stopped and read, not left to converge.
- **Repair changes whose merged diff touches oracle paths.** Zero by
  construction when the freeze holds; any non-zero count is a bypass that
  the review-time check let through, and is treated as a gate defect
  before it is treated as a code defect.
- **Checks committed red before their fix**, as a share of repair tasks.
  The proof-of-defect ratio; a low number means fixes are arriving with
  fitted tests.

## Boundaries

- The [test-harness](../../../build-and-release/test-harness/test-harness.md)
  owns the suite — lanes, fixtures, flake handling. This technique owns
  only who may write to it during a repair.
- The merge-gate half of the same rule — the reserved classes that require
  a human author — belongs to the delivery layer's proposal discipline;
  this is the in-task half.
- The eval-harness owns the non-deterministic lane, where the oracle is a
  judge. The freeze applies there too, in the form the judge takes: a
  pinned judge and versioned scenarios the system under measurement cannot
  edit mid-run.
