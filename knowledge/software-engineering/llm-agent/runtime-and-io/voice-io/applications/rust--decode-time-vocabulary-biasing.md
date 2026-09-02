---
layer: application
type: application
subject: voice-io
technique: decode-time-vocabulary-biasing
stack: rust
status: forged
applied: experiment
ab_verdict: not-better
proof: ab-paired
verified_on: 2026-09-02
verified_against: rust@1.97.1
---

# Prompt-biasing the hands-free decision grammar — measured, and declined

The tree has the shape this technique is about. The spoken-decision layer
(`src/features/plugins/companion/decision/parseSpokenDecision.ts`) holds a
closed grammar — the digits, their number words, and "explain" — and matches
the engine's final transcript against it *after* decoding, normalizing case
and a trailing period. The engine invocation
(`src-tauri/src/companion/stt/whisper.rs`, the `transcribe` command line)
passes a model, the file, no-timestamps, no-prints and an optional language
hint, and nothing else: the grammar the parser will match against is never
handed to the engine, although the engine's command line accepts an initial
prompt. That is the seam, and the question was whether the product is better
off using it.

## The paired comparison

Same five captures, same engine binary the product installs, the mid-sized
English model from the product's own catalog, the product's exact flags.
Arm A is the tree as it stands. Arm B adds the grammar as an initial prompt
("zero one two three four five six seven eight nine explain").

| Capture | A (as shipped) | B (grammar as prompt) |
| --- | --- | --- |
| 0.5 s near-silent tap | blank-audio marker | `you` |
| 2.0 s near-silent hold | blank-audio marker | `you` |
| spoken "one" (synthesized) | `1` | `one` |
| spoken "three" (synthesized) | `3.` | `three` |
| spoken "wonderful" (decoy) | `Wonderful.` | `wonderful` |

Read against the parser: 3/3 spoken captures resolve to the same decision in
both arms (the parser already accepts a numeral and a number word, and strips
the period), the decoy is a non-match in both, and 2/2 silent captures that
are a typed no-speech outcome in A become a dictated word in B. n=5, two arms,
one instrument.

## Verdict: not-better, and the condition is the technique's own

Biasing moved the *form* of every spoken result and the *decision* of none.
The grammar is the case the technique names as pure downside: eleven short,
phonetically distinct words the engine already recognizes, behind a matcher
that normalizes both forms. There is no confusion to rescue, so the bias has
no measurable to move, and it costs the silence gate — with a prompt in
place, an accidental tap on the hold-to-talk control would arrive at the
parser as `you`, a non-match that fires a chat turn the user never spoke.

The return condition is specific: the day the spoken grammar carries entity
names — a persona's name, a workspace, a record title, the words no model's
training data contains — measure the miss rate on those names first, and
only then re-run this comparison with the level gate already in place.

## What the tree confirms structurally

- **The level gate does not exist yet, on either side.** The capture hook
  records raw PCM and encodes a WAV; nothing reads a level before the
  engine runs, and the earlier application against this tree already
  recorded that the only live metering is on playback. So the precondition
  for any prompted biasing — silence check, then prompt, then decode — is
  unbuilt, which is a second reason the answer today is no.
- **The engine's no-speech verdict was arriving as text.** Arm A shows it:
  silence returns a bracketed blank-audio marker with a success exit, and
  the adapter's empty-transcript guard, written to surface "didn't catch
  that", compared string length and never fired. That half was shipped as a
  code change under [stt-pipeline](./rust--stt-pipeline.md), not here — it
  is the transcript-boundary rule, and it holds whether or not biasing is
  ever turned on.
- **The parser and the bias would read one source.** The pending decision's
  option count is the only input the parser takes, so a turn-scoped bias
  list would be derived from the same object — the technique's "one source
  of truth for what can be said here" is free in this tree, which is why
  the negative verdict is about *value*, not about feasibility.

## What this realization cannot do

It measures with synthesized speech, not a human voice in a room, so it
cannot say how the engine behaves on an accented "three" — the case where
biasing might earn its place. It ran the engine at the product's flags but
outside the product, so it does not prove the product's own path would
surface the outcome correctly. And it says nothing about the score-boost
mechanism, because the engine the product ships has none.
