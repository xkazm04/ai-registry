---
layer: technique
type: technique
subject: pipeline-dag
technique: valid-but-degraded-plans
status: forged
laws:
  - gate-sees-target
  - count-carries-predicate
shared_with: []
use_when: [a planner rather than a person authors the graph that runs, a pipeline is correct but slower or costlier than its shape allows, deciding whether a declared dependency is load-bearing, a blast-radius or impact count over a dependency set looks wrong]
---

# Valid but degraded plans

Graph validation draws an honest line and states it: everything provable from
the document is proven at the door, everything else is a named run-time check,
and the middle category — defects that could have been caught statically but
ambush the run instead — must not exist. That split is correct and it is not
complete. It sorts defects by *when* they are detectable, and assumes every
defect is detectable eventually, because a defect eventually shows up as a
failure.

There is a third class, defined by the property that it never shows up at all:
**the graph is well-formed, every check passes, the run succeeds, and the plan
was still wrong.** No door check fires, because the document is valid. No
run-time check fires, because nothing failed. The only evidence is that the run
cost more than it needed to, and cost is not a status.

## The discriminator: does the defect change the result, or only the price?

One question sorts every planning defect, and it is the question to ask before
reaching for a validator.

- **The defect changes the result.** A dependency that should exist and does
  not: a step reads input that was never produced. This class is well served —
  the edge is missing, so the consumer sees an absent or malformed input and
  fails an output contract. The failure is loud, attributable, and already
  owned by validation and contract-checking.
- **The defect changes only the price.** A dependency that exists and should
  not; a step split into four when one would do; four steps fused into one.
  Every one of these produces *the correct answer*. They are invisible by
  construction, because no observation distinguishes a correct cheap run from a
  correct expensive one without a second run to compare against.

The second class is the one this technique is about. Its members recur:

- **The unnecessary edge.** An edge no data actually crosses. It costs
  parallelism — two steps that could have run together are serialized — and it
  costs nothing else, so nothing complains. This is the most common member and
  the hardest to see, because the topology looks *more* careful, not less.
- **Over-decomposition.** Splitting one operation into several adds
  coordination and per-step overhead with no gain. The tell is a node count
  that grows while the critical path does not shorten.
- **Under-decomposition.** Fusing independent operations into one step destroys
  parallelism *and* destroys attribution: when the fused step fails, which half
  failed is no longer a question the system can answer. This is the one member
  of the class that eventually does hurt correctness — not by producing a wrong
  result, but by making the post-mortem impossible.
- **The edge that cannot fail.** An edge pointing at something with no failure
  path of its own — a node nothing can cascade into, a reference only a person
  can remove. It can never appear in a "what went missing" set, yet it still
  counts in the *size* of the dependency set. Every ratio computed as
  `missing / declared` is therefore silently capped: the node can never reach
  the fully-unsupported end of the scale, whatever happens upstream. A
  severity, a blast radius or a confidence computed this way reports a milder
  verdict than the truth, permanently, and it looks perfectly reasonable in
  code review
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Why an authored graph tolerates this and a generated one does not

When a person draws the graph, this class is close to harmless. They drew that
edge on purpose; if it was unnecessary, that is one wasted decision, made once,
by someone who can be asked about it. The document is stable, so the cost is
paid once and amortized over every run.

When a planner emits the graph, all three protections are gone. The plan is
re-derived per task, so the defect is not one mistake but a *rate*. Nobody can
be asked why the edge is there. And the plan comes from the same kind of
inference the rest of the run depends on, so its errors are correlated with the
run's other errors rather than independent of them. A validator inherited from
the authored-graph world passes every one of these plans and reports a green
door.

Width makes the trade sharper rather than safer. A serial executor that takes a
wrong step can notice and correct at the next step, because it is still
deciding. A plan commits every branch before the first step runs, so a planning
error is dispatched to all branches at once. Parallelism buys latency and costs
error containment, and that trade should be made deliberately rather than
discovered.

## You cannot check a plan against itself

This is the structural reason no validator will ever catch this class. Validity
is a property of one document, so a checker can prove it alone. Quality is a
*comparison* — "this plan is wider than it needed to be" names a better plan
that was never generated. Asking the door to catch degradation asks it to
observe something outside the document it was handed
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

So do not extend the validator. **Measure the shape, and compare it across
runs.** Shape is cheap, it is already implied by data the executor holds, and
it becomes evidence as soon as there is more than one run of a task class to
compare.

Four measurements carry most of the value:

1. **Width over time** — the ready-set size at each dispatch, and its maximum.
   A plan whose width never exceeds one is a serial plan, whatever its drawing
   looks like. That is worth knowing explicitly, because it is the point at
   which every benefit attributed to the graph reduces to the benefits of the
   recovery and audit machinery alone.
2. **Node count against critical-path depth.** Both rising together is
   decomposition doing its job. Node count rising while depth holds flat is
   over-decomposition, priced per node.
3. **Edge decisiveness.** Over a run history, record for each edge whether it
   was ever the reason something waited or was withheld. An edge never once
   decisive across many runs is either unnecessary or unable to fail; both are
   defects, and telling them apart is diagnostic rather than cosmetic.
4. **Attribution failures.** Count the failures the system could not localize
   to a single step. That number is the direct cost of under-decomposition, and
   it is the one member of this class that shows up in the incident record
   rather than only in the bill.

## Decision rules

- **Never compute a ratio over a dependency set without excluding the members
  that cannot fail.** Partition the set first — failable and inert — and let
  only the failable half set the denominator. Otherwise the metric is capped
  and the cap is invisible.
- **Treat "the plan validated" as evidence about the document only.** It is
  never evidence that the plan is good, and a report that conflates the two
  teaches its readers to stop asking.
- **Record the plan's shape with the run, not just its outcome.** A run that
  stored only success or failure has thrown away the only data that could have
  found a degraded planner.
- **When one task class is planned repeatedly, compare shapes before comparing
  outcomes.** The distribution of widths and depths for that class is the
  baseline, and a planner regression shows up there first — while every run is
  still succeeding.
- **Prefer fixing the planner over widening the validator.** These defects are
  a property of how plans are produced. A checker that rejects a valid plan for
  being ugly gets tuned off; a planner that stops emitting the edge does not.
