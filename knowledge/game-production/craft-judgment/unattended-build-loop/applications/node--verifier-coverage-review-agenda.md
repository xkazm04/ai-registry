---
layer: application
type: application
subject: unattended-build-loop
technique: verifier-coverage-review-agenda
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The perceptual gate that never ran, in PoF's recorded harness runs

## The seam (tree opened at commit `c0f640c2`, 2026-08-30)

`src/lib/harness/orchestrator.ts` derives a feature's verified status from its
area's required gates in one line:

```ts
f.verified = f.status === 'pass' ? requiredGatesPassed : false;
```

For the webapp scenario the required gate set is `build` alone;
`createVisualGate()` in `src/lib/harness/visual-gate.ts:378` returns
`{ name: 'visual-check', type: 'visual', required: false }`, and
`gateCannotVerify` in `src/lib/harness/verifier.ts` excludes `visual` gates
from the launch preflight because their verifiability is runtime-determined.
Every piece of that is individually correct. Together they mean a feature
named "Active/inactive visual states with accent coloring" is verified by
`next build`, and nothing in the run can notice if the only gate that could
have looked at it never produced a verdict.

## The A/B

Both arms read the same four recorded runs under `.harness-ui`,
`.harness-content`, `.harness-dzin` and `.harness-dzin-full` (`game-plan.json`
plus `progress.json`), through a script that changes no product code.

- **A** — a feature is done when the run marked it `pass` (the loop's own
  verdict).
- **B** — a feature is done only when the iteration that decided its area also
  returned `PASS visual-check`; otherwise it is `unjudged`.

Predicate for "deciding iteration": the last `execute` progress entry for the
area. Predicate for "perceptual by name": the feature name matched a regex over
presentation vocabulary (visual, hover, active/inactive, glow, colour, opacity,
layout, grid, pill, badge, transition, animation, density, card, theme, icon).

| Run | Areas | Deciding iterations | `visual-check` verdicts | A: done | B: done | B: unjudged (perceptual by name) |
| --- | --- | --- | --- | --- | --- | --- |
| ui overhaul | 61 | 58 | 0 pass / 58 failed to run | 179 | 0 | 179 (31) |
| content overhaul | 19 | 19 | 0 pass / 19 failed to run | 55 | 0 | 55 (19) |
| dzin | 8 | 7 | gate not configured | 43 | 0 | 43 (4) |
| dzin full | 8 | 8 | gate not configured | 46 | 0 | 46 (0) |

n = 92 deciding iterations, 323 passing features, two arms over identical
inputs.

## What the tree's shape says

The structural fact is stronger than the count. In the two runs where a
perceptual gate was configured, it returned **zero verdicts in 77 of 77
deciding iterations** — every failure was `Visual gate failed to run` (the dev
server did not start; later, "no tests found"), never a judgement about a
frame. The loop marked 234 features done in those runs, 50 of them perceptual
by name, and `harness.log` shows the run then proceeding into a twelve-area
"Visual Polish" phase on the same non-verdict. Nobody designed a loop that
certifies presentation with a compiler; it fell out of `required: false` plus
a preflight that rightly refuses to judge that gate statically. The technique's
run-end coverage line ("visual-check: 58 decided, 0 verdicts, last reason:
failed to start") is the one sentence these runs never printed.

## Verdict: better, with the boundary the technique already states

B moved the number the reader cares about — features a human may trust as
judged — from 323 to 0, and named the gate responsible. That is the correct
report for these runs; A's 100% feature rates were composed of type checks.
B must not become the stop condition: making `visual-check` required would
pin the verified rate at zero for the same 77 iterations and burn the budget,
which is `unreachable-success-preflight`'s own failure. The change is a
reporting change — a `reachedRung` per feature, a per-gate verdict count, and
the unjudged list in the completion summary — and it is filed as the
project's next harness change rather than committed from this run, because
it touches `types.ts`, `orchestrator.ts` and the summary writer and cannot be
read from a gate on this machine today.

## What this realisation cannot do

The recorded runs predate the `unverifiable` flag, so B reads "failed to run"
from summary text and cannot separate a gate that judged and failed from one
that never started; the current verifier already emits `unverifiable` for the
engine gates, and extending it to `visual` is the instrument that would make
the coverage line exact. B also classifies perceptual items by name; the
technique's plan-level rung field is what replaces the regex.
