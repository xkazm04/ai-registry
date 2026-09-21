---
layer: technique
type: technique
subject: render-mount-pipeline
technique: edge-sorted-incremental-mount
status: forged
laws: [derivation-names-recomputation, limits-are-derived]
shared_with: []
use_when: [scroll cost grows with the size of the mounted tree instead of the size of the change, deciding whether windowing stops at the row or goes down to the leaf, a nested scroller inside a mounted item does not update while the outer surface scrolls, choosing whether to premount in idle time and what that costs in memory]
---

# Edge-sorted incremental mount

Windowing by row mounts a row when any part of it is visible and keeps every
element inside that row mounted. For a tall item — a long post, a card with a
gallery, a document page — most of its elements are off screen while the item
is on screen. **Incremental mount works at the granularity of the render unit**:
an element leaves when its own bounds leave the visible region, even though its
container is still partly visible. It is possible only because the blueprint
knows every unit's bounds before anything is mounted.

Leaf granularity makes the per-step cost the next problem. Testing every unit
against the visible rectangle on every scroll frame pays for the whole tree
each frame. The technique makes a scroll step cost the number of units whose
edges crossed the viewport's edges, and nothing else.

## Two sorted indices and two cursors

When a blueprint is mounted, derive two orderings of its units along the scroll
axis: one sorted by **leading edge**, one by **trailing edge**. Seed two cursors
by binary search against the visible region: in the leading-edge list, the first
unit whose leading edge is past the viewport's trailing edge; in the
trailing-edge list, the first unit whose trailing edge is past the viewport's
leading edge. Everything before the first cursor has started; everything before
the second has ended.

On each scroll step the cursors move only as far as edges crossed:

- Scrolling forward, advance the trailing-edge cursor across every unit whose
  trailing edge the viewport's leading edge has passed — these left, release
  them — and advance the leading-edge cursor across every unit whose leading edge
  the viewport's trailing edge has reached — these entered, acquire them.
- Scrolling back, walk the same cursors in reverse with the inverse actions.

Each unit a cursor crosses is still checked against the opposite edge before
acquiring, because a unit taller than the step can enter across one edge and
already be past the other. The work per step is proportional to crossings, which
on a fling is a handful of units regardless of whether the tree holds fifty or
five thousand.

The indices are a derived value of the blueprint and are recomputed exactly when
a new blueprint is mounted
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
The cursors are derived from the indices plus the last visible region.

## When the cursors cannot be trusted

The orderings are along one axis. Any movement on the **cross axis**, a visible
region that becomes empty, or a previous region that was empty means the cursors
describe a world that no longer exists: reinitialise with a full pass over the
units and reseed the cursors by binary search. A surface that scrolls in two
dimensions reinitialises on every diagonal step and should use a spatial index
instead; this technique is for surfaces with a dominant scroll axis.

## Nested hosts must hear about every step

A mounted unit may itself host a tree — an inner horizontal carousel, an
embedded independently mounted section. Its own incremental mount depends on
its visible bounds, which change on every outer scroll step even when nothing of
the outer tree crossed an edge. After each step, notify every mounted unit that
hosts a nested tree that its visible bounds changed, **except** units mounted in
this same step, which received their bounds as part of mounting. Units that do
not declare nested trees are skipped, so the notification costs nothing where it
is not needed. Forgetting it produces an inner carousel frozen at whatever it
mounted when it first appeared.

## Exclusion

Some units must exist whenever their host exists: content that must be present
to be measured by something outside the pipeline, media that must not restart,
an element that external code holds a handle to. A per-unit exclusion
declaration removes the unit from windowing entirely — it is acquired on mount
and never released by the window. Exclusion is a declaration on the unit, never
a list maintained by the surface.

## Idle premount, and what it spends

Frames that finish early leave time before the next deadline. Premount spends
that time acquiring the next units past each cursor, so that the next scroll step
finds them already mounted:

- **The deadline is derived.** Deadline = start of the current frame + frame
  interval − a safety buffer. The frame interval comes from the display's
  reported refresh rate, with a floor for implausible reports, and the buffer is
  sized against the work the frame thread must still do after premount yields
  ([limits-are-derived](../../../_laws.md#limits-are-derived)). A buffer chosen by
  feel is raised by feel the first time a premount overruns.
- **One unit at a time, checking the clock between units.** Premount acquires a
  unit, checks the deadline, and yields when it is reached; the next frame
  resumes where it stopped.
- **While premount is on, the window stops releasing.** This is the trade and it
  must be stated where the switch is: premount walks toward mounting the entire
  tree, and with releases suspended the memory held is bounded by tree size, not
  by viewport size.

So premount is correct only where **a tree is item-sized** — each list item its
own mounted tree, with the outer list still windowing items. Turned on for one
tree that holds an entire feed, it converts incremental mount into eager mount
spread over idle frames.

Premount is not the canvas's wave mounting. Waves spread a first paint that
*must* happen across several frames, nearest-to-center first, because doing it
in one frame would freeze. Premount spends slack in frames that already met
their deadline, ahead of any need. And it is not data prefetch, which warms a
cache; premount warms host objects.

## Decision rules

- Mount and unmount at unit granularity whenever the blueprint carries unit
  bounds.
- Keep two edge-sorted indices per blueprint and move two cursors per step;
  never test every unit per frame.
- Reinitialise on cross-axis movement or an empty region.
- Notify mounted nested hosts on every step, skipping those mounted in the step.
- Premount only with a derived deadline, only where trees are item-sized, and
  say beside the switch that releases stop.

## How to test for the property

- Count acquires and releases per scroll step on a tree of N units and plot
  against N at a fixed step size: the line is flat.
- Scroll a tall item so one of its leaves leaves the viewport while the item
  stays: that leaf unmounts.
- Nudge the cross axis by one unit of distance and assert a full reinitialisation
  ran.
- Scroll an outer surface with a mounted inner carousel: the carousel receives a
  bounds notification each step and mounts its own newly visible units.
- With premount on, assert no releases occur and that the per-frame premount
  work ends before the derived deadline on a throttled device profile.
