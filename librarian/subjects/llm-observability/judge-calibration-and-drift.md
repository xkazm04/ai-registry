---
domain: llm-observability
subject: judge-calibration-and-drift
last_touched: 2026-09-10
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

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 12
owned documents read in full: the golden path, seven techniques, four
applications. Two of the subject's load-bearing citations were resolved to their
primary sources this run.

**Retraction.** The earlier 2026-09-10 record on this note assigned `reverify`
across the subject and described repairs to the trust-bar and repeatability
documents. Those repairs were part of the compression pass reverted the same
day, and its central objection — that repeatability is presented as "a hard
minimum detectable effect" without acknowledging sampling variation — is
answered in the reverted text it was measuring: `repeatability-floor` states the
floor as the threshold beneath which "a per-cycle drop is not an early warning,
it is a draw", and the golden path frames a calibration cycle as reporting "one
sample of kappa", not kappa. Its objection to the human-agreement ceiling is
sharper and survives in narrowed form (see the counterexamples below), but the
blanket `reverify` is retracted.

**Sources checked (read, not executed).** arXiv:2404.18796 is "Replacing Judges
with Juries: Evaluating LLM Generations with a Panel of Diverse Models", and its
abstract carries every element `judge-selection-by-spread` and the process
application attribute to it: a panel of smaller models outperforming a single
large judge, less intra-model bias from disjoint model families, "over seven
times less expensive". arXiv:2403.17710 is "Optimization-based Prompt Injection
Attack to LLM-as-a-Judge" (JudgeDeceiver), CCS 2024, matching the
`trust-bar-verdict` and process-application framing of in-band attack that
fencing does not close. Neither citation is misattributed.

**The finding that would justify a content change: unreachable evidence.** The
subject's most consequential quantitative claims — the 23% verdict-flip rate,
the 21% median divergence, and the 32%/5%/3% per-dimension decomposition — appear
in the golden path and in `repeatability-floor` attributed only to "a public
grading pipeline that scores code changes against a rubric". No source is named
in either document. The provenance does exist, in this note's 2026-08-31 entry
and at `librarian/sources/2026-08-31-danluu-2026.md`, but a reader of the
technique cannot reach it, and the 32%/5%/3% split is load-bearing enough that
the technique states a doctrine on top of it ("a composite's repeatability is
dominated by its least repeatable dimension"). Every other externally-sourced
claim in this subject names its paper. These should too. This is the subject's
one genuine `clarify`, and it is about citation, not about the claim: nothing
found this run contradicts the numbers.

**Second, smaller finding.** `golden-set-agreement-measurement`'s metric table
gives kappa the blind spot "depends on the chosen threshold; degenerate under
extreme class imbalance", and the paragraph beneath it explains "degenerate" as
the divide-by-zero case where both raters put every item in one class. The
subject's own process application landed a different imbalance failure — the
kappa paradox (Feinstein & Cicchetti 1990), where kappa reads *low* despite high
genuine agreement — and concluded "the bar stays; the reading gains a caveat".
That caveat is in the application and not in the technique, so the only document
a reader consults when interpreting a low kappa does not carry it. The two
directions of imbalance failure should be distinguishable in the technique.

**Not evaluated.** No calibration run, no golden set, no judge invocation; the
`node--repeatability-floor` simulation's structural count (0 overlapping pairs of
142) was not recomputed and the corpus it counted was not opened. The
`process--judge-selection-by-spread` bake-off table (four judges, n=12) rests on
a document inside a tree this review did not read. `process--golden-set-agreement-measurement`
carries `refresh_by: 2026-11-20` and its adversarial half was not re-surveyed.

**Frontmatter note, not a content finding.** `applications/node--repeatability-floor.md`
carries no `status:` key where every other application in this subject does; it
is one of four such applications in the bundle. Whether that is a schema
requirement is the gate's question, not this review's.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/judge-calibration-and-drift",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f5c7c90dc5531e2d",
  "disposition": "keep",
  "coverage": "All 12 owned documents read in full against the reverted bytes. Two arXiv citations resolved to their abstracts by reading. Not evaluated: any calibration run, judge invocation, golden set, or recomputation of the node application's structural count; the LightTrack bake-off document and CALIBRATION.md the process and rust applications cite; and the adversarial literature the process application dates to 2026-08-20.",
  "counterexamples": [
    "Where a golden set's human labels are adjudicated to a single reference rather than left as independent annotations, inter-annotator kappa is not a strict ceiling on the judge's kappa — the golden path states the ceiling unconditionally.",
    "A judge whose repeatability floor is measured at 3% on a near-mechanical dimension and 32% on the subjective one still yields a composite the subject forbids computing; the technique says measure per dimension but gives no rule for a rubric whose gate is a single weighted score.",
    "A subject with a rubric under active iteration has no windowed detector (correctly muted) and a per-cycle detector whose every drop is a method change; both drift horizons are blind at once, and neither document says what covers that window."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2404.18796",
      "result": "Read (not executed). Confirms the PoLL attribution exactly: a panel of smaller models from disjoint families outperforming a single large judge, with less intra-model bias, 'over seven times less expensive'. Does not establish the panel's own kappa, which is the gap the process application itself names."
    },
    {
      "url": "https://arxiv.org/abs/2403.17710",
      "result": "Read (not executed). Confirms JudgeDeceiver as an optimization-based prompt-injection attack on LLM-as-a-judge, CCS 2024, with perplexity-style defenses found insufficient. Does not establish the committee-defense success rates the process application attributes to arXiv:2504.18333, which was not resolved this run."
    }
  ],
  "documents": {
    "judge-calibration-and-drift.md": {"disposition": "clarify", "reason": "Sound throughout — the three movements, the trust firewall, the two drift horizons and the floor-bounds-everything consequence all hold. One repair: the repeatability figures ('flipped the published verdict 23% of the time') are stated with no citation a reader can follow, unlike every other external claim in the subject. Separately, 'the human inter-annotator kappa on the same set as the ceiling no judge can be expected to beat' is unconditional where adjudicated references are a real exception."},
    "techniques/golden-set-agreement-measurement.md": {"disposition": "clarify", "reason": "The metric family, the frozen-set rules, the hostile stratum and the power-honesty rules are all sound. The kappa blind-spot cell says 'degenerate under extreme class imbalance' and the text beneath explains only the both-raters-one-class divide-by-zero case; the kappa paradox the subject's own process application landed (low kappa despite high genuine agreement) is not distinguishable here, so the document a reader consults when interpreting a low kappa lacks the caveat its sibling application concluded was owed."},
    "techniques/judge-selection-by-spread.md": {"disposition": "keep", "reason": "Spread-as-disqualifier, the rotten-middle rule, price-as-tiebreaker, the panel-as-one-instrument discipline and reasoning effort as part of judge identity are internally consistent, and the PoLL claim was verified against the paper this run. The method-change re-verification rule is stated with the right consequence (never compare batched against unbatched)."},
    "techniques/repeatability-floor.md": {"disposition": "clarify", "reason": "The measurement, the three-quantity table, the per-dimension rule and the threshold-multiplies-the-floor consequence are the subject's strongest material and the floor is already stated as a draw-vs-signal boundary rather than a hard bound. Same repair as the golden path: the magnitudes it rests on name no source, and the doctrine built on the 32%/5%/3% decomposition is load-bearing enough to need one."},
    "techniques/reserved-rubric-persistence.md": {"disposition": "keep", "reason": "The record shape, the three load-bearing decisions and the four things riding the existing store buys are concrete and internally consistent; the leakage boundary ('fix the surface before adopting') is stated as a precondition rather than a caveat. Nothing here depends on an external claim."},
    "techniques/scheduled-recalibration.md": {"disposition": "keep", "reason": "The four-step cycle, the two per-cycle trigger levels, the exit contract distinguishing untrusted from crashed, and the cadence rules hold. The closing rule against widening the delta mid-slide is the right form of the anti-gaming warning."},
    "techniques/trust-bar-verdict.md": {"disposition": "keep", "reason": "The three-state verdict, the capability table, the non-transfer scope rules and the committee-as-one-instrument discipline are coherent, and the attack framing rests on a citation verified this run. The 0.6/0.8 bar is presented as field-common convention, not as derived truth, which is the correct posture."},
    "techniques/windowed-score-drop-alerting.md": {"disposition": "keep", "reason": "The detector, its refusals (below min-samples, degenerate baseline), the warm-up blindness and its pairing with the memoryless check are stated with the failure each design choice prevents. The closing rule — an alerting heuristic is not a release gate — draws the boundary the subject needs."},
    "applications/node--repeatability-floor.md": {"disposition": "keep", "reason": "The structural fact (0 of 142 pairs judged twice) is the finding, and the document is explicit that the floor for this pipeline is still unmeasured and that the three cases predict rather than demonstrate. Its own ceiling is stated. Not recomputed this run; carries no status frontmatter key, unlike its siblings."},
    "applications/process--golden-set-agreement-measurement.md": {"disposition": "keep", "reason": "The dated survey's two verifiable citations were resolved to their abstracts this run and matched. Its kappa-paradox conclusion is the caveat the technique still lacks — which makes this document the evidence for that finding rather than a defect in it. refresh_by 2026-11-20 governs the adversarial half, which was not re-surveyed."},
    "applications/process--judge-selection-by-spread.md": {"disposition": "keep", "reason": "The bake-off table reads as a faithful instance of the technique's decision rules, including the two failure shapes (narrow spread disqualifying; wide spread with a rotten middle) on named numbers, and the limits travel with the decision as the technique requires. The cited BENCHMARK_FRAMEWORK.md was not opened this run."},
    "applications/rust--windowed-score-drop-alerting.md": {"disposition": "keep", "reason": "Realizes the detector including the .max(4) parse-time floors, the no-verdict-is-not-no-regression return, the evidence-carrying alert and the per-key cooldown, and names the runner-side half that covers the warm-up. The cited seams were not opened this run."}
  }
}
```
