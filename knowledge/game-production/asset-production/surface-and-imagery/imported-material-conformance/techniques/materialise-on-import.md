---
layer: technique
type: technique
subject: imported-material-conformance
technique: materialise-on-import
status: forged
laws: [one-authority-per-quantity, compiling-is-not-wiring]
use_when: [a surface correction has to be re-made after every delivery, imported materials cannot be selected edited or reused in the project, deciding what an import step owes beyond geometry, the same asset is redelivered regularly and loses its fixes each time]
---

# Materialise on import

## The concern

A delivery carries its materials **embedded**: they are properties of the imported blob
rather than artifacts the project can address. The asset renders. It looks like it worked.
And there is nothing to attach a correction to.

This is the obligation at this edge with no analogue on the transform side, and the
asymmetry is worth stating exactly, because it is why teams underestimate it. A transform
correction is a *number*, and a number can live on an import setting, in a preset, in a
line of the import step — somewhere, always. A surface correction is a *material*: a set of
maps, factors, a shading model and a transparency mode. It has nowhere to live until
something in the project owns it. So an artist who corrects one surface has corrected one
instance of one import, invisibly, in a place no other asset can inherit from and no review
can see.

Then the asset is redelivered — because the geometry changed, because the request was
refined, because generation is cheap — and the correction is gone. Nobody experiences that
as data loss either. They experience it as *the imports are bad again*, which is the same
sentence as last time, so the same manual pass runs again, and the loop is now a role.

The failure has the shape the corpus already names: an artifact that loads and validates
but that nothing can reach is not done
([compiling-is-not-wiring](../../../../_laws.md#compiling-is-not-wiring)). An embedded
material renders perfectly and is unreachable, and unreachable is the whole defect.

## Procedure

1. **Make materialisation part of the import, not a step after it.** Every material the
   delivery references becomes a first-class addressable asset in the same operation that
   brings in the geometry. A step someone runs afterwards is a step that is skipped on the
   day it matters, and the skip is silent because the asset still renders.
2. **Derive each material's identity from the delivery, not from its position.** A stable
   name from the material's own declaration lets the next delivery of the same asset resolve
   to the same project material; a name derived from an index or an order lets a delivery
   with one extra material re-point every surface after it.
3. **Reconcile on redelivery rather than replacing.** When a material already exists,
   update the properties the delivery owns and leave the properties the project has taken
   over. That split is only possible because step 4 recorded it.
4. **Keep the boundary conversion and the local override as separate layers.** The
   conversion is what the edge computed from the delivery; the override is what a person
   decided about this surface. Merge them and every later question — *is this still wrong,
   or did someone fix it* — becomes unanswerable, and the material acquires two authorities
   for the same value
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).
5. **Report what was materialised and what was reused**, per delivery. A material silently
   created twice under two names is the same defect as a texture imported twice, and it is
   discovered the same way: by the surfaces diverging months later.
6. **Give the shared surfaces one material, deliberately.** A delivery of forty props that
   materialises forty near-identical materials has converted an import problem into a
   maintenance problem. Where the project has a real shared surface, the import should
   resolve to it rather than instantiate beside it — and where it cannot tell, it should
   say so rather than guess.

## Decision rules

- **When a correction cannot be expressed as an edit to a named project artifact, the
  import is not finished.** That is the acceptance test for this technique, and it is
  checkable without judgment.
- **When a fix has to be re-applied after a redelivery, the material was not materialised —
  or the reconciliation is replacing rather than merging.** Those are the only two causes,
  and they are distinguished by whether the fix survives a redelivery that changed nothing.
- **When an import creates a material per instance rather than per material, stop and fix
  the identity derivation.** The count grows silently, nothing breaks, and by the time
  anyone counts, hundreds of surfaces need consolidating by hand.
- **When the project has taken authorship of a property, the delivery no longer owns it.**
  Write that down per property rather than per material; a material where art direction owns
  the gloss and the delivery owns the base colour is normal and should be expressible.
- **When materialisation would produce a name collision, refuse and report.** Two different
  surfaces resolving to one material is corruption that renders correctly, which is the
  worst class of outcome available here.

## When not to use it

- **For a one-off asset that will never be redelivered and never corrected** — a background
  prop imported once for a prototype does not need an addressable material, and creating one
  adds an artifact somebody has to maintain.
- **Where the project's surfaces are authored entirely locally and the delivery supplies
  geometry only.** Then the delivery's materials are noise, and the honest import discards
  them rather than materialising them into a library nobody will use.
- **As a substitute for fixing the conversion.** Materialising a wrongly-converted material
  gives every defect a permanent home and a name, and makes the manual correction pass
  cheaper — which is precisely how a boundary bug becomes a maintained feature.
