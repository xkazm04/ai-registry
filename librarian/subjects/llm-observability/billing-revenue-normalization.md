---
domain: llm-observability
subject: billing-revenue-normalization
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# billing-revenue-normalization

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/billing-revenue-normalization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d598e936e7f82f8d",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A corrected invoice snapshot arrives first and an old snapshot arrives last; unconditional upsert restores the old amount.",
    "A missing-rate amount of 100 units stored as 100 USD is dimensionally wrong even when a caveat is displayed.",
    "A new debit-reversal kind defaulted to one-time revenue changes both sign and recognition.",
    "A cumulative refund updated in a later month overwrites the timing of an earlier partial refund."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/billing-revenue-normalization",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://docs.stripe.com/webhooks",
      "scope": "Official snapshot, unordered delivery, duplicate handling and fresh retry signature semantics checked; no webhook executed."
    },
    {
      "url": "https://docs.stripe.com/currencies",
      "scope": "Official provider-specific currency and payout/charge exceptions checked; no payment reconciliation performed."
    },
    {
      "url": "https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md",
      "scope": "Primary specification confirms signed message identity and symmetric/asymmetric variants; broad market and accounting claims not refreshed."
    }
  ],
  "documents": {
    "billing-revenue-normalization.md": {
      "disposition": "reverify",
      "reason": "Stable identity does not eliminate reconciliation, ensure ordering or prevent revaluation on replay. Delivery/event/object identities differ; multiple refunds and lines need their own grain. Authentic tracked events can still fail schema, authorization or persistence. Original amounts and conversion provenance must be retained; operational normalization does not establish formal recognition."
    },
    "techniques/deterministic-external-ids.md": {
      "disposition": "reverify",
      "reason": "Provider alone may not namespace connected accounts, tenants and test/live environments. Charge-keyed cumulative refunds lose individual refund periods; distinguish immutable refund facts from current charge snapshots. Random internal ids plus unique external keys are valid. Natural keys can collide, and identity stability does not imply stable content."
    },
    "techniques/idempotent-revenue-upsert.md": {
      "disposition": "clarify",
      "reason": "Repaired last-arrival-wins under unordered snapshots, idempotent effects versus object updates, version checks, durable inbox recovery and finite provider retry assumptions."
    },
    "techniques/minor-unit-currency-handling.md": {
      "disposition": "reverify",
      "reason": "Minor unit is an accounting representation, not necessarily smallest circulating coin. Provider field/operation/version may differ from ISO; zero/two/three are not an exhaustive currency universe. Reject unknown semantics instead of defaulting; exact decimal/integer storage and rounding policy matter. One example per class cannot pin every mapping forever."
    },
    "techniques/revenue-kind-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown kinds becoming positive immediate revenue, missing periods, mixed invoice lines, cumulative refunds and signed amounts doctrine. Operational allocation is explicitly separate from formal recognition."
    },
    "techniques/signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Authentication must also bind expected account/environment/endpoint and validate schema/authorization after signature. Malformed authentic tracked events can fail. Header encoding and signed components are scheme-specific; subtraction/abs can overflow on hostile timestamps. Rotation follows actual provider signing behavior, not assumed old-signature retry horizons; message signatures can complement other transport auth."
    },
    "techniques/static-auditable-fx-book.md": {
      "disposition": "clarify",
      "reason": "Repaired missing rates as null base amounts, persisted conversion state/book identity, replay stability, dated policies and reproducible corrections. A static process singleton does not preserve historical provenance across deployment changes."
    },
    "applications/process--signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained. Standard Webhooks supports signed identity and symmetric/asymmetric variants; Stripe issues fresh timestamp/signature per retry, narrowing old-key rotation rationale. Acquisition claims, universal 24-48-hour practice, short-lived-key adoption and formal revenue-recognition equivalence were not refreshed and remain reverify."
    },
    "applications/rust--signature-is-the-auth.md": {
      "disposition": "reverify",
      "reason": "Historical code/version/date retained, not rerun. Malformed JSON and normalization can reject authentic events; missing future-boundary, timestamp-overflow, multiple-signature and rotation cases preclude every-property claim. Raw-body MAC checks are appropriate but do not establish account-scoped ledger authorization."
    },
    "applications/rust--static-auditable-fx-book.md": {
      "disposition": "reverify",
      "reason": "Historical code/version/date retained, not rerun. 1:1 unknown currency is not USD; current-book convertibility can relabel an old unconverted record after restart. Rates must be finite, and provider-specific amount semantics may differ from the displayed ISO lists. Per-row original amount/rate/version persistence is not shown, so every-claim-confirmed is unsupported."
    }
  }
}
```
