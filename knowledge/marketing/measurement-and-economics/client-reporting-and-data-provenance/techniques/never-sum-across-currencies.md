---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: never-sum-across-currencies
status: forged
laws: [not-measured-is-not-zero, provenance-is-binary-and-labelled]
shared_with: []
use_when: [a client runs ad accounts billed in more than one currency, blending spend or a ratio across platforms, a report shows a total the client cannot match to any invoice]
---

# Never sum across currencies

A Czech client's second-national-platform account bills in crowns. Their account on
the dominant search engine's ad platform was opened in euros by a previous agency. A
marketplace feed reports in whatever the marketplace settles in. Each account's spend
is a real number; the sum of the three is not a number at all, and a report that
prints it has fabricated a figure the client cannot reconcile with any invoice, bank
statement or platform console.

The rule is short: **money is summed within a currency and nowhere else.** A blended
figure across currencies is either scoped to one currency and labelled as the scope,
or shown as one row per currency with no total. Conversion at a rate is a deliberate,
labelled, dated act, never a default.

## Why not just convert

Conversion is not forbidden; silent conversion is. Three things go wrong when a
pipeline converts by default:

- **The rate is unstated.** A total in crowns that includes euros converted at some
  rate on some day is a figure nobody can audit. When the client's accountant
  converts the same euros at the invoice-date rate, the two numbers differ and the
  report loses its credibility with it.
- **Ratios change with the rate.** A cost-to-revenue ratio over converted spend and
  native revenue moves when the rate moves, with no change in the account. A month
  where the crown weakened shows a "worse" efficiency that is entirely currency.
- **History is rewritten.** A converted series recomputed at today's rate changes
  every prior month's figure in the report. A series converted at each month's rate
  needs a rate table the pipeline must own and disclose.

If a client genuinely needs a single-currency view, the report says "converted at the
month-average rate of the national bank, 24.7 CZK/EUR" beside the total, and the
native figures remain available. That is a disclosure, in the sense of
[provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled):
the converted number is not the business's own data, and it says so beside itself.

## Ratios blend only over complete pairs

The currency rule has a sibling for ratios that carry no currency: click-through
rate, conversion rate, cost per click. Blending these across sources is a ratio of
sums - total clicks over total impressions - and the sum is honest only when **every
contributing row carried both the numerator and the denominator.** A source that
reports clicks but not impressions, dragged into a blended click-through rate,
contributes to the numerator and nothing to the denominator, and the blended rate is
inflated by exactly the rows that could not be measured. The rows with a missing pair
are excluded from the blend, the blend says how many sources it covers, and when no
row carries the pair the ratio is absent
([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

Cost per click has both concerns at once: it needs the pair, and the cost half is in a
currency. A blended cost per click across a crown account and a euro account is
refused on the currency rule before the pair rule is even reached.

## Procedure

1. **Carry the currency on every money row** from the sync, as a code, never as an
   assumption that the workspace has one currency. Normalise the code before
   comparing - upper-case it - so a stored lowercase code does not read as a second
   currency and refuse a blend that was perfectly legal. And decide explicitly what
   an *absent* code means: treating it as the workspace's base currency is a common
   default and a labelled one, but it is a guess, and a source that can carry the
   code should.
2. **Group before summing.** Any aggregate over money groups by currency first; the
   aggregate function refuses a group that mixes codes rather than summing the raw
   values.
3. **Choose the report's scope.** The workspace declares a primary currency; money
   tiles show the primary-currency total with the label "primary currency only" when
   other currencies exist, and the other currencies as their own labelled rows.
4. **Blend ratios over complete pairs only**, count the sources included, and render
   the count ("across 2 of 3 sources").
5. **When conversion is requested, make it a labelled transformation** with the rate
   source and date beside the number, applied per period at that period's rate, and
   never the default rendering.
6. **Test with two currencies from day one.** A single-currency test suite passes the
   naive sum and the bug is discovered by the first client with a second platform.

## Decision rules

- When rows in the report's money aggregate carry more than one currency code, do
  not total; scope to the primary currency and label the scope, or show per-currency
  rows.
- When a ratio's blend would include a row missing either the numerator or the
  denominator, exclude the row and say how many sources remain; when none remain, the
  ratio is absent.
- When a diagnosis or a recommendation needs one spend figure across the portfolio
  and the portfolio is multi-currency, the diagnosis is scoped to the primary
  currency's sources and says so; it does not run over a converted total.
- When a client insists on one total, convert at a named rate on a named date,
  disclose beside the number, keep the native rows, and never let the converted
  figure feed a ratio or a target check.
- When a platform reports a metric in a currency other than the account's billing
  currency - a conversion value in the shop's currency on a euro-billed account -
  the two are not divided into a ratio until both sides are in one currency by a
  labelled conversion; until then the ratio is absent.

## Convention, stated as such

The choice of the primary currency as the report's scope is convention. The
prohibition on summing across codes is arithmetic, not convention, and no threshold
softens it.

## When not to use this

Do not apply the currency rule to counts. Clicks, impressions, orders and leads have
no currency and sum across platforms freely; only their money and their money-ratios
are scoped.

Do not refuse to convert when the client's own books are single-currency and they
ask for the converted view. The rule forbids silent conversion; a disclosed one at a
stated rate is a service, provided the native figures stay one click away.

Do not treat two accounts in the same currency on different platforms as a currency
problem. Their spend sums; whether their platform-reported conversions may be summed
is an attribution question - two platforms both claiming the same order - and belongs
to `attribution-and-incrementality`.
