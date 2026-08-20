---
layer: technique
type: technique
subject: llm-price-book-operations
technique: price-row-variant-encoding
status: forged
laws: []
shared_with: []
use_when: [modeling batch/flex/priority lanes, adding prompt-length tier pricing, avoiding a schema migration per provider pricing feature]
---

# Price-row variant encoding

Provider pricing keeps sprouting dimensions: a batch lane at half rate, a
cheap variable-latency lane, a premium fast lane, a long-context band above an
input threshold, dated model snapshots. The schema-first instinct — a column
or a table per dimension — buys a migration, a write-endpoint change, and a
resolution-code change for every gimmick a provider ships. Variant encoding
refuses the churn: **a modifier is part of the row key, not part of the
schema.** A tier, a lane, or a snapshot is just another row in the same table,
written through the same endpoint, listed by the same query.

## The encoding

Rows are keyed `provider/model`, and the model segment may carry a suffix
modifier with a small, closed grammar:

| Row key (model part)  | Meaning |
|-----------------------|---------|
| `some-model`          | base / standard rate |
| `some-model@in>200000` | prompt-length tier: applies when input tokens exceed the threshold |
| `some-model@batch`    | batch-lane rate |
| `some-model@flex`     | flex / discounted-lane rate |

Three properties make this an encoding rather than a hack:

- **The grammar is closed and parsed, not pattern-matched.** A fixed sigil
  (`@`), a short enum of modifier kinds, numeric thresholds parsed strictly.
  Anything unparseable is an ordinary model name that happens to contain the
  sigil — it prices as itself or misses honestly; it never half-applies.
- **A variant row is a complete rate card.** It carries its own input, output,
  and cached rates. It is not a delta or a multiplier over the base row —
  multipliers rot the moment a provider changes one lane's rate independently
  (they do), and a self-contained row can be read, audited, and corrected
  without dereferencing anything.
- **Variants inherit the whole row lifecycle for free.** Effective dates,
  source links, hot-swap, provenance listing — because a variant *is* a row,
  every operational affordance built for rows covers it with zero extra code.

## Compose only one level deep

The modifier grammar deliberately does not nest. A batch row is a flat rate;
it does not additionally apply prompt-length tiers; there is no
`@batch@in>200000`. This is a decision rule, not a limitation to apologize
for: when a provider genuinely prices a lane×tier cell differently, you define
that cell as its own row *if you have traffic in it* — and mostly you do not.
Every level of composition multiplies the states the resolution function must
be tested against, and a price book's defect budget is better spent on
verifying the rows you have than on machinery for rows nobody hits. Define
the variants you actually need; let the rest fall back to base.

The corollary that does compose: **cached-token discounts are orthogonal to
variants.** The cached rate rides inside every row's rate card, so a batch row
with a cached rate applies both — matching how providers actually stack cache
and lane discounts — without the grammar knowing anything about it.

## Decision rules

- **When a provider adds a pricing dimension, first ask: can it be a suffix on
  the model key?** If the dimension is selected per-call from call facts
  already in the event (lane declared, input size measured), yes. If it
  requires new facts the event does not carry, the event contract is the thing
  to extend — not the price schema.
- **When a modifier needs a parameter, put the parameter in the key** (the
  tier threshold lives in the row key, so two tiers are two rows and the
  resolution picks among them). Parameters in a side column re-open the schema
  the encoding exists to close.
- **When variant rows for one model exceed a handful, stop and re-check the
  provider's page** — you are probably transcribing a matrix the provider
  publishes as multipliers, and transcribing every cell invites transcription
  error. Transcribe the cells your traffic hits; leave the rest unbilled into
  base-rate fallback, and record the non-coverage in the book's declared
  caveats.

## When not to use it

- **Per-tenant or negotiated pricing.** Contract rates vary by *customer*, not
  by call shape; encoding tenant identity into the model key conflates two
  axes and breaks every aggregate keyed by model. Negotiated rates deserve a
  real dimension.
- **When the modifier set is genuinely combinatorial and populated.** If real
  traffic spreads across lane×tier×snapshot cells that all price differently,
  key-suffix encoding degrades into stringly-typed schema; promote the
  dimensions into columns and keep the closed grammar for what remains.
- **Anything resolution cannot decide from the call itself.** A variant only
  earns its key if the resolution function can pick it deterministically from
  `(provider, model, input size, lane)`. A row that needs human context to
  select is configuration, not pricing.
