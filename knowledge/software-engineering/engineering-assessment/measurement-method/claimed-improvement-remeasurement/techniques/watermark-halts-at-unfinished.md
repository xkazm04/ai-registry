---
layer: technique
type: technique
subject: claimed-improvement-remeasurement
technique: watermark-halts-at-unfinished
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [collecting pipeline runs incrementally with a cursor or watermark, timing samples look faster than the pipeline feels, runs finish out of order]
---

# The watermark halts at the first unfinished run

Incremental collection keeps a watermark — the newest run already read — so each pass fetches
only what is new instead of re-reading the whole history. It is the right design and it has
one quiet failure that matters more for timing data than for anything else: **runs finish out
of order, and a watermark that advances past a run still executing never reads it again**.

## How the hole forms

A pass lists runs 38 to 42. Runs 38, 39, 41 and 42 have finished; run 40 is still executing,
because it is the slow one — a cold cache, a long test shard, a retry. The naive collector
stores the four finished runs and sets the watermark to 42. Next pass asks for runs after 42.
Run 40 finishes a minute later and is never fetched.

The loss is not random. The runs most likely to be unfinished at any given pass are the
longest ones, so a collector that skips them systematically drops the right tail of the
distribution. Every median computed from that series is biased toward fast, a regression shows
up late or not at all, and a claimed improvement can be credited because the slow head runs
were the ones that went missing. The series looks complete — no errors, no gaps in the run
numbers it holds — which is why this is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in its quietest
form.

## The rule

The watermark advances to the **last run before the first unfinished run**, in the order the
watermark is defined over, and the next pass re-lists everything above it. What happens to
the finished runs above the hold depends on the store, and both shapes are sound:

- **An append-only store**, where a stored run is never rewritten, stores *nothing* above the
  hold: neither the unfinished run nor any finished run newer than it. When the watermark is
  derived from the newest stored run, this is the only shape that works — storing run 41 would
  move the derived watermark past run 40 by itself. The cost is a short delay before finished
  runs appear; the next pass re-delivers them.
- **A store keyed by run identity** may store the finished runs above the hold at once, as long
  as the watermark is kept separately and the re-listing of already-stored runs is an
  idempotent overwrite, never a duplicate sample.

The trap is mixing the two: an append-only store whose watermark is "newest stored" and which
stores finished runs eagerly reproduces the hole exactly, with every line of code looking
careful.

An unfinished run is not a value. It is not zero duration, not its elapsed-so-far time, and not
excluded: it is pending, and the collector holds a place for it, per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value).

## The edge cases

- **The run that never finishes.** A run stuck in a running or pending state for days would pin
  the watermark forever and make every pass re-list an ever-growing window. Give the hold a
  ceiling: past a staleness bound far above the pipeline's longest real run (a day is a
  common choice for pipelines measured in minutes), stop letting it hold the others. Releasing
  the hold is half the move; the other half is recording the released run as abandoned — a
  terminal state, distinct from success and failure, excluded from timing samples with the
  reason kept. A hold released silently loses that run for good if it ever finishes, because
  the watermark has moved past it, and the series has a hole nobody can see.
- **Cancelled and failed runs are finished.** They do not hold the watermark. Whether their
  durations count as samples is the judge's rule (a failed run's duration usually measures the
  failure, not the pipeline), and that rule is applied at judging time, not by omitting them
  from collection.
- **Ordering.** Define the watermark over a key the source assigns monotonically at creation —
  run identifier or creation time — never over completion time, which is exactly the ordering
  that out-of-order finishing breaks.
- **Paging.** When a pass reads a page and the source truncates it, the watermark advances only
  to the last run actually read; a truncated listing is not the end of the series.

## Decision rules

- When any run in a pass is unfinished, the watermark stops before it.
- When a held run exceeds the staleness ceiling, mark it abandoned and release the hold.
- When a pass is truncated, advance only over what was read.
- When stored runs are re-listed, overwrite by identity.

## When not to use it

When collection is a full re-read every pass — feasible for small histories — there is no
watermark to misplace and the technique is moot. When the source offers a completion-event
stream rather than a listing, consume the events and keep the watermark over event sequence;
the stream already delivers runs in the order they finished, and the hazard does not arise.
