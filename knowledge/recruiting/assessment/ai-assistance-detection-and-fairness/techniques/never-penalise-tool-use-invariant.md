---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: never-penalise-tool-use-invariant
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [adding an authenticity layer to an existing work sample, auditing whether model users score lower, writing rubric language about permitted tools]
---

# Never-penalise-tool-use invariant

The invariant: **a candidate who used a model and verified its output must not
score lower than a comparable candidate who verified without one.** It is
stated as a property of the scoring system, computed on real cohorts, and
reported with a verdict — not asserted in a policy document.

Almost every team believes it already holds. The belief is untested, and the
mechanisms that break it are quiet: a rubric line rewarding "original voice",
a reviewer prompt that mentions assistance at all, a risk total that a
model-use fact happens to sit next to on screen. None of these announce
themselves. Only the measurement finds them.

## The comparison, and why it needs two dimensions

Naively you compare model users against non-users and check the gap. That
comparison is meaningless, because the two groups differ in more than the tool
— if model users genuinely verify less on average, a real gap is the correct
result and the naive test calls it discrimination.

The honest construction crosses two binary dimensions:

| | verified | did not verify |
| --- | --- | --- |
| **used a model** | group A | group C |
| **did not use a model** | group B | group D |

Two properties are then checked, and they are checked in this order:

1. **The instrument works at all.** Verifiers must out-score non-verifiers by
   a declared margin — A and B together must beat C and D together. If they do
   not, the rubric is not measuring verification, and the fairness question is
   premature. Report *inconclusive* and stop; a fairness pass over an
   instrument that measures nothing is a false clean bill.
2. **The tool is not the penalty.** A must not sit below B by more than a
   declared tolerance. The tolerance is not zero: means of two small samples
   differ by noise, and demanding exact parity guarantees false alarms.

Note the asymmetry between the two checks, because it is the part practitioners
get wrong. The first is a **lead** test: verifiers must *beat* non-verifiers, so
a tie fails — a tie means the rubric is not reading verification at all. The
second is a **non-inferiority** test: model-using verifiers must merely *not
fall* below their non-using counterparts, so a tie is the desired outcome, not
a failure. Writing the second as a lead test is a common and destructive
mistake: it demands that model users out-score everyone, which is a tool bonus
rather than tool neutrality, and it will fail on honest data forever.

Declare all three numbers — minimum group size, verification margin, parity
tolerance — before you run, with a written rationale for each, and version
them. A threshold chosen after seeing the result is not a threshold.

## Minimum group size, and what happens below it

Below the declared minimum in any of the four cells, the comparison returns
*inconclusive*, never *pass*. This is the
[claim carries its sample](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
law applied to a fairness check, and the temptation to violate it is strong,
because the early life of every assessment has small cohorts and a green tick
is what the launch review wants to see. A "pass" computed over four candidates
is worse than no result: it is a documented, defensible-looking clean bill that
will be produced in a dispute and will not survive being read.

Set the floor by asking what difference you would need to detect, not by
picking a round number. For a tolerance expressed in rubric points on a
100-point scale, a floor in the low double digits per cell is realistic; below
that, sampling noise exceeds the tolerance and the test is theatre.

## The four verdicts

- **pass** — enough candidates in every cell; verifiers beat non-verifiers by
  the margin; model-using verifiers sit within tolerance of non-model-using
  verifiers.
- **fail** — enough candidates, and model-using verifiers sit below their
  counterparts by more than the tolerance. This is a finding about the rubric,
  not about the cohort. Fix the instrument; do not adjust the candidates.
- **inconclusive** — the check ran, the data cannot decide it. Group too
  small, or the verification margin was not met.
- **not evaluable** — the check did not run: no tool-use signal captured for
  this cohort at all, or the cohort was never scored.

Keep *inconclusive* and *not evaluable* distinct in the record. They lead to
different actions — one waits for volume, the other is an instrumentation bug —
and merging them hides the bug forever.

The distinction has teeth when the check gates something. Where a strict mode
blocks a release or a rollout on this gate, **fail and inconclusive must both
block, and not-evaluable must not.** The reasoning is exact: the gate certifies
only what it measured, so a thin cohort has certified nothing and may not ship
as if it had; but an empty run is the absence of data, and treating absence as
a fairness violation teaches the organisation that no data reads as unfair —
the same error, pointed at itself.

## Where the tool-use label comes from

The comparison needs a per-candidate model-use label, and getting it wrong
poisons everything downstream. Rank the sources:

1. **Voluntary disclosure**, asked plainly and without consequence: "which
   tools did you use, and for what?" This is the only high-quality source, and
   it only stays high-quality while it stays consequence-free. The moment
   disclosure correlates with rejection, the labels become noise and the
   invariant becomes uncheckable.
2. **Submitted artifacts the candidate chose to share** — prompts, session
   logs, a tool section in the write-up.
3. **Nothing else.** Do not infer the label from style. An inferred label
   inherits the detector's uneven error rate and then propagates it into the
   very audit meant to catch unfairness — a fairness test whose group
   assignment is itself discriminatory returns a clean result precisely when
   the discrimination is worst.

Where the label is unknown, the candidate is excluded from the comparison and
counted in the not-evaluable tally. Unknown is not "did not use a model".

## When not to use it

- **Do not run it per candidate.** This is a cohort-level property of the
  scoring system. Nothing in it may attach to an individual's record or move
  an individual's outcome; a candidate is never told their score was checked
  for fairness against a group.
- **Do not run it on cohorts smaller than your floor** in the hope of a
  directional read. Directional reads on tiny cohorts get quoted as results.
- **Do not run it as the only fairness check.** It answers one question — is
  the tool being punished. It says nothing about whether the case itself
  advantages one group, which is a different subject's job.

## The failure that survives a passing invariant

The invariant can pass while the process is still unfair, in one specific way:
if the *upstream* decision about who gets a work sample at all is influenced by
a detector, the cohort reaching the rubric is already filtered, and the rubric
audit is clean because the damage happened before it. Check where every
authenticity signal is consumed, not only where it is computed. A signal
computed for a report and quietly read by a screening step is the standard way
this happens.

Where the invariant's inputs are missing or ambiguous, the result resolves
toward the candidate
([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)):
an unlabelled candidate is not counted as a non-user, an unmet margin is not
counted as a pass, and a failing invariant suspends the authenticity layer's
influence on outcomes until the rubric is fixed.
