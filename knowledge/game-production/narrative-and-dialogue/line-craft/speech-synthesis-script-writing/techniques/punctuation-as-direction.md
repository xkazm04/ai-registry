---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: punctuation-as-direction
status: forged
laws: [structural-proof-is-never-sufficient]
shared_with: []
use_when: [placing pauses, stress or interruption in a line for a synthetic voice, a line's question renders as uncertainty, a stressed word comes out flat]
---

# Punctuation as direction

The named concern: for a speech model, punctuation is not grammar, it is the performance. A full
stop is a falling pitch and a pause. A comma is a shorter pause with the pitch held. A question
mark is usually a rise. An exclamation mark is more energy and, on some voices, a shout. A dash
is a break or a cut-off. An ellipsis is a trailing-off or a weighted pause whose rendering
varies more between models and voices than any other mark. Sentence boundaries are the strongest
control of all, because each sentence is an intonation unit with its own reset. These are the
only direction controls every engine honours in some form, which makes them the writer's
portable direction language: they travel to the next engine, the next generation and the next
voice when markup does not. Portable is not identical, though; how long a full stop holds and
how far a question rises are properties of the voice, so the same punctuation is a different
performance on two voices.

## What each mark asks for

**The full stop** is the writer's most reliable tool. It ends a unit, drops the pitch and
places a pause. Isolating a word in a short sentence stresses it by isolation: "He's done. Gone."
puts weight on "Gone" that no emphasis markup does as dependably. When a stress lands on the
wrong word, the usual fix is to move the important word to the end of a short sentence, where
the falling pitch lands on it. Every full stop is also a pause the line pays for in time, so
full stops are spent, not scattered.

**The comma** places a breath-length pause inside a unit. Too many commas turn a line into a
list read in a list voice. A comma is the right mark for a small hold before an addressee's
name or after an opening word; it is the wrong mark for joining two thoughts, which want a full
stop.

**The question mark** asks for a rise, and many models apply it to every question, including
the ones a person would say falling — the rhetorical question, the threat phrased as a question,
the question the speaker already knows the answer to. "You think you can catch me?" from a rival
may render as genuine doubt. When the question is not really asked, consider a full stop
("You think you can catch me.") and listen to both.

**The exclamation mark** raises energy. One is a direction; two in a row, or one on every line,
flatten into a voice that shouts everything, and some voices clip or distort at the peak. Use it
on the line that needs the energy, not as a default; a calm villain gets none.

**The dash** marks a break: a thought interrupted, a cut-off, a beat before a reveal. Some
engines' dialogue modes document it specifically as a cut-off. It is usually more predictable
than an ellipsis for a short internal break, but its rendering still varies by model and must be
heard.

**The ellipsis** is a hesitation mark first and punctuation second, and its risks are owned by
the technique on hesitation marks; here it is enough to say that it is the last choice for a
pause, never the default.

**Capitals and typographic emphasis** are model-specific. Formatting such as italics is
invisible to most engines. Some engine families document capitals as adding emphasis; others may
spell a capitalised word out as an acronym. Where capitals are honoured, one capitalised word in
a line is a stress; two are a shout; more are noise. Prefer sentence shape for stress, and use a
capital only where this engine has been heard to honour it.

## Procedure

1. **Mark the line's shape before choosing words:** where the units end, which word carries the
   stress, whether the line rises or falls at the end.
2. **Write the units as sentences,** with the stressed word last in its sentence where possible.
3. **Use commas for small holds and dashes for breaks,** and keep each line to one or two of
   either.
4. **Decide every question mark,** asking whether the speaker really asks.
5. **Render and listen for the shape you marked,** because the text only requests it
   ([structural proof is never sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)):
   a line whose punctuation is correct on the page has proven nothing about where the voice put
   its stress or how long it held each stop.

## Decision rules

- When a word must be stressed, isolate it or end a short sentence on it, before reaching for
  capitals or emphasis markup, because sentence shape is honoured by every engine.
- When a question is rhetorical or menacing and renders as doubt, rewrite it as a statement or
  restructure it; do not fight the rise with settings.
- When a line sounds like a list, replace commas with full stops — but no more full stops than
  the line has ideas.
- When the same punctuation renders differently on two voices, write per voice and record which
  form each voice performs, because the mark's meaning belongs to the model and the voice, not to
  the page.

## When not to use it

Display text that is never spoken follows the house style for reading. A line recorded by a human
actor is directed by a person, and over-punctuating it for a machine makes the actor's script
harder to read.

## Evidence status

The reading of each mark as direction (full stop as a beat, comma as a breath, ellipsis as a
weighted pause, dash as a cut-off, capitals as emphasis, at most one capitalised word) is
confirmed by a game-dialogue research dossier citing one speech vendor's best-practice and
dialogue-mode pages, which it rates high confidence as primary for that vendor's models; the
dossier read those pages, this document did not re-read them. The question-mark rise and the
isolation stress are practitioner knowledge, not sourced. The observation that a boundary's
length is a property of the voice comes from one project's measured renders on one engine
generation, not a controlled study, and none of this has been tested in a played game yet.
