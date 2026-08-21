---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: aggregates-only-never-a-row
status: forged
laws: [say-only-what-the-record-holds]
use_when: [writing the one query that crosses the organisation boundary, reviewing a benchmark for disclosure risk, deciding which statistics a small pool may show]
shared_with: []
---

# Aggregates only, never a row

The read that crosses the organisation boundary returns counts, sums, means and
central quantiles — and is structurally incapable of returning an individual
record. Not "returns records which the interface then aggregates". Incapable.

The distinction matters because a filter applied after retrieval is a
convention, and conventions do not survive contact with debug logging, error
reporting, an export feature, a caching layer that stores the intermediate, a
new caller who reuses the fetch, or a well-meaning refactor that pushes
aggregation up a layer. Every one of those is an ordinary engineering event, and
every one of them turns a presentation-layer control into a disclosure. If the
records never leave the boundary, none of those events can leak them.

This is also the one place where a multi-tenant hiring system deliberately
violates its own strongest invariant, so it deserves to be **one** place: a
single, named, reviewed read — not a capability spread across whichever queries
happen to need it.

## Procedure

1. **Isolate the crossing.** All cross-organisation reads live in one module,
   with a comment saying what it is and why it is allowed to do this. A reviewer
   who wants to audit the privacy surface should have exactly one file to read.
2. **Aggregate at the source.** The computation that reduces rows to statistics
   happens where the data is, so no per-record result ever materialises in
   application memory. This is a correctness control, not a performance one,
   though it is usually also faster.
3. **Return no identifiers.** The result carries statistics and counts. It does
   not carry organisation identifiers, and there is no code path in which a
   cross-organisation identifier and a cross-organisation measurement are in the
   same structure — because two such structures can always be joined later by
   somebody who has both.
4. **Enforce the floors inside the same read**, before returning. A caller that
   receives raw aggregates and is trusted to gate them is the presentation-layer
   mistake in a different costume.
5. **Bucket high-entropy fields on the way in.** Exact compensation figures,
   exact dates, free-text titles and precise counts are near-unique. Round,
   band, or coarsen them before they enter the pool, never after — an exact
   value that reached the aggregate has already been observed.

## Statistics that are rows in disguise

A statistic is safe only relative to the pool it summarises. Over a thin pool,
several familiar summaries name an individual:

- **Extremes.** A maximum or minimum *is* one contributor's value, published
  verbatim. It is never safe at small pool sizes and it is rarely worth the risk
  at any size.
- **Outer percentiles.** A 95th percentile over eight contributors is an
  extreme wearing a statistical name. Prefer the median and the interquartile
  range; if the tail matters, describe it qualitatively.
- **Exact counts on a rare attribute.** "Three organisations in this region
  report an offer-acceptance rate below 50%" is an aggregate that, in a market
  with four organisations, is an accusation.
- **A statistic and its complement.** Publishing both a subgroup figure and the
  whole-pool figure lets a reader derive the excluded subgroup. Release one, or
  ensure each derivable slice clears the floors in its own right.
- **A variance or spread over a tiny pool**, which combined with the mean
  constrains the individual values sharply — at three contributors, a mean and a
  variance nearly determine the set.

The test to apply: *if I knew everything public about the contributors, could
this number single one out?* If the answer needs a paragraph, the answer is yes.

## Decision rules

- When a benchmark needs a new statistic, ask what it lets a reader derive in
  combination with everything already released, not whether it is an aggregate.
  Aggregation is not anonymisation; composition is where the leak lives.
- When a debugging need argues for logging the underlying rows, log the
  aggregate and the counts instead. A cross-organisation record in a log file is
  a cross-organisation record.
- When an export or reporting feature is built on top of a benchmark, it inherits
  the constraint and does not get its own path to the data.
- When the same query would be convenient for a non-benchmark feature, write a
  second query. The value of a single audited crossing comes entirely from it
  being single.
- When free-text data would enrich a benchmark, it does not go in. Free text is
  identifying by default and cannot be gated by a floor.

## When not to use this

This constraint governs reads that cross the organisation boundary. Within one
organisation, a recruiter looking at their own candidates needs rows, and
withholding them in the name of privacy protects nobody — the candidate-data
discipline governs what that team may see about its own applicants, and it is a
different question with different answers.

Do not stretch the rule into "no cross-organisation feature may name a number".
The contributor count is publishable and should be
([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
cuts both ways: withholding what the record safely supports leaves readers
guessing, and a guess is unbounded).
