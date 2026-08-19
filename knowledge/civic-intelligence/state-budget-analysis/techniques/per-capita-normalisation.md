---
layer: technique
type: technique
subject: state-budget-analysis
technique: per-capita-normalisation
status: forged
laws: [missing-is-not-zero, deterministic-code-owns-numbers]
shared_with: []
use_when:
  - putting towns of different sizes on one axis
  - choosing the unit for a published budget metric
---

# Per-capita normalisation

Absolute budget figures order municipalities by size, and only by size: rank
raw spending and you have re-derived the population table with extra steps. Per
capita — the figure divided by resident count — is the unit in which a village
and a city occupy the same axis, and it is the only unit in which "high" and
"low" mean anything to a reader who lives in one of them: debt per resident is
a number a person can hold against their own household.

## The divisor is a sourced figure, not a constant

The entire technique lives or dies on the denominator's provenance:

- **Same period as the numerator.** Populations move; a division of this year's
  debt by a census figure from five years ago manufactures trend where none
  exists. Fiscal reporting systems typically publish a population indicator
  *per reporting period* alongside the financial indicators — use that one, so
  numerator and denominator share a source and a date
  ([deterministic-code-owns-numbers](../../_laws.md#deterministic-code-owns-numbers):
  the division is reviewable only if both operands are cited).
- **Same source as the peer group's divisors.** Mixing a statistical-office
  population for one town with a fiscal-registry population for another injects
  the two sources' methodological gap straight into the comparison.
- **A missing divisor makes the metric missing.** No reported population for
  the period means no per-capita figure — null, rendered as "not reported",
  never as zero and never bridged from an adjacent period
  ([missing-is-not-zero](../../_laws.md#missing-is-not-zero)). A silently
  bridged divisor is a repaired value, and repaired values are invented values.

## Not everything divides by heads

Per capita is the default, not the universal. Two other shapes recur:

- **Ratios of the budget to itself** — capital expenditure as a share of total
  expenditure, balance as a share of revenue. These are already dimensionless
  and normalizing them by population would be double normalization. Use them
  where the question is *composition* ("is this town investing or just
  operating?") rather than *magnitude*.
- **Signed flows stay signed.** A budget balance per resident is meaningful in
  both directions; do not clamp deficits to zero or fold them into absolute
  values, and make the sign convention explicit on the surface.

Choose the small set of headline metrics deliberately — a debt stock per
resident, a balance flow per resident, an investment-share ratio cover the
solvency / sustainability / composition triad that fiscal-condition practice
converges on — and compute each one in exactly one shared routine that every
surface imports. Two independently coded divisions will eventually disagree on
rounding, period choice, or null handling, and the surfaces will then publish
two different numbers under one name.

## Decision rules

- When the source publishes both a raw and a consolidated variant of the
  numerator, resolve that choice *before* normalizing (see the consolidation
  technique); per-capita of the wrong figure is precisely normalized nonsense.
- When rounding for display, round at the last moment and keep the full value
  in the data layer; peer medians computed over pre-rounded values drift.
- When a metric can be legitimately negative, the display component must be
  built for it from the start — retrofitting sign handling into a bar built
  for positives produces the classic inverted-bar lie.

## When not to use it

Do not per-capita-normalize figures whose driver is not population: a
mountain town's road maintenance scales with kilometers and winters, not
heads, and per-capita comparison there punishes geography. Do not use
per-capita to compare bodies with different mandates (a region vs. a town).
And never present a per-capita figure without its absolute companion available
one gesture away — journalists need the absolute number to quote, and a
surface that hides it invites them to reverse-engineer it wrongly.
