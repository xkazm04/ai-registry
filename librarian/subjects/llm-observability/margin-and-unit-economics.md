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

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 10
owned documents read in full: the golden path, six techniques, three
applications. The recognition function the rust application cites was opened in
the local tracklight tree.

**Retraction.** The earlier 2026-09-10 record's dispositions are retracted as an
outstanding work list and retained above as history; its repairs were part of the
pass reverted the same day.

**The finding that would justify a content change: the refunded subscription.**
`revenue-recognition-rules` states four rules. Rule 1 amortizes a periodic event
linearly over period ∩ window. Rule 3 makes a refund negative revenue in the
window it occurs, explicitly refusing to claw back a *prior* window, on
no-retroactive-restatement grounds. Neither rule says anything about the
*future* windows of the periodic event a refund cancels — and because
recognition is a pure function of one event, and a refund is normalized as its
own namespaced record rather than as a mutation of the charge (the sibling
subject's `revenue-kind-taxonomy` requires exactly that), the original event
keeps amortizing. An annual prepayment refunded in month two therefore books its
negative lump in month two and then recognizes a twelfth of a payment that no
longer exists in each of months three through twelve. I opened
`crates/core/src/margin.rs:139-168` in the tree: `recognized_amount` matches on
`(period_start, period_end)` and amortizes whenever `pe > ps`, with the refund
branch only flipping the sign — the behaviour is exactly what the technique
describes, so this is the standard's gap, not the implementation's.

The refusal to restate is right and should stay. What is missing is a rule for
the open side: either recognition truncates a periodic event's period when a
full refund cancels it (a forward-looking change, not a restatement), or the
technique states plainly that the phantom tail is accepted and visible in the
trend. The document's own proration paragraph gestures at the mechanism —
"represent the change as the billing system does" — but a refund event is not a
period correction, and the paragraph does not say so.

**Two findings this note already banked on 2026-08-23 that are still owed.** The
external reconcile against LiteLLM produced two technique-edit candidates and
neither has landed in the reverted bytes. First, `cogs-by-construction`'s
justification is still the weaker one: it argues from "every future teammate
must re-remember the filter", where the tree supplies the stronger reason — the
discriminator was computed and applied on the very next line, and then died in a
daily aggregate whose unique key has no origin dimension. A rollup is a lossy
write; a read-time predicate has a shelf life of one aggregation pass. Second,
the golden path's "Which costs count" paragraph still does not warn that the
cost term can silently contain a *revenue* term: LiteLLM's `_apply_cost_margin`
adds a configured markup and returns it as the value that becomes the stored
spend, with the pre-markup figure surviving only in metadata that the same
aggregate discards. Both are single-sighted, both are backed by executed
evidence recorded in the application, and both remain unlanded.

**Not evaluated.** No margin computation was run and no A/B rerun. The LiteLLM
tree (`f005afa1`, v1.99.0) was not re-opened and the seven executed
`completion_cost` cases were not re-executed. The gross-margin benchmark bands
in the golden path and in `margin-erosion-forecasting` ("high-seventies to
eighty-percent" for classic software, "fifties to seventies" for
inference-backed products) carry no citation in either document and were not
resolved this run; they are the same class of unreachable evidence I flagged in
`judge-calibration-and-drift`, and they are load-bearing for the twenty-percent
thin band that three documents in this bundle key on.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/margin-and-unit-economics",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:855a43399693409e",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full against the reverted bytes. The recognition function cited by the rust application was opened in the local tracklight tree and its behaviour at the refund boundary traced. Not evaluated: any margin computation or A/B rerun; the LiteLLM tree at f005afa1 and its seven executed completion_cost cases; the gross-margin benchmark bands, which carry no in-document citation.",
  "counterexamples": [
    "An annual prepayment refunded in month two: the refund books in month two, and the original periodic event keeps recognizing a twelfth of a cancelled payment in each of months three through twelve. Rule 3 forbids restating the past and no rule governs the future.",
    "A customer whose margin is thin only because the cost column carries a configured markup — the cost term contains revenue — reads as at-risk on the loss-first ranking, and no document in the subject warns that the cost term can be impure.",
    "A dense daily series with explicit zeros cannot distinguish 'no traffic that day' from 'the ingest pipeline was down that day'; the technique names this as a disclosure problem and hands it to no one."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/tracklight",
      "result": "Read at d398835. crates/core/src/margin.rs:139-168 confirms recognized_amount amortizes any event whose period_end exceeds period_start across period-intersect-window, with the refund kind only flipping the sign — so a refund does not truncate the periodic event it cancels. Confirms the technique describes the implementation accurately; the gap is in the standard. Nothing was built or executed."
    }
  ],
  "documents": {
    "margin-and-unit-economics.md": {"disposition": "clarify", "reason": "The two-stream impedance framing, the term-by-term policy decisions, the ranking-not-report stance and the simulation contract all hold. Two repairs, both banked by this note's own external reconcile and still unlanded: the 'Which costs count' paragraph does not warn that the cost term can contain a revenue term (a resale proxy's markup written into the stored spend), and the benchmark bands it quotes carry no citation a reader can follow while three documents key a threshold on them."},
    "techniques/below-filter-honesty.md": {"disposition": "keep", "reason": "The two-arm predicate with its idle-row guard, the three shapes to test, and the echo-the-predicate rule are precise and each names the incident it prevents. The 'below 0 equals negative dollars plus undefined-percentage losers' identity is stated as a testable invariant, which is the right form."},
    "techniques/cogs-by-construction.md": {"disposition": "clarify", "reason": "The segregate-at-write-time rule and its three decision rules are right and the dual-use tiebreaker was confirmed independently in the LiteLLM tree. Its justification remains the weaker one — someone forgets the filter — where this subject's own application supplies the stronger and more general one: a rollup is a lossy write, so a discriminator absent from an aggregate's grouping key does not exist downstream, no matter how faithfully the filter was applied upstream."},
    "techniques/loss-first-ordering.md": {"disposition": "keep", "reason": "Dollars-not-percentage is argued from both failure directions (the tiny customer at -400%, and the revenueless rows a percentage sort must exclude or fabricate), and the capping rules — rank by absolute margin, compute totals before truncating, disclose the cut — are stated with the spreadsheet bug they prevent."},
    "techniques/margin-erosion-forecasting.md": {"disposition": "keep", "reason": "The per-day instrument's three construction rules, the three erosion shapes, and the decision rules (fit cost and revenue separately, never smooth the stored series, the unattributed key's rising slope means linkage erosion not economics) are coherent and operational. Its thin-band threshold inherits the uncited benchmark band flagged on the golden path."},
    "techniques/pricing-what-if-simulation.md": {"disposition": "keep", "reason": "The five-clause contract — real cost, actual alongside, announce in the payload, read-only, reject the empty hypothesis — is complete, and the three known weaknesses are disclosed where the consumer meets them rather than in documentation. Confirmed as realized in the rust application, including validation living in the pure core."},
    "techniques/revenue-recognition-rules.md": {"disposition": "clarify", "reason": "Rules 1, 2 and 4 and the one-implementation-many-surfaces discipline are sound, and the sum-of-daily-equals-monthly test is the right invariant. Rule 3 is under-specified at its most common real case: it forbids clawing back a prior window and says nothing about the future windows of the periodic event a refund cancels, so a refunded annual prepayment keeps recognizing a twelfth of itself for the rest of its period. Traced in the tree; the implementation matches the rule as written."},
    "applications/python--cogs-by-construction.md": {"disposition": "keep", "reason": "The strongest application in this group: it carries executed evidence (seven completion_cost cases plus an end-to-end payload capture), locates the defect at a named line pair, and converts it into a sharpening of the technique rather than a repair of the code. Its markup-in-the-cost-column section is the source of an unlanded golden-path finding. Not re-executed this run."},
    "applications/rust--pricing-what-if-simulation.md": {"disposition": "keep", "reason": "Maps the technique's contract clause by clause onto the endpoint, including the documented approximation for the unattributed bucket and the honest degradation on a backend that has not ported token-by-dimension. The two upward lessons (delta as first-class, validation in the pure core) are visible in the cited module."},
    "applications/rust--revenue-recognition-rules.md": {"disposition": "keep", "reason": "The recognition function was opened this run and matches the document, including the abs-before-negate refund guard and the pub(crate) sealing that forces the trend to reuse it. The six worked business cases are a faithful encoding of the rules — and their coverage is also where the refunded-subscription gap shows: refund_reduces_recognized_revenue tests a point charge, never a refunded periodic one."}
  }
}
```
