---
layer: application
type: application
subject: shared-research-record
technique: resolution-bounded-leaders
stack: process
status: draft
verified_on: 2026-09-24
applied: code
ab_verdict: better
---

# Process: a memory-design ladder whose three leaders were one tie

Witness: the personas repository's memory evaluation harness (`evals/memory-year/`, read
at `cdb3b2bcb` on 2026-09-24, with the check below added on master). The harness replays
one simulated year against pluggable memory designs. Every design, called an arm, is
scored on the same 194 probes by the same grader, and the results are published as a
ladder. Arms have been added across five rounds by different sessions, so the ladder is
the leaderboard of a small research record. Each round reads it to decide what to try
next.

## What the ladder claimed

Round five added an arm driven as a real service and reported it at the top:

- evals/memory-year/FINDINGS.md:239 "It tops the ladder at 0.90, and 0.92 when its raw-history layer is left out of the read."

The ladder bolds successive leaders at 0.89, 0.90 and 0.92. A two-point step is four
probes. The accuracy column cannot say how many probes disagreed in each direction to
produce that net.

## The paired arms

Arm A is the ladder as published: the higher accuracy is the leader. Arm B is this
technique with the paired case-sampling margin. For adjacent arms it counts the probes
only one arm got right, each way, and applies an exact two-sided sign test. A pair that
does not clear p < 0.05 is a tie. Both arms read the same `answers.json` files, and no
arm was re-run.

| step | only lower | only higher | net / discordant | p | arm A | arm B |
| --- | --- | --- | --- | --- | --- | --- |
| 0.86 -> 0.87 | 17 | 18 | +1 / 35 | 1.00 | leader | tie |
| 0.87 -> 0.89 | 15 | 20 | +5 / 35 | 0.50 | leader | tie |
| 0.89 -> 0.90 | 13 | 14 | +1 / 27 | 1.00 | leader | tie |
| 0.90 -> 0.92 (same store, two read modes) | 0 | 5 | +5 / 5 | 0.06 | leader | tie, one-directional |
| 0.89 -> 0.92 | 8 | 14 | +6 / 22 | 0.29 | leader | tie |
| 0.65 -> 0.86 (floor control) | 12 | 52 | +40 / 64 | <0.001 | leader | **resolved** |

**Target:** leader claims inside the resolution among the top arms. Arm A makes 5; arm B
makes 0. **Floor:** a pair the ladder separates by twenty points must still resolve. It
does, at +40 of 64. Verdict: `better`. The top five arms are one band on 194 probes, and
the ranking below that band stands.

Two independent implementations agree on every number: a scratch script, and the
committed check below. The check asserts itself before it reports. A run paired with
itself must tie, and the no-memory arm against full history must resolve. With the
threshold forced to always resolve, the self-pair trips the control and the check exits 1.

- evals/memory-year/memory_year/checks/ladder_resolution.py:53 "def sign_test(k: int, n: int) -> float:"
- evals/memory-year/memory_year/checks/ladder_resolution.py:74 "CONTROL FAILED - a run against itself resolved"

The finding was committed beside the claim it qualifies, in the file's own voice:

- evals/memory-year/FINDINGS.md:244 "every adjacent step from 0.86 to 0.92 is a"

## What this realization cannot do

- **It prices probe sampling, not grader variance.** One probe class judged on form moved
  0.56 to 0.84 to 0.56 across three runs of nearly identical code, and the sign test sees
  none of that. A pair that resolves here can still sit inside the grader's band. A pair
  that ties here is a tie.
- **Its same-configuration control is weak.** The two runs of one configuration tie at 0
  discordant only because the second replays recorded contexts. The zero was inherited
  from the replay; it was never measured. A true same-code spread needs a fresh re-run
  and re-grade.
- **It does not choose among the tied arms.** Which of the top five is best needs more
  probes or repeated grading. The ladder's other axes (read cost, write cost, stale
  answers) are where these arms actually differ.
