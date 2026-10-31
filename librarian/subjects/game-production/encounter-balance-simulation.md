---
domain: game-production
subject: encounter-balance-simulation
last_touched: 2026-10-31
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

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. Since the 2026-09-10 record the subject gained three
instrument-review techniques from a racing project (entry-versus-winner share, rotation
confound, distinct-hash alarm), a process application, and a golden-path section linking
them. The new threshold technique states the reachable bound of a per-entry rate as the
share of the field a class occupies; the correct bound for a win is one over the number of
entries the class has in each race, which happens to equal a third in the reported example.
The one-shot technique's survivability example yields a multiplier below one.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/encounter-balance-simulation",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:78f678997e50b919",
  "disposition": "clarify",
  "coverage": "All 14 documents read in full. The 10 carried from 2026-09-10 were checked by diff (only the golden path changed: the new instrument-review section, a path-in-order step and three technique links; one application had a repo-relative path fix). The 4 added documents were read in full. Standard-error tables, the threshold bound and the effective-health example were recomputed. One primary source opened. No private tree reopened; no verification date refreshed.",
  "counterexamples": [
    "Five classes with three entries each make a fifteen-car field: each class occupies a fifth of the field, but a class that won every race would have a per-entry win rate of one third, because only one of its three entries can win.",
    "A seeded win rate over N fixed iterations takes only values k/N, so as a function of the lever it is a step function: repeatable, but not continuous, and it can step across the target.",
    "Armour that removes half a small hit doubles effective health against it; against a large hit it removes a tenth and multiplies by about 1.11. 'A fifth of' a doubling is 0.4, which would mean armour reduces survivability.",
    "A last-hit leader need not be the source whose removal most improves survival (kill share, still owed)."
  ],
  "sources": [
    {
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.bisect.html",
      "result": "'f must be continuous, and f(a) and f(b) must have opposite signs.' A fixed seed supplies repeatability only; the step-valued case is carried by the iteration cap and converged flag."
    },
    {
      "source": "Recomputed arithmetic",
      "result": "sqrt(0.25/N): 300 -> 2.89 pp, 2,000 -> 1.12 pp, 10,000 -> 0.50 pp; twice the standard error of a difference of two independent rates gives 8.2, 3.2 and 1.4 pp, matching the presets table. Win rates 57.93/49.14/35.05 -> 72.68/37.08/30.53 match 'about 58, 49 and 35 ... 73, 37 and 31' and 'more than a dozen points'."
    }
  ],
  "documents": {
    "encounter-balance-simulation.md": {
      "disposition": "clarify",
      "reason": "The instrument-review paragraph attributes the unreachable 55% limit to each class filling a third of the field; the cause is three entries per class per race with one winner. Restate."
    },
    "techniques/entry-vs-winner-share-threshold-check.md": {
      "disposition": "clarify",
      "reason": "The general bound ('cannot exceed the share of the field the class occupies') is wrong for a win rate: the cap is one over the class's entries per race, and for a top-k placing min(1, k/entries). Fix the arithmetic paragraph; the rest stands."
    },
    "techniques/goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "clarify",
      "reason": "Says a fixed seed makes metric(v) deterministic and implies that cures non-monotonicity. Seeding gives repeatability only; a rate over N iterations is a step function and need not be monotonic or hit the target. Add one sentence routing that case to the iteration cap and converged flag."
    },
    "techniques/kill-share-and-damage-share-attribution.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Last-hit share as nerf advice is not causal; raw death counts and opportunity counts are owed."
    },
    "techniques/monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic verified for independent comparisons. Paired common-random-number comparisons, which the per-cell technique endorses, need different intervals; small-sample and extreme-rate intervals unstated."
    },
    "techniques/one-shot-rate-and-ehp-floor-checks.md": {
      "disposition": "clarify",
      "reason": "'multiply survivability by two against a small hit and by a fifth of that against a large one' gives 0.4; restate as barely more than one, consistent with the golden path's half/tenth example. Still owed reverify: raw versus mitigated bases (double mitigation)."
    },
    "techniques/per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: the technique claims order independence, not stream independence, warns that non-avalanching hashes correlate cells, and sanctions shared keys for common random numbers."
    },
    "techniques/tier-band-peer-outlier-linting.md": {
      "disposition": "reverify",
      "reason": "Unchanged. A zero or negative peer mean makes the ratio bands undefined; not addressed."
    },
    "techniques/rotation-confound-cross-check.md": {
      "disposition": "keep",
      "reason": "Same-modulus aliasing, mixed-radix decorrelation, empty cells as not measured and the legal-purchase rule are correct and enumerable."
    },
    "techniques/distinct-hash-seed-diversity-alarm.md": {
      "disposition": "keep",
      "reason": "Figures match the application; the alarm is scoped as necessary but not sufficient for independence."
    },
    "applications/node--per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "reverify",
      "reason": "Private tree not re-read; verification date unchanged."
    },
    "applications/node--goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "reverify",
      "reason": "Its quoted header repeats the seeded-implies-well-behaved reading; the converged flag is the mitigation it names. Private tree not re-read; verification date unchanged."
    },
    "applications/process--monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Standard errors recomputed and correct. Private tree not re-read; verification date unchanged."
    },
    "applications/process--rotation-confound-cross-check.md": {
      "disposition": "reverify",
      "reason": "Consistent with its techniques, including 'three copies per class and a maximum possible rate of 33.3 percent'. Private tree not re-read; verification date unchanged."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items the earlier 2026-10-31 record named. The threshold bound now reads one over the entries a class fields per race, the golden path cites that cause, the survivability example gives a multiplier above one, and the goal-seek contract says a seed gives repeatability, not monotonicity. Owed reverify items and the private applications keep the subject at `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/encounter-balance-simulation",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:55025192c91097ee",
  "disposition": "reverify",
  "coverage": "Second 2026-10-31 record, after applying the clarify items of the first. Edited sections re-read; every other document is byte-unchanged from the first record and keeps its disposition. Sources as in the first record; no private tree reopened and no verification date refreshed.",
  "counterexamples": [
    "Five classes with three entries each make a fifteen-car field: each class occupies a fifth of the field, but a class that won every race would have a per-entry win rate of one third, because only one of its three entries can win.",
    "A seeded win rate over N fixed iterations takes only values k/N, so as a function of the lever it is a step function: repeatable, but not continuous, and it can step across the target.",
    "Armour that removes half a small hit doubles effective health against it; against a large hit it removes a tenth and multiplies by about 1.11. 'A fifth of' a doubling is 0.4, which would mean armour reduces survivability.",
    "A last-hit leader need not be the source whose removal most improves survival (kill share, still owed)."
  ],
  "sources": [
    {
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.bisect.html",
      "result": "'f must be continuous, and f(a) and f(b) must have opposite signs.' A fixed seed supplies repeatability only; the step-valued case is carried by the iteration cap and converged flag."
    },
    {
      "source": "Recomputed arithmetic",
      "result": "sqrt(0.25/N): 300 -> 2.89 pp, 2,000 -> 1.12 pp, 10,000 -> 0.50 pp; twice the standard error of a difference of two independent rates gives 8.2, 3.2 and 1.4 pp, matching the presets table. Win rates 57.93/49.14/35.05 -> 72.68/37.08/30.53 match 'about 58, 49 and 35 ... 73, 37 and 31' and 'more than a dozen points'."
    }
  ],
  "documents": {
    "encounter-balance-simulation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the unreachable 55% limit is now attributed to three entries per class per race with one winner (cap of a third), not to field share."
    },
    "techniques/entry-vs-winner-share-threshold-check.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the arithmetic paragraph now bounds a per-entry win rate by one over the class's entries per race (k over that number, at most one, for a top-k placing), independent of the number of classes."
    },
    "techniques/goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added that determinism is repeatability, not monotonicity; a fixed-count rate moves in whole-count steps and bisection's contract asks for continuity (scipy: 'f must be continuous'), so that case falls to the iteration cap and convergence flag."
    },
    "techniques/kill-share-and-damage-share-attribution.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Last-hit share as nerf advice is not causal; raw death counts and opportunity counts are owed."
    },
    "techniques/monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic verified for independent comparisons. Paired common-random-number comparisons, which the per-cell technique endorses, need different intervals; small-sample and extreme-rate intervals unstated."
    },
    "techniques/one-shot-rate-and-ehp-floor-checks.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'by a fifth of that' became 'by barely more than one', with halving giving a doubling and a tenth giving about 1.1. Still owed reverify: raw versus mitigated bases (double mitigation)."
    },
    "techniques/per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: the technique claims order independence, not stream independence, warns that non-avalanching hashes correlate cells, and sanctions shared keys for common random numbers."
    },
    "techniques/tier-band-peer-outlier-linting.md": {
      "disposition": "reverify",
      "reason": "Unchanged. A zero or negative peer mean makes the ratio bands undefined; not addressed."
    },
    "techniques/rotation-confound-cross-check.md": {
      "disposition": "keep",
      "reason": "Same-modulus aliasing, mixed-radix decorrelation, empty cells as not measured and the legal-purchase rule are correct and enumerable."
    },
    "techniques/distinct-hash-seed-diversity-alarm.md": {
      "disposition": "keep",
      "reason": "Figures match the application; the alarm is scoped as necessary but not sufficient for independence."
    },
    "applications/node--per-cell-seed-derivation-for-order-independence.md": {
      "disposition": "reverify",
      "reason": "Private tree not re-read; verification date unchanged."
    },
    "applications/node--goal-seek-on-a-seeded-monotonic-lever.md": {
      "disposition": "reverify",
      "reason": "Its quoted header repeats the seeded-implies-well-behaved reading; the converged flag is the mitigation it names. Private tree not re-read; verification date unchanged."
    },
    "applications/process--monte-carlo-scenario-presets.md": {
      "disposition": "reverify",
      "reason": "Standard errors recomputed and correct. Private tree not re-read; verification date unchanged."
    },
    "applications/process--rotation-confound-cross-check.md": {
      "disposition": "reverify",
      "reason": "Consistent with its techniques, including 'three copies per class and a maximum possible rate of 33.3 percent'. Private tree not re-read; verification date unchanged."
    }
  }
}
```
