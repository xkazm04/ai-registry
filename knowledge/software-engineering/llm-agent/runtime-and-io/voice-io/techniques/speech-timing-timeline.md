---
layer: technique
type: technique
subject: voice-io
technique: speech-timing-timeline
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [something on screen must move in time with synthesized speech, a talking face or a caption drifts away from the voice it follows, adding per-sound or per-word timings to a synthesis stream]
---

# Speech timing timeline

Synthesized speech is usually treated as an opaque stream of samples. The moment
anything has to follow it — a talking face's mouth, karaoke captions, a word
highlighted during read-aloud — the product needs a second artifact beside the
audio: a **timeline** of the sounds that were spoken, each with a start and an
end. This technique owns producing it, proving it describes the audio, and
carrying it to the consumer so the two stay aligned through playback. The rule:
**the timeline describes the audio that was actually rendered, in the audio's own
clock, and a timeline that cannot prove both is not sent.** Turning sounds into
mouth shapes, protecting closures, coarticulation and how far ahead of its sound a
face moves belong to [talking-avatar](../../../companion/talking-avatar/talking-avatar.md);
this technique stops at an honest list of timed sounds.

## Where the timings come from, in order of preference

**The synthesis model's own durations.** Many models decide how long each input
token lasts before producing a sample: a duration predictor emits a frame count
per token and the decoder expands the sequence by those counts. Frame counts times
the hop, summed, *is* the schedule the audio was built on. The host runtime often
discards these counts and returns only audio, so before reaching for anything
else, inspect the exported graph's outputs: the durations are frequently already
an output nobody reads, or reachable by cutting the duration-predicting front half
out as its own small model. Two properties make this route exact and cheap to
prove. The counts **tile** the raw output — their sum times the hop equals its
length to the sample, a structural check to run on every call. And durations
usually do not depend on the noise the decoder draws, so a durations-only pass
describes the host's own render exactly while the host's audio ships unchanged.
Re-running the whole model to get audio and durations together also works, but
then the audio is yours, and it must be shown to be the same voice within the
host's own run-to-run spread before it replaces the host's. The extra pass is a
cost per sentence; weigh it against [real-time-synthesis-budget](./real-time-synthesis-budget.md).

**Forced alignment** is the fallback where the engine keeps its durations
private. A separate aligner brings its own acoustic model and usually its own
grapheme-to-phoneme frontend, so it can disagree with the engine about *which*
sounds were said, not only when. Label its output approximate.

**Amplitude** is the floor: a consumer following the energy envelope knows that
something is sounding and nothing about what. It needs nothing from the producer
and is what every consumer falls back to when no timeline arrives.

Record which source produced a timeline; an engine-duration timeline and an
aligner timeline are claims of different accuracy, and a tuning pass that cannot
tell them apart tunes against the weaker one.

## One frontend names the sounds

Take the tokens from **the very frontend that produced the audio** — same text
normalization, same grapheme-to-phoneme pass, same symbol inventory — captured from
the run itself. A second frontend run "to get the phonemes" yields a sequence that
looks right and differs on exactly the words that matter: numbers, names,
homographs. Two producers of one symbol string drift
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Replay the host's post-processing as a time map

Hosts edit decoded audio after the model: compressing long silences, trimming
quiet ends, inserting pauses between sentences. Each edit moves the audio under the
duration grid. Replay the edit through an explicit **time map** — a monotone,
piecewise-linear function from model-output time to delivered time, built from the
same parameters the edit used — and pass every boundary through it. Better still,
switch the host's edit off and apply it yourself, so one implementation drives
both the audio and the map. Both adjectives are load-bearing: a map that snaps
every time inside a removed region to the cut point collapses all boundaries there
onto one instant, so a sound that the offset correction below pushed into a
compressed pause comes out zero-length and silently disappears. A linear segment
over the kept part of the pause scales the sounds inside it and preserves order.

## Measure the offset, then correct it

The duration grid and the audible events need not line up: the decoder's
receptive field, an upsampler's delay or a frame convention can shift every
boundary by a constant tens of milliseconds. That is invisible on a waveform plot
and plain on a face — people detect sound running ahead of picture at a few tens
of milliseconds and tolerate it running behind for roughly three times longer.

Measure it against events the audio cannot fake. On the raw model output, before
any post-processing distorts the grid, sweep a constant shift and score each by
how well acoustic landmarks fall on the boundaries: a **stop closure** on an
energy dip, a **fricative** on a rise in high-band energy. Leave nasals out of the
closure score: their lips close over a voiced murmur, so an energy dip is the wrong
test. The score peaks sharply where a visual comparison saw nothing. Run the sweep
over several sentences, report per-sentence peaks with their spread and n, and
apply the median as a constant in model-output time, *before* the time map,
pinning the first and last boundary to the audio's ends. The constant names the
sweep that recomputes it; a wide spread is a finding about the grid, not noise.

## Verify every timeline before it leaves

A failed check fails the render; it does not ship a quieter timeline
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

- **Token agreement.** The timeline's sound sequence equals the engine's token
  string, compared by code independent of the code that built the timeline. A
  dropped or zero-length sound is a defect, never rounding.
- **Coverage.** Segments run from zero to the duration with no gaps or overlaps;
  silence is a segment, not a hole.
- **End on the last sample.** The final segment ends where the audio ends, to the
  sample; a tolerance hides drift that shows at the end of every sentence.
- **Determinism where required.** If byte-identical renders are part of the
  contract, seed the decoder's noise too; the durations repeat without it.

## Carry it in the audio's clock

Send **one small timing event per sentence**, on the same ordered channel as the
audio, **before that sentence's first audio chunk**. The sentence is fully known
before its first chunk leaves, so per-chunk metadata adds frames and buys nothing.

Express times as **sample offsets in the utterance's audio stream** — the
sentence's offset plus segment times relative to it — never as seconds since the
utterance began. A playback underrun delays every later sample, and a timeline
anchored to the wall drifts by every stall. The consumer maps samples through its
own chunk schedule (which sample started playing when), holds silence while no
chunk is playing, and adds its output latency. Timings are dropped with their
utterance on barge-in.

The producer reports **the truth**, corrected for the measured offset, with no
anticipation baked in; the renderer chooses its own lead, because how far a face
moves ahead of its sound is a property of the face. And the event kind is new on an
existing channel, so **a client that does not know it must ignore it** — ship that
tolerance first or in the same release, or a timing feature becomes a voice outage.

## When there is no timeline

An engine without timings sends **no** event — not an empty one, not evenly spaced
guesses. Absence is what tells the consumer to fall back to amplitude; a fabricated
timeline renders as a confident mouth saying the wrong thing
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A timeline
that failed verification is dropped the same way, and the audio still plays.

## When not to use this

- **Nothing follows the audio.** No face, captions or highlighting, no reader.
- **Word-level highlighting only,** where the engine already emits word
  boundaries: the sweep and per-sound checks are more than the consumer needs.
- **Pre-rendered media** produced with its picture offline: align it in the
  authoring tool; the transport half exists for a live stream.
