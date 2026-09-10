---
domain: game-production
subject: playtest-signal-to-defect
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# playtest-signal-to-defect

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/playtest-signal-to-defect",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f6c116a591a48e70",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Never-used and missed-exit complaints have multiple plausible causes. Assign a triage owner and confidence without claiming causal ownership from one observation; shared vocabulary can use an explicit mapping.",
    "Keep frequency denominators, exposure and severity separate. Ordinal multiplication is not expected loss, but calibrated cardinal loss times probability can be meaningful. Small fractions and percentages encode the same estimate and need uncertainty.",
    "Separate observations and interpretations while preserving useful quotations and hypotheses. Two calls do not guarantee independence or truth; causal words inside a player quote are not automatically an interpretation error."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/playtest-signal-to-defect/playtest-signal-to-defect.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "playtest-signal-to-defect.md": {
      "disposition": "reverify",
      "reason": "Reverify observation-to-cause routing, unreproduced reports dismissed as rumour, guaranteed independence of two-step extraction and all-category coverage as closure proof. The unreproduced-state technique is repaired; historical consumer closure remains unverified."
    },
    "techniques/complaint-to-owning-subject-routing.md": {
      "disposition": "reverify",
      "reason": "Never-used and missed-exit complaints have multiple plausible causes. Assign a triage owner and confidence without claiming causal ownership from one observation; shared vocabulary can use an explicit mapping."
    },
    "techniques/frequency-and-severity-as-separate-axes.md": {
      "disposition": "reverify",
      "reason": "Keep frequency denominators, exposure and severity separate. Ordinal multiplication is not expected loss, but calibrated cardinal loss times probability can be meaningful. Small fractions and percentages encode the same estimate and need uncertainty."
    },
    "techniques/observation-before-interpretation.md": {
      "disposition": "reverify",
      "reason": "Separate observations and interpretations while preserving useful quotations and hypotheses. Two calls do not guarantee independence or truth; causal words inside a player quote are not automatically an interpretation error."
    },
    "techniques/repro-minimization-protocol.md": {
      "disposition": "reverify",
      "reason": "Reduction commonly establishes local or one-minimality, not a globally shortest repro. Negative trials provide scoped evidence; aggregate and experiential defects can have explicit statistical or human oracles."
    },
    "techniques/session-instrumentation-contract.md": {
      "disposition": "reverify",
      "reason": "Idle observation can legitimately have no input events. Planned coverage is not exercised coverage, and partial notes remain evidence with limitations. Align raw input, accepted actions and observation clocks."
    },
    "techniques/unreproducible-is-a-state-not-a-dismissal.md": {
      "disposition": "clarify",
      "reason": "Repaired corroboration versus reproduction, scoped negative evidence, exercised coverage, stable finding identity and fixed versus expired or accepted-risk resolutions."
    },
    "applications/node--unreproducible-is-a-state-not-a-dismissal.md": {
      "disposition": "reverify",
      "reason": "The historical key including a newly minted finding ID is not idempotent across re-analysis by itself. Category coverage does not establish a fix; similar titles may conflate different causes. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--observation-before-interpretation.md": {
      "disposition": "reverify",
      "reason": "Defaulting absent provenance to simulated invents an origin; use unknown with a separate eligibility policy. Default confidence 80 is unmeasured, and separate output fields do not enforce an observation/interpretation boundary. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
