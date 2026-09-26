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

- If extension is fully recorded and both counts are drawn on the offer
  cohort, extended ≥ resolved and the denominator is extended — the correct,
  cohort-honest figure that includes outstanding offers. On a
  transition-dated window that inequality does not hold, and the next section
  says what changes.
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

## The basis decides what the maximum means

The maximum was argued above as if both counts described one population. They
do only on an **offer cohort**: offers extended in the window, each followed to
its own resolution. Most ledgers are counted the other way — every event kind
by its *own* timestamp inside the window — and on that **transition-dated**
basis the two counts describe different offers. An offer extended last month
and accepted this week is in this window's resolved count and not in its
extended count, with every event recorded perfectly. Pick the basis first and
name it in the rate's label:

- **Offer cohort.** Accepted over offers extended in the window; settled
  (accepted, declined, expired) and outstanding shown apart. Resolved can never
  exceed extended here, so the maximum is a guard for legacy rows and nothing
  more. The cost is the censoring every cohort carries: a recent window is
  mostly outstanding.
- **Period.** Accepted over offers *resolved* in the window. Complete by
  construction, bounded by construction, and no maximum is needed. It says
  nothing about the offers still out, which is why they are shown beside it.

On a transition-dated ledger the maximum still bounds the rate, but the
quantity it produces is neither of these, and two of its by-products stop
meaning what they say:

- **"Resolved exceeds extended" is not evidence of a recording defect.** It is
  the expected reading whenever more earlier offers close in the window than new
  ones are sent: after a hiring burst, as hiring slows, and routinely at low
  volume. The defect is read at the record, not the total. A resolution with no
  prior extension for the same application *is* the defect, and a count of
  those is the hygiene report.
- **"Extended minus resolved" is not the outstanding offers.** On a
  transition-dated window it is a net flow: this window's new offers minus the
  closes of offers from any window. Closes of old offers cancel still-open new
  ones, and the difference can be negative. Outstanding offers are a stock,
  counted at the observation moment: extended, with no terminal event yet. A
  pending figure that links to "the candidates holding an offer" must be that
  stock, or the link opens a different number of people from the one it shows.

State which term won when it matters diagnostically, and on which basis.

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
- When resolved exceeds extended in a transition-dated period, read nothing
  into it. Count the resolutions that have no prior extension for the same
  application; a non-zero count is the recording defect report.
- When acceptance is used inside a forecast, use the **observed** rate, not
  the funnel-implied offer-to-hire conversion. The observed rate is a fact you
  already hold; the implied one is an estimate standing in for it.
- When an offer is outstanding at the window boundary, it stays in the
  extended denominator of an offer cohort and out of both numerator and
  resolved count. It is censored, not a decline. On a period basis it is in
  neither count and is shown beside the rate as outstanding.

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
