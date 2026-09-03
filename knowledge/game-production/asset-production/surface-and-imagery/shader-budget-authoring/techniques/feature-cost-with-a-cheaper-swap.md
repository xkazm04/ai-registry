---
layer: technique
type: technique
subject: shader-budget-authoring
technique: feature-cost-with-a-cheaper-swap
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis]
use_when: [costing an optional material feature, a material is over its soft cap, writing the message a budget tool prints when it refuses]
---

# Feature cost with a cheaper swap

## The concern

A budget tool that reports "this material is too expensive" is consulted once and then
routed around. The author has a look to deliver, no way to reach it under the ceiling,
and no information about which of their six features is the one to give up. The
predictable outcome is that the tool is disabled, or that the cheapest-looking feature
is cut rather than the most expensive one.

The technique is a shape for the cost table: **every feature entry carries its sampler
delta, its instruction delta, and a named cheaper alternative together with what that
alternative gives up.** The third column is the one that changes behaviour. It converts
a refusal into a decision the author can make alone.

## Procedure

1. **Establish a baseline per surface class, not per material.** An opaque surface, a
   subsurface surface and a transparent surface start at different sampler and
   instruction counts before any optional feature is enabled. Costing every material
   from zero produces numbers nobody believes.
2. **State each delta with its unit and its basis.** A feature costs *n additional
   sampler registers and roughly m additional arithmetic instructions in the base pass*.
   Instruction counts differ by pass and by whether lighting was counted; two estimates
   without a stated basis will differ by a large factor and neither is checkable
   ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
   Report the **total** as a ratio to a named baseline surface rather than as an
   absolute — *2.5× a plain opaque metal base* — so the reference travels with the
   figure and the warn threshold is a number anyone can check.
3. **Write the substitute in the same entry, in its own field.** Not in a separate
   document, and not buried inside the warning sentence. Cost and substitution are one
   lookup because they are read at the same moment; keeping them as two fields is what
   lets the surface that displays them render the fix as an actionable element next to
   the finding rather than as a paragraph an author skims past.
4. **Name what the substitute gives up.** A swap presented as free will be taken and then
   reverted at review. Parallax in place of tessellated displacement gives up the
   silhouette. A normal map in place of parallax gives up depth at grazing angles. A
   wrapped-diffuse approximation in place of subsurface transport gives up back-lighting.
   The author needs the loss to judge whether their shot can absorb it.
5. **Order substitutes by look retained per unit saved**, so the first suggestion is the
   one to take. A chain of two hops — displacement to parallax to a normal map — lets an
   author walk down until they fit.
6. **Hand the ceiling to the author before authoring, not after.** A budget stated up
   front changes the material that gets made; the same budget applied as an exit gate
   only produces rework
   ([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)).

## Decision rules

- **When a feature has no cheaper substitute, say so explicitly.** "No cheaper
  substitute; this feature is the cost of the requested surface" is a useful entry. An
  empty column reads as an oversight and invites someone to invent one.
- **When the substitute changes the silhouette or the shape, it is not a substitute for
  a hero asset.** Silhouette is the property a player reads first; trading it is a
  different decision from trading a subtlety, and the table should mark which trades are
  silhouette trades.
- **When two features share a substitute, apply it once.** Swapping the same expensive
  path out twice double-counts the saving and produces an estimate that will not survive
  a profile.
- **When the saving is under one sampler and a handful of instructions, do not offer the
  swap.** Small trades cost look and buy nothing; the table should not tempt anyone with
  them.
- **When a per-feature finding has already been raised, suppress the aggregate one.**
  A material that warned about its most expensive feature does not also need "this
  material is expensive"; the second message says nothing new and teaches the reader
  that most of the output is noise. One finding per concern, and the specific one wins.
- **When the estimate and a real profile disagree, the profile wins and the table gets
  corrected.** The cost table is a model. It earns its authority by being revised when
  measurement contradicts it, and it loses all of it the first time someone finds it
  stale and nobody fixes it.

## Why this specific shape

Because the alternative shapes have all been tried. A cost table alone becomes a wall.
A style guide of recommendations alone has no numbers and cannot gate. A gate that
blocks without alternatives is an obstacle to route around, and it will be routed
around by the person under deadline — which is everyone, in the month when this matters
most. Pairing every cost with a named cheaper thing is what makes the tool's output
actionable in the moment it is read, and actionable-in-the-moment is the entire
difference between a budget that shapes content and a budget that documents its failure.

## When not to use it

- **When the feature set is fixed by a shared material framework.** If authors pick from
  a small closed set of pre-built materials, the substitution decision was made once,
  upstream, and re-offering it per material is noise.
- **When the cost is dominated by something the table does not model.** Overdraw,
  texture resolution and draw-call count can each swamp per-feature shader cost. A
  substitution table that says a surface is cheap while the real cost is four layers of
  transparency over the same pixels is confidently wrong.
- **When the substitute is not implemented.** Suggesting a path the project does not have
  wastes the author's afternoon. Only list swaps that exist and have been used.
