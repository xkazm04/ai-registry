---
layer: technique
type: technique
subject: quality-regression-gating
technique: baseline-carries-its-conditions
status: forged
laws: [statistical-verdicts-or-no-verdict, the-judge-is-both-untrusted-and-under-test, never-present-absence-as-an-answer]
shared_with: []
use_when: [a gate compares a run against a stored baseline score, deciding whether an old baseline may still be compared against, a benchmark passes its floor and nobody can say when the floor was set, the judge or dataset changed and the baseline did not, a comparison is arithmetically valid and means nothing]
---

# A baseline carries its conditions

The paired test is required to establish comparability before it runs: same
mode, same target, same case count, same dataset version
([paired-per-case-testing](./paired-per-case-testing.md)). The floor test is
not. It reads a stored scalar and compares. And the decision rule that routes
between them says that when no comparable prior run exists, the gate falls
back to an unpaired test **against whatever absolute baseline exists** — so
the least-governed comparator is reached by exactly the condition that proves
comparability has already failed.

That is the wrong way round. The paired test's comparator is the *previous
run*, recent by construction and the one least likely to have gone stale. The
floor test's comparator is arbitrarily old, was produced by an instrument this
standard elsewhere insists is under test for as long as it is in service, and
has no expiry, no provenance and no precondition of any kind.

**A baseline is not a constant. It is a measurement, and it carries the
conditions it was taken under.** When those conditions no longer hold, the
comparison is arithmetically valid and semantically void: the arithmetic
subtracts two real numbers and the verdict describes nothing.

## The two failures are opposite and both silent

A stale baseline does not fail loudly in one direction. It fails in both, and
which one you get is an accident of which way the world moved.

- **The floor rots downward.** The baseline was set against a weaker
  instrument or an easier dataset revision, so today's run clears it without
  effort. The gate reports `pass` on every build forever. Nothing fires, and
  a gate that cannot fire is indistinguishable from a gate that is working —
  this is the disarm the golden path's composition doctrine exists to
  prevent, arriving through the comparator instead of through the math.
- **The floor rots upward.** The baseline was set under a judge that scored
  generously, or a dataset revision that has since been made harder. Every
  run now reads `regressed`, the team learns the gate is noise, and the
  first real regression arrives into an audience that has stopped reading.

Neither failure is visible in the verdict, because both produce a verdict of
exactly the shape the gate is designed to produce.

## The comparability predicate is short by one

The paired test's four conditions — mode, target, case count, dataset version
— enumerate everything about the *experiment* and nothing about the
*instrument*. The judge is absent from the list, and the judge is the one
component this standard already treats as drifting by default: it is
calibrated against human agreement on a schedule, and an uncalibrated judge's
scores are leads rather than measurements.

So the predicate takes the judge model and its version too, on both tests. Two
runs scored by different judges are not a pair, whatever their dataset says,
and a baseline set under a retired judge is not a floor — it is a number from
a discontinued instrument.

## Procedure

1. **Store the baseline as a record, never as a scalar.** The number, and
   beside it: when it was set, the run it came from, the judge model and
   version that produced it, the dataset version, and who or what set it. A
   bare float in a column is the failure — it makes every question below
   unanswerable, and it makes the answer look like it does not exist rather
   than like it was never recorded.
2. **Evaluate the predicate before the test, not after the verdict.** On each
   gate run, compare the current run's conditions against the baseline's. Any
   mismatch on judge or dataset version means there is no floor to test
   against.
3. **Refuse, do not degrade.** A baseline whose conditions no longer hold
   yields `no_baseline` — the existing unverified exit state
   ([unverified-vs-regressed-exit-states](./unverified-vs-regressed-exit-states.md))
   — with the mismatched field named. It never yields `pass`, and it never
   yields `regressed`. An absent comparator is not evidence of either
   outcome.
4. **Re-establish rather than adjust.** The repair is a fresh baseline run
   under current conditions, recorded with its conditions. Editing the stored
   number to make the gate quiet is the epsilon gate wearing different
   clothes.
5. **Say which condition expired, in the artifact.** "Baseline set
   2026-01-14 under judge `X@2.1`; this run used `X@3.0` — floor not
   applicable" is a sentence a reader can act on. "no_baseline" alone sends
   them looking for a baseline that is right there.

## Decision rules

- **When the baseline predates the recording of conditions** — the common
  case in any system that added provenance after it added baselines — treat
  it as unverifiable rather than valid. It gets one grace path: a re-run that
  establishes it under current conditions. It does not get the benefit of the
  doubt, because the whole point is that nobody can say what it measured.
- **When only the dataset grew** — cases added, none changed — the floor is
  still not comparable, because the mean is over a different population. Grow
  the dataset and re-baseline in the same change, or the next gate run
  silently compares two different questions.
- **When the judge was upgraded deliberately and scores rose across the
  board**, the baseline must move and the movement is not an improvement.
  Recording it as one is a retroactive restatement of every prior verdict.
- **When no baseline is set at all**, that is a different state and is already
  owned: `no_baseline` from absence, not from expiry. Distinguish them in the
  artifact — one is waiting for a first run, the other is waiting for a
  re-run, and the operator's next action differs.
- **When a comparison must be published across a generation boundary** — a
  new system against a comparator from a prior generation, where re-running
  the comparator is genuinely impossible — the number may be printed and the
  claim may not. Publish it as a historical reference point with its date
  attached, never as the margin the new system won by.

## Judging a claim and judging a comparison run on different clocks

The two halves of this get conflated, and separating them resolves an argument
that otherwise has no answer.

**A contribution is dated by when it was made.** Work that was novel when it
was undertaken does not become un-novel because the field moved while it was
being written up; holding an author to what shipped after their cutoff is a
demand nobody can satisfy.

**A comparison is dated by when it is published.** A margin over a comparator
from a prior generation measures the distance to a frozen field, and the
frozen field is not the one the reader is choosing in. That the comparator was
current when the work started is a fact about the authors' schedule, not about
the claim.

Both clocks are legitimate and they are not the same clock. A gate reading a
stale baseline is the second failure wearing the first one's excuse.

## One normalization function will be applied to both surfaces

A system that compares models also aggregates them, and aggregation wants the
opposite of what a predicate wants. A leaderboard that shows a dated variant
as its own row shows three rows for one model and a reader who cannot see the
model; the honest fix is a canonicalization table that collapses dated
variants to their family. That table is correct, and it is built once.

Then the predicate reaches for an identity and finds the canonical one,
because there is only one identity function in the codebase. The gate now
cannot distinguish two instruments six months apart, and it cannot report
that it cannot — the collapse happened upstream of every place a verdict is
formed.

**The discriminator is what the identity is for.** An aggregation surface
answers "which model should I pick?", where a family is the useful unit and
the variants are noise. A comparability predicate answers "was this the same
instrument?", where the variant *is* the unit and the family is the noise.
The same string, normalized the same way, is right for one and disqualifying
for the other.

So the canonical identity and the measured identity are two fields, not one.
Store both, aggregate on the first, and let the predicate read only the
second. A system that keeps one of them keeps the wrong one, because the
aggregation surface is the one someone looks at every day.

## When not to use it

- A baseline that is a **declared target rather than a measurement** — a
  service level someone chose, a contractual floor, a threshold the product
  promises — does not decay, because no instrument produced it. It carries a
  different obligation (say who set it and when they last agreed to it) and
  it is compared against directly. The distinction is whether the number came
  from a run or from a decision; only the first kind expires.
- Purely descriptive trend surfaces that plot scores over time need no
  predicate — they are showing the reader a history, and a judge change is a
  legitimate part of that history as long as the chart marks it. The
  obligation attaches where a comparison becomes a verdict.
