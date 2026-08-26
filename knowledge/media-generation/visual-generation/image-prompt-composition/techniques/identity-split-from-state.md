---
layer: technique
type: technique
subject: image-prompt-composition
technique: identity-split-from-state
status: forged
laws: [style-is-restated-not-remembered, cost-per-usable-output]
shared_with: []
use_when:
  - a named character or product recurs across many generated frames or shots
  - a recurring subject's face, build or livery drifts between outputs that share a style
  - writing the prompt-compiler slot for a subject that has both a fixed identity and a changing mood
  - reviewing a shot-prompt generator whose per-shot descriptions were written by a model
---

# Identity split from state

## The concern

Restatement is the corpus's answer to drift: the constant half of the prompt
travels with every call, in full, with no short form. That rule has a
precondition nobody states while the constant is a *style*, because style
does not have moods. It acquires one the moment the recurring thing is a
**subject** — a character, a presenter, a product — because a subject has two
kinds of attribute and only one of them is constant:

- what the subject **is** — age, build, hair, face, the cut and colour of what
  it wears, the timbre of its voice;
- what the subject **is doing or feeling right now** — expression, gaze,
  posture, emotional state, which way it is turned.

Both describe the same entity, both belong in the same region of the prompt,
and a writer composing in prose will braid them into one sentence without
noticing: *"a woman in her twenties with dark hair, looking anxious."* That
sentence cannot be restated, because next frame she is relieved. So it gets
edited — and a block that is edited per call is not restated, it is
**rewritten**. Every rewrite is a fresh sample of the model's idea of her,
and the drift the restatement rule exists to prevent arrives anyway, through
a door the rule left open.

The technique is a purity requirement on the constant, and a place for what
it excludes:

> **A block that must be restated verbatim may contain only attributes that
> never vary. Anything that legitimately changes per output moves out of it,
> into its own adjacent sentence.**

The two halves then sit side by side in the prompt — identity, then state —
and the compiler copies the first and writes the second.

## Why the mutable clause is so easy to leave in

Three things make this the default mistake rather than a careless one.

- **It reads better.** "A tired man in a grey coat" is better prose than "A
  man in a grey coat. He looks tired." Prompt-writing instincts come from
  writing, and writing rewards the braid.
- **A model writes the shot descriptions.** Where a language model expands a
  premise into per-shot prompts, it will paraphrase the identity clause on
  every shot unless told not to — paraphrase being what such a model is for.
  The instruction has to be explicit, and phrased as an ban on rewording
  rather than a request for consistency: *copy these sentences verbatim; do
  not paraphrase, reorder, or change a single word.* One first-party
  shot-prompt writer for a multi-shot audio-video model states exactly that,
  and separately forbids expression and mood from appearing inside the
  identity sentence at all.
- **The failure is invisible per call.** Each individual frame is correct —
  it depicts a plausible person matching a plausible description. The defect
  exists only across the set, which is the same blind spot the whole
  restatement law was written around.

## Procedure

1. **Give each recurring subject a stable label.** A short opaque handle the
   prompt uses to refer to the subject in the action clause, so the action
   never has to re-describe the person in order to name them. Reserve the
   labels for entities that actually recur and actually need identity held —
   labelling scenery invites the model to treat scenery as a character.
2. **Write the identity block once, per subject, scrubbed.** Stable
   appearance only. Read it back and delete every word that could be
   different in the next frame: no expression, no mood, no gaze direction, no
   posture, no action. If the subject speaks, its voice description belongs
   here too — timbre and register are identity; what it says is not.
3. **Store it beside the style block, not inside any prompt.** Same lifetime,
   same artifact, same compiler. A subject identity carried by copy-paste
   forks exactly the way a style string forks.
4. **Emit identity, then state, in that order.** The invariant sentences
   first, verbatim; then one separate sentence for this frame's expression,
   gaze, posture. The order matters for the same reason style leads: the half
   that must survive truncation goes first.
5. **Emit identity in every frame where the subject appears**, including
   frames where it is not the focus, and including the hop into a motion
   model. A recurring subject that appears in the background of one shot and
   the foreground of the next has drifted between them if only the second
   carried the block.
6. **Diff, do not read.** The check is mechanical: extract each subject's
   identity block from every prompt in the set and compare the strings for
   exact equality. A human reading two paraphrases in sequence will judge
   them the same; the model will not.

## Decision rules

- **When a subject recurs, split its block before generating the first
  frame** — because reverse-engineering an identity from a set of drifted
  outputs is guesswork, and the drifted outputs are the ones you have.
- **When a clause in the identity block could be false in some frame, it is
  state** — move it out. This is the whole test, and it is cheap enough to
  run per clause.
- **When identity blocks are generated by a model, constrain it against
  rewording, not toward consistency** — because "keep the character
  consistent" is satisfied by a faithful paraphrase, and a faithful paraphrase
  is a fresh sample.
- **When a subject stops recurring, it does not need this** — a one-off
  figure in a single frame is described in the action clause like anything
  else; the split is overhead with nothing to be constant with.

## State that must persist gets promoted to a reference

The split files expression, posture and condition under *state* because they
change per frame. Some state does not: a character who gets soaked mid-scene
stays soaked for every subsequent shot, an outfit change holds until the next
one, damage accumulates. Persistent state sits between the two halves — it is
state by nature and identity by duration — and describing it in the action
clause fails in a characteristic way: each take re-samples the model's idea of
"soaked", so the state renders differently shot to shot, and while the model
improvises the state it lets go of the face.

The rule: **a state that must hold across more than one take is authored as
its own reference variant, before generation, not requested in text at
generation time.** Make the second sheet — same identity, new state — approve
it like any reference, and switch sheets at the transition shot. The prompt
then names which variant each shot uses instead of describing the state. Still
variants cost a fraction of a rejected clip, which is the whole economics of
the move: the cheap medium absorbs the iteration so the expensive one does not
([cost-per-usable-output](../../../_laws.md#cost-per-usable-output) is the
law under it).

## The voice is a second identity surface

Where the subject speaks, the split already puts timbre and register in the
identity block. That is the text half, and it obeys the same asymmetry as
every other channel in this corpus: text holds the nameable attributes — low,
unhurried, intimate — and loses the actual timbre, which no vocabulary pins
down. The reference half is built the way an approved render becomes a style
reference: **the first take whose voice is accepted becomes the voice's
reference asset.** Extract its audio, keep it with the subject's other
reference material, and attach it — labeled as a voice reference for that
subject, matching the labeling rule for images — to every subsequent
generation where the subject speaks. Some platforms only accept video-shaped
references; a container conversion around the same audio satisfies them. The
descriptor still travels in the identity block on every call: reference plus
restated text, both channels, the same two-channel lock the visual side runs
on.

## What this does not buy

The split makes restatement *possible*; it does not make the model able to
hold a face. Identity degrades with distance from any anchor regardless of
how faithfully the text is repeated, and text alone has never been the
strongest carrier of a face — it holds nameable attributes and loses the rest,
the same asymmetry the style channels show. Where the pipeline offers subject
conditioning on approved reference material, the split is the floor under it
and not a replacement for it: the identity block is what ports across
providers unchanged, and the reference is what carries what language cannot
pin down.
