---
domain: game-production
subject: engine-integration-safety
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# engine-integration-safety

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-integration-safety",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:91e7e767f4e397d2",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A command can complete remotely while its response is lost.",
    "A run can emit a genuine passing subtest marker before crashing during another required phase.",
    "An expired lease or a failed process probe does not establish safe editor ownership."
  ],
  "sources": [
    {
      "url": "https://httpwg.org/specs/rfc9110.html#idempotent.methods",
      "scope": "HTTP retry semantics distinguish repeatable effects from uncertain response delivery. Applied here to transport guidance, not as verification of an editor bridge implementation."
    }
  ],
  "documents": {
    "engine-integration-safety.md": {
      "disposition": "reverify",
      "reason": "Reverify timeout, process-lifecycle and marker conclusions. A completed subtest and a later crash are separate observations; elapsed waiting does not establish stopped execution."
    },
    "techniques/editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Reverify fixed elapsed-time claims of a wedge and cancellation disabling default deadlines. Cheap probes may queue on the same busy thread; bound waiting without asserting termination."
    },
    "techniques/judge-by-log-markers-not-exit-code.md": {
      "disposition": "reverify",
      "reason": "Reverify trust and completeness of markers, malformed structured output fallback and fatal-after-pass handling. Preserve subtest outcome alongside overall lifecycle failure; a nonce is not protection from an untrusted producer."
    },
    "techniques/pid-scoped-teardown.md": {
      "disposition": "reverify",
      "reason": "Reverify ownership against identifier reuse and descendant lifetime. Capture process identity or handles and creation context; a bare numeric identifier can later name another process."
    },
    "techniques/refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Reverify fail-open behavior when probing is unavailable and the probe-to-launch race. Require atomic exclusivity or proven isolation; do not infer safety from missing visibility."
    },
    "techniques/single-instance-lease-and-drain.md": {
      "disposition": "reverify",
      "reason": "Reverify one-process versus one-host scope, ownership of the actual instance, fencing and bounded drain. Ending a wait cannot release a still-active resource safely."
    },
    "techniques/transport-failure-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Rewrote failure kinds and independent execution certainty, including ambiguous socket errors, cancellation, intermediary responses, redaction and idempotency-aware retry."
    },
    "applications/node--editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed editor-thread-timeout-budgeting contract. Reverify fixed elapsed-time claims of a wedge and cancellation disabling default deadlines. Cheap probes may queue on the same busy thread; bound waiting without asserting termination."
    },
    "applications/node--transport-failure-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed transport-failure-taxonomy contract. Rewrote failure kinds and independent execution certainty, including ambiguous socket errors, cancellation, intermediary responses, redaction and idempotency-aware retry."
    },
    "applications/process--refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed refuse-dont-kill-a-live-editor contract. Reverify fail-open behavior when probing is unavailable and the probe-to-launch race. Require atomic exclusivity or proven isolation; do not infer safety from missing visibility."
    }
  }
}
```
