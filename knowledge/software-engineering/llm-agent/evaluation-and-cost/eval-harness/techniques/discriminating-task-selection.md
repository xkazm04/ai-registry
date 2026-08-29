---
layer: technique
type: technique
subject: eval-harness
technique: discriminating-task-selection
status: forged
laws: [count-carries-predicate, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [a search over many candidate configurations re-runs the whole suite per candidate, most scenarios come back the same for every candidate, ranking candidates from a partial run, a selection suite has quietly stopped separating anything]
---

# Discriminating task selection

When the harness ranks a **population** of candidates — variants of a prompt,
an agent scaffold, a tool set, a configuration — the question it answers is
"which of these is better", and a scenario contributes to that answer only
where the candidates *disagree* on it. A scenario every candidate passes and a
scenario every candidate fails both return the same verdict for every row; they
cost a full cell each and move no ranking. In a mature suite those two classes
are the majority: one 2026 measurement over a command-line agent benchmark
found 34 of 89 tasks solved by nearly every candidate, 32 solved by none, and
23 with mixed outcomes — over 70% of the budget bought no discrimination at
all. The technique is to **select the scenarios a candidate runs from the
outcome history, weighting toward the ones the population is split on, and to
keep the selection moving as the population moves** — because the frontier of
"split" migrates as candidates improve, and a subset chosen once decays into
the same saturated set it replaced.

## The pool is frozen; the selection is not

Two different things are being held still and one is being allowed to move,
and confusing them is how this technique turns into a way of cheating.

- **The pool** — the full scenario set, its identities, its labels — is a
  versioned fixture exactly as [scenario-design](./scenario-design.md)
  requires, and it does not change during the search
  ([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).
- **The selection** — which pool members a given candidate is run on — is
  recomputed per round from a declared rule over the outcome history.
- **The rule is not writable by the party being ranked.** The candidate
  proposer never sees or influences which scenarios were sampled; the
  selector reads outcomes, never candidate internals. A selection the
  candidate can steer is an oracle it can edit, and the whole reason a green
  result means anything is that it could not
  ([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## The selection rule

The information a scenario carries about a ranking is, to first order, the
variance of its outcome across candidates. For a pass/fail scenario with
historical pass rate `p`, that is `p(1-p)`: zero at both extremes, maximal at
a coin flip. Sample scenarios with probability proportional to that weight,
with two corrections that the raw variance gets wrong:

- **A floor for never-solved scenarios.** `p = 0` weights to zero, which
  would permanently exclude a scenario that nobody has solved *yet* — and
  the ones nobody has solved are exactly where an improving population will
  next separate. Give them a small fixed weight so they keep being tried.
- **An uncertainty bonus for rarely-run scenarios.** A pass rate estimated
  from two observations is not a pass rate; add a term that shrinks with
  the number of times the scenario has been observed, so the history the
  rule reads is not itself an artifact of the rule.

Both corrections are the discipline the golden path applies to a single
run — a small `N` is stated, not hidden — applied to the selector's own
inputs.

## Partial results must be made comparable before they are ranked

Two candidates evaluated on different subsets have sat different exams. A
raw pass count over "the scenarios I happened to be given" compares nothing,
and it compares nothing in a specific, dangerous direction: a candidate that
drew easier scenarios looks better. Every reported number is therefore an
*estimate of the full-pool score*, and it carries the estimator that produced
it ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)):

- **Inclusion-probability weighting.** Each sampled outcome is weighted by
  the inverse of the probability that its scenario was selected this round,
  so over-sampled hard scenarios do not drag the estimate down and
  under-sampled easy ones do not lift it.
- **Anchored differences.** Where the history is rich, weight not the
  outcome but its deviation from the scenario's historical pass rate. The
  estimate then answers "how much better than the population's usual result
  did this candidate do on the scenarios it saw" — which is the ranking
  question, and is far lower-variance than the raw score.

The inclusion probabilities are a property of the rule and the history, so
they are computable and are stored with the round. A score without them
cannot be re-estimated and cannot be compared to a round that sampled
differently.

## What this buys and what it costs

The measurement above ranked candidates within about one point of an
exhaustive search while running roughly a fifth of the cells, and at one
budget slightly *out*-ranked the exhaustive search — which is not
paradoxical: concentrating trials on the split scenarios estimates the
ranking, not the score, with less noise than spreading them evenly. The cost
is the one the study's authors name themselves: the budget per candidate is
fixed *before* any of its results are seen, so the scheme can neither stop
early on a candidate that is already clearly worse nor spend more on two
candidates that are hard to tell apart. A selector that adapts *within* a
candidate's run is a different, sequential design and is not what this
technique describes.

## Where this inverts: regression gates want the saturated scenarios

The discriminator between this technique and the frozen golden set in
[eval-economics](./eval-economics.md) is the question the run answers.
**"Which candidate is better"** is a ranking, and a scenario every candidate
passes is dead weight. **"Did this one regress"** is a gate, and a scenario
the shipped system always passes is the *entire* content of the check — the
day it fails is the day the gate earned its place. The same scenario this
technique de-weights to nearly zero is the one a regression gate must run
every time. So the two slices are built from the same pool with opposite
selection rules, and the modes in [comparison-modes](./comparison-modes.md)
say which you are in: matrix and arena runs select for disagreement;
absolute gating runs the frozen slice. A team that applies this weighting to
its release gate has built a gate that never sees the regression it exists to
catch; a team that runs its selection search on the golden set is paying full
price for a ranking the set cannot produce.

## Applications

None yet forged. The first honest application is a search that already
re-runs a whole suite per candidate and records its outcome history per
scenario identity; the structural check is whether the selection rule sits
somewhere the candidate proposer cannot write to.
