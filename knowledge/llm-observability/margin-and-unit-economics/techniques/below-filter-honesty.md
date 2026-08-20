---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: below-filter-honesty
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero, estimation-announces-itself]
shared_with: []
use_when:
  - filtering a margin rollup to at-risk rows
  - handling rows whose margin percentage is undefined
---

# Below-filter honesty

The most-used view of a margin surface is the filtered one: "show me everyone
under X% margin" — the at-risk roster, with `below 0` as the loss-making set.
Two subtle dishonesties creep into naive implementations of exactly this
filter, and both hide the worst rows or launder the filtered numbers into
business-wide ones.

## Dishonesty one: dropping the undefined

A customer with cost and no revenue has an undefined margin percentage — the
denominator is zero, and the honest representation is an absent value, never a
sentinel like −100% or −∞ (a null is an admission; a fabricated percentage is
a lie that sorts). But a filter written as `percentage < threshold` evaluates
to false — or throws — on an absent percentage, so the free-tier customer
burning inference with zero revenue *disappears from the at-risk roster*. The
row most obviously below breakeven is the one the filter drops.

The rule: **a row with undefined margin percentage qualifies as below any
threshold when its absolute margin is negative.** The filter predicate is a
two-arm match, not a single comparison:

- percentage defined → keep when `percentage < threshold`
- percentage undefined → keep when `margin_dollars < 0`

The second arm's negativity check matters: a row with neither revenue nor cost
(an idle key that appeared for some other reason) is not "losing money" and
must not pad the roster. Test all three shapes — defined-below,
undefined-losing, undefined-idle — because the middle one is the regression
that recurs whenever someone "simplifies" the predicate.

## Dishonesty two: the unlabeled cohort subtotal

A filtered response naturally sums its rows into totals — total revenue, cost,
margin *of the filtered cohort*. Those totals are correct and useful, and they
are also a trap: detached from the request that produced them, they read as
the business's totals. A screenshot of the `below 20` view shows "total margin:
−$3,400" and travels through two forwards into a leadership deck as the
company's margin.

The rule: **the response echoes the predicate it applied.** When a below-filter
was requested, the payload carries the threshold (`below: 20`) beside the
totals; when the request was unfiltered, the field is absent entirely — no
phantom predicate on window-wide totals, and no default value that blurs the
two cases. The reader of the *payload* — not the reader of the documentation —
can always tell a cohort subtotal from a business total. This is the same
discipline as stamping a simulation as simulated: any response whose numbers
were shaped by a request parameter restates that parameter in its own body.

## Decision rules

- Threshold semantics: strict less-than, expressed in the same unit the user
  typed (percent, not fraction) and converted once at the boundary. Off-by-100
  errors in threshold conversion produce filters that keep everything or
  nothing, which users read as "the data is broken".
- `below 0` must equal the set of rows with negative margin dollars plus
  undefined-percentage losers — verify this identity in a test; it is the
  definition of "the loss-making roster".
- Never apply the filter before computing unfiltered business totals if the
  surface shows both; filter the row set, not the source data.

## When not to use it

Do not bolt an above-filter, band-filter, and sort-override onto the same
endpoint symmetrically "for completeness". The below-filter earns its place
because "who is at risk" is the operating question; each additional server-side
predicate doubles the echo-disclosure surface. Rare slicing needs are better
served client-side over the unfiltered payload.
