---
subject: generator-uncertainty-scoring
domain: llm-observability
last_touched: 2026-09-10
touched_by: intake
dry_streak: 0
---

# generator-uncertainty-scoring

Created by [[2026-09-03-awesome-langchain]]. Five techniques, forged in-session by a
dispatched worker against a spec written in the same session — `score-source-kinds`,
`scorer-cost-class`, `probability-calibration-is-not-agreement`, `generator-vs-itself`,
and `score-source-ensembling` (the worker's own addition, accepted).

## What the gap actually was

An **unstated premise load-bearing across a whole category**. Five subjects in
`quality-scoring` presuppose a judge, and four verified enumerations say so out loud:
"Every quality number ... flows through one instrument: the judge"; "One pipeline, two
sources of score"; the read-only-against-the-serving-path invariant, justified solely by
"The judge is a metered model call"; and "agreement is judge-vs-human, drift is
judge-now-vs-judge-then, repeatability is judge-vs-itself".

A score computed from the generator's own output distribution is neither of the two
sources, falsifies the invariant's premise (its marginal cost can be zero, so the
argument from unbounded spend does not reach it), and adds a fourth quantity —
generator-vs-itself, which is the apparatus the subject already points at the judge,
turned around. Four mechanisms, one home that did not exist: the XL trigger fired by
count rather than by judgment, which is what the v2 rule was written for.

## The correction that matters most

The claim that motivated the subject was **wrong in the opposite direction**. A wave
worker reported, through a fetch summarizer, that judge-free scorers "consistently
outperform" judges. It was marked `[H]`; the forge brief required re-derivation or
removal; and the worker read the papers directly. The spec's citation had conflated two
documents, the quoted figures were in neither, and among non-ensemble scorers **a model
judge was the best available in 11 of 24 scenarios** — the plurality. The genuine
"judge at chance" instance is a *small* judge on a math benchmark, while a large judge
on the same benchmark was the best scorer available.

The subject therefore carries a section titled "This is not a demotion of judges, and
the measurement says so". Director-verified from the primary notebook rather than from a
report: ECE 0.428037 → 0.030675 while MCE moved 0.511129 → 0.500000. Average calibration
honesty was bought; worst-bin honesty was not — and a gating floor is a worst-bin claim.

## Open

Two things the forge worker flagged as low-confidence, which a later pass should check:
a novel reading of the unbudgeted-quality-apparatus law, used in *tension* rather than
in support; and an error-correlation mechanism asserted for the ensembling technique
that the paper does not measure. A proposed law recurred three times and was
deliberately not minted — *a configuration fitted against labels is valid only over the
generator-and-task pair it was fitted on, and carrying it across either is an untested
extrapolation that fails silently*. Return if a second bundle sights it.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/generator-uncertainty-scoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:437fdfa98eeb2048",
  "disposition": "reverify",
  "coverage": "All 6 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Many different correct paraphrases can have high textual disagreement.",
    "Squaring scores preserves order but changes mean absolute error and generally Pearson correlation.",
    "A classifier cutoff tuned on held-out outcomes can be useful without interpreting its score as a correctness probability.",
    "Parallel samples can multiply token spend without multiplying wall time by N."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "generator-uncertainty-scoring.md": {
      "disposition": "reverify",
      "reason": "Token likelihood and sample consistency are different proxies, not correctness or guaranteed useful rankings. Mechanical checks need correct references and nonzero resources. No-extra-call is not zero latency; asynchronous judging is an architecture policy, not a necessity. Thresholds can be empirically validated without probability calibration; percentiles do not certify safety. The precise 24-scenario and ECE claims lack an identifiable primary citation in the owned documents and remain unverified."
    },
    "techniques/generator-vs-itself.md": {
      "disposition": "clarify",
      "reason": "Repaired disagreement as proof of ignorance, gate variance as necessarily nuisance, sampling control versus identical repeated seeds and mechanical checks as free truth. Multiple valid answers and target variability can be meaningful outcomes."
    },
    "techniques/probability-calibration-is-not-agreement.md": {
      "disposition": "clarify",
      "reason": "Repaired MAE and all concordance statistics as rank-invariant, ECE as per-item error, threshold as necessarily probability claim and worst bin as necessarily at the threshold. Raw rankings also require evidence of useful discrimination."
    },
    "techniques/score-source-ensembling.md": {
      "disposition": "reverify",
      "reason": "Different error families do not guarantee averaging improves performance. Equal or policy-selected weights need not be fitted from labels; learned weights require separated training/selection/test data and uncertainty. A fitted classification cutoff need not claim probability calibration. Model-generated labels have varying provenance and bias rather than universally no measurement value. Precise scenario counts and transfer findings lack an identifiable source here."
    },
    "techniques/score-source-kinds.md": {
      "disposition": "reverify",
      "reason": "A deterministic function of recorded probabilities can be reproducible; mechanical checks can use stochastic or expensive components and are not universally exact truth. Semantic consistency can employ an entailment model and prompt, so no-instruction-channel is not universal. Answerability/hedging are not directly measured by peaked likelihood. Normalizing a score to zero-to-one does not establish calibration or aggregation validity."
    },
    "techniques/scorer-cost-class.md": {
      "disposition": "clarify",
      "reason": "Repaired zero marginal latency, N-fold wall time, automatic paid fallback, self-hosting guarantees and cost-class-only serving prohibition. Quality and safety requirements constrain affordability; random sampling can estimate traffic quality with uncertainty."
    }
  }
}
```
