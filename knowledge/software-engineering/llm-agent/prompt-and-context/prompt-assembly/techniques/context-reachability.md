---
layer: technique
type: technique
subject: prompt-assembly
technique: context-reachability
status: forged
laws: [failure-not-empty-success, count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding what to inject into an agent prompt, choosing what degrades first under budget pressure, justifying a precomputed index or digest, diagnosing an agent that performs worse with context than without]
---

# Context reachability

[context-budgeting](./context-budgeting.md) decides *how much* each layer may
spend and which layers are floors and which are elastic. It does not say what
makes a layer one or the other, and in practice that gets decided by intuition
about importance — which is the wrong axis.

The right axis is **reachability**: could the agent have obtained this itself,
with the tools it already has, in the run it is already doing?

Every injected item answers that question one way or the other, and the two
answers behave so differently that treating them as one kind of "context" is
the root of both classic failures — the prompt that is full and useless, and
the agent that performs *worse* with context than without.

## The two classes

**Reachable — the agent could have found it.** A file it would have opened, a
definition two searches away, a value it could have computed. Injecting it is
**path compression**: you spend prompt tokens to buy back the tool calls,
latency and reasoning steps the agent would otherwise spend finding it.

The value is real but bounded, and it is a *cost* argument, not a *capability*
argument. The agent's ceiling does not move. That has one liberating
consequence and one dangerous one:

- Liberating: reachable context is **safe to drop**. Under pressure, cutting
  it degrades efficiency, not correctness. This is what "elastic" should mean.
- Dangerous: reachable context that is **wrong** is worse than absent. The
  agent would have found the truth on its own; instead it is handed a
  confident falsehood and stops looking. A wrong pointer does not merely fail
  to help — it moves the agent below its own no-context baseline.

**Unreachable — the agent would never have found it.** A constraint that lives
in nobody's file, a convention visible only across dozens of call sites, a
decision recorded in a conversation, a fact about a system it cannot see. No
number of tool calls surfaces it, because the search space does not contain it.

Here the argument inverts. The value is unbounded — this is the agent's
capability ceiling moving — and the cost of omission is total: the agent does
not fail loudly, it produces a fluent answer that is wrong in a way it has no
way to detect. Unreachable context is what **floors** are for.

## The rule

**Classify before you budget.** Reachable items are elastic and are cut first.
Unreachable items are floors and are cut last, or the call is malformed. A
budget allocated without this distinction cuts by section, which means it
routinely discards the only irreplaceable thing in the prompt to protect
something the agent could have grepped.

Two corollaries that follow immediately:

- **Reachable context must be more accurate than unreachable context, not
  less.** This is counterintuitive and it is the important half. The
  temptation is to hold the "important" (unreachable) material to a high bar
  and treat path compression as a cheap convenience assembled from stale
  indexes and best-effort summaries. But an error in unreachable context is a
  claim the agent had no other route to; an error in reachable context is a
  claim it is being actively steered *away* from checking. Precomputed
  digests, cached file maps and derived summaries are exactly where this bites,
  because they are the things most likely to be stale and most likely to be
  reachable.
- **When reachable context cannot be kept fresh, omit it.** The agent still
  gets there; it just takes longer. An omission costs steps, an error costs
  the answer ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  in spirit: a confidently wrong slice is not a cheaper success).

## Classification is a property of the pair, not of the artifact

Nothing is reachable in the abstract. The same document is reachable to an
agent with repository search and unreachable to one without; a convention is
unreachable in a single file and reachable across twenty. So reachability is
computed against **this agent's actual tool surface**, and it moves whenever
that surface moves.

The practical consequence is that granting a new tool **demotes** a whole class
of injected context from floor to elastic, and it should trigger a re-look at
what the assembler is still paying to inject. A prompt that was designed for an
agent without search and never revisited afterwards is spending its budget
compressing paths that are now one call long.

The classification is a vocabulary and gets one owner
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Each feeder declares the class of what it contributes, once, where the material
is produced — the retrieval slice, the memory recall, the state digest — rather
than each assembler guessing. A feeder that cannot say which class it produces
has not decided what it is for.

## Unreachable is the hard one, and it does not automate

Finding what an agent would never have found is not a retrieval problem — a
search cannot return what nobody indexed, and an agent cannot ask for what it
does not know exists. This is the limit of pure tool-granting as a strategy,
and it is the standing argument for human curation and precomputation surviving
alongside better models: the reachable half keeps shrinking as agents get more
capable, and the unreachable half does not shrink at all.

So the two classes trend in opposite directions over time, and a system that
tracks the split can see it happening. Which leads to the measurement.

## Measure the split, not the volume

"Context tokens injected" is a number with no predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) — it
sums two things with different value curves. Report the split, and two
questions become answerable that the total hides: what fraction of the budget
is buying capability versus buying speed, and whether the reachable share is
shrinking as the agent's tools improve.

The cheap empirical check on any reachable item is an **A/B against its own
absence**: run the task with the item and without it. If the agent gets there
anyway, the item was correctly classified and you now know what it is worth in
steps rather than in belief. If the agent fails without it, it was never
reachable and it is a floor that was being cut first.
