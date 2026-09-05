---
layer: application
type: application
subject: pipeline-authoring
technique: foreign-config-replay
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: task
ab_verdict: better
proof: ab-paired
---

# Two answers to "which checks apply here", and nothing connecting them

A desktop application with a Rust core and a web frontend runs its local gates
through a hook manager configured in one file, with per-job path globs and
exclusions, and its remote gates through a set of workflow files that were
written separately. Neither file references the other. The version witness is the checked-in runtime pin the remote pipeline resolves for every job, not a value a dispatch guessed. This is the
approximation case the technique describes, and the tree lets it be measured
rather than argued.

## The measurable and the two arms

The measurable is the count of **checks enforced by the local hook config that
no remote workflow runs** — the direction in which this drift is invisible,
because both surfaces report green.

- **Arm A**, the tree as it is: remote gates authored independently.
- **Arm B**, the technique applied: remote legs derived by replaying the hook
  config's own job list.

Same input for both — the repository's two gate configurations at one commit.
Arm B's count is zero by construction, which is the point of the construction;
arm A's had to be measured.

| arm | local jobs | with no remote counterpart |
|---|---|---|
| A — authored independently | 11 | **3** |
| B — derived by replay | 11 | 0 |

## What the three are

- A **secret scan**. Its own comment in the hook config argues for its position
  — a leaked key must be blocked before it leaves the machine, because a remote
  gate catching it means the leak already happened. The argument is right and it
  is an argument for *adding* the local hook, not for omitting the remote one:
  as configured, the local hook is the only enforcement, and it is absent for
  any clone that has not installed hooks, any push from another machine, and any
  invocation that disables the hook manager.
- A **translation-completeness check** whose comment records exactly why it
  exists: a sibling check asserted that every key exists in every locale but not
  that any value was translated, and roughly a quarter of the application shipped
  as untranslated English behind a green report for months. The check written to
  close that hole runs locally only.
- A **freshness check** on the repository's own agent-context files.

Eight other jobs do have remote counterparts, several only transitively through
a wrapper script, which is the detail that makes the naive measurement wrong.

## The instrument, and the wrong answer it gave first

The first version of the measurement matched each hook job's script path against
the raw text of the workflow files. It reported nine gaps. Six were false: the
remote pipeline invokes a wrapper (`npm run check`) that chains ten further
wrapper scripts, and the underlying checks appear only after that chain is
expanded. The corrected instrument resolves every wrapper through the package
manifest, transitively, before matching — and its own test set carries two known
positives and one known negative, because an absence read off an unexpanded
search is exactly the confident wrong answer this measurement is prone to.

That failure is worth recording as part of the application: **an instrument that
measures a coverage gap can only be trusted after it has been shown to find a
coverage that exists.** The corrected run is the one in the table.

## What the tree confirms about the technique

The technique claims the drift is silent and directional. Both hold here. Every
one of the three gaps had been present long enough to be invisible; none had
produced a failure, because the local hook passes for the author and the remote
pipeline never knew the check existed. And the direction is uniform — no check
runs remotely that does not also run locally, which is the shape the technique
predicts when one of two independently authored selectors is maintained by the
person feeling the friction and the other is not.

## What was shipped

The first step only: a parity checker that resolves each local job's real
invocation and asserts a remote counterpart exists, with an exemption list that
requires a stated reason. It ships **red**, deliberately — silencing the number
before anyone has argued about the three would be the same defect one level up.
The larger change, deriving the remote legs from the hook config so that scope
as well as presence stays in step, is written down as a later step and not
started; it changes the shape of the pipeline file and deserves its own
decision.

## What this realization cannot do

It checks **presence, not scope**. A check that runs on both sides may still be
narrowed differently in each — a glob tightened locally and not remotely leaves
files unchecked in exactly the way this technique warns about, and this
instrument reports that case as covered. Closing it requires the full replay,
which is the step this application deliberately did not take.
