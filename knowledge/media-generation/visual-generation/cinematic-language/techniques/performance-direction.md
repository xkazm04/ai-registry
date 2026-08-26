---
layer: technique
type: technique
subject: cinematic-language
technique: performance-direction
status: forged
laws: [causality-over-sequence, unmeasured-is-not-pass]
shared_with: []
use_when:
  - a character must act, dance, fight, or gesture in a generated shot
  - generated performance comes back as vague flailing or inert standing
  - a beat's meaning depends on what the performer does, not where the camera is
  - writing action clauses for a model that renders motion over seconds
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
are executed on. The camera discriminator of this subject's movement grammar
applies here unchanged — when a channel is held by a typed input, the prose
stops fighting it and directs *within* it.

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

## Failure modes

- **The category verb** — "he dances", rendered as the training mean;
  generic motion nobody directed.
- **Beat starvation** — two beats briefed for a long clip; the model
  invents filler and the filler is the mean again.
- **The unanchored gesture** — motion specified in free space drifts;
  nothing in the frame confirms or corrects it.
- **Register as choreography** — "energetic, fun, loose" doing the work of
  beats; adjectives colour motion, they do not produce it.
