---
domain: game-production
subject: production-coverage-measurement
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# production-coverage-measurement

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-coverage-measurement",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:bbb5d06bababe940",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Stable IDs can retain identity while content or environment changes. Check both missing old entries and newly added unreviewed entries. Preserve historical evidence when expiring a current claim; an empty expected set may be legitimate.",
    "A medium ceiling is a scoped capability hypothesis, not a permanent quality fact. New above-ceiling evidence should challenge it. Differences between ordinal rungs are not measured effort, and unmeasured quality is not measured zero.",
    "Derived code can be wrong and literals can implement an authoritative contract. Identical outputs for two inputs may reflect an intentional plateau. Human selection does not prove comprehensive review."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-coverage-measurement/production-coverage-measurement.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "production-coverage-measurement.md": {
      "disposition": "reverify",
      "reason": "Reverify automation equated with readiness, permanent medium ceilings, ordinal ladder arithmetic and coverage inferred from observed inventory without expected scope. The headless technique is repaired; the golden path and readiness ladder still mix these quantities."
    },
    "techniques/audited-fact-drift-detection.md": {
      "disposition": "reverify",
      "reason": "Stable IDs can retain identity while content or environment changes. Check both missing old entries and newly added unreviewed entries. Preserve historical evidence when expiring a current claim; an empty expected set may be legitimate."
    },
    "techniques/craft-ladder-and-medium-ceilings.md": {
      "disposition": "reverify",
      "reason": "A medium ceiling is a scoped capability hypothesis, not a permanent quality fact. New above-ceiling evidence should challenge it. Differences between ordinal rungs are not measured effort, and unmeasured quality is not measured zero."
    },
    "techniques/engine-credibility-classes.md": {
      "disposition": "reverify",
      "reason": "Derived code can be wrong and literals can implement an authoritative contract. Identical outputs for two inputs may reflect an intentional plateau. Human selection does not prove comprehensive review."
    },
    "techniques/headless-operability-gate.md": {
      "disposition": "clarify",
      "reason": "Repaired independent artifact and automation standing, manual shippable work, unattended GUI versus no-window requirements, unknown capability and highest-satisfied-rung computation."
    },
    "techniques/readiness-ladder.md": {
      "disposition": "reverify",
      "reason": "The ladder mixes produced-but-failing and off-ladder rules, and quality enters supposedly independent rungs. Highest passed checks do not imply all prerequisites passed; deferred potential must not render as achieved readiness."
    },
    "techniques/source-provenance-marks.md": {
      "disposition": "reverify",
      "reason": "Provenance origin is not confidence or freshness. Authored demotions can be mistaken or manipulate priority; retain competing evidence rather than treating every self-demotion as established truth. Aggregates may need input-specific provenance."
    },
    "applications/node--engine-credibility-classes.md": {
      "disposition": "reverify",
      "reason": "The historical two-entity identical-output observation does not alone prove a stub; inspect the computation and expected sensitivity. Name-based fixture filtering can exclude production rows, and counts.pass > 0 is only existential coverage. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--readiness-ladder.md": {
      "disposition": "reverify",
      "reason": "The historical deferred R4 presentation must distinguish proposed from achieved. An audit run is not a release witness, and manual execution does not by itself negate observed artifact readiness. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/react--source-provenance-marks.md": {
      "disposition": "reverify",
      "reason": "The historical glyph/tooltip treatment requires keyboard and touch evidence as well as color distinctions. Missing craft chips can hide unknown standing; an authored-demotion mark remains a provenance claim, not corroboration. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
