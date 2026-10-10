---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: pad-vertical-throttle-neutral-start
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [one thumb should carry both steering and throttle, accidental acceleration from a resting thumb, designing the split layout, putting brake on the same pad as a downward drag]
---

# Pad vertical throttle with a neutral start

The named concern: in the split layout the steering pad's vertical axis is the throttle, so
one thumb steers and accelerates and the other thumb is free for weapons and brake. The
guard against the obvious hazard is that a fresh touch starts at zero throttle and the
player must drag upward to get any.

The technique has two forms. In the **split** form the pad carries steering and throttle, and brake
stays on the other thumb. In the **full** form the downward drag is brake, so one thumb carries all
three continuous quantities and the other thumb keeps only the momentary ones: fire, the secondary
weapon, the swap and the handbrake. The neutral start is the same in both forms.

## Why the hazard is real

A thumb resting on a pad is the default state of a hand holding a phone. If vertical
position within the pad is throttle in the absolute sense, then putting the thumb down in
the upper half is full throttle, and putting it down in the lower half is none, depending
on where it landed. The player accelerates by accident, or fails to accelerate because the
thumb landed low. Relative anchoring fixes both, for the same reason it fixes steering: the
contact point is zero.

## Procedure

1. **At first contact, record the vertical position as the throttle anchor** in the same
   step as the horizontal anchor ([relative anchor steering](./relative-anchor-steering.md)),
   and emit zero throttle.
2. **Throttle is the upward distance from the anchor** divided by the authored throttle
   travel, clamped from zero to one. In the split form downward movement is zero, never
   reverse. In the full form downward distance is brake, divided by its own travel. Each
   direction starts past its own small dead zone, so a fresh touch reads zero on both.
3. **Release cuts throttle to zero immediately**, together with steering and, in the full
   form, brake. There is no ramp
   on lift on the glass; a thumb lifted from a pad is a player who wants to stop driving.
   Smoothing on the way up, if any, is applied downstream, and it applies to every source.
4. **Hide or disable the separate go control**, and give its space to the other thumb's
   controls, but keep it from owning a touch.
5. **Say it on the pad**: a hint reading that dragging up gives go, in the colour that marks
   a changed rule. The gesture has no affordance of its own.
6. **In the split form, keep brake on the other thumb** and keep it overriding, so the escape
   from an accidental drag is one press and does not require the steering thumb to lift. In
   the full form the escape is lifting the steering thumb, which cuts every quantity it
   carries at once. Say so, because it is the only escape there is.

## Decision rules

- **When the first emitted throttle is not zero, the layout is wrong**, whatever its
  steering does.
- **When the player steers hard and accelerates unintentionally, the drag is leaking into
  the steering gesture.** A sideways stroke is never perfectly horizontal. Either apply a
  small dead zone on the vertical axis, or accept the leakage as the price of one-thumb
  control and write that down; do not hide it.
- **When throttle and steering together tire the thumb, say so as an observation and not as
  a verdict.** One thumb that holds two displacements is the largest ergonomic risk in the
  layout, and nobody has measured it unless it has been run on a physical phone in a long
  session ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When the pad also brakes, author the two travels separately.** There is no agreed answer
  on which direction should be shorter. A shorter brake stroke makes it quick to reach. A
  longer one makes it hard to hit by accident. The thumb's reach also differs above and below
  where it lands. Make both travels layout data, like the throttle travel, so each can be tuned.
- **When the pad also brakes, go and brake become mutually exclusive by geometry.** One axis
  cannot be above and below its anchor at once, so no rule is needed for both held together.
  The same geometry rules out braking while on the throttle. If the handling wants that
  overlap for a power slide, give it to the other thumb as an explicit hold.
- **When the pad also brakes, a sideways stroke leaks into two quantities instead of one.** A
  hard steer that sags downward now brakes, as well as an upward sag accelerating. The vertical
  dead zone guards both, and whether it is wide enough is a physical question.
- **When teaching is wanted, this is the layout that most needs it.** The upward drag is
  invisible and unlike anything the player has done to a button. Treat it as a teaching
  atom and hand it to whatever owns teaching, rather than hoping the hint is read.
- **When the throttle travel is authored, make it a layout datum**, so the owner can
  change the stroke without a code change and the telemetry can report which was used.

## Evidence status

That a fresh touch emits zero throttle, that an upward drag raises it and that release
cuts it is a result a scripted touch client can establish. Whether a real thumb leaks
sideways strokes into throttle, how far it must travel, and how tiring a sustained upward
hold is, are physical claims that have no measurement unless a person has played it. The
layout is an experiment, offered with that label. The full form is the larger version of
the same experiment. Whether a thumb can hold a graded brake while steering, and whether a
hard steer sags into it, has no measurement until a person has raced it.

## When not to use this

- **Games where throttle is automatic or binary.** There is no second quantity for the
  pad to carry.
- **Players who cannot make a graded vertical stroke while steering**, for reasons of
  motor ability. Offer a layout with an explicit go control and do not make the pad the
  only route to acceleration.
- **When fire is also on the steering thumb.** A thumb carrying steer, throttle and fire is
  past what the layout can ask; the split layout puts weapons on the other thumb for that
  reason.
