---
layer: application
type: application
subject: video-assembly
technique: alignment-names-its-text
stack: process
status: forged
verified_on: 2026-10-04
---

# Two alignment contracts, and the decision each one makes for you

`alignment-names-its-text` says a derived cue records which text its time was
indexed to. This application is the dated, sourced reason that rule is not
pedantry: the synthesis engines in common use return alignment in **two
incompatible shapes**, and they differ in whether the index-space choice is
yours to make or was made upstream. A pipeline ported from one family to the
other inherits a decision it never knew it had.

Verified 2026-10-04 against each vendor's own API reference. It will go stale;
that is what the date is for.

## The two families

| | character-alignment family | word-boundary-event family |
| --- | --- | --- |
| Shape | one response field beside the audio | a stream of events raised during synthesis |
| Granularity | per **character** | per **word, punctuation, and sentence** |
| Time unit | seconds (float) | ticks, with an explicit duration per item |
| Index spaces returned | **two** — authored text *and* normalised text | **one** — offsets into the input text / markup |
| Who chooses the index space | **the consumer, on every call** | the engine, in your favour |
| Words | a grouping you compute | given, and typed by boundary kind |

**Representative contracts.** The character-alignment family is exemplified by
ElevenLabs' timestamped synthesis endpoint, which returns `audio_base64`
alongside `alignment` ("Timestamp information for each character in the
original text") and `normalized_alignment` ("Timestamp information for each
character in the normalized text"), each carrying parallel `characters`,
`character_start_times_seconds` and `character_end_times_seconds` arrays. The
word-boundary family is exemplified by Azure AI Speech's `WordBoundary` event,
"raised at the beginning of each new spoken word, punctuation, and sentence",
which "reports the character position in the input text or SSML immediately
before the word that's about to be spoken" and carries `BoundaryType`,
`AudioOffset`, `Duration`, `Text`, `TextOffset` and `WordLength`.

## Why normalisation is what creates the second index space

Normalisation is on by default in the character-alignment family —
ElevenLabs' guidance states it "is enabled by default for all TTS models to
help improve pronunciation of numbers, dates, and other complex text
elements" — and its documented behaviour is a rewrite, not a hint: `$1,000,000`
is read as "one million dollars". Ten characters become twenty. Every
character position after that token has moved, which is precisely why there
are two alignment arrays and not one.

This is the concrete form of the technique's central claim. The arrays have
the same field names, the same types and plausibly similar lengths; nothing
but the field name distinguishes the coordinate system, and nothing in the
response marks which one a given cue should use.

## What each family gets wrong, and they are not the same thing

**The character-alignment family hands you the trap.** Both alignments are
present on every response, so a consumer that reads whichever it saw first in
the documentation has chosen an index space by accident. The failure is silent
on any script without an expanding token, which is most test fixtures.

**The word-boundary family removes that trap and adds two smaller ones.**
Because `TextOffset` is documented as a position in the *input* text, a cue
authored against the script is correct by construction — the engine made the
right choice for you. But:

- The offsets index the input **including markup**. Where the input is SSML,
  a character offset is into the marked-up string, not into the prose a writer
  edited, so a cue mapped back to the script must account for tag spans.
- Punctuation and sentence boundaries arrive in the same stream as words,
  typed by `BoundaryType`. A consumer that treats every event as a word anchor
  will fire cues on commas. The typing is the remedy and it has to be read.

**The portability consequence.** Moving a pipeline from the word-boundary
family to the character-alignment family silently converts a decision the
engine was making correctly into a decision nobody is making. That migration
is the single highest-risk moment for this defect, and it is the one a
capability-based abstraction hides most effectively — both engines "support
word timing", so a capability probe reports parity where the contracts differ
in kind.

## The regression fixture, concretely

A narration fixture that can regress this defect contains at least one token
the engine will expand. The cheapest reliable ones, from the documented
normalisation examples:

- a currency figure with separators (`$1,000,000`)
- a hyphenated phone-number-shaped string (`123-456-7890`)
- a calendar date in numeric form

Place a cue on a word **after** the expanding token — a cue before it passes
under either index space and proves nothing. Assert the cue's time against the
authored-text alignment, and keep a second assertion that the two alignments
actually differ for this fixture, so the fixture itself cannot rot into a
tautology if a future model stops normalising.

## What this application cannot tell you

It does not price the engines, rank their voices, or cover the engines that
return no alignment at all — those pick up the unmeasured-estimate rule from
`audio-first-beat-pacing` instead. It also reports contracts as **documented**,
not as **observed**: no tree in this fleet currently synthesises a narration
lane with returned alignment, so none of the above has been executed against a
live response here. Where a vendor's behaviour diverges from its reference,
this document is wrong in the direction of the reference, and the return
condition for correcting it is a project that actually makes the call.

## Sources

- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://elevenlabs.io/docs/best-practices/prompting/normalization
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis
