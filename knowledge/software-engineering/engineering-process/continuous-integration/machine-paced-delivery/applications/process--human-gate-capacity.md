---
layer: application
type: application
subject: machine-paced-delivery
technique: human-gate-capacity
stack: process
status: forged
verified_on: 2026-08-31
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Taking the gate's size measure on a real history, and losing the unit

`verified_against` is omitted per the profile: a `process` application has no runtime
version. What was read is a git history of 7,773 changes, resolved on `verified_on`.

The technique prescribes measures nobody had taken. This is the first time they were computed
against a real delivery history rather than argued, and the run's most useful output is that it
**refuted its own first number** — which is what put the unit condition into the technique.

The tree: a single-owner product repository whose changes are overwhelmingly agent-authored,
7,773 non-merge changes over 195 days, an arrival rate of 39.8 changes/day. That rate is the
subject's own thesis arriving as a fact — one person, machine-paced arrival, and delivery
conventions built for a single human author.

## The arms

Both arms read the same population; no product code was changed and nothing was written to the
tree. The measurable is the technique's own: **does the size dimension surface a population that
the item-counting measures report as a single healthy number?**

- **Arm A — the four item-counting measures.** Arrival, dwell, backlog age, post-merge repair.
  Two of the four are not derivable from history at all: with no recorded review timestamps
  there is no dwell and no backlog age. What arm A yields is one arrival rate and **one
  post-merge repair number for the whole population: 62.9%**.
- **Arm B — the same population, split by arriving size.** Post-merge repair per size bucket.

Repair is defined as a later change within seven days touching at least one of the same files
whose subject matches a repair vocabulary. Sizes exclude lockfiles, generated clients, vendored
trees and snapshots, per the owning threshold table.

## Arm B separated a population, and then the control took it away

By changed lines, repair rose 51.5% → 68.9% → 81.5% → 81.1% across the four buckets: 22.8% of
changes sat above the large threshold and repaired at 81.3% against 57.4% below it. Read at that
point, arm B looks like a clean confirmation — a 1.42x separation the single number hides.

It does not survive its control. Repair tracks **files touched** almost perfectly on its own:

| files touched | changes | post-merge repair | median lines |
|---|---|---|---|
| 1 | 2648 | 34.0% | 20 |
| 2–3 | 2013 | 50.3% | 71 |
| 4–8 | 1396 | 66.0% | 228 |
| 9–20 | 706 | 73.9% | 502 |
| 21+ | 1066 | 92.2% | 785 |

Holding files touched fixed and varying lines inside each band, the line gradient mostly
disappears — and in the single-file band it runs backwards:

| band | small | medium | large | very large |
|---|---|---|---|---|
| exactly 1 file | 35.2% (n=2341) | 24.6% (n=272) | 29.0% (n=31) | — |
| 2–3 files | 50.4% (n=1192) | 48.0% (n=638) | 53.4% (n=131) | 67.3% (n=52) |
| 4–8 files | 58.4% (n=310) | 68.9% (n=630) | 66.0% (n=324) | 69.7% (n=132) |

Larger changes touch more files, so a line-based size measure reproduces the files-touched
result and reads as if it had confirmed itself. The first number was an artifact of surface
area, and only holding the other candidate fixed showed it.

## What the run establishes, and what it cannot

**Established.** The size dimension does what the amendment claims: it separates a population —
34% to 92% — that arm A reports as one number, and no item count would have surfaced it. The
verdict is `better` on the dimension. What the run corrected is the **unit**: the owning
threshold table names the unit as an open choice and its default table is stated in changed
lines, and in this tree that default carries almost none of the signal it appears to carry. The
technique now carries that as a condition and a decision rule.

**Not established, and the boundary is the important half.** This tree has no human merge gate
on the measured population — changes land directly, so there is no verdict to be rendered or
withheld. The run therefore corroborates the amendment's *premise* (bigger changes are followed
by repair more often) and never observes its *mechanism* (a reviewer failing to render a verdict
on a change too large to read). Post-merge repair is standing in for an unrendered verdict here
without any way to check that it does.

The realization also cannot see intent: a repair-vocabulary subject line following a change to a
shared file is not proof the first change caused the second, and at 40 changes/day on overlapping
files the predicate is close to saturated — which is why the absolute rates run high and only the
*differences between strata* are load-bearing.

## Return condition

Re-run against a tree with recorded review events — approval timestamps and per-change verdicts
— so dwell and backlog age exist and the rubber stamp can be observed rather than inferred. That
is the instrument this application lacks, and until it exists the size-driven rubber stamp is
corroborated at its premise and unobserved at its mechanism.
