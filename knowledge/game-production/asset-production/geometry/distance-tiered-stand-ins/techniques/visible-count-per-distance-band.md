---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: visible-count-per-distance-band
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [an open scene overruns its geometry budget although every asset passes its class ceiling, building a gate or capture that sums visible triangles, deciding how many instances of a class may draw at full detail]
---

# Visible count per distance band

## The concern

A class ceiling prices one instance. A frame pays for every instance in view. In an enclosed space the
gap between the two is small, because walls hide most of the level and the renderer drops what they
hide. In an open space nothing is hidden. Every instance inside the view volume is drawn, and the
farther bands hold far more instances than the near one, because the visible ground area grows with
distance. The quantity that decides whether an open scene fits is therefore the count of visible
instances, split by the distance band each one stands in, multiplied by the cost of the tier that
draws that band.

## Procedure

1. **Fix the play views.** Measure from the places the player actually stands and looks, and include
   the worst one: the highest point with the widest view. An average view hides the frame that misses.
2. **Bin the visible instances by the chain's bands.** For each class, count the instances inside the
   view volume in each band between two switch distances. Test against bounds, not origins, because a
   large object can enter the view while its origin is still outside.
3. **Price each band by its drawn tier.** Use the count times that tier's triangles, plus the band's
   shadow policy. The sum over bands and classes is the frame's geometry bill for the view.
4. **Cap the near tier by count as well as by distance.** A cluster that stands just inside the near
   band can put a hundred full meshes on screen at once. One engine's terrain system exposes exactly
   this pair: the distance at which billboards begin, and a maximum number of trees drawn as full
   meshes. Above the cap, the farthest near instances drop a tier early.
5. **Report what the instrument counted.** State whether it counts the tier actually drawn or the near
   tier for everything, whether it tests occlusion, and whether it runs on the device or on a desktop
   proxy.

## The instrument that counts the near tier everywhere

A capture that sums the near tier's triangles for every visible instance is easy to build, because it
needs no knowledge of which tier the engine picked, and it is stable from build to build. It is also a
ceiling. It states what the view would cost with no chain. Labelled as an estimate, it is useful: it
bounds the worst case, and it does not move when someone tunes a threshold. Unlabelled, it is
dangerous. Every tier the chain adds saves real cost that this instrument cannot show, so a budget
review that reads it will conclude that the chain did nothing. Keep two numbers. One is the near-tier
ceiling. The other is the drawn-tier bill, read from the tier the engine actually selected for each
instance, or from the recorded chain applied to measured distances. The difference between them is the
chain's saving, and only that difference can justify the chain's authoring cost.

An instrument that returned zero because the scene had not loaded, or because the view was not set, is
not a cheap frame. Have the capture report the number of instances it walked, beside the triangles
([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).

## Decision rules

- **When nothing occludes, budget by visible count.** A per-class ceiling multiplied by an assumed
  count is a guess. A counted view is a measurement.
- **When a band's count grows with draw distance, the far tiers decide the bill.** Spend effort on the
  card and the cull distance before shaving the near mesh.
- **When the drawn tier cannot be read, report the ceiling as a ceiling.** Never present it as the
  frame's cost, and never present the absence of a drawn-tier number as a pass
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When frame time is bound by something other than geometry, a smaller count changes little.**
  Measure which cost binds before cutting instances. Fill-bound and submission-bound frames have their
  own remedies.

## When not to use it

When walls bound every view, occlusion does most of the work and a per-room estimate is enough. When
a renderer culls and selects detail on the graphics processor and exposes no per-instance tier, the
drawn-tier bill has to come from the device's own counters rather than from this tally. In that case,
keep the ceiling as the stable reference and read the drawn cost from the profiler.
