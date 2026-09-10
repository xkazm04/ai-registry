---
domain: game-production
subject: design-doc-compliance-scoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# design-doc-compliance-scoring

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/design-doc-compliance-scoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:791786a59c2d1e8b",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "An empty mapping can satisfy every-is-done while proving no implementation.",
    "A missing row in a partial scan is not evidence that the code is absent.",
    "Positive damping still leaves a zero raw score at zero."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/prov-dm/",
      "scope": "Entity/activity provenance supports distinguishing evidence identity and derivation; it does not validate the scoring weights, age policy or implementation mapping."
    }
  ],
  "documents": {
    "design-doc-compliance-scoring.md": {
      "disposition": "reverify",
      "reason": "Reverify denominator identity, incomplete scans and interpretation of adjusted scores. Documentation items and code-feature rows are not interchangeable counting units."
    },
    "techniques/bidirectional-gap-detection.md": {
      "disposition": "reverify",
      "reason": "Reverify reverse enumeration and empty mappings. Undocumented code may be unintended behavior rather than cheap documentation debt; distinguish scan absence from implementation absence."
    },
    "techniques/coverage-vs-conformance-split.md": {
      "disposition": "reverify",
      "reason": "Reverify half-credit and band calibration, distinct denominators and duplicate mappings. Coverage is not statistical confidence, and zero-denominator conformance is unavailable."
    },
    "techniques/declared-mapping-is-terminal.md": {
      "disposition": "reverify",
      "reason": "Reverify declarations against completed scans and qualified cross-area identities. Terminal lookup does not prove the declaration is correct or that a missing result means absent code."
    },
    "techniques/evidence-age-envelope.md": {
      "disposition": "reverify",
      "reason": "Reverify invalid, future and undated timestamps. Newest dated evidence cannot establish freshness of every dependency, and old failures must remain visible after an age threshold."
    },
    "techniques/no-neutral-constant-for-unmeasured.md": {
      "disposition": "keep",
      "reason": "Retain explicit unmeasured state and refusal to fabricate a neutral score. Implementation must make measured state and score availability consistent; no runtime claim is promoted."
    },
    "techniques/severity-weighted-scale-free-damping.md": {
      "disposition": "reverify",
      "reason": "Reverify calibration and scale claims when counting granularity changes. The damping factor is positive but the adjusted score can be zero; retain raw conformance and coverage separately."
    },
    "applications/node--coverage-vs-conformance-split.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed coverage-vs-conformance-split contract. Reverify half-credit and band calibration, distinct denominators and duplicate mappings. Coverage is not statistical confidence, and zero-denominator conformance is unavailable."
    },
    "applications/node--severity-weighted-scale-free-damping.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed severity-weighted-scale-free-damping contract. Reverify calibration and scale claims when counting granularity changes. The damping factor is positive but the adjusted score can be zero; retain raw conformance and coverage separately."
    },
    "applications/process--declared-mapping-is-terminal.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed declared-mapping-is-terminal contract. Reverify declarations against completed scans and qualified cross-area identities. Terminal lookup does not prove the declaration is correct or that a missing result means absent code."
    }
  }
}
```
