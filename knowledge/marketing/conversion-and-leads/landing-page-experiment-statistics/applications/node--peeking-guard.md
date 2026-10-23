---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: peeking-guard
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Peeking guard - the close button was a side door, and the badge was not one look

Verified against `systedo-case` at commit `fe3b7f1b` (2026-10-22), which is the change
this application measured; the arm A tree is its parent, `4718cdc8`. The version
witness is `package.json` engines `node: 24.x`. The verdict is the pure `evaluate()` in
`src/lib/lp-exp/compute.ts`, and three surfaces read its `significant`: the winner
pill and the ship handoff in `src/components/app/modules/LpExperimentsModule.tsx`, and
the creative-pattern miner in `src/lib/patterns/extract.ts`, whose lessons are fed to
the account's AI prompts as proven creative angles.

## The seam

Before the change, `evaluate()` computed significance per status:

```ts
const significant = exp.status === "done"
  ? !!winner && confidence >= 1 - effectiveAlpha
  : meetsConfidence && hasEnoughData;
```

The running branch is the guard as the technique states it. The `done` branch read
confidence alone, on the reading that a closed test was "stopped deliberately". But
the status is a flag the operator sets, and nothing distinguishes a deliberate stop
from a stop on the first morning the bar was crossed. The seam was chosen to falsify
the technique's procedure, which then said the same thing ("for a done test, it is
confidence alone"). A caught outcome would mean the procedure has to change, not only
the tree.

## The A/B

A paired null replay ran over the real `evaluate()` with no product code changed for
the measurement: two arms at a 4% baseline, 400 visitors per arm per day, 2,000 tests
per cell, two seeds. Arm A is the evaluator as it was. Arm B makes a `done` result
significant only when the sample gate also holds. Each cell runs one operator
policy:

| Policy | Null false winners, A | Null false winners, B | Power at +15%, A | Power, B |
| --- | --- | --- | --- | --- |
| close on the first crossing | 0.190-0.222 | 0.042-0.047 | 0.999 | 0.115-0.119 |
| close the day the gate opens | 0.027-0.029 | 0.027-0.029 | 0.78-0.79 | 0.78-0.79 |
| keep running until the badge shows (cap 3 horizons) | 0.094-0.107 | 0.094-0.107 | 0.999 | 0.999 |

- **Target:** null tests that reach a winner under the close-on-crossing policy. Arm A
  is 0.19-0.22, arm B is 0.04-0.05. Arm B's remainder is tests whose first crossing
  happened after the gate had opened.
- **Floor:** the honest policy, closing when the progress bar fills. It is identical
  in both arms: null 0.027-0.029, power 0.78-0.79. The project's unit suite went from
  4,382 to 4,383 tests with 0 failures, and `tsc`, `eslint` and `copy:check` stayed
  clean.
- **Verdict:** `better`. The power that arm B loses under close-on-crossing is
  intended: those tests are now labelled "stopped early at N% of sample" with their
  confidence at the stop, and none of them was a valid win.

## What the tree showed beyond the seam

**The fixtures had learned the bug.** The demo sample's finished winner and four test
fixtures declared a `done` winner at about 4,200 visitors per arm, against a gate of
about 17,000 for their own baseline. One fixture was titled "a done experiment with
enough data" and did not have enough data. The bug was baked into the demo story the
product shows new accounts. They now carry finished-test counts at the same rates.

**The guard's own claim failed, in both arms.** The third row is the technique's
process followed faithfully: keep the test running and act when the badge appears.
It still gives a null winner about one time in ten, roughly four times the single read
at the gate. Two things combine here. The requirement is sized on the observed
control rate, so the horizon moves with the data, and the daily looks continue after
the gate opens. This change does not fix that. The technique now states it: fix the
horizon at the start, and read the test once there.

## Anchors at `fe3b7f1b`

- `src/lib/lp-exp/compute.ts:179` "const significant = meetsConfidence && hasEnoughData;"
- `src/lib/lp-exp/compute.ts:180` "const stoppedEarly = exp.status === "
- `src/components/app/modules/LpExperimentsModule.tsx:160` "r.stoppedEarly && r.winner"
- `src/lib/patterns/extract.ts:176` "if (!r.significant || !r.winner) continue;"
- `test-unit/lp-exp.test.mjs:69` "a test marked done before its sample gate is stopped early, never a winner"

## What this realization cannot do

It cannot tell a deliberate stop from a peek. It refuses to promote either, which
costs a deliberate early stop its winner badge even when the reason was outside the
numbers. The technique accepts that cost. It also has no stored horizon: the gate is
recomputed from the current control rate on every read. Closing the badge-wait leak
would need a gate-open snapshot or a pre-test baseline stored on the experiment, or an
always-valid sequential threshold.
