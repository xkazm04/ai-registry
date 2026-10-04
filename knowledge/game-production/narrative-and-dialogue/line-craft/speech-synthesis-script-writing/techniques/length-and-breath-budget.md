---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: length-and-breath-budget
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [setting the length of lines a synthetic voice will speak, a long line renders rushed, flat or garbled, a one-word line renders differently on every take, a short line renders far longer than its words]
---

# Length and breath budget

The named concern: a speech model performs a line well only inside a range of length, and the
range has two ends. Above it, a long sentence gives the model room to drift: the stress lands on
the wrong word, the pitch flattens into a recitation because nothing resets it, the speed creeps
up towards the end, and on some models the accumulated uncertainty surfaces as a skipped word,
a repeated word or a garbled tail. Below it, a line of one or two words gives the model too
little context to choose a delivery, so it guesses, and two takes of the same "Go." come back as
a question, a shout and a mumble. The writer sets the line's length deliberately inside that
range, and the unit that best describes the range is the human breath.

## Why the breath is the unit

A speech model learned its prosody from people talking, and people reset their pitch and their
energy at the boundaries where they breathe. A line that a person could say in one comfortable
exhalation — one short sentence, or two very short ones — is a line whose shape the model has
heard many thousands of times. A line that would need a breath in the middle is a line the model
must either breathe through, which it does badly, or flatten, which it does reliably. The breath
is also the listener's unit: from a sofa, through television speakers, over the game's own
sound, a player holds one idea per line and loses the second clause of a long one. A regular
beat helps as well; a line whose stresses fall evenly survives synthesis better than one whose
stress pattern is awkward even to a human reader.

So the budget is stated in two units with their basis: **ideas per line** (one) and **spoken
seconds per line** at the voice's natural rate, with a word count only as a proxy derived from
that rate. A budget written as "maximum twenty-five words" is a ceiling a writer will fill; a
budget written as "one idea, one breath, about two to four seconds spoken" is a description of
the line, and it produces a different script
([a budget shapes the output](../../../../_laws.md#a-budget-shapes-the-output)). The word proxy
carries its basis, because spoken length depends on the voice, the language and the content —
numbers, names and long words expand when spoken
([a number carries its unit and basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Every sentence boundary costs time, and the voice sets the price

Spoken seconds are not words divided by a rate. Each sentence boundary is a pause, and the
length of that pause is a property of the voice and its settings, not of the text: one voice
holds a full stop for a fifth of a second, another — often one cast or tuned to sound hesitant —
holds it for most of a second. A line of fourteen words in five sentences can therefore render
at twice the length of a line of fourteen words in two, and on a slow-pausing voice it can be
more silence than speech. The rule that splits a long sentence in two must not become a rule
that splits a line into fragments: two sentences reset the pitch; five sentences stall it. Learn
each voice's pause per boundary from its first renders and write its lines to that price.

## The floor matters as much as the ceiling

Very short lines are where synthetic voices are least predictable, because the model has no
sentence to read a manner from, and engine guidance itself warns that very short inputs render
less consistently. When a line must be very short — a warning, a name called out, a single
command — give it a shape that fixes the delivery: a terminal mark rather than nothing, a second
short word that tells the model what kind of utterance it is ("Move. Now." rather than "Move"),
or the character's own word rather than a neutral one. Render several takes of a very short
line and choose, because its variance is high and one good take may be luck.

## Procedure

1. **State the budget before writing,** per line class: mid-action bark, between-rounds line,
   scene dialogue, narration. Mid-action lines are shorter than between-rounds lines, because
   they compete with the game's sound and the player's eyes.
2. **Write one idea per line.** A line with a "but", an "and then" or a subordinate clause
   carrying a second fact is two lines, or one line that has lost its second fact.
3. **Split a long thought once, at the sentence boundary,** not with a chain of commas and not
   into a string of fragments.
4. **Give very short lines a shaping word or mark** so the delivery is not left to chance.
5. **Render and time the line** against the budget, using the voice's own pause per boundary. A
   clip far above the budget was written too long or too fragmented; one far below it may have
   dropped words or rushed.

## Decision rules

- When a line renders rushed or flat and is longer than a breath, split it once before trying
  anything else, because length is the most common cause and splitting costs nothing.
- When a line renders far longer than its words on a voice that pauses long, merge fragments
  into fewer sentences before cutting words, because the time is in the boundaries.
- When a line must carry two facts, write two lines and let the second follow after a beat,
  because a listener on a sofa takes the first and loses the second.
- When a one- or two-word line varies between takes, add a shaping word or terminal mark, and
  accept it only after hearing it consistent across several takes.
- When a generator drafts the lines, put the budget, the voice's pause price and the engine
  generation in its brief, so the drafts arrive speakable rather than being cut afterwards.

## When not to use it

System callouts — a countdown, a lap number — are fixed interface sounds and are judged by
clarity alone. Long-form narration rendered in chunks has its own seam problem, owned by the
production of multi-speaker speech, and a chunk is not a line.

## Evidence status

The one-breath unit (about six to fourteen words) and the warning that very short inputs are
less stable come from a game-dialogue research dossier that drew them from one speech vendor's
published best-practice pages (primary for that vendor's models) and, for a numeric
minimum-length figure, from a search excerpt the dossier itself marks unconfirmed; that figure
is deliberately not repeated here. The claim that a regular beat survives synthesis is the
dossier's own heuristic. The pause-per-boundary lesson is an upward lesson from one project's
voice measurements: across fourteen lines on two voices, the longest pause in a line ran about
0.4 to 1.1 seconds on the voice cast and tuned to sound nervous against at most about 0.5 on
the other, its silence share ran about 18 to 56 percent against 0 to 20, and its most fragmented
line failed a silence ceiling. The two voices differ in both identity and settings, so which of
the two sets the price is not separable from these data; it is one take per line on one engine
generation, an observation and not a controlled study, and none of this has been tested in a
played game yet.
