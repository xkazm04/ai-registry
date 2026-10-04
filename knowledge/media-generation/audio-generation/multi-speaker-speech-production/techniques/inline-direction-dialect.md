---
layer: technique
type: technique
subject: multi-speaker-speech-production
technique: inline-direction-dialect
status: forged
laws: [style-is-restated-not-remembered, unmeasured-is-not-pass]
shared_with: []
use_when: [direction is written into script text as bracketed tags, an engine upgrade makes tags read aloud or ignored, a pause or delivery markup stopped working, keeping one script usable across two engine generations]
---

# Inline direction dialect

Many speech engines take direction inside the text: a bracketed word for a
delivery ("whispering", "laughing"), a bracketed sound, a pause marker. This
markup looks like a shared standard and is not. It is **the engine's private
dialect**, defined by that engine generation and changeable without notice. An
unknown tag is either spoken aloud as words or silently dropped; neither
produces an error. A form that worked on one generation may be explicitly
disabled on the next: for one current engine family the vendor's documents say
its pause tag and its markup-language support are not available on the newest
generation, while the previous generation still honors the pause tag. The same
tag can therefore be a working control, a spoken word or a no-op depending on
which generation renders it.

## Boundaries

The way direction is *written* for a human-sounding read is the craft of the
spoken-delivery-direction technique in the creator-voice subject: pacing,
emphasis, breath, what to ask of a performance. The speech-ready-text technique
in the voice-I/O subject owns the portable controls (punctuation and sentence
shape) and the stateless conversion of display text to speakable text. This
technique owns one thing neither does: **what happens to the direction when the
engine changes**, and the design that makes that survivable.

## Keep the script neutral, compile at render

1. **The script stores neutral direction.** A small vocabulary the production
   defines and owns: delivery intents (`soft`, `urgent`, `amused`), non-speech
   events (`laugh`, `sigh`), and pause intents (`beat`, `long-pause`), attached to
   a line or a span by the script's own syntax. These are meanings, not engine
   strings.
2. **A compiler per engine generation** maps each neutral term to the engine's
   dialect, or to a degraded form, or to nothing, and records which it chose.
   Degradation order for an intent the engine lacks: another tag it does
   support, then punctuation and sentence shape (a comma, an ellipsis, a short
   sentence), then drop and log. Never pass an unmapped tag through, because an
   unknown tag is the one that gets read aloud.
3. **Pin the compiled output per generation.** The compiled text, not the
   neutral script, is what determined the audio, so it is part of the render key
   in the line-addressed technique. An engine change recompiles; recompiled
   lines whose compiled text differs are stale and re-rendered, and the diff
   between compilations is the review list of what the engine change does to
   direction.
4. **Restate direction in every call** rather than trusting the engine to carry
   a delivery from the previous line
   ([style-is-restated-not-remembered](../../../_laws.md#style-is-restated-not-remembered)).
   A tag on line three does not persist to line four unless the engine's
   documentation says so and the ear confirms it.

## Vendor tag-following is a claim

Vendors state that newer generations follow tags more reliably, and that tags
work best when the delivery exists in the voice's training data. Both are
unmeasured on the production's voice and language. Treat "the tag is followed"
as a claim to verify:

- For each neutral term in use, render a small set of lines with and without it,
  and put the pairs on a listening board with the direction hidden from the
  listener; if the listener cannot tell which carries the tag, the term is not
  doing anything and is unmeasured, not passed
  ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).
- Test the negative too: a term that is spoken aloud fails the round-trip
  intelligibility check of the acceptance subject as inserted words, which
  gives a cheap automatic detector for read-aloud tags.
- Record which terms passed, on which generation, per voice. A tag that works
  for one voice may not for another; the production's compile table is per
  (generation, voice class).

## Decision rules

- The engine documents a tag and the listener pairs confirm it: keep it in the
  compile table for that generation.
- The engine documents the tag and the ear does not confirm it: map the
  neutral term to punctuation and log it as unconfirmed.
- The engine generation disables a form: the compiler maps the neutral term
  elsewhere; the script is unchanged. A script with the dialect written into its
  sentences must be edited at every engine change; that is the failure this
  design removes.
- Two generations are live in one production: compile twice and keep both
  outputs; a line's render key names the compilation.

## When not to use it

An engine that takes direction as a separate parameter (an instruction string,
a style field) rather than inline still benefits from the neutral vocabulary but
has no dialect inside the text to compile. A single short read on one engine
that will not change needs no neutral layer; write the tag and listen to it.
