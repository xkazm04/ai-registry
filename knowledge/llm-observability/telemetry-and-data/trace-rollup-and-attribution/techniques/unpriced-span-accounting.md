---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: unpriced-span-accounting
status: forged
laws: [nullable-never-zero, never-present-absence-as-an-answer]
shared_with: []
use_when: [summing cost over spans that may lack a price, a model is absent from the price book, presenting a cost total an operator will act on]
---

# Unpriced span accounting

Cost is a nullable measure. A call to a model the price book does not know
has *no* cost — not a zero cost. Zero is a measurement ("this call was
free"); null is an admission ("we could not price this call"). The technique
is the discipline that keeps those two states distinct from ingest through
rollup to display, because every point where null quietly becomes zero
converts a lower bound into a confident-looking total.

## Where the line is held

**At ingest:** when pricing fails — model absent from the book, unknown
pricing unit, malformed usage — store the cost as null. Never write 0.00 as
a placeholder "to keep the column non-null"; a phantom zero is
indistinguishable from a real free call forever after, and no later
price-book fix can tell them apart. (Whether a later fix may re-price
history at all is a separate restatement question; the point here is that
null preserves the *option* of honesty and zero destroys it.)

**In the rollup:** a sum over a nullable measure must carry **how many rows
it could not measure**, in the same object as the sum. The fold is one pass:
add the priced values, count the nulls. A totals object then reads
`cost: 0.41, unpriced_spans: 2` — and the reader knows 0.41 is the floor of
the trace's cost, not the trace's cost. Without the count, the exact same
0.41 reads as complete, and there is no way to tell a fully-priced $0.41
trace from a mostly-unpriced one.

**At display:** when the unmeasured count is nonzero, the surface must show
it beside the total — "$0.41 (2 spans unpriced)" — not in a tooltip, not in
a legend, not only on the detail view. The number and its caveat travel
together or the caveat does not exist.

## Why the error is anti-correlated with vetting

The spans that fail pricing are not a random sample. They are
disproportionately the **newest models** — released after the price book's
last update — which is precisely the traffic whose cost is least understood
and most likely to be the subject of the operator's question. Silent zeroing
therefore under-reports hardest exactly where scrutiny is highest: the new
model's pilot looks nearly free, the budget window that should have alerted
stays green, and the correction arrives as an invoice. The failure is quiet
at the moment it happens and loud a month later, which is the worst possible
distribution of noise.

## Decision rules

- **Never coerce, never impute silently.** If an estimated price is applied
  to otherwise-unpriced spans (a fallback rate, a same-family
  approximation), the result is an *estimate* and must announce itself as
  one in the payload — an imputed-amount field beside the total, not a
  bigger number with the same name. Undisclosed imputation is worse than
  disclosed absence, because it removes the signal that the price book needs
  updating.
- **Propagate the count through every aggregation level.** Trace totals,
  per-tenant rollups, time-window sums: each carries its own
  unmeasured-count. The count composes by addition; the honesty does not
  compose at all unless carried explicitly at every level.
- **Treat a rising unpriced count as an operational alarm**, not a cosmetic
  caveat. It has exactly one meaning — the price book is behind the traffic
  — and exactly one fix. A surface that trends it makes the price-book
  update happen before the invoice does.
- **Do not extend the pattern to measures that have a true zero default.**
  Token counts genuinely absent are a producer defect worth flagging, but a
  missing latency treated as zero merely makes a duration conservative —
  degrading gracefully — whereas a missing price treated as zero fabricates
  money. Reserve the null-plus-count machinery for measures where absence
  and zero have materially different meanings to the reader; applying it
  everywhere dilutes it where it matters.

## When not to use it

If the pipeline guarantees every span is priced at ingest or rejected — a
closed system with a complete book and no third-party traffic — the count is
constitutionally zero and carrying it is harmless but inert. The technique
earns its weight exactly when the price book and the traffic evolve
independently, which is the permanent condition of an operator-side product.
