---
layer: technique
type: technique
subject: short-form-cards-and-barks
technique: television-read-budget
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [setting text limits for cards and subtitles shown on a television, a card that reads fine on a monitor is unreadable from the sofa, timing how long a card stays on screen]
---

# Television read budget

The named concern: state, before writing, how much text each class of short unit may carry on
a television viewed from a sofa, in units that carry their basis, and treat the figure as the
intended size of the unit rather than a ceiling found at layout. A television at sofa distance
is the most expensive surface text can appear on, and a budget set on a desk monitor at arm's
length is wrong by a large factor.

## Why the television is expensive

Three costs compound. **Type is large**: text that must be legible from across a room needs a
much larger body height, relative to the screen, than text read at a desk, so far fewer
characters fit on a line and a line wraps sooner. **The room reads together**: in family or
couch play the card is read at the pace of the slowest reader present, who may be a child or
an adult reading aloud to one, and silent adult reading speed is the wrong basis. **The eye is
elsewhere**: a subtitle shown during play is read peripherally by a player whose attention is
on the game, so it competes with the very thing it accompanies.

## The budget, with its units

Each figure names its unit and the assumption behind it,
[a number carries its unit and its basis](../../../../_laws.md#a-number-carries-its-unit-and-basis):

- **Type size, as body height relative to screen height.** Console-distance guidance puts the
  default minimum body height at about two and a half percent of the screen's height —
  close to one and a half times what the same guidance asks of a desk screen at the same
  resolution — and asks that timed text sit
  larger than that, because it is on screen only briefly. Every other figure is computed at
  this size.
- **Characters per line, at that type size.** A line of roughly forty characters is the working
  ceiling for fast-read text such as subtitles; a card line should sit under it, near a dozen
  words, because a card line is meant to be taken in at a glance rather than read.
- **Lines per unit.** Three for a card, and often fewer when the picture carries the first;
  one, at most two, for a bark subtitle.
- **Words per bark,** set by the breath and by where the player's eyes are: a handful of words
  mid-action, up to a full breath between rounds (bark-carries-character-in-one-breath).
- **Dwell seconds per card,** derived from the slowest reader present and a read-aloud pass,
  never from a silent read by the writer who already knows the words. Where possible the
  player dismisses the card rather than a timer doing it, because a timer is set for an average
  reader and the room is not average.

State these as targets, not limits. A writer told "maximum three lines of forty characters"
writes three full lines; a writer told "three short lines, the last the shortest" writes a
card — [a budget shapes the output, it does not only cap it](../../../../_laws.md#a-budget-shapes-the-output).

## Read aloud at sofa distance

Every unit is read aloud before it ships, at speaking pace, by someone standing where the
sofa is. Read-aloud is not a proxy for the player's experience; in family play it *is* the
experience, because one person reads the card to the room. The pass catches what a silent read
misses: a line that cannot be said in one breath, a name nobody knows how to pronounce, a
number or symbol that has no obvious spoken form, parentheses and dashes that have no sound,
two stressed words colliding, a sentence whose meaning depends on emphasis the text does not
mark, a word whose pronunciation depends on its meaning.

When a line is voiced as well as shown, the caption matches the audio word for word. A
caption that paraphrases its audio — tidier, shorter, or written before the recording was
edited — makes the room hear one line and read another, and the reader aloud stumbles exactly
where the two diverge. The voiced form wins the wording; the caption follows it.

## Procedure

1. **Fix the type size first,** at the minimum legible body height for the target distance and
   resolution, and only then count how many characters fit. A budget computed at a smaller type
   is a budget for a different screen.
2. **Set per-class targets** — card line, card total, bark subtitle, taunt — with units and
   basis written beside each.
3. **Write to the targets,** and grade what was written against the target, not only against
   the ceiling.
4. **Place line breaks by hand at sense boundaries,** never by automatic wrapping, so each line
   holds a phrase that can be read alone.
5. **Read aloud from the sofa,** time the slowest reader, and set dwell from that time.
6. **Check on the real screen** at the real distance; a mock-up on a monitor answers a
   different question.

## Decision rules

- **When text does not fit, cut words, never type size.** Shrinking type to fit a line moves
  the failure from the writer to the reader.
- **When a card needs more than its dwell time to read aloud, it has too many words.** Do not
  extend the timer to rescue it.
- **When a bark subtitle needs two lines, the bark is too long** or is two barks.
- **When numbers matter on a silent card, write them as digits and check how they are said
  aloud; in voiced text, spell them out,** because a voice — recorded from a script or
  synthesised — reads digits, currency signs and abbreviations unreliably. When numbers do not
  matter, cut them.
- **When the game targets several screen classes,** budget for the television and let larger or
  nearer screens inherit the margin; the reverse never fits.

## When not to use this

- **On text the player reads at their own pace in a menu or codex** that never times out; the
  per-line target still applies, but dwell does not.
- **On handheld or second-screen text,** which has its own distance and its own budget.

## Evidence status

The roughly forty-character line ceiling, the two-line subtitle maximum, manual line breaks at
editorially sensible points, the console minimum body height, and larger default type for
timed text all come from a platform holder's published game accessibility guidelines on
subtitles and text display, read in full for this subject (primary). The point that silent
adult reading speed is the wrong basis for a room is consistent with broadcast subtitling
practice and with accessibility guidance that subtitle rate should suit the audience's age;
the broadcast figures themselves are recalled, not re-verified in this pass. The voiced-text
rules — spelled-out numbers, word-for-word captions, pronunciation-dependent words — come from
a voice-synthesis vendor's published guidance (primary for that vendor's models, untested on
others). The mid-action bark figure is a design proposal from the research behind this
subject, not a measurement. The dwell-from-read-aloud rule is this subject's own judgement.
None of this has been tested in a played game yet.
