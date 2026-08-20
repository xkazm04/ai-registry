---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: mutation-taxonomy
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [proposing a revision to a production prompt, comparing two prompt variants, attributing a quality gain to a kind of change]
---

# Mutation taxonomy

## The concern

A revision to a production prompt must be describable as *one named kind of change applied
to a known parent*. Free-form editing produces a different prompt, not an improved one: the
gain cannot be attributed, the two versions cannot be meaningfully compared, and nothing
learned transfers to the next prompt. A closed taxonomy of mutation strategies is the
mechanism that turns editing into experimenting.

## The taxonomy

The set must be **closed** — enumerated, named, and small enough that every member is
distinguishable by an author under deadline. A working set:

| Strategy | What it does | Typical hypothesis |
| --- | --- | --- |
| **Clarify** | Sharpens an ambiguous instruction without adding a requirement | Reduces variance, not mean |
| **Add constraint** | Introduces a new requirement the output must satisfy | Raises the floor on one criterion |
| **Remove constraint** | Deletes a clause of unproven value | Cuts cost and length with no quality loss |
| **Add example** | Supplies a worked instance of a hard case | Raises scores on that case class only |
| **Reorder** | Moves instructions relative to each other | Improves adherence to late-stated rules |
| **Change persona / framing** | Alters the stated role or stance | Shifts register and depth |
| **Restructure** | Reorganises sections without changing requirements | Improves adherence under long context |
| **Tune specificity** | Moves guidance up or down the abstraction ladder | Trades generality for precision |

Two properties matter more than the exact list. First, each strategy names a *direction of
change*, so a result is a statement about a strategy class and not only about one prompt.
Second, adding and removing are separate strategies, because a taxonomy that only grows is
how prompt cruft accumulates — the removal mutation is what lets a clause be retired on
evidence.

## Procedure

1. **Name the parent.** Every mutation has exactly one parent version identifier. A variant
   with no parent is a new prompt, not a revision, and starts its own lineage.
2. **Pick one strategy.** One per variant. Two strategies in one variant produce a result
   attributable to neither.
3. **State the hypothesis in the metric.** Which criterion, which direction, which artifact
   class. If the strategy targets one class of hard case, say so — a mutation expected to
   move one class must not be judged on the whole population's mean.
4. **Record the diff, not just the new text.** The mutation record holds parent, strategy,
   the textual delta, the hypothesis, and the author. This is the lineage; it is the only
   thing that survives the losing variant.
5. **Classify style separately.** A style or register classifier over the prompt is useful
   metadata for grouping results, but style is a *description* of a prompt, not a mutation
   applied to one. Keep the two fields apart or you will end up with the same fact recorded
   in two places, drifting.

## Decision rules

- **When a proposed edit does not fit any strategy, do not invent a ninth on the spot** —
  either decompose it into strategies that exist, or accept that it is a rewrite and start a
  new lineage with no comparison claim.
- **When a strategy is added to the taxonomy, it is added once, in the one place the
  taxonomy is defined**, and every consumer reads it from there. A taxonomy duplicated
  between a generator and a reporting view will disagree within a quarter, and the
  disagreement is invisible until someone asks which strategy won.
- **When two variants differ in more than the named strategy, the comparison is void.** This
  includes model settings, injected context, and retrieval configuration — those are part of
  the assembled configuration under test.
- **When a strategy has lost three times in a row on the same prompt family, stop proposing
  it there** and record the negative result. Negative results about a strategy class are the
  taxonomy's highest-value output.

## Reading results at the class level

The taxonomy pays off when results are aggregated by strategy rather than by prompt. Across
a family of authoring prompts, mutations that constrain *what the output must prove* tend to
produce durable gains, while mutations that add tone guidance tend not to. That statement is
only possible because every revision was labelled with its class; without labels there is a
pile of prompts, some better than others, and no transferable finding.

## When NOT to use it

- **A first draft.** A prompt with no production history has nothing to mutate from. Write
  it, ship it, start the lineage at version one.
- **An emergency fix for an active incident.** Fix it, ship it, then retro-label the change
  with its strategy and register the mutation. The taxonomy must never be a gate on stopping
  the bleeding.
- **Structural changes to the prompt's composition system** — how context is assembled, what
  the output contract is — are architecture, not mutation. They change the unit under test
  and reset the lineage.
