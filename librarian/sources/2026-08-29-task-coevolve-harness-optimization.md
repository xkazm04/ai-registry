---
source: youtube:MvI17TNFW9c
kind: second-hand paper review (one preprint, relayed by a channel)
url: https://www.youtube.com/watch?v=MvI17TNFW9c
title: "AI Creates New Harness by Ignoring 80% of Evaluation?"
author: Discover AI (channel); paper by a university agent-science group, arXiv 2608.20169
words: 2744
extracted: 8
accepted: 1
declined: 0
leads: 2
already_covered: 2
untriaged: 3
dispatched: 0
fetches_spent: 2
---

# A channel relaying one preprint on adaptive validation-task selection

Part of [[index]].

## The class, and the expected yield

A second-hand paper review: one presenter walking through one preprint, with the
presenter's own thesis ("which experiment to run is the real bottleneck of
self-improving systems") layered on top. Reliable for *that* the paper exists and
for its headline numbers; unreliable for the protocol, which the video summarises
as "a lot of statistics". For this class the fetch is the extraction, so the run
planned to spend it: expected yield stated before triage was one technique or
amendment plus a dated-fact lead. Actual: **one technique + one golden-path
section + one amendment**, two leads, two catches, **2 of 3 fetches** (search,
then the paper's HTML) - the first run since 2026-08-27 to spend any, and both
were extraction, not corroboration.

## Landed

**`discriminating-task-selection`** (new technique, `eval-harness`, 10 -> 11).
Strip test: remove every proper noun and what is left is "a scenario carries
ranking information only where candidates disagree on it; select per round from a
frozen pool by outcome variance, keep the rule out of the candidates' hands, and
report weighted full-pool estimates rather than raw counts over the drawn subset."
The subject had a **missing stage**: it is exhaustive on making one candidate
comparable with itself across time and on pricing the matrix, and had nothing at
the point where a selection search decides *which cells to run*. The paper's
protocol supplied the rule with its two non-obvious corrections (a floor for
never-solved scenarios so an improving population can reach them; an uncertainty
bonus for rarely-run ones) and the two estimators (inclusion-probability
weighting; anchored differences). The paper's own stated limitation - the budget
per candidate is fixed before any result is seen, so no early stop and no
extra spend on a close pair - is in the technique as its cost.

The finding's best half was the **inversion**: `eval-economics` praises the
golden set precisely for being frozen and saturated with always-pass scenarios,
and that is correct *for a regression gate* and exactly wrong *for a selection
survey*. The technique states the discriminator (the question, not the pool) and
`eval-economics` gained a paragraph under its matrix row plus a `use_when` case
("a selection survey is being run on the regression golden set"). Golden path
gained the section "When the harness ranks a population, most of the suite is
silent".

Corroboration: training-data convergence (item discrimination in adaptive
testing; Horvitz-Thompson weighting for unequal-probability samples - reached
without the source) plus corpus-internal convergence: `recruiting`'s
`assessment-instrument-validation/discrimination-margin-gate` already holds "correct
rank order is not evidence of discrimination", the same root from the other side.
Not linked (cross-bundle); recorded here.

**Boundary recorded against `quality-gates/oracle-frozen-during-repair`** (landed
the same day, previous run). The video says "the evaluator should not remain fixed";
that technique says the oracle must be frozen. Both are right and the discriminator
is *what moves*: the pool and its labels are the oracle and stay frozen; the
selection over the pool moves, from a rule the ranked party cannot write. A
selection the candidate can steer is an editable oracle. The technique says this in
its second section so nobody reads the two as a contradiction.

## Leads

- **Dated fact, banked.** In the paper's protocol: 7% of the full evaluation
  budget ranked within one point of exhaustive search (47.6 vs 48.6), 20% exceeded
  it (49.3); on the agent benchmark, 20% budget gave 61.8 vs 62.9 and 41.6 vs 42.7
  with 80% / 67% fewer input tokens and 1.9x less wall time. An application-grade
  fact with no tree opened. **Return when a connected project runs a candidate
  search over a suite** - then it becomes the application this technique lacks.
- **Presenter's thesis: the bottleneck of self-improving systems is choosing the
  discriminating experiment, not writing code.** Doctrine-altitude, one voice, from
  the channel rather than the paper. **Return on a second independent source** that
  says it with a measurement; if the corpus then holds three sightings (this,
  `failure-attribution`'s "a red case names a layer", `discrimination-margin-gate`)
  it is a law candidate about instruments, not about agents.

## Already covered

- "Static public datasets provide the wrong learning signal" - `scenario-design`
  (captured vs generated) and `unaided-baseline-screening` (a scenario the prior
  alone answers measures the model, not the system) already say the sharper form.
- "Normalise across iterations that saw different subsets" as a *standalone* item -
  folded into the technique's estimator section rather than banked separately.

## Untriaged (nobody verified these; recorded so they are not re-derived)

| # | Candidate | Anchor | Strip | Why untriaged |
| --- | --- | --- | --- | --- |
| 5 | Meta-agent search shape: 3 candidates x 20 rounds, 1 x 10 for the expensive benchmark | [00:03:56] | nothing | application-grade, no tree |
| 7 | "Match data complexity to structural harness complexity" | [00:16:02] | thin | presenter's closing slogan, no rule inside it |
| 8 | Selection reduces elapsed time by half because proposal cost is fixed | [00:10:46] | partial | true of the paper's protocol; would be a sentence in the technique's cost section at most |

## Declines

None.
