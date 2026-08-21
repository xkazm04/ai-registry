---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: cross-scheme-weight-robustness
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [ranking a shortlist on weighted scores, testing whether an order is an artifact of the weighting, letting stakeholders set their own dimension weights]
---

# Cross-scheme weight robustness

Re-rank the same cohort under alternative weightings and report whether the order
survives. A candidate who leads under every reasonable yardstick is robustly
strong; a candidate who leads only under the yardstick most flattering to their
own profile is an artifact of the weighting, and the surface must be able to tell
the difference.

## Why a weighted total needs this and a raw one does not

Any composite score compresses several dimensions into one number using weights.
Those weights encode a value judgment — how much technical depth is worth against
communication, domain familiarity, trajectory — and reasonable people in the same
hiring loop hold different ones. The weighting is not a parameter to be tuned to
truth; there is no true weighting. It is an opinion, and the ranking inherits it.

So the honest question is not "is the score right" but "**is the order stable
across the opinions we might plausibly hold?**" An order that flips when the
communication weight moves by a few points was never carrying information about
the candidates; it was reporting the weighting back at you.

## The fairness matrix: score everyone under everyone's yardstick

The strongest available form of this test, when candidate-specific or
stakeholder-specific weight schemes exist, is a full matrix rather than a random
perturbation:

1. Collect every scheme in play — one per candidate if the engine derives weights
   from a profile, one per stakeholder if people set their own, plus the rubric's
   baseline.
2. Score **every** candidate under **every** scheme. Each row is a candidate, each
   column a yardstick.
3. Rank by the mean across the row.

This is a fairness instrument, not just a sensitivity check. The default failure
it removes is exactly the one that makes derived weights dangerous: a candidate
scored only under weights derived from their own profile is being graded on the
exam they wrote. Averaging across all schemes means a candidate must hold up under
their rivals' yardsticks too. Report the matrix's spread as well as its mean — a
candidate first on the mean and last under two of five schemes is a different
recommendation than one first under all five.

**Keep the diagonal.** Each candidate's score under their *own* scheme is one
cell of the matrix, and retaining it next to the mean gives the surface its
sharpest single number: the difference between the two is exactly how much a
candidate is flattered by their own yardstick. A large positive own-minus-mean is
not misconduct by anyone — it is a legitimate signal that this candidate's
strength is concentrated in the dimension their scheme favours, and the hiring
loop should be told which dimension that is.

Cost is not a reason to skip the matrix, and it is the usual excuse. Dimension
scores are independent of the weighting, so they are computed once per candidate
and combined with each scheme by a handful of multiply-adds. The expensive part
runs a linear number of times; only the cheap combination is quadratic. An
implementation that re-runs full scoring per cell has made its own performance
argument for shipping a weaker check.

## Bound the perturbation, or the test becomes a different test

When schemes are generated rather than collected, the perturbation must be
bounded, and every implementation that skips this discovers why:

- **Bound the deviation** from the baseline weighting to a modest band. An
  unbounded perturbation stops testing "would a reasonable colleague rank them
  differently" and starts testing "what if the role were a different role."
- **Floor every dimension above zero.** A perturbation that can zero a dimension
  silently deletes it from the rubric, and the resulting order is a ranking for a
  job nobody is hiring for. The floor is the single most important bound: it is
  the difference between reweighting and redefining.
- **Cap every dimension below the total.** One dimension at ninety percent is a
  single-axis ranking wearing a composite's clothes.
- **Project back onto the simplex after clamping**, and do it properly. Clamping
  a normalized vector denormalizes it, and the obvious repair — divide every slot
  by the new sum — is wrong: rescaling can push a clamped slot straight back past
  the ceiling it was just clamped to, silently voiding the bound. The correct
  projection distributes the residual only onto slots that still have headroom in
  the direction needed, and iterates until the sum converges or no headroom
  remains. With a handful of dimensions this settles in a couple of passes; bound
  the loop anyway, and accept a slightly-off sum over an out-of-bounds vector.

A weight vector that has been clamped but not correctly re-projected is the
quietest defect in this technique: every scheme still looks well-formed, the
totals still look comparable, and the bound that was the entire safety argument is
no longer holding.

## Procedure

1. **Gate on the cohort floor.** Robustness of an order over one candidate is not
   a weak result; there is no order.
2. **Assemble the schemes** and check that they genuinely differ. This check is
   the technique's whole integrity — see the trap below.
3. **Score the full matrix** and rank by the mean, keeping the per-scheme ranks.
4. **Compare the resulting order** against the primary order. Record whether the
   top position changed, whether any adjacent pair swapped, and how many schemes
   agreed with the primary leader.
5. **Emit a status, not a boolean** — the vocabulary and its epistemology are in
   [robustness-status-taxonomy](robustness-status-taxonomy.md).
6. **Seal the schemes actually used** alongside the verdict. "Robust" with no
   record of what it was robust against is an unfalsifiable claim —
   [say only what the record holds](../../_laws.md#say-only-what-the-record-holds).

## The no-op trap

If every scheme in the test is identical — because the engine fell back to
uniform weights, because the stakeholders never set theirs, because a
configuration defaulted — then "the order did not change" is guaranteed *a
priori*. It is a theorem about the arithmetic, not a finding about the
candidates.

Reporting that as robustness is the most damaging thing this technique can do,
because it produces maximum apparent confidence at exactly the moment the system
knows least. Detect it explicitly: before running, assert that the schemes vary,
and if they do not, the outcome is "not varied — the test was a no-op," which is
categorically **not** robust and must never be rendered in the same words.

An implementation that computes the test correctly but cannot distinguish a real
pass from a vacuous one has an unenforced guarantee, which is worse than no
guarantee, because people will cite it.

## Decision rules

- When the order is unchanged across schemes that genuinely varied, report
  robustness and state how many schemes were tested —
  [a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis).
- When the top position changes under any scheme, the lead is not robust. Say
  which scheme flipped it and on which dimension; that sentence is the most useful
  output the whole comparison produces, because it names the disagreement the
  hiring loop actually needs to resolve.
- When schemes are uniform, report the no-op state. Never "robust," never
  silence.
- When the ranker fails or returns nothing, report that it could not assess.
  Never fall back to the primary order and call it agreement.
- When adjacent pairs swap but the leader holds, report a robust leader with an
  unstable field. Those are different facts and both matter for who gets an
  interview slot.

## When not to use it

Do not run it on unweighted or single-dimension scores. There is no weighting to
perturb, so the applicable state is "not applicable" — a first-class outcome, not
a failure and not a pass.

Do not use it to select a weighting. It tests whether the conclusion depends on
the choice; it cannot tell you which choice is right, and using it that way —
searching schemes until a preferred candidate leads — inverts it into a tool for
manufacturing the result.

Do not present per-scheme scores to candidates as their score. A candidate has
one score under the applied rubric; the matrix is internal instrumentation about
the ranking, not about them.
