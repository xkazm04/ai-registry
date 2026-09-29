---
layer: application
type: application
subject: unattended-build-loop
technique: review-at-the-fan-out-point
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The request half ships, the hold half is refuted, in PoF's harness

The version witness is the runtime that ran the suite (v24.14.0). The tree carries no
engines field and no CI pin, so no stronger witness exists. Tree opened at `93435e23`
and changed in `72a8a95b` on 2026-09-29.

## The seam

`src/lib/harness/orchestrator.ts` releases a dependent area through
`isDependencyResolved`, which returns true for any dependency whose status is
`completed` or `completed-with-gaps`. Neither status records which gate judged the
area. The gate-coverage agenda from verifier-coverage-review-agenda
(`formatGateCoverageLines`) is emitted once, at run end. So an area that six module
chains are built on can decide on `build` alone. Every chain then launches on it, and
the only line that could say "nothing looked at this" arrives after all of them.

The seam was chosen to falsify. The recorded runs are the ones where the perceptual
gate returned zero verdicts in 77 of 77 deciding iterations, so a first-article hold
could not be satisfied on them at all. If the technique were simply "stop the line",
this seam would kill it.

## The A/B

Both arms read the same four recorded runs (`.harness-ui`, `.harness-content`,
`.harness-dzin`, `.harness-dzin-full`: `game-plan.json` plus `progress.json`), with the
2026-08-30 perceptual-by-name predicate reused unchanged.

Replay of the policies, over the dependency graph:

| Run | Fan-out points unjudged and perceptual by name | Dependent sessions launched on them (A) | Strict hold: areas completed | Bounded hold: areas completed |
| --- | --- | --- | --- | --- |
| ui overhaul | 2 roots (+39 and +16 descendants) | 75 (371 min) | 6 of 58 | 58 of 58 |
| content overhaul | 1 root (+16 descendants) | 29 (184 min) | 3 of 19 | 19 of 19 |
| dzin, dzin full | 0 (no fan-out point) | 0 | 8, 8 | 8, 8 |

The shipped helper, `fanOutReviewRequest`, run through the product code over the same
runs:

| Run | A: mid-run requests | B: mid-run requests |
| --- | --- | --- |
| ui overhaul | 0 | 3 (entity selector, feature cards, metadata schema; 8 direct dependents each) |
| content overhaul | 0 | 1 (design consistency; 6 direct dependents) |
| dzin, dzin full | 0 | 0 (no perceptual gate configured) |

- **Target:** review requests raised when a fan-out area decides unjudged, before its
  dependents launch. It moved from 0 to 4. **Arm A is zero by construction**, because
  the old code has no such event, so the 0-to-4 move is not the evidence. The pair
  measures two things from recorded data that no construction fixes: B's precision (3
  of 4 requests land on a perceptual root) and the strict hold's floor (9 of 85 areas).
  Read it as a re-derivation over recorded runs through the product helper, not as two
  live runs.
- **Floor:** the harness suite, the typecheck and the scheduling. The suite went from
  301 to 310 tests, all green, and `tsgo --noEmit` is clean. `isDependencyResolved` is
  untouched, so no area launches later than before.

## Verdict: better for the request, not-better for the strict hold

The request is the half that always pays, and it is what shipped: a
`harness:review-request` event, printed as `REVIEW NOW`, and run-end agenda lines that
list each root before the per-gate lines.

The strict hold is refuted on this tree. It completes 9 of 85 areas, because the gate it
waits on never returns. That is the technique's own reason for bounding the hold,
observed rather than argued.

The bounded hold is not built. Its value depends on somebody answering inside the
window, and nothing in these runs records an operator's response time.

## What the tree's shape says

**One request in four is a false positive, and the tree explains why.** The metadata
schema area has eight dependents, but they inherit a data model, not a look. PoF has no
per-item required rung (step 1 of verifier-coverage-review-agenda is unbuilt here). So
the helper keys on "a perceptual gate is configured and did not pass", and it cannot
tell an edge that carries presentation from one that carries a schema. That is the
technique's step-1 caveat, measured at a precision of 3 of 4. A name regex in product
code would have hidden the false positive rather than fixed it.

## What this realization cannot do

- It raises the request and holds nothing. On a run nobody reads until the end, its
  whole value is the root-first agenda order.
- It counts direct dependents, and the agenda line names only those. The root's full
  reach, which is 39 descendants for the entity selector, is not computed.
- Precision depends on the plan carrying rungs, which it does not yet.

Return conditions: read a per-item rung once the plan carries one. Measure the bounded
hold on a live run with the request enabled and the operator's response latency logged.
The number to read is dependent sessions launched before the answer.
