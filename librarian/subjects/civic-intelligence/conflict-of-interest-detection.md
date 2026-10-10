---
domain: civic-intelligence
subject: conflict-of-interest-detection
last_touched: 2026-10-10
touched_by: intake
dry_streak: 0
---

# conflict-of-interest-detection

## Architecture review - 2026-09-09

Retain the economic screening method with explicit limits. Consumer formula parity, ambiguous joins, temporal semantics and ranking calibration remain re-verification work.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/conflict-of-interest-detection",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:d9d42fa383865920",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A non-financial interest creates a conflict without a realized improper decision.",
    "A 0.35 class multiplier on a very large amount exceeds a 1.0 multiplier on a small amount.",
    "An unknown end date is mistaken for a continuing role.",
    "Two conflicting ballots are stably but arbitrarily selected.",
    "Multiple role ties share a person/company/vote hash.",
    "A negative refund breaks the claimed lower-bound fraction."
  ],
  "sources": [
    {
      "url": "https://legalinstruments.oecd.org/public/doc/130/body-text.en.html",
      "result": "OECD definition and broader interest categories checked; no jurisdiction-specific legal verdict."
    },
    {
      "source": "All nine subject documents and printed score/identifier expressions",
      "result": "Semantic and arithmetic counterexamples assessed; current consumer implementation and historical runs not executed."
    }
  ],
  "documents": {
    "conflict-of-interest-detection.md": {
      "disposition": "clarify",
      "reason": "Clarify legal scope, source fallibility and disclosed sampling."
    },
    "techniques/registry-corroboration-gating.md": {
      "disposition": "clarify",
      "reason": "Clarify evidence grades and bounded queue policy."
    },
    "techniques/tie-class-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Do not treat stewardship as exoneration or title classification as legal fact."
    },
    "techniques/temporal-alignment-of-money-and-role.md": {
      "disposition": "clarify",
      "reason": "Clarify event semantics, temporal precision and scope of exclusions."
    },
    "techniques/statute-relevance-mapping.md": {
      "disposition": "clarify",
      "reason": "Expose temporal and jurisdictional scope and table coverage limits."
    },
    "techniques/vote-versus-interest-join.md": {
      "disposition": "clarify",
      "reason": "Clarify stable identity, recusal exclusions and versioned computation."
    },
    "techniques/triage-signal-scoring.md": {
      "disposition": "clarify",
      "reason": "Cover nonfinite math, correlated evidence and threshold provenance."
    },
    "applications/node--triage-signal-scoring.md": {
      "disposition": "reverify",
      "reason": "Reverify actual imports, numeric guards and tier boundaries."
    },
    "applications/node--vote-versus-interest-join.md": {
      "disposition": "reverify",
      "reason": "Reverify ambiguity handling, identity and date semantics."
    }
  }
}
```

## Apply - 2026-10-10 (ap-rcg-1010)

registry-corroboration-gating gained its first application (node, politicas,
experiment, better). The consumer gates the vote-versus-interest join and the
review tier on registry confirmation. The published per-MP attributable figure is
not gated: its bucket is decided by tie class alone. A replay of the committed
211-tie ledger found 6 of 30 published figures carrying 128.1M CZK from ties the
register had not confirmed. A confirmed-only arm withholds all of it and none of
the confirmed money. The seam was chosen to falsify the gate. Four of the six
"contradicted" ties, 95% of the withheld money, were later confirmed by deeper
register reads, and none had a contradicting record. The technique gained a
check-depth boundary: record whether a check read the current view or the full
history, and treat a current-view no-match as unchecked history, not as a
contradiction. The single-stack attention point does not move: the fleet's one
civic project is node.
