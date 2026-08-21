---
layer: application
type: application
subject: plan-entitlements
technique: price-book-authority
stack: process
verified_on: 2026-08-20
---

# A price contract, a drift detector, and a constant that refuses to lie

The realization here is half doctrine and half code: a named contract written
where the duplicate lives, an automated reconciliation that reports rather
than fixes, and a hand-set flag that keeps interface copy honest about what
the payment integration can actually do.

## The contract, stated at the duplicate

`src/lib/plans.ts:5-12` is the technique's first rule executed literally — the
duplication is named at the definition of the duplicate:

> PRICE CONTRACT … what a buyer is CHARGED is whatever the Polar product
> mapped via `POLAR_PLAN_PRODUCTS` costs — Polar is the price book. The
> `monthlyPrice` values below are DISPLAY-ONLY duplicates … a price change in
> the Polar dashboard MUST be mirrored here in lockstep or /pricing advertises
> a stale number and buyers are charged something else at checkout.

And the line that makes it a craft lesson rather than a comment: *"(The old
header claimed 'no dollar amounts are invented here', which hid this
hazard.)"* The previous version of this file asserted safety it did not have.
Replacing a claim of safety with a named hazard plus a detector is the whole
move. The per-field comment repeats it where a reader would inline the number
(`:45-48`).

## The detector: reports, does not fix

`src/lib/price-drift.ts` fetches the live price of every product mapped by
`POLAR_PLAN_PRODUCTS` and compares it against the tier's advertised
`monthlyPrice`. Four properties match the technique clause for clause:

- **It compares by product identifier**, iterating the plan-product mapping,
  so a tier without a price mapping is not silently skipped.
- **Fetch failures are a separate field.** `PriceDriftReport` (`:39-46`) keeps
  `errors` out of `mismatches` on purpose, with the reasoning recorded: "a
  network blip is not evidence of a price change, and conflating the two would
  train the operator to ignore drift."
- **An unpriceable product is itself a finding.** `PriceMismatch.polarUsd`
  (`:34-36`) is null "when the product carries no comparable fixed USD price
  at all (free/custom/metered pricing — itself a drift worth surfacing)", and
  `productMonthlyUsd` (`:53-60`) narrows the wide price union structurally
  rather than assuming a shape.
- **It is honest about being a detector**: the header calls it "a detector,
  not a fixer; the mirror edit here is still manual" (`plans.ts:11-12`).

The deviation from the standard is the placement. It fires on demand from an
operator route (`GET /api/kpi → priceDrift`), chosen explicitly so it "can
never break builds, dev, or any customer-facing path". That is a defensible
trade, but the technique's rule is that a detector runs where a failure is
*seen* — a check nobody opens is a script. The standard stays: this belongs in
the test suite or a scheduled check that pushes its finding, not behind a
human deciding to look.

## The granted amount is looked up, never received

`src/lib/polar.ts:5-8` states the server-authoritative rule for what a
purchase confers:

> The grant AMOUNT is derived here from the PRODUCT purchased
> (server-authoritative, the pack map), never from anything the client sends —
> so a crafted checkout can't pay for a small pack and then claim a large
> credit grant.

`creditsForProduct` (`:53-56`) and `planProducts` (`:71-80`) are the two
mappings — product to quantity, product to tier — and both are read by the
webhook *and* the purchase interface, so what is offered and what is granted
come from one catalog. `planProducts` skips entries whose plan is not a known
tier identifier (`:77`), which keeps an environment typo from minting a tier
that no gate recognizes.

## The constant that keeps the copy honest

`src/components/org/shared/CreditsControl.autorecharge.ts:1-30` is the
money-copy rule in one exported boolean. The integration is hosted checkout
plus signed webhook; nothing stores a payment method, so a genuine
"auto-recharge" cannot fire. Rather than ship it, the module ships the part
that is real — an opt-in threshold, a pre-emptive low-balance warning, a
one-click top-up prompt — and states the reason: shipping "a charging path
that silently never fires" is "strictly worse than nothing on a money
surface".

`AUTO_RECHARGE_CHARGES_AUTOMATICALLY = false` (`:27-30`) is exported
specifically "so the UI copy is single-sourced with reality", with the
instruction to flip it only when a real off-session charge path lands and to
gate every "we will top up for you" string on it. One flag, one flip, every
sentence follows.
