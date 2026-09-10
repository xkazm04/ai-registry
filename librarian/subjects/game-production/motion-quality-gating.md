---
domain: game-production
subject: motion-quality-gating
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# motion-quality-gating

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/motion-quality-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:fa9995f520f46d07",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Paired comparisons against calibrated anchors can support an absolute acceptance bar. Intended robotic stiffness may be correct, and a zero-pass batch should trigger instrument review as well as content investigation.",
    "Folder names and small byte sizes are heuristics, not authoritative kind or emptiness evidence. Reference scans cover declared languages and reference forms; absent matches do not prove every asset orphaned.",
    "First visible response, attack windup, impact and completed blend are different quantities. Genre thresholds need an authored or measured basis; missing pipeline components leave end-to-end latency unmeasured."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/motion-and-audio/motion-quality-gating/motion-quality-gating.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://dev.epicgames.com/documentation/unreal-engine/root-motion-in-unreal-engine",
      "scope": "Official documentation search evidence distinguishes in-place animation from enabled root-motion extraction. It does not impose universal root-motion requirements on action categories."
    }
  ],
  "documents": {
    "motion-quality-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory root-motion categories, universal response thresholds, six independent rubric dimensions and claims that batch ranking cannot coexist with an absolute anchor. Filmstrip sampling is repaired; the rest remains scoped follow-up."
    },
    "techniques/absolute-not-curved-judgment.md": {
      "disposition": "reverify",
      "reason": "Paired comparisons against calibrated anchors can support an absolute acceptance bar. Intended robotic stiffness may be correct, and a zero-pass batch should trigger instrument review as well as content investigation."
    },
    "techniques/asset-reality-ledger.md": {
      "disposition": "reverify",
      "reason": "Folder names and small byte sizes are heuristics, not authoritative kind or emptiness evidence. Reference scans cover declared languages and reference forms; absent matches do not prove every asset orphaned."
    },
    "techniques/filmstrip-sampling-discipline.md": {
      "disposition": "clarify",
      "reason": "Repaired numeric/timestamp ordering, take identity, zero-frame behavior, endpoint assumptions, rounding and sparse-sample limits on timing and contacts."
    },
    "techniques/genre-response-latency-norms.md": {
      "disposition": "reverify",
      "reason": "First visible response, attack windup, impact and completed blend are different quantities. Genre thresholds need an authored or measured basis; missing pipeline components leave end-to-end latency unmeasured."
    },
    "techniques/montage-budget-and-root-motion-lint.md": {
      "disposition": "reverify",
      "reason": "Root motion is an authored movement choice, not mandatory for every category. A peer median including the only clip produces ratio 1, contrary to the claimed self-flag. Blend completion time is not first-response latency."
    },
    "techniques/six-dimension-motion-rubric.md": {
      "disposition": "reverify",
      "reason": "The dimensions overlap and depend on action/style. A cap below a broken anchor of zero is unreachable on a zero-based scale; a high mean cannot override a failed mandatory dimension."
    },
    "applications/node--asset-reality-ledger.md": {
      "disposition": "reverify",
      "reason": "The historical likely-empty predicate excludes zero-byte files by requiring bytes greater than zero. C++ reference scanning and folder classification do not establish a complete runtime asset inventory. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--filmstrip-sampling-discipline.md": {
      "disposition": "reverify",
      "reason": "The historical n <= 1 branch returns one sample for n = 0. A filename family may span takes, and sparse stills cannot establish every-frame contact correctness. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--six-dimension-motion-rubric.md": {
      "disposition": "reverify",
      "reason": "The historical arithmetic permits scores 0,100,100,100,100,100 to average 83.3. Reconcile hard-failure precedence and the impossible below-zero cap before using the mean as an acceptance result. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
