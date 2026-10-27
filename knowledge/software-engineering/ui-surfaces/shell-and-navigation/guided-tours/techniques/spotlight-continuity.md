---
layer: technique
type: technique
subject: guided-tours
technique: spotlight-continuity
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [the spotlight blinks out between screens, a ring restarts its animation on every tick, an effect plays on the wrong element during a route change]
---

# Spotlight continuity

A spotlight that crosses screens has a gap to cross. The step's element lives on
the next screen; the next screen streams in on its own schedule; for a few
hundred milliseconds — longer on a slow machine — there is nothing to light.
The naive renderings of that gap are all visible: the ring vanishes and
reappears (a blink that reads as a glitch), it snaps to the window's centre and
back, or it holds on the old element as if it were the new one and plays the
new step's effect on it. This technique owns the gap: what the spotlight shows
while its element is not drawn, how it knows whether the box it holds is real,
and how it measures without restarting itself.

[action-driven-advancement](./action-driven-advancement.md) owns the
choreography of the route change — declaring it, waiting for arrival before
resolving the anchor. This technique owns the **geometry** across it.

## Hold the last box, briefly

While the step's element is not yet drawn, the spotlight **holds its last
measured box** for a short, bounded window — on the order of a second and a
half — and then lets go. Holding turns the blink into a glide: the ring stays
put while the next screen arrives, then moves from the old box to the new one
with the spotlight's ordinary transition. Letting go after the window is the
other half: when the element does not arrive, the spotlight releases into the
step's declared degraded posture
([missing-anchor-degradation](./missing-anchor-degradation.md)) rather than
pointing at a stale place indefinitely.

The window starts the first time the element is found missing, not at step
entry, and is cleared the moment the element is found. Pick the length from
the product's real screen-arrival times, not from taste: shorter than a typical
arrival and the blink returns, much longer and a vanished element is pointed at
long enough to be believed.

## A held box is not a live box

The held box is a last-known value, and it must never be treated as the
current one ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
The stage the spotlight renders from therefore carries a **live** flag beside
the box: true only when the box is this step's own element, measured now.
Everything that means "here, this element" reads the flag:

- **Effects play only on a live box.** A sweep, a flash, a ghost pointer, a
  pressed control — each is about this step's element, and played on a held
  box it lands on the previous step's element and teaches the wrong thing.
- **Scroll-into-view acts only on a found element**, once per entry, never on
  a held geometry that may no longer correspond to anything.
- **The ring itself may draw from either**, because a ring on a held box says
  only "the guidance is here" while it glides.

## Measure on tick, resize and arrival, and skip what did not move

The spotlight's box is a derivation from the element's live position, and it
must be recomputed when the element moves for any reason — scroll, a panel
opening, a font size change, the screen finishing its stream. Three triggers
cover it together: a **short tick** (a few hundred milliseconds) as the floor,
**viewport resize**, and a **mutation signal** for the moment a region of the
screen lands — narrowed to the attribute or marker the product sets when
content arrives, coalesced to one measure per frame, never a subtree-wide
observer firing on every keystroke.

Each measure builds the whole stage — the area, the box, the live flag — and
compares it with the last one. **When nothing moved, nothing is rendered.** This
is not an optimisation; without it the tick re-renders the spotlight several
times a second, and every re-render restarts an entrance animation, so the
ring visibly pulses on a still screen.

Measure relative to the box the tour layer is drawn in, and clip the result to
it, so a spotlight inside a windowed frame never escapes the window or
mis-registers when the frame itself is offset.

## What this technique refuses

- A spotlight that disappears for the duration of every route change.
- A held box with no bound, pointing at a place that no longer exists.
- Effects, pointers or scrolls driven by a box that is not this step's own.
- A measurement loop that re-renders when the geometry is unchanged.
- A mutation observer over everything, where a narrow arrival signal exists.

## When not to use it

A tour confined to one screen has no gap to cross; ordinary geometry
derivation from [anchor-contracts](./anchor-contracts.md) is enough. Under a
reduced-motion preference the hold still applies — the ring stays rather than
blinking — but the move from old box to new is a cut, not a glide.
