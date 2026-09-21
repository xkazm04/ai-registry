---
layer: technique
type: technique
subject: search-term-mining
technique: zero-conversions-on-unrounded-count
status: forged
laws: [not-measured-is-not-zero, a-gate-before-money-and-copy]
shared_with: []
use_when: [writing or reviewing a negative-keyword eligibility rule, parsing a search-terms export whose conversion column has decimals, a converting query stopped serving after a mining pass]
---

# Zero conversions on an unrounded count

The negative gate is an exact comparison against zero on the conversion number the
platform reported, kept with every decimal it came with. A query with 0.4 conversions,
0.05 conversions, or any positive value is a converting query and is never eligible to
be blocked. This is the one invariant of the subject, and the technique exists because
the invariant is almost never broken in the rule - it is broken upstream, where a
column is parsed, formatted or compared as an integer.

## Why the count is fractional

Two documented platform behaviours put decimals in the column. Data-driven attribution
divides one conversion across the ad clicks in its path, so a query that assisted a
sale shows a fraction of it. Consent-driven and privacy-driven modelling estimates the
conversions it could not observe and adds fractional estimates to observed ones. Both
mean that a query's conversion count of 0.4 is the platform's own statement that the
query participated in revenue. Rounding that to zero is not a simplification; it is a
different claim.

## Procedure

1. **Read the column as a decimal at the boundary.** The parser that maps report rows
   to the mining input keeps the conversion count as a floating-point number. No cast
   to integer, no rounding helper, no "conversions < 1".
2. **Compare for exact zero.** The eligibility predicate for a negative is
   `conversions === 0` (or the language's strict equivalent) and nothing looser. "Less
   than one", "rounds to zero" and "below 0.5" all admit converting queries.
3. **Order the branches so the invariant survives a threshold change.** Test the
   promote predicate before the negative predicate for every row, so that a query
   that satisfies both - possible only if someone later loosens a threshold - lands on
   the promote side and can never fall through to the block.
4. **Pin it twice.** A table of hand-written cases (0, 0.4, 1, 2, a row with no
   metrics) pins the threshold as written. A property loop over a few hundred random
   rows asserting that no emitted negative has `conversions > 0` pins the invariant as
   meant, and is the only test that catches a regression introduced by a mapper rather
   than by the rule.
5. **Map absence to zero, not to unknown-as-zero silently.** A row with no metrics
   block at all maps to zero cost, zero clicks, zero conversions; it then fails the
   click and spend floors and is never negated. Zero here is safe only because the
   floors sit after it. A row with a metrics block but a missing conversion field is
   the dangerous case: treat it as not measured and drop it from the mining input
   rather than defaulting it to zero.

## Decision rules

- When the conversion column is fractional, do not round it anywhere between the
  report and the gate, because rounding 0.4 to 0 converts a protected query into a
  blocked one with the rule text unchanged.
- When a rule reads "fewer than one conversion", rewrite it as "exactly zero", because
  the two differ precisely on the rows the invariant exists for.
- When a mapper cannot classify a row's conversion count (field absent, non-numeric),
  drop the row from mining, because a defaulted zero is a fabricated verdict of "never
  converted".
- When a test suite has only a case table, add the property test, because the case
  table pins values and the property pins the invariant.
- When the conversion count is a modelled estimate rather than an observed one, treat
  it identically, because the platform does not distinguish them per query and the
  cost of blocking a real converter dwarfs the cost of sparing a modelled one.

## The mirror on the promote side

The same fractional column reads the opposite way for promotion. A 0.4-conversion
query has not proven itself; a promote floor of two conversions (practitioner
convention, see the promote technique) is deliberately above any fraction. The
asymmetry is intended: blocking needs certainty that nothing converted, promoting
needs evidence that something converted more than once.

## When NOT to use

- Do not apply this gate to a **campaign** or an **ad group**. Their zero-conversion
  rules belong to `campaign-anomaly-triage`, carry different floors, and are read
  against spend spikes rather than against a permanent criterion.
- Do not use exact-zero as the rule for **pausing a keyword**. A keyword pause is
  reversible and visible; the invariant here is calibrated to a change that is
  neither.
- Do not extend the invariant into "any conversion means promote". A fraction spares a
  query from negation; it does not earn it a keyword.
