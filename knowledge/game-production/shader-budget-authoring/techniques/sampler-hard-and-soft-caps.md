---
layer: technique
type: technique
subject: shader-budget-authoring
technique: sampler-hard-and-soft-caps
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
use_when: [setting a texture budget for a material class, a material fails to compile on sampler count, deciding whether an expensive material may ship]
---

# Sampler hard and soft caps

## The concern

A material's texture sampler count has two thresholds that behave nothing alike, and
almost every team carries only one of them. The **hard cap** is the number of sampler
registers a single shader stage may bind — sixteen on mainstream graphics hardware,
unchanged for years because it is a hardware property rather than an engine setting.
Cross it and the material fails to compile, or the toolchain drops maps to make it fit
and tells you afterwards, or not at all.

The **soft cap** is lower and unenforced. It marks the point where the material is
still legal and has stopped being affordable, and — critically — it reserves the slots
the renderer will take for itself. Light maps, shadow and reflection lookups,
environment probes and decal buffers bind into the same sixteen. An author who used all
sixteen in isolation has authored a material that cannot be lit.

## Procedure

1. **Declare both numbers, with the basis attached.** Not "16 textures" — *sixteen
   sampler registers per pixel shader stage, on the current renderer version, including
   the samplers the lighting path binds*. A count without its scope (per stage? per
   material? per pass?) is the source of every argument on this topic.
2. **Set the soft cap by reserving, not by rounding.** Count what the engine's own
   lighting and post paths bind on a representative lit surface, subtract, and use the
   remainder. Against a sixteen-sampler ceiling, thirteen is a defensible working
   figure: three slots held for the renderer.
3. **Estimate before authoring, not after.** Compute the material's expected sampler
   count from its surface class and enabled features at the point the material is
   specified. A ceiling handed to an author up front changes what gets authored
   ([a-budget-shapes-the-output](../../_laws.md#a-budget-shapes-the-output)); a ceiling
   applied at the exit only produces rework.
4. **Report the two overruns as different findings.** Past the soft cap: a warning
   naming the reduction options — pack channels, drop a feature, take the named cheaper
   substitute. Past the hard cap: an error stating the material will not compile, with
   the count and the ceiling both printed.
5. **Recount after packing.** Packing changes the count, so the estimate is only valid
   against a stated packing layout. Estimating against unpacked maps and shipping packed
   ones understates by two or three slots and hides a genuine problem.

## Decision rules

- **When the count is at or below the soft cap, stop optimising.** Slots below the soft
  cap are not savings; they are the material being ordinary. Effort spent there is
  effort not spent on a surface that is actually over.
- **When the count is between the soft and hard caps, it is a producer's decision, not
  an engineer's.** The material works. Someone must decide that this surface is worth a
  disproportionate share of the frame — a hero surface the camera lives on may well be.
  What is not acceptable is nobody deciding, which is what happens when the tool prints
  only a compile verdict.
- **When the count exceeds the hard cap, refuse the material, do not trim it silently.**
  Automatic dropping of maps to fit is the worst available outcome: the surface renders,
  looks wrong in a way nobody can name, and the reason is invisible.
- **When a shared sampler is available, prefer it to a new one.** Reusing an existing
  sampler state across several textures relieves the register pressure without changing
  the maps; it constrains all the sharing textures to identical filtering and wrap
  settings, which is usually acceptable and must be stated when it is not.
- **When the count cannot be determined, report it as unmeasured.** A material whose
  feature set is unknown has no estimate, and a missing estimate must never render as a
  pass ([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)).

## Why the distinction generalises

Every runtime budget in a game has this shape. Draw calls, animated bone counts,
concurrent audio voices, particle spawn rates: each has a number past which the system
breaks and a lower number past which the system merely becomes the reason the frame is
slow. Teams that hold only the breaking number ship content that is individually legal
and collectively unshippable, and they discover it in the last month, in a scene, where
the causes are entangled.

State the pair everywhere the shape appears, and label which is which in the message
the tool emits. The remedies differ: past a correctness boundary there is only removal
or packing, past an economics boundary there is substitution and there is an owner who
may accept the cost.

## When not to use it

- **When the target is not a rasterised real-time path.** An offline or reference
  renderer has no meaningful sampler ceiling, and importing one just makes cinematic
  materials worse. The soft cap survives as an economics idea; the hard cap does not.
- **When the platform genuinely lifts the ceiling.** Bindless resource models remove the
  register scarcity, and a soft cap derived from a limit that no longer applies is
  arbitrary. Re-derive it from what the frame can afford instead of inheriting it.
- **When you have measured cost directly.** Sampler count is a proxy for bandwidth and
  cache pressure, chosen because it is countable before anything runs. Where a real
  profile of the material exists, the profile outranks the proxy — and disagreement
  between them is worth a look, because it usually means one large texture is doing the
  damage rather than the number of them.
