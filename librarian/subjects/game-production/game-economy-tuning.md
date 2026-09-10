---
domain: game-production
subject: game-economy-tuning
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# game-economy-tuning

## Architecture review - 2026-09-10

Read and assessed all 16 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/game-economy-tuning",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:812bb01d27be67a8",
  "disposition": "reverify",
  "coverage": "All 16 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "A central-resource valuation is contextual and may be nonadditive. Price differences isolate effect value only under justified comparability; an outlier alone does not decide whether price or effect is wrong. A conditional benefit can have zero value when its condition is unreachable.",
    "A neutral stance and three axes are design choices. Identical output on one metric does not prove that stances collapse; derived tables can preserve a single authored parameter authority.",
    "The opening net/inflow definition conflicts with the later absolute-net/max(inflow,outflow) formula. State one signed basis, zero-flow behavior, time units and threshold policy; optional measurements cannot satisfy a required gate."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/systems-canon/game-economy-tuning/game-economy-tuning.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "game-economy-tuning.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory drains for every currency, universal feedback requirements, price versus stock-flow inflation, arbitrary bands and graph-only stability claims. Finite progression can intentionally accumulate; policy thresholds need an authored basis."
    },
    "techniques/cost-curve-object-audit.md": {
      "disposition": "reverify",
      "reason": "A central-resource valuation is contextual and may be nonadditive. Price differences isolate effect value only under justified comparability; an outlier alone does not decide whether price or effect is wrong. A conditional benefit can have zero value when its condition is unreachable."
    },
    "techniques/economy-philosophy-multipliers.md": {
      "disposition": "reverify",
      "reason": "A neutral stance and three axes are design choices. Identical output on one metric does not prove that stances collapse; derived tables can preserve a single authored parameter authority."
    },
    "techniques/faucet-sink-balance-band.md": {
      "disposition": "reverify",
      "reason": "The opening net/inflow definition conflicts with the later absolute-net/max(inflow,outflow) formula. State one signed basis, zero-flow behavior, time units and threshold policy; optional measurements cannot satisfy a required gate."
    },
    "techniques/feedback-loop-topology-and-polarity.md": {
      "disposition": "reverify",
      "reason": "Loop polarity depends on the signs of local effects, and gain and delays affect dynamics. Positive feedback need not diverge, negative feedback need not stabilize, and external sources can grow stocks without a reinforcing cycle."
    },
    "techniques/intransitive-equilibrium-solving.md": {
      "disposition": "clarify",
      "reason": "Repaired strict versus weak dominance, the weakly dominated equilibrium counterexample, both-player payoff requirements and off-support best-response inequalities. Equilibrium is separated from dynamic convergence."
    },
    "techniques/progression-curve-shape-tests.md": {
      "disposition": "reverify",
      "reason": "A low coefficient of variation of adjacent ratios does not identify the intended curve family. Check the target ratio or formula, residuals, finite range, offsets and rounding; a polynomial over a narrow range can pass the proposed threshold."
    },
    "techniques/rarity-inflation-and-affix-saturation-alerts.md": {
      "disposition": "reverify",
      "reason": "Small percentage differences are not statistically indistinguishable by definition. Handle zero baselines, denominators and uncertainty; pool share alone does not establish build collapse, and pity mechanics can change expected value."
    },
    "techniques/source-drain-converter-trader-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Counts of unlike resources cannot establish conservation. Classify relative to the boundary; finite vendor stock, transaction fees, caps and intentional accumulation need explicit semantics."
    },
    "techniques/structural-economy-simulation-before-numbers.md": {
      "disposition": "clarify",
      "reason": "Repaired the assertion that unit-rate simulation establishes structural stability. Added equal-topology stable and divergent recurrences and bounded claims for finite traces, reachability and stochastic mean substitution."
    },
    "techniques/tornado-sensitivity-sweeps.md": {
      "disposition": "reverify",
      "reason": "Endpoint sweeps miss interior extrema without monotonicity. Distinguish input ranges, confidence intervals and predictive uncertainty; fixed seeds improve pairing but do not remove sampling error or nonlinear interactions."
    },
    "techniques/wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "reverify",
      "reason": "Gini thresholds need population and cohort context; an unnormalized finite population has maximum (n-1)/n. Handle zero total wealth and negative balances. Price divided by earning rate is time, and repeated purchase frequency affects affordability."
    },
    "applications/node--source-drain-converter-trader-vocabulary.md": {
      "disposition": "reverify",
      "reason": "The historical five-kind implementation was not rerun. A vocabulary rename does not establish correct resource boundaries or finite-vendor semantics. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--tornado-sensitivity-sweeps.md": {
      "disposition": "reverify",
      "reason": "The historical seeded sweep was not rerun. A broad random input range and reused seeds do not establish a noiseless derivative; confirm endpoint monotonicity and reported units. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--wealth-concentration-and-price-imbalance-alerts.md": {
      "disposition": "reverify",
      "reason": "The historical alert implementation was not rerun. Validate the 1% affordability basis and purchase frequency; stock-flow growth and concentration are distinct measurements that may legitimately coexist. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--faucet-sink-balance-band.md": {
      "disposition": "reverify",
      "reason": "The historical process was not rerun. For inflow 1.2 and outflow 0.8 the imbalance is 50% of outflow or 33.3% of max flow, so the denominator matters. A max(...,1) floor is unit-dependent, and unmeasured optional fields are not a completed check. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```
