---
domain: civic-intelligence
subject: political-compass-from-votes
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# political-compass-from-votes

## Architecture review - 2026-09-09

Read all ten owned documents. Corrected model and evidence boundaries; historical application dates remain unchanged. Consumer code, fixture execution, incident replay, group membership/quorum, UI semantics and answer privacy remain open verification leads.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/political-compass-from-votes",
  "date": "2026-09-09",
  "baseline": "78850ba5",
  "digest": "sha256:8ff9a05b199fc9c4",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "One disagreement over two comparable questions versus two over ten reverses raw-distance and agreement ordering.",
    "Three answers with a half-overlap floor admits two votes; zero answers also needs an explicit guard.",
    "Two yes votes and eighteen absences can produce a misleading group line without quorum.",
    "A partial round favors earlier theme buckets; missing confidence does not mandate retention."
  ],
  "sources": [
    {
      "url": "https://link.springer.com/article/10.1057/ap.2013.30",
      "scope": "Primary abstract: model sensitivity in the studied StemWijzer sample."
    },
    {
      "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164184",
      "scope": "Primary abstract and authors: question polarity experiment."
    },
    {
      "url": "https://link.springer.com/chapter/10.1007/978-3-031-70381-2_23",
      "scope": "Primary abstract: adaptive questionnaire experiment; no replication."
    }
  ],
  "documents": {
    "political-compass-from-votes.md": {
      "disposition": "clarify",
      "reason": "Narrow neutrality, model equivalence, reliability and inferred group-position claims."
    },
    "techniques/comparability-floor-for-ranking.md": {
      "disposition": "clarify",
      "reason": "Replace a universal half-overlap/three-answer prescription with explicit count, coverage and zero-input guards."
    },
    "techniques/matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "State the binary equivalence assumptions with a counterexample and remove categorical rejection of adaptive methods."
    },
    "techniques/non-positional-abstention-handling.md": {
      "disposition": "clarify",
      "reason": "Preserve unknown versus absence and qualify group-line inference."
    },
    "techniques/divisive-vote-selection.md": {
      "disposition": "clarify",
      "reason": "Correct validity, confidence and reproducibility boundaries."
    },
    "techniques/theme-balanced-drawing.md": {
      "disposition": "clarify",
      "reason": "Disclose partial-round preference, taxonomy choices and repeated-bill correlation."
    },
    "techniques/disclosed-scoring-rule.md": {
      "disposition": "clarify",
      "reason": "Scope study claims and distinguish deterministic computation from privacy and semantic consistency."
    },
    "applications/node--disclosed-scoring-rule.md": {
      "disposition": "clarify",
      "reason": "Retain historical witness; identify concrete consumer checks without claiming execution."
    },
    "applications/node--divisive-vote-selection.md": {
      "disposition": "reverify",
      "reason": "Retain historical witness; identify concrete consumer checks without claiming execution."
    },
    "applications/process--matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "Replace broad unverified product survey with three scoped primary findings and corrected authorship."
    }
  }
}
```
