---
domain: game-production
subject: ship-pipeline-gating
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# ship-pipeline-gating

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ship-pipeline-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:01e349e0f587df06",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Inside #if WITH_EDITOR || SHIPPING, seeing WITH_EDITOR on the stack does not exclude code from Shipping.",
    "A valid success marker from an earlier run followed by the current run's crash is not current completion evidence.",
    "A missing required budget file cannot be interpreted as the user intentionally disabling its gate."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/ship-pipeline-gating",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "ship-pipeline-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify exit status dismissed categorically, ascending-cost order versus failure probability/dependencies, validator logs as sole content authority and corrupt configuration evaluated on invented settings. Earlier source checks do not remove the need to check transformed artifacts. Required configuration absence is not evidence of intentional disablement."
    },
    "techniques/editor-only-api-audit-for-shipping.md": {
      "disposition": "clarify",
      "reason": "Repaired guard analysis as branch-condition implication, including else/elif, disjunction, macro value versus definedness and unsupported preprocessing. A stack containing an accepted token is not enough to prove shipping exclusion."
    },
    "techniques/fail-closed-on-corrupt-gate-config.md": {
      "disposition": "clarify",
      "reason": "Repaired absent optional versus required config, missing versus corrupt semantics, no invented conservative verdicts and preserving load-failure metadata with historical verdicts. A schema-defined default is legitimate policy; a missing file does not establish operator choice."
    },
    "techniques/post-cook-process-liveness-smoke.md": {
      "disposition": "reverify",
      "reason": "Process name plus appearance time is not sufficient ownership proof under concurrent launches or PID reuse. A readiness marker needs run identity and freshness, and end-of-window liveness does not prove uninterrupted survival. A staged smoke is not a clean-machine install test unless that environment was actually used."
    },
    "techniques/preflight-before-an-expensive-cook.md": {
      "disposition": "reverify",
      "reason": "The savings inequality assumes detector accuracy and independent placement costs; account for false positives and later checks. Known contracts can justify checks before an incident exists. Missing required input may itself be a content/configuration violation, and configured defaults may supply a valid entry point."
    },
    "techniques/size-budget-and-growth-baseline.md": {
      "disposition": "reverify",
      "reason": "Seven 10% increases yield about 1.95 times, not a full doubling. Scope baselines by project/platform/configuration and measurement method, handle zero sizes, missing paths, concurrency and symlinks. Historical identity may be recovered from reliable manifests rather than being inherently unreconstructable."
    },
    "techniques/validator-log-classification.md": {
      "disposition": "clarify",
      "reason": "Repaired combined protocol and execution outcomes, complete run identity, terminal evidence, error precedence, task-scoped diagnostic grouping and limits of truncation. Log and exit checks can complement one another without becoming competing authorities."
    },
    "applications/node--post-cook-process-liveness-smoke.md": {
      "disposition": "reverify",
      "reason": "Historical image-name lookup can count someone else's running game, and image-wide cleanup can terminate it. Even a dedicated agent can host unrelated processes. Boolean gameAlive collapses unresolved identity into fail; no consumer launch or cleanup executed."
    },
    "applications/node--preflight-before-an-expensive-cook.md": {
      "disposition": "reverify",
      "reason": "Historical preflight enum lacks unevaluated, as noted. Unset default map is warned despite technique calling it fatal; validate actual inherited defaults and target contract. The source's parseUbtResult uses log markers alongside exit territory, contradicting exclusive judgment modes. Consumer not rerun."
    },
    "applications/process--validator-log-classification.md": {
      "disposition": "reverify",
      "reason": "Historical empty parsed issues do not prove completed validation. Severity/message dedup can collapse distinct affected assets; retain per-asset counts. WaitMutex is not a general live-editor lease, and teardown faults are not automatically benign. Consumer and current tool behavior not reverified."
    }
  }
}
```
