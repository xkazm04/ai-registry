---
layer: technique
type: technique
subject: usage-pricing-models
technique: exact-money-with-one-rounding-boundary
status: forged
laws: [derivation-names-recomputation, limits-are-derived]
shared_with: []
use_when: [a percentage or sub-minor-unit rate, a discount split across lines that does not sum, partial refunds, designing the columns a priced line stores]
---

# Round once, at the one place that must be integral, and keep the exact number

Pricing manufactures more decimals than a currency can express. A percentage of
a transaction does. A rate of three ten-thousandths per request does. A
conversion between the unit a price is quoted in and the unit the meter counts
does. A ladder with a fractional per-unit amount does it once per tier.

There is exactly **one** place in the pipeline that must be integral: the
amount actually charged, expressed in the currency's smallest unit. Everything
upstream of it stays exact; nothing downstream of it rounds again.

## The three wrong readings

- **Binary floating point.** It cannot represent a tenth. This is settled and
  it is still shipped, usually by way of a percentage computed in a template or
  a report that later becomes the number someone reconciles against.
- **Integers of minor units throughout.** Correct for the value that gets
  charged, insufficient for the values that produce it. A per-unit rate below
  one minor unit cannot be represented at all, and a percentage of an integer
  is not an integer. Integer storage is the *output* discipline, not the
  arithmetic.
- **Rounding at every step.** Round each tier's subtotal, then sum. The error
  now grows with the tier count, its sign is not random, and — worse — the same
  total computed as "sum then round" and "round then sum" differ, so two code
  paths produce two answers for one invoice and both look defensible.

The correct arithmetic runs in an **arbitrary-precision decimal** from the rate
to the boundary, with no intermediate rounding, and the boundary is named in the
code so a reader can point at it.

## The unrounded twin is the load-bearing half

Persist **two amounts on every priced object**: the rounded one, in the
currency's minor unit, and the exact one, unrounded, written in the same
operation. Not a computed accessor and not a re-derivation later — the exact
value is the source, the rounded one is the
[derived value that names its recomputation](../../../../_laws.md#derivation-names-recomputation),
and both are stored because the derivation is lossy and downstream readers need
the pre-image.

The reason is not aesthetic. Three later stages **divide** the amount, and
division off a rounded number produces parts that do not sum back to the whole:

1. **Allocating a discount or credit across lines.** A percentage off an
   invoice is distributed proportionally: each line's share is the discount
   times the line over the total. Off rounded lines, the shares miss the
   discount by up to half a minor unit per line, and the residue is dumped on
   whichever line the loop finished on. Off unrounded lines the proportions are
   exact and a single rounding at the end distributes the remainder by a stated
   rule. **A discount split across any number of lines sums to the discount
   exactly** — that is the property the twin buys, and it is the one an auditor
   checks.
2. **A minimum-commitment shortfall.** The customer committed to an amount; the
   true-up is that commitment minus the sum of what was actually consumed, and
   that sum is many lines. Summing rounded lines biases the shortfall by up to
   half a minor unit per line, in a direction set by the rounding mode.
3. **Partial refunds and credit notes.** Refunding three of seven units of a
   line takes three-sevenths of it. Off a rounded line, seven partial refunds
   do not add back up to the line, and the account ends with a residue nobody
   can attribute.

Tax computed per line and revenue recognised across periods divide too. The
review test is a search rather than an argument: **anywhere a stored amount is
multiplied or divided by a ratio, ask which of the two fields it read.** If it
read the rounded one, that is the defect, and it is a one-word fix at each site.

## The boundary, the mode and the residue are written down

- **Name the boundary.** One function, one place, and it is the last thing that
  happens before the amount is persisted as the charge. If you cannot point at
  it, there is more than one, and they will disagree the first time a
  computation is reached by a second path.
- **State the rounding mode** — half-up, half-even, away-from-zero — once, for
  the whole system. It is visible to the customer at the minor-unit level and
  an auditor will ask which one. Half-even is the defensible default for large
  numbers of small roundings; half-up is what most people expect on a single
  charge. Either is fine; two of them in one product is not.
- **State the residue rule** for any split: largest-remainder, first line, last
  line. Silence resolves to "last line", chosen by the loop.
- **Handle sign and zero.** An exact zero rounds to exactly zero, never to a
  negative minor unit. A negative amount rounds symmetrically to its positive
  twin, or a refund differs from the charge it reverses by one unit — which is
  precisely the discrepancy that gets escalated.

## The scale factor is derived from the currency

The number of decimal places is a property of the currency, not a constant.
Multiplying by a hundred is right for most currencies, wrong for the
zero-decimal ones, and wrong for the three-decimal ones. Read the exponent from
the currency and
[derive the factor beside the number](../../../../_laws.md#limits-are-derived);
a hardcoded hundred is a defect that only appears when the product enters its
first market that does not use it, which is also the first time anyone will
have to explain it to a regulator.

The same rule governs any precision cap on the unrounded column. If the exact
amount is stored with a fixed scale, that scale is derived from the worst case
the pricing shapes can produce — a percentage of a large transaction, a
sub-minor-unit rate over a large quantity — and the derivation is written next
to it. A scale chosen by feel truncates the exact value, which quietly reduces
the twin to a slightly better-rounded number.

And **the scale must be the same everywhere the value travels.** An exact
amount stored at fifteen decimal places on the priced line, then carried into a
credit or coupon column declared at five, is truncated at the boundary between
them — silently, by the store, with nothing in the code to read. The system then
has two exactnesses, the splits that cross the boundary do not reconcile with
the splits that do not, and the discrepancy is a fraction of a minor unit, which
is exactly the size that gets written off rather than investigated. Pick one
scale for money-in-flight, derive it once, and make every column that can hold
such a value declare it.

## Decision rules

- **When a rate is finer than the currency's minor unit,** nothing changes
  except that the twin is now obviously necessary rather than merely prudent.
- **When two systems must agree on an amount,** exchange the unrounded value
  and let each round at its own boundary, or exchange the rounded value and
  forbid both from dividing it. Exchanging the rounded value and dividing it on
  both sides is how two systems disagree by amounts too small to investigate
  and too consistent to be noise.
- **When a total is displayed,** it is the sum of the rounded lines, not the
  rounded sum of the exact lines. The customer adds up the lines; the invoice
  must survive that.
- **When adding a new stage that consumes an amount,** the question in review
  is whether it divides. If yes, it reads the exact field.
- **When migrating a system that stored only rounded amounts,** the exact
  column is back-filled from the rounded one and marked as reconstructed, not
  presented as exact. It is not exact, and pretending otherwise makes the
  historical splits look reconciled when they are not.

## When not to use this

- **Amounts that are never divided, aggregated or refunded, and never will be.**
  This set is empty in a billing system and non-empty in a one-off quoting tool.
  The twin costs a column; the judgement being made is whether you are in the
  second case, and most people making it are in the first.
- **A currency with no minor unit.** The rule is unchanged — the boundary is
  just at the whole unit — but code that assumes a scale of two is now the
  defect, not the rounding.
- **Non-monetary quantities.** A measured quantity is exact because measurement
  made it so; it needs a precision policy, not a rounding boundary, and the two
  should not share a helper.
