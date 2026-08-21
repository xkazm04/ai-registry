---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: minimum-contributors-and-minimum-rows
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
use_when: [setting a floor for a cross-organisation comparison, reviewing a single shared threshold on a benchmark, deciding whether a filtered peer cohort may render]
shared_with: []
---

# Minimum contributors and minimum rows

A cross-organisation figure is released only when it clears **two independent
floors**: a minimum number of distinct contributing organisations, and a
minimum number of underlying observations. Both are checked, both are stated in
the basis, and failing either withholds the figure.

The two floors exist because a benchmark threshold is asked to answer two
questions that share a unit and share nothing else. *Is this figure stable?* is
a question about noise — one bad observation must not move the number past the
point where a reader would act differently. *Is a contributor unidentifiable?*
is a question about an adversary — a participant who knows their own rows
exactly, and can look up a competitor's headcount and open postings, must not be
able to reconstruct anyone's figures from what is published.

Neither answer implies the other. Four hundred observations from two
organisations is a stable number and a disclosure. Eleven organisations
contributing three rows each is anonymous noise. So the binding constraint is
whichever floor is larger for the cohort in front of you, and the two are
enforced separately rather than reconciled into one number.

## Procedure

1. **Size the stability floor from the claim**, exactly as the small-sample
   discipline requires: name the claim in a sentence, name the single
   observation that would make it wrong, and pick the smallest count at which
   that observation cannot move the figure past a decision boundary. The
   reasoning is written where the constant lives.
2. **Size the anonymity floor from the market, not from the maths.** Ask: in the
   smallest market this benchmark will ever be filtered down to, how many
   organisations must stand behind the number before a participant with public
   information cannot guess the composition? In a broad market this is a small
   number; in a narrow one — a specialised role family in one city — the honest
   answer may be that the slice can never be published at all.
3. **Enforce both, independently, at the cohort actually rendered.** Not on the
   global pool, not before filters, not before self-exclusion. The cohort behind
   the number on screen is the cohort that must clear both floors.
4. **State both in the basis** — how many observations, across how many
   contributing organisations — on every released figure, healthy or not. A
   count that appears only on weak figures becomes a badge of shame and gets
   engineered away.
5. **Define the below-floor behaviour** before shipping the metric. A floor with
   no defined refusal is a comment, not a control; the refusal technique in this
   subject specifies what to show.

## How to size each floor

- **The stability floor** scales with the resolution you intend to display and
  with the metric's own variance. A duration with a long right tail needs more
  observations than a bounded proportion for the same displayed precision.
  Showing a decimal place raises the floor by roughly an order of magnitude,
  which is usually the cheapest argument against showing one.
- **The anonymity floor** does not scale with the metric at all — it scales with
  how much a participant already knows. Raise it when the pool is small enough
  that participants can enumerate each other, when the metric is publicly
  correlated with something visible (headcount, posting volume, funding), and
  when the figure is recomputed frequently enough that joins and departures are
  observable. Lower it never.
- **Keep working room above the anonymity floor.** A pool sitting at exactly the
  minimum is the dangerous regime: one contributor joining or leaving moves the
  aggregate by a recoverable amount. Treat a cohort within one contributor of
  its floor as withheld, or recompute on a cadence coarse enough that single
  changes are not observable.

## Decision rules

- When a reader applies a filter, re-evaluate both floors on the filtered
  cohort. Slicing is the standard path from a safe aggregate to an unsafe one,
  and it is the reader who performs it, not the designer.
- When the observation floor passes and the contributor floor fails, withhold.
  This is the case teams are most tempted to ship, because the number looks
  well-evidenced — and it is precisely the disclosure case.
- When the contributor floor passes and the observation floor fails, withhold
  too, but for the other reason, and say so differently: this cohort will
  clear with more hiring, not with more customers.
- When a customer's data does not clear a floor, the floor does not move. That
  customer is the reason it exists. Change what is shown below it.
- When a composite figure is built from several benchmarks, its floors are the
  strictest of its inputs, never an average. A blend inherits the weakness of
  its thinnest term and the exposure of its smallest pool.
- When a cohort is defined by an attribute a single organisation dominates —
  one company supplying most of the rows even though several contribute — the
  contributor count is satisfied and the anonymity is not. Add a **dominance
  check**: no single contributor may supply more than a stated share of the
  cohort's observations. A count of contributors is not the same as a
  distribution across them.

## When not to use this

Do not apply these floors to an organisation's **own** data. A team looking at
its own funnel needs the stability floor and nothing else — there is no third
party to protect, and applying an anonymity floor to a team's own records
withholds information they already have. The two-floor rule is specific to
reads that cross the organisation boundary.

Do not apply the floors to a **count of contributors** itself. "Fourteen
organisations contribute to this benchmark" is the fact that makes a refusal
legible, and gating it makes every refusal unexplainable.

Do not treat clearing the floors as exemption from stating the basis.
[A claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
applies at every size, and here the basis carries a second term — the
contributor count — that a single-organisation metric does not have.

Do not read a withheld benchmark as a neutral or favourable result. A comparison
that could not run has found nothing, and finding nothing is not finding parity
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
