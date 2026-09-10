---
domain: civic-intelligence
subject: public-money-attribution
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# public-money-attribution

## Architecture review - 2026-09-09

Read all ten owned documents. Corrected amount attribution, lower-bound conditions and ownership-state claims. Historical Node applications expose permissive unknown-attribution gaps; their code, named cases, legal-form codes, amounts and incidents require reverification. No consumer runtime or witness date refresh.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-money-attribution",
  "date": "2026-09-09",
  "baseline": "78850ba5",
  "digest": "sha256:008cb29b407f7ba3",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "An observed payment of 100 with an unread refund of 80 is not a lower bound on net 20.",
    "One award naming two suppliers can be double-counted even after entity deduplication.",
    "A public 1% shareholder does not establish public control; an empty holder list does not establish private ownership.",
    "Another official owning an entity does not convert a steward relationship into ownership; current ownership does not prove historical receipt."
  ],
  "sources": [
    {
      "url": "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-Beneficial-Ownership-Legal-Persons.html",
      "scope": "Primary 2023 guidance landing page; not national legal applicability or public-access verification."
    },
    {
      "url": "https://standard.openownership.org/en/0.4.0/standard/concepts.html",
      "scope": "Primary BODS 0.4 concepts, direct and indirect relationship statements."
    },
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/reference/",
      "scope": "Primary amount, transaction and direction distinctions; no consumer schema conformance test."
    }
  ],
  "documents": {
    "public-money-attribution.md": {
      "disposition": "clarify",
      "reason": "Replace personal-enrichment and automatic-floor claims with scoped amount, identity, time and evidence contracts."
    },
    "techniques/floor-versus-total-disclosure.md": {
      "disposition": "clarify",
      "reason": "Correct automatic lower-bound inference and heuristic cap detection; preserve upstream slice coverage."
    },
    "techniques/owner-operator-vs-steward-split.md": {
      "disposition": "clarify",
      "reason": "Remove income inference and negative class predicate; preserve person-specific mixed ties and unresolved states."
    },
    "techniques/attribution-perimeter.md": {
      "disposition": "clarify",
      "reason": "Distinguish indirect control evidence from association and scope from a proved lower bound."
    },
    "techniques/entity-level-deduplication.md": {
      "disposition": "clarify",
      "reason": "Scope deduplication by person/time and distinguish entity identity from transaction and amount reconciliation."
    },
    "techniques/public-body-classification.md": {
      "disposition": "clarify",
      "reason": "Separate shareholding, control, historical status and empty/partial ownership evidence."
    },
    "techniques/citable-money-claims.md": {
      "disposition": "clarify",
      "reason": "Require amount and snapshot verification, not only reviewed ties or live recomputation."
    },
    "applications/node--entity-level-deduplication.md": {
      "disposition": "reverify",
      "reason": "Retain dated witness while identifying concrete contract gaps requiring consumer reverification."
    },
    "applications/node--public-body-classification.md": {
      "disposition": "clarify",
      "reason": "Retain dated witness while identifying concrete contract gaps requiring consumer reverification."
    },
    "applications/process--attribution-perimeter.md": {
      "disposition": "clarify",
      "reason": "Replace broad legal/tool landscape assertions with bounded primary references and explicit transfer limits."
    }
  }
}
```
