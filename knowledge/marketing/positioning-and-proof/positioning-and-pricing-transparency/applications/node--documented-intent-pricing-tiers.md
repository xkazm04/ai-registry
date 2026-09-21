---
layer: application
type: application
subject: positioning-and-pricing-transparency
technique: documented-intent-pricing-tiers
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Documented-intent pricing in a plan catalogue, its derived rows and a derivation test

The Adamant workspace at `systedo-case`, commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08), publishes a three-tier pricing page at `/cena` while the product is free
during validation and no billing is wired. The pricing content lives in three pure
modules plus one test, and the composition proves two structural facts the technique
states: the free tier's call to action is keyed off `price === 0`, and the fallback-cap
disclosure rule is written into the catalogue as a typed presentation kind, not left to
copywriters.

## The catalogue is the only place a plan IS

`src/lib/plans.ts:20-30` holds `PLANS`, the enforced daily limits per tier (`free`
25/50/5, `pro` 1000/1000/100, `byom` 25/50/5 for AI evaluations, syncs and image
generations). `src/lib/plans.ts:135-140` holds `PLAN_INFO`: order, name, monthly CZK
price and the featured flag - `free` 0, `byom` 125, `pro` 490 featured. The file
header (`:1-5`) says why it is pure: the public pricing page and the in-app usage meter
import limits and labels without pulling the server persistence library into a browser
bundle. `PLAN_INFO`'s comment (`:115-125`) records that it "deliberately carries NO
marketing copy" after a cs-only tagline/features pair drifted from what the page
rendered.

Deviation the technique names: the price anchors are guesses. `:137` reads
`// ~5 USD/měsíc ≈ 125 Kč`, and `:116-117` says "Price is illustrative for the case
study (no billing is wired)". No willingness-to-pay reading exists in the tree. The
page copy does what the technique allows - the subheading at `src/app/cena/page.tsx:31-32`
says the paid plans "show where pricing is headed" - but the anchor is convention and
the workspace's own docs (`PRODUCT.md:80-88`) do not label it as such.

## Rows are derived, and a test pins the derivation

`src/components/marketing/pricing/planRows.ts:1-22` states the rule in its header:
"a price, a plan, an order or a daily limit on the pricing page is a claim about
`src/lib/plans.ts`". `planRows(locale, fmtInt)` at `:128-148` maps `PLAN_INFO` and
fills `{aiEval}` / `{sync}` / `{image}` placeholders from `PLANS[plan.id]` through the
caller's integer formatter (`:144`). The hand-written part is only the words:
`PLAN_COPY` (`:39-125`) in two locales, colocated with the component.

`test-unit/pricing-plan-rows.test.mjs` pins the relationship, and its header (`:1-14`)
names the failure it guards: "a page that renders perfectly while quoting a price the
billing seam no longer charges or a daily limit the metering no longer enforces ... a
stale number is still a string." Its assertions: the row set IS `PLAN_INFO` in order
(`:26-35`); name, price and featured come from the catalogue and the price equals
`planPriceCzk()` so the account page and the pricing page cannot disagree (`:37-49`);
exactly one plan is featured and exactly one is free (`:51-58`). The comment on the
last (`:54-56`) is the structural fact: "PricingPlans picks it by price rather than by
id - so 'exactly one plan costs nothing' is a load-bearing property of the catalogue,
not a coincidence."

## The CTA is keyed off the price

`src/components/marketing/pricing/PricingPlans.tsx:67-85` renders the button. Line 67
branches on `plan.priceCzk === 0`; the free branch is a link into `/app` with the
primary button style, and the comment (`:68-73`) says why the key is the price: "the
plan that costs nothing is the real condition, and it follows lib/plans.ts if the split
changes." The paid branch (`:75-83`) is a dashed, non-interactive band reading
"Coming after validation" (`:21`, `:28`), with the comment "no mailto, no payment seam,
just an honest state". The page's disclaimer (`src/app/cena/page.tsx:34-35`, `:45-46`)
states the basis: paid plans not live, no gateway wired, nothing charged, "Limits are
daily and counted in UTC".

This is the repair of a recorded incident. `uat/runs/2026-07-07-L1-postphases/findings.json:29-48`
(UAT-L1-02, severity blocker, dimension Trust) found the earlier page telling every
visitor it was a case study with paid CTAs as `mailto:` links, and the code check
recorded that it "directly confirms the buyer's 'portfolio not product' pet peeve and
kills purchase intent". The buyer persona whose bar it failed is
`uat/characters/marek-prospective-buyer.md:29` ("Pricing is transparent - visible
tiers/prices ... no 'contact us' wall").

## The fallback-cap disclosure is a type, not a sentence

`src/lib/plans.ts:23-29` explains the `byom` numbers: the headline is unlimited AI
generation delivered at runtime because a call served by the user's own key skips
metering; the listed 25/50/5 are only the app-funded fallback when the key is missing
or failing. `:60-71` turns that into `aiAllowanceKind(plan)` returning
`"capped" | "unlimited-via-own-key"`, with the sentence the technique quotes: "Reading
that number as the plan's cap under-sells the plan; hiding it over-sells it." The
pricing copy honours it - `planRows.ts:82-84` (cs) and `:120` (en) write the BYOM
tier's cap as "Fallback generation on our key: {aiEval} per day" rather than as a limit,
under the comment "Honest disclosure" - and `planEntitlement()` (`:84-105`) carries
`aiAllowance` to any surface that states a user's plan.

## The free tier carries the flow, and the commitment band carries no numbers

`planRows.ts:52-56` opens the free tier's feature list with the no-budget visibility
plan, with the comment: it "is the one thing the product does for someone who has never
bought a click, so it leads the free tier". `src/components/marketing/pricing/SelfHostBand.tsx:1-8`
states the self-host commitment "with the same honesty pattern as the paid tiers", a
status chip "In preparation - self-hosting is not functional yet" (`:20`), and "No
numbers here on purpose - there is nothing for it to drift from `lib/plans.ts`".

The revisit trigger is documented at `PRODUCT.md:86-88` as "roughly 10 organically
activated projects" - an activation count, not a date - which is the technique's rule;
the count is convention and the document does not say so.
