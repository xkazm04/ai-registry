---
layer: technique
type: technique
subject: character-voice-design
technique: audition-line-set
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [writing the lines designed voice candidates will read for a casting decision, every candidate sounds acceptable and the choice feels arbitrary, a chosen voice failed on a kind of line nobody auditioned]
---

# Audition line set

The audition set is the test suite of a casting round. A candidate that has not
read a register has not passed it; it is untested in that register
([unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)). The set is
written once per character, from the vocal brief, before any voice is generated.

## Shape of the set

- **Three to six lines, five to ten seconds each.** Short enough to compare
  back to back across a slate, long enough for a register to settle. A line
  under four seconds is mostly onset; one over twelve tests stamina, which is a
  production concern, not a casting one.
- **One register per line.** The working register (where most of the
  character's lines will live), the humour, the tender or quiet turn, the high
  intensity, and the arc's extreme. A line that mixes two registers cannot
  report which one failed.
- **One hard token class somewhere in the set.** A number, a name, a technical
  term, an interruption. The character's real lines will contain them.
- **Original lines.** Written for this production in the character's manner,
  never quotations of an existing work. A quoted line invites comparison with a
  performance the voice should not imitate and drags the listener toward the
  wrong judgement.
- **Identical text and tags across the slate.** Same words, same punctuation,
  same direction tags in the same places, so the voice is the only variable.

## Direction inside the lines

When the speech model takes inline direction, tags go immediately before the
words they should affect, sparingly, one or two per line, and only in the lines
whose register needs them. A line made of tags alone does not render. The set
deliberately keeps one or two lines untagged, because a voice whose register only
appears when tagged is a voice the writers will have to tag forever. Which
dialect the tags compile to, and what happens to them on another engine
generation, is the multi-speaker production subject's concern.

## Keep the design text separate

The longer text the designer reads to create the voice is not one of the
audition lines. It is heard on the board as its own column, labelled as the
design read, because it was rendered under the designer's settings rather than
the shipping ones and is the least representative take on the board.

## Decision rules

- **When every candidate passes every line, the set is too easy.** Add the
  register the character finds hardest, usually the extreme of the arc or the
  quiet line.
- **When candidates fail the same line the same way**, suspect the line before
  the voices: a tag the engine reads aloud, a sentence that cannot be said in
  ten seconds, a pun that depends on spelling.
- **When the character's real script exists**, take one audition line from its
  hardest moment, paraphrased, so the casting is tested on the work it is for.

## When not to use it

A one-off utility voice (a system announcement, a test fixture) needs one
representative line, not a register set.
