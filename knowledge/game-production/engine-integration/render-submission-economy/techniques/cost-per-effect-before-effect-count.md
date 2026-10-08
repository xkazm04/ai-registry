---
layer: technique
type: technique
subject: render-submission-economy
technique: cost-per-effect-before-effect-count
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a frame misses its budget and the proposed fix removes effects or lowers render scale, ordering a performance wave on a constrained device, deciding whether removing a visual layer is an optimisation or a design change]
---

# Cost per effect before effect count

The concern: when a frame misses its interval, two kinds of remedy are available and they
are not the same kind of decision. One lowers what an effect costs to put on screen and
leaves the screen as it was. The other removes or degrades something the player sees — an
effect, a particle budget, a trail length, a render scale. The first is an engineering
decision and belongs to whoever owns the frame. The second is a design decision and belongs
to whoever owns the look. A team that reaches for the second because it is quicker to type
has spent the game's identity to save an afternoon, and usually has not saved the frame,
because the submission waste that caused the miss is still there.

## Procedure

**1. Name the binding bill on the device.** A profile taken on the target says whether the
render thread is bound by submission (draws, binds, uploads, layout, allocation), the graphics
processor by fill, or the process by memory. The order below lowers submission; if fill binds,
the cheaper-shader and overdraw remedies come first, and if residency binds, the budget comes
first. A host profile can rank candidates by count; only a device profile says which bill binds.

**2. Price each effect class in requests.** For every visual system — cars, ground decals,
particles, the minimap, the text layer — count what it asks the driver for per frame: draws,
texture switches, vertices or indices, buffer uploads, bytes allocated. Most of the frame's
submission usually belongs to two or three classes, and they are rarely the ones a designer
would name as expensive.

**3. Remove work that draws nothing.** Two kinds qualify and neither is an effect cut. Work
off the stage, which the cull removes. And duplicate work: a procedural decoration still being
generated and drawn beneath art that now covers it, a history buffer of marks drawn twice by
two systems, a pass baked for a fallback that is not active. Removing a duplicate is legitimate
only with proof that the screen is unchanged where the real art exists, and only if the
procedural version remains as the fallback where the art is missing — otherwise it is a cut
with a misleading name.

**4. Lower the price of what remains, in order of saving per risk.** Merge requests the
driver would take separately; stop rebuilding what did not change; move or spread work that
lands whole on one frame. Each step keeps the picture identical, proves it, and records its
before and after counts.

**5. Measure after each step, and stop when the frame fits.** The counts from step 2 are
re-taken; the device cost is taken on the device or carried as unmeasured. A step whose saving
is below the materiality floor stated for the wave is recorded and not pursued further.

**6. Only then, propose a cut — to its owner, with its figure.** If the frame still misses,
the proposal names the effect, the measured saving its removal would buy, and what the player
loses. Render scale is on the same list: lowering it changes every pixel on screen, and it is
an effect cut however it is labelled.

## Decision rules

- **When a proposed fix changes what the player sees, it is a design change.** It goes to the
  owner of the look with a measured saving, and the frame owner does not take it alone.
- **When an owner has ruled that the feature set stays, the frame owner's tools are the
  submission tools.** The ruling is a constraint the wave is planned under, not a preference to
  revisit when the work gets hard.
- **When removing a layer, prove it was a duplicate.** The screen with real art present is
  identical with and without it; the fallback without the art still draws it.
- **When a budget fails, do not move the threshold, the physics or the clocks.** A frame target
  met by loosening the measurement, stretching the simulation step or excluding the bad window
  is a failed budget with a passing report
  ([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)).
- **When a saving was counted on a host, its device cost is unmeasured.** Report the counts as
  counts and carry the device time as a gap until a device run fills it
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a change lowers one count and raises another, report both.** A retained mesh that
  saves vertex work and adds two draws is a trade, and the frame decides which side wins.
- **When an estimated saving is small against the frame, say so in frame terms.** A
  microsecond figure measured on a fast host reads as large; the same work as a share of the
  device's frame interval is what decides priority
  ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Alternatives that lose

**Lowering render scale by default.** It is the single largest lever on a fill-bound frame and
it does nothing for a submission-bound one, which on this class of device is common; it also
degrades every pixel, so it is the most expensive cut available in look, not the cheapest.

**Cutting the effect with the highest cost.** Expensive effects are usually expensive because
they are submitted wastefully, and the same effect at a lower price was available.

**Lowering the rate of a periodic job.** It reads as an optimisation and is a cut of freshness;
spreading the job over frames keeps its rate and removes its spike.

## When not to use

When the frame is bound by fill and the cost is the effect itself — a full-screen translucent
layer, a large soft shadow — its price per pixel is the effect, and no submission craft lowers
it; the cheaper-shader swap or the owner's decision comes immediately. When the target is a
multiple of the budget rather than a margin over it, ordered submission work will not close a
factor of two, and the scope decision is the first one to take. And during a prototype nobody
has profiled, where any ordering of remedies is a guess.
