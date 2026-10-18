---
layer: technique
type: technique
subject: talking-avatar
technique: per-sentence-face-sidecar
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, creation-names-reaper]
shared_with: []
use_when: [adding a face to a voice pipeline that already ships, the face needs a numeric or accelerator stack the voice process must not import, a talking face must never delay or change the voice it follows]
---

# Per-sentence face sidecar

## The concern

A talking face needs two things from the voice: a mouth timeline per sentence,
which is cheap, and learned motion per sentence, which may need a neural network,
its numeric stack and an accelerator. The voice process is usually lean on
purpose — small dependencies, fast start, shipped to every machine — and the
face is an addition that some machines will never be able to run. Putting the
face's stack inside the voice process makes every install pay for it and lets
every face fault become a voice fault. The face's heavy half belongs in a
**sidecar**: a separate process, in an environment of its own, asked once per
sentence for what it can do, and never allowed to decide what the voice sounds
like. The general rules for provisioning and degrading such a process are
[sidecar-provisioning](../../../runtime-and-io/sidecar-provisioning/sidecar-provisioning.md)
and [optional-dependency-degradation](../../../../backend-platform/resilience/optional-dependency-degradation/optional-dependency-degradation.md);
this technique is their shape for a face.

## The shape

1. **The voice process stays on its own dependencies.** It speaks to the
   sidecar over a line protocol on the sidecar's standard streams and never
   imports the sidecar's code. The sidecar's code is loaded by path into an
   interpreter the person points at, under a module name of its own, so nothing
   beside it can shadow a module of that environment.
2. **The sidecar says what it can do, first.** Its first message names its
   capabilities — mouth timeline, motion — and why one is missing. A capability
   that loads slowly (a motion model) is announced later by a second message,
   so the cheap capability is usable while the expensive one warms. The voice
   side turns this into a probe with three states — absent (not set up,
   starting), broken (with one sentence for a person saying why), ready (with
   its powers) — and a surface shows that state rather than guessing.
3. **One request per finished sentence.** When a sentence has been rendered,
   the voice sends it — its audio, the frontend's tokens, the time map of any
   post-processing — and the sidecar answers the mouth timeline at once and the
   motion when its model has run. The cheap answer never queues behind the
   expensive one: they run on separate threads in the sidecar, and motion runs
   one sentence at a time in arrival order, skipping a cancelled one.
4. **Every wait has a deadline.** The mouth timeline gets a short, bounded wait
   before its sentence plays; past it, the sentence plays without one. Motion is
   never waited for before audio; after the line's last audio, it may wait no
   longer than the line still takes to be heard, under a ceiling, because a
   track that arrives after its sentence was heard is useless. Writes to the
   sidecar go through their own thread, so a sidecar that stops reading cannot
   block a sentence. Consecutive misses mark it broken.
5. **Broken comes back behind a backoff.** A sidecar that dies, misses its
   deadlines or fails to start is stopped, every waiting sentence is released
   with nothing, and it is started again no sooner than a doubling backoff; a
   success resets the backoff. Its standard error is kept, bounded, so the
   broken reason can quote it.
6. **The sidecar cannot outlive its parent.** It exits when its input closes,
   and the parent closes it on stop
   ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
7. **The protocol owns the real streams.** Libraries inside the sidecar print;
   anything that is not a protocol line goes to standard error at the
   descriptor level, so a library's chatter cannot corrupt a line. On platforms
   where a blocked read on a pipe holds that pipe for every other caller, move
   the protocol's input off the standard handle so a library asking "is this a
   terminal?" during load does not wait on the next sentence.

## The voice is byte-identical without it

The rule that makes the sidecar safe: **with no sidecar, or a broken one, the
voice runs the same process with the same arguments and plays the same bytes as
it did before the face existed** — and with the sidecar ready, the samples
played are still the samples the synthesizer would have played. When the face
needs something the synthesizer's own post-processing destroys (a silence cut
that moves every boundary), switch that edit off for the face path and replay it
in the voice process, sample for sample, so one implementation produces both the
audio and the time map. Then prove it: a test that renders the same line with
and without the sidecar and compares bytes, and a test that the replayed edit
equals the synthesizer's on random input. The audio is decided before the
sidecar is asked anything; whatever the sidecar does afterwards — answers, is
slow, dies — cannot change it.

## What the face does without it

No sidecar means no timeline and no motion events, not empty ones
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
face falls back on what it always has: the playback level drives the mouth
(which suits a seam or a hinge well) and procedural motion drives the head,
eyes and idle. A timeline that fails its checks — wrong order, does not end on
the sentence's last sample — is dropped the same way and the sentence still
plays ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- **When the face's stack would add install weight or an accelerator to every
  machine,** put it in a sidecar; when it is pure arithmetic over data the voice
  already has, keep it in-process.
- **When choosing the wait on the mouth timeline,** size it from the timeline's
  warm cost, not from the motion's; only the first sentence of a line has no
  playing sentence to hide the wait behind.
- **When a request arrives for a line that was interrupted,** cancel its queued
  sentences in the sidecar; work for audio nobody will hear is the cost a
  barge-in should not pay.
- **When the sidecar is set up but not yet ready,** the voice speaks without a
  face rather than waiting for it; the first start of a model can take tens of
  seconds.

## When not to use this

When the face is driven only by the playback level and procedural motion, there
is nothing to put in a sidecar. When the whole product already runs the model's
stack in-process for other reasons, a sidecar adds a protocol for no isolation
gain — but keep the deadlines and the byte-identity test.
