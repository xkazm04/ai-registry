---
layer: technique
type: technique
subject: talking-avatar
technique: rig-parameter-contract
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [more than one thing will produce avatar motion, comparing two motion sources on the same renderer, a renderer shows a frozen feature that the motion source never produced]
---

# Rig parameter contract

## The concern

Avatar motion has producers — a procedural generator, a learned motion model, a
speech timeline, a hand-authored gesture, the host's calm mode — and consumers —
the renderer, a capture tool, an A/B page, a stills reviewer. Without a seam
between them every producer is written against one renderer's internals and no
two producers can be compared. The seam is a small per-frame vector with a
version, stated units, and one definition that every side derives from
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The shape

A frame carries a time and a handful of named groups:

- **head** — yaw, pitch, roll in degrees, with the sign convention written down
  (which way is positive yaw, in the image's frame, not the subject's). Sign is
  the field most often wrong when a new producer arrives: a learned model's pose
  axes follow its training data's convention, and one flipped axis makes the head
  turn away from every gesture it should face.
- **eyes** — lid closure per eye on 0 (open) to 1 (closed), gaze on -1 to 1 per
  axis.
- **brow** — raise on -1 to 1.
- **mouth** — opening on 0 to 1, and shape weights over a closed viseme set that
  sum to at most 1.

A track is frames at a stated rate. Keep it this small. Everything the renderer
can derive on its own — breathing, hair springs, a shimmer that follows the
level — stays in the renderer, because putting it in the contract makes every
producer responsible for something only one renderer draws.

## Rules

- **Absent is not zero.** A producer that does not produce a group omits it; it
  never writes zeros ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  The renderer then fills the group from a declared fallback source — usually
  procedural motion — so a learned model with no gaze channel still gets
  saccades instead of a fixed stare. Zero means "eyes centred, on purpose".
- **Absent survives every hop.** A channel a source does not model stays
  "no say" — omitted in a frame, a null in a reduced per-instant value — through
  the wire, the interpolation between frames, any mirror to another surface and
  the validator at each boundary. The usual leak is a convenience default at one
  hop: a lid value defaulted to zero (open) because the source had no lids turns
  "no say" into "eyes held open", and the face stops blinking for as long as the
  learned track plays. Interpolating between a known value and an absent one
  yields absent, not the known one.
- **Opening is authoritative; shape is advisory.** When opening and shape weights
  disagree, the opening wins and the shapes modulate width, rounding, lip press
  and teeth. Only the derivation from shapes to opening is allowed, never the
  reverse, so two producers cannot fight over the jaw.
- **Each target renderer maps every channel or says it ignores it.** A form with
  no brows has no brow target; the contract keeps the channel and the renderer's
  mapping table states that it is ignored, so nobody tunes a channel that draws
  nothing.
- **Version the vector and validate at the seam.** A frame outside its ranges is
  rejected or clamped by one validator, not tolerated differently by each
  consumer.
- **Pure draw.** The renderer exposes "set this frame" and "draw at time t" and
  owns no loop: the host's one scheduler calls it, a capture tool calls it at
  exact times, and a reviewer calls it at a pose. A rig that owns a loop cannot
  be captured deterministically and cannot be paused by the host.

## Decision rules

- **When adding a motion source,** write its output as this vector first and
  render it through the existing renderer; only then consider renderer changes.
- **When a producer needs a channel the contract lacks** (a breath the renderer
  currently owns), add an optional group with a version bump rather than a
  side channel.
- **When comparing producers,** hold the renderer, the line and the seed fixed
  and vary only the producer; that is the comparison the seam exists to enable.

## When not to use this

A neural route that generates whole frames has no parameter seam; its motion is
inside its frames. If such a route is the only one the product will ever run,
the contract is overhead — but the moment a fallback is needed, it is needed.
