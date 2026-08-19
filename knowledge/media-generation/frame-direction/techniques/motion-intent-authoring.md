---
layer: technique
type: technique
subject: frame-direction
technique: motion-intent-authoring
status: forged
laws: [checkability-routes-the-pixel]
shared_with: []
use_when: [writing what a frame does over its duration, specifying camera or subject movement for a beat, reviewing motion notes that read as mood words]
---

# Motion intent authoring

Author each frame's motion **at composition time, as intent** — what moves,
in what direction, how far — even when nothing in the current pipeline can
render it. The reason to write it now rather than when a renderer exists is
structural: a move decided apart from the composition fights it. A plate
composed with its move in mind leaves room for the move; a move bolted on
later either cannot happen inside the composition or destroys it.

Write the motion as if it will be shot, because one day it will be — but
never write it as if it is being rendered *now*: no durations, no frame
rates, no easing vocabulary. The frame's hold comes from the gap to the next
beat, which the script already decided; restating timing in the motion is a
second, contradicting clock.

## The four rules of a well-formed move

1. **Say what moves, in what direction, how far.** "The right stack topples
   left across the lower half while the left stack holds" is direction.
   "Dynamic energetic movement" is a mood word — nobody can picture it, so
   nobody can shoot it, so it directs nothing.
2. **One move per frame.** A push in *and* a pan *and* a reveal is three
   moves; a viewer listening to a sentence resolves none of them. The move
   inherits the frame's one-function economy.
3. **Never move text.** Kickers, figures and captions belong to the vector
   layer; a motion that animates a label is asking the generated layer to
   carry glyphs — the same defect as a plate that spells a word, arrived at
   through the motion field instead of the subject field. Move the picture.
4. **Let the move carry the beat's argument.** A turn should *reverse*
   something on screen. A mechanism beat should show the mechanism turning
   over. A closing beat earns near-stillness — and near-stillness is a valid
   motion, written as such: "almost still: the horizon drifts a fraction
   right." Stillness chosen and stated is direction; a missing motion is a
   blank.

## The restatement defect

A move is not the subject again. If the motion field is the subject with a
verb bolted on — "the two stacks of discs, toppling" when the subject already
described toppling stacks — nothing has been directed: the author has
described a still twice. The test is mechanical enough to automate (a motion
that string-matches its subject is rejected), but the craft version is
sharper: the subject describes the *composition at rest*; the motion
describes *what changes* between the frame's first instant and its last. If
removing the motion loses no information, it was a restatement.

## Decision rules

- Choose the move *after* the function, *with* the composition. The function
  narrows the family (reveal → something enters or is uncovered; state-change
  → the established thing alters; texture/hold → near-stillness), and the
  composition determines what can physically move without breaking it.
- When two moves both seem needed, the frame has two functions — split the
  beat, not the motion.
- When no move seems right, write near-stillness explicitly rather than
  omitting the field. An authored stillness survives review; an empty field
  invites a downstream default nobody chose.
- Scale the move to the sentence. A viewer is listening; a move that demands
  full attention is competing with the narration it exists to serve. The
  loudest moves belong on the turns, where the argument itself is loud.

## When not to use this

Do not author motion intent for frames whose function is pure held texture
under dense narration — there, the honest motion is "still", and elaborating
it is padding. And do not let intent authoring drift into renderer
configuration: the moment motion notes mention a provider's parameter
vocabulary, seeds, or model names, they have leaked downstream and will rot
at the first model change. Intent must pass the medium test — it should still
be right if the video were animated by hand or shot on a camera.
