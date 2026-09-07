---
layer: technique
type: technique
subject: imported-material-conformance
technique: a-fixer-script-is-the-edge-in-the-wrong-place
status: forged
laws: [one-authority-per-quantity]
use_when: [a project has a tool everyone runs after importing to make materials look right, retiring a post-import correction pass, an import defect ships whenever someone forgets a manual step, deciding whether a correction belongs to the boundary or to the asset]
---

# A post-import corrector is the edge, written in the wrong place

## The concern

Most teams meet this subject with the artifact already built: a project-local tool that
"makes imports look right", run by habit after every delivery. Someone wrote it because the
imports looked wrong, it made them look right, and it has been run ever since.

It is the conversion edge, written **after** the import instead of inside it. Everything
that follows comes from that one displacement:

- **The defect returns with every delivery**, because nothing in the import path changed.
- **The correction is re-applied from memory**, so the day someone imports without running
  it, a defective asset ships — quietly, because the asset still looks plausible.
- **It cannot be tested**, because it has no stated input. It runs on whatever is in front
  of it and produces something better, which is not a property anything can assert.
- **It accumulates asset-specific corrections beside boundary corrections**, and after a few
  months nobody can say which of its rules are arithmetic and which are taste.
- **It becomes a second authority for the conversion**, so when the edge is eventually fixed
  the corrector double-corrects, and the obvious response is to add a compensating rule to
  the corrector ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).

The last one is why this cannot be left alone as harmless. A corrector does not merely fail
to fix the edge; it actively prevents the edge from being fixed, because after the fix the
pipeline looks worse until someone also unwinds the corrector, and unwinding it is the step
nobody has time for.

## The corrector is also the best available input

It is not a shameful artifact. It is usually the accumulated, hard-won diagnosis of
everything wrong with this boundary, written down by the only person who noticed, in the
only place they could write it. Deleting it discards that. **Read it before replacing it**:
its rules are a list of the differences between the two conventions, discovered
empirically, and that list is exactly what the participant table needs.

So the move is a migration, not a deletion, and it has a definite order.

## Procedure

1. **Inventory every rule the corrector applies**, in its own terms — this property, from
   this value, to that value, on these materials. Do not interpret yet.
2. **Classify each rule as boundary or asset.** A boundary rule is true of *every* delivery
   crossing this edge and is derivable from the two conventions: a negation, a channel
   move, a colour-space decision, a default substitution. An asset rule is true of one
   surface or one class of surfaces because of how it was authored or art-directed. Almost
   every corrector holds both, mixed, with nothing distinguishing them.
3. **Move the boundary rules into the edge**, one at a time, and delete each from the
   corrector as it lands. One at a time matters: two simultaneous moves that interact
   produce a result nobody can attribute, and the usual reaction is to revert both.
4. **Add each moved rule's case to the calibration swatch** before moving it, so the move is
   asserted rather than eyeballed. A rule that cannot be expressed as a swatch case is
   probably an asset rule that was misfiled.
5. **Give the asset rules a home that survives redelivery** — an addressable material with
   a local override layer, per the materialisation obligation. Asset rules are legitimate;
   they simply must not live in a batch pass over everything.
6. **Delete the corrector, and remove it from the instructions.** A corrector kept "just in
   case" is run by someone eventually, and a second authority that is only sometimes
   consulted is worse than one consulted always, because the disagreement is intermittent.
7. **Watch for the next one.** A team that solved this once will write another corrector the
   next time a boundary defect appears, because the reflex is correct and only the location
   is wrong. The lasting fix is that "the imports look wrong" is understood as a question
   about the edge.

## Decision rules

- **When a correction is uniform across unrelated deliveries, it is a boundary rule.** That
  is the whole test, and it is decidable from the corrector's own rules without opening a
  single asset.
- **When a correction names specific assets or asset classes, it is an asset rule** — move
  it onto the assets, not into the edge, however tempting the convenience of one pass is.
- **When you cannot tell, treat it as an asset rule until a swatch case proves otherwise.**
  A wrong rule in the edge is wrong for everything that ever crosses it; a wrong rule on an
  asset is wrong for one asset.
- **When the corrector is the only documentation of the boundary, write the table first.**
  Migrating rules without recording what they mean produces an edge that is correct and
  unexplainable, which is one maintainer away from being reverted.
- **When someone proposes running the corrector after the fixed edge "for safety", refuse.**
  It will double-correct, the double correction will be compensated for, and the pipeline
  returns to two theories of the boundary with an extra layer.

## When not to use it

- **Where the pass genuinely is per-asset art direction** and always was. A batch pass that
  applies art direction is a legitimate authoring tool with a bad name; rename it and leave
  it alone.
- **In the middle of a delivery crunch.** This migration briefly makes the pipeline less
  predictable, one rule at a time, and it should be started when there is room to observe
  each step rather than while a milestone is consuming every import.
- **Before the edge exists at all.** Retiring the corrector first leaves the team with no
  correction and no conversion, which will be experienced as a regression caused by the
  people trying to fix it — build the edge, prove it with the swatch, then migrate.
