---
layer: technique
type: technique
subject: llm-price-book-operations
technique: price-resolution-order
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when: [computing per-event cost from a variant-encoded book, deciding which price row a call pays, handling dated model-name aliases]
---

# Price resolution order

Once tiers, lanes, and snapshots are rows, some function must decide which row
a given call pays. That function is the whole ballgame: every cost the product
ever asserts passes through it, and any ambiguity in it becomes two surfaces
disagreeing about the same call. The technique is to make resolution **one
deterministic, ordered procedure** — from call facts to exactly one row or an
honest miss — and to let nothing else in the system touch the row store
directly.

## The order

Given `(provider, model, input tokens, lane)`:

1. **Lane variant first.** If the call declared a discounted or premium lane
   and a matching lane row exists for the model, use it — flat, done. If the
   lane row does not exist, **fall through to standard rates** rather than
   failing: a lane the operator has not priced is a lane billed at base, which
   is the conservative direction (base rates are the ceiling for discount
   lanes), and it means adopting a new lane in clients never breaks costing.
2. **Then the prompt-length tier.** Among tier rows for the model, take the
   **highest threshold the call's input actually exceeds**; ties are
   impossible because thresholds are the key. If no threshold is exceeded, the
   base row. "Highest exceeded wins" mirrors how providers band long-context
   pricing: the whole request reprices at the band it lands in.
3. **Then the alias fallback.** If nothing matched the literal model string,
   apply the declared alias policy — canonically, trimming a trailing date
   suffix from dated snapshots — and run the same steps once more on the
   trimmed name. One trim, one retry, not a loop.
4. **Otherwise, miss.** The result is null — not zero, not a default rate, not
   the nearest-looking model.

Two structural rules keep the order trustworthy:

- **The order is closed.** Lane selection does not re-enter tier selection
  (variants compose one level deep), and alias trimming happens after — not
  interleaved with — variant matching. Every call takes exactly one path.
- **Everything resolves here.** Ingest costing, cap evaluation, dashboard
  math, what-if simulation: one function, one order. The moment a second
  resolver exists, the same event can cost two different amounts depending on
  who is asking, and reconciling them is somebody's quarter.

## Resolution picks the row; the class map prices the call

Resolution ends at one row, but the multiplication is per token class. The
call's usage arrives as classes — input, output, cache reads, cache writes
possibly tiered by cache lifetime, sometimes as provider-specific usage-type
keys — and each class bills at the resolved row's rate for that class. The
fallback rules are asymmetric on purpose: a *discounted* class with no rate
falls back up to the input rate (a cache read billed as plain input
overstates, which is the safe direction), but a *premium* class with no rate
— a TTL-tiered cache write — must become a disclosed partial miss, never a
silent fold into input, because billing a 2× write at 1× under-prices exactly
the traffic that caching was tuned toward. Class arithmetic happens after row
selection and never re-enters it; the order stays closed.

## A miss is a null with a story

The unpriced outcome deserves as much design as the priced one, because every
upstream failure — new model shipped before its row, alias policy missed a
rename, book seeded empty — degrades into it. Per
[nullable-never-zero](../../../_laws.md#nullable-never-zero): the event's cost is
stored null; aggregates over it report how many rows they could not price;
budget evaluation treats unpriced traffic under an explicit, disclosed rule
rather than reading it as free. What resolution must never do is *guess* — a
fuzzy match that prices a call against the wrong model produces a plausible
number, and plausible-wrong is strictly worse than visibly-absent, because
nothing downstream will ever question it.

## The alias policy is narrow and declared

Providers ship dated snapshots and rename lanes while keeping old names
working. Resolution honors that reality with a policy that is deliberately
small: a syntactic trim with an exact shape (a trailing date of fixed digit
length), applied once. Resist widening it — prefix matching, edit distance,
"family" heuristics — because every widening converts a class of honest
misses into a class of silent mispricings. When a rename does not fit the
trim, the answer is a new row (or an explicit alias row), written through the
admin path with provenance, not a cleverer matcher. The same discipline
applies to lane names: accept declared synonyms (a renamed lane's old and new
names mapping to one variant) as an explicit enumeration, never a guess.

## Testing decision rules

The order is only real if its edges are pinned by tests, and the edges are
enumerable: a lane call with no lane row falls back to base; input exactly at
a tier threshold prices at the band below (strictly-exceeds, and the
strictness is asserted); a dated name resolves to its trimmed row; a dated
name whose trimmed form is also absent misses; cached tokens are deducted
from billable input and re-billed at the cached rate, falling back to the
input rate when no cached rate exists; a premium-tiered cache write with no
rate for its tier surfaces as a disclosed partial miss rather than pricing
as input. Each of these is a place two
implementations plausibly disagree — which is exactly why there must be one.

## When not to use it

- **Single-model, single-lane systems** — a builder metering its own product
  against one model needs a constant and a multiplication, and importing this
  machinery adds surface without adding truth.
- **When the provider's invoice is available per-call.** Reported actuals
  outrank computed estimates; resolution then serves cross-checking and
  forecasting, not the ledger of record, and its misses are reconciliation
  items rather than nulls in the product.
