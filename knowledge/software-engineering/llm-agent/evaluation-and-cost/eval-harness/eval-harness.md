---
layer: golden-path
type: golden-path
subject: eval-harness
status: forged
techniques:
  - metric-role-contract
  - scenario-design
  - unaided-baseline-screening
  - overshoot-and-restore
  - assertion-vs-judgment
  - failure-attribution
  - judge-stability
  - comparison-modes
  - eval-economics
  - discriminating-task-selection
  - certification-levels
  - measurement-revision
  - reliability-aggregation
---

# Evaluation & benchmarking

An eval harness runs agents or models against declared scenarios and scores
the results — repeatably. The last word is the whole subject. Anyone can run
a model once and form an opinion; an eval harness exists so that the same
question, asked next month against a new version, produces an answer that is
*comparable* to this month's. Everything in this standard — pinned inputs,
versioned scenarios, pinned judges, declared aggregation — is in service of
comparability across time, because an eval whose numbers cannot be compared
across versions measures nothing except the mood of the run.

The subject boundary, stated up front. The
[test-harness](../../../engineering-process/build-and-release/test-harness/test-harness.md) subject owns deterministic
suite machinery — lanes, fixtures, isolation, scheduling — and explicitly
defers the non-deterministic lane to this subject: what changes when the
system under test does not return the same output twice. Composite score
arithmetic — weights, normalization, gap ranking — belongs to
[scoring-rubrics](../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md); this subject decides
*what gets scored and how the measurement stays honest*, then hands the
numbers over. Pulling a machine-readable verdict out of a judge's prose is the
[structured-output](../../prompt-and-context/structured-output/structured-output.md) subject's
extraction problem; this subject only insists the verdict channel exists.

## The decision comes before the instrument

Everything below is machinery for producing comparable numbers. What the
numbers are *for* is decided first, and it is not a measurement question. A
suite that never answered it produces a row of metrics all wearing the same
hat, and the first result that moves two of them in opposite directions gets
settled by whoever argues best — after the fact, holding a result they like.

The contract is one sentence: **exactly one metric is optimized, and every
other metric is a threshold that is either cleared or not.** The optimized
metric is the one the work exists to move. Everything else — the class of
error the system may not increase, and the operational facts that decide
whether a result is deployable at all — carries a declared number and
contributes nothing to the verdict while it stays on the right side of it. A
large gain that breaches a declared threshold does not advance, and
renegotiating the threshold after seeing the result is the same move as
choosing an aggregation after seeing the data.

Which metric is the constraint is settled by asking **which error cannot be
taken back** — not which is larger, and not which the team talks about more.
An error someone can notice and undo costs attention; an error that silently
removes something costs whatever it removed, and the user never learns it
happened. That asymmetry is why two metrics that are mathematically symmetric
are almost never symmetric in a product, and why folding them into one
composite score produces a number that is highest exactly where the product
is worst
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)). Full contract:
[metric-role-contract](./techniques/metric-role-contract.md).

## Non-determinism changes the contract

A deterministic test asserts a fact: given this input, that output, pass or
fail. A non-deterministic system voids that contract. The same scenario, run
twice, produces different outputs — sometimes cosmetically different,
sometimes different in the property being measured. Three consequences
follow, and each one restructures the harness:

**Pass/fail becomes a distribution.** The honest result of an eval is not "it
passed" but "it passed k of N runs under these conditions." A single run
proves nothing in either direction: one success is compatible with a 20%
success rate, one failure with 95%. The harness therefore runs each cell N
times with N *declared* — and the aggregation (mean, median, worst-of-N,
pass-rate against a threshold) declared alongside it, because a score that
travels without its aggregation rule will be compared against a score
computed differently
([_laws: count-carries-predicate_](../../../_laws.md#count-carries-predicate)).
That list of rules is not closed, and the entry it is missing is the one most
shipping decisions rest on: the probability that *every* attempt succeeds,
which falls as trials are added where the others rise. reliability-aggregation
owns the choice between it and its optimistic twin, and why the pair is worth
more than either.

**Repeatability is engineered, not assumed.** Whatever *can* be pinned, is:
input fixtures frozen, sampling seeds fixed where the platform honors them,
temperature and generation parameters recorded in the run artifact.
Whatever cannot be pinned is *surrounded* — repeated trials, declared
aggregation, and variance reported next to the mean. The residual
non-determinism is stated, not hidden: a harness that silently averages away
variance is telling you the system is more stable than it is.

**Flakiness stops being noise and becomes signal.** In a deterministic suite,
intermittent failure indicates a defect in the test or the harness. Here,
variance across identical runs *is a measurement* — of the system's
stability under the scenario. The harness records it as a first-class output
rather than retrying until green.

## The judge is inside the system under measurement

Where a property cannot be asserted mechanically, a model judges another
model's output — and the moment that happens, the judge is a component of the
instrument, with all the obligations instruments carry. An unpinned judge
makes every score incomparable across time: when the judge silently upgrades,
scores shift with no change in the system under test, and the trend line —
the most valuable artifact the harness produces — becomes fiction.

So the judge is **pinned** (model, version, parameters, rubric, exemplars —
the whole packet), its **drift is measured** rather than assumed away
(re-score a frozen anchor set on a schedule; movement in anchor scores is
judge drift by construction, since the anchors did not change), and its
**biases are treated as known systematics**: judges disagree with each other
far more than their confident tone suggests, and they measurably prefer
outputs from their own model family. A verdict from a single judge of the
same family as the candidate is a conflict of interest wearing a lab coat.
The full discipline is [judge-stability](./techniques/judge-stability.md).

And one bias belongs in the golden path itself because it is about *you*,
not the judge: **confidence is weak evidence — the judge's and yours.** A
judge will score work highly while its own reasoning log contains
unsubstantiated claims against it. A green verification gate that asserts
data round-tripped is not a gate on behavior: it confirms numbers landed in
an artifact, not that the artifact means anything
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)). The corrective
is unglamorous and non-negotiable — a human, or at minimum a different
instrument, periodically observes the *actual outputs* the scores summarize.
Every mature eval practice converges on the same ritual: read the transcripts.

## Scenarios are versioned fixtures

A scenario — the input, the context, the expected-property declaration — is a
fixture with an identity, and that identity must survive everything the
harness does to it: reordering, reuse across suites, regeneration
([_laws: identity-survives-reuse_](../../../_laws.md#identity-survives-reuse)).
Scores attach to scenario identities; a scenario that silently changes
under a stable name poisons every historical comparison made through it.

Scenarios come from two sources with opposite failure modes. **Captured
reality** — real transcripts, real defect reports, real inputs that once
broke production — is representative by construction in its *inputs*, but
accumulates slowly, clusters around what already went wrong, and arrives with
a workflow outcome where a label is needed. **Generation** — a model
synthesizing scenarios from a specification — scales coverage cheaply but
inherits the generator's blind spots and adds a second source of
non-determinism. The mature harness uses both, and treats generated
scenarios with a specific discipline: they are **cached, and the cache key
is deliberately scoped**. The key includes what defines the scenario's
identity — the specification, the generator's version, the seed — and
*deliberately excludes* the candidate-specific material the scenario will be
run against. That exclusion is the point: when the system under test changes
version, the scenarios stay fixed, so the version delta is measured against
a constant instrument instead of a regenerated one. A cache key that
accidentally includes candidate material regenerates the exam whenever the
student changes — every comparison silently becomes apples to oranges. The
key's scope, and what invalidates it, is written down where the cache lives
([_laws: derivation-names-recomputation_](../../../_laws.md#derivation-names-recomputation)).
Full treatment in [scenario-design](./techniques/scenario-design.md).

## A pass is evidence only where a failure was reachable

Everything above assumes the scenario could have gone red. That assumption is
load-bearing and it is not free, because the candidate arrives already knowing
things. A scenario drawn from the material under test is frequently answerable
*without* that material — from the model's prior alone — and such a scenario
passes honestly, scores normally, and measures the model rather than the
system. It cannot be spotted by reading it; it has to be screened, by running
the scenario against a candidate deprived of the thing under test and
discarding everything the deprived run satisfies. What survives is the suite;
what was extracted was intake. The deprivation chosen *is* the claim the suite
supports, which is why it is written down beside it
([unaided-baseline-screening](./techniques/unaided-baseline-screening.md)).

The same assumption fails from the other end whenever the harness is used not
as a gate but as a **bound on a search** — an agent told to shrink, prune, or
tighten something until the suite complains. There the incentives invert: the
null change is always green, so an all-green run is compatible with having
done nothing, and "stopped early" and "reached the limit" are spelled
identically. The corrective is to require the run to cross the boundary at
least once and then restore the minimum that clears it, keeping both states —
the failing attempt is the only coordinate the run produces
([overshoot-and-restore](./techniques/overshoot-and-restore.md)). The two
compose in one order only: screen the suite, then push against it, because
pushing against unscreened scenarios finds a boundary that is not there.

## A red case names a layer, not a defect

The screening rules above distrust a green result. The same distrust is owed
to a red one, and it is the half a harness usually skips: a failing case is
evidence that something between the scenario and the score is wrong, and the
system under test is only one of the candidates. Seven layers can own a
failure — the label, the dataset, the input construction, the pipeline, the
tool surface, the prompt, the model — and they are checked in that order,
most upstream first, because a wrong label produces a wrong-looking output
further down and attributing it to the model is how the wrong fix gets
shipped. The tool surface is the row that only agentic systems have, and
the one the other six quietly route to the model: a call made wrongly
because a schema was ambiguous fails the prompt's tell and the pipeline's
tell alike, so a strictly followed funnel lands it in the residual bucket
and prescribes a model change for a description problem.

Two of the six are not the system at all. A case whose expected property is
wrong, and a case that is unrepresentative of anything a user will do, both
go red without a defect existing; the "fix" for either, applied to the
system, improves the score while moving the system away from correct. That is
the same third-state discipline the harness already applies to runs — a crash
is not a low score — pushed one level down to the case
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).

Attribution is manual, is done on a sample from both tails, and produces
*classes* rather than cases: five failures owned by the same missing field is
a change you can design and measure, while one attributed case is an
anecdote. And the class that resists all six owners is the most valuable
thing the review produces — it means competent reviewers disagree about the
right answer, which is a product policy nobody has written, not a model
weakness. The discipline is
[failure-attribution](./techniques/failure-attribution.md).

## Assert what you can, judge only what you must

Between "exact string match" and "ask a judge" lies a wide band of
deterministic assertions — schema validity, required and forbidden content,
bounds, invariants over extracted fields — and every property that can live
in that band, should. Deterministic assertions are free to run, immune to
judge drift, and their failures are self-explanatory. The judge is reserved
for properties that genuinely resist mechanization: tone, faithfulness,
helpfulness, quality-against-a-rubric. The layering — assertions as a cheap
outer gate, judgment inside it, and a structured verdict channel so scores
are machine-readable — is [assertion-vs-judgment](./techniques/assertion-vs-judgment.md).

The comparison *shape* is a separate decision: absolute scoring against a
rubric, pairwise arenas producing win-rates, or full matrix runs across
model × variant × scenario. Each answers a different question and each has
a characteristic way of lying; [comparison-modes](./techniques/comparison-modes.md)
carries the decision table.

## When the harness ranks a population, most of the suite is silent

Everything above holds the instrument still so that one candidate can be
compared with itself across time. Turn the harness around — many candidates,
one round, "which is best" — and a different economy applies: a scenario
contributes to a ranking only where the candidates *disagree* on it, and in a
mature pool the scenarios everyone passes plus the scenarios nobody passes
are the majority of the cells. The frozen golden set that makes a regression
gate cheap is, for a selection search, mostly dead weight. The corrective is
to keep the pool frozen and let the *selection* move: sample each round
toward the scenarios the population is split on, from a rule the candidates
cannot influence, and report every partial result as a weighted estimate of
the full-pool score rather than as a raw count over whichever scenarios were
drawn. The same scenario a selection search de-weights to nothing is the one
the release gate must run every time; which rule applies is decided by the
question, not by the pool
([discriminating-task-selection](./techniques/discriminating-task-selection.md)).

## Certification has levels

Expensive empirical evaluation is gated behind cheap theoretical passes. The
first level reasons over a *derived model* of the system — its declared
surface, its wiring, its contracts — and is cheap enough to run broadly and
in parallel; the second level drives the *live system* and observes actual
behavior, at real cost, serially where the product demands it. The levels
are ordered by the same logic as any fidelity ladder: catch what a static
pass can see before paying for the empirical run, but never mistake the
first level for the second — only the live level observes behavior, and a
candidate certified theoretically has been certified against a proxy
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)). Promotion
criteria between levels are declared, not vibes-based; the design is
[certification-levels](./techniques/certification-levels.md).

## Eval spend is budgeted, because a stopped eval is worse than none

Every cell in the eval matrix costs real money and real minutes, and the
matrix grows multiplicatively — models × variants × scenarios × N trials.
Left unmanaged, the suite's cost curve crosses the team's patience curve,
someone stops running it, and the organization keeps *citing* results that
are no longer being produced. A stale eval is worse than no eval: it
manufactures confidence with no instrument behind it
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)
at suite granularity — "we have evals" must be distinguishable from "we ran
them").

The controls are structural, not disciplinary: **mock execution modes** so
the harness's own logic is testable at zero model cost, **caches with
declared lifetimes** so repeated runs reuse expensive intermediates,
**fan-out caps** so a matrix run cannot stampede a rate limit or a budget,
and a **cadence tiered by cost** — the cheap golden set on every change, the
full matrix on a schedule, the live certification on demand. The economics
are a design input, not an afterthought: [eval-economics](./techniques/eval-economics.md).

## The techniques

- [metric-role-contract](./techniques/metric-role-contract.md) — one
  optimized metric and N thresholds, irreversibility as the discriminator,
  what the composite forbids.
- [scenario-design](./techniques/scenario-design.md) — captured vs generated
  scenarios, versioned fixture identity, deliberately scoped cache keys,
  coverage of the ugly cases including distractors, where a captured label
  actually comes from.
- [unaided-baseline-screening](./techniques/unaided-baseline-screening.md) —
  the deprived-candidate control, choosing what to withhold, post-cutoff and
  synthetic material, re-screening on candidate upgrade.
- [overshoot-and-restore](./techniques/overshoot-and-restore.md) — the
  asymmetric incentive in a reduction run, requiring a failure, minimal
  restoration, the phantom bound over an unscreened suite.
- [assertion-vs-judgment](./techniques/assertion-vs-judgment.md) — the
  deterministic band, when a judge is genuinely necessary, rubric-anchored
  judgment, the structured verdict channel.
- [failure-attribution](./techniques/failure-attribution.md) — the seven
  owners of a red case, the tool surface that only agentic systems have and
  that the funnel misroutes to the model, the two that are not the system,
  attributing a sample and acting on classes.
- [judge-stability](./techniques/judge-stability.md) — the pinned judge
  packet, anchor-set drift measurement, inter-judge disagreement, the
  own-family preference bias.
- [comparison-modes](./techniques/comparison-modes.md) — absolute vs pairwise
  vs matrix, win-rates and their pathologies, declared winners and declared
  aggregation.
- [eval-economics](./techniques/eval-economics.md) — mock modes, cache
  lifetimes, fan-out caps, tiered cadence, the budget as a design input.
- [discriminating-task-selection](./techniques/discriminating-task-selection.md) —
  ranking a population on the scenarios it is split on: frozen pool, moving
  selection, weighted estimates, and why regression gates want the opposite.
- [certification-levels](./techniques/certification-levels.md) — theoretical
  passes gating empirical ones, promotion criteria, what only the live level
  can see.
