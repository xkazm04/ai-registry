---
layer: technique
type: technique
subject: condition-tagged-line-tables
technique: repeat-avoidance-by-recency-and-cooldown
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output]
shared_with: []
use_when: [players quote a line back as a joke, sizing how many lines a row needs, a character talks too often or not at all]
---

# Repeat avoidance by recency and cooldown

The named concern: keep a reactive line from being heard so often that it stops being a
line and becomes a tic. Repetition is the failure players notice first and forgive last,
because a repeated line is evidence that the character is a machine. This technique owns
the rules that decide whether a line may be said again, and the arithmetic that says how
many lines a row needs before those rules can work at all.

## Four mechanisms, four jobs

**Recency** works inside a row. A row's lines are drawn without replacement — a shuffled bag —
so no line returns until its siblings have played, and when the bag is refilled, the line
heard last is barred from coming first. Pure random choice is the naive alternative and it is
worse than it sounds: a row of five lines drawn at random repeats the previous line one time
in five, which a player hears as the same line twice within a handful of events.

**Cooldown** works on a whole row, or on a group of rows that share a subject. After the row
speaks, it is ineligible for a stated interval, and selection falls through to the next
eligible row. Cooldown stops a fresh, specific row from dominating a stretch of play in
which its event happens to recur.

**Talk budget** works on the speaker and on the scene. A character speaks no more than so
often, and no two characters start speaking inside a minimum gap. Without it, each row's
cooldown can be correct and the scene still sounds like a crowd of radios, because many
correct rows fire together.

**Once-only and sequence** turn repetition into content. A once-only row is spoken at most
once in a declared scope — the race, the session, the save — and is the right home for
anything that would be absurd twice. A sequenced row answers the first, second and third
occurrence of an act with different lines, and its last step can acknowledge the repetition
itself: the third time the player does the same thing, the character says so. A repeat the
character notices is characterization; a repeat the character does not notice is a defect.

## What counts as the same line

Recency works on what the ear hears, not on what the table stores. Five lines that are synonyms
— *watch out*, *look out*, *careful* — are one line drawn five ways, and a pool of synonyms is a
pool of one however many rows the spreadsheet shows. Each line in a row takes a different angle
on the moment, and distinct lengths help, because repeats that share a rhythm are heard as
repeats before their words are. The same holds across rows: a distinctive phrase two characters
share, or one character uses in two pools, makes both sound repeated. Runtime recency cannot see
this, so it is a write-time check — a ledger of key phrases by speaker and pool that new lines
are compared against before they are accepted.

The memorable lines wear out first. A line with a strong image or a joke is remembered after one
hearing and recognized on the second, while a plain line survives many. So the standout in a
pool is rationed: a low weight, a long cooldown, and often a once-only scope, so that it stays an
event rather than becoming the line players quote back at the game.

## Every number has a clock

Each of these limits is counted on some clock, and the clock is part of the number: seconds
of play, events of this kind, races, scenes, sessions, or the life of the save. *Cooldown 3*
is not a rule until it says three of what
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
The clocks also differ in what survives a restart. Recency and once-only state that lives
only in memory resets when the game is relaunched, so a player who plays in short sessions
hears the same opening remark every evening. The rule is that any limit counted in sessions or
saves is persisted with the save, and any limit counted in seconds or events is allowed to
reset.

## Size the pool from the fire rate

How many lines a row needs is arithmetic, and the inputs are knowable before a word is
written. Estimate how often the row's event fires per hour of play for the player it is
written for, how long a typical session runs, and the shortest interval at which a repeat is
tolerable for that kind of line — short for crowd noise, long for a named character's remark,
infinite for a joke. The tolerable interval is best stated in hearings rather than minutes,
because what protects a repeat is the player's forgetting: a line that returns only after
some twenty or thirty encounters of its kind is usually not recognized at all, while the same
line returning on the next encounter always is. A row needs roughly enough lines to fill the tolerable interval at its
fire rate after cooldowns are applied; below that it will repeat on a schedule players can
feel. The estimate is a budget, and it shapes what gets written: a writer handed *write lines
for the crash event* writes eight, and a writer handed *the crash event fires forty times an
hour and a repeat inside twenty minutes is noticed* writes a different table
([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)).

When the arithmetic says a row cannot be filled affordably, there are four honest options, and
writing a few lines and hoping is not one of them: fire less (a probability or a longer
cooldown on the row), absorb the overflow into a less specific row that has a deep pool,
answer the excess with a signal instead of a line, or accept an authored silence.

## Exhaustion

When every line in a row is barred, the row is exhausted, and selection falls through to the
next eligible row. A row is never refilled early to avoid falling through, because the
fall-through is the point. The one exception is a fallback row with nothing below it; there,
refill the bag, still barring the line heard last, or answer with silence if the event can
bear it.

## Interruption counts

A line can be cut off: by a higher-priority speaker, by the audio layer stealing its voice,
by the scene ending. Decide whether a line counts as used when it starts or when it finishes,
and decide it once. Counting on start keeps the table from repeating a line the player half
heard; counting on finish keeps a once-only line from being lost to an interruption. Story-
critical once-only rows count on finish and are re-queued if cut; everything else counts on
start. Either way the dialogue layer must be told that an interruption happened — a line the
memory records as said and the player never heard is a gap nobody will find by reading logs of
what was selected. The cheaper protection is at writing time: a line that is likely to be cut
either still makes sense if it stops halfway, front-loading what the player needs, or carries a
short cut-off variant the table can fall back to.

A row that parrots does not lose one line; it loses the speaker, because players who tire of a
voice stop listening to all of it. Failure commentary goes first, since failure is frequent.

## Decision rules

- **When a row has more than one line, draw without replacement** and bar the last line from
  opening the next bag.
- **When an event recurs in bursts, put a cooldown on the row**, and let the burst fall
  through to less specific rows.
- **When several speakers share a scene, set a talk budget per speaker and a minimum gap for
  the scene.**
- **When a line would be absurd twice, make it once-only and name the scope.**
- **When an act is likely to repeat, sequence the row** and let its last step notice.
- **When a limit is counted in sessions or saves, persist it.**
- **When a row's arithmetic says it is too thin, reduce its fire rate or route its overflow**
  before commissioning more lines.
- **When a pool has a standout, ration it** with a low weight and a long cooldown.
- **When a new line is accepted, check it against the phrase ledger** for its speaker and every
  other pool.

## Evidence status

The principle that volume beats repetition, with repeats arriving only after some twenty or
thirty encounters, comes from a studio creative director's interviews and is rated high; the
reported figure is one studio's practice, not a measured threshold. The dossier's pool sizes
(four to eight lines for common triggers, two to three for rare) are rated medium and are not
derived from a fire rate, which is why this technique replaces them with arithmetic. Rationed
standouts, distinct angles over synonyms, the phrase ledger and cut-off variants come from a
practitioner guide to barks and the dossier's own checklist, secondary in strength. The
evidence that repetition costs the whole voice is a community report of players muting a
racing game's commentator, rated low and used here as illustration only. The clocks, the
persistence rule and the interruption rule are practitioner judgement. None of it has been
tested in a played game for which this subject was written.

## When not to use this

Lines the player summons on purpose — a prompt repeated on request, a tutorial reminder asked
for again — should repeat exactly; varying them makes the player wonder whether the
information changed. Systemic sound that is not speech, such as an engine note or an impact,
is rationed by the audio layer's own priority, concurrency and cooldown rules, which prevent a
buzz rather than a bore and use a millisecond clock this technique does not.
