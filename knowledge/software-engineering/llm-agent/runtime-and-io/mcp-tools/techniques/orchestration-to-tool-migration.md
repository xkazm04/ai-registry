---
layer: technique
type: technique
subject: mcp-tools
technique: orchestration-to-tool-migration
status: forged
laws: [derivation-names-recomputation, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [deciding what belongs on the tool surface, revisiting a pipeline built against an older model, choosing between a fixed stage and an on-demand tool, justifying an architecture change that changed no models]
---

# Orchestration-to-tool migration

The other techniques in this subject govern how a tool is *shaped* — its
schema, its transport, its scoping, how its results are trusted. This one
governs what earns a place on the surface at all, and it exists because that
answer is not stable: it is a function of model capability, and model
capability moves.

Every system built around a model sits somewhere on a dial. At one end,
**orchestration**: the pipeline decides the sequence, constructs each context,
and makes every branching decision in code, with the model doing bounded work
inside a slot someone else chose. At the other, **agency**: the pipeline
supplies capabilities and the agent decides which to invoke and when.

The dial's correct position is a *derived* value, and its input is what the
model can reliably do. Systems are routinely built at the right position and
then left there for two model generations, which is how a pipeline accumulates
scaffolding that exists only to compensate for a limitation that has since
lifted.

## What migrates, and what does not

A migration is not "delete the orchestration". The observed shape is more
specific and the distinction is the whole technique:

- **Deterministic work stays deterministic.** Quantification, scoring,
  indexing, graph construction, anything that must be reproducible or that
  runs at a scale no agent loop can afford — this does not move onto the tool
  surface as a decision, it stays as a computed first pass. A model asked to
  do arithmetic over a corpus produces a number nobody can check, which is the
  failure the deterministic pass exists to prevent.
- **Adaptive work migrates.** The branches, the exception handling, the "if
  the input looks unusual, fetch more" logic — the parts that were coded as
  fixed rules because the model could not be trusted to notice. These become
  tools the agent calls *when it judges that it needs them*, and the judgment
  is the thing being handed over.

The tell that a stage is a migration candidate: it is a conditional that fires
rarely, its condition was hand-written to approximate "something is unusual
here", and the code path exists because nobody trusted the model to spot the
unusual case. That is a rule standing in for a judgment, and it is exactly the
thing a more capable model does better than the heuristic.

The tell that a stage must *not* migrate: removing it makes an output
irreproducible, or the stage's cost at scale only works because it is not
inside a reasoning loop.

## The migration is measured, not asserted

The dial's position is derived and therefore
[names its recomputation](../../../../_laws.md#derivation-names-recomputation).
The recomputation is an experiment, not a rewrite: hold the models fixed, move
one stage onto the tool surface, and compare.

Holding the models fixed is the load-bearing part of the method, and it is the
step most likely to be skipped. Migrations usually coincide with a model
upgrade, and a change that moves two variables at once cannot attribute its
result to either. A migration measured against a fixed model roster produces an
attributable finding; the same migration shipped alongside an upgrade produces
a story.

**Measure three axes, because they do not move together and the surprise is
usually in the third:**

1. **Quality**, on the harness that already exists.
2. **Cost per unit of output** — and note that this often *improves* rather
   than worsening, which is the counterintuitive result. An agent re-calling
   a stable set of tools against a stable prefix has better cache behaviour
   than an orchestrator assembling a bespoke context per stage, and the saving
   can exceed the extra tokens the loop spends deciding.
3. **Variance.** An agentic core adapts, which means it also *varies*. A
   migration that improves the mean and widens the tail may be a regression
   for the consumer, who experiences the tail.

Report all three with their predicates
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
which model roster, which stage moved, over which inputs. "The agentic version
is better" without a fixed roster behind it is a claim about a model upgrade
wearing an architecture's clothes.

## The comparison has to observe the real pipeline

An A/B that runs the migrated stage in isolation measures the stage, not the
system ([gate-sees-target](../../../../_laws.md#gate-sees-target)). The whole
value of moving a stage onto the tool surface is that the agent may now call it
*a different number of times, in a different order, or not at all* — which only
appears end to end. Measure the pipeline's output, and record the call counts:
a tool the agent never invokes is a migration that silently deleted a stage,
and a tool it invokes on every input is a fixed stage wearing a tool's costume,
paying the loop's overhead for none of the adaptivity.

## Direction, and the honest reverse

The dial moves toward agency over time because capability rises monotonically
and the scaffolding was built against a floor that keeps lifting. But the
migration is a hypothesis each time, and **the reverse migration is a real
result, not an embarrassment**: a stage that moved onto the tool surface and
produced worse output, wider variance, or a tool the agent misuses comes back
into orchestration, and the record says which model roster it failed under so
the next reviewer knows what would have to change for it to be worth retrying.

What must not happen is the dial moving by accident — a stage becoming a tool
because it was convenient to expose, with nobody measuring what the pipeline
does differently afterwards.
