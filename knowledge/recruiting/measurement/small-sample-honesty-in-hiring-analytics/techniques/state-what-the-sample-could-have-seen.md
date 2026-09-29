---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: state-what-the-sample-could-have-seen
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence, a-verdict-is-bound-to-what-it-judged]
use_when: [a figure has just cleared its floor, a fairness or quality check came back clean on a small cohort, a dashboard ranks sources or stages, showing a zero from a small count]
shared_with: []
---

# State what the sample could have seen

A floor answers one question: *may a figure be shown?* It does not answer the
question a reader assumes it answers — *how far may the figure be trusted?* — and
a floor that is read as a certificate of precision does more harm than no floor,
because the figure arrives wearing its permission slip.

The two questions have different answers at the same count. One observation
moving an eight-hire acceptance rate by twelve points is a fact about granularity,
and it is what most floors are sized from. The sampling interval on that rate is a
fact about noise, and at eight it is far wider: four of eight is compatible with
anything from about 22% to 78% (Wilson 95% interval). A figure at its floor is
allowed to be *shown*; it is still nearly silent about the thing it measures.

The discipline is that a sample states, next to every figure and every verdict it
produces, what it could and could not have shown. Four places need it.

## A rate owes its interval, or its count

A percentage shown at all carries its interval, as prominent as the estimate and
computed with a method that behaves at small n. The plain normal-approximation
interval does not: its coverage is erratic well past the sizes this domain
lives at, and the authors of the standard comparison recommend the Wilson or the
equal-tailed Jeffreys interval for small samples (Brown, Cai and DasGupta,
*Statistical Science*, 2001 — small there means forty or fewer). Below the
floor the thin-state grammar already applies and the count is the figure; the
interval is what makes the *measured* state honest near its own boundary.

## A zero owes an upper bound

"None" from a small count is not the same claim as none. Zero events in ten is
compatible, at 95%, with a true rate of up to about 26% (exact); the rule of
three gives 3/n = 30% and slightly overstates below thirty (Hanley and
Lippman-Hand, *JAMA*, 1983). A genuine zero, counted, is still a measurement
([not measurable versus zero](not-measurable-versus-zero.md) forbids hiding
it) — but it is a bounded one, and the honest rendering is "0 of 10", never "0%".

## A null verdict owes the gap it could have seen

This is the sharpest case and the one with a legal surface. A check that returns
"no significant difference" is silent about every difference smaller than the
one the sample was able to detect, and on a hiring-sized cohort that is most of
them. The verdict has to say so: the smallest gap the comparison would reliably
have shown, given both group sizes and the reference rate.

Two properties of small cohorts make the omission dangerous, and both are easy to
reproduce with known ground truth:

- **A ratio without its significance test is mostly noise.** Two groups with the
  same true selection rate, thirty applicants each and a 10% base rate, fall below
  the four-fifths line in about 78% of trials. Requiring the difference to be
  significant as well brings that to between one and three percent, depending on
  the exact test. The federal selection-procedures
  guideline says as much in its own words: differences "based on small numbers and
  … not statistically significant" may not constitute adverse impact, while smaller
  differences "significant in both statistical and practical terms" may
  (29 CFR 1607.4(D)). Nothing in that text names a head-count; thirty is a
  rule of thumb borrowed from statistical reporting standards, which pair a minimum
  denominator with a limit on interval width.
- **A clean line at thirty is close to uninformative.** With a 30% base rate and
  thirty per group, a group selected at half the reference rate is shown as a
  significant gap between one time in five and one in four; at a 50% base rate,
  between two in five and one in two.
  At a 10% base rate the verdicts an analysis returns are statistically the same
  for equal groups and for a group at half the rate. What the floor licensed was a
  computation, not a conclusion.

The rule therefore has an asymmetry. A **significant** result under an exact test
needs no extra statement: its error rate holds at any size, which is also why no
floor belongs on the count of *selections* — a group with none selected is the
most severe case there is, and a numerator floor is what would hide it. A
**not-significant** or **clean** result is the one that owes its detectable gap.

## A superlative among measured cells owes separation

Gating each cell ([gate each cohort](gate-each-cohort-not-only-the-headline.md))
stops a cell of one from being crowned. It does not stop the best of many
well-populated cells from being noise, because the maximum of k noisy figures
sits above the truth by construction. Eight sources with an identical 30% true
rate and fifteen candidates each show a "best source" at about 47% on average, and
a spread of twenty points or more between best and worst in roughly nine runs in
ten. "Best" and "worst" are claims about *separation*, and the cell has to earn
it from its interval against the rest, allowing for how many cells were compared.
Otherwise say nothing is distinguishable and sort by volume.

Shrinking every cell toward the pooled rate is the usual remedy and is not a free
one: Gelman and Price (*Statistics in Medicine*, 1999) show that adjustment moves
the highest adjusted rates into the best-sampled units and makes sparse units look
too uniform, so it can invert the problem it fixes. A funnel plot, which puts the
precision of each unit on an axis and draws limits around the target
(Spiegelhalter, *Statistics in Medicine*, 2005), is the honest picture where there
are many units; a team hiring twenty a year has too few for one, and "counts plus
interval" is the right size.

## Procedure

1. **List what each claim asserts and what its sample can distinguish.** For a
   rate, the interval; for a zero, the upper bound; for a comparison, the
   smallest ratio reliably shown at conventional power.
2. **Compute it from the same counts** the claim used, at the point the claim is
   built, so the statement cannot drift from the figure.
3. **Put it in the sentence.** "Would have to be selected at a third of the
   reference rate or less before this check reliably shows a gap" is a clause a
   recruiter reads. A footnote with the power calculation is not.
4. **Attach it to the not-significant and clean states only** for a test-based
   verdict; a significant one needs nothing added.
5. **Check the statement against ground truth** with a seeded simulation once:
   at a true gap equal to the stated one, the check should fire about as often as
   the stated power. A detectable-gap sentence that overstates is the
   [decoration the thin state warns about](thin-but-real-as-a-labelled-state.md).

## Decision rules

- When a comparison's detectable gap is larger than the gap that matters, the
  honest verdict is *inconclusive at this size*, and the response is the pooling
  and longer-window route in
  [insufficient sample is not a pass](insufficient-sample-is-not-a-pass.md), not a
  lower bar.
- When two arms differ in size, the smaller arm sets the detectable gap; state
  the weakest comparison, not the average.
- When a figure is exported, the interval or the detectable gap travels with it.
- When many cells are tested, expect about one positive in twenty by chance per
  test at the conventional level; say how many were run.

## When not to use this

Do not attach an interval to a **count** or to a list of the record; those are
true at any size. Do not print an interval where the thin state already shows only
"four of six" — the count is the honest form, and a bound beside it is noise. Do
not use a detectable-gap sentence to replace a floor: below the floor the check
does not run, and this technique governs the verdict of a check that did. And do
not let the sentence become decoration: if the same dashboard still ranks,
colours or compares on the strength of a figure whose interval spans most of the
scale, the sentence has bought nothing.
