---
subject: margin-and-unit-economics
domain: llm-observability
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# margin-and-unit-economics

First touch: [[2026-08-23-6]], external reconcile against `BerriAI/litellm`
@ `f005afa` (v1.99.0). Gained `python--cogs-by-construction` (uncovered);
single-stack debt cleared. The weak hint turned out strong: the tree ships a
purpose-built apparatus discriminator (InternalCallOrigin) and a markup side
the hint said did not exist - both hint sub-claims refuted in the tree's
favor. Executed evidence: seven completion_cost cases including the
end-to-end null-to-0.0 coercion.

## The sharpest sightings

- The daily rollup zeroes the COUNTERS for internal calls and passes the
  DOLLARS through, and the aggregate's unique key has no origin dimension -
  the discriminator dies in one aggregation pass, irreversibly.
- The tag dimension survives aggregation but both internal paths hole it:
  the classifier inherits the production tag of the request it classified;
  judge spend lands untagged.
- Unknown cost: block at the calculator, null at the logging object, 0.0 at
  every consumer - a CONFIRMING SIGHTING for the bundle law
  nullable-never-zero. Sharpest variant: a model present in the price book
  but priced in the wrong units returns a clean 0.0 with no debug info.

## Technique-edit candidates (single-sighted, banked)

- cogs-by-construction's justification is understated: not "someone forgets
  the WHERE" but "a rollup is a lossy write - a discriminator absent from the
  aggregate's grouping key does not exist downstream; segregate at write time
  or carry the dimension into every rollup."
- Markup-in-the-cost-column: a resale proxy writes COGS plus a revenue term
  into one float; the golden path's term-decision section does not warn that
  the cost term can contain revenue. Candidate paragraph or technique.

## Open leads

- below-filter-honesty: undefined cost has NO representation here, so the
  two-arm predicate is unbuildable - want a counterpart that models nullable
  cost.
- Cold-storage retention of the metadata-only discriminators untraced.
- budget_reservation.py (1,410 lines) unread - a breach-alerting counterpart.

## Cross-subject proposals

- software-engineering/cost-metering: "a metering discriminator must live in
  the aggregate's grouping key, not in a JSON blob on raw rows" - generalizes
  past LLM spend; a second-wave seam on the same clone.
- llm-price-book-operations: partial-price entries (input priced, output
  free) are a case no technique covers; a rich counterpart on this pin.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/margin-and-unit-economics",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:07c5d1290beab92a",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Large positive margins can occupy every absolute-value top-N slot and hide smaller losses.",
    "A refund event carries an original annual service period; unconditional period logic spreads it instead of placing it on refund day.",
    "An unavailable token query returning zero makes missing usage look like a no-usage customer."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/margin-and-unit-economics",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
      "scope": "Primary standard summary ties recognition to satisfaction of performance obligations and appropriate progress measures, not universal payment-date or straight-line rules. No entity-specific accounting conclusion."
    }
  ],
  "documents": {
    "margin-and-unit-economics.md": {
      "disposition": "reverify",
      "reason": "Inference contribution margin is not a complete P&L or universal gross-margin definition. Revenue timing follows obligations, not payment shape alone; refunds and credits require policy. Missing attributed cost makes reported margins optimistic, not lower bounds. Simulations can legitimately vary costs and revenue with explicit assumptions; market margin bands and inevitable erosion are unverified generalizations."
    },
    "techniques/below-filter-honesty.md": {
      "disposition": "reverify",
      "reason": "Undefined percentage can reflect negative revenue or missing evidence, not only zero revenue. The below-zero identity fails if negative denominators are allowed. Including known zero-revenue losses is a declared risk-cohort extension, not literal percentage comparison; missing margin cannot become a confirmed loss. Filtering/totals/pagination scopes all need disclosure."
    },
    "techniques/cogs-by-construction.md": {
      "disposition": "clarify",
      "reason": "Repaired universal production-inference-only COGS and physically separate stores as sole correctness mechanism. Distinguish contribution margin from financial cost classification, preserve purpose through aggregation and enforce canonical views."
    },
    "techniques/loss-first-ordering.md": {
      "disposition": "reverify",
      "reason": "Absolute-value top-N can hide every loss when profits are larger, conflicting with loss-first triage. Choose cap according to purpose and preserve other/totals disclosure. Thin-margin thresholds are business-specific; percentages and alternate server-side sorts can be legitimate."
    },
    "techniques/margin-erosion-forecasting.md": {
      "disposition": "reverify",
      "reason": "No events does not establish zero without coverage and lateness bounds. Erosion is not inevitable; lower prices, caching and usage changes can reverse it. Rising unattributed spend suggests linkage failure but does not prove it. Thirty-day/two-week thresholds and separate slope fits are examples; uncertainty, seasonality and demand response matter."
    },
    "techniques/pricing-what-if-simulation.md": {
      "disposition": "clarify",
      "reason": "Repaired fixed-cost-only as universal simulation rule, per-key flat fees on unidentified populations and unsupported token query returning zero. Preserve hypotheses and baseline without treating them as future actuals; isolated scenario storage is legitimate."
    },
    "techniques/revenue-recognition-rules.md": {
      "disposition": "clarify",
      "reason": "Repaired missing/invalid periods as point revenue, universal straight-line recognition/refund timing, currency mixing and absence of correction lineage. Operational allocation must be labeled and reconciled to the applicable recognition policy."
    },
    "applications/python--cogs-by-construction.md": {
      "disposition": "reverify",
      "reason": "Historical LiteLLM code/probes retained, not rerun. Null-to-zero and lossy purpose/markup aggregation are concrete concerns as displayed, but internal-call origin alone does not classify COGS: a production routing classifier can be delivery cost. A purpose-preserving aggregate or governed view can be correct without physically separate stores. Search results remain scoped."
    },
    "applications/rust--pricing-what-if-simulation.md": {
      "disposition": "reverify",
      "reason": "Historical Rust simulation retained, not rerun. Unsupported tokens as zero is missing evidence, not honest degradation merely because documented. Unattributed bucket has unknown customer count; a single flat fee invents a billing unit. Existing key set does not capture future customers, demand or churn; explicit scope limits remain."
    },
    "applications/rust--revenue-recognition-rules.md": {
      "disposition": "reverify",
      "reason": "Historical Rust recognition retained, not rerun. A refund with a period appears amortized by displayed control flow, contradicting prose that refunds always land at occurrence. abs on every non-refund can turn credit adjustments positive. Invalid-period fallback and 1:1 currency conversion misstate evidence; private visibility does not prevent duplicate implementation."
    }
  }
}
```
