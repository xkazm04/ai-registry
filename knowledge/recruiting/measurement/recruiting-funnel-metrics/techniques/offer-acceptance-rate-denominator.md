---
layer: technique
type: technique
subject: recruiting-funnel-metrics
technique: offer-acceptance-rate-denominator
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [defining offer acceptance, a rate exceeds 100%, reconciling offers extended against offers resolved]
---

# The offer acceptance denominator

Offer acceptance rate is the simplest-looking metric in recruiting and one of
the most reliably wrong, because its denominator is recorded by a different
mechanism than its numerator and the two disagree.

## The three candidate denominators

For a period, three counts compete:

- **Offers extended** — transitions into the offer stage. Recorded when a
  recruiter moves the candidate, which is exactly the step most often skipped
  when a verbal offer is accepted on the phone and the record is updated once,
  at the end, straight to hired.
- **Offers resolved** — accepted plus declined plus expired. Recorded by the
  terminal event, which is the reliable half: nobody forgets to mark a hire.
- **Offers closed within the window** — resolved, restricted to offers whose
  *extension* also fell in the window. The cohort-pure version, and the one
  that empties out on short windows.

Using *extended* alone makes the rate exceed 100% whenever the offer-sent
transition is missing. Using *resolved* alone silently drops offers that are
still outstanding, which flatters a period in which several offers are
hanging. Neither is safe on its own.

## The rule: the denominator is the maximum of the two observed counts

Take the numerator as accepted offers, and the denominator as
**max(offers extended, offers resolved)**. The reasoning:

- If extension is fully recorded, extended ≥ resolved and the denominator is
  extended — the correct, cohort-honest figure that includes outstanding
  offers.
- If extension is under-recorded, resolved exceeds extended, and the maximum
  falls back to the count that *cannot* be under-recorded, because every term
  in it is a terminal event somebody had to write.

The property this buys is the important one: the rate **can never exceed
100%**, structurally, without clamping. A clamp hides a data defect and shows
a plausible number; the maximum denominator absorbs the defect into an honest
one. A rate displayed at 100% because it was clamped is indistinguishable from
a genuinely perfect quarter, which is the worst confusion this metric can
produce.

Note the boundary with the opposite rule. Where a denominator is an **assumed
constant** rather than an observed count — a standard manual-effort baseline,
a configured expectation — a result over 100% must be shown *uncapped*,
because it is the only signal that the assumption is wrong. Bounding is earned
when the denominator is observed and chosen honestly; imposed bounding on an
assumed denominator hides the defect it should expose.

State which term won when it matters diagnostically — a period where resolved
exceeds extended is telling you the offer-stage transition is not being
recorded, and that is worth surfacing to whoever owns the pipeline hygiene.

## What counts as an offer, and what counts as a decline

- **Verbal offers count** if and only if they are recorded. An unrecorded
  verbal offer that is declined is invisible, and the acceptance rate is
  optimistic by exactly the number of them
  ([absence of evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
  Where verbals are the norm, the metric's honest scope is "recorded offers"
  and it says so.
- **Rescinded offers are not declines.** The employer withdrew; folding it in
  scores the candidate's decision with the employer's. Separate terminal
  state.
- **Expired offers are declines** for this metric — the candidate did not
  accept — but they are tracked separately, because a rising expiry share is
  a different problem (deadline pressure, slow decision) from a rising
  explicit-decline share (compensation, competing offer).
- **Re-issued offers are one offer.** A revised offer after a negotiation is
  the same opportunity; counting the revision as a second extension inflates
  the denominator and depresses the rate.
- **Withdrawals before the offer** never enter this metric at all. They belong
  to the upstream stage's pass-through.

## Segmentation before interpretation

An organization-wide acceptance rate is a number about the role and level mix.
It moves when the mix moves and tells nobody anything actionable. The
segmentations that carry signal: by role family, by level, by market, by
source, and by the time between final interview and offer. The last is the one
that most often explains a decline and the one most teams do not have on the
chart.

## Decision rules

- When the denominator would be below the minimum sample for a rate, publish
  the raw counts — "4 accepted of 5" — rather than a percentage. Small-sample
  thresholds are governed by the sibling discipline and by
  [the law](../../../_laws.md#a-claim-carries-its-sample-and-its-basis); a
  percentage on a handful of offers implies a precision the cohort cannot
  support.
- When resolved exceeds extended in a period, treat it as a recording defect
  report, not just a denominator choice.
- When acceptance is used inside a forecast, use the **observed** rate, not
  the funnel-implied offer-to-hire conversion. The observed rate is a fact you
  already hold; the implied one is an estimate standing in for it.
- When an offer is outstanding at the window boundary, it stays in the
  extended denominator and out of both numerator and resolved count. It is
  censored, not a decline.

## When not to use this

Do not use acceptance rate as a compensation-competitiveness metric on its
own. Declines cluster on compensation, timing, counter-offers, location and
manager impression, and only the recorded decline reason distinguishes them —
where no reason was recorded, the metric says a candidate declined and nothing
about why, and inventing a cause is a claim the record does not hold.

Do not compare an acceptance rate across teams with different offer
discipline. A team that extends offers only when acceptance is near-certain
will beat a team that offers earlier, on this metric, while hiring fewer
people more slowly. The metric is a diagnostic of the offer *stage*, not of
the recruiting function.
