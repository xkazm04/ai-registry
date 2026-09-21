---
domain: game-production
subject: crash-forensics-attribution
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# crash-forensics-attribution

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/crash-forensics-attribution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:fd03a0a03435025f",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A nonfatal ensure can create a report without terminating the application.",
    "A source directory can be generic while a symbol uniquely identifies the owning subsystem.",
    "Different defects can collapse to one signature after digits or template arguments are stripped."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/crash-reporting-in-unreal-engine",
      "scope": "Official crash-report documentation describes captured context and nonfatal ensures. It does not validate the subject scoring weights or historical attribution results."
    }
  ],
  "documents": {
    "crash-forensics-attribution.md": {
      "disposition": "reverify",
      "reason": "Reverify the distinction between crash reporting, nonfatal diagnostics, routing and proven root cause. Signature similarity and high routing scores do not establish common causality."
    },
    "techniques/caller-chain-decay.md": {
      "disposition": "reverify",
      "reason": "Reverify top-frame and first-game-frame root-cause assumptions, the claimed decay bound under unequal raw weights, and calibration without reusing a final held-out set."
    },
    "techniques/confidence-gates-report-unknown.md": {
      "disposition": "reverify",
      "reason": "Reverify probability-like confidence language and mandatory unknown-rate targets. Report abstention coverage alongside conditional accuracy; module location is not necessarily culpability."
    },
    "techniques/crash-signature-over-id-equality.md": {
      "disposition": "reverify",
      "reason": "Reverify destructive normalization, low-information buckets and missing-component score denominators. Preserve raw evidence, normalization version and build context; similarity is a retrieval signal."
    },
    "techniques/engine-crash-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Reverify categorical cause assignments for access violations and memory exhaustion. Glossary terms are hypotheses requiring context, not guaranteed root diagnoses."
    },
    "techniques/root-cause-to-fix-prompt.md": {
      "disposition": "reverify",
      "reason": "Reverify blanket rejection of null guards and environment failures. Safe optional-null handling and software-caused memory exhaustion are counterexamples; unknown attribution warrants investigation first."
    },
    "techniques/weighted-evidence-directory-file-symbol.md": {
      "disposition": "reverify",
      "reason": "Reverify the universal directory-over-symbol order, 3/2/1 weights and six-to-twelve subsystem limit. Calibrate against project ownership and independent cases; direct location tags still do not prove root cause."
    },
    "applications/node--crash-signature-over-id-equality.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed crash-signature-over-id-equality contract. Reverify destructive normalization, low-information buckets and missing-component score denominators. Preserve raw evidence, normalization version and build context; similarity is a retrieval signal."
    },
    "applications/node--weighted-evidence-directory-file-symbol.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed weighted-evidence-directory-file-symbol contract. Reverify the universal directory-over-symbol order, 3/2/1 weights and six-to-twelve subsystem limit. Calibrate against project ownership and independent cases; direct location tags still do not prove root cause."
    },
    "applications/process--root-cause-to-fix-prompt.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed root-cause-to-fix-prompt contract. Reverify blanket rejection of null guards and environment failures. Safe optional-null handling and software-caused memory exhaustion are counterexamples; unknown attribution warrants investigation first."
    }
  }
}
```
