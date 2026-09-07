---
layer: technique
type: technique
subject: imported-material-conformance
technique: format-defaults-are-not-asset-properties
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
use_when: [an imported window or lens arrived opaque, a delivered material came in fully metallic with no map explaining it, an emissive surface imported dark, someone is debugging an exporter for a property that was never exported]
---

# A format default is not a property the asset carries

## The concern

When a delivered material omits a property, something still has to render. So every
interchange format states a default, and the receiving side applies it. That is correct
behaviour by both parties and it produces the most misdiagnosed class of import defect,
because **it presents as data loss and is not**: nothing was removed, nothing failed to
export, and the exporting tool is innocent. A value nobody stated was replaced by a value
nobody chose.

The defaults were selected so that a minimal material renders as *something* — not so that
an omission would be visible. Three of them account for most of the damage:

- **The two gloss factors default to fully on.** A material that omits them is fully
  metallic and fully rough. Combined with an un-negated gloss axis, it is fully metallic and
  mirror-bright, which is the familiar look of a delivery nobody converted.
- **Transparency defaults to opaque and two-sidedness to off.** A pane authored as a window,
  a lens, a leaf card or a fence arrives as an opaque single-sided plate, and the alpha
  channel that would have saved it is present in the delivery, correct, and ignored.
- **The factors that multiply the appearance textures default in opposite directions.** The
  base colour factor defaults to white, so omitting it changes nothing. The emissive factor
  defaults to zero, so a delivery carrying a perfectly good emissive texture and no factor
  arrives multiplied by nothing: the map is there, it is correct, and the surface is dark.

That last pair is why this cannot be handled by intuition. Two properties of the same kind,
sitting beside each other, with identically-shaped omissions, and one omission is a no-op
while the other deletes a feature. There is no principle to derive it from. It is read
once, from the specification, and written down.

## The epistemic point underneath

A default applied silently is an unstated value rendered as a stated one, which is the
failure the corpus already names: an unmeasured thing must render as unmeasured, never as
a neutral number standing in for one
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)). At an import
edge this has a concrete consequence. A material property that arrived and a material
property that was defaulted must be **distinguishable after the import**, because they have
different owners: the first is a question for the delivering side, the second is a question
for whoever wrote the request. A pipeline that flattens both into a number has destroyed
the only thing that would route the bug to the right person
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)
— the basis here being *stated by the author* versus *supplied by the format*).

## Procedure

1. **Read the default for every material property from the format's own specification and
   record it in the participant table** beside the colour spaces and the gloss axis. It is
   a short list and it is the half of the table nobody writes down, because defaults feel
   like implementation detail until one of them is a shipped bug.
2. **Have the import record which properties were present in the delivery**, not only their
   resulting values. A per-material list of stated versus defaulted properties costs
   nothing at import time and is unrecoverable afterwards.
3. **Decide a policy per defaulted property, once, and write the reason.** There are only
   three honest policies — accept the format's default, substitute a project default that
   is stated as a project decision, or refuse the material and report it — and the right
   one differs by property. Accepting fully-metallic is almost never right; accepting an
   occlusion strength of one almost always is.
4. **Route defaulted transparency and two-sidedness to a human by asset class.** These two
   cannot be inferred from anything in the delivery, they are catastrophic and invisible in
   opposite directions, and the classes that need them — glazing, foliage, cloth, thin
   plates — are known in advance from the request.
5. **Push the negative case through the swatch.** A material authored with *no* factors and
   *no* maps is a valid delivery and belongs in the calibration artifact, because it is the
   only way to observe what the pipeline does with an empty material before an asset does.

## Decision rules

- **When an asset arrives missing a property nobody removed, read the format's default
  before opening the exporting tool.** This one rule is worth the technique on its own: it
  is the difference between a five-minute lookup and a day inside somebody else's software.
- **When a defaulted value is accepted, record that it was defaulted.** An accepted default
  and an authored value that happens to match are different facts, and only the second one
  survives a change of delivering tool.
- **When a whole delivery is fully metallic, suspect the defaults before the maps.** A
  material with no gloss factors is far more common in machine-produced deliveries than one
  authored as metal, and the two look identical downstream.
- **When a project default is substituted for a format default, state it as a project
  decision with an owner.** Otherwise it becomes folklore, and the next pipeline will apply
  a different one and call the difference a regression.
- **When the same property is defaulted on every material in a delivery, the fix is
  upstream.** A systematically absent property is a request or an export-preset problem,
  and correcting it at the edge hides a conversation that needs to happen.

## When not to use it

- **Where the delivering side is inside the same project and fully specifies its
  materials.** Then omissions are a defect at the source and should be fixed there rather
  than absorbed into a defaults policy that will outlive the reason for it.
- **As a way to fill in missing art direction.** A defaults policy answers *what did the
  format decide*, not *what should this surface be*. A pipeline that starts inventing
  plausible values for absent properties has become an author, without being reviewed as
  one.
