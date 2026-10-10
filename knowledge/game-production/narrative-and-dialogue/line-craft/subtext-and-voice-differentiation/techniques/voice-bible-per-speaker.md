---
layer: technique
type: technique
subject: subtext-and-voice-differentiation
technique: voice-bible-per-speaker
status: forged
laws: [declaring-an-input-is-not-consuming-it, one-authority-per-quantity, law-and-check-share-one-source]
shared_with: []
use_when: [starting a cast that several writers or a generator will voice, characters drift between scenes or writers, building the reference a dialogue reviewer judges against]
---

# Voice bible per speaker

The named concern: give every recurring speaker one written voice reference, structured so
that a writer can write from it, a generator can be prompted with it, and a reviewer can
judge against it — and make sure all three actually do. Without one, voice lives in a
single writer's head and is lost the moment a second writer, a later month or a model
touches the character.

## The naive bible

The naive bible is a biography: age, history, likes, a personality adjective list —
"gruff but kind", "sardonic", "loyal". It is pleasant to write and nearly useless at line
level, because no adjective tells a writer how a sentence is built. "Gruff but kind" is
satisfied by every gruff-but-kind character ever written, which is to say by the generic
one. A bible is useful only to the extent that it constrains the next line.

## The entry

One entry per speaker, short enough to be carried whole in an authoring prompt. Its rows:

**Want, hidden thing and refusal.** What the speaker wants, stated once in their own words
as they would put it; the unsaid thing that shapes every line they speak; and what they will
not admit, not discuss, not say, as three to five hard rules. The refusal row is the most
productive one in the document, because it generates subtext and scene pressure on its own.

**Status move.** How they hold or take position in a conversation: they interrupt, they
wait, they flatter, they defer, they answer late. One word is often enough, and it decides
more about a scene's shape than any line.

**Rhythm.** Typical sentence length and how much it varies; whether they finish thoughts;
questions versus statements; grammar habits; how they open and close a turn. Stated in terms
a reviewer can check — "three to seven words; never asks a direct question; no contractions"
— rather than as mood.

**Vocabulary.** The domain their words and metaphors come from; register; a few signature
words; what they call each person they address; words they use when angry or moved; a short
list of words and phrases they never use.

**Moves.** How they say no, threaten, joke (and at whom), show affection, apologise (or
refuse to), and lie. One line each, with an example.

**Under pressure.** What pressure does to the voice — quieter, louder, more formal, more
broken — because the peaks are where voices converge.

**Registers by listener.** How the voice shifts toward each other principal character —
clipped with one, loose with another.

**Arc.** How the voice is allowed to change across the story, and what never changes. The
second half is the important one: it is what keeps a character recognisable after the arc.

**Surface marker.** At most one tic, oath or habitual phrase, with a frequency limit.

**Reference lines.** Five or more lines on voice, varied across situations, written or
chosen by a person and never generated, and never lifted from an existing work. A generated
reference line teaches a generator its own average back. Each is paired with an off-voice
line: the plausible, competent line this speaker would never say, with a note on why.

## Which rows go to whom

The generator and the reviewer read the same entry, but they use it differently, and the
difference matters. A generator steers better from positive statements with their reason —
"speaks in calm, complete sentences because he treats every conversation as accounting" —
and from on-voice reference lines, than from lists of prohibitions, which tend to plant the
very phrasing they forbid. So the generator's prompt leads with the positive rows and the
reference lines. The off-voice pairs and the never-use lists serve the reviewer and the
mechanical filter that runs after generation, where they are what a line is checked
against; there, the off-voice line is the most useful row in the document, because it is
usually exactly what the generator wrote.

## The bible must be consumed

A voice bible that the authoring prompt does not carry and the review does not consult is a
declared input nothing reads: it validates, it looks like configuration, and it governs
nothing. This is
[declaring an input is not consuming it](../../../../_laws.md#declaring-an-input-is-not-consuming-it),
and in dialogue it is the normal fate of the bible. So the production line states where each
entry is read: the generator for a speaker's lines receives that speaker's entry verbatim and
the entries of everyone they address; the reviewer judging a line receives the same entry;
and a line is never generated or judged without it.

It is also single-sourced. One entry per speaker, in one place, read by writer, generator and
reviewer alike — not a writer's version, a prompt's paraphrase and a reviewer's summary that
drift apart within a month, which is
[one authority per quantity](../../../../_laws.md#one-authority-per-quantity) applied to a
character. And the parts of it that a check enforces — banned words, the sentence-length
ceiling, the tic's frequency limit — are read by the check from the entry itself, never typed
separately into a linter, which is
[the law and the check that enforces it share one source](../../../../_laws.md#law-and-check-share-one-source).

Two conditions make that single source real.

**The check can only read rows written for a parser.** A refusal row written as prose mixes
literal bans ("debt", "please") with semantic rules ("a direct threat") and with quoted words
that only illustrate a rule ("I" when she could say "we"). A check that pulls every quoted term
out of that prose bans the illustration. In one field run, all of its hits were false. So
the entry keeps its literal bans in a row of their own, which the check reads. The semantic
rules go to the reviewer, and no regex pretends to hold them.

**The check lives where the lines change.** A lint run once, in the session that wrote the
script, consumed the bible once. After that the script was wired into the game, and the next
edit had no guard. The repository's own tests passed every documented defect when it was
reintroduced. The check belongs in the project's test suite beside the loader that ships the
lines, not in the writing session's scratch space.

## Maintaining it

A person signs off each entry, its refusal rows above all, before anything is generated
from it, and a handful of anchor lines per principal character — a first line, a last line,
the line at their turn — are written or chosen by a person, with the rest calibrated to
them. The bible is updated when the character changes, not when a writer feels like it. An arc that
changes how a character speaks — a refusal broken, a register warmed — is recorded as a dated
change in the entry with the scene that causes it, so that scenes before and after are judged
against the right version. A line that is excellent and off-bible is a prompt to ask whether
the bible is wrong; when it is, change the bible first and then accept the line.

## Decision rules

- **When an entry row is an adjective, rewrite it as a checkable pattern** or an example
  pair.
- **When a speaker's lines are generated without their entry in the prompt, treat the
  output as unreviewed draft**, whatever its quality.
- **When two entries have the same rhythm row, change one**; the cast is converging.
- **When the bible and a judge's rubric disagree, the bible wins and the rubric is regenerated
  from it.**
- **After judging, run every checkable row against the lines that won.** A rubric can override
  a bible silently: the judges prefer longer, more concrete lines, and the rhythm rows go on
  describing a terser cast than the one on the page. When most of the key picks break a row,
  the row is the question. Rewrite it, or rewrite the picks. Never ship both.
- **When an entry no longer fits in the prompt beside the scene, cut it to the rows that
  constrain lines**; biography goes to a separate document that nothing needs to read.

## When not to use this

One-line characters need a register note, not an entry. A solo project with one writer and
no generator can keep the bible lighter, though the refusal row and the paired examples still
pay. And a bible is not a substitute for reading the scenes: it describes a voice, it does
not prove a scene uses it.

## Evidence status

Per-character voice references are standard practice in games writing and television writers'
rooms; their structure here — checkable rows, a refusal row, status and pressure rows,
paired off-voice examples — is a practitioner synthesis rather than a published standard.
The guidance that a generator steers better from positive instructions with reasons and
from three to five varied examples comes from a model vendor's primary prompting
documentation. That a generator drifts toward a shared register is supported by measured
studies of model prose. In dialogue it is supported by a 2024
[speaker-verification study](https://arxiv.org/abs/2405.10150), which found that role-playing
models keep built-in characteristics across the roles they play. That models judge their own
lines poorly rests on a measured study of editors and models. The per-listener register, arc
and consumption rules are this document's own synthesis.

The two single-source conditions and the post-judging rule come from one field experiment on
one draft script, recorded in the Kotlin application:

- A lint reading the bible caught 5 of 6 documented defects. The project's suite caught none.
- 15 of 15 literal hits from a prose refusal row were false.
- 93 of 187 lines fell outside their speaker's declared word range, including 12 of 19 key
  picks.

None of this has been tested with players in a played game.
