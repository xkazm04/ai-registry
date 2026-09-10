---
domain: game-production
subject: encounter-balance-simulation
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# encounter-balance-simulation

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/encounter-balance-simulation",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:4d3065526d21fd1f",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A fixed-seed win fraction remains a finite-sample estimate.",
    "A step-valued empirical win-rate function can jump over the desired target.",
    "The highest last-hit share need not identify the enemy whose removal most improves survival."
  ],
  "sources": [
    {
      "url": "https://www.itl.nist.gov/div898/handbook/prc/section2/old.prc271.htm",
      "scope": "Binomial confidence guidance supports carrying sample size and uncertainty; it does not validate fairness thresholds or independent sampling in the consumer harness."
    },
    {
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.bisect.html",
      "scope": "The documented bisection contract requires a continuous function and opposite endpoint signs. A finite-sample stepped win-rate objective needs separate convergence and attainable-target handling."
    }
  ],
  "documents": {
    "encounter-balance-simulation.md": {
      "disposition": "reverify",
      "reason": "Reverify deterministic-equals-noiseless and simulation-equals-fairness claims. Bind the model and experiment design; fixed samples remain estimates and cross-language kernels can be checked for conformance."
    },
    "techniques/goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "reverify",
      "reason": "Reverify continuity, sampled monotonicity and attainable targets. Equal endpoints do not prove a flat interior without additional assumptions; report achieved value, residual and convergence separately."
    },
    "techniques/kill-share-and-damage-share-attribution.md": {
      "disposition": "reverify",
      "reason": "Reverify last-hit attribution as causal nerf advice. Include raw deaths, role and opportunity counts; chip damage can change survival even with low kill share."
    },
    "techniques/monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Reverify noise-band confidence level and independent versus paired comparisons. Preserve seed/model/configuration and use suitable binomial intervals at small samples or extreme rates; historical speed is unrerun."
    },
    "techniques/one-shot-rate-and-ehp-floor-checks.md": {
      "disposition": "reverify",
      "reason": "Reverify raw versus mitigated damage/effective-health bases to avoid double mitigation. Separate single-hit and burst events, conditional-on-death and per-run rates, and policy thresholds from proven fairness."
    },
    "techniques/per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "reverify",
      "reason": "Reverify hash-derived seed independence and full result identity. Order independence is distinct from independent random streams; paired comparisons may deliberately share randomness."
    },
    "techniques/tier-band-peer-outlier-linting.md": {
      "disposition": "reverify",
      "reason": "Reverify normalization of mixed units, zero or negative peer denominators and tiny peer populations. A definable percentile with one member provides no useful peer comparison."
    },
    "applications/node--goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed goal-seek-on-a-seeded-monotonic-lever contract. Reverify continuity, sampled monotonicity and attainable targets. Equal endpoints do not prove a flat interior without additional assumptions; report achieved value, residual and convergence separately."
    },
    "applications/node--per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed per-cell-seed-derivation-for-order-independence contract. Reverify hash-derived seed independence and full result identity. Order independence is distinct from independent random streams; paired comparisons may deliberately share randomness."
    },
    "applications/process--monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed monte-carlo-scenario-presets contract. Reverify noise-band confidence level and independent versus paired comparisons. Preserve seed/model/configuration and use suitable binomial intervals at small samples or extreme rates; historical speed is unrerun."
    }
  }
}
```
