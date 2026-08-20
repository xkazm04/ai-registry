---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: never-sum-two-currencies
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis]
use_when: [blending spend across sources, aggregating cost for a multi-country hiring team, designing a money column, reviewing an aggregation that compiles cleanly]
shared_with: []
---

# Never sum two currencies

An amount is a pair — a quantity and a currency — and the pair is
indivisible. Two amounts in different currencies may not be added,
averaged, ranked, or reduced to a single figure unless something in the
system has performed an explicit, dated conversion. This is not a rounding
concern. A sum across currencies is not an approximation of the right
answer; it is a different quantity that means nothing.

The reason this needs to be a named technique rather than an obvious truth is
that the bug is invisible to review. The arithmetic is correct. The types
usually permit it, because most systems store an amount as a number and a
currency as a label on a different column, or on a different table, or —
worst — as a workspace-level default that most rows inherit and a minority do
not. Everything compiles, every test with single-currency fixtures passes,
and the defect appears only in the one workspace that hires in two countries,
which is also the workspace most likely to be your largest customer.

Hiring is unusually exposed to this. Agency fees are invoiced where the
agency is; job advertising is priced where the board is; assessment and
background-check vendors bill in their own currency; computation is priced in
a third; and the recruiter's loaded hourly rate is in the currency they are
paid in. A single cost-per-hire figure for one requisition can legitimately
touch four.

## Procedure

1. **Make the currency inseparable from the quantity** in whatever the
   system's strongest available mechanism is — a value type, a composite
   column, a constructor that cannot be called without one. If a bare number
   can be passed where an amount is expected, the rule is advice rather than
   a guarantee, and advice loses.
2. **Make aggregation currency-aware by construction.** A sum over a
   collection of amounts either groups by currency and returns several totals,
   or requires a conversion policy as an argument. It never returns one
   number by default.
3. **Where a single figure is genuinely required, convert explicitly** with a
   named rate, a rate source, and a rate date — and carry all three into the
   result, which then falls under the dating technique with the rate as one
   more input that can go stale.
4. **Where conversion is not available, present the components.** Two totals
   side by side is an honest answer and reads fine. A blended number with a
   footnote is not. Where a reader plainly wants the combined view, answer by
   **navigation rather than arithmetic**: a path to the surface that breaks
   each ledger down, and a sentence saying which of the two it explains.
   Adding a route costs nothing in honesty; adding a number costs everything.
5. **Refuse the ordering operations too.** "Most expensive channel" across
   currencies is the same defect wearing a different hat, and it is the one
   that survives longest because nobody thinks of a sort as arithmetic.
6. **Test with a mixed-currency fixture as a matter of course.** The
   single-currency test suite is why this ships.

## Decision rules

- When a currency is missing on a row, that row does not enter an
  aggregate. It is not defaulted to the workspace currency; a defaulted
  currency is a fabricated fact about a payment somebody actually made
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- When a conversion is performed, the converted figure is labelled as
  converted for the rest of its life, including in exports. A converted
  amount and an invoiced amount are different rungs of the confidence ladder
  and must not be shown as peers without the distinction visible.
- When a rate must be chosen, prefer the rate in force on the transaction
  date over today's rate for historical spend, and say which was used
  ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
  Repricing history at today's rate makes past quarters move with the foreign
  exchange market.
- When a per-unit figure is derived — cost per hire, cost per application —
  the currency of the result is the currency of the numerator, and if the
  numerator had several, the result does not exist until they are converted.
- When a comparison spans organisations or countries, currency is one of the
  reasons the comparison may not be a single ranking. That comparison belongs
  to a neighbouring discipline; this technique's contribution is only to
  refuse the silent flattening that would make it look possible.

## The generalisation worth carrying

This is the clearest instance of a broader rule for money surfaces: **units
are part of the value, and any operation that discards a unit is a bug even
when the arithmetic is right.** The same reasoning forbids summing hours
against currency amounts, adding a per-hire figure to a per-application
figure, and averaging percentages of different denominators. A codebase that
enforces currency pairing tends to acquire the discipline for the others,
because the same review reflex fires.

## When not to use this

Do not apply this to a display-only conversion the reader explicitly asked
for — a currency selector is a legitimate feature, and refusing to render a
converted view is not honesty, it is unhelpfulness. The rule governs *stored
and derived* values and any figure presented as authoritative, not a
reversible view the user chose and can see the rate for.

Do not extend the refusal into paralysis on a genuinely single-currency
workspace. Where every input is in one currency, one total is the correct
answer; the technique costs nothing there and exists for the day the
workspace stops being single-currency, which is precisely the day nobody
notices.
