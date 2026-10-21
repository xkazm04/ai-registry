---
layer: technique
type: technique
subject: standalone-headset-frame-budgets
technique: forward-path-feature-allowance
status: draft
laws: [a-budget-shapes-the-output, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [choosing the shading path for a mobile-class head-worn target, a material feature assumes a deferred path, costing post-processing on a tile-based GPU, a feature works on the desk build and is missing or broken on the headset]
---

# Forward path feature allowance

The named concern: a standalone headset is rendered on a forward path, because a deferred
path writes several full-size buffers out of tile memory for each eye and reads them back,
and that traffic is the bill a tiler cannot afford. Features built for a deferred desktop
renderer either do not exist on the forward path or cost far more there. The allowance is a
closed list of what content may use, decided before materials are authored.

## When choosing the shading path for a mobile-class head-worn target, choose forward and publish the allowance as a list, because a feature that is not listed will be assumed

The allowance names, for each content class, which features it may use: the number of dynamic
lights that may touch a surface, whether real-time shadows are allowed and from which lights,
whether multisampling is on, and whether any screen-space effect is allowed. Lighting method
per hardware tier is not decided here. It comes from
[hardware-tier lighting presets](../../../../asset-production/surface-and-imagery/shader-budget-authoring/techniques/hardware-tier-lighting-presets.md),
whose floor tier is the headset. The allowance cites that preset and adds the forward-path
limits to it.

## When a material feature assumes a deferred path, replace it with a forward equivalent or remove it, because a feature that reads the frame's buffers forces them off chip

Screen-space reflections, screen-space ambient occlusion and decals that read a buffer of
surface normals all assume buffers that a forward tiler does not keep. Their forward
equivalents are baked: reflection probes, ambient occlusion baked into textures or vertices,
decals as mesh geometry. The swap is decided per feature, with its cost, under the shader
budget subject's rules for cheaper swaps.

## When costing post-processing on a tile-based GPU, cost the resolve as well as the effect, because any pass that reads the finished frame first writes it to memory

A full-screen pass after the scene makes the frame leave the tile, adds a full write and read
per eye, and runs at full resolution. It can also cost features that apply only to the final
swapchain image, such as on-chip multisample resolve and foveated rendering. Where a look
needs colour grading or a vignette, do it in the forward shaders or in a compositor layer,
not in a separate pass. A post pass is allowed only by name, with its device cost recorded.

## When a feature works on the desk build and is missing or broken on the headset, treat the desk as the wrong platform, because the desk build may run a path the headset never will

Run the desk build on the same shading path and feature set as the headset wherever the
engine allows it, so a feature outside the allowance fails on the desk first. Where it does
not allow it, the desk result for that feature is unmeasured for the headset.

## Decision rules

- **When multisampling is on, keep the resolve on chip** and never resolve through a separate
  copy.
- **When a feature is added to the allowance, its device cost is recorded with it**, in an
  application.
- **When two content classes want different allowances, the stricter one is the default** and
  the looser one is an exception with its owner.
- **When the allowance is written in a plan, each row names the setting or the code line that
  enforces it.** A row with no such line is marked unenforced, and until it has one, the code
  is the allowance. A list nobody checks against the configuration is a second authority, and
  the code drifts from it within one phase.

## When not to use it

For a tethered headset driven by a desktop GPU, a deferred path may be right, and this
allowance does not apply. It binds wherever the headset renders on its own GPU.
