---
layer: technique
type: technique
subject: video-assembly
technique: unreferenced-channels-resample
status: forged
laws: [typed-input-owns-its-channel, style-is-restated-not-remembered, edit-do-not-regenerate]
shared_with: []
use_when: [a generator emits sound along with picture and a character speaks in more than one clip, deciding what to attach to a generation call besides images, a recurring subject sounds like a different person from clip to clip while every visual check passes, minting and grading a voice sample for a sequence, a platform offers a reference input for a channel the model would otherwise invent]
---

# An unreferenced channel is re-sampled

Every rung of this subject's reference craft is about pixels — the conditioning
ladder, the frame anchors, the pinned bank, the identity and style references
held across calls — because for most of its life the generator produced pixels
and nothing else. It now produces a clip *and its sound* from one sample, and
the subject already noticed: baked-in audio is a mix decision a model made, and
the answer is to decide per clip whether to keep it, demote it or strip it.

That is the mix question. There is a prior one it does not ask.

A jointly generated channel is synthesised from the prompt on **every call**,
exactly as the picture is. The picture is held still across calls because
somebody attached a reference to it. The sound is held still by nothing,
because nobody attached one — so a recurring character's voice is drawn fresh
per request. Three clips of one man, every visual instrument green (the sheet
held, the plate matched, the ruler says the face is the face), and three
different men speaking. The defect is invisible to the whole acceptance
apparatus this subject owns, for the plain reason that all of it looks at the
picture.

> **A channel the model synthesises and nothing conditions is re-sampled on
> every call. Pin each synthesised channel with a reference of its own, or
> accept that it drifts — and know which of the two you chose.**

This is [typed-input-owns-its-channel](../../../_laws.md#typed-input-owns-its-channel)
read from the other end. That law governs what happens once a typed input
exists: the prose stops describing the dimension and directs within it. The
prior question is whether the channel has an input at all, and a channel with
neither a typed input nor a reference is not *under-directed* — it is
undirected, and more prose cannot reach it. "A low gravelly older man's voice"
names a class; identity is an instance, and no adjective closes that gap. The
symptom reads as a weak prompt and invites exactly the wrong fix, which is the
law's own warning arriving one level earlier.

## What a reference pins, and what it does not

Measured on a local joint video-and-audio generator: one character, one line,
one shot, two noise seeds, every other input held identical.

- **Unreferenced, the channel re-samples wholesale.** Two takes of the same
  line came back a register apart — 125 Hz against 92 Hz, some four tenths of
  an octave — while the long-term spectrum barely moved. Same brief, same
  shot, same words, different man.
- **A description in the prose does not pin it.** Both of those takes were
  briefed *"in a low gravelly older man's voice"*. The adjectives were
  honoured and the identity still moved. That is the class-versus-instance gap
  above, arriving as a number rather than an argument.
- **Attaching a reference holds it.** The same pair with a minted sample
  attached sat roughly seven times tighter, and an operator asked blind which
  clip sounded like one person picked the referenced arm without being told
  what the variable was.
- **But the voice does not become the reference's voice.** Distance from the
  attached sample was the same whether or not the sample was attached: the
  referenced takes sat no closer to it than the unreferenced ones did.

That last point is the one to carry into a brief, and it is the opposite of
what the word *reference* suggests. On the stack measured, the sample works as
an anchor that is identical on every call, not as a target the model imitates
— so grading a candidate sample for *likeness* to some voice in your head is
grading the wrong property. Grade it for the register and manner the scene
needs, then stop changing it.

## The reference for a synthesised channel is minted, not found

An identity sheet is drawn, a plate is shot, a style guide exists before the
production does. A voice has no such artifact: the only recording of this
character that will ever exist is one the pipeline makes. So the reference is a
**stage**, with a place in the phase order — generate a sample, grade it,
attach it to every call from then on — and it carries every obligation of a
pinned asset. It is accepted material before it is promoted, because
[edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate) applies to a
voice precisely as it applies to a cut: re-minting it after three clips exist
has re-cast a scene that was already reviewed. Its provenance travels with the
clips it conditioned, for the same reason the anchors and the rung do.

Two properties it has that the image references do not:

- **Length is a conditioning parameter, not a convenience.** More sample is
  more of the channel for the model to copy. A two-word sample is a timbre
  hint and will not survive a sentence; budget the sample at several lines of
  the character's own script, read in the register the scene needs.
- **It is scoped like every other reference, and the scope is easy to forget**
  because a voice does not look like it carries anything else. It does: an
  unscoped sample conditions the delivery, the pace and the emotional state it
  was recorded at into every line. The role map's negative scope is the fix —
  *controls the voice, never the words, never the performance* — and it is the
  same sentence a choreography clip needs, for the same reason.

**Mint it before the first clip, or make the first clip the master on
purpose.** Taking the sample from an accepted clip is legitimate and sometimes
right; what it does is promote that clip into the position everything
downstream is derived from, with the review expense that promotion always
carries. The failure is doing it by accident — noticing the drift at clip
three, sampling clip one, and silently making the cheapest take in the
sequence the thing the whole scene is held to.

## Which channels this covers

Ask of every dimension the model emits: **does this need to be the same thing
twice?**

- **A speaker's voice**, wherever that speaker returns. Always yes.
- **Room tone and ambience**, where two clips are the same place. The drift is
  quieter than a voice's and lands as a seam the cut cannot explain.
- **Score**, where the model scores what it generates. Usually the answer is to
  strip it rather than pin it, because the cut's music is authored against
  picture — but that is a decision, and it is this one.
- **A one-off**: a single clip, an effect that occurs once, a crowd nobody
  tracks. No, and the reference is work the pipeline does not owe.

## The check the picture cannot run

Acceptance in this subject reads frames, and a channel nothing looks at is a
channel nothing gates. A jointly generated channel needs a pass of its own,
and it runs **across clips rather than within one**: take two accepted clips of
the same subject and compare the channel between them. The question is not
whether it is good — a single clip can be graded for that — but whether it is
*the same one*, which only a pair can answer. A sequence graded clip by clip
will pass every clip and fail as a scene.

What a pair can be is narrower than it looks. Two takes of *one* setup isolate
the channel, because nothing but the seed differs. Two *different beats* move
the line, the delivery and often the register along with the identity, so a
difference between them is not yet evidence of drift — which makes the
same-setup pair the one to run when the question is whether the channel is
pinned at all, and the cross-beat pair the one to run when the question is
whether the pinning survives real material.

## Decision rules

- When a recurring subject speaks in more than one generated clip, the voice
  reference is minted before the first clip, not after somebody notices.
- When a model emits a channel it was given no reference for, record that
  beside the clip as provenance. A clip whose channels are half-pinned cannot
  be re-briefed, only regenerated, which voids its review.
- When the channels arrive as one inseparable waveform, the reference is the
  only lever there is: the mix cannot be fixed downstream, and neither can the
  identity. The decision moves to the brief, where it joins the mix decision
  this subject already sends there.
- When a platform offers no reference input for a synthesised channel, that
  channel is unpinnable there. The honest routes are a single-clip scene, or
  stripping the channel and authoring it in the cut. Decide at brief time;
  after three clips exist, both routes cost the clips.

## Failure modes

- **The three-voice scene.** One character, three generations, three men. Each
  clip is fine; the scene is not a scene.
- **The late sample.** The drift is noticed at clip three, a sample is pulled
  from clip one, and the sequence is now held to a take nobody promoted.
- **The hint-sized sample.** Two words of reference, a paragraph of dialogue,
  and the voice holds for the first clause and wanders.
- **The unscoped sample.** Every line arrives at the pace and mood the sample
  was read in, including the ones that needed the opposite.
- **The clarity trade, unpriced.** A reference is more conditioning, and
  conditioning competes with whatever else the call was trying to satisfy. The
  operator who picked the referenced arm for consistency in the measurement
  above also noted that one unreferenced take had the clearer sound of the
  four. Consistency is usually worth that, but it is a trade and not a free
  win: if a single hero line has to carry, it may be the one place to drop the
  reference on purpose.
- **The green board.** Every picture check passed, so the sequence was
  accepted, and the defect is found in the edit by the first person who
  listens with their eyes shut.

## When not to use this

A single-clip piece has nothing to be consistent with. And where the cut will
strip the generated channel and author it from an offline speech pipeline
anyway, the pinning problem is real but belongs to that pipeline, where voices
are stored assets rather than per-call samples — attaching a reference here
would be conditioning a channel nobody will ship.
