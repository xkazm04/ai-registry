---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: outcome-closed-by-own-metric-with-dead-band
status: forged
laws: [one-target-one-threshold, not-measured-is-not-zero, platform-reported-is-not-causal]
shared_with: []
use_when: [deciding whether a diagnosed problem is fixed, rendering an outcome chip on a stored diagnosis, a lower-is-better metric must show a verdict and a delta]
---

# Outcome closed by its own metric, with a dead-band

A diagnosis is closed by the metric it was about moving the right way by more than
noise - not by a status flip, not by the owner saying "done", not by a different
metric that happens to look better. Each diagnosis kind declares one key metric at
creation, snapshots it, and every later render re-derives the same metric and compares.
The comparison has a dead-band so tiny wiggles do not flip the verdict, and for a
lower-is-better metric it inverts the verdict and leaves the number alone.

## The key metric per kind

The metric is chosen from what the request builder already computes, so the snapshot
is a projection of server-rebuilt numbers and can never be forged by the client:

- a paid portfolio diagnosis is about the portfolio's **cost share of revenue** - the
  one metric here where lower is better;
- a cohort diagnosis is about the **worst cohort's lifetime-value-to-acquisition-cost
  ratio** - the lowest across cohorts, the same deterministic "worst" the fallback picks;
- a lead-source diagnosis is about the source's **qualification rate**;
- a local-coverage diagnosis is about the **coverage percentage**, which closing the
  worst gap raises.

The property that qualifies a metric is that *acting on the lever moves it*. A metric
that would not move when the advice is followed cannot close the diagnosis, and a
metric that moves for unrelated reasons closes it falsely; the choice is made once per
kind and written down.

**When storing a diagnosis, snapshot its declared key metric from the server-rebuilt
request, and when rendering it, re-derive the same metric and compare, because closure
by any other signal - a click, a different number, a client-supplied value - is a
status, not a measurement.**

## The comparison

Relative delta against the snapshot: current minus baseline, over the absolute
baseline. When the baseline is zero or negative, fall back to a sign comparison rather
than dividing by zero. Then:

- if the metric is higher-is-better, the good direction is the delta; if it is
  lower-is-better, the good direction is the negated delta;
- good at or above the band reads **improved**; good at or below the negative band
  reads **worse**; everything between reads **unchanged**.

The band is relative and declared once. A twentieth of the baseline is the convention
this subject was reconciled against - wide enough that day-to-day noise on a ratio of
sums stays inside it, narrow enough that a real fix clears it within a window. It is
convention; a team with a variance estimate for its metric may replace it with a
multiple of that.

The reported delta is **never** sign-flipped for a lower-is-better metric. A cost share
that fell 20% renders as "improved, minus 20%": the verdict inverts, the number states
what the tracked metric itself did, because a positive number printed beside the word
"improved" would claim the metric rose
([one target, one threshold](../../../_laws.md#one-target-one-threshold)).

## What yields no chip

- No snapshot on the record - a diagnosis stored before the metric was declared.
- No current value - the subject no longer exists or is not derivable.
- A non-finite baseline or current value.

Each of these renders nothing, never a zero move; a missing baseline is absent, and
absence is not "unchanged"
([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

## Decision rules

- When a new diagnosis run's subject matches a resolved diagnosis of the same kind and
  the metric reads unchanged since, flag "already handled, not moved" on the panel; do
  not block the run, because a re-run may be what the operator wants.
- When two surfaces show an outcome for the same metric - a diagnosis chip and an
  advice ledger row - they use one band and one inverse-key list, copied deliberately
  or imported, and a test asserts they agree; two chips that disagree about which way
  is better are worse than either alone.
- When the outcome reads improved, the surface says the metric *moved* while the
  advice stood; it never says the advice *achieved* it
  ([platform-reported is not causal](../../../_laws.md#platform-reported-is-not-causal)).
- When a snapshot metric is a ratio of sums, the chip carries no confidence claim; the
  band is a dead-band, not a significance test.

## When NOT to use

- As an experiment. A before/after read of one metric has no control; a team that
  needs a causal claim for the lever runs a holdout or a geo split under the
  attribution subject.
- For a metric the lever does not move. If the natural key metric is not movable by
  the action - a coverage figure that stays constant whatever is published - the chip
  will read a permanent "unchanged" and teach the owner the tool is dead; make the
  metric movable first, or declare no chip.
- Inside the dead-band as a story. "Slightly better" is not a state; unchanged is.
