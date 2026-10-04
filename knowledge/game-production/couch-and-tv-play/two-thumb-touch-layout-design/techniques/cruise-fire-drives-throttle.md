---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: cruise-fire-drives-throttle
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [the right thumb is overloaded by go plus fire, offering a layout where attacking also drives, deciding how brake interacts with a combined hold]
---

# Cruise: fire drives the throttle

The named concern: in one selectable layout the fire hold also supplies throttle. Go and
fire are the two most frequent holds in a vehicle-combat game, and in the classic layout
they compete for the right thumb. The cruise layout merges them: while fire is held, the
car is driven; when fire is released, propulsion stops with it.

## What it is and what it is not

It is not an always-on throttle. An automatic throttle that never lifts is a different
design: it removes a control the player owns, and it makes coasting and stopping into
something the player must fight. Here the thumb still decides, and the decision is one
hold instead of two. It is also not a hidden rule: the control's label says so, because a
player who fires and discovers the car accelerating has been surprised by the layout rather
than helped by it.

## Procedure

1. **Derive the effective throttle at the point where the held states are combined**, as
   the larger of the go value and a full value when fire is held and the layout declares
   that fire drives. The layout data carries a flag; the combination reads it. Do not hard
   code the layout's name into the combination.
2. **Leave the explicit go control in place or hide it, as the layout says**, but never let
   a hidden control keep a live owner ([the ownership technique](pointer-capture-per-control.md)).
3. **Let brake override**, not subtract. Brake and drive held together mean brake. State
   that on the control itself.
4. **Relabel the fire control** to say it also drives, so the combined meaning is on the
   glass at the moment the thumb meets it.
5. **Keep the drift or handbrake control within the same thumb's neighbourhood** but not
   under it, because a combined hold plus a handbrake is the normal action in a corner and
   the other thumb is busy steering.
6. **Send the combined result, not the intention.** The receiver gets the throttle value
   it should apply; it does not learn the layout's rules.

## Decision rules

- **When the player needs to shoot while stationary or reversing out of a corner, offer a
  layout that does not combine them.** Cruise trades that action for a freer right thumb;
  it is a preference, and the classic layout remains for the players who want the trade
  the other way.
- **When fire has a cooldown or runs out of ammunition, throttle must not depend on
  whether the weapon can actually shoot.** A hold whose throttle cuts out when the magazine
  empties surprises the player at the worst moment. The throttle follows the held thumb,
  not the weapon's state.
- **When brake is held with fire, the car brakes and the weapon still fires.** The override
  is on propulsion only.
- **When the layout changes away from cruise while fire is held, clear the hold.** A thumb
  that was holding the combined control must not become a thumb holding only fire with
  residual throttle.
- **When someone proposes making cruise the default, require use before argument.** Whether
  one hold beats two for a given owner's thumb is an unmeasured claim
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)); the layout
  is offered as an experiment with a stable name, and the default is a proposal.

## Evidence status

That fire produces full throttle, that release stops both and that brake overrides can be
checked by a scripted client against the combined value; that is a structural and
behavioural result on emulated touch. That the merged hold is more comfortable, less tiring
or faster over a race has not been measured by anyone in the cases this technique was drawn
from. Report it as authored.

## When not to use this

- **Games where firing while stationary is the core loop**, such as a turret or a
  stop-and-pop shooter. Fire-drives would move the vehicle on every shot.
- **Weapons that need an aimed or charged release.** A hold that must be let go to take
  effect cannot also be the throttle without making every shot a lunge.
- **Players or contexts where unintended acceleration is costly**, such as a game with
  hard walls and instant elimination and no assist. The merged hold raises the cost of a
  mis-tap.
