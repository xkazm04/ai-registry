---
layer: application
type: application
subject: margin-and-unit-economics
technique: pricing-what-if-simulation
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: read-only pricing what-if over real windowed cost (LightTrack)

LightTrack's `GET /v1/margin/simulate` recomputes per-key margin under a
hypothetical price model. The pure recompute is
`crates/core/src/margin_sim.rs`; the endpoint contract is documented in
`docs/MARGIN.md:31-51`. Together they realize the technique's whole contract.

## Real cost, hypothetical revenue, actuals alongside

`compute_margin_simulation` (`margin_sim.rs:86-131`) starts by running the
**actuals** through the identical machinery the `/v1/margin` endpoint uses —
`let actual = compute_margin(revenue, costs, dim, since, until)` (line 98) —
then maps each actual row into a `SimRow` that keeps `llm_cost_usd`,
`actual_revenue_usd`, `actual_margin_usd` and overlays
`simulated_revenue_usd = price_per_mtok · tokens/1e6 + flat_monthly · proration`
(`hypothetical_revenue`, lines 135-142, broken out as a separately
unit-testable pure function). `margin_delta_usd = simulated − actual`
(line 125) is the per-key uplift. Deriving the key set from the actuals run
(comment at lines 95-97: token keys are a subset of cost keys) guarantees the
simulated and actual views cover the identical population.

Rows sort by **simulated** margin ascending (line 129) — "the key that would
still lose money surfaces first," the loss-first ordering applied to the
hypothetical world.

## Assumptions echoed, empty hypothesis rejected

`SimAssumptions::new` (`margin_sim.rs:44-62`) returns
`Err("at least one of `price_per_mtok` or `flat_monthly` is required")` when
both prices are absent — the API maps this to a 400 rather than serving an
all-keys-negative zero-revenue "simulation". The struct itself is `Serialize`
and is echoed in the response, including `window_days`, the proration basis,
so `flat_monthly · window_days / 30` is reproducible by hand
(`PRORATION_MONTH_DAYS = 30.0`, line 19). The module doc (lines 1-8) states
the read-only stance: "Nothing here writes — it is decision support," and the
response carries `"simulated": true` (`docs/MARGIN.md:43-44`), verified by a
render-layer test asserting actual and simulated columns with a signed delta
(`crates/render/src/margin.rs:264-269`).

## The documented weakness — stated, not hidden

`docs/MARGIN.md:45-47`: the flat fee applies "per dimension key present in
the window, **including** the aggregate `unattributed` bucket … so a
per-customer flat fee is approximate there. The token-metered term is exact
per key." The repo writes its approximation into the endpoint's own contract
doc instead of leaving the reader to discover that many untagged customers
collapsed into one flat fee.

A second honest-degradation note (`docs/MARGIN.md:53-68`): on the store
backend that has not ported `tokens_by_dimension`, the simulate endpoint
returns zero metered revenue (flat terms still apply) — "a documented handoff,
not a bug," rather than an error or a silently fabricated number.

## Upward lessons taken from this repo

Two sharpened the draft. First, **carry the actual as a delta, not just a
column**: the draft had actual-beside-simulated; the repo's `margin_delta_usd`
makes the uplift itself first-class and signable ("negative = worse",
`margin_sim.rs:65`). Second, **validate the empty hypothesis in the pure
core**, not the HTTP layer — `SimAssumptions::new` owns the rejection, so any
future caller (CLI, scheduled report) inherits it.
