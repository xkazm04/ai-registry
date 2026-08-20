---
layer: application
type: application
subject: llm-price-book-operations
technique: price-resolution-order
stack: rust
status: forged
---

# Price resolution in LightTrack (Rust)

LightTrack's price book is `crates/core/src/pricing.rs`: a `PriceBook` map
keyed `"<provider>/<model>"`, built either from the seed JSON
(`from_json_str`) or from persisted `ModelPriceRow`s (`from_rows`, `:99-114`)
out of the `model_prices` table (`schema/sqlite/001_init.sql:204-213`, which
carries `effective_date` and `source_url` per row). Every cost the system
stamps flows through one function, `cost_usd_mode` (`:156-174`), which first
resolves a row and then does the arithmetic — the one-resolver property the
technique demands.

## Variant rows and the order

Variants are encoded in the model key with no schema change
(`pricing.rs:64-74` doc comment): `<model>@in>N` for prompt-length tiers,
`<model>@batch` / `<model>@flex` for lanes. `PricingMode::parse` (`:46-52`)
maps free-form lane hints — `"batch"`, `"flex"`, and `"priority"` as a synonym
for flex — to an enum, anything else to standard, so an unknown lane string
can never fail a call.

`resolve_exact` (`:195-226`) implements the order exactly as the technique
states it:

1. mode suffix first — a `@batch`/`@flex` row wins when present, else fall
   through;
2. then the highest exceeded `@in>N` tier: it scans keys under the
   `"<provider>/<model>@in>"` prefix, parses `N` strictly, and keeps the
   largest threshold with `input_tokens > n` (`:211-220` — strict
   greater-than, so a call exactly at the threshold prices at the band
   below);
3. else the base row.

The alias step wraps it: `resolve` (`:178-193`) retries once on
`trim_date_suffix` (`:237-245`), which strips a trailing `-YYYYMMDD` only if
the tail is exactly 8 ASCII digits — the narrow, declared alias policy, one
trim, one retry. `docs/PRICING.md:21-29` documents the same three steps for
operators, including the composition bound: "Tiers and mode variants compose
only one level deep (a `@batch` row is a flat rate; it does not also apply
`@in>N` tiers). Define the variants you actually need."

## Cached tokens and the null miss

`cost_usd_mode` (`:163-173`) deducts cached tokens from billable input
(`saturating_sub`), bills them at `cached_input_per_mtok`, and falls back to
the plain input rate when no cached rate exists — the discount is orthogonal
to the variant grammar, riding inside every row's rate card. A full miss
returns `None`, never zero; the caller stamps a null cost.

## How a call declares its lane

`docs/PRICING.md:47-59`: the event carries `metadata.pricing_mode = "batch" |
"flex" | "standard"` or a tag (`"batch"`, `"flex"`/`"priority"`) — no new
event column, mirroring the no-new-schema posture on the price side.

## The edges are pinned by tests

The regression tests (`pricing.rs:295-352`) enumerate exactly the
disagreement-prone edges the technique lists: `prompt_length_tier` asserts
100k input prices at the base rate and 300k at the `@in>200000` rate;
`batch_variant_and_fallback` asserts the `@batch` row wins in batch mode,
standard uses base, and **flex with no `@flex` row falls back to standard
base** rather than erroring; `date_suffix_fallback` pins the alias trim;
`unknown_model_is_none` pins the null miss; `computes_cost_with_cache`
(`:264-278`) pins the cached-deduction arithmetic to the cent.

## Confirmations and one deviation

Confirmed against the standard: single resolver, closed order, lane→tier→base
→alias, strict thresholds, conservative lane fallback, null on miss, narrow
alias policy, tested edges. One deviation worth noting: `PriceBook::rows`
(`:117-133`) stamps `effective_date: Utc::now()` when flattening the seed for
DB insertion — seed rows get "now" rather than the seed's own last-verified
date, so a freshly seeded install's provenance overstates how current its
rates are. The standard's row-level-provenance posture would carry the seed's
verification date through.
