---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: neutralise-on-sheet-open-or-layout-change
status: forged
laws: []
shared_with: []
use_when: [a menu opens over a live controller, the layout or handedness changes while a thumb is down, a car is destroyed or the link drops while inputs are held]
---

# Neutralise on sheet open or layout change

The named concern: when the surface over the controls changes, or the arrangement under the
thumbs changes, every held value returns to its neutral state and every ownership slot is
forgotten, in one routine, before the change is shown.

## The event list is the property

The routine itself is simple. What matters is when it runs. The set of events that must
trigger it is the safety property, and it is finite and enumerable: opening any settings,
car, garage or career sheet; changing the layout; changing handedness; the controlled
vehicle being destroyed; the controller pairing or link state changing; and, for a
browser, the page being hidden or losing focus. Every one of these puts the game and the
phone into disagreement about what is held. If a new sheet is added and is not on the list,
the first player to open it with a thumb on a pedal finds a car driving itself.

## Procedure

1. **Write one routine that zeroes every continuous value and every momentary hold**: steering,
   throttle, brake, fire, secondary weapon, handbrake, and the visual "held" state of each
   control.
2. **In the same routine, forget every touch slot.** A later lift for a touch the control
   no longer owns is then ignored by the identifier check, and cannot toggle anything
   ([ownership technique](pointer-capture-per-control.md)).
3. **Send the neutral state immediately** instead of waiting for the next periodic update,
   so the game stops accepting the old values at once.
4. **Call it first in every handler that opens a sheet**, and in the layout and handedness
   change handlers before the new arrangement is applied.
5. **Call it on the game's own signals too**: a wrecked-vehicle state arriving from the
   host clears a phone that is still holding fire.
6. **Make the link-loss path clear the same things**, and check it for omissions: a
   clearing routine written for the sheet case and a second written for the disconnect
   case drift apart. Prefer calling the first from the second.
7. **Restore scrolling for the sheet while it is open, and driving's touch policy when it
   closes**, because the browser intersects policies up the tree and a sheet under a root
   that blocks panning cannot be scrolled.

## Decision rules

- **When a thumb is still down after the routine ran, it must not re-engage on the next
  move.** The slot is empty and the first contact for that control is already past; the
  player lifts and presses again. A held-over thumb silently resuming is the failure this
  technique exists to prevent.
- **When the neutral value is not zero, say what it is.** Brake neutral is off and throttle
  neutral is off; a layout whose neutral is a held state has not defined neutral.
- **When one routine is not used by every path, list the paths and the differences.** The
  one that clears fewer values than the others is the stale-control bug waiting.
- **When the sheet can be scrolled, its close control must stay reachable on the shortest
  landscape screen.** A neutralised controller behind an unreachable close button is a
  dead end.
- **When the player returns from a sheet, make driving require a new press.** A status
  line that says to hold go again is the honest message after a clear.

## Evidence status

An emulated client can hold every control, trigger each event on the list one at a time,
and check that the next emitted state is neutral and that a later lift changes nothing.
That is a real check, and it covers the list as written. It does not discover events that
are missing from the list; those are found by a person using the game, and every report
that states the list also states that it was authored, not derived.

## When not to use this

- **Surfaces that deliberately keep a hold across the change**, such as a pause overlay
  where the game itself is frozen and the player expects to resume exactly. Then clear on
  resume, not on open, and keep the frozen state's own rule.
- **Cosmetic changes that touch no control**, such as a colour theme or a text size,
  where clearing would interrupt play for no reason.
- **As a replacement for the receiver's own stale-input cutoff.** The phone clears what it
  knows about; a phone that has frozen cannot, and the receiver must cut a silent
  controller by itself. The two are complements.
