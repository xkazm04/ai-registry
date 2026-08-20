---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: reuse-the-production-scorer-not-a-model-of-it
status: forged
laws: [a-predictor-cannot-grade-its-own-labels, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [building a forecast or coach on top of an existing matching engine, a coach and the live pipeline disagree, deciding whether to approximate a scorer for speed]
---

# Reuse the production scorer, not a model of it

A pre-publish forecast makes a promise about what publishing will surface. The
only way to keep that promise is to make the forecast run **the same code
path** that publishing runs, with a mutated requisition substituted for the
real one. Not a reimplementation of the rules. Not a cheaper approximation.
Not a model fitted to historical scores. The same filter, the same weights, the
same thresholds, the same tie-breaks, the same treatment of missing data.

This is the load-bearing design decision of the whole subject. Every number the
coach emits derives its authority from it, and no amount of care elsewhere
substitutes.

## Why an approximation fails in a specific, ugly way

A parallel implementation does not fail loudly. It agrees with production on
the vast majority of candidates, because both were written from the same
understanding, and diverges exactly on the cases that decide small pools: the
candidate with an unrecorded language level, the boundary at which a years-of-
experience band rounds, the gate that is skipped when its input is unknown, the
tie-break between two identical scores.

Those are the cases that move a count from three to zero. So the coach promises
fourteen, the role publishes, nine appear, and the recruiter has learned
something worse than a wrong number: that the system's numbers are not
checkable. From then on the correct ones are discounted too. A forecast that is
occasionally wrong in an unpredictable direction is worse than no forecast,
because it consumes the trust that the rest of the scoring surface runs on.

There is also a self-grading problem. A coach validated against the outcomes
its own recommendations produced is measuring the effect of its advice, not its
accuracy
([a predictor cannot grade its own labels](../../_laws.md#a-predictor-cannot-grade-its-own-labels)).
Reuse sidesteps the question entirely: agreement is guaranteed by construction
rather than demonstrated by a study that would be confounded anyway.

## What reuse demands of the codebase

Reuse is not free — it constrains the design of the scoring engine permanently,
and the constraints are worth stating because they are usually discovered late.

1. **The requisition must be an argument, not an ambient read.** A scorer that
   loads the role from storage cannot be asked a counterfactual question. The
   role must be a value the scorer takes, so a mutated copy can be passed in.
   Retrofitting this is the single largest cost of adding a coach to a mature
   engine.
2. **Scoring must be free of side effects.** No writes, no event emission, no
   notification, no cache poisoning. The coach runs a scoring pass dozens of
   times over the same pool; every one of those must be observationally
   invisible.
3. **The pool must be addressable as a snapshot.** All counterfactuals read the
   same population, or the deltas are not comparable to each other or to the
   baseline.
4. **Determinism.** The same requisition over the same pool yields the same
   count twice. Anything stochastic in scoring — a sampled model call, a
   random tie-break — must be seeded or excluded from the forecast path,
   because a delta smaller than the noise is not a delta.
5. **The baseline pass is computed once and read many times.** The baseline
   scoring results feed the qualified count, the per-candidate gap map, and
   every comparison a counterfactual makes — so score the eligible population
   against the unmodified requisition once and keep the results. Re-running the
   same scorer over the same pairs for each reading is not just wasteful; two
   passes that were meant to agree are two things that can drift.
6. **Cost must survive repetition.** If a single scoring pass is expensive —
   a model call per candidate, say — a per-lever full re-score is unaffordable
   and the temptation to approximate returns. The correct response is to make
   the deterministic part of the scorer separable and to run counterfactuals
   over that, declaring plainly which component is held fixed, rather than to
   build a second scorer.

## Rules

- **No second implementation, at any size.** "It is only the eligibility
  filter, it is twenty lines" is how every divergence starts.
- **Substitute the input, never the logic.** All counterfactual variation lives
  in the requisition copy handed to the scorer.
- **Bind the forecast to the version that produced it.** A rubric or weighting
  change invalidates a stored forecast; it must be marked stale rather than
  silently re-meant under the new rules
  ([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
- **When a component genuinely cannot be re-run, say which.** A forecast that
  holds one scoring component fixed is still useful; a forecast that silently
  omits it is not.
- **Test agreement, not correctness.** The forecast's test suite asserts that a
  baseline forecast over an unmodified requisition reproduces exactly what the
  live matching path returns for the same role and pool. That single equality
  is worth more than any number of unit tests over a parallel implementation.

## When not to use this

There is no case for a parallel scorer in a forecast that claims to predict
what publishing will surface. There are, however, adjacent tools this technique
does not govern:

- **Exploratory analysis** that is labelled as such and makes no promise about
  a specific requisition's outcome — market studies, pool composition reports,
  rubric research. These may legitimately use their own simplified models.
- **A scorer that does not exist yet.** If there is no production matching
  engine, a forecast has nothing to reuse and should not pretend to predict;
  it can report raw pool composition against the stated requirements and label
  itself as a description, not a forecast.
