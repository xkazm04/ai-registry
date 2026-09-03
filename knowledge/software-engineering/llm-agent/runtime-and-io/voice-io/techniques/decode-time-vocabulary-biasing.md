---
layer: technique
type: technique
subject: voice-io
technique: decode-time-vocabulary-biasing
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary, count-carries-predicate]
shared_with: []
use_when: [the product already knows which words are likely before the user speaks and the engine keeps mis-hearing them, deciding whether to hand a known vocabulary to the engine or only match against it afterwards, a transcription engine accepts a prompt or a phrase list and silent captures started coming back with words in them, an engine reports no speech as a token in the text channel]
---

# Decode-time vocabulary biasing

The product usually knows, before the user opens their mouth, most of what
they are about to say. The choices on screen, the names in the current
record, the user's own nouns — a closed or nearly closed vocabulary that
[spoken-intent-parsing](./spoken-intent-parsing.md) matches the transcript
against once the engine has produced it. That match runs *after* decoding,
on whatever the engine chose, and it can only tolerate an engine error, never
prevent one: a fuzzy match that accepts "won" for "one" is repairing a
decision the engine already made with less information than the product had.

Between segmentation and transcription there is a stage where that vocabulary
could reach the engine instead. Most engines expose it — as a phrase list
with a boost, as a context graph, or as a text prompt the decoder reads before
the audio — and most integrations leave it unused, because the after-the-fact
match works well enough on a small grammar and nobody measured what it
costs on a large one. This technique owns the decision to bias, the choice of
mechanism, and the one gate that must land before any biasing does.

## Two mechanisms with opposite failure physics

A vocabulary reaches a decoder in one of two ways, and they are not
interchangeable, because they fail in opposite directions.

**Score-boost biasing** adds a bonus to hypotheses that contain a listed
phrase while the decoder searches. It can only *promote* text the acoustics
already produced as a candidate; it cannot introduce a word the audio did not
support. Three consequences follow. It needs a search that keeps alternatives
— a greedy decoder has nothing to promote, so an engine that biases only
under beam search is not being coy, it is stating a constraint. The bonus is
per token, so a long phrase accumulates a larger total than a short one and
the score must be tuned on held-out audio, not set once. And it is safe on
silence: with no acoustic candidates there is nothing to boost.

**Prompt biasing** hands the vocabulary to a decoder that reads text — a
prompt, a previous-transcript window, a "hotwords" string tokenized into the
decoder's context. This works on engines with no beam to boost and it biases
toward spelling and casing as well as toward words, which is why it is the
only mechanism that turns "1." into "one". But the decoder is now
conditioned on text as well as audio, and on audio that carries nothing it
will **produce the text**. A prompted decoder given a silent capture does not
return empty; it returns a word from the prompt, or a filler the prompt made
likely, with the same confidence it gives real speech. The mechanism that
can fix spelling is the mechanism that can hallucinate, and they are the same
property.

The discriminating question when choosing: *can this engine produce a token
the audio did not support?* If no, boost freely and tune the score. If yes,
the gate below is a precondition of turning biasing on, not a refinement to
add later.

## The gate lands before the bias does

Every capture reaching a prompted decoder passes a **level gate first**: a
capture whose signal never rose above the silence floor is classified as the
no-speech outcome *before* the prompt is built, and the decoder never sees
it. This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
one stage earlier than [stt-pipeline](./stt-pipeline.md) applies it — the
pipeline's metering already proves the microphone hears; the same levels,
read once more at the decode boundary, decide whether decoding is allowed to
run at all. A runtime that supports prompted decoding and skips this gate
has built a machine for inventing words whenever somebody taps the capture
control by accident.

The gate is ordered, and the order is the whole point: **silence check, then
prompt, then decode.** A silence check placed after decoding cannot work,
because by then the decoder has produced confident text over silence and
nothing downstream can tell it from a real utterance. On 2026-09-02 a
push-to-talk product was measured with a mid-sized open engine: two
near-silent captures (a half-second tap and a two-second empty hold) returned
the engine's blank-audio marker without a prompt and the word "you" with an
eleven-word prompt, both times, while three spoken words were recognized
identically in both arms. Prompting bought nothing the grammar needed and
turned every accidental tap into a dictated word.

## The engine's own no-speech verdict arrives in the text channel

The gate above is the product's check. Engines also carry their own: a
no-speech probability, a blank marker, a bracketed event token (`[BLANK_AUDIO]`,
`(silence)`, `[MUSIC]`) printed *where the transcript would be*. That verdict
is a typed outcome that has been serialized into a string, and a pipeline
that classifies empties by string length will read it as a successful
one-word transcript and insert it. The measured product above did exactly
that: its empty-transcript guard, written to surface "didn't catch that",
had never fired on silence, because silence was never empty on the wire.

Honour the engine's verdict as what it is: recognize the marker vocabulary at
the engine adapter, reduce it to the typed no-speech outcome, and let that
outcome travel ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary))
rather than be re-derived from whatever text is left. The check is on the
engine's marker shape — a lone bracketed all-caps tag, a known lowercase
event word — not on a list of every string an engine might print, and a
bracketed word in ordinary case inside a sentence is text. When both gates
exist, the level gate runs first and catches the cheap case; the marker check
catches what the level gate let through (breath, a chair, room tone above
the floor), and neither one replaces the other.

## Bias only where a confusion has been measured

Biasing is a change to what the engine will hear, so it is a measured change
or it is not made. The measurable is a pair: the recognition rate on the
biased terms, and the false-positive rate on utterances that do *not* contain
them — because a boost strong enough to rescue "one" from "won" is also
strong enough to hear "one" inside "wonderful". Run the same captures through
both arms and report both numbers with their arm counts
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

The case where biasing is pure downside is common and easy to name: **a small,
phonetically distinct grammar the engine already recognizes.** Nine digits
and an escape word, all short, all acoustically far apart, come back correct
without help; a prompt changes their *form* (a numeral becomes a word) but
not the decision they resolve to, and it costs the silence gate. When the
after-the-fact matcher already normalizes both forms, the bias has no work to
do. Biasing earns its place when the vocabulary carries **entity names** —
people, products, codes, the words an engine's training data cannot contain
— and the measured miss rate on those names is the number the bias is
allowed to move.

## Biasing is scoped to the turn, not to the session

The vocabulary that matters changes with the dialog: the visible choices this
turn, the record open right now, the entity just mentioned. So the bias is an
input to *this* decode, assembled from the same state the intent parser will
read, and it is dropped when the turn ends. A session-wide phrase list
accumulates every name the product has ever shown and biases toward all of
them at once, which reproduces at decode time the ambiguity
[spoken-intent-parsing](./spoken-intent-parsing.md) exists to remove. The
parser and the bias read one source of truth for "what can be said here" —
build it once, feed it both ways, and the two can never disagree about what
was on offer.

## What the engine abstraction carries

[engine-abstraction](./engine-abstraction.md) declares capabilities and
branches on them, and biasing is one: *none*, *score-boost*, or *prompt*,
with the prompt variant implying the gate. The request shape carries an
optional bias list that every adapter accepts; an adapter whose engine cannot
use it drops it **and says so** in the result, so the product can see that
its vocabulary went nowhere instead of assuming it helped. An adapter that
implements the prompt variant owns the silence gate and the marker check
above, because they are properties of that engine's failure physics and the
caller cannot be expected to know which engine it drew.

## What this cannot do

Biasing moves probability toward words the audio partly supports. It cannot
recover a word cut in half at a segment boundary — that is
[stt-pipeline](./stt-pipeline.md)'s cut-at-silence rule — and it cannot
teach an engine a phoneme sequence outside its model; a name the engine has
no way to spell is a case for a grammar or a spelled-out fallback in the
intent parser, not for a stronger boost. And it does nothing for the
reader-facing cleanup that [transcript-normalization](./transcript-normalization.md)
owns: a bias that makes the engine write "one" instead of "1" has changed the
transcript's form, and whether that form is the one the destination wants is
the normalizer's decision, not this stage's.
