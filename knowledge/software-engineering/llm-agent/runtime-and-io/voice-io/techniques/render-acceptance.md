---
layer: technique
type: technique
subject: voice-io
technique: render-acceptance
status: forged
laws: [failure-not-empty-success, derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [a synthesis call returns successfully and the audio is garbage, speech is followed by a long gap and then noise, deciding whether to retry a bad render and with what seed, nobody is listening to catch a bad render before it ships]
---

# Render acceptance

The output pipeline's terminal set is `completed | interrupted | failed`, and
`failed` means the pipeline broke — the engine errored, the process died, the
request timed out. There is no state for the case that actually reaches
listeners: **the engine returned successfully and the audio is wrong.**

A generative synthesis model can miss its stop condition. What comes back is a
correctly formatted buffer of the declared sample rate and a plausible
duration, containing the requested sentence, then several seconds of internal
silence, then speech nobody wrote or codec noise nobody wants. Every check the
pipeline makes passes: the call returned, no exception was raised, the buffer
is non-empty, the duration is positive. The utterance is marked `completed` and
played.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
**inverted**, and that sentence is the reusable part of this technique. The law
warns that a run which could not happen must not be spelled like a run that
found nothing — failure disguised as empty success. Here the disguise runs the
other way: a *successful* return is the disguise, and the failure is inside the
artifact the success handed back. Asserting the instrument is not enough when
the instrument reports fine and lies in its payload; the payload itself has to
be asserted before it is accepted.

## Verify the artifact, not the call

Add a stage between synthesis and acceptance: the rendered audio is examined
for the signature of the known degenerate mode, and only audio that passes is
allowed to reach the queue, the cache, or the file.

Two properties make this affordable rather than aspirational:

- It is **cheap and synchronous** — a frame-wise pass over a buffer already in
  memory, tens of lines, no model and no dependency the synthesis path does not
  already carry. It costs a fraction of the render it is checking.
- It is a **detector for one named mode**, not a quality judgement. It does not
  ask whether the speech is good, whether the prosody is right, or whether the
  voice matches. It asks one question with a defensible answer, which is why it
  can be automatic.

It runs on **every** render, without a flag. A verification stage that must be
switched on protects the examples and not the installations
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); if the cost
is genuinely too high for some path, that path's exemption is a logged,
deliberate, visible choice, not a config default nobody set.

## The signature is a shape, not a threshold

The naive detector measures total silence, or the ratio of silence to speech,
and it is wrong in both directions: a short utterance is mostly silence at the
edges, and a runaway render can be dense with noise rather than quiet.

The signature that actually separates the degenerate mode from good audio is
**bounded internal silence** — a silent span long enough to be unnatural,
enclosed on *both* sides by non-silent audio. Frame the buffer into short
windows, classify each as speech or silence by an energy floor, and look for
the ordered triple: speech, then a silent run past the bound, then speech
again.

The enclosure is what makes the detector safe:

- **Leading silence does not count.** It is a device warming up or a model
  starting slowly, and it is trimmed elsewhere.
- **Trailing silence does not count.** It is the ordinary tail of a render, and
  a detector that counted it would fail almost every clip.
- Only a gap with speech on both sides is evidence that the model produced
  something, stopped, and then started again — which is the failure being
  hunted.

The detector's parameters — frame length, the energy floor that separates
speech from silence, the internal-silence bound — are **claims about a
particular engine, a particular sample rate, and a particular content mix, and
every one of them needs measurement before it is trusted**. They are not
constants to copy from another product. Publish them as tunable inputs with
stated defaults rather than as literals buried in the check, because the first
thing a new engine or a new language will do is move them.

## The false positive is legitimate, and it is expensive

Say the cost plainly: **the detector's false-positive case is a long pause that
was supposed to be there.** A dramatic reading, a dictated list with real beats
between items, a narration written with a rest in it — these produce the exact
shape the detector hunts, and a false positive does not degrade the output, it
*fails* the generation. The listener loses a render that was fine.

That asymmetry decides how the bound is set: it is tuned against the
**legitimate** signal, not against the failure. Collect the longest internal
pause the product's real content actually contains, and put the bound above it
with margin — not below the shortest runaway gap observed once. A detector
tuned from the failure side will be tight, will feel effective in testing, and
will start rejecting the product's best-written scripts.

Two corollaries:

- **Content that is legitimately pause-heavy declares itself.** Where the
  product knows an utterance is a dramatic read or a paced list, that is a
  parameter on the request, not a discovery for the detector to make from
  audio.
- **A detection is worth a log line naming the measurement.** Where the gap was
  and how long it ran is what makes the threshold tunable in the field instead
  of tunable in a developer's imagination.

## Retry is bounded, and the seed is derived

A detection is not a failure yet. The mode is usually triggered by a chunk of
text long enough for the model to lose its place, so the productive response is
to render the same text as smaller pieces and try again:

- **Halve and recurse**, with a **hard depth bound** and a **floor on text
  length**. Past either, stop and fail the utterance honestly. Unbounded retry
  on a model that is going to fail this text every time converts a bad render
  into a hung request, which is worse: at least a bad render ends.
- **Ship nothing on exhaustion.** When the bound is reached, the utterance
  fails and the text remains visibly available, exactly as any other synthesis
  failure degrades. Shipping the noise because a retry budget ran out is the
  one outcome the whole stage exists to prevent.

The retry's seed is the part that is easy to get wrong. Cached and reproducible
audio is a derivation of its full input tuple — text, voice, parameters, engine
version, **seed**
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation))
— and a retry that draws a *fresh random* seed destroys that: the same request
replayed later renders differently, the cache key no longer names what produced
the audio, and a reported defect cannot be reproduced from the record. So the
retry seed is **derived deterministically** from the original seed, the retry
depth, and the piece index. Every attempt is different from the last, and the
whole sequence of attempts is a pure function of the original request. The
same rule governs the per-piece seeds of an ordinary chunked render: vary them
to avoid correlated artefacts, derive them so `(text, seed)` still means one
thing.

## Where the stage sits

Between the engine adapter's return and everything downstream — before
trimming, before concatenation of pieces into one clip, before the cache write,
before the queue is told the utterance is ready. Placing it after the cache
means a bad render is stored and replayed forever from a key that says it is
good.

It belongs **inside** the adapter boundary or immediately behind it, never in
the surfaces: it is engine-shaped knowledge, its parameters are per-engine, and
its result is one of the honest outcomes the interface already publishes. The
scripted fake engine that makes the rest of this subject testable is also what
makes this stage testable — a fake that can emit the degenerate shape on demand
tests the detector, the retry ladder and the exhaustion failure without a model.

## When not to use this

- **The engine is not generative in the relevant sense.** A concatenative or
  strictly bounded synthesiser has no stop-condition to miss; the stage costs
  something and catches nothing.
- **A person auditions every render before it ships.** In a production workflow
  where a human listens before publication, the detector is a convenience, not
  a guard — its value is precisely proportional to how unattended the path is,
  which is why it becomes mandatory the moment the channel serves callers
  nobody is watching.
- **A different degenerate mode is the one you actually have.** This detector
  finds one shape. A model that trails off, repeats a syllable, or renders the
  wrong language passes it cleanly. Do not let a passing check be read as
  "the audio is good"; it means "the audio is not *that*".
