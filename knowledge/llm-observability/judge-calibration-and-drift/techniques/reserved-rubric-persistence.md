---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: reserved-rubric-persistence
status: forged
laws: [no-retroactive-restatement, estimation-announces-itself]
shared_with: []
use_when: [deciding where calibration history lives, wiring judge drift into existing alerting without new infrastructure, querying kappa over time]
---

# Reserved-rubric persistence

The concern: where the calibration history lives. The answer that pays for
itself: **inside the system's existing quality-score store, as ordinary
score records filed under a reserved rubric name** — one per judge
identity — rather than in a new table, a side file, or the sentinel's own
private state. The meter is measured on the meter's own dial.

## The shape

Each calibration cycle posts exactly one score record through the same
write path every other score uses:

| Score field | Carries |
|---|---|
| rubric | the reserved name, namespaced and keyed per judge — e.g. `<system-prefix>:calibration:<provider>/<model>` |
| value | this cycle's kappa |
| max | 1.0 |
| pass | the trust verdict (kappa cleared the bar) |
| reasoning | a compact JSON blob of the full metric family: kappa, correlation, MAE, RMSE, bias, pass rates, n, threshold, kappa bar, trusted flag, judge cost |
| scored-by | the judge's identity (provider/model) |

Three decisions in that shape are load-bearing:

- **The reserved namespace prefix** is what keeps synthetic instrument
  scores from ever being confused with product-quality scores in a rubric
  listing or an aggregate. A reader who encounters the rubric name learns
  from the record itself that this is calibration telemetry, not customer
  quality — the record announces what it is.
- **Keying the name per judge identity** gives each judge model its own
  independent history and its own independent windowed trend. Two judges
  share nothing: one degrading must not dilute or mask the other's trend.
- **The full metric blob rides in the record's free-text/reasoning field**,
  not in new columns. The headline (kappa, pass) is queryable and
  trend-able; the diagnostic detail (bias direction, error magnitudes,
  sample size, what bar was in force) is recoverable per cycle without a
  schema migration. Storing n, threshold and bar *per record* is what
  makes the history self-interpreting years later, when nobody remembers
  which bar was in force in which quarter.

## What riding the existing store buys

- **The windowed drift detector for free.** Every score write feeds the
  store's rolling per-(project, rubric) regression detector. Because kappa
  arrives as a score under its reserved rubric, a degrading agreement
  trend trips the *same* alert machinery — same channels, same cooldowns —
  that catches a quality regression on any product rubric. No
  calibration-specific alert wiring exists to rot.
- **Query and plotting for free.** Reading the history is the ordinary
  scores query filtered to the reserved rubric. Newest-first ordering
  makes "the previous cycle's kappa" the first match — which is exactly
  how the sentinel bootstraps its per-cycle drift comparison.
- **Append-only accounting for free.** Cycles are records stamped at write
  time; a later recalibration never rewrites what an earlier cycle
  claimed. When trust is lost and regained, the history shows both events
  — restating the past ("that dip was a fluke, delete it") would destroy
  the only evidence the windowed detector and the humans have. If the
  golden set is versioned up, the re-baseline is a *new* fact in the
  stream (a marker record, or a version noted in the blob), not an edit
  of old ones.

## Decision rules

- **When the store has a per-rubric trend/alert path, ride it.** Building
  a parallel calibration store means every improvement to score alerting
  must be duplicated or the calibration path silently falls behind.
- **When it does not, build the reserved-name convention anyway** and give
  the store the trend path — product rubrics want it too.
- **Filter tolerance:** if the store's list endpoint cannot filter by
  rubric server-side, client-side filtering over a bounded recent window
  is acceptable for the sentinel's own reads; it needs only the most
  recent entry.

## When not to use this

If the score store is customer-visible without a rubric filter, reserved
rubrics will leak instrument telemetry into customer views — fix the
surface (exclude the reserved namespace by default) before adopting, not
after. And do not extend the reserved namespace into a general-purpose
side channel for unrelated operational metrics; the convention stays
legible only while "reserved rubric" means exactly "the quality apparatus
measuring itself".
