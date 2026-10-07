---
layer: application
type: application
subject: module-design
technique: change-class-is-the-workload
stack: process
status: forged
verified_on: 2026-10-07
applied: experiment
ab_verdict: better
---

# Pricing the technique's own first discipline before anyone runs a comparison

The technique's first discipline is the one that gets skipped, because skipping
it still produces a number: **derive the arm count from a band you measured.**
This realization tests that discipline rather than illustrating it, on the one
substrate where the arms were already recorded — a corpus of 445 agent session
transcripts across 44 workspaces on one machine, of which 292 carried at least
three model turns and non-zero output tokens.

The instrument is `agent-cost-band.mjs` in this registry's own tooling lane. It
is dependency-free, takes the transcript root as an argument so no machine path
is embedded in it, and asserts that the root holds workspace subdirectories with
transcripts before it reports anything — a silent empty read would otherwise
print a confident band of zero.

## The two arms

The comparison is between **protocols**, not between codebases, which is what
makes it a test of the discipline:

| | arm |
| --- | --- |
| **A** | read the ratio from one observation per arm and declare the effect — the protocol both published measurements in this lane actually use |
| **B** | measure the run-to-run band first, derive the required arm count from it, and declare only what that count supports |

**Target**: the rate at which arm A recovers the correct *direction* of a known
cost difference. **Floor**: the ground-truth ordering each protocol is scored
against must itself be established — bootstrapped per pair, 0.90 or better —
because a protocol cannot be scored against an ordering that is not settled.

## What came back

The band: within-workspace output-token cost has a geometric SD of **5.91x**
over 118 sessions in the five workspaces with at least eight sessions each, with
per-workspace coefficients of variation from 0.52 to 3.09 and within-workspace
max/min ratios from 61 to 3,279. Derived from that band, resolving a 1.21x
effect at 95%/80% takes about **1,363 replays per arm**; a 2.7x effect, about 51.

The validation, over all ten workspace pairs:

| true ratio | ground truth stable | one per arm | ten per arm |
| --- | --- | --- | --- |
| 1.5x | 0.86 — not relied on | ~55% | 71% |
| 4.4x | 0.77 — not relied on | 53% | 60% |
| the eight established pairs (3.4x–248x) | 0.95–1.00 | **84%** | **98%** |

Two readings, and the second is the one that decides the verdict:

- Where the effect is large, arm A is mostly right — 84% at one observation per
  arm. That is the honest limit of the discipline: a 10x difference does not
  need a protocol.
- **No pair with an established ordering had a true ratio below 3x.** The
  absence is the finding. At the one pair in the range these studies report —
  1.5x, against reported effects of 1.16x to 2.7x — the bootstrap could not
  settle which workspace was more expensive from 43 and 11 sessions, and one
  observation per arm recovered the direction at chance. The protocol that
  published a 1.21x effect used one.

The floor held: the two unstable pairs are reported and excluded, and the
conclusion does not rest on them — the established-pair bucket is what carries
it, and it carries it in the direction of the discipline rather than against it.

## The seam was chosen to falsify, and what a catch would have taught

The arm that could have killed the discipline is the one that ran: had one
observation per arm recovered small-effect orderings reliably, discipline 1
would have had to narrow to large bands only, and the first-party account's
protocol would have been defensible as published. It did not — but the test did
return something the technique had not claimed, and the technique now says it:
**above a 3x true ratio one replay per arm is mostly sufficient**, which is a
boundary the drafted rule did not have and which keeps it from reading as a
demand for a thousand replays in every case.

## What this realization cannot do

The band it measures is **uncontrolled**: these sessions did different work, so
the figure mixes task-identity variance into the run-to-run term and the derived
arm counts are an upper bound rather than an estimate. The number a planner
actually wants is the *within-cell* band — one fixed change class replayed
several times against one fixed structure — and this corpus cannot supply it,
because nothing in it repeats a task. Neither can either published measurement:
both run exactly one trajectory per cell. That instrument does not exist yet in
this lane, and the honest consequence is that every published ratio here,
including the ones this technique cites, rests on an unmeasured variance term.

The between-workspace share is printed by the instrument as a diagnostic with
its confound named and is not a substrate effect: workspaces that do different
work differ in workload assignment. It was 0.507, falling to 0.382 when the
largest workspace is dropped, and that instability is itself a reason not to
read it as structure.
