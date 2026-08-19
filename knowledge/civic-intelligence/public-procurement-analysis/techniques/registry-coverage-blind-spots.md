---
layer: technique
type: technique
subject: public-procurement-analysis
technique: registry-coverage-blind-spots
status: forged
laws: [every-cap-ships-its-population, missing-is-not-zero, non-partisan-symmetry]
shared_with: []
use_when: [declaring a registry-derived figure complete, sweeping a registry for one entity, comparing entities on registry-derived totals]
---

# Registry coverage blind spots

The concern: a contract registry covers what the law forces into it, minus what the
harvest failed to reach. Every figure derived from one is therefore a **floor over a
stated coverage**, and the technique is to enumerate the censoring mechanisms, state
them with each figure, and refuse comparisons that the coverage cannot support.
"The registry shows N" and "there are N" are different sentences; publishing the
second on evidence for the first is the coverage mirage.

## The censoring mechanisms

Enumerate these for the jurisdiction and the harvest, explicitly, before the first
figure ships:

- **Legal scope.** Publication duties start at a disclosure threshold; below it,
  contracts exist but need not appear. Exempt categories (classified matters,
  certain sectors, certain instrument types) never appear at any value. The
  registry's floor is thus lowest exactly where splitting games operate (see
  threshold-proximity-signals).
- **Temporal scope.** The mandate started on a date; earlier contracts are absent
  by construction. A firm's "public revenue since founding" cannot come from a
  registry younger than the firm.
- **Search-side asymmetry.** Registry search interfaces distinguish *roles* —
  counterparty versus publishing party — and a query on one role returns only that
  side. A sweep keyed on the counterparty role **misses every contract the swept
  entity published itself**. For a private supplier that is a rounding error; for
  any entity that is itself a publishing authority (state firms, municipal
  companies, agencies) it is a structural hole. Decision rule: sweep both roles
  before calling any per-entity result complete — and verify the role semantics
  with a decisive test (one known contract, queried from both sides), because
  interface documentation and folk belief about "matches either party" are
  routinely wrong.
- **Harvest caps.** Page-size limits, result caps, rate limits and sampling turn a
  census into a sample. A per-entity list that stops at a suspiciously identical
  count across many entities is capped, whether or not anyone remembers capping it.
  Every cap ships its population: "25 of an unknown total under a cap of 25" is the
  honest record.
- **Ingest attrition.** Records suppressed for shape violations, implausible dates,
  allowlist misses. These are your own censoring; count and disclose them with the
  same rigor as the registry's.

## Decision rules

1. **Attach a coverage statement to every aggregate.** Which roles were swept, what
   period, what caps, what was suppressed, harvest date. A number that cannot state
   its coverage does not render.
2. **Floors, not totals, in the copy.** "At least N contracts / at least V under
   these conditions" — and when a cap was hit, say so in the same sentence.
3. **Missing is out-of-record, not zero.** An entity with no registry rows has "no
   contracts visible in the registry," which under the legal-scope censoring is
   compatible with substantial below-threshold business. Never render the absence
   as a measured zero, and never let it lose (or win) a comparison.
4. **Compare only within equal coverage.** Rankings and peer comparisons are valid
   only across entities harvested under the same roles, period and caps. A
   two-sided sweep for one firm against one-sided sweeps for its peers
   manufactures an outlier — and because sweep depth tends to follow investigative
   interest, uneven coverage silently converts attention into apparent guilt.
   Equalize coverage or drop the comparison.
5. **Close the gaps you can, then restate.** Bulk exports beat interactive search
   for completeness (no session caps, full history, machine-readable direction and
   validity fields); when a bulk path exists, prefer it and re-derive the coverage
   statement rather than patching the old one.

## When not to use

Coverage discipline does not mean paralysis: a floor is a perfectly publishable
fact, and many accountability claims ("this firm has at least these contracts with
this buyer") need only a floor. The technique blocks *totals, absences and
comparisons* that the coverage cannot carry — it never blocks an existence claim
backed by retrievable records.
