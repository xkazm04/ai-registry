---
layer: technique
type: technique
subject: video-assembly
technique: seek-stable-composition-authoring
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel, edit-do-not-regenerate]
shared_with: []
use_when:
  - a cut is compiled from a declarative source rather than exported from a playhead
  - a render is split across workers, resumed after a crash, or re-rendered in part
  - an animation is entered at an arbitrary position - a replay, a scrub, a deep link
  - a composition previews correctly and the finished render disagrees with it
---

# Seek-stable composition authoring

Compiling the cut from source buys reproducibility only if the compiler is a
**pure function of the frame index**. That is a property of the composition,
not of the renderer, and it is the obligation the compile-from-source
decision quietly takes on. A renderer that asks "what does frame 90 look
like?" must get one answer, whatever it asked before — and the moment it is
allowed to ask out of order, every value that was captured when an animation
*started* becomes a second, invisible input.

The defect this technique prevents has a signature worth recognising: the
composition previews perfectly, the render is wrong, and the wrongness sits
at the boundaries where the work was divided.

## Why the safe-looking path is the one that hides it

A sequential playhead resolves every implicit starting value the way the
author imagined, because it passes through every intermediate state on the
way. That is exactly what makes it useless as a check. Preview, a local
single-process render, and a test that plays the timeline from zero all
travel the one path on which the defect cannot appear — so the gate reports
pass for a case it never examined, which is *unmeasured-is-not-pass* applied
to the author's own eyes.

Anything that enters the timeline somewhere other than the beginning takes a
different path: a worker handed frames 45-89 and starting cold, a resumed
render, a re-render of one chunk, a scrub, a replay button. These are not
exotic. They are the ordinary consequences of treating the render as
disposable, and each one is a fresh process with no history of the frames
before its own.

## The rule

**Every value a frame shows must be derivable from the frame index alone.**
A value that is read from "wherever the property happens to be right now"
is a value that depends on the route, and the route is not part of the
composition.

The hazard is easy to misidentify, and the precise form matters because the
loose form bans something harmless:

- A **relative value** with one writer is seek-stable. It resolves against a
  base nothing else is touching, so every entry path computes the same
  number. Banning relative values outright costs expressiveness and buys
  nothing.
- A **second writer** is the hazard. When one writer is still moving a
  property and a second writer starts on that same property with an implicit
  start — a relative offset, or simply an animation to a target from whatever
  the current value is — the second writer's base is whatever the first had
  reached *at the moment it initialised*. Entering sequentially catches the
  first writer mid-flight; entering cold catches it at its end state. The
  same frame then resolves to two different values.

Stated as the fix: **give the second writer explicit endpoints.** Declare
both ends of the movement, or set the property outright before starting, so
the value is stated rather than inherited.

A paired measurement makes the size of it concrete. A timeline with an
absolute writer running 0→100 and a relative writer starting mid-flight was
rendered twice: once as a single process walking every frame in order, and
once as two workers splitting at the midpoint, the second starting cold.
**Half the frames disagreed**, and at the seam the value moved sixteen times
a normal frame's step — the snap a viewer sees as a jump at a chunk
boundary. The same timeline with explicit endpoints produced identical
frames on both paths, and a single-writer relative value produced identical
frames on both paths too. The control is what makes the discriminator
trustworthy: it is the second writer, not the relative value.

## The other entry-captured values

Relative bases are the common case, not the whole class. The same question —
*is this derived from the frame, or captured on the way in?* — catches the
rest:

- **Measurements taken inside a callback.** Reading live, animated geometry
  reports whatever the current route has produced. Reading intrinsic,
  layout-invariant geometry is safe, because it answers the same on every
  path as long as layout itself is not animated. The distinction is worth
  keeping, because the safe reads are the useful ones.
- **Values re-resolved per repetition.** A cycle that recomputes a relative
  offset each time it repeats accumulates, so a worker entering at cycle N
  skips the accumulation a sequential playhead performed.
- **Anything drawn from an unseeded generator**, which is the obvious case
  and the one authors already guard.
- **Initial states declared only as a change from the current state**, which
  never run for a renderer whose first request is not frame zero.

## Enforce it at the layer that can see it

Frame-index purity is broken at more than one altitude, and no single layer
can see the others. The composition can break it with a second writer; the
runtime can break it with a non-reproducible drawing backend; the encoder can
break it by emitting frames whose placement is not fixed at the split points,
so the pieces no longer join losslessly. Each of those is invisible from the
other two.

So refuse each one where it is configured, with an error that names it,
rather than routing everything through the authoring gate: the composition
check cannot see the drawing backend, and the encoder settings cannot see a
relative value. A single generic "the render did not match" at the end is the
symptom of enforcement placed at one altitude for a property that is
violated at three.

The composition half is statically checkable, which is what makes it worth
gating: order-dependent constructs are visible in the source without
rendering anything. Run that check before the render rather than watching
the output for snaps — the snap is a slow, expensive, and unreliable
detector for something a reader can find.

## Decision rules

- If the render may be split, resumed, or partially re-done, treat frame-index
  purity as a property to gate, not a convention to remember. Every economic
  reason to compile from source is also a reason the renderer will eventually
  enter out of order.
- If two writers touch one property and the second starts while the first is
  moving, state the second's endpoints. This is the single highest-yield check
  in the class.
- If a preview and a finished render disagree, suspect the entry path before
  suspecting the renderer, and reproduce by entering cold at the disputed
  frame rather than by playing up to it.
- If a value must be measured from the scene, measure something the animation
  does not move.
- If a check cannot see the layer that breaks the guarantee, do not put the
  check there.

## When not to use it

A composition rendered only ever in one process, from frame zero, in one pass
does not pay for this discipline — though that is a claim about today's
pipeline rather than about the composition, and it expires the first time a
render is distributed or resumed. Material that is genuinely a recording
keeps its own rules: footage referenced by the composition is not governed by
frame-index purity, because it is not being computed per frame. And where a
sequence is deliberately a trajectory — each state defined as a continuation
of the last, as a model rather than as an accident — ordering is the content,
and the composition should say so rather than pretend to be seekable.
