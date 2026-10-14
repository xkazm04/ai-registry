---
layer: technique
type: technique
subject: rigid-body-simulation-stability
technique: replicated-environments-share-unbounded-geometry
status: forged
laws: [an-instrument-proves-it-had-input]
shared_with: []
use_when: [cloning one scene many times to train or test in parallel, contact cost that grows faster than the copy count, a profile that blames the solver for a scene whose individual copies are cheap]
---

# Replicated environments share unbounded geometry

The named concern: when one scene is cloned N times and run in one simulation, any
collider with no edge (an infinite ground, a half-space) that is copied with it must be
authored once or replaced by a bounded stand-in. The defect this prevents is contact work
that grows with N squared while every individual copy looks cheap.

## The mechanism

A copy of the scene is placed at an offset from the others so the copies do not interact.
That works for everything with a finite extent, because the offset keeps the extents apart.
It fails for an unbounded collider, which extends through every other copy's space. N copies
of the same infinite plane are N overlapping surfaces, and every dynamic body in every copy
touches all N of them. Contact pairs scale as bodies times N, and since bodies themselves
scale with N, the total scales as N squared. The cost lands in the solver and the contact
generation, so a profile points there, and the natural response (tune the solver) is
mistaken for the cause.

## The rule

Unbounded geometry exists **once** and is shared by all copies, or it is replaced with a
**bounded** collider (a large flat box, for instance) positioned per copy and sized to cover
that copy's footprint and no more. Choose the shared one when all copies stand on the same
surface at a common height; choose the per-copy bounded one when copies sit at different
heights or must be removable independently.

A bounded stand-in has two pitfalls. It must be large enough that nothing in the copy can
leave its edge in normal operation, and thick enough that a fast body does not skip across
it in a step (`bound-actuation-by-the-lightest-coupled-body` states the check). It must not
overlap its neighbours' stand-ins; an offset smaller than the footprint reintroduces the
problem at a smaller scale.

## Verify with a dump, not by inspection

The scene looks right in a viewer whether the planes overlap or not, because the planes are
coincident or invisible. Verification therefore uses a **recorded contact dump** of two
copies: pairs listed per body show whether a body in copy one is in contact with anything in
copy two. Zero cross-copy pairs is the pass. The instrument has to be proven to see: put one
body deliberately on the shared surface and confirm it appears in the dump, otherwise an
empty list means the recorder saw nothing (`an-instrument-proves-it-had-input`).

Count the pairs at two values of N. If the pair count per body is flat, the geometry is
shared; if it climbs with N, something unbounded is still replicated.

## Boundary

This is about cloned scenes. Broad-phase tuning inside a single scene (cell sizes, culling
of distant bodies) is a different problem with different levers and is not addressed here;
the diagnostic here is that the cost is wrong *per copy*, not that the scene is large. A
single scene with one large ground and many bodies is correctly authored.

## When not to use it

Do not bother for a handful of copies, where the quadratic term is not yet the dominant
cost; measure first. Do not share a surface that has per-copy properties (a different
friction or a different height in each copy); bound it per copy instead. And do not infer
from the absence of a slow-down that the geometry is shared: small N hides the growth, and
the check is the pair count.
