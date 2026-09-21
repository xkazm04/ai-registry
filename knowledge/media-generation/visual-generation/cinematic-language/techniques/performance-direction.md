---
layer: technique
type: technique
subject: cinematic-language
technique: performance-direction
status: forged
laws: [causality-over-sequence, unmeasured-is-not-pass, typed-input-owns-its-channel]
shared_with: []
use_when:
  - a character must act, dance, fight, or gesture in a generated shot
  - generated performance comes back as vague flailing or inert standing
  - a beat's meaning depends on what the performer does, not where the camera is
  - writing action clauses for a model that renders motion over seconds
  - figures that should hold still under a camera move come back moving
  - a harness's negative prompt or poster-reading judge penalises a directed near-still clip
---

# Performance direction

## The concern

The decision stack of this subject runs genre, light, camera, movement,
lens — and then hands the frame to a performer nobody directed. An
undirected model performs the way it films: at the training mean. Ask for
"he dances" and the model samples the average of every dance it has seen —
loose, generic, unmotivated flailing that reads as no choreography because
it is the mean of all of them. The category verb is not a direction; it is
a request for the model's prior. The same is true of "fights", "panics",
"celebrates", and every other verb that names a class of motion rather
than a motion.

The rule is the countability doctrine of prompt craft extended into time:
**a performance is specified as an enumerated sequence of concrete,
observable beats, not as a category verb.** "Two head nods, one shoulder
roll at a time, a knee dip, a finger snap, a quarter spin at the door" can
be executed and can be checked against the output; "dances to the door"
can do neither, and a direction that cannot fail cannot succeed.

## Procedure

1. **Decompose the action into beats a viewer could count.** Each beat one
   observable motion, in order. Three to six beats fill a short clip;
   matching the beat count to the clip's duration is part of the brief,
   because a model given two beats for ten seconds invents the other eight.
2. **One action per cut.** The in-clip analogue of one-move-per-shot: when
   a clip contains internal cuts, each cut gets its own beat or two, named
   per cut, never a single verb stretched across all of them.
3. **Anchor beats to named things in the frame.** "Packs the sneakers into
   the bag, zips it, taps the ear cup" — beats that touch props and
   set pieces hold better than free-space gestures, because the object
   gives the motion a target and the take a checkpoint.
4. **Carry the quality words separately from the beats.** "Keep it loose,
   keep it fun" rides alongside the enumeration as register, the way a
   speed adverb rides a camera move — it colours the beats; it never
   replaces them.
5. **State what the performer does *not* do.** A performer left unbounded
   between beats improvises; "he stays under the tree", "the backpack
   stays on both shoulders in every cut" close the degrees of freedom the
   beats leave open.

## When the beat grid is an input

Where a generator accepts an audio track as a typed input, timing moves out
of the prose: attach the actual music and direct the performance against it
("each move lands on the beat"), and the track becomes the clock the beats
are executed on. The same holds for the growing set of performance dials —
per-character emotion selectors with intensity, where the platform offers
them: the dial holds the emotional register, the beats hold the actions, and
the prose does not re-describe the feeling the dial already set. This is
[a-typed-input-owns-its-channel](../../../_laws.md#typed-input-owns-its-channel),
the same law the camera grammar obeys: when a channel is held by a typed
input, the prose stops fighting it and directs *within* it.

## The zero-beat performance

The procedure assumes the performer has something to do. A large class of
shots asks the opposite: figures that are set dressing — a crowd in a painted
establishing frame, sentries on a wall, the statue that is a statue — under a
camera that does the only move. Left unsaid, that is beat starvation at its
limit. Zero beats over five seconds is five seconds of the prior, and what
the prior does with a recognisable figure is animate it: a still with people
in it, handed to a motion model with a camera-only brief, comes back with the
people moving, awkwardly and unasked, while the camera obeys. One
practitioner animating painted storybook frames got the empty establishing
shot right on the first roll and re-rolled every populated frame several
times under "statue-like", "posed figures", "no motion" before the figures
held.

So stillness is a performance, and it is briefed like one: **name the
figures, say they do not move, and say what the only move is** — "the
figures are posed and hold; the camera pushes in slowly; nothing else moves."
Rule 5's "state what the performer does not do" is the whole direction here,
not the tail of it. The register words still ride alongside (a painted
world's figures hold *because* it is painted; say so). And the take is chosen
by the least figure motion, not the best camera — the camera was never at
risk.

The harness side gets this wrong in two places, and both are one mistake.
**An anti-freeze negative is written against a failure and cannot tell it
from a direction.** "Static frame, frozen image, no motion" in a global
negative exists because a motion model sometimes returns a dead clip; applied
to every request it also argues against the shot whose contract is
stillness. Put it where the failure lives — the camera channel, or per shot —
never on the frame as a whole. And **a judge that reads three posters cannot
see a directed near-still**, because mist drifting a fraction and a window
flickering once are below what three frames show; it will call the clip
frozen and score it down for obeying. One harness did exactly that to a clip
briefed "almost still — the camera does not move": the judge's stated reason
was "the same frozen wide with nothing advancing", and a frame-difference
measurement put the clip two orders of magnitude above a frozen render's
floor (mean consecutive-frame luma delta 0.21 against 0.000 for a looped
still; the advancing shot in the same cycle read 8.5). Frozen is a number.
Measure it before a poster judge is allowed to say the word — per
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass), a
stillness verdict from three stills is not a verdict.

## Decision rules

- When a verb in an action clause names a class of motion, expand it to
  beats before generating — the mean of a category is nobody's
  choreography.
- When a take's performance is wrong, re-brief with beats added or
  sharpened rather than re-rolling the same verb — the verb re-samples the
  prior; the beats move it.
- When the beat's meaning is carried by a single gesture, spend the beats
  on that gesture and let the rest of the body stay quiet — enumerating
  everything is the compound-move failure worn by the performer.
- When the figures are set dressing under a camera move, brief zero beats
  explicitly — posed, holding, the camera's move the only motion — and pick
  the take by least figure motion; the prior animates anything it
  recognises, and a global anti-freeze negative or a poster-reading judge
  will then penalise the take that obeyed.

## Failure modes

- **The category verb** — "he dances", rendered as the training mean;
  generic motion nobody directed.
- **Beat starvation** — two beats briefed for a long clip; the model
  invents filler and the filler is the mean again.
- **The unanchored gesture** — motion specified in free space drifts;
  nothing in the frame confirms or corrects it.
- **Register as choreography** — "energetic, fun, loose" doing the work of
  beats; adjectives colour motion, they do not produce it.
- **The silent hold** — figures meant to stand still and nobody said so;
  the prior performs them, and the harness's anti-freeze negative or its
  three-poster judge then scores the obedient take as a dead one.
