---
layer: technique
type: technique
subject: llm-dialogue-quality-control
technique: voice-bible-in-every-prompt
status: forged
laws: [declaring-an-input-is-not-consuming-it, one-authority-per-quantity, a-budget-shapes-the-output]
shared_with: []
use_when: [assembling the prompt that generates a speaker's lines, generated characters drift toward one shared register, deciding what context a dialogue generator and its judge must receive]
---

# Voice bible in every prompt

The named concern: make the speaker's voice entry, and the situation the line is spoken in,
part of every generation call and every judging call, verbatim, and phrase the call as
positive instruction. Writing the entry is the voice craft's job; this technique owns getting
it consumed.

## What every call carries

A dialogue generation call carries, in this order: the scene situation in two or three
sentences, stating what just happened; the speaker's **want** in this exchange and what they
are **withholding**; the speaker's voice entry, verbatim from its one source; the entries of
the people they address, or at least each one's register row toward the speaker; the lines
immediately before the slot; the slot's **length budget**, stated as the intended size of the
line rather than a ceiling; the constraint for this candidate; and three to five reference
lines for the speaker written by a person.

Each element has a failure it prevents. Without the situation, the model writes a line about
the topic instead of a move in the exchange. Without the want and the withholding, it writes a
speaker who says what they feel. Without the entry, it writes in its own register. Without the
addressee, every speaker talks to everyone in the same way. Without a budget stated as a
target, it spends the allowance, because a generous limit is read as an instruction to be long,
which is [a budget shapes the output, it does not only cap it](../../../../_laws.md#a-budget-shapes-the-output).
Without reference lines it has rows to interpret and nothing to imitate.

## Positive instruction over prohibition

The call states what the speaker does and why: "speaks in short declaratives because he
treats talk as a cost", "answers a question about herself with a question about the car". It
does not list what to avoid. A model attends to the words in the prompt; a list of forbidden
phrases raises their availability and, when obeyed, produces the nearest synonym. The voice
entry's never-say rows and off-voice example lines are therefore withheld from the generator
and given to the filter and the judge, which check against them. The exception is a short
refusal row phrased as behaviour — "never names his brother; says 'him' when he must" — which
is positive in form and carries the subtext the scene depends on.

The brief's own register matters as much as its content. A model matches the style of the
prompt it is given, so an ornate, adjective-heavy brief returns ornate, adjective-heavy lines.
Write the brief flat, short and concrete; mark the hidden part of the scene as never said
aloud rather than describing it in feeling words the model will then reuse.

Reasons travel with instructions. "No contractions" is followed as a surface rule and broken
under pressure; "no contractions, because he was schooled formally and holds on to it when
frightened" is followed in the peak scene as well, because the model now knows when the rule
matters most.

## One source, read by both sides

The entry is pulled from its single canonical file at assembly time, never pasted into a
prompt template where it can drift from the original, which is
[one authority per quantity](../../../../_laws.md#one-authority-per-quantity). The judge receives
the same entry, version for version, that the generator received, because a line scored against
a different description of the speaker than the one it was written from is scored against the
wrong target. The entry's version identifier is recorded with every candidate and every score.

A voice entry nobody consumes governs nothing, and from the outside it looks configured. So
prompt assembly is checked: a call for a speaker whose entry is absent, empty or truncated
fails before dispatch rather than generating an unbriefed line, and an audit lists, per entry,
the calls that read it in the last batch. An entry with no readers is reported as ignored, which
is [declaring an input is not consuming it](../../../../_laws.md#declaring-an-input-is-not-consuming-it).

## Fitting the budget of the context

When the full set of entries no longer fits beside the scene, cut by row, not by speaker: keep
rhythm, vocabulary, the refusal and the reference lines for every speaker in the scene, and drop
biography, arc history and registers toward characters not present. A speaker present with a
short entry is better than one present with none. Never summarise an entry into a paraphrase
for the prompt; a paraphrase is a second, drifting copy.

## Decision rules

- **When a speaker's line is generated without that speaker's entry in the call, treat the
  candidate as unbriefed and discard it**, whatever it scores.
- **When an instruction in a prompt is phrased as a prohibition, rewrite it as the behaviour
  wanted, with its reason**, or move it to the filter.
- **When the brief reads like prose fiction, flatten it** before generating from it.
- **When a line will be voiced, put the speakability rules in the brief too**, so drafts
  arrive speakable instead of being fixed after selection.
- **When the generator and the judge received different entry versions, re-judge.**
- **When the entries overflow the context, drop rows that do not constrain a line** before
  dropping any speaker.
- **When a whole scene is generated in one call, still carry every present speaker's entry**,
  and prefer per-speaker generation for scenes that hinge on contrast.

## When not to use this

A crowd voice or a one-line vendor needs a register note, not an entry. A slot whose output is
not natural language — a menu label, a system message — is outside this subject.

## Evidence status

That models steer better from positive instructions with reasons, from three to five varied
examples, and from a prompt whose style matches the output wanted, comes from a model vendor's
primary prompting documentation. That prohibitions plant
the prohibited phrasing is practitioner consensus with weaker support. That a generator without
a per-speaker reference collapses a cast into one register is supported by measured studies of
model prose, not of dialogue. The assembly check, reader audit and cut-by-row rule are
practitioner synthesis. None of this has been tested in a played game.
