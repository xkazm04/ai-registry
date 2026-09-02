---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: drainage-coherence-as-plausibility-gate
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a generated landscape has rivers that run uphill or water perched on a slope, checking a heightfield for internal consistency before anyone dresses it, ordering the passes of a terrain generation pipeline, deciding what a cheap terrain check may and may not conclude]
---

# Drainage coherence as a plausibility gate

There is one computation over a heightfield that separates ground which could plausibly
exist from ground which could not, and it is cheap enough to run on every generation: work
out where the water goes. Assign each sample a flow direction toward its steepest downhill
neighbour, accumulate the flow along those directions, and ask whether the water can leave
the field. Terrain that fails does so unmistakably — channels that climb, rivers that end in
a wall, standing water on a hillside, a network whose branches feed each other's headwaters.

The naive reading is that this is a realism nicety for simulation people. It is not. It is
the cheapest available test of whether a heightfield is *internally consistent with itself*,
and it catches a whole class of pipeline defect that no structural check can see, because the
grid is well-formed in every failing case.

## What the computation is

Three passes, none expensive, all over the same grid.

**Flow direction.** For each sample, the neighbour with the steepest descent. Ties are
resolved by a stated rule, because an unstated tie-break makes the network irreproducible
between runs and the difference shows up as a river that moves when nothing changed.

**Depression resolution.** Local minima with no downhill neighbour are pits, and a raw
generated field is full of them — most are numerical noise a few samples across, a few are
real basins. Resolve them by the standard approach of raising the surface within each
depression until it can spill over its lowest boundary, and **count what was resolved and by
how much**. That count is the diagnostic: a field needing thousands of tiny fills is a noisy
field, and one needing a single very deep fill has a real basin in it that somebody should
have declared.

**Flow accumulation.** Walk the directions downstream, summing contributing area. The result
is a drainage network — a branching structure whose trunk carries the most area — and it is
the artifact worth keeping, because it is what the rest of the check reasons over and what a
downstream pass can use to place rivers rather than inventing its own.

## What it proves, and what it does not

It proves the field is coherent as a surface water can move over. Concretely: no channel
gains elevation along its course, every accumulated flow reaches either the field boundary or
a declared basin, and no body of standing water sits at a level its surroundings do not
support.

It proves nothing about geology, beauty, scale, readability or fun. A field that drains
perfectly can be a lumpy monotone mess with no landform legible at any distance. This is a
rung on a ladder of evidence, above structural validity and below every perceptual judgment,
and a report that says "drainage coherent" and stops has said something true and small. Say
which rung was reached rather than letting a cheap pass read as an endorsement, per
[structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient).

## Procedure

1. **Require the basis and a stated water level** — or state that there is none. Whether
   standing water exists at all is an input; a check that guesses a water level produces
   confident findings about its own guess.
2. **Compute flow direction with an explicit tie-break rule** and record the rule.
3. **Resolve depressions and report the count, the total volume raised, and the deepest single
   fill.** Report these even on success: they are the field's noise signature, and a change in
   them between two runs of the same generator is a signal worth having.
4. **Accumulate flow, and extract the network** above a stated area threshold. The threshold
   is a declared parameter — it decides what counts as a river rather than a rivulet — and it
   travels with the result.
5. **Assert the invariants.** No channel gains elevation downstream. Every network terminus is
   the field boundary or a declared closed basin. Every body of standing water has a level
   consistent with its containing basin's spill point.
6. **Report an empty or trivial network as a failure of the check, not a pass.** A field that
   produced no channels above the threshold either is a plain, in which case say so, or was
   handed to the check in the wrong space. A verdict computed over nothing is not a verdict,
   per [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass).
7. **Re-run after every pass that modifies elevation.** This is the whole practical value: the
   check is cheap enough to be a fixture between passes, and that is where it earns its place.

## Decision rules

- **When drainage fails, suspect the pass order before the passes.** Carving channels and then
  raising relief produces exactly this failure, and each pass is individually correct. The fix
  is an ordering change; re-tuning the erosion parameters will not touch it.
- **When two separately generated regions are blended, run the check across the seam
  specifically.** Each half can be coherent and the join hydrologically impossible, and the
  seam is where nobody looks.
- **When a closed basin appears, require a declaration rather than auto-filling it.** Basins
  with no outlet exist in the real world and are excellent play spaces. An undeclared one and
  an intended one are identical in the field and opposite in intent, and only a human settles
  which it is. Auto-filling destroys a designed feature; auto-failing blocks a legitimate one;
  requiring the declaration does neither.
- **When the depression count is enormous but every fill is shallow, do not report a
  hydrological defect.** That is generator noise, and the finding to raise is about the
  smoothing or the quantization step, not about water.
- **When the terrain has no water in its fiction, still run the check.** Uphill channels are a
  symptom of a broken elevation pipeline whether or not anything wet is ever rendered; drainage
  coherence is being used here as an instrument on the heightfield, not as a promise about
  rivers.
- **When drainage passes, do not let it stand in for a look.** It is a plausibility rung. The
  perceptual judgment is a separate rung with a separate instrument, and conflating them is how
  a pipeline learns to ship coherent ugliness.

## When not to use this

- **Interiors, caves and any field that is not an open surface.** Flow over a heightfield
  assumes one elevation per horizontal position; anything with overhangs or ceilings breaks the
  assumption and the check returns nonsense with full confidence.
- **Stylized or non-naturalistic worlds** — floating islands, sculpted arenas, geometry that
  reads as architecture rather than landscape. The invariants encode an expectation about
  natural surfaces that these deliberately reject.
- **Very small fields**, where the network is a handful of samples and the statistics are
  noise. Below a stated size the honest output is *not applicable*, not a pass.
- **As an acceptance verdict on its own.** It is one rung of several, and a terrain accepted on
  drainage alone has been accepted on the cheapest evidence available.
