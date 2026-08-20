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
convention at ingest, documented on the schema). Never persist the total as
its own column: a stored total is a derived value that desynchronizes from
its parts on the first correction, and it invites downstream code to price
against it, which is exactly the collapse the quadruple exists to prevent.

## Decision rules

- **When a provider reports a token class you do not model, add a counter;
  do not fold it into an existing one.** Folding is irreversible; a new
  optional counter is backward-compatible by construction (absent on all
  history, honestly).
- **When a provider's usage block is missing entirely**, the mandatory
  counters default to 0 — and that is a known weakness of the mandatory
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
every row forever. The quadruple earns its four slots because all four have
distinct prices today; a fifth slot must clear the same bar.
