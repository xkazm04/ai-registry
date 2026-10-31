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

**Applications (stacks: node):** node--custom-labels-as-bidding-buckets, node--days-of-cover-pacing-rules, node--dispatch-delay-truth-per-feed, node--paused-sku-never-advertised, node--product-plan-service-routing, node--usps-become-ad-benefits.

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

## 2026-10-22 - apply: usps-become-ad-benefits (run intake-apply-usps-1022)

- First application, `code`, `better`, ab-paired on systedo-case. The ad request, the
  typed claims object and the blank-fragment filter held on reading. The deterministic
  floor still invented proofs through its fallbacks: filler headlines for a short USP
  list, and preorder and restock promises for an unavailable product. Filler lines:
  A 30/240, B 0/216, with no empty or over-limit assets.
- Application: `node--usps-become-ad-benefits`. One decision rule added: an omission
  can empty a packed asset, so the blank filter runs on the asset too.
- Project commits sit on pushed branch cur/usps-floor. Master waits on the base suite's
  single red (patterns-embeddings).
- Owed: still single-stack. gigs, the fleet's only other marketing project, has no
  catalog or ad-copy seam. The keyless demo generator is a second unfixed instance. A
  selling point that is itself an availability claim is not checked.

## 2026-10-31 - architecture review

First review. Platform help refutes one load-bearing claim: the comparison marketplace shows only a zero delay as in stock, and 1-3 days as a separate "within 3 days" band. Four clarify items follow from that and from an overlapping row in the pacing ladder table.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/product-feed-and-catalog-spine",
  "date": "2026-10-31",
  "baseline": "51cada741",
  "digest": "sha256-b2:a3b662e8ac949570",
  "disposition": "clarify",
  "trigger": "pending since forge (2026-09-09); first architecture review",
  "intended_benefit": "one offering model feeds every ad, feed, label and pacing surface, so a pause, a stock fact or a margin cannot disagree across them",
  "failure_if_ignored": "paused or unshippable items advertised, fabricated delivery promises in comparison feeds, labels disagreeing with the stock screen, a feed's unknown-zero pausing every ad",
  "boundary": "owns the offering model and its projections into feeds, labels and pacing; not ad writing (responsive-search-ad-craft), anti-fabrication (grounded-marketing-generation), profitability (profit-on-ad-spend-economics) or spend moves (budget-reallocation-prescription)",
  "coverage": "All 13 documents decided (golden path, 6 techniques, 6 node applications). External availability claims checked against the shopping platform's and the comparison marketplace's help pages. Application code citations not re-read this run. Still single-stack.",
  "counterexamples": [
    "A Heureka DELIVERY_DATE of 2 is orderable but not 'skladem': treating it as in stock on an ad or label would claim more than the marketplace shows.",
    "A single-kind shop with one consumer does not need the discriminated union; a flat product table with an active flag is the right size.",
    "A low label on an item still truly in stock must not omit it from the enumerated feed: pacing is a bid instruction, availability is a separate decision.",
    "An item with one day of sales history yields a cover figure that is not yet measurable; pausing on it acts on a single order."
  ],
  "sources": [
    {
      "source": "Google Merchant Center Help, product data specification: availability [availability] (support.google.com/merchants/answer/6324448), read 2026-10-31",
      "result": "Supports the enumerated values: 'In stock [in_stock]', 'Out of stock [out_of_stock]', 'Preorder [preorder]', 'Backorder [backorder]', and 'Provide the availability date [availability_date] attribute if you submit [preorder] or [backorder]'; unmet minimum requirements mean 'we disapprove of your product'."
    },
    {
      "source": "Heureka.cz merchant help, XML feed specification, DELIVERY_DATE (sluzby.heureka.cz/napoveda/xml-feed/), read 2026-10-31",
      "result": "Supports: value is 'Dodaci doba produktu ve dnech' counted to dispatch; 0 is shown as 'skladem'; long-term unavailable items 'nesmi byt uvadeny' in the feed; a YYYY-MM-DD date for preorders; the availability feed refreshes every 10 minutes against 2-4 hours for the main feed. REFUTES the claim that 0-3 is shown as in stock: 1-3 is displayed as 'do 3 dnu' (within 3 days), a separate band from 0."
    },
    {
      "source": "Mergado help, Heureka element DELIVERY_DATE; Seznam Sklik/Zbozi.cz help pages (search results), read 2026-10-31",
      "result": "Corroborates: 'If the product is in stock, DELIVERY_DATE is 0'; values 1 to 3 are shown as 'Within 3 days'. Zbozi.cz help treats 0 as in stock and DELIVERY_DATE as mandatory. No source found that counts 1-3 as in stock, so an orderable cutoff of 3 is a convention aligned with the first display band."
    }
  ],
  "documents": {
    "product-feed-and-catalog-spine.md": {
      "disposition": "clarify",
      "reason": "Spine, routing, seam filter, field ownership and labels hold. 'The marketplace treats short delays as in stock' is refuted by the marketplace's own help: 0 is 'skladem', 1-3 is a separate 'within 3 days' band. 'Three feed serializers' overstates the stack application, where one serializer writes both comparison feeds; say three feeds."
    },
    "techniques/custom-labels-as-bidding-buckets.md": {
      "disposition": "keep",
      "reason": "Five custom-label slots is the shopping platform's documented feature; cutoffs are labelled convention; derive-never-recompute and the coarse-bucket argument are sound and match the application."
    },
    "techniques/days-of-cover-pacing-rules.md": {
      "disposition": "clarify",
      "reason": "The ladder table presents 'at risk' as a status row over 'pause line to warning line', which overlaps the 'low' row (pause line to trim line) and gives the same cover two contradictory actions. The application shows at-risk is a flag inside the low band (7-14 days), not a fifth status; the label technique's four stock states agree. Table should say so."
    },
    "techniques/dispatch-delay-truth-per-feed.md": {
      "disposition": "clarify",
      "reason": "Omit-where-no-true-value, tri-state parsing, the availability_date requirement and the fast availability feed are all confirmed by the platforms' help. 'The marketplace's own catalog treats a short delay as in stock' is refuted: only 0 is shown as in stock."
    },
    "techniques/paused-sku-never-advertised.md": {
      "disposition": "keep",
      "reason": "One flag, two writers, filter at the adapter, the narrow-row-shape rule from the 2026-10-14 application, and the verification fixture are coherent; no unstable external claim."
    },
    "techniques/product-plan-service-routing.md": {
      "disposition": "keep",
      "reason": "Discriminated union, route-at-entrance, consensus nature and the every-route active filter added 2026-10-22 are coherent with the golden path and application."
    },
    "techniques/usps-become-ad-benefits.md": {
      "disposition": "keep",
      "reason": "Benefit versus proof line, typed claims, blank filter on fragments and assets, and the availability line are coherent. A selling point that is itself an availability claim (the application's open boundary) is not yet a decision rule; banked, not a defect."
    },
    "applications/node--custom-labels-as-bidding-buckets.md": {
      "disposition": "keep",
      "reason": "Anchored at a pinned commit with line citations; claims are structural and match the technique. Not re-read against the tree this run; verified_on left."
    },
    "applications/node--days-of-cover-pacing-rules.md": {
      "disposition": "keep",
      "reason": "Anchored at a pinned commit; the atRisk flag and the three named deviations are explicit. Not re-read against the tree this run."
    },
    "applications/node--dispatch-delay-truth-per-feed.md": {
      "disposition": "clarify",
      "reason": "'Values 0-3 shown as in-stock ... the parser's cutoff is a fact and not a convention' is refuted by Heureka's help (1-3 shows as 'within 3 days'); the tree's behaviour (reading 1-3 as orderable) stays sound but the cutoff is a convention aligned to the first display band. The generate.ts deviation should point at the 2026-10-22 usps application, which removed those fallbacks on a branch."
    },
    "applications/node--paused-sku-never-advertised.md": {
      "disposition": "keep",
      "reason": "An ab-paired application record with its seam, arms and unchanged consumers stated; it names no commit or files, which weakens re-verification but does not make a claim wrong."
    },
    "applications/node--product-plan-service-routing.md": {
      "disposition": "keep",
      "reason": "Pinned to a dated master tip with named anchors and paired measurements; consistent with the technique's added rule."
    },
    "applications/node--usps-become-ad-benefits.md": {
      "disposition": "keep",
      "reason": "Pinned with named anchors and paired measurements; the boundary it exposed landed as a technique decision rule."
    }
  }
}
```

## 2026-10-31 - re-record after apply

The four clarify items were applied (golden path, the dispatch and pacing techniques, the dispatch application); the record below is against the new digest. The applications list above now names the sixth application.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/product-feed-and-catalog-spine",
  "date": "2026-10-31",
  "baseline": "51cada741",
  "digest": "sha256-b2:3e9f428e02bedf5a",
  "disposition": "keep",
  "trigger": "re-record after applying this run's clarify items",
  "intended_benefit": "one offering model feeds every ad, feed, label and pacing surface, so a pause, a stock fact or a margin cannot disagree across them",
  "failure_if_ignored": "paused or unshippable items advertised, fabricated delivery promises in comparison feeds, labels disagreeing with the stock screen, a feed's unknown-zero pausing every ad",
  "boundary": "owns the offering model and its projections into feeds, labels and pacing; not ad writing (responsive-search-ad-craft), anti-fabrication (grounded-marketing-generation), profitability (profit-on-ad-spend-economics) or spend moves (budget-reallocation-prescription)",
  "coverage": "All 13 documents decided against the post-apply digest; the four clarify items were applied from sources opened this run and from the application's own code description. No owed clarify remains. Single-stack debt is a reconcile matter, not a review item.",
  "counterexamples": [
    "A Heureka DELIVERY_DATE of 2 is orderable but not 'skladem': treating it as in stock on an ad or label would claim more than the marketplace shows.",
    "A single-kind shop with one consumer does not need the discriminated union; a flat product table with an active flag is the right size.",
    "A low label on an item still truly in stock must not omit it from the enumerated feed: pacing is a bid instruction, availability is a separate decision.",
    "An item with one day of sales history yields a cover figure that is not yet measurable; pausing on it acts on a single order."
  ],
  "sources": [
    {
      "source": "Google Merchant Center Help, product data specification: availability [availability] (support.google.com/merchants/answer/6324448), read 2026-10-31",
      "result": "Supports the enumerated values: 'In stock [in_stock]', 'Out of stock [out_of_stock]', 'Preorder [preorder]', 'Backorder [backorder]', and 'Provide the availability date [availability_date] attribute if you submit [preorder] or [backorder]'; unmet minimum requirements mean 'we disapprove of your product'."
    },
    {
      "source": "Heureka.cz merchant help, XML feed specification, DELIVERY_DATE (sluzby.heureka.cz/napoveda/xml-feed/), read 2026-10-31",
      "result": "Supports: value is 'Dodaci doba produktu ve dnech' counted to dispatch; 0 is shown as 'skladem'; long-term unavailable items 'nesmi byt uvadeny' in the feed; a YYYY-MM-DD date for preorders; the availability feed refreshes every 10 minutes against 2-4 hours for the main feed. REFUTES the claim that 0-3 is shown as in stock: 1-3 is displayed as 'do 3 dnu' (within 3 days), a separate band from 0."
    },
    {
      "source": "Mergado help, Heureka element DELIVERY_DATE; Seznam Sklik/Zbozi.cz help pages (search results), read 2026-10-31",
      "result": "Corroborates: 'If the product is in stock, DELIVERY_DATE is 0'; values 1 to 3 are shown as 'Within 3 days'. Zbozi.cz help treats 0 as in stock and DELIVERY_DATE as mandatory. No source found that counts 1-3 as in stock, so an orderable cutoff of 3 is a convention aligned with the first display band."
    }
  ],
  "documents": {
    "product-feed-and-catalog-spine.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the comparison marketplace now 'shows zero as in stock and a delay of one to three days as a separate within-three-days band'; 'three feed serializers' now reads 'the serializers for three feeds'."
    },
    "techniques/custom-labels-as-bidding-buckets.md": {
      "disposition": "keep",
      "reason": "Five custom-label slots is the shopping platform's documented feature; cutoffs are labelled convention; derive-never-recompute and the coarse-bucket argument are sound and match the application."
    },
    "techniques/days-of-cover-pacing-rules.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the at-risk row is now an early-warning flag inside the low band ('warning line and below, within low'), with a sentence saying it is a flag and not a fifth status."
    },
    "techniques/dispatch-delay-truth-per-feed.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'treats a short delay as in stock' now reads 'shows only a zero delay as in stock and a short delay as its next, still orderable band'."
    },
    "techniques/paused-sku-never-advertised.md": {
      "disposition": "keep",
      "reason": "One flag, two writers, filter at the adapter, the narrow-row-shape rule from the 2026-10-14 application, and the verification fixture are coherent; no unstable external claim."
    },
    "techniques/product-plan-service-routing.md": {
      "disposition": "keep",
      "reason": "Discriminated union, route-at-entrance, consensus nature and the every-route active filter added 2026-10-22 are coherent with the golden path and application."
    },
    "techniques/usps-become-ad-benefits.md": {
      "disposition": "keep",
      "reason": "Benefit versus proof line, typed claims, blank filter on fragments and assets, and the availability line are coherent. A selling point that is itself an availability claim (the application's open boundary) is not yet a decision rule; banked, not a defect."
    },
    "applications/node--custom-labels-as-bidding-buckets.md": {
      "disposition": "keep",
      "reason": "Anchored at a pinned commit with line citations; claims are structural and match the technique. Not re-read against the tree this run; verified_on left."
    },
    "applications/node--days-of-cover-pacing-rules.md": {
      "disposition": "keep",
      "reason": "Anchored at a pinned commit; the atRisk flag and the three named deviations are explicit. Not re-read against the tree this run."
    },
    "applications/node--dispatch-delay-truth-per-feed.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the platform paragraph now quotes 0 as in stock and 1-3 as 'within 3 days', and calls the parser's cutoff of 3 a convention aligned with the first display band; the generate.ts deviation now notes the 2026-10-22 usps application removed those fallbacks on a branch. verified_on unchanged (code citations not re-read)."
    },
    "applications/node--paused-sku-never-advertised.md": {
      "disposition": "keep",
      "reason": "An ab-paired application record with its seam, arms and unchanged consumers stated; it names no commit or files, which weakens re-verification but does not make a claim wrong."
    },
    "applications/node--product-plan-service-routing.md": {
      "disposition": "keep",
      "reason": "Pinned to a dated master tip with named anchors and paired measurements; consistent with the technique's added rule."
    },
    "applications/node--usps-become-ad-benefits.md": {
      "disposition": "keep",
      "reason": "Pinned with named anchors and paired measurements; the boundary it exposed landed as a technique decision rule."
    }
  }
}
```
