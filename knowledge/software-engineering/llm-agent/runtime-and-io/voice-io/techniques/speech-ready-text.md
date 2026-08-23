---
layer: technique
type: technique
subject: voice-io
technique: speech-ready-text
status: forged
laws: [one-validation-door, verdict-survives-boundary]
shared_with: []
use_when: [an assistant reply is about to be spoken aloud, the voice reads asterisks or a URL character by character, choosing where to cut streamed text into synthesis chunks]
---

# Speech-ready text

Everything a chat product already holds is written for the eye: headings,
bullets, bold, code fences, links, tables, emoji, and numbers in whatever
notation the author typed. A synthesis engine voices what it is given. It
says "asterisk asterisk", reads a link address character by character,
names an emoji by its Unicode description, and stalls on a fenced block of
code. The output pipeline's queue, identity and playback discipline do not
help here — the defect is upstream of synthesis, in the text itself. This
technique owns the transformation from **display text** to **speakable
text**, and the rules for cutting a stream of it into chunks that an
engine can render quickly and prosodically.

## One door, before any engine

The transformation is a single pure function that every utterance passes
through before it reaches the synthesis interface
([one-validation-door](../../../../_laws.md#one-validation-door)) — the same
door that bounds length and sanitizes voice identifiers. It must be pure
and runnable on both sides of a client/server split, because the chunking
that wins time-to-first-audio (below) happens wherever the stream is, and a
second, divergent copy of the normalizer on the client is the two-copy race
arriving as "the preview said one thing and the server spoke another".

What the door does to display markup, in priority order:

- **removes what cannot be spoken**: fenced code, tables, images, bare
  addresses and email addresses, horizontal rules, raw markup tags. Each
  is either dropped or replaced by a *spoken stand-in the host supplies*
  ("there is a code sample") — never voiced verbatim, never silently
  swallowed when the host asked for a stand-in;
- **keeps the words and drops the decoration**: link anchor text without
  the address, emphasis without its markers, heading text without its
  level marks, list items without their bullets or numbers;
- **closes phrases the eye closed with layout**: a heading, a list item or
  a paragraph that ends without terminal punctuation gets one, because the
  engine otherwise runs it straight into the next line as one breathless
  clause. This is the single cheapest prosody improvement available, and
  it is also why the door must run *before* chunking — a chunker that sees
  terminated phrases makes correct cuts;
- **drops emoji by default**, mapping only a deliberately small set to
  words where the product decided they carry meaning;
- collapses runs of repeated punctuation, which read as a stall.

What the door does **not** do, by design: expand numbers, dates, currency
and units. Engines normalize most of these internally and differ exactly
on the ambiguous forms (a slash-date versus a fraction, a dash-range versus
a minus, an identifier that is not a number) — and in inflected languages
the expansion is *grammatical*: the word for the currency and the case of
the noun change with the count, a date is spoken in a genitive that the
digits do not show, an ordinal marker is a bare dot. A naive expansion is
audibly wrong and rated worse than a mispronounced digit. Number expansion
therefore belongs to a per-locale normalizer the host owns and tests
against its own engines — and the cheaper lever, when the text comes from
a language model, is to ask the model for speech-ready prose in the first
place: digits spelled where ambiguous, no markup, short sentences.

## Prosody control that travels

Engines disagree on markup for pauses, emphasis and style: one vendor's
bracketed tags are another's literal text read aloud, a markup standard
is honored by some models and ignored by newer ones, and a per-request
"instructions" string is one vendor's only lever. The portable prosody
controls are the ones every engine has always honored: **punctuation and
sentence structure**. A comma is a short pause, a full stop a longer one,
an ellipsis a hesitation, a short sentence emphasis by isolation. A package
that wants a neutral pause or emphasis intent exposes it as a declared
capability per adapter and maps it to that engine's dialect — and, for an
engine with no dialect, to punctuation — rather than passing one vendor's
tags through to another. Unknown bracketed or tagged markup from another
engine's vocabulary is stripped at the door, because read aloud it is the
most embarrassing defect in the subject.

## Cutting a stream into chunks

Synthesis latency scales with text length, and a local engine on ordinary
hardware renders at roughly half real time: a thousand-character reply is
tens of seconds of silence before the first word if synthesized whole. The
remedy from the synthesis-pipeline technique — split at sentence
boundaries and play chunk one while chunk two renders — has boundary rules
that each cost an audible defect to learn:

- a sentence ends at a terminal mark **followed by whitespace or the end of
  text**, optionally after closing quotes or brackets;
- a dot is **not** a sentence end when a digit follows it (a decimal, a
  version), when the word before it is a known abbreviation (titles,
  "e.g.", and the abbreviation set of every language the product speaks),
  when the word before it is a single capital (an initial), or when the
  word before it is a bare number and the next word starts lowercase — the
  ordinal-dot of inflected languages, where "the 7th of April" is written
  as a digit, a dot and a lowercase month;
- never cut inside an open quotation or bracket; a balanced-but-short
  candidate is merged forward instead;
- chunks below a **minimum length** (a few dozen characters) merge with
  the next sentence — below it, per-request overhead and prosody resets
  dominate; chunks above a **maximum** (a few hundred characters, sized to
  the slowest allowed engine) are force-split at the best clause mark and
  only then at a space;
- the **first chunk may end at a clause mark** — a comma, a semicolon, a
  colon — once past the minimum, because the first chunk's only job is to
  start sound; every later chunk prefers whole sentences for prosody.

The chunker, like the normalizer, is pure and isomorphic, and the
maximum is a **capability the engine declares** (its comfortable clip
length) rather than a constant in the caller — a cloud engine comfortable
with a paragraph and a CPU engine comfortable with a sentence share one
chunker and differ in one number.

## Chunks are one utterance

Chunking does not change identity: the utterance is one entity with one
generation token, chunks carry a sequence number, and playback is strictly
ordered. Two consequences are easy to lose when chunking is added late:

- the **outcome of the utterance travels as one typed verdict**
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
  which engine served it (from the first chunk), whether that was a
  fallback, time to first audible sample, and — when a later chunk fails —
  *how far playback got*. A failure after chunk two of five is a
  **truncation**, presented as "stopped after two of five, the rest is in
  the text", never as silence and never as an audible retry of a half
  sentence;
- **stop reaches every chunk**: the generation token invalidates chunks
  already fetched, chunks in flight (aborted), and chunks not yet
  requested; a chunk arriving for a superseded utterance is released, not
  played.

## When not to apply

Text the product authored for the ear — fixed narration scripts, recorded
prompts, a persona's scripted opening — is already speech-ready and should
bypass the markup pass (though never the length and identifier bounds);
running prose through a markdown stripper can only lose a deliberate
ellipsis or a bracketed stage direction the script meant. And a product
whose spoken text is a single short sentence at a time — confirmations,
status lines — gains nothing from chunking and should send one request.
