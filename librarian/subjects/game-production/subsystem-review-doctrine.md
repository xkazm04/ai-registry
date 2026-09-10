---
domain: game-production
subject: subsystem-review-doctrine
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# subsystem-review-doctrine

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/subsystem-review-doctrine",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:094826425ad01f6e",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An unchanged defect is newly detected after a nondeterministic reviewer missed it; new observation does not identify the introducing commit.",
    "A partial scan of a module skips the failing check yet emits no finding; module-level scope filtering would falsely resolve it.",
    "An immutable constructor-initialized armor value has no later writer and still changes every damage calculation."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/subsystem-review-doctrine",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "subsystem-review-doctrine.md": {
      "disposition": "reverify",
      "reason": "Grounding and explicit review scope are useful. Reverify uncited model-error prevalence and claimed trace yield. A newly observed finding is not proof of recent introduction; absence is not proof of repair. Grounded uncertainty and independently reviewable subsets are legitimate, and observable behavior described from source is not an executed witness."
    },
    "techniques/four-pass-ordering.md": {
      "disposition": "reverify",
      "reason": "Finding prerequisites should form an evidence dependency graph, not a compulsory global order. A profiler can establish measured cost before architectural interpretation, and local correctness can be proven without reviewing every structural issue. Separate observation from proposed optimization; invalidate dependent findings rather than all unrelated work."
    },
    "techniques/ground-truth-pass-before-proposals.md": {
      "disposition": "reverify",
      "reason": "Identity and member citations reduce invention but a model can invent specific behavior too. Reading a whole file does not confirm its external entities or execution. State source-inferred versus observed behavior, allow non-runtime entities and grounded conditional hypotheses, and do not convert missing access into an absence finding. Claimed effort savings need evidence."
    },
    "techniques/per-subsystem-check-sets.md": {
      "disposition": "reverify",
      "reason": "Checks can be derived from contracts and risk analysis before incidents. Repeated waivers do not prove a rule wrong, and rare catastrophic checks should not be retired on low firing frequency alone. Shared code-level checks can inspect component seams; a passing known check establishes only its measured scope."
    },
    "techniques/regression-diff-new-persisting-resolved.md": {
      "disposition": "clarify",
      "reason": "Repaired automatic recent-change attribution and absent-means-resolved. Adds comparable instrument and completed-check scope, unknown/not-reassessed outcomes, occurrence identity and affirmative resolution evidence."
    },
    "techniques/severity-by-consequence.md": {
      "disposition": "reverify",
      "reason": "Consequence and effort are useful independent axes, but an editor crash can destroy authoring work or block production. Tool error levels need not encode confidence. Weighted judged content can still be masked without a hard failure rule; state affected configurations, impact and realistic reachability instead of shipping-only harm."
    },
    "techniques/trace-one-interaction-end-to-end.md": {
      "disposition": "clarify",
      "reason": "Repaired read-without-writer as automatic no-op, binary artifact as necessarily absent/unautomatable, and duplicated representation as necessarily conflicting authority. Traces distinguish static inference from actual execution and optional terminal/listener behavior."
    },
    "applications/node--regression-diff-new-persisting-resolved.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations and verification date were not rerun. Eighty-character normalized descriptions can collide or fail to match rewording; subsystem scope does not prove individual checks completed. The 25 percent content weight alone cannot prevent green on failed content; discrepancy enforcement needs consumer verification. Disappearing fingerprints are not confirmed fixes."
    },
    "applications/process--ground-truth-pass-before-proposals.md": {
      "disposition": "reverify",
      "reason": "Historical process prompt and verification date were not rerun. It explicitly lacks a machine-readable refusal and downstream gate, so the conclusion that one extra call removes all invented-entity findings is unsupported. Prompt order does not establish confirmed premises or runtime observation."
    },
    "applications/process--trace-one-interaction-end-to-end.md": {
      "disposition": "reverify",
      "reason": "Historical process trace prompt and verification date were not rerun. Default or constructor-assigned Armor may affect damage without a GE/table writer; binary assets may exist or be authored by supported editor automation. The displayed prompt specifies a method, not a completed witness; trace variants and combat design claims require separate verification."
    }
  }
}
```
