---
layer: technique
type: technique
subject: generative-provider-auditing
technique: arena-benchmark-protocol
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-budget-shapes-the-output, no-gate-self-certifies]
shared_with: []
use_when: [comparing generative model variants, selecting a critic or grader model, a provider released a new version worth evaluating]
---

# Arena benchmark protocol

## The concern

A comparison between generative model arms is only worth acting on if it was controlled.
Uncontrolled comparisons are the norm: a handful of showcase prompts, whatever budget each
arm defaulted to, a judgement formed by looking at the outputs, and one aggregate verdict.
Such a comparison reliably picks a model that then underperforms in production, because
none of the four things it measured were the things production depends on.

An arena is a repeatable protocol, not an event. Its output is a per-class table that can
be re-run against a new provider version and compared to the last run.

## The protocol

1. **A fixed task set representative of real classes.** Draw the prompts and inputs from
   assets the pipeline has actually had to produce, including the hard ones — not a
   curated set that flatters generative models. Hold it constant across arms and across
   runs; the set is the instrument, and changing it invalidates comparison with history.
2. **Identical budgets across arms.** Every arm gets the same primitive budget, the same
   resolution ceiling, the same clip length, the same spend allowance. A budget is an
   instruction about the target rather than only a cap: an arm handed a looser one
   produces a different result for that reason alone, and the comparison then measures
   the budget.
3. **The same downstream acceptance applied to every arm.** The grading that decides
   whether an asset may enter the engine is the grader in the arena too. A bespoke
   judgement invented while looking at outputs cannot predict shipping behaviour, and it
   lets the person running the benchmark grade on a curve. Where that grading emits a
   *composite* verdict calibrated for finished artifacts and the arena is comparing raw
   deliveries, take the underlying signals rather than the composite — the budget
   conformance, the fragment count, the perceptual score — and apply the identical set to
   every arm. The invariant is that all arms are graded the same way, not that the
   composite verdict is the grade. A composite that no raw delivery has ever passed
   discriminates nothing.
4. **Results per class, never pooled.** Report one row per asset class per arm. An arm
   that wins on organic shapes and loses on hard-surface props has produced two findings;
   a pooled score destroys both and assigns a model to a job it is bad at.
5. **Systems constraints measured alongside quality.** Peak memory, latency per item,
   whether the arm can coexist in memory with the other models the pipeline runs,
   concurrency ceiling, cold-start cost, cost per item with its basis stated.
6. **Both verdicts recorded.** The winner becomes a pin; the losers become in-place
   rejections with their numbers.

## Decision rules

- **When quality and systems constraints disagree, the systems constraint usually
  wins — and this must be decided explicitly, not by default.** The frequent case: a
  marginally better model cannot share a runtime with the model it works beside, forcing
  an eviction and reload on every item. The measured cost of that residency conflict
  routinely exceeds the quality margin. A benchmark that measured only quality would have
  picked the model you cannot run.
- **When an arm fails acceptance on a class, that is a rejection for the class, not an
  overall loss.** Record it at class granularity.
- **When arms differ in cost per item, state the basis** — per generated item, per
  accepted item, or per item that survived downstream repair. Cost per *accepted* item is
  usually the decision-relevant figure and usually differs from the headline by more than
  people expect. Detailed spend accounting is a neighbouring discipline; the arena needs
  only a comparable figure with its basis stated.
- **When an arm's own output includes a self-assessment**, record it as self-reported and
  do not let it stand as the verdict. The grader is the external acceptance step.
- **When results are close enough that the choice feels arbitrary, prefer the arm with
  the lower systems cost** and record the margin — a later provider revision can reopen
  the decision cheaply if the margin is on file.

- **When an arm is decided on one axis, record the other axes as not scored** — a blank
  is a blank, never a zero. If geometry alone settles a class, say that geometry settled
  it and leave the perceptual column unmeasured rather than implying a low score.
- **When establishing what a candidate actually varies, check the provider's primary
  reference, not its marketing.** A "new model" is frequently a flag on the model already
  pinned. The arena is still worth running — but it is a settings comparison, and calling
  it a model comparison mislabels the result permanently.

## Running it

Keep the arena as a harness a second person can execute unchanged: one command per arm
over the fixed set, outputs written to per-arm directories, the grading run over each
directory, and a per-class table emitted. Anything requiring the original author's
judgement to reproduce is not a protocol.

Three properties make the harness safe to leave lying around:

- **It declares its own spend before it runs** — how many billed calls per class, what
  the extra arm costs over the baseline — and offers a rehearsal mode that performs the
  full traversal without dispatching. A benchmark whose cost is discovered from the
  invoice will not be re-run, which defeats its purpose.
- **It writes nothing production reads and pins nothing.** The harness prints a
  comparison; promoting the winner is a separate, reviewed edit by a person. A harness
  that adopts its own winner is a gate certifying itself.
- **It prefers classes with no live consumer.** Where a class can be benchmarked without
  a production caller depending on the outcome, the run costs only money rather than
  disruption.

## When NOT to use this

- **For a single candidate with no alternative.** Then you are measuring against the
  acceptance threshold, not running an arena — cheaper, and the right shape.
- **When the decision is already forced by licence or contract.** Benchmark quality only
  among admissible arms; measuring an arm you may not ship is a paid education in
  something you cannot use.
- **When the task set cannot be held constant** — a genuinely novel class with no history.
  Build the set first from the assets you are about to produce, then run the arena. An
  arena over an unrepresentative set is worse than no arena, because it confers false
  confidence on a pin.
