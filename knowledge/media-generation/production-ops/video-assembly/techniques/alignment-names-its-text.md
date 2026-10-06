---
layer: technique
type: technique
subject: video-assembly
technique: alignment-names-its-text
status: forged
laws: [unmeasured-is-not-pass, typed-input-owns-its-channel]
shared_with: []
use_when: [deriving a cue or caption position from a synthesised narration's returned alignment, a mid-clip overlay lands late by a growing amount, choosing between an authored-text and a spoken-text alignment, placing a cue on a specific spoken word rather than on a beat boundary]
---

# The alignment names its text

A timed alignment is a mapping from positions in **a** text to times in an
audio stream, and a synthesiser that normalises its input returns more than
one of them. The technique is one line:

> **A derived cue records which text its time was indexed to, and the text it
> is indexed to is the text the cue was authored against.**

Everything below is why that sentence needs saying, and what goes wrong in
the gap between the two texts.

## For a generated voice lane, the synthesiser is the producer

[derived-turn-markers](./derived-turn-markers.md) establishes that positions
in a voice-led cut derive from a word-timed transcript rather than being
typed, and names the transcript's producers: recognition emits one, subtitle
formats carry one. For a **recorded** voice lane that is the whole story —
the audio existed before anyone knew what was in it, so something has to
listen to it.

A synthesised lane inverts the dependency, and the inversion is worth making
explicit because the recorded habit survives into pipelines that no longer
need it. The text was an input. The engine that produced the audio therefore
already knows where every part of the text landed, and a synthesis call can
return that mapping beside the audio it just made. Recovering it by running
recognition over your own synthetic speech is a round trip that can only
lose: it re-derives, with a word-identity error term, information the
generator was holding.

The error term is not uniform, which is what makes the round trip worse than
it looks. Recognition is least reliable on proper nouns, coined product
terms, acronyms and figures — and those are precisely the tokens an overlay
exists to annotate. The stat card that must fire on its own number is
anchored to the word the recogniser is likeliest to have heard as something
else. An alignment taken from the synthesiser cannot be wrong about *which*
token a time belongs to, because the token was given to it.

## The payload is per-character; a word is a derivation

The mapping that comes back is commonly **per character**: a sequence of
characters with a start and an end time each. "Word timings" is not what the
engine returned — it is a grouping the consumer computes, and because it is
a computation it has rules that belong in one place and have to be declared:

- Whitespace and punctuation carry times too. A word's end is the end of its
  last letter, not the end of the space that follows it, and a cue that
  includes the trailing space fires a few tens of milliseconds late for no
  reason anyone will find.
- A token the writer thinks of as one word may be several characters apart in
  the stream (a hyphenated name, an abbreviation with periods). The grouping
  rule decides whether that is one anchor or three.
- The grouping is shared by every consumer — captions, overlay entrances, cut
  points — for the same reason
  [derived-turn-markers](./derived-turn-markers.md) insists on one
  derivation: two groupings of one alignment age apart, and the symptom is
  one surface agreeing with the voice while another does not.

State the grouping once, next to the derivation, and let the surfaces read it.

## Two texts, two index spaces

A synthesiser that reads numbers, dates, currency and abbreviations aloud
must first rewrite them into speakable form. That rewrite produces a second
text, and the two texts are different character sequences of different
lengths: a ten-character figure becomes a twenty-character phrase, and every
position after it has moved.

So the engine returns two alignments — one indexed to the text as authored,
one indexed to the text as spoken — and they agree exactly up to the first
rewritten token and nowhere after it. The consequence is a correctness rule
rather than a preference:

> A cue authored against the script is indexed to the **authored** text. A
> cue authored against what is heard — a caption that must match the spoken
> words, a check that the engine said what it was asked to say — is indexed
> to the **spoken** text. Reading one and applying it to the other is not an
> approximation; it is a different coordinate system.

A pipeline that takes whichever alignment the payload lists first has made
this decision by accident, and the accident is invisible in review because
the field names are a plausible pair and the arrays have the same shape.

## The failure signature points at the wrong cause

The error this produces is zero at the head of the clip and grows with each
rewritten token the narration passes. That is the same profile
[drift-correction](./drift-correction.md) names as **rate mismatch** —
"clean at the head, a hundred-plus milliseconds out by the tail" — and its
prescribed remedy there is to conform the rate at the source, which here is
a correct diagnosis of the wrong system and will not move the number.

The discriminating test is cheap and it belongs in the diagnosis, not in the
fix: a rate mismatch's error grows **with time**, smoothly; an index-space
error grows **in steps, at the tokens that expand**, and is flat between
them. Plot the signed error against a few anchors and the two are not
confusable. A clip whose error jumps at its one dollar figure and holds
steady either side of it has an index problem, and no amount of resampling
will touch it.

## The coincidence trap at index granularity

A script with no numbers, no currency, no dates and no abbreviations
normalises to itself. Its two alignments are identical, every cue lands, and
the pipeline that picked the wrong one passes every test it has. The defect
ships and waits for the first script with a price in it —
[derived-turn-markers](./derived-turn-markers.md)' coincidence trap, moved
down to the index and made worse by the fact that the agreement is not even
visible as a number somebody could have checked.

The audit is the same question that technique asks, aimed one level lower:
for each derived cue, **which text does this time index, and is it the text
the cue was written against?** A pipeline that cannot answer from its own
code has the trap, whatever its current output looks like. The cheap
regression is a fixture whose narration contains at least one expanding
token, kept for exactly this reason and labelled with it; without one, the
test suite is agreeing with the bug.

## Decision rules

- When the voice lane is synthesised, take the alignment from the synthesis
  response; when it is recorded, recognise it. Never recognise audio you
  generated from a text you still have.
- When the response carries more than one alignment, select it by **which
  text the cue was authored against**, and record that choice beside the cue
  rather than in the code that happened to make it.
- When the payload is per-character, declare the character-to-word grouping
  once and have every surface read that derivation, never its own.
- When a mid-clip cue drifts, measure the signed error at three anchors
  before touching anything: flat-then-stepped is an index space, smoothly
  growing is a rate, constant is an offset.
- When a narration fixture contains no expanding token, it cannot regress
  this defect — add one and say in the fixture why it is there.
- When an engine offers no alignment at all, the cue's position is an
  estimate and is marked as one, by the same rule
  [audio-first-beat-pacing](../../live-system-demo-film/techniques/audio-first-beat-pacing.md)
  applies to an unmeasured clip: an estimate may pace a rehearsal and may not
  pace a delivered cut.

## When not to use it

This governs cues that must land on a *position inside* a narration clip. A
beat whose picture is held for the whole line needs no alignment at all —
its timing is the clip's measured duration, which
[audio-first-beat-pacing](../../live-system-demo-film/techniques/audio-first-beat-pacing.md)
already owns, and reaching for a character alignment to compute something a
duration answers is machinery for its own sake.

It also does not apply to a lane with no authored text: an interview, a
vox-pop, any recorded speech whose transcript is discovered rather than
given. There the only text that exists is the one recognition produced, there
is no second index space, and the question this technique settles cannot
arise.
