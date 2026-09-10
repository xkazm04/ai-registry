---
layer: technique
type: technique
subject: public-procurement-analysis
technique: value-basis-non-summability
status: forged
laws: [deterministic-code-owns-numbers, disclose-never-repair, missing-is-not-zero]
shared_with: []
use_when: [summing contract values, rendering a per-firm money total, parsing registry value fields]
---

# Value basis non-summability

The concern: a contract registry does not publish "the value." It publishes a value
**on a basis the publisher chose**, and different records in the same corpus sit on
different bases. Summing across bases produces a number that no source document
supports; converting between bases with an assumed rate produces a second such
number. This technique governs how value fields are parsed, stored, aggregated and
rendered so that every total is a claim some composition of records actually makes.

## The bases

Preserve the value dimensions the source actually defines; these are not
universally mutually exclusive shapes:

- **tax-exclusive** amount (net of value-added tax),
- **tax-inclusive** amount (gross),
- **foreign-currency** amount with a currency label,

plus the not-stated sentinel. Beyond the schema's own shapes, procurement adds
semantic bases: a framework agreement's ceiling versus its call-offs' actual values,
estimated versus final award value, a unit price versus a total. Matching these dimensions is necessary but insufficient: the amounts must also
cover distinct, non-overlapping obligations within the same period and perimeter.

## Decision rules

1. **Parse each shape into its own field.** No coercion at ingest, no
   "prefer-gross-else-net" fallback into a single undifferentiated amount — or, if a
   single amount column is operationally necessary, **record which basis filled it**
   as a first-class attribute on the row and on every derived edge. A corpus that
   collapsed bases without recording them cannot be repaired later; one that
   recorded them can at least confess.
2. **Never silently convert source amounts.** The tax rate applicable to a given contract is not in the
   record (jurisdictions run multiple rates and exemptions), and a historical
   exchange rate applied to a foreign-currency ceiling is a modeling choice, not a
   fact. When tempted to convert, do Y: keep the bases separate and disclose, because
   a converted figure is an invented figure wearing the registry's authority.
3. **Unknown basis belongs to neither side.** A row whose basis was never recorded
   is a distinct state from "the registry stated no value" — one is *our* gap, the
   other is the *publisher's* — and both are distinct from either tax basis. Keep
   the states separate and never let an unknown row bolster either side of a
   summability claim.
4. **Every rendered total carries its composition.** Compute, per aggregate: counts
   per basis, whether a **sole** basis covers all counted rows, whether the total
   **mixes** the two tax bases, and how many rows stand outside the tax split
   entirely (foreign currency, no value, basis unrecorded). Derive these in one pure
   function used by every surface — a restated composition rule will drift.
5. **Do not publish a mixed sum as a meaningful monetary total.** Show separate
   subtotals by compatible basis, with counts and exclusions. A warning beside a
   mixed sum does not make it summable. If a normalized estimate is required,
   retain source amounts and publish the conversion inputs and assumptions.

## Why the naive reading survives so long

A mixed-basis total is *plausible* — it is within a tax-rate factor of a true
number, so no smoke test catches it, and every row individually parsed correctly.
The defect is relational, existing only between rows, which is why it must be
guarded structurally (composition computed and rendered) rather than by review.
A corpus-wide mix does not prove that every individual firm mixes bases; compute
composition for each aggregate. Historical corpus counts belong to their dated
application witness, not to a universal distribution assumption.

## When not to use

If the corpus is *verifiably* single-basis — the registry schema admits one value
shape and the ingest asserts it — composition machinery reduces to that assertion,
which should still exist as a loud check rather than an assumption. And this
technique governs *display and aggregation*, not modeling: an economic model may
legitimately normalize bases under stated assumptions, but its output is a model
estimate and must be labeled as one, never rendered in the same visual register as
registry-sourced amounts.
