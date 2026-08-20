---
layer: technique
type: technique
subject: analytics-time-windows
technique: cohort-matched-comparison
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [reporting movement across a period, an aggregate delta contradicts a per-entity movers list, the measured population changes size within the window]
---

# Cohort-matched comparison

Movement across a window is measured **only over the entities present on both
sides of it**. Entities that arrived after the window opened, or left before it
closed, are excluded from the movement figure and reported separately as
composition change.

This is the deepest rule in the subject and the one most often missed, because
the naive computation is not obviously wrong. Averaging the current population
and subtracting the average of the baseline population produces a number that
looks like movement, is labelled as movement, and is not movement.

## The defect, stated precisely

A period delta computed as `mean(current population) - mean(baseline
population)` sums two independent effects:

1. **Movement** — how entities present throughout the window changed.
2. **Composition** — how the population's membership changed.

Onboard five low-scoring items mid-quarter and the mean falls. The surface then
reports that the population "slipped" by an amount **no individual item
experienced**. Nothing regressed. The arrival of new members, which is normally
good news, is rendered as decline.

The tell is a contradiction visible on one screen: a movers panel necessarily
works per entity — it can only list something that moved — and it correctly
shows zero regressions, while the headline above it reports a decline. When
those two disagree, the headline is the one that is wrong, every time, because
it is the one aggregating across a changed population.

The same defect runs the other way and is more dangerous, because it flatters:
onboarding a batch of high-performing entities reads as broad improvement, and
a team celebrates work that did not happen.

## Procedure

1. **Determine the cohort first.** The cohort is the set of entity identities
   with a value at the baseline instant *and* a value at the window end.
   Identity here must be the durable one — [identity that survives
   reuse](../../../../_laws.md#identity-survives-reuse) matters, because matching on
   a display name or a positional index silently drops renamed entities into
   the "arrived" bucket.
2. **Compute movement over the cohort only.** Per entity, `end value - baseline
   value`; aggregate those deltas. Aggregating the deltas is not the same as
   differencing the aggregates once the populations differ — that difference is
   the entire technique.
3. **Report composition as its own figure, named as itself.** Entities added,
   entities removed, and their effect on the aggregate. "Average rose 3 points:
   +1 from movement in existing items, +2 from 5 new items scoring above the
   mean" is an honest sentence. "Average rose 3 points" is not.
4. **Carry the cohort size with the movement figure.** A movement number
   without the count it was measured over is [a count without its
   predicate](../../../../_laws.md#count-carries-predicate); a delta over 4 matched
   entities out of 60 is a different claim from a delta over 58.
5. **Cross-check against the per-entity list.** Wire a test, or at minimum a
   development assertion, that the sign of the aggregate movement agrees with
   the movers list. This assertion is what turns an invisible defect into a
   loud one.

## Decision rules

- **When the cohort is a small fraction of the population, suppress the
  movement figure rather than qualify it.** A threshold — a stated minimum
  fraction or count — is better than a footnote no one reads. A movement claim
  over 5% of the entities is noise with a confidence-inspiring label.
- **When the metric is a total rather than a mean, cohort-matching still
  applies but the composition figure carries most of the change.** Totals grow
  with membership by construction; the useful decomposition is
  same-entity growth versus new-entity contribution.
- **When entities can leave and return, define presence by the window's
  endpoints, not by continuous presence.** Continuous presence is a stricter
  cohort that shrinks fast and answers a narrower question; use it only when
  intermittency is itself the subject.
- **When both a matched movement and a raw population average are needed, show
  both, labelled distinctly.** The raw average answers "where does the
  population stand now"; only the matched delta answers "what changed". They
  are both legitimate and they must never be subtracted from each other.
- **When no baseline value exists for an entity, that is composition, not a
  zero.** Treating an absent baseline as zero manufactures a maximal
  improvement for every new entity — the single most common way this defect is
  reintroduced after being fixed.

## When not to use it

- **A fixed population** — a bounded set that does not gain or lose members
  within the window — has no composition effect, and cohort matching is
  identity work for nothing. Confirm the fixedness rather than assuming it;
  most "fixed" populations acquire membership churn within a year.
- **Population-level questions genuinely about the population.** "How many
  entities do we have" and "what does the whole population average today" are
  not movement claims and must not be cohort-restricted.
- **Event-count windows** where the unit is an occurrence rather than an
  entity: there is no identity to match, and the comparison is a matched-span
  one instead.

## Smells

- A headline delta and a movers list that disagree in sign or magnitude.
- A period average computed over "all current entities" and subtracted from a
  stored prior average.
- Aggregate movement that jumps on the day a batch of entities was onboarded.
- Any delta computed without a join or intersection on entity identity.
- New entities contributing a full improvement to a period figure.
