---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: product-plan-service-routing
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The kind routes held and the pause rule stopped at the product route

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`), Node 24 per `package.json` engines. Anchors: the union and its
predicates in `src/lib/catalog/offering.ts` (`OfferingKind`, `isActiveProduct`,
`toProducts`), the kind routes in `src/lib/catalog/load.ts` (`loadPlansFor`,
`loadServicesFor`) and `src/lib/catalog/resolve.ts` (`plansFor`, `servicesFor`), and the
local-page grounding in `src/lib/local-signals/page-grounding.ts`
(`buildLocalPageRequest`).

## What the tree already does the technique's way

The offering model is a discriminated union on `kind`, and each variant carries only its
own fields: stock and velocity on the product, interval, rivals and differentiators on
the plan, price model and service areas on the service. Every consumer the run read
enters through a kind route. The outbound shopping feed reads live products only. The
blended margin skips non-products. The feed import merges products and passes plans and
services through untouched. The brand context derives the business's nature by
consensus over active offerings, and "hybrid" when they disagree. Procedure steps 1, 2
and 5 and the import decision rule all held on reading.

## The seam chosen to falsify it

Step 3 says the adapter is the seam where the active filter lives, and the tree did that:
`toProducts` drops a paused product. The question was whether the other two routes, which
need no adapter, carried the same filter. A caught outcome would show that the technique
places the pause rule on one kind's route only, and that a tree following it exactly
leaks the other two. It did. `plansFor` and `servicesFor` (and their store-backed twins)
filtered on kind alone, and the local-page grounding read raw services. So a plan the
user paused still seeded "vs {rival}" comparison queries. A paused service still filled
the service-by-locality coverage matrix, the location roster and the inbox and diagnosis
grounding. A local page requested for a paused service took its price and price model
from the paused row.

## A and B

The same fixture ran through the real store-backed loaders and their consumers: one live
and one paused plan, each with a named rival, and one live and one paused service in one
locality. A: unchanged routes. B: `isActivePlan` and `isActiveService` beside
`isActiveProduct`, used at the four route functions and the local-page grounding.

- Target: paused rows reaching a route, A 3 of 3 (plan route, service route, local-page
  grounding), B 0. The paused rival appears in no query and the paused service in no
  coverage cell; the live rows are unchanged in both arms.
- Floor: four new tests, red on A and green on B. The neighbouring grounding, demo
  portfolio, comparison and active-product tests (28 together) stay green. Typecheck,
  lint, the tool-contract snapshots and the LLM static gate are green. The unit suite
  runs 4387 of 4391 on B against 4383 of 4387 on the clean base, with the same single
  unrelated red (an embeddings test that needs credentials).

The demo seeds carry no paused plan or service, so the demo surfaces are unchanged.

## What this realization cannot do

The pause is the only state the routes now honour. A plan or service with no localities,
no rivals or a zero price still passes through, and each consumer decides what to do with
it. Nothing measures how often a real tenant pauses a plan or a service. The catalog
editor still reads every row on purpose, because it is where a pause is undone.
