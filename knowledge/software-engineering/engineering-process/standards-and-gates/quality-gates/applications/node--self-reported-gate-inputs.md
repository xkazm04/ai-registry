---
layer: application
type: application
subject: quality-gates
technique: self-reported-gate-inputs
stack: node
verified_on: 2026-09-01
verified_against: node@24.12.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A coordination gate whose whole input is volunteered (Node)

Read and exercised 2026-09-01 against this registry's own concurrency
board — the Node script a dozen parallel sessions consult before writing
into shared bundles. It is the inert branch in its purest form, and the
registry is an honest exhibit because it wrote the technique.

## The seam

`scripts/run-board.mjs`, `cmdCheck`. The gate answers "is a live sibling
holding this path?" by loading the board's records and matching claims
against the target. Every one of those records exists because a session
*chose* to run `claim`. A session that skips the claim contributes
nothing, so it is not a sibling the gate can see — while remaining a
session actively writing to the path.

The method's own prose already knows this: running without a board claim
is listed as an anti-pattern, with the note that every collision rule
"degrades to hope." That is a rule written down and never mechanised —
[prose-rule-drift](../techniques/prose-rule-drift.md) — and the reason it
was never mechanised is the one this technique names: no check keyed on
the claims can detect a missing claim.

## Arms

An unclaimed concurrent writer was simulated by placing an in-flight file
under a subject path no live run had claimed, then asking both arms
whether that path was contended.

| Arm | Question it asks | Result |
| --- | --- | --- |
| A — shipped | what do the claim records say? | `clear: no live sibling holds 1 target(s).` exit `0` |
| B — the act | what does the working tree say? | `1` in-flight file → **contended** |

Arm A permits. The decisive detail is not that it is wrong but that it is
**unreadable**: `clear: no live sibling holds 1 target(s)` is the exact
output the gate produces when the board is genuinely empty. An unclaimed
writer and an idle repository are the same bytes, which is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
sitting inside a gate.

Arm B asks the same question of the act instead of the record. It needs no
cooperation, because a file being written is not something the writer opts
into reporting.

## Why the obvious fix is not one

The instinct is to add a check that the board looks complete — reconcile
claims against live processes, warn on a run that heartbeats without
claims. Every such check reads the claims, and the failure is that there
are none. A second guard on the same input is a second inert guard, which
is the technique's central claim and is visible here without running
anything.

The change the arms argue for is small and is **not** a replacement: keep
the board as the coordination mechanism, and add one filesystem
observation to `check` so a contended path with no claim behind it is
reported as contended-unclaimed rather than as clear. The board stays the
record; the tree becomes the backstop that cannot be skipped.

## Bounds

Arm B is a predicate, not a shipped change — this run measured the two
answers and did not modify the board. The in-flight signal is also not
free of false positives: an operator editing by hand, or a run's own
uncommitted output, both register, and the shipped form would need to
exclude the asking run's own paths. That is a refinement of the predicate,
not a defect in the comparison: arm A returns clear in every one of those
cases too, and a noisy detector that fires is strictly ahead of a silent
one that cannot.
