---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: pointer-capture-per-control
status: forged
laws: [structural-proof-is-never-sufficient]
shared_with: []
use_when: [two thumbs drive different controls at once, a thumb sliding off a button leaves it stuck or fires a neighbour, writing the multi-touch handling of a browser-based controller]
---

# Pointer capture per control

The named concern: every control owns at most one touch, claims it at the touch's first
contact, receives that touch's every later event wherever the thumb goes, and releases
when it ends. Ownership is independent per control, so the left thumb and the right thumb
never see each other's events.

## The mechanism

Each control keeps one slot for the identifier of the touch that owns it, empty when idle.
On first contact, if the slot is empty, the control stores the identifier, asks the platform
to route all of that touch's later events to this control, and marks itself held. If the
slot is full, the new touch is ignored by this control. On lift, on cancellation and on the
platform reporting that the claim was lost, the control checks that the event's identifier
equals the stored one, and only then clears the slot and the held state. An event with any
other identifier is somebody else's and changes nothing.

Capture is what makes the ownership real. Without it the events follow the element under
the finger, so a thumb drifting off a pedal ends the hold silently, and a thumb crossing a
neighbour presses it. With it, the drifting thumb keeps holding the pedal and the
neighbour never sees the touch.

## Procedure

1. **One slot per control**, never a shared "current touch" variable. Two controls sharing a
   slot is one thumb's worth of ownership for two thumbs.
2. **Claim on first contact only**, and cancel the browser's default handling of that
   contact in the same breath.
3. **Release on three events, not one**: lift, cancellation, and loss of capture. The third
   is the safety net for every way the claim can disappear that the first two do not report.
4. **Compare identifiers on release.** A release for a touch the control does not own must
   do nothing, or a second thumb lifting will drop the first thumb's hold.
5. **Make momentary actions, such as a swap, fire on first contact of their own target
   only.** A tap target needs no slot: a touch that began elsewhere never produces a first
   contact on it, so dragging across it cannot trigger it. Keep that property deliberately
   and test it.
6. **Declare the driving surface as unscrollable** for the controls' own region, so the
   browser does not claim the touch for a pan or zoom a few frames later and cancel the hold
   in the middle of a corner.

## Decision rules

- **When a drag onto a neighbour must never activate it, the neighbour acts on first
  contact, not on entry.** An entry event exists only if the system tracks the finger by
  position; capture removes it, and a layout design that relies on entry has re-created the
  phantom input.
- **When a hold stays on after the finger has gone, suspect a missing release event before
  suspecting the logic.** The usual cause is a release wired only to lift.
- **When the browser takes the touch, treat it as a lift.** A cancellation without a
  matching clear is a stuck control.
- **When a control that is held is hidden by a layout change, its slot is cleared with the
  rest**, not left owning a touch on an element nobody can see
  ([the neutralising technique](./neutralise-on-sheet-open-or-layout-change.md)).
- **When the same behaviour is wired to several controls, the handlers share a shape, not a
  slot.** Factor the claim-and-release into one routine parametrised by the slot, so a fix
  for one control cannot miss the others.

## What simulation proves, and what it does not

A scripted multi-touch client that presses two controls with two independent identifiers,
slides one off its rectangle, lifts the other, and then checks that exactly the right
values remain is a real test of this technique, and it should be run for every layout. It
proves the ownership rules. It does not prove that a sweaty thumb on a real screen produces
the events the script injected: touch panels reject, merge and reorder contacts in ways an
injector does not reproduce. State the test as an emulated-client result, never as a
felt one ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

## When not to use this

- **A control that is genuinely a region**, such as a trackpad-like aim surface where the
  finger is allowed to roam over several targets and each should react. Capture is wrong
  there, and the design should say so rather than inherit it.
- **Pages with no simultaneous touches**, a menu or a single-thumb game, where a single
  current-touch variable is simpler and nothing can conflict.
- **Hover-capable pointing devices**, where entry events are the point. This technique
  belongs to touch.
