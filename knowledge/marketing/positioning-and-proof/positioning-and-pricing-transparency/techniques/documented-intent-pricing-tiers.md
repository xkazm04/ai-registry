---
layer: technique
type: technique
subject: positioning-and-pricing-transparency
technique: documented-intent-pricing-tiers
status: forged
laws: [never-invent-proof, a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [publishing a pricing page before billing exists, deciding what the call to action on an unpurchasable tier should be, setting the trigger for a pricing revisit, disclosing a tier whose headline is "unlimited via your own key"]
---

# Documented-intent pricing tiers

A product that is free during validation still publishes its pricing page,
because a buyer who ranks transparent pricing as their first demand leaves a
site without one. What it publishes is **documented intent**: the tier table
as the business currently intends it, with the paid tiers marked as coming
and the condition for their arrival stated, no fake checkout or mail link
where a purchase would be, and the free tier carrying the product's whole
first path with a real button into the app.

## Procedure

1. **Publish the tiers as a table** in the order and with the names the plan
   catalogue holds. If a tier's price is a hypothesis, the page copy may say
   so; a hypothesis on a page is honest, a hypothesis in a checkout is not.
2. **Key the call to action off the price, not the tier name.** The tier
   whose price is zero gets the primary button into the product. Every other
   tier gets a dashed, non-interactive state - "coming after validation" - and
   nothing else: no mail link, no waitlist form pretending to be a purchase,
   no payment gateway that returns an error. A mail link where a button
   belongs tells the buyer the product is a portfolio piece; a user-
   acceptance run with a sceptical buyer persona recorded exactly that as a
   purchase-intent blocker.
3. **Make the free tier carry the whole flow.** Its feature list opens with
   the product's actual first path for a stranger - for a marketing product,
   the no-budget channel plan - and continues through the paid-side loop on
   demo or live data. A free tier that cannot demonstrate the value case is a
   demo with a price of zero, and the buyer knows it.
4. **Let every number arrive from the metering.** Limits and prices reach the
   copy through placeholders filled from the plan catalogue, and a test fails
   if a digit is typed into a feature line. A pricing page may not quote a
   limit the product does not enforce; the derivation mechanism belongs to
   `honest-proof-and-illustrative-data` and is consumed here.
5. **State the limit's basis.** Daily limits say "daily" and name the clock
   ("counted in UTC"), because a buyer at a different longitude will
   otherwise hit the reset at the wrong hour and call it a bug.
6. **Disclose fallback caps in the same sentence as the headline.** When a
   tier's headline is unlimited generation through the buyer's own model key
   and the listed cap is only what the business funds when the key is missing
   or failing, write "fallback on our key: N per day" - not "N per day".
   Reading the listed number as the plan's cap under-sells the plan; hiding
   it over-sells it. Both are lies of framing.
7. **State the revisit trigger, tied to activation.** "Pricing is re-evaluated
   after roughly N organically activated projects" - people who connected an
   account and returned - is observable; "in the third quarter" is not.
8. **Keep the metering live** even while free, so free never means unbounded
   spend on the business's model budget; the disclosure in step 6 depends on
   it being true.

## Decision rules

- When billing does not exist, no surface offers a way to pay, because a
  purchase path that cannot complete is an invented proof of purchasability
  ([never invent proof](../../../_laws.md#never-invent-proof)).
- When a tier's call to action is decided, decide it on `price === 0`, not on
  the tier's identifier, because "the plan that costs nothing" is the real
  condition and it follows the catalogue if the split changes.
- When a price was set by reasoning rather than by asking buyers, label it
  illustrative in the working document and let the page's copy say the
  paid tiers "show where pricing is headed", because an anchor is a
  hypothesis until a willingness-to-pay reading exists
  ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- When a willingness-to-pay study is run, run one per clearly defined tier
  or use a trade-off method across tiers, because the standard price-
  sensitivity survey is documented as applying to a single offer at a time.
- When the revisit trigger fires, the re-pricing is a proposal reviewed
  against observed usage, not an edit to the catalogue, because a price
  change is a change to money and passes the gate
  ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).
- When a commitment - self-hosting, an open licence - shares the page with the
  tiers, it gets its own band with a not-functional-yet status and no numbers,
  because it has nothing in the catalogue to drift from and must not borrow
  the tiers' credibility.

## Thresholds and what they rest on

The activation count for the revisit is convention: a low double-digit
number of organically activated projects is the practitioner's habit for a
product with no prior customers, and no study fixes it. The tier count of
three is convention. That buyers demand a visible price is a published
measurement, repeated yearly by review marketplaces. That a price-sensitivity
survey applies to a single offer is the method's own documentation.

## When NOT to use

- A product with billing live: the tiers are purchasable and the "coming"
  state is a lie in the other direction; use an ordinary pricing page and
  keep only the derivation and disclosure rules.
- Enterprise-only sales where the price genuinely depends on a scoping
  conversation; publish the pricing model and a range rather than a table of
  intent, and say why there is no number.
- A pre-launch page with no product behind the free button; documented intent
  presupposes a free tier a visitor can enter today, and without one the page
  is a waitlist and should say so.
