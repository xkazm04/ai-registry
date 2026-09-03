---
layer: technique
type: technique
subject: metric-surface-contract
technique: export-terms-not-ratios
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [publishing a hit rate or a success rate, choosing between a counter and a gauge, a consumer without a time-series store needs the same quantity]
---

# Export terms, not ratios

The tempting shape for a hit rate, a success rate or a utilisation figure is a
single value that reads correctly on a dashboard the moment it is added. It is
almost always the wrong export, and the reason is one sentence: **a ratio is
only meaningful over a window, and the exporter does not know the consumer's
window.**

Publish the **terms** — the numerator and the denominator, each as a count
that only ever increases — and let each consumer subtract two points and
divide. A consumer that wants five minutes gets five minutes; a consumer that
wants a day gets a day; a consumer whose window had not been invented when the
metric shipped gets that too, out of history already stored.

## What the single-value export actually costs

- **It hard-codes a window into every downstream consumer at once.** Whatever
  window the exporter chose — since process start, the last N events, a
  sliding minute — is now the only window anyone can have, and it is wrong for
  most of them. A since-start ratio in particular becomes an ever-flatter
  average that stops moving during exactly the incident it should reveal.
- **It cannot be aggregated.** Ratios from three instances do not average into
  the fleet's ratio unless the denominators are equal, which they never are.
  Counts sum correctly across instances; ratios do not, and the naive
  fleet-level average is a number nobody can define.
- **It loses the magnitude.** A hit rate of 50% over four events and over four
  million are the same value and different facts. The terms carry the
  magnitude for free.
- **It is not recoverable.** From counts a consumer can always compute the
  ratio; from the ratio nobody can recover the counts
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
  the derived form names its inputs, and here the inputs are the export).

## The rules for the terms

1. **Counts only increase, and are never reset except by process restart.**
   Consumers detect restarts by the value going down; an exporter that resets
   a count on its own schedule breaks that detection, and every rate
   computation that spans the reset goes negative or silently truncates.
2. **The numerator's denominator is genuinely the total it is a part of.**
   Publish hits and total lookups, not hits and misses, unless every lookup is
   exactly one or the other and always will be — the third outcome added next
   year (a lookup that was skipped, deferred, or errored) breaks a sum-based
   denominator and does not break a counted one.
3. **Both terms are updated in the same place, at the same moment.** Terms
   incremented in two different code paths drift under partial failure, and
   the resulting rate exceeds one in ways that erode trust in the whole
   surface.
4. **The predicate travels with the name**: what precisely was counted, over
   which population, is part of the metric's description, not tribal knowledge
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## The real exception: shape follows consumer capability

This is where a rule of thumb becomes an engineering decision. Publishing
terms works because the consumer can hold two points and subtract. **A
consumer with no history cannot** — a periodic log line, a human-read status
page, a terminal display, a one-shot health response. Handing that consumer a
monotone total is handing it a number it cannot turn into anything: at any
instant it can see the total since start and nothing else.

For that consumer the exporter computes the window itself: a rate over a
stated recent window — the last N observations, or the last interval — and
labels it as such. The **same quantity is legitimately published in two
shapes, chosen per consumer class**, and the system that does this is not
being inconsistent; it is refusing to punish the weaker consumer for the
stronger one's capability.

Rules that keep the dual shape honest:

- **One derivation, two presentations.** The windowed value is computed from
  the same terms, in one place, so the two shapes cannot disagree about what
  the quantity is. Two independent implementations of "hit rate" is the defect
  this whole subject exists to avoid.
- **The window is stated wherever the windowed form appears.** "Hit rate 62%"
  is a rumour; "hit rate 62% over the last 1000 lookups" is a measurement.
- **The windowed form is never the only form.** A capable consumer must still
  be able to get the terms. If only the windowed value is exported, every
  consumer has inherited the weakest consumer's constraint.

## Decision rules

- **When the consumer can store history, export terms.** Default, and the
  answer for anything scraped.
- **When the consumer cannot store history, export a windowed value with its
  window named** — additionally, never instead.
- **When the quantity is a level rather than an accumulation** — items
  currently queued, bytes currently resident, connections currently open — a
  value that goes up and down is correct, and forcing it into counts is
  cargo-culting the rule. The test is whether "the value went down" is a
  legitimate event; if it is, it is a level.
- **When you want a distribution, export the distribution**, not its mean. The
  mean of a latency distribution describes no request and cannot be
  recombined across instances; buckets can.

## When not to use this

- **A quantity that is definitionally a ratio and has no terms** — a
  configured target, a fraction supplied by an operator — is exported as it
  is; inventing a fake denominator to satisfy a rule helps nobody.
- **A bounded, instantaneous fraction of a physical resource** where the
  denominator is a constant the consumer already knows (a fixed pool's
  occupancy) may reasonably ship as a level, provided the capacity is also
  exported so the consumer can recover the absolute.
