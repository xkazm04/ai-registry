---
layer: golden-path
type: golden-path
subject: llm-price-book-operations
status: forged
use_when: [pricing multi-provider model traffic, designing a cost-metering price table, correcting a wrong model price, shipping a binary that must price events out of the box]
techniques:
  - price-row-variant-encoding
  - price-resolution-order
  - embedded-seed-fallback
  - hot-swap-price-book
  - price-provenance-and-staleness
  - no-retroactive-repricing
---

# LLM price book operations

Every system that meters model spend contains a price table somewhere. In a
builder's own product, it is often a constant next to the call site — one
model, two rates, updated when someone remembers. This subject is the other
thing: a **versioned, database-backed, multi-provider price book operated as
production infrastructure**. Many providers, dated model variants, discount
lanes, an administrative write path, and — the part that separates
infrastructure from a lookup table — explicit temporal semantics for what a
price change does and does not touch.

The distinction matters because the price book sits under everything the
observability product asserts. Cost dashboards, budget caps, margin reports,
model-comparison verdicts: all of them are multiplications of token counts by
rows in this table. A wrong row does not produce an error; it produces
confident, plausible, wrong money. The book is therefore held to accounting
standards, not configuration standards.

## Provider pricing is a structure, not a number

The naive price book is `model → (input rate, output rate)`. The field stopped
looking like that years ago, and a book that models less than the field
under-prices systematically — always in the direction that flatters the
dashboard. What a current multi-provider book must be able to express:

- **Discount and premium lanes.** Batch processing at roughly half rate with a
  relaxed latency contract; a "flex"-style cheap lane with variable latency; a
  priority lane at a multiple of standard. These are *per-call* choices, not
  per-model facts — the same model bills differently depending on which lane
  the request declared.
- **Prompt-length tiers.** Above a provider-declared input threshold, the
  request moves to a higher band — and characteristically the *entire* request
  reprices, not just the tokens past the threshold. A book that applies the
  standard rate to long-context traffic is wrong on exactly the most expensive
  calls.
- **Cached-token rates.** Cache *reads* bill at a small fraction of the input
  rate (a tenth is typical); cache *writes* bill at a premium over it, and
  the premium is **tiered by cache lifetime** — short-TTL and long-TTL writes
  are distinct priced classes. Cached tokens must be deducted from billable
  input and re-billed at their own class rate, and the discounts stack with
  lane discounts — a batch call still gets its cache discount. Some cache
  offerings add a non-token line entirely (storage per token-hour held).
- **Dated variants and aliases.** Providers ship dated snapshots of a model
  and rename lanes without breaking old names. The book must resolve an
  event's reported model string to a priced row through a declared alias
  policy, not string luck.

The design answer this subject teaches is not a wider schema per lane — it is
[variant rows](techniques/price-row-variant-encoding.md): modifiers encoded in
the row key so that a tier, a lane, or a dated snapshot is just another row,
managed through the same write endpoint, with a
[deterministic resolution order](techniques/price-resolution-order.md)
deciding which row a given call actually pays.

## Load-bearing distinctions

**The seed is not the source of truth.** A price book ships as a seed document
so a fresh install prices events on day one — but the operating copy lives in
the database, where the admin write path updates it. The seed is read once;
after that, editing it does nothing, and the system should say at boot which
source it actually loaded, because an operator who edits the wrong one gets
silently stale prices. Where installs may run from bare binaries with no
config directory at all, the seed is also
[compiled into the binary](techniques/embedded-seed-fallback.md) — because the
alternative, an empty book, does not fail; it prices everything at null, which
downstream reads exactly like "this model is free".

**Resolution is not storage.** Rows are dumb; the intelligence lives in one
resolution function that takes `(provider, model, input size, lane)` and
returns either a row or an honest miss. Every consumer — ingest costing, cap
evaluation, dashboards — goes through it. Two resolution paths is how two
surfaces disagree about what a call cost.

**A miss is null, never zero.** An unpriced model produces a null cost with
its own accounting (how many events, which models), not a zero. Zero is a
measurement; null is an admission. This is the single most defended invariant
in the subject, because every failure mode above — empty book, missed variant,
stale alias — degrades *into* the unpriced state, and the unpriced state is
only safe if it is visible.

**A correction is not a restatement.** Prices in the book change; costs
already stamped onto events do not. When an operator fixes a wrong row, the
fix applies from now on — spend already inside a budget window stays as it was
stamped, the window stays wrong until it rolls, and the system's own
documentation says so out loud. This is
[no-retroactive-repricing](techniques/no-retroactive-repricing.md), and it is
the temporal boundary that makes the book *accounting* rather than a cache of
opinions: numbers that can change after the fact are not records. The one
deliberate asymmetry: traffic that was *unpriced* at ingest carries no stamp,
so its imputed charge is recomputed at evaluation time and self-corrects the
moment a price lands — the stamped and the imputed live under different rules,
and both rules are stated.

**Live updates are forward-only swaps.** New prices should take effect without
a restart — a provider price cut at noon should not price the afternoon at
morning rates because nobody scheduled a deploy. But
[hot-swapping the book](techniques/hot-swap-price-book.md) is an atomic
replace-the-whole-book operation behind a lock, stamped with a server-side
effective date, applying only to events not yet stamped. The hot path and the
correction boundary are the same design decision seen from two sides.

## The book is a claim about the world, and the world moves

Provider pricing pages change without notice: rates cut, lanes renamed, tiers
introduced, models deprecated. A price book is therefore a *dated claim*, and
[provenance and staleness](techniques/price-provenance-and-staleness.md) are
first-class: every row carries where it came from and when it took effect; the
seed declares its unit, its currency, when it was last verified against the
provider pages, and — critically — what it deliberately does not model. A
book that says "tiers for these models are not modeled; verify before trusting
cost dashboards" is more trustworthy than one that says nothing, because the
reader learns the estimate's limits from the artifact itself. An unverified
book older than a provider's typical repricing cadence is a stale instrument,
and the honest posture is to surface that age, not to let a last-verified date
from two quarters ago sit silently under a live margin report.

## Failure modes of the naive reading

- **The free-model illusion.** An empty or unseeded book prices every event at
  null; dashboards render the traffic as costless; nobody notices until the
  invoice does. Absence must announce itself — at boot, in aggregates, in cap
  evaluations.
- **Constant drift.** Rates hardcoded at call sites, updated per incident,
  disagreeing with each other. One book, one resolution function, one write
  door.
- **Flat-rate flattening.** Ignoring lanes, tiers, and cached rates and
  calling it an approximation. The errors are not symmetric noise; they bias
  low on batch-heavy and long-context traffic, which is precisely the traffic
  cost-conscious teams route deliberately.
- **Retroactive repricing.** "Fixing" history when a row was wrong, silently
  changing last month's reported spend. Once numbers can be restated, no
  report is citable and no alert threshold means anything.
- **Schema-per-feature churn.** A migration for every new provider pricing
  gimmick. Variant rows absorb the field's churn into data.
- **Unbounded cleverness in resolution.** Fuzzy matching model names until
  everything resolves to *something*. A wrong price is worse than a null one;
  the alias policy is narrow, declared, and testable.

## The techniques

- [price-row-variant-encoding](techniques/price-row-variant-encoding.md) —
  tiers, lanes, and snapshots as modifier-keyed rows in the same table, one
  composition level deep, no schema change.
- [price-resolution-order](techniques/price-resolution-order.md) — the one
  deterministic function from call facts to row: lane variant, then highest
  exceeded tier, then base, then alias trim; miss means null.
- [embedded-seed-fallback](techniques/embedded-seed-fallback.md) — a
  compiled-in book behind the on-disk seed, so a bare-binary install never
  prices at null; seed source reported at boot; the embedded copy tested at
  build time.
- [hot-swap-price-book](techniques/hot-swap-price-book.md) — the admin write
  path: upsert a row, rebuild the whole book, swap atomically behind a lock,
  forward-only.
- [price-provenance-and-staleness](techniques/price-provenance-and-staleness.md)
  — effective dates, source links, unit and currency declarations,
  last-verified stamps, and declared non-coverage.
- [no-retroactive-repricing](techniques/no-retroactive-repricing.md) — cost
  stamped once at ingest; corrections apply forward; windows stay wrong until
  they roll; only imputed charges self-correct, and the caveat ships with the
  product.
