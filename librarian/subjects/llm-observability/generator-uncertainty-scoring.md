---
subject: generator-uncertainty-scoring
domain: llm-observability
last_touched: 2026-09-03
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
