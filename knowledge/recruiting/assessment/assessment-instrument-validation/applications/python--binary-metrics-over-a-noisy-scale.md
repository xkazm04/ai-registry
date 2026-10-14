---
layer: application
type: application
subject: assessment-instrument-validation
technique: binary-metrics-over-a-noisy-scale
stack: python
verified_on: 2026-10-14
verified_against: python@3.12
applied: experiment
ab_verdict: not-better
---

# A 4.0 bar on a judge mean, and the binary that was too easy to replace it (the case-calibration gate)

The case-generation calibration gate in `pipeline/jobfit/devcase/calibrate.py`
is the technique's textbook target: `GATE["judge_case"] = 4.0` (`:79`) is a
target on the mean of a 1-5 score a model judge gives each generated case
(`evaluate_gate`, `:281-285`). The judge prompt asks for one holistic number
("Rate this output 1-5 for being specific, grounded, fair, and useful",
`lifecycle_audits.py:38`) and `quality_summary` (`:55-69`) averages it. The
gate's own comment concedes the weakness ("a breadth signal; the real bar is
the higher-vantage judge applied out of band"), and the frozen corpus
(`data/seed_calibration/FROZEN.json`) carries `passed: true` on a case mean of
**4.06** against the 4.0 bar - a margin of 0.06 on a scale of four.

## What was tried

Twelve frozen cases (every eighth of the 100), each judged three times, same
session, two prompts: the holistic 1-5 score, and four written yes/no
propositions (specific, grounded, fair, useful, each with a definition).
72 calls, 0 errors, default CLI judge.

| Measure | Result |
| --- | --- |
| Per-case score spread (max - min over 3 reps) | 0 on 8 cases, 1 point on 4; mean spread 0.33 |
| Mean score of the 12 cases, per rep | 3.25, 3.25, 3.17 (range 0.08) |
| Cases whose `score >= 4` verdict flipped across reps | 2 of 12 |
| Proposition rates, pooled over 36 judgments | specific 100%, fair 100%, useful 100%, grounded 94% |
| Cases whose all-four verdict flipped across reps | 1 of 12 |

## The verdict: the technique's premise did not reproduce here, and the replacement failed

- **The noise the technique warns about was small at the batch level.** A
  range of 0.08 across reps on a 12-case mean, and a per-case spread averaging
  a third of a point, is not "a point of drift on a five-point scale". At 100
  cases that per-case spread puts the sampling error of the mean near 0.03, so
  the 0.06 margin is about two of its own standard deviations: thin, but not
  noise-dominated. This is one judge, one session, three reps; it measures
  within-session repeatability, not the cross-session anchor drift the
  technique is about.
- **The binary rewrite was worse than the score it replaced.** Three of four
  propositions were true in every one of 36 judgments. A gate on a rate that
  sits at ceiling passes everything and moves for nothing: stability bought by
  losing the ability to discriminate. The technique says "when a binary is
  unstable, the proposition is underspecified"; the mirror case it does not
  say is a binary that is stable because it is vacuous.
- **The cross-wording gap is the part that does support the technique.** The
  same 12 cases averaged 3.2 under this run's wording of the rubric, against
  4.06 in the frozen run. Date, model default and prompt (the frozen prompt
  also asked for levers and a note) all differ, so the gap cannot be attributed
  to any one of them - which is the point: the 4.0 bar is only meaningful
  against the exact prompt and judge that produced 4.06.

## What was changed

Nothing in kp. Replacing the 4.0 mean with a rate over these four propositions
would have loosened a gate that currently fails a poor corpus (a case mean of
2.1 fails it, per `test_devcase_calibrate.py`), so the gate stays. The finding
is the reason a successor should write propositions that discriminate before
retiring the score: propositions anchored to a contrast ("the tasks name an
artifact a different role would not have") rather than to adequacy.

## Decision rule this adds to the technique

Before replacing a scored gate with a binary rate, measure the binary's base
rate on the corpus the gate has already passed. A proposition true in more than
about nine judgments of ten at the frozen corpus cannot fail a regression and
is not a derived fact worth tracking; keep the score gated until the
propositions split the corpus.

Not measured: cross-session drift, a second judge model, the original prompt
verbatim, any corpus other than the frozen 100, the analysis artifact's score.
