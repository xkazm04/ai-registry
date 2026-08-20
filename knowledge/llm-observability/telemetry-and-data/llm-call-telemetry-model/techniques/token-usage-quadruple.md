---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: token-usage-quadruple
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when: [modeling token counts in an event schema, reconciling computed cost against a provider invoice, adding support for cached or reasoning token classes]
---

# The token-usage quadruple

Token accounting on a call record is four counters, not one and not two:

| Counter | Presence | Meaning |
| --- | --- | --- |
| input | mandatory, defaulted to 0 | prompt tokens billed at the input rate |
| output | mandatory, defaulted to 0 | completion tokens billed at the output rate |
| cached input | optional | prompt tokens served from a provider cache, billed at a discounted rate |
| reasoning | optional | internal deliberation tokens some model families bill separately |

The shape follows the money. Providers price these classes at different
rates — cached input at a steep discount, reasoning sometimes at the output
rate, sometimes its own — so a record that collapses them cannot be priced,
re-priced, or reconciled. The two mandatory counters exist for every call;
the two optional ones exist only for providers and model families that
report them, which is why their absence is representable at all.

## The class list is provider-driven, and it moved (checked 2026-08)

The quadruple was the right floor when every cached token was a discounted
read. The field has since produced a class the quadruple cannot fold away:
**cache writes**, which at least one major provider reports as their own
counter and bills at a *premium* over the input rate — tiered by cache
lifetime, so the same written token has more than one possible price. Folding
writes into input under-prices exactly the traffic engineered for reuse;
folding them into cached input inverts the sign of the adjustment (a write is
a surcharge, a read is a discount). By this technique's own first decision
rule the class has cleared the bar for a fifth optional counter — carrying
its cache-lifetime tier beside it, since the tier is what prices it — and a
schema drawn today should reserve both. Observability platforms have gone one
step further and model usage as an open map of named token classes, each with
its own price-book entry; that is the right shape at platform scale, where
provider class lists churn faster than schema migrations, while the fixed
counter set remains right for an accounting record budgets enforce on,
because a typed counter is what a price-book signature can consume. Either
way the invariant is unchanged: every class the provider reports is stored
distinct, priced distinct, and never folded.

## Absent and zero are different statements

For the optional counters, `None`/absent means "this provider does not
report this class, or this call predates our capture of it"; `0` means "the
provider reported this class and the count was zero" — a cache miss is a
measured zero, a provider with no cache is an absence. Conflating them
poisons two downstream reads: cache-hit-rate analysis (a fleet of absences
read as zeros reports a 0% hit rate for a provider that has no cache to
hit) and cost reconciliation (a priced zero asserts "we checked, nothing at
the discounted rate", which is false for an absence). This is the
nullable-never-zero law applied to quantities instead of money: a zero is a
measurement, an absence is an admission. Serialize accordingly — omit the
field when absent rather than emitting 0, and keep the distinction in the
store.

## Totals are derived, never stored

Expose a `total()` as a computed convenience (conventionally input + output;
state explicitly whether cached input is a subset of input or additional to
it — providers differ, and the normalizer must resolve that to ONE
convention at ingest, documented on the schema). The same subset-or-additive
question now exists on the output side: some providers count deliberation
inside the output counter and report reasoning as a sub-detail, others report
it beside output. The prevailing cross-vendor telemetry convention has
settled on **inclusive totals with sub-counts** — the mandatory counters
carry every token of their direction, the optional classes are breakdowns —
which means a normalizer targeting it must *add* the counters of providers
whose input figure excludes cache traffic. Whichever convention the schema
picks, it is picked once, at ingest, for every provider. Never persist the total as
its own column: a stored total is a derived value that desynchronizes from
its parts on the first correction, and it invites downstream code to price
against it, which is exactly the collapse the quadruple exists to prevent.

## Decision rules

- **When a provider reports a token class you do not model, add a counter;
  do not fold it into an existing one.** Folding is irreversible; a new
  optional counter is backward-compatible by construction (absent on all
  history, honestly).
- **When a provider's usage block is missing entirely**, the mandatory
  counters default to 0 — the dominant honest population here is the aborted
  stream, since usage conventionally rides the final stream event and a call
  that dies mid-stream never receives one — and that is a known weakness of the mandatory
  pair: a defaulted 0 is indistinguishable from a measured 0. Accept it for
  input/output (the alternative, making them nullable, breaks every
  aggregate for marginal benefit) but record the trade-off; if
  unreported-usage traffic becomes material, a status flag on the record is
  the fix, not nullable counters.
- **Pricing consumes the quadruple, not a summary.** The price-book lookup
  takes all four counters plus the pricing lane; any signature that takes
  "tokens: int" is a bug at the interface level.

## When not to extend it

Resist per-modality expansion (audio tokens, image tokens) on the canonical
record until a real pricing rule needs it — each new counter is carried by
every row forever. The bar is unchanged even though it is being cleared more
often: modality classes *do* now carry distinct prices at some providers, and
a class earns its slot the day one of *your* providers prices it distinctly —
not the day it appears in someone's API reference. A counter reported at the
same rate as an existing class (tool-result tokens folded into the input
rate, say) has not cleared the bar, however prominently it is reported.
