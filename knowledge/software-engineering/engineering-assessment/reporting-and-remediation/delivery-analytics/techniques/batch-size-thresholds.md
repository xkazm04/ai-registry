---
layer: technique
type: technique
subject: delivery-analytics
technique: batch-size-thresholds
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [measuring change size, setting a large-change threshold, reporting size distribution rather than an average]
---

# Batch size thresholds

Change size is worth measuring because it is one of the few history-derived
signals with a real, repeatedly-observed relationship to outcomes: larger
changes receive proportionally less scrutiny per line, take longer to merge,
and are more likely to be undone — published analyses over large change
populations put the difference between a fifty-line and a two-hundred-fifty-
line change at roughly fifteen percent in revert likelihood, and find review
effectiveness falling off sharply above a few hundred lines. That is enough
signal to act on and nowhere near enough to treat size as a measure of effort,
value, or risk.

The methodological point is that **size must be bucketed, never averaged.**
Change-size distributions are heavily right-skewed and contaminated: one
regenerated dependency manifest outweighs a month of considered work, so the
mean tracks the contamination rather than the behaviour. The median is more
robust and still answers no question anyone asks. What a team acts on is the
**share of changes above the size at which its own review process stops
working** — a threshold, and thresholds are policy.

## The threshold table is an owned artifact

Buckets, boundaries, labels, and the unit are one declared table with a single
authoritative definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Every consumer — the analyzer, the report, the recommendation text, the chart
axis — derives its boundaries from that table. The moment two of them carry
their own copy of "large means over 400", they disagree on the day someone
tunes one, and the disagreement surfaces as a chart that contradicts its own
caption.

A workable default shape, with the numbers stated as what they are — a
convention, not a discovery:

| bucket | boundary | what it means for review |
| --- | --- | --- |
| small | under ~100 changed lines | reviewable in one sitting |
| medium | ~100-400 | reviewable with effort |
| large | ~400-1000 | scrutiny per line drops measurably |
| very large | above ~1000 | approval is a formality |

Three properties matter more than the specific boundaries:

- **The unit is stated.** Added lines, added-plus-removed, files touched, and
  hunks give different distributions; a rename-heavy change is enormous by
  line count and trivial by intent. Pick one, name it in the metric's
  definition, and hold it stable across the series.
- **Exclusions are stated and applied at collection.** Lockfiles, generated
  clients, vendored trees, snapshot fixtures, and bulk formatting passes are
  excluded from the size measure or they *are* the size measure. Applying the
  exclusion at render time leaves the stored numbers wrong for every other
  consumer.
- **Boundaries are versioned.** Changing a boundary re-buckets every stored
  history. If the series is compared over time, either the boundary is pinned
  or the change is a labelled event on the chart.

## Procedure

1. Compute size per change under the declared unit, after exclusions, and store
   the raw size alongside the bucket — a stored bucket without its raw value
   cannot be re-bucketed when the table changes.
2. Report the **distribution across buckets and the share above the large
   threshold**, with the population size. "22% of 148 merged changes exceeded
   the large threshold" is a finding; "average change size 217 lines" is not
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
3. Cross the size distribution with review state and with revert linkage. The
   pairing is where size stops being trivia: large-and-unreviewed is a
   concrete, addressable population; large alone is a shrug.
4. When recommending, recommend against the threshold, not against the mean —
   "split changes above the large threshold", not "reduce average change size",
   which is satisfied by padding the small end.

## Decision rules

- **When the exclusion list cannot be applied (the analyzer cannot see file
  paths, only totals), report size as uncalibrated** and do not cross it with
  outcome metrics. A distribution dominated by generated content correlates
  with nothing.
- **When a team's work is genuinely large-grained — migrations, generated API
  surfaces, monorepo-wide refactors — recalibrate the table for that
  repository and record that you did.** A shared default table applied to
  incomparable populations produces a ranking of codebases, not of practices.
- **When size is used in a composite score, use the bucket share, not the raw
  size.** Raw sizes are unbounded and will dominate any weighted sum after a
  single outlier.
- **When the same change is measured before and after a squash, prefer the
  merged form.** Reviewers reviewed the accumulated diff, so that is the size
  that describes the review burden.

## When not to use this

Do not use size as a proxy for effort or productivity. It is the canonical
gameable metric: the moment size enters a target, changes get split at
boundaries chosen to satisfy the metric rather than to aid review, producing
more proposals, more review overhead, and no more scrutiny. Size is diagnostic
of *review feasibility* and nothing else.

Do not use size to compare individuals, for the same gaming reason plus the
attribution weaknesses described elsewhere in this subject.

Do not treat a small change as a safe change. A one-line change to an
authorization predicate outranks a thousand-line change to test fixtures on
every dimension that matters. Size bounds how much scrutiny a review can
plausibly deliver; it does not bound how much scrutiny a change deserves.
