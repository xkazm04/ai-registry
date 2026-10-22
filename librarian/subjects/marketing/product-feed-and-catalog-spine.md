---
subject: product-feed-and-catalog-spine
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-ppsr-1022 (apply)
dry_streak: 0
---

# product-feed-and-catalog-spine

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** designing the offering model an ad or feed pipeline reads from, deciding what a shopping or price-comparison feed may say about availability, choosing feed labels for bidding, pausing or scaling ads on stock cover, reconciling a product feed with a warehouse export

**Techniques (6):** custom-labels-as-bidding-buckets, days-of-cover-pacing-rules, dispatch-delay-truth-per-feed, paused-sku-never-advertised, product-plan-service-routing, usps-become-ad-benefits.

**Applications (stacks: node):** node--custom-labels-as-bidding-buckets, node--days-of-cover-pacing-rules, node--dispatch-delay-truth-per-feed, node--paused-sku-never-advertised, node--product-plan-service-routing.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## 2026-10-22 - apply: product-plan-service-routing (run intake-apply-ppsr-1022)

- First application, `code`, `better`, ab-paired on systedo-case. The union, the kind
  routes, the outbound feed, the import and the consensus nature all held on reading.
  The plan and service routes filtered on kind only, so a paused plan seeded comparison
  queries and a paused service filled the coverage matrix and grounded local pages.
  Paused rows reaching a route: A 3/3, B 0. Live rows unchanged.
- Application: `node--product-plan-service-routing`. One decision rule added to the
  technique: every kind's route carries the active filter, not only the adapted product
  route. It sits beside `paused-sku-never-advertised` and covers the other two kinds.
- Project commits sit on a pushed branch. Master waits on the base suite's single red
  (patterns-embeddings), measured on a clean base before the arms ran.
- Owed: still single-stack. Rows with no localities, no rivals or a zero price pass the
  routes, and each consumer decides what to do with them.
