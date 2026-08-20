---
layer: application
type: application
subject: judge-contract-design
technique: nonce-fenced-candidate-isolation
stack: process
status: forged
applied: 2026-08-20
refresh_by: 2026-11-20
---

# Process: the judge-attack field layer, dated 2026-08-20

The subject's hostile-input and bias doctrine now has a fast-moving
published layer around it. This application records where the field stood
on 2026-08-20 — attack classes with names, measured defense efficacy, and
the rubric-contract conventions of the major eval frameworks — so the
techniques' claims can be checked against something dated. Re-verify by
the refresh date; this literature turns over in months.

## The attack layer has names, and most of it never touches a boundary

- **JudgeDeceiver** (Shi et al., CCS 2024, arXiv:2403.17710) is the
  canonical optimization-based attack: a gradient-optimized ~20-token
  sequence injected into an attacker-controlled candidate makes the judge
  select it regardless of competitors. Its adversarial-perplexity loss
  keeps the sequence *naturalistic* — it evades known-answer detection at
  90–100% false-negative rates and perplexity-family detectors at 40–100%.
  Nothing in it forges a section marker, so a nonce fence neither blocks
  nor flags it. This is the concrete instance behind the technique's
  "quiet flag ≠ clean input" rule.
- The 2025 taxonomy in arXiv:2504.18333 names four manual/search classes —
  Basic Injection (29.8–66.7% success), Complex Word Bombardment
  (25.3–55.5%), Contextual Misdirection (38.5–67.7%), and Adaptive
  Search-Based genetic optimization (42.9–73.8%) — with frontier judges
  roughly half as vulnerable as small ones (≈35–42% vs ≈66%).
- A Security-in-LLM-as-a-Judge SoK (arXiv:2603.29403) and RobustJudge
  (arXiv:2506.09443) now systematize the space; "judge robustness" is a
  recognized subfield, not folklore.

## Measured delimiter/nonce efficacy: large, real, and not sufficient

A 13-model / ~5,500-case community benchmark (dev.to, Whetlan, 2026)
measured random-delimiter fencing at **89.7% defense vs 60.7% without**
(+29pp), with strong models saturating at ~100% and weak ones stuck at
~59% *with* delimiters; a terse "strict" boundary contract beat a
threat-model explanation (96.3% vs 89.1%), and delimiter mimicry was among
the least-defended attack shapes — both of which support this subject's
choices (a declarative preamble; visible neutralization of imitations).
The residual is exactly the in-band class above. Field consensus on
closing it is defense-in-depth *outside* the prompt: multi-model
committees cut attack success to 10–19% at seven mixed models
(arXiv:2504.18333), which is the calibration discipline's territory, not
this contract's — see proposals to the sibling subject.

## Verbosity: the instruction is gameable; the length regression is not

Length-Controlled AlpacaEval (arXiv:2404.04475) is the field's structural
counterbalance for verbosity bias: the raw judged win rate of one fixed
model swung **22.9% → 64.3%** purely by varying a verbosity instruction,
while the length-controlled version — a GLM predicting preference from
length difference, then reading the preference at zero length delta —
narrowed that to 41.9–51.6% and *improved* human correlation (Spearman
0.94 → 0.98). This is the published measurement behind the technique's
"record length beside the score" rule: debiasing by regression
outperformed debiasing by exhortation, on the field's own benchmark.

## Rubric-contract practice in the frameworks converges with this subject

- **DeepEval / G-Eval** expresses rubrics as criteria with confined,
  non-overlapping score bands — anchored levels by another name — and
  forces reasoning *before* the numeric score so the verdict is
  conditioned on articulated evidence; per-dimension reasoning fields in
  the verdict schema are standard practice.
- **Promptfoo** ships weighted assertions mixing deterministic checks
  (equality, regex, JSON validity) with model-graded rubric assertions in
  one rollup — the same one-pipeline/two-sources shape as
  deterministic-dimension-kinds, arrived at independently.
- **OpenAI's grader stack** likewise separates string/label graders from
  model graders under one scoring surface.

What none of the surveyed frameworks make first-class as of this date:
stored rubric *versioning* with verdicts pinned to a version, floor
semantics reported per dimension, or the sampled-only agreement scope.
Those remain this subject's standard rather than field consensus —
confirmed as a real gap, not an omission in this survey.

## Sources

arXiv:2403.17710 (JudgeDeceiver, CCS 2024) · arXiv:2504.18333 (attack
taxonomy + committee defense) · arXiv:2603.29403 (SoK) · arXiv:2506.09443
(RobustJudge) · arXiv:2404.04475 (Length-Controlled AlpacaEval) ·
dev.to/whetlan 13-LLM delimiter benchmark (2026) · deepeval.com G-Eval
docs · promptfoo assertion docs.
