---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: relative-anchor-steering
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [building the steering control of a touch controller, steering snaps or pulls when the thumb lands, deciding between an absolute pad and a drag from first contact]
---

# Relative anchor steering

The named concern: the steering value is the thumb's travel from where it first landed, not
its position in a rectangle. The first contact is straight ahead; the value grows with the
distance dragged and is clamped at full lock.

## Why not an absolute pad

An absolute pad is correct only when the thumb lands at its centre. On glass it rarely does:
the thumb comes down a little left or right, and the car turns before the player has
chosen to turn. Over a session the thumb also drifts, so the player steers a little more
every lap without noticing. A relative pad removes both: there is no first-contact snap
because first contact is zero by definition, and no drift because every new contact
re-defines zero. What it costs is the ability to point at a fixed spot and say "that is
straight", which on a surface you cannot see is a cost worth paying.

## Procedure

1. **On first contact**, record the thumb's horizontal position as the anchor. Emit zero.
   If the layout also reads the vertical axis, record the vertical position at the same
   moment as its own anchor.
2. **On every move of that same touch**, compute travel as the distance from the anchor and
   divide by the full-lock travel. Clamp to the range minus one to plus one. Emit it.
3. **On lift, on cancellation and on loss of claim**, return the value to zero at once and
   forget the touch. Do not ease the pad back on the glass; any easing belongs downstream,
   where it is applied once for every input source.
4. **Take the full-lock travel from the same authored place as the response shaping**, in
   physical units of the thumb's stroke, bounded by the pad width so a narrow pad on a small
   screen still reaches full lock. Dead zone, response exponent, slew and speed-dependent
   authority are applied downstream in one place
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)); the glass
   sends the normalised value and nothing else.
5. **Give feedback that shows the anchor and the thumb offset**, because the pad has no
   fixed landmark: a marker that returns to centre on lift, so the player sees what the
   game believes.

## Decision rules

- **When the thumb lands, the value is zero.** If a test lands a touch anywhere on the pad
  and the first emitted value is not zero, the pad is absolute.
- **When the game wants a smaller stroke for finer control, lower the response exponent
  downstream, not the stroke on the glass.** A shorter stroke makes the pad twitchy for the
  population with the largest thumbs; the response curve changes feel without changing
  reach.
- **When the player says the car pulls to one side, check whether the pad re-anchors per
  contact before touching a dead zone.** A pad that keeps the previous anchor across lifts
  is absolute with an extra step.
- **When two touches arrive on the pad, the first owns it and the second is ignored.** A
  second thumb on the pad is not a second steering value; it is a misplaced thumb, and the
  ownership rule says what to do with it.
- **When the layout makes the vertical axis meaningful, anchor it per contact too**, so a
  fresh touch starts at zero on both axes.

## Evidence this technique can and cannot have

A headless drive of the pad with scripted touches can prove that first contact emits zero,
that lift returns to zero and that the clamp holds. It cannot show that the stroke is
comfortable, that it is long enough for a heavy thumb or short enough for a small one, or
that a long session does not tire the muscle. Those are measured only on a physical phone
with the person who plays, and until then the stroke length is an authored number
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass) applies: report it
as unmeasured, not as adequate).

## When not to use this

- **A pad whose thumb rests on a visible fixed landmark** — a physical rim on a clip-on
  controller, or a tablet stand where the pad is large and the hand is braced. There an
  absolute mapping gains the one thing relative loses, a known straight position.
- **Layouts with a tilt or gyro steering source.** The reference is the device's attitude,
  not a contact point, and the anchor is a calibration step instead.
- **Games with no continuous steering**, where left and right are two momentary buttons.
  Anchoring a contact for a binary input is machinery with no output.
