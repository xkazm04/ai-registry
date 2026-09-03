---
layer: application
type: application
subject: test-harness
technique: approval-snapshots-with-guarded-update
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Seventeen re-approvals, none of them marked

The game-engine companion keeps snapshot tests under its test tree for the
prompt golden rail, the evaluator traces and the knowledge registries, run
by a single `vitest run` script. There is no engines pin in the package
manifest; the toolchain that read this tree on 2026-09-03 was Node 24.14,
and the snapshot runner is vitest 4.1 per `package.json`.

The technique says an expected file is re-approved only behind an explicit
switch, and a gate asserts the switch is off, so a re-approval is a visible
decision and never a side effect of a source change. This tree has the
snapshots and neither the switch nor the gate, which made it the right place
to measure the exposure the technique names.

## The measurement

Every commit in the project's history that touched a snapshot file was
listed, and for each one the same commit's non-test source changes were
counted.

| commits touching a snapshot | also changed source in the same commit | snapshot-only |
| --- | --- | --- |
| 17 | 17 | 0 |

Every snapshot change in this tree's history rode with a source change. That
is the normal shape for snapshots of generated prompt output, and it is
exactly the shape in which a silent re-approval is indistinguishable from an
intended one: nothing in any of the seventeen commits says whether the
snapshot was checked before it was accepted.

## Why the verdict is unmeasurable

The experiment measured exposure, not effect. Whether any of the seventeen
re-approvals hid a regression cannot be read from the tree, because no gate
sees a snapshot change: there is no continuous-integration workflow and the
pre-commit hooks do not look at test files. The instrument that would turn
this into a paired measurement is a check, in the pre-commit hook or in a
pipeline once one exists, that fails when a snapshot changes in the same
change as source without an explicit approval marker, counted over the next
twenty snapshot commits. Until that exists the technique has a seam here and
no number.

## What the realization cannot do

The measurement counts commits, not snapshots, and a commit that
re-approved twenty files counts once. It also cannot see re-approvals that
were squashed away before landing. Both biases run the same direction: the
real count is at least seventeen.
