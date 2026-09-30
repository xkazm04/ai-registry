---
layer: technique
type: technique
subject: multi-speaker-speech-production
technique: world-lexicon-as-pronunciation-dictionary
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [invented names or acronyms are pronounced differently across lines, a pronunciation fix must reach every line that has the term, keeping pronunciation stable across an engine change, a script revision changes how a name is said]
---

# World lexicon as pronunciation dictionary

An invented place, a surname from another language, an acronym, a technical
term: an engine guesses, and the guess is not a fixed function of the word. It
varies between renders, between lines with different neighbours, and between
engine generations. A script that relies on the guess has a name said three ways
in one episode and no record of which was intended. The fix is a **lexicon**:
one document per script or fictional world stating how each term is said,
applied at render time, versioned with the script.

## Boundary with text normalization

The speech-ready-text technique in the voice-I/O subject converts display text to
speakable text: strip markup, close phrases, expand what the host's locale
normalizer expands. It is stateless and per text. The lexicon differs in two
ways: it is **per world**, carrying decisions that outlive any single line, and
its trigger is a **revision**: someone decided the name is said differently, and
every line that contains it is now affected. That trigger, and the re-render it
implies, is why the technique lives with production rather than text
preparation.

## What enters the lexicon

- **Every proper noun, coinage, acronym and technical term that appears in two
  or more lines**, entered once. The rule is about consistency: a term used in a
  single line can be fixed in that line; a term used twice can be said two ways.
- **A term the engine mispronounces in a listening pass**, whatever its count,
  once the pass has caught it.
- **Terms whose reading is a decision**, not an accident: an acronym spelled out
  letter by letter versus said as a word, a surname with a family-preferred
  pronunciation, a place whose local and anglicized readings differ.

Each entry carries the written form, the intended reading, the kind of rule used,
and a one-line reason (a person said it this way; the setting's language
dictates it). Two rule kinds cover nearly everything: an **alias** (say "as if
written" some respelling, portable across engines but approximate) and a
**phonetic** rule (a phoneme string in an engine-supported alphabet, precise
but tied to which alphabets and which model generations support it). Prefer the
alias where it is good enough, because it survives an engine change; use
phonetic entries where an alias cannot reach the sound, and keep the alias
beside them as the fallback.

## Mechanics to read from the engine, not assume

Engines that support dictionaries differ in details that decide whether a
lexicon behaves as written. Read and record these for the engine in use:

- **Matching**: whether a search is case-sensitive, whether it matches whole
  words, and which entry wins when two match (first match applied is a common
  rule, which makes entry order significant).
- **Application**: dictionaries attached to a request by identifier and version,
  applied in order, with a small cap on how many attach to one request. A world
  larger than the cap needs the entries consolidated, or split by scene.
- **Versioning**: a change to a dictionary produces a new version; a request
  that names an old version still gets the old behaviour. The lexicon version a
  render used is therefore recordable, and must be recorded.
- **Generation support**: which rule kinds a given engine generation honors. A
  phonetic alphabet supported on one generation may be replaced by a different
  notation on the next; a lexicon of phonetic entries is a dialect problem of
  the same shape as inline direction, and its aliases are the portable layer.

## A lexicon change is a computed re-render

The lexicon is versioned with the script and its version is part of each line's
render key (see the line-addressed technique). When an entry is added or
changed:

1. Search the script's text for the written form (and for the inflected or
   possessive forms the entry is meant to cover) and list the lines that contain
   it.
2. Mark exactly those lines stale. Lines without the term keep their accepted
   renders ([edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate)).
3. Re-render the stale lines, then listen to each against its neighbours.
4. Check the entry itself: does it work on every line where it appears, in every
   voice that speaks it? A phoneme rule that works in one voice's accent and not
   another's is a per-voice finding, not a lexicon pass.

Two search hazards. A short term matches inside longer words (a name that is a
fragment of an ordinary word); match on word boundaries and read the hit list,
because a count of matches is not a list of the right lines. And a term spoken
by one character and written differently by another (a nickname) is two lexicon
entries with one intended sound.

## Decision rules

- A term appears in two or more lines: it enters the lexicon once, before
  rendering, not after the second complaint.
- A pronunciation is unsettled by the writer: the lexicon records the decision
  and its owner; an undecided term stays out and is flagged, because a guessed
  entry is a wrong fix applied everywhere.
- The engine ignores a dictionary rule: the rule is unmeasured until the ear
  confirms it on a render
  ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)); do not
  count an uploaded entry as a fixed pronunciation.
- The engine changes: re-check every phonetic entry on the new generation;
  aliases carry across, phonetic entries are re-verified.

## When not to use it

A script with no invented or ambiguous terms needs no lexicon; a one-line
correction to a single mispronunciation can be a respelling in that line, and
belongs in the lexicon only once the term recurs.
