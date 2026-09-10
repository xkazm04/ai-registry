---
domain: llm-observability
subject: judge-calibration-and-drift
---

# judge-calibration-and-drift

## 2026-08-28 - /harvest batch 1 + A/B evaluation

Two landings: a panel-of-judges section on `judge-selection-by-spread`
(externally corroborated ~1/7-cost ensemble) and difficulty-conditioned
agreement + verbosity-inflation fixtures on `golden-set-agreement-measurement`.
Both A/B probes returned **impact-positive** (blind 10-9 and 10-8): in the
selection probe the entire margin was the landed panel row, correctly applied
with the members-must-span-families caveat against an all-one-family candidate
space; in the calibration probe the gap sat on difficulty conditioning and
gameability probes. Evaluation ledger: [[../../harvest/evaluations.md]].

### 2026-08-31 - `/intake`, from danluu.com (2026 posts)

`repeatability-floor` added, and it came from a **cross-bundle asymmetry** rather than
from the source. Two bundles both cover judge instability; only one models it. The
builder-side offline harness has carried a repeatability floor for weeks ("a 0.3 delta
is noise if the judge disagrees with itself by 0.4"). This subject runs an agreement
coefficient, a trust bar, a per-cycle drop alert and a windowed baseline regression -
every one of them computed from **one judge score per item**, with no floor beneath
any of them. Both files score identically on any keyword; only opening both shows it.

The consequence is the part this subject was missing: the floor is the **minimum
detectable effect for both detectors**. Without it they fire on the judge's own
re-score noise, reliably, on a schedule - and the operational cost is worse than the
false alarm, because a detector that cries wolf on a cadence gets muted and the real
drift then arrives into a muted channel.

Measured in the source: re-grading **one fixed artifact** ten times with the same judge
model flipped the published verdict 23% of the time; official differed from median
21%; a different judge model more than halved the passes. The half that made it a
technique rather than a number is that repeatability is **per dimension** - 32% / 5% /
3% across three dimensions of one rubric - so a composite figure hides that the
heaviest-weighted dimension is the noisiest, which is the common and invisible rubric
design. Boundary with the builder side stated in prose, not linked. Source:
[[../../sources/2026-08-31-danluu-2026]].

Applied same-run as a simulation (`structural-only`) against a managed tree's
conformance corpus: **better**. 142 judged pairs, 12 workers, and **0 (subject,
technique) keys judged more than once** - the partition-for-coverage design makes the
floor unobtainable from the output, permanently. With a 79.6% deviation base rate, a
worker answering `deviation` to everything is indistinguishable from a discriminating
one. Instrument named: overlap ~5% of pairs in the next run, ~7 extra judgements,
no human labels.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/judge-calibration-and-drift",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:3bf8d425b426524a",
  "disposition": "reverify",
  "coverage": "All 12 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Good scores all 0.80 and bad scores all 0.35 are perfectly separated by 0.6.",
    "A tiny-weight noisy dimension need not dominate composite variance.",
    "Independent repeated observations can detect a mean shift smaller than single-observation standard deviation.",
    "Kappa of -0.5 becomes zero under zero-to-one clamping.",
    "A four-entry window cannot contain three recent and three baseline observations."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/judge-calibration-and-drift",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "judge-calibration-and-drift.md": {
      "disposition": "reverify",
      "reason": "Not every quality score uses a judge, human-written checks can be wrong, and agreement does not establish truth. Human inter-rater agreement is not a strict upper bound on agreement with an adjudicated reference. Raw spread and repeatability are not universal discrimination or minimum-effect criteria. Trust requires scoped operating-risk evidence, uncertainty and freshness; kappa conventions alone cannot authorize every consequential use."
    },
    "techniques/golden-set-agreement-measurement.md": {
      "disposition": "clarify",
      "reason": "Repaired undefined kappa as perfect, human agreement ceiling, universal small-n sizing and reference truth. Report contingency counts, operating errors, uncertainty and strata instead of treating a kappa bar as sufficient."
    },
    "techniques/judge-selection-by-spread.md": {
      "disposition": "clarify",
      "reason": "Repaired narrow mean gap as inseparability, the explicit 0.80/0.35 counterexample and cost as universally only a tiebreaker. Evaluate overlap, threshold outcomes and held-out decision utility; model-family diversity is not a guaranteed remedy."
    },
    "techniques/repeatability-floor.md": {
      "disposition": "clarify",
      "reason": "Repaired repeatability as a hard minimum detectable effect, unit mismatch and noisiest-dimension dominance. Sampling variation and correlation affect the uncertainty of the actual aggregate and detector; single observations remain measurements with limits."
    },
    "techniques/reserved-rubric-persistence.md": {
      "disposition": "reverify",
      "reason": "Kappa can be negative and cannot pass unchanged through a zero-to-one clamp. Namespace labels do not enforce customer isolation or aggregate exclusion. Keying only by model mixes rubric/set/method versions; a marker in free text does not reset detector state. Bounded client-side filtering can miss the latest matching record. Store reuse supplies neither append-only guarantees nor correct metrics automatically."
    },
    "techniques/scheduled-recalibration.md": {
      "disposition": "reverify",
      "reason": "Frozen-set rejudging cannot detect changed production populations without coverage monitoring and refreshed versioned samples. Concurrency may affect requests or provider outputs. Distinguish transient, fatal and stale states; a daemon must not always exit zero on fatal errors. Reserved scoring capacity and budgets are compatible; schedule examples are policy, not evidence of universal sufficiency."
    },
    "techniques/trust-bar-verdict.md": {
      "disposition": "reverify",
      "reason": "A fixed kappa bar is a scoped policy, not universal authorization or proof of truth. Undefined, uncertain and stale states need explicit treatment. Untrusted judges need not rank better than random. Full tuple, method and population must key trust; human references can also need quality assurance. Strongest-committee-defense claims and exact rates need source-specific threat-model verification."
    },
    "techniques/windowed-score-drop-alerting.md": {
      "disposition": "clarify",
      "reason": "Repaired negative kappa clamping, denominator and sampling validity, impossible window configurations and automatic statistical authority from counts. Relative drop is not meaningful for every metric; slow drift can be absorbed by a moving baseline."
    },
    "applications/node--repeatability-floor.md": {
      "disposition": "reverify",
      "reason": "Structural simulation retained, not rerun. Zero overlap prevents estimating repeatability from this output, not permanently from future reruns. Two workers agreeing does not establish correctness or earned ranking; a flipped conformant item is not necessarily a lucky deviation. Seven overlaps give limited and potentially unrepresentative evidence, and inter-worker differences can mix instrument configurations."
    },
    "applications/process--golden-set-agreement-measurement.md": {
      "disposition": "reverify",
      "reason": "Dated literature survey retained without refreshing maturity. Kappa interpretation bands are not universal acceptance thresholds; raw score compression can preserve perfect separation. AUC is not the same statistic as mean spread. No published counter-evidence does not verify a persistence convention, and current platform/strongest-defense claims remain scoped and unrefreshed."
    },
    "applications/process--judge-selection-by-spread.md": {
      "disposition": "reverify",
      "reason": "Historical 12-item bake-off retained, not rerun. The shown 0.600 correct versus 0.22 evasive scores admit a separating threshold; narrower mean spread cannot prove none exists. Small selected set and no-flip result do not prove transfer or equivalence. Model identities, prices and measurements remain historical."
    },
    "applications/rust--windowed-score-drop-alerting.md": {
      "disposition": "reverify",
      "reason": "Historical Rust code retained, not rerun. Negative kappa is clamped, so does not flow unchanged. Window four with recent floor three cannot satisfy baseline three; min_samples above cap never warms. NaN/zero maxima and drop validation are unshown. In-memory state, concurrency and unbounded spawned delivery limit operational guarantees; absolute bar can evaluate the first cycle."
    }
  }
}
```
