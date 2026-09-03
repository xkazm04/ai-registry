---
layer: technique
type: technique
subject: shader-budget-authoring
technique: hardware-tier-lighting-presets
status: forged
laws: [one-authority-per-quantity, a-budget-shapes-the-output]
use_when: [choosing global illumination settings for a build, deciding what the minimum-spec configuration runs, someone proposes shipping the maximum quality mode]
---

# Hardware-tier lighting presets

## The concern

Global illumination, reflection and shadow quality are the settings with the largest
frame-time swing in a modern renderer, and they are global — one choice affects every
material in the scene. The failure is to treat them per-level or per-material: each
level's owner tunes toward their own shot, nothing is comparable, minimum-spec is never
actually run, and the highest-quality reference mode ends up in a profiling capture that
then justifies a schedule nobody can hit.

The technique is a **small closed set of named presets, one per hardware tier**, each
naming its illumination method and quality, each stating the tier it targets, and one of
which is explicitly marked as not for shipping.

## Procedure

1. **Define the tiers by target hardware, not by adjective.** "High" means nothing across
   a project's lifetime. *Current-generation discrete hardware with dedicated ray
   traversal*, *previous-generation discrete*, *integrated graphics and handhelds* are
   tiers a build system can select against.
2. **Give each preset one illumination method and one quality level.** A preset that
   leaves the method open is not a preset. Four is a good number: a hardware-traced
   preset for the top tier, a software-traced preset at each of two detail settings for
   the middle, and a baked or screen-space fallback for the floor.
3. **State the trade inside each preset, not a ranking between them.** Where a software
   trace offers a detail-versus-global choice, the higher-detail setting resolves small
   geometry and loses long-range light propagation, and the lower-detail setting does the
   reverse. Neither is better. A preset table that implies a linear ladder will send a
   scene with large open sightlines to the setting that is wrong for it.
4. **Mark the reference-quality mode as non-shipping in the table itself.** Where the
   renderer offers a full path-traced or maximum-quality mode, it belongs to cinematics
   and capture. Say so in the preset's own description, because a comment somewhere else
   will not be read by the person selecting it at 2am for a trailer build that then
   becomes the performance baseline.
5. **Carry each preset's rationale and its known gotchas as text on the preset itself.**
   Not in a wiki. The paragraph that says *why this preset exists, what it answers, and
   what breaks under it* is read by the person selecting it and, increasingly, injected
   verbatim into the guidance a generative assistant works from — so it is the artifact
   that actually propagates the reasoning. Write the gotchas concretely: a
   software-traced preset depends on precomputed per-mesh distance data, and thin walls
   and ceilings leak light unless that data's resolution is raised for them. A preset
   whose description is only a name transmits a setting and none of the craft.
6. **Keep the presets under one owner and one definition.** Every consumer — the build
   configuration, the in-game options menu, the profiling harness — reads the same set
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). A settings
   menu that can express a combination no preset names has re-opened the whole problem.
7. **Author materials against the top preset, and profile against the floor.** Content
   authored to the weakest tier looks weak everywhere; content never run on the weakest
   tier does not ship. Both halves are required.

## Decision rules

- **When a material is too expensive, change the preset before you change the material,
  and only if the whole tier is over.** Per-material tiering multiplies the authoring
  surface by the number of tiers, and the low-tier variant is the one nobody looks at.
- **When a scene needs a setting no preset provides, add a preset or change the scene.**
  Never add a one-off override. Overrides are how a closed set becomes variance, and
  variance is why nobody can say what minimum-spec runs.
- **When the top tier's frame budget is met with no headroom, the preset is wrong.** A
  budget stated with its headroom is a budget somebody can plan against; a preset that
  consumes the whole frame in an empty scene leaves nothing for the content, and the
  content is the point ([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)).
- **When a preset has never been measured on its stated hardware, it is a proposal.**
  Tiers derived from specifications rather than from a device in a room are guesses, and
  the floor tier is the one guesses are always wrong about.
- **When someone asks to ship the reference mode, ask what it is for.** Occasionally the
  answer is a title with a tiny high-end audience and it is legitimate. Usually the
  answer is that the capture looked good.

## Why the floor tier deserves the most attention

The top preset is self-correcting: it runs on the machines the team owns, so its
problems are found immediately. The floor preset runs on hardware nobody at the studio
uses daily, is selected by the largest share of players in most markets, and is where a
project discovers late that its lighting method has no fallback at all. Budget the time
for the floor tier at the start, and make the profiling harness run it on every pass —
not because it is the interesting configuration, but because it is the one that will
otherwise be measured for the first time in the last month.

## When not to use it

- **When the project ships to exactly one fixed hardware configuration.** A single target
  needs one configuration tuned to it, and a tier system adds ceremony with no consumer.
- **When the renderer's illumination method is not switchable.** If the lighting is baked
  by a single pipeline with no runtime alternative, the tiering axis is resolution and
  shadow quality instead, and the preset table should say so rather than pretending to
  offer a method choice.
- **As a substitute for per-scene cost discipline.** Presets set the ceiling for the
  frame. They do not stop a scene from putting four expensive surfaces in one view, and a
  team that treats the preset as the whole budget will find that out in review.
