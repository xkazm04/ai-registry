---
layer: technique
type: technique
subject: remediation-roadmaps
technique: weighted-upside-ranking
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [ordering generated recommendations for a reader, deciding which weak area to surface first, a plan keeps recommending the hardest problem]
---

# Weighted upside ranking

The concern: a set of candidate moves must be put in the order a reader
should work them, and the obvious key — how bad the underlying area is — is
the wrong one. Severity measures the size of a problem. A roadmap ranks the
*opportunity to improve*, and the two orderings agree only by accident.

## The key

For each candidate move, compute three factors and multiply:

- **Weight** — the affected dimension's share of the composite. This is
  imported from the rubric, not re-decided here; a roadmap that invents its
  own weights has quietly forked the scoring policy.
- **Headroom** — the realistic distance this specific move can travel, which
  is the *achievable* post-move value minus the current value, not the
  distance to the theoretical maximum. Two moves on the same weak dimension
  can have very different headroom; a move that fixes one of six missing
  artifacts is worth a sixth of the dimension, not all of it.
- **Achievability** — a discount in the range (0, 1] for the probability the
  move actually lands. It absorbs effort, prerequisite structure, and
  external dependency. An item that requires a counterparty's decision is
  systematically less valuable than its arithmetic gain, and the discount is
  where that fact is recorded.

Priority is the product. All three factors must be present: dropping weight
ranks trivia beside essentials; dropping headroom ranks a dimension already
near its ceiling as though it had everything to gain; dropping achievability
produces the classic plan whose first item is a six-month re-platforming.

## Decision rules

- **When a dimension is weak because it is structurally expensive, expect it
  to rank low, and let it.** That is the technique working, not failing. The
  reader is still told about it — but by the coverage pass, marked as such,
  not by pretending it is the best next move.
- **When two moves touch the same dimension, rank them but do not treat their
  gains as independent.** The second one's headroom is measured *after* the
  first is applied, or the pair double-counts.
- **When a factor is unknown, do not default it to its most flattering
  value.** An unknown achievability is not 1.0. Either give the catalog entry
  a declared conservative default or exclude the move from the ranked list
  and let coverage carry it.
- **When the effort estimate is coarse, use it anyway.** A three-level
  ordinal captures most of the value. The alternative is not "no estimate" —
  it is the implicit estimate that all efforts are equal, which is the one
  assumption known to be false. Define the ordinal-to-number mapping in
  exactly one place and import it everywhere the ranking, the backlog sort,
  and any rollup query need it
  ([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary));
  a re-typed literal in a second module is how two surfaces come to disagree
  about which item is more impactful.
- **Rank on the number the reader is shown.** Where the pipeline adjusts a
  raw signal before display — a judgment blend, a guardband, a manual
  override — the ranking consumes the adjusted value and quotes it in the
  rationale. Ranking on the pre-adjustment value surfaces a top gap whose
  cited score contradicts the figure printed beside it, and a reader who
  catches that once discounts the whole plan.
- **Select the weight vector by context before ranking.** Where the rubric
  supports lenses — different weightings for different scales, stages, or
  operating models — the roadmap must rank under the same lens the score was
  computed with. Ranking a small, early-stage subject under a large-scale
  lens is how plans come to recommend heavyweight ceremony to readers who
  need none of it, and the item is not wrong so much as addressed to somebody
  else.

## Overrides, in declared order

Two things legitimately outrank the product, and both are policy that lives
in the catalog rather than in the sorting code:

1. **Floor violations.** Where a dimension has a stated hard minimum — a
   safety, legal, or correctness floor — being under it is not a trade-off
   with an upside number; it is a stop condition, and it goes first
   regardless of how little composite improvement closing it yields.
2. **Prerequisite structure.** Where moves have a dependency order, a
   dependent item never ranks above the thing it depends on, even when its
   product is larger. A plan whose steps are individually optimal and
   collectively unbuildable is worse than a slightly duller plan that can
   actually be executed in sequence.

## Determinism

The ranked list is read as a work order and is regenerated on every
assessment run, so it must not reshuffle without cause. Products tie, floats
compare within noise, and sorts disagree on equal keys. End the comparator in
a chain that cannot tie, whose final key is the candidate's **stable
identity** — its permanent catalog id, never its title, its display order, or
its position in the generating loop
([identity-survives-reuse](../../_laws.md#identity-survives-reuse)). Where the
inputs jitter run to run, quantize priority into bands and order stably
within a band, so re-ranking reflects real movement rather than measurement
noise.

## Catalog versus generation

Two implementations exist, and the choice is consequential. A **fixed
catalog** enumerates every recommendation the system can make, each with its
trigger condition, its weight linkage, its effort, and its wording; the
ranking selects and orders from that closed set. A **generative** approach
composes items freely per run. The catalog is dramatically more defensible:
its wording is reviewable once rather than per run, its projected gains are
calibrated against real outcomes over time, and identical inputs produce
identical output — which is what makes the ordering trustworthy across runs.
Its cost is coverage, since a gap nobody wrote an entry for produces no item;
this is precisely the hole the coverage guarantee is designed to fill. Prefer
the catalog, and treat "a weak dimension with no catalog entry" as a defect
in the catalog, not as an argument for free generation.

A catalog also drifts against the dimension set it keys on — a new detector,
a renamed dimension, a stored assessment from an older schema. The ranking
must degrade rather than break: an unrecognized identifier is **skipped with
a logged warning, never dereferenced**, so drift costs a missing row instead
of a crashed plan. Pair that tolerance with a periodic check that the skip
path is empty, or the tolerance quietly becomes the mechanism by which whole
dimensions disappear from every roadmap.

## When not to use it

- **When there is only one gap.** Ranking machinery over a single candidate
  is ceremony; state the move and its projection.
- **When the reader's question is banded rather than marginal.** "How do I
  reach the next level" is answered by a covering computation over a set, not
  by the top of a sorted list — the two outputs coexist and answer different
  questions.
- **When the score's weights are not trustworthy.** Upside ranking inherits
  every weakness of the weight vector it multiplies by. If the weights are
  unowned or unversioned, fix that first; otherwise the ranking projects
  false precision onto an arbitrary policy.
