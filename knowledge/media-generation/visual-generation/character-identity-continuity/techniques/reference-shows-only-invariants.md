---
layer: technique
type: technique
subject: character-identity-continuity
technique: reference-shows-only-invariants
status: forged
laws: [typed-input-owns-its-channel, unmeasured-is-not-pass]
shared_with: []
use_when: [choosing or minting the character reference image a batch will condition on, every shot in a batch comes back with the same expression eyeline or head angle, a beat's meaning depends on the character's expression and the output ignores it, identity holds everywhere except the shots briefed for peak emotion, deciding whether one reference image is enough for a sequence with emotional range]
---

# The reference shows only what never varies

A character reference is not a face. It is a photograph of a face *doing
something* — with an expression, an eyeline, a head angle and a key light —
and the conditioning channel carries all of it. Whatever state the reference
shows becomes the batch's constant, asserted more strongly than any sentence
that contradicts it.

## The failure the difference axis cannot see

reference-admitted-late owns the failure where the reference takes the whole
frame. This is the one that survives that fix. The camera obeys, the staging
obeys, the shots are genuinely different pictures — and the face in all of
them is still the reference's face doing the reference's thing. The same
mouth, the same eyeline, the same tilt of the head, across beats briefed as
grief, fury and relief. A sequence with one performance in it.

It passes every instrument built so far:

- **The identity axis scores it at its best.** A recognition embedding is
  trained to be invariant to expression and pose — that invariance is exactly
  why it is the right ruler — so a frozen expression is not something it can
  report. The property that makes the instrument correct makes it blind here,
  which is the second time in this subject that a property cuts both ways.
- **The difference axis is satisfied.** The frames really are different
  pictures: different camera, different background, different light in the
  room. That axis was built to catch the slideshow, and this is not one.
- **Per-shot review passes.** Every shot is a competent shot of the right
  person. The defect exists only across the set — the blind spot every drift
  failure in this corpus lives in.

## Two authorities over one channel

Per [typed-input-owns-its-channel](../../../_laws.md#typed-input-owns-its-channel),
a reference is a typed input, and it sets the state channel whether or not it
was supplied for state. The sentence that also describes the expression is the
weaker of the two authorities, and the two do not average: what comes back is
the reference's state, or a compromise that reads as under-direction and
invites more prose, which makes it worse.

The mechanism is that the conditioning signal is not pure identity. What it
carries of pose, expression and illumination is bound up with what it carries
of the face. One 2025 benchmark of identity-preserving image generators, over
435 multi-identity test cases, found that across most published methods
similarity to the reference face and copying *from* the reference rise
together along a single curve — they are not independent knobs. Take that as
the shape to expect rather than a number about your own generator: it was
measured on still-image methods, in 2025, by people not measuring your
pipeline.

The other end of the same dial is widely reported and, as far as this corpus
knows, unmeasured: practitioner comparisons through 2026 agree that a locked
character holds through neutral and lightly expressive faces and gives way at
the extremes — full laughter, grief, rage — where a frame or two comes back
looking like somebody else. Suppress the state and identity is perfect while
the performance is dead; demand a peak state and identity is what yields.
**Both ends are the medium, not a settings error**, and the technique is
about choosing where to sit rather than about escaping the trade.

## Compose the reference out of invariants only

The prompt-side rule — a block restated verbatim may contain only attributes
that never vary — belongs to image-prompt-composition, and it is enforced by
deleting words. That enforcement is unavailable here. **An image cannot be
scrubbed, only composed.** Every pixel asserts something, and any attribute
you decline to decide is decided anyway by whatever the reference happens to
show.

So decide them:

- **Expression at rest**, and at rest specifically — not pleasant, not stern.
  A reference that is slightly amused makes a batch that is slightly amused
  at a funeral.
- **A stated gaze.** "Looking slightly off camera" is a choice, and a good
  one, but it is a choice; it becomes every shot's eyeline unless something
  overrides it, and eyeline is load-bearing for anyone cutting the result.
- **A canonical head angle**, three-quarter rather than dead-on or profile,
  because it is the angle that shows the most structure and the one the
  fewest shots have to fight.
- **Even light and a plain field.** The light in the reference is the light
  the face may keep. Even light is the least-wrong thing to import when each
  shot brings its own lighting brief.
- **A field at mid tone, and "plain" is not the same decision.** Plainness is
  about *content* — nothing behind the subject competing for the channel. The
  ground's **brightness** is a second choice hiding inside the first, and the
  default everyone reaches for, a white sweep, is the wrong end of it. The
  reference does not carry only the light's direction; it carries the frame's
  tonal centre, and a subject rendered against blown white was exposed for
  white. Drop that reference into a brightly lit scene and the exposure
  compounds: the face comes back washed, the shadow structure that made it
  recognisable flattened out, and — because the batch is internally
  consistent and every shot is competently lit — nothing reads as broken. A
  mid-grey field gives the conditioning the least-committed tonal centre
  available, which is the same argument as even light, applied to the axis
  most reference sheets never decide. The tell is a character who is
  reliably a little brighter than the room they are standing in.
- **Only the wardrobe that is genuinely invariant.** A costume that changes by
  scene is state wearing an identity costume, and it belongs in a per-scene
  reference rather than in the one every shot sees.

Record what you chose alongside the reference. An unrecorded gaze direction is
a constant nobody knows is in the batch, and the next person re-mints the
reference and quietly changes it.

The near neighbour and its limit: cropping the reference to the head on a
neutral field removes the background and the body pose — the state channels a
crop can reach. It cannot reach expression, gaze, head angle, or the light on
the face, because those are inside the crop by construction. **Cropping harder
does not make a reference more neutral; it makes it more face.**

## A state that must vary needs its own reference

Where a beat's meaning *is* the state, prose does not win the argument, and
the answer is not a stronger adjective. Supply a reference that shows the
state: same subject, same framing, same scale, same light, one thing changed.
The set of them is a small closed vocabulary — the states the script actually
calls for — and not a grid of every emotion, for the same reason a style sheet
is sized rather than maximized.

Two costs, both real. Every variant is another artifact to keep on-model, and
a variant minted *from* the neutral reference inherits whatever that reference
got wrong, silently and everywhere. Mint the variants as one batch from one
sitting, the way any set of references that must agree with each other is
minted.

## Measure the coupling once per generator

How much state rides along with the face is a property of the generator's
conditioning, not of your prompt, and finding out is cheap. Hold the reference
and the camera fixed and brief the *state* to vary: three expressions, two
gaze directions, one shot lit hard from behind. Then look at what came back.

- **The briefed state appears.** The channel is loosely coupled; the neutral
  reference is still correct, and variants are an optimization rather than a
  requirement.
- **Some states appear and the extremes do not.** The common case. Plan
  variant references for the extremes and nothing else.
- **The reference's state comes back every time.** The channel is hard-coupled
  and prose will never reach it. Every state in the script is a reference, or
  it is not in the film.

Freeze the answer with the generator, the way the reference entry point is
frozen with it. It does not transfer, and per
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) an
assumption about which of the three you have is not one of the three.

In production the check is not an embedding — no identity instrument will ever
raise it. It is a vision grader asked one question the frame-annotation
vocabularies routinely lack: *what is the subject's face doing?* A schema
built from camera, lighting and composition fields describes the frame and not
the performer, and a state freeze walks straight through it. The human tells,
for anyone reviewing without a grader: an identical eyeline in two shots that
cannot share one, and a key light on the face that disagrees with the light in
the room.

## Decision rules

- When every shot returns the same expression, change the reference before the
  prompt — the prompt is not being ignored, it is being outvoted by a typed
  input on the channel that input owns.
- When a beat's meaning is a state the reference does not show, supply a
  reference that shows it; the adjective competing with an image is the
  weaker authority and adding adjectives does not change which is which.
- When identity holds everywhere except the peak-emotion shots, that is the
  dial and not a regression. Budget the extra takes and the closer review
  there, and treat a peak-emotion beat as the place identity is most likely to
  need a rescue.
- When a reference is cropped to buy back the camera, do not expect the crop
  to buy back the performance — different failure, different fix.
- When the batch comes back consistently brighter than its scenes, look at
  the reference's ground before the lighting briefs; a white field is an
  exposure instruction nobody wrote.
- When the generator changes, re-run the coupling probe before reusing the
  reference set; a new conditioning path can move a loosely coupled channel to
  hard-coupled with no other visible symptom.
- When reporting a continuity result, say what state the reference was in.
  A consistency number obtained from a neutral reference on neutral beats is
  a claim about the easy half of the range.

## When not to use it

A character whose state *is* their identity — a mask, a fixed prosthetic, a
mascot, a presenter whose whole job is one warm expression to camera — wants
the state locked, and a scrubbed reference throws away the thing that makes
them recognizable. And where the deliverable is variants of one moment rather
than a sequence of different ones, the coupling is a feature: that is the
plate case, which this subject's other techniques already exclude for the
same reason.
