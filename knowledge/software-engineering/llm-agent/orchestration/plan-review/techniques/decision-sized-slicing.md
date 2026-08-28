---
layer: technique
type: technique
subject: plan-review
technique: decision-sized-slicing
status: forged
laws: [count-carries-predicate, silent-state-is-ungoverned]
shared_with: []
use_when: [a task is about to be handed to a planning agent, a plan arrived too large to disagree with, deciding whether a task is genuinely indivisible, slice boundaries are being argued after the plan is written]
---

# Decision-sized slicing

Cut the task into thin pieces **before any plan exists**, each piece complete end to
end and carrying one material decision, and hold the pipeline until a person has
dispositioned every piece. The output is not a schedule and not an estimate. It is the
list of units the plan gate will later be asked to hold one at a time, and it is
produced by a reader whose charter is to refuse coherence at the wrong scale.

## Why this is a separate stage and not a stricter planner

Two arguments, and the second is the one that decides it.

**Sunk cost.** Once a plan is written the framing is committed. Slicing afterwards
means unwinding choices already made, against pushback that arrives on behalf of
finished work — and the pushback is legitimate, which is what makes it effective. The
plan is not wrong; it is merely one size, and the one size it is has stopped being
negotiable. Every hour of authorship between the task and the slicing raises the price
of the slice.

**Charter conflict.** A planner's job is to articulate a coherent design. A slicer's is
to refuse coherence at the wrong scale. These are not two aspects of one job; they pull
opposite directions on the same artifact, and an agent holding both resolves the
tension the way any single reader does — by doing the one it started with. Bundled, the
planner under-slices, or the slicer over-specifies and produces a plan under another
name.

## The lens priority

Apply the lenses in order. The first that yields boundaries wins; the rest modify.

1. **Decision boundary (primary).** One slice per decision whose alternative would
   produce visibly different downstream work. This is the lens that makes the output
   useful to a plan gate, because it is the only one whose units are the units a
   reviewer actually holds a counterfactual against.
2. **Acceptance criterion (fallback).** For tasks with stated criteria and no genuine
   decision content — a defined behaviour to implement, a specified format to emit —
   one slice per criterion. Reaching for this lens first is the common error; it
   produces neat units that all sit inside a single unexamined decision.
3. **End-to-end completeness (filter, not a source).** Drop any candidate boundary that
   produces an internal-only milestone. A slice that cannot be observed from outside the
   work is a task-list item, and a reviewer disposing it is disposing something they
   cannot evaluate.
4. **Independence (modifier).** Where slices constrain each other, record the ordering
   rather than merging them. Merging to avoid stating a dependency hides the dependency
   in the plan, where nothing reads it.
5. **Inseparability (terminal).** The task is genuinely one unit.

## Inseparability must argue, not assert

The terminal case is real and it is also the escape hatch every slicer reaches for when
slicing is hard. So the rule is asymmetric: a multi-slice output needs no defence, and
a single-slice output must carry a rationale naming which lens failed and why. Genuine
cases exist and share a shape — an atomic schema migration, a credential rotation, a
security patch whose partial application is worse than none. What they have in common is
that a partially applied version is not a smaller version of the change but a *different
and worse state*, and that is the test to state, not the category name to invoke.

The single slice still goes through the gate. An inseparable task that skips the
disposition has not been reviewed; it has been asserted to need no review, by the reader
whose job was to find out.

## Record the boundaries that were rejected

The slicing output carries what was considered and rejected as a boundary — file
boundaries, architectural layers, commit boundaries, phases of work — with one line
each on why they were not decision boundaries. This is the cheapest part of the
technique and the part most often skipped, and skipping it converts the slicing from an
argument into an assertion. A reviewer disposing a boundary they disagree with needs to
know whether their alternative was considered; without the rejected list they must
assume it was not, and the disposition becomes a re-litigation of the whole slicing.
The reader's reasoning about scale is otherwise private state doing load-bearing work
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

## The four-value disposition, and why a binary is wrong here

`accepted` — the slice stands. `merged` — fold it into an adjacent slice; the boundary
was real but not material. `dropped` — it is not part of this work. `revised` — the
boundary is wrong and here is the right one.

A binary collapses `merged` and `dropped` into one verdict, and those are opposite
instructions to the planner that runs next: one says *do this, but not separately*, the
other says *do not do this*. A pipeline that cannot tell them apart either builds
dropped work or discards merged work, and both failures surface much later as a plan
that does not match what was approved. `revised` is the push-back loop and it is the
value that makes the gate a conversation rather than a filter; a slicing round with no
`revised` dispositions over many tasks is a reader whose boundaries are never wrong,
which is not a thing readers are.

## Counts, and what they are counts of

A slice count travels — into a plan gate, into a status line, into an argument about
whether a task is big — so it carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): slices *at
which lens*, before or after disposition, and with the inseparable single counted as
one rather than as none. "Six slices" and "six slices proposed by the decision-boundary
lens, of which four accepted, one merged, one revised" are different facts, and only
the second one supports the use the number will be put to.

Resist a target. A reader told to produce eight slices produces eight, and the boundaries
past the real ones are arbitrary — which is worse than under-slicing, because arbitrary
boundaries are individually defensible and collectively meaningless, and the reviewer
disposes them all as `accepted` because none is objectionable on its own.

## When not to use it

- **The task has no decision content and no criteria.** A mechanical, fully specified
  change gains nothing from a slicing round; running one anyway spends a disposition
  budget the objection record needs.
- **The unit of work is already below the counterfactual threshold.** If the whole task
  is a size the reviewer can hold an alternative against, slicing produces one slice
  and a page of rationale for it. Run the reader; expect the terminal case; do not
  manufacture boundaries to justify having asked.
- **The pipeline has no plan gate.** Slices with nowhere to be dispositioned are a
  document. The technique's whole output is an input to a human decision, and without
  that decision it is a planning artifact this subject does not claim.

## What this cannot do

Slicing bounds what the reviewer must hold. It does not make each unit correct, and it
carries a specific risk of its own: a set of individually reasonable slices can add up
to the wrong work, and the reviewer disposing them one at a time is structurally unable
to see that. The countermeasure is not more slicing — it is that the objection reader
runs against the *task and its slicing*, not only against the plan, so the premise-level
challenge has a place to land before the plan makes the premise expensive.
