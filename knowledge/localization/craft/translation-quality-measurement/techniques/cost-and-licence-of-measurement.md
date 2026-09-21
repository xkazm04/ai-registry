---
layer: technique
type: technique
subject: translation-quality-measurement
technique: cost-and-licence-of-measurement
status: forged
laws: []
shared_with: []
use_when: [choosing which model a quality gate will be built around, deciding whether to run an estimator locally or pay a hosted judge per call, a budget argument is being made against scoring the whole store, scoping a one-off quality audit against a standing pipeline gate]
---

# Cost and licence of measurement

Two facts decide whether a measurement design is buildable, and neither is a
quality fact: what each instrument costs per unit it reads, and whether its
licence lets a commercial product run it at all. Both are usually discovered
last — after a model has won an accuracy comparison and a gate has been
calibrated on its scale — and discovered late, both turn a model choice into a
rewrite.

## The ladder of measurement cost

Every instrument this subject uses sits on one ladder, ordered by what a unit of
measurement costs:

1. **Deterministic checks** — free, milliseconds per unit, the whole store on every run.
2. **A distilled estimator** — cheap; a batch job over the whole store.
3. **A large estimator** — affordable; still a batch job, an order of magnitude slower.
4. **A frontier-model judge** — billed per call and per token, with no weights to
   license and a bill that grows with every unit and every rerun.
5. **A human** — the real budget, and the only rung that is a review.

The rule that governs it: **each rung buys a different *kind* of answer, not a
better one.** A deterministic check returns a verdict on a decidable class and
nothing else. A distilled estimator returns a coarse ordering at corpus scale. A
large estimator returns a finer ordering and, at span level, a guess at where
the error sits. A frontier judge returns a readable rationale per segment — and
in the field's 2025 evaluation campaign (measured independently, 16 pairs) such
judges ranked systems at 0.850–0.870 correlation but scored segments at
0.350–0.514, so the rationale is most fluent exactly where the number is
weakest. A human returns a finding that cites an anchor.

Two consequences follow. **Spend flows downward**: every class a lower rung can
answer is removed before the next rung sees the store
([deterministic-checks-before-estimates](./deterministic-checks-before-estimates.md)),
so the human budget
([human-review-sampling-under-a-budget](./human-review-sampling-under-a-budget.md))
lands only on the residue. And **the rungs are not substitutes**: paying a judge
per call to order every unit of a regenerable store, every time it regenerates,
buys a weaker segment ordering than a local estimator at a marginal cost that
never falls.

## Compute is not the obstacle it is argued to be

The figures below are reported by the estimators' own developers in primary
sources gathered at the 2026-09 harvest — not independently replicated, and the
two throughput figures need not share hardware:

- The largest open span-level estimator needs about **22 GB of accelerator
  memory** and reads about **8–10 segments per second** on a consumer card.
- **3-bit quantization** brings it to about **8 GB**, with rank correlation
  reported as 0.435 against 0.433 — a difference inside noise.
- A **distilled 278M-parameter student** keeps about **92% of the teacher's
  quality** at about **146 segments per second**, roughly fifteen times the
  teacher's reported rate.
- **Pruning** a distilled model costs about **30%** of its quality.

The rule: **distil or quantize, never prune.** The reported pruning loss is
nearly four times the distillation loss, on an instrument whose segment-level
signal was weak to begin with. At the reported rates a hundred thousand segments
is minutes for the student and a few hours for the teacher on one card, so a
budget argument against scoring the whole store is usually an argument about a
hosted interface's price, not about the computation.

## The weight licence sits on the same footing as accuracy

In the most-used open metric family, as its licences read at the 2026-09
harvest, **the reference-based checkpoint is permissively licensed while every
reference-free and span-level checkpoint is non-commercial.** Precisely the
checkpoints a derived store's gate needs — its reference is absent by
construction — are the ones a commercial product may not run. At least one major
alternative publishes permissive code *and* weights, with an error-score output
and a reference-free mode, and that is what makes a commercial build of
[reference-free-quality-estimation](./reference-free-quality-estimation.md)
possible at all. Its licence says nothing about its accuracy on your pair, which
is measured the way that technique measures any estimator off its home ground.

What the family-level fact teaches about reading a licence:

- **The licence belongs to the checkpoint, not to the family or the code.** One
  family ships both permissive and non-commercial weights, and permissive loading
  code will load either. Read the licence of the exact artifact the gate loads.
- **Licences move.** An open translation toolkit changed its licence in mid-2026.
  Record the licence and the date it was read beside the model's pin, in the
  record a configuration change already carries
  ([regression-detection-under-a-moving-engine](./regression-detection-under-a-moving-engine.md)),
  and re-read it whenever the pin moves.
- **A hosted judge moves the question rather than removing it.** No weights are
  licensed, but the provider's terms on data handling and output use become the
  constraint, and they are read at the same point: before the design.

The rule: **check the weight licence before designing a gate around a model.**
Discovering it afterwards is a rewrite, not a swap — the floor, the queue size
and the review budget were all calibrated on a scale that must be abandoned, none
of them carries over, and the score history splits into two series that must
never be joined.

## When not to use it

- **For a one-off audit.** A single sweep of a store before a launch decision
  does not repay standing up a local model. Rent the frontier judge and run it
  once: an audit asks an aggregate question, which is where a judge is strong,
  and a per-token bill is the right shape for a cost that happens once.
- **Below the volume that repays setup.** Where the store is small or rarely
  regenerated, a local estimator's setup — hardware, pinning, floor calibration,
  the sentinel and corner-case controls — is not recovered by per-unit savings.
  The break-even is units times regenerations; compute it before building the
  ladder rather than assuming either answer.
- **As a reason to skip a rung.** Cheapness does not let a lower rung answer a
  higher rung's question, and a permissive licence is not evidence for a model
  nobody has measured on the pair.
