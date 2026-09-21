---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: realized-vs-projected-calibration
status: forged
laws: [platform-reported-is-not-causal, not-measured-is-not-zero, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [measuring what an applied change set actually did, feeding realized history back into the next projection, deciding when a measurement is insufficient rather than zero]
---

# Realized-versus-projected calibration

A projection nobody checks is a forecast that slowly becomes folklore. The loop
that prevents it has two halves: a *realized* read that measures what the touched
campaigns did after an applied set against what they did before, and a
*calibration* that turns a history of those reads into one number the next
projection carries. Both halves are built to be conservative, because a
self-correcting forecast that corrects wrongly is worse than one that never tried.

## The realized read

For an applied set, the after-window is the apply day plus the six that follow; the
before-window is the seven days preceding the apply day. Seven on each side so a
whole week sits on both sides and weekday shape cancels rather than being compared
away. Day-aligned on both sides so the windows have the same shape regardless of
the hour the apply landed. The touched campaigns are every donor plus every
recipient of a shift - a pause contributes its donor only, and a blank recipient id
must never be summed, because a blank key silently pulls the account's un-keyed
series into the total.

The read produces per-campaign before/after cost and value, the summed value delta,
the projected value gain stored on the set at approval, and their ratio. Three
honesty rules govern it.

*Not due is not degraded.* A set whose after-window has not elapsed returns
nothing and is tried again on the next sync. Persisting "insufficient" for a set
that is merely young would be a degradation recorded where none exists.

*Insufficient is a state, not a ratio.* Each window must be covered by the stored
history to a stated minimum - five of seven is the convention this subject was
reconciled against, leaving room for an edge-day delivery gap without letting a
window that has rolled out of the stored period masquerade as a measurement.
Coverage is a property of the stored period, so it is counted as the union across
the touched set, not the weakest campaign. Below the minimum the read is
`insufficient`, the ratio is null, and the delta is shown without a percentage.

*A ratio against nothing is null.* When the projected gain was zero or negative -
a pause-only set, a keyword-only set - realized over projected is not a number.

Only `applied` sets are read. An approval stamp is written even on a failed settle,
so status is the only honest filter; a failed set has no windows to compare.

## What it is not

It is not an experiment. The account moved for many reasons in those fourteen
days; nothing in the read claims the delta was caused by the set. It is the honest
observable - the projection said plus X, the touched campaigns then did plus Y -
and its job is to let the operator and the calibration see the gap instead of only
ever seeing forecasts. A marketer who reports it says "descriptive read" in the
same sentence, per `platform-reported-is-not-causal`, and a causal claim goes to
the attribution neighbour.

## The calibration

From every set whose read came back `measured` with a finite ratio against a
positive projection, take the median of realized-over-projected, clamp it into a
band, and apply it as a multiplier on the recipient half of every future
projection. Three deliberate conservatisms:

- **Median, not mean.** One freak week - a sale, an outage - cannot move it.
- **A clamp.** Even a run of freak weeks nudges the projection only inside a band
  a person would still call plausible; outside the band the calibration would be
  claiming the linear model is off by more than its own error bars justify, and the
  honest move is to cap the correction rather than trust it further. The band this
  subject was reconciled against is 0.3 to 1.5, a convention.
- **A minimum history**, below which the multiplier is exactly one and the
  projection is identical to the uncalibrated one. Three measured sets is the
  fewest that produce a median rather than an average of one accident.

The multiplier tempers the recipient half only. The donor half is arithmetic -
the money demonstrably leaves and so does what it bought - whereas "the recipient
keeps converting at its current rate on the extra spend" is the claim the history
has evidence about. Spend movement itself is never scaled on either side.

The calibration is always disclosed on the set it shaped: multiplier, how many
sets, and, when it is one, why ("insufficient history"). A stored calibration
that fails to parse, or carries a multiplier outside the band, reads as no
calibration; a schemaless document feeding a number into a projection is defended
at the read, not trusted at the write.

## Decision rules

- When a read is `insufficient`, exclude it from the calibration rather than
  counting it as zero, because a ratio of zero on missing data drags every later
  multiplier down.
- When fewer than the minimum sets are measured, report the multiplier as one with
  the reason stated, because a calibration derived from one accident is worse
  than none.
- When the median falls outside the band, clamp and say so, because a correction
  the model cannot justify is a second model pretending to be a measurement.
- When a set was reverted inside its after-window, its read is contaminated; treat
  it as insufficient rather than measuring half an apply.

## When NOT to use

- As proof the prescription works: a positive ratio on a set is not evidence of
  causation, and a history of them is a description of the linear model's bias on
  this account, nothing more.
- Across accounts or tenants: the multiplier is a property of one account's
  history, and pooling it across businesses averages one account's promotions into
  another's projections.
- On windows shorter than a week or unequal in length, because the weekday shape
  no longer cancels and the delta measures the calendar.
