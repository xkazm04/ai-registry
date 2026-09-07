---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: part-cut-planning
status: forged
laws: [one-authority-per-quantity, a-budget-shapes-the-output]
shared_with: []
use_when: [a subject is too complex to reconstruct in one generation, deciding where to cut a character or creature into separately generated parts, part generations keep coming back fused or unusable at the joins, planning the reference set for a multi-part asset]
---

# Part cut planning

## The concern

A subject past a certain complexity — a creature with non-humanoid limbs, an armoured
figure, an assembly of dissimilar materials — does not reconstruct in one shot. The
remedy is well known: generate it as separate parts and assemble them. What is
routinely left to improvisation is **where the cuts go**, and the cut plan is the most
consequential decision in the whole sequence because every later stage inherits it.

The pipeline's other subjects each own a consequence of the split and none of them owns
the split itself. Budget division takes the part count as an input and divides against
it. Input gating grades each part image once it exists. Finishing assembles whatever
arrives. So the cut boundaries get chosen by whatever was easy to select in the
reference image, and the bill arrives three stages later as welds nobody planned, seams
across bending surfaces, and six separate commissions for one repeated limb.

The rule: **the cut plan is authored once, before the first generation, and every
boundary is justified against a downstream consumer rather than against what was
convenient to lasso.**

## The four consumers a cut boundary answers to

**Silhouette.** A cut that follows a break the subject already has — a collar, a
pauldron edge, a carapace joint — produces two closed regions that each reconstruct
cleanly. A cut across a continuous surface produces two open regions whose reconstructed
edges will not meet, and closing that gap is manual work on both parts. Cut where the
form already stops.

**Binding.** A part that will bind rigidly to a single bone should always be its own
part: hair, an ornament, a shoulder plate, a carried prop. Cutting it out costs nothing
and it removes that geometry from every weight-solve downstream. The inverse is the
expensive error — a cut placed across a span that must deform *continuously* puts a seam
exactly where the mesh bends, and no weighting hides it. Decide the cut against the
binding plan: rigid pieces come out, deforming spans stay whole.

**Multiplicity.** A part repeated on the subject is commissioned **once** and instanced.
Six legs sharing a form are one generation and one texture, not six of each. The cut
plan names each part's multiplicity, and that number is what budget division and
sourcing cost read — distinct parts drive the generation spend, total instances drive
the assembled budget, and the two counts are not the same number. A plan that omits
multiplicity causes the same limb to be paid for repeatedly at the per-part class limit
and to arrive six slightly different ways.

**Entanglement.** Two elements that occupy the same volume and differ in material or
topology must be separated *before* generation, not after. Asked for both at once, a
reconstruction fuses them and neither comes back clean — the same failure the subject's
opening names for a closed silhouette, arriving on a different axis. Hair with ornaments
threaded through it, a figure gripping a weapon, a strap crossing a plate: cut them
apart in the reference and commission them separately.

## Procedure

1. **Enumerate the parts from the master reference before any generation**, as a list
   with a name per part. The list is the artifact; the reference crops are derived from
   it.
2. **For each part, record its multiplicity** and whether its instances are identical or
   merely similar. Similar-but-not-identical is a decision to make now, not a discovery
   to make at assembly.
3. **For each cut, name which of the four consumers justifies it.** A boundary that
   cannot be justified against any of them is a boundary chosen for convenience, and it
   is the one that will cost a weld.
4. **Mark each part rigid or deforming**, and check no cut crosses a deforming span.
5. **Check every part is a closed region in the reference.** A part you cannot describe
   as a closed silhouette is not yet a part — repair the reference, because the
   reconstruction will invent whatever the crop leaves open.
6. **Hand the plan downstream as data**: part names, multiplicities, rigid/deforming
   flags. Budget division consumes the distinct count; assembly consumes the join list;
   binding consumes the rigid flags.

## Decision rules

- **The cut plan is the one authority for the part count.** Every other number — the
  per-part budget, the generation spend, the assembled total — is derived from it each
  time rather than stored separately. Two part counts in a pipeline is the disagreement
  that surfaces when the assembled asset overruns and no part is at fault.
- **A rigid single-bone piece is always its own part.** This one is free and it is
  reliably skipped.
- **Never co-commission two interpenetrating elements of different material.** The
  result is fused and both halves are lost, not one.
- **Commission distinct parts, never instances.** If two parts of the plan are the same
  form, they are one commission with a multiplicity of two.
- **Re-cutting after generation is a regeneration, not a repair.** The parts already
  produced were reconstructed against boundaries that no longer exist, so the cost of
  changing the plan late is the whole set, not the edited part. That is what makes this
  a planning step rather than an iterative one.
- **A finer split is not a better split.** Each cut adds a join, a seam and a budget
  divisor. Cut until every remaining region reconstructs cleanly and then stop.

## When not to use this

- **When the subject reconstructs acceptably whole.** A simple prop, a single-material
  form with an open silhouette. The split has real costs and they are only worth paying
  where single-shot generation actually fails.
- **When the parts ship independently.** A modular kit whose pieces are placed
  separately is not one assembled subject; each piece is its own asset with its own
  reference and its own budget, and there is no cut plan because there was no whole.
- **When the generator accepts a multi-view master reference and returns a clean
  assembly.** Where that path works for the subject class, it is fewer moving parts;
  this technique is for the subjects where it does not.
