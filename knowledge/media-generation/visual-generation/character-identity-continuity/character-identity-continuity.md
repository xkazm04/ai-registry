---
layer: golden-path
type: golden-path
subject: character-identity-continuity
status: forged
use_when: [generating many shots that must show the same person, deciding how to condition a recurring character across a sequence, choosing what a character reference image may show, choosing an instrument to measure whether a character held, diagnosing why a batch reads as two different actors, designing the experiment that tests a continuity technique]
techniques:
  - identity-ruler-calibration
  - reference-admitted-late
  - reference-shows-only-invariants
  - camera-position-not-focal-length
---

# Character identity continuity

Style locking asks whether a batch looks like one publication. This subject
asks a different question about the same batch: **is that the same person?**
The two fail independently, and the second is the harder one. A sequence can
be perfectly on-style — one palette, one technique, one finish — and still
show two different actors wearing the same jacket in the same room. Viewers
forgive a great deal about a look and forgive nothing about a face.

The asymmetry that organizes everything here: **style survives on words and
identity does not.** A palette can be named, a rendering idiom can be named,
a finish can be named — and a text block carrying those names holds them
across a batch. A face cannot be named. No length of prose about a scar and
an eye colour reconstructs the same person twice, because the attributes
language can pin down are not the attributes recognition runs on. Identity
therefore has to be carried by an image of the character, and the whole craft
is in *how* that image is carried.

## Distance is the variable, not consistency

"Is the character consistent" is not one question, and answering it as one is
how techniques get adopted at the wrong distance. There are three, and a
technique that solves one may be useless at the next:

- **Within a continuous take.** The face at the start and the face at the end
  of a single generated shot. Real film's own answer to this is very tight,
  and it is the floor a generated shot should be held to.
- **Across a cut.** Two shots of the same character from camera positions that
  cannot see each other. This is the trailer question, and it is where
  prompt-only discipline stops working.
- **Across a whole sequence.** Twenty or thirty shots. Drift here is
  *cumulative* and it is invisible to the review that checks neighbours,
  because neighbours always match — the long-horizon failure and the
  reference-bank policy that answers it belong to generated-shot-sourcing,
  which owns them; this subject stops at the cut and hands over.

A technique that holds a take and dies at a cut is not a failed technique; it
is a technique with a stated range. Naming the range is the deliverable.

## Conditioning at full strength does not condition — it replaces

The reference channel has a failure mode that reads as success on every
metric pointed at it. Hand a generation a character reference with no limit on
its authority and the output does not *incorporate* the reference: it
**reproduces** it. The requested camera move is discarded, the requested
staging is discarded, and what comes back is the reference image again with a
few pixels moved.

This scores beautifully. Identity distance approaches zero, because the two
images are the same image. A pipeline measuring only identity will report the
strongest consistency it has ever seen at the exact moment it has stopped
making shots — which is the slideshow, the failure the whole enterprise exists
to avoid.

Two consequences that are easy to state and routinely missed:

- **A second axis is mandatory.** Alongside identity, measure whether the two
  outputs are *different pictures at all*. Near-zero difference between shots
  that were briefed as different setups is a collapse alarm, not a triumph.
- **The fix is timing, not strength.** Composition is settled early in
  generation and identity late. A reference admitted from the first moment
  competes with the brief for the frame and wins; a reference admitted once
  the frame is already staged asserts the face into a shot the brief chose.
  This is what reference-admitted-late holds, and it has an operating window
  with a real cost on both sides.

In motion the same failure relocates rather than disappearing: a
reference-conditioned clip tends to *open* on the reference and escape to its
briefed shot part-way through. The head of every clip is then the same
picture, which is a slideshow at clip scale. Trimming clip heads is the cheap
mitigation; timing the reference is the real one.

## The reference asserts more than the face

Timing returns control of the frame. It does not return control of the
performer, because a reference image is a photograph of a face *doing
something* — with an expression, an eyeline, a head angle and a light on it —
and the conditioning channel carries all of that alongside the identity it was
supplied for. Whatever state the reference happens to show becomes the batch's
constant.

What follows is the failure the two axes above cannot see. The camera obeys,
the staging obeys, the frames are genuinely different pictures — and the same
face wears the same expression through beats briefed as grief, fury and
relief. The identity instrument scores it at its best, because a recognition
embedding is built to be invariant to expression; the difference instrument is
satisfied, because the pictures really do differ; and every shot passes on its
own. A sequence with one performance in it is a continuity failure that no
continuity measurement in this subject reports.

The rule is the prose rule applied to a channel that cannot be edited with
words: **the reference may show only what should never vary, and a state that
must vary needs a reference of its own.** An image cannot be scrubbed, only
composed — reference-shows-only-invariants holds what to compose it out of,
and what the trade costs at each end.

## Consistency is measured against real material, or it is not measured

Per [unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass), an
eyeball verdict on a flattering sample ratifies drift one frame at a time. But
identity carries a second trap on top of the general one, and it is the most
expensive lesson in this subject: **the obvious instrument is inverted.**

A general-purpose image embedding — the same family that separates *style*
well, and is correctly recommended for that — reads costume, palette and
framing loudly and identity quietly. Pointed at the identity question it can
score two different actors in matching costume as *closer together* than one
actor photographed from two angles. Every number it produces about a
generated batch then means the reverse of what it claims, and nothing in the
output looks wrong.

The defence is not a better embedding chosen on faith. It is an instrument
calibrated on **real reference material with known answers** before it is
allowed to judge generated work: a same-person rung, a same-person-across-a-cut
rung, and a different-people-who-look-alike rung. If those do not come back in
the expected order, the instrument is measuring something else and its numbers
are discarded. identity-ruler-calibration owns that procedure.

## An instrument that cannot see must say so

Identity measurement has a domain, and outside it the honest output is a
refusal, not a number. A face too small, too turned away, or too obscured
yields a confident embedding of interpolation noise — and a confident wrong
number is worse than a gap, because a gap gets investigated.

The consequence is structural, not a caveat: **wide shots are routinely
unscoreable for identity, and that is a fact about how trailers are shot
rather than a defect in the instrument.** A wide shot's identity is carried by
silhouette, costume and palette — which is exactly what the style channel
reads. Continuity across a mixed sequence is therefore a two-instrument job by
construction, each covering shots the other cannot, and per
[refusal-is-a-state](../../_laws.md#refusal-is-a-state) an unscoreable pair is
reported as unscored and never silently dropped from an average.

## Failure modes the standard exists to prevent

- **The inverted ruler** — identity scored with a general-purpose image
  embedding, reporting costume similarity as identity and getting the sign
  wrong on every comparison.
- **The uncalibrated number** — a distance published with no rung of real
  material underneath it, so nobody can say whether it is good.
- **The slideshow that scores perfectly** — a reference reproduced instead of
  incorporated, measured on identity alone and celebrated.
- **The one performance** — a batch whose camera obeys and whose face never
  changes, holding the reference's expression and eyeline through every beat
  and scoring its best identity number while it does.
- **The zoom that passed for coverage** — a consistency test whose shots vary
  only in focal length, which does not test the thing that breaks.
- **The confident tiny face** — a wide shot scored rather than refused, its
  interpolation noise averaged in with real measurements.
- **The single-distance claim** — "the character is consistent" with no
  statement of the distance it was demonstrated at, adopted at a distance it
  was never tested for.
- **Prose as the identity channel** — an ever-longer character description
  standing in for a reference image, on the assumption that enough adjectives
  reconstruct a face.

## The techniques

- [identity-ruler-calibration](./techniques/identity-ruler-calibration.md) —
  building the instrument from real material with known answers, proving it
  is not inverted before it judges anything, and defining where it must
  refuse to answer.
- [reference-admitted-late](./techniques/reference-admitted-late.md) — giving
  the brief the frame first and the reference the face afterwards; the
  operating window, and the cost at each end of it.
- [reference-shows-only-invariants](./techniques/reference-shows-only-invariants.md) —
  what a character reference may show, why a state that must vary needs a
  reference of its own, and measuring how much state a generator carries
  along with the face.
- [camera-position-not-focal-length](./techniques/camera-position-not-focal-length.md) —
  designing a continuity test whose shots actually differ, and why a fixed
  seed plus a longer lens is a test that passes without asking anything.
