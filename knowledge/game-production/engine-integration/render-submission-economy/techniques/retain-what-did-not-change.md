---
layer: technique
type: technique
subject: render-submission-economy
technique: retain-what-did-not-change
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [static geometry is rebuilt from thousands of immediate-mode vertices every frame, a text layer is laid out again on every refresh although most strings did not change, deciding what a retained buffer or layout cache is keyed on]
---

# Retain what did not change

The concern: a frame that rebuilds what it drew last frame pays for the same work twice, and on
a constrained device the rebuild is often the larger part of the cost. Two shapes recur. Static
geometry — a minimap's road line, painted lane marks, a level's outline — is pushed through an
immediate-mode path as thousands of vertices every frame, re-filling a dynamic buffer the driver
must copy each time, when it could live in the graphics processor's memory and be drawn with one
call. A buffer refilled every frame is worse than its copy suggests: so that the processor is
never made to wait on a buffer still in flight, the driver keeps several versions of it alive,
which costs memory and allocation work as well as the upload. And a text layer re-lays out every label on every refresh, glyph by glyph, although almost
none of the strings changed. The remedy for both is to keep the previous result and rebuild only
what changed — with the cache keyed on everything that determines the output, and with the
output proven identical to the rebuilt one.

## Procedure

**1. Find the rebuilds.** Per frame, the vertices submitted through immediate or dynamic paths,
the buffer uploads, and the glyph quads laid out, attributed to the system that issued them. A
system whose counts are the same every frame for the same scene is a candidate.

**2. Bake static geometry from the same formulas the live path used.** The retained buffer is
filled by the code that generated the immediate vertices — the same line widths, the same joins,
the same ordering — so that the two paths cannot drift apart. A retained mesh built by a second,
"equivalent" routine is a second authority over the same picture, and the two will disagree the
first time someone edits one of them
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)).

**3. Bake on first use and invalidate on the event that changes it.** A scene change, a phase
change, a new level: the key is whatever the geometry was computed from. Bake lazily so the cost
lands where the scene is entered, not at startup for every scene that may never be shown.

**4. Keep the immediate path as a fallback, reachable and tested.** If the geometry exceeds the
buffer's capacity, or the bake fails, the frame draws the old way and the fallback is counted.
A fallback that is never exercised is the path that breaks unnoticed.

**5. For text, reuse the previous layout per call.** When a refresh issues the same sequence of
text calls as the last one, a call whose string, origin and colour match the call at the same
position — and which starts at the same place in the vertex array — finds its quads already
there and only advances the count. Anything else is laid out again from that point on.

**6. Verify equivalence in a check run.** During development, every skipped rebuild is also
rebuilt and compared, and the number of mismatches is reported with the number of comparisons. A
cache proven only by "the screen looks the same" has passed the structural rung
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
The check is removed or switched off once it has run over a representative session, and its
result is kept with the change.

**7. Report every count the change moved, including the ones that got worse.** A retained
mesh drawn inside a shape pass may split the pass and add draws while saving vertex work; a
layout cache that skips glyph layout does not, on its own, remove the allocation of the strings
handed to it. Both are true results and both are stated
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When a cache key omits something that changes the output, the cache is a defect.** List the
  inputs from the code that produces the output, not from memory.
- **When retaining adds draws, measure the trade on the device.** A few extra draws against
  thousands of fewer vertices usually wins on a weak core; it is still a trade, and it is
  reported as one.
- **When the inputs to a cached step are still rebuilt every refresh, say what was not saved.**
  Skipping layout is one saving; not building the strings is another, and claiming the second
  from the first overstates the change.
- **When the retained buffer competes for a tight memory budget, count it.** Retained geometry is
  resident memory, and on a small device it belongs in the residency table.

## When not to use

Not for geometry that genuinely changes every frame — a particle trail, a moving car — where the
retained buffer would be refilled anyway. Not for a handful of quads, where the bookkeeping costs
more than the rebuild. And not for a text layer whose strings change on every refresh, such as a
running timer, unless the stable labels around it are separated from it so that only the timer
is rebuilt.
