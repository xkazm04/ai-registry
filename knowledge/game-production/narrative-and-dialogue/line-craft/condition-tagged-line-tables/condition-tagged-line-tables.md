---
layer: golden-path
type: golden-path
subject: condition-tagged-line-tables
status: forged
use_when: [making characters react to play without authoring a branch per situation, a reactive line repeats until players mock it, deciding how many lines a pool needs and what may stand in for the rest, designing the data format writers will fill with lines]
techniques:
  - most-specific-match-wins
  - react-to-what-the-player-caused
  - repeat-avoidance-by-recency-and-cooldown
  - signals-stand-in-for-lines
  - losing-yields-new-story
  - line-table-schema
---

# Condition-tagged line tables

A character who comments on what just happened is the cheapest way a game has of seeming to
notice its player, and the most expensive way of seeming not to. The comment either names
the thing the player did — the overtake on the last bend, the third loss to the same rival,
the shortcut nobody else takes — or it says something that would have been true of anyone,
and players hear the difference inside a single session. The craft this subject owns is the
machinery that makes the first kind affordable at scale: lines stored as rows in a table,
each row tagged with the conditions under which it may be said, a query at runtime that
gathers what is currently true, and a selection rule that hands the moment to the line that
fits it best.

It is deliberately not a branching conversation. A branching conversation is sequenced — one
node leads to the next, and the author controls the order. A line table is *queried* — the
game raises an event, the table answers it, and the author controls only the conditions.
That inversion is the whole economic argument. A branch has to be written for every path
that reaches it; a row is written once and fires wherever its conditions hold, including in
situations the writer never pictured. It is also why the subject has failure modes a
branching graph does not: a table can repeat itself, can contradict itself, can say the
right thing about the wrong cause, and can fall silent in exactly the moment a player was
waiting to be noticed.

## The one distinction everything descends from

**Reactivity is paid for in facts, not in lines.**

A team that wants characters to feel aware asks for more lines, and gets a larger pool of
lines that are each as generic as the first. The lines are not where the awareness lives.
A line can only react to something the query can see, and the query can only see facts that
some system wrote down: who caused the crash, by what means, how many times this rival has
beaten the player, whether the player spared someone two chapters ago, whether this line has
already been said. A table with ten thousand lines over five facts is a table of five
situations said ten thousand ways; a table with three hundred lines over sixty well-chosen
facts is a character who notices things.

So the authoring order is facts first, events second, lines last. The first question about
any proposed reactive moment is not *what should the character say* but *what does the game
know at that instant, and who wrote it down*. When the answer is "nothing records that", the
line is unwritable however good the writer is, and the work belongs to whichever system owns
the missing fact.

## How selection works, and the property it buys

Every row names the event it answers and a set of criteria — predicates over facts, each of
which must hold. When an event is raised, the rows for that event are filtered to those
whose criteria all pass, and the most specific survivor wins: the row that demanded the most
of the situation and got it. A row that says only *the player won* always matches a win; a
row that says *the player won, against this rival, by less than a car length, after losing
to them twice* matches rarely, and when it does it outranks the general one
([most-specific-match-wins](./techniques/most-specific-match-wins.md)).

The property this buys is that general and special cases coexist without either knowing about
the other. A writer adds a running gag as one row with one extra criterion, and it pre-empts
the generic line exactly when it applies and never otherwise; nobody edits the generic row,
and nobody edits code. The cascade from special to general is also the table's safety net:
every event keeps a row with no criteria beyond the event itself, so that the answer to an
event is never *nothing* by accident. Silence is a legitimate answer, and when it is the
right one it is authored as a row that says nothing, not left as the absence of a match.

The naive reading treats specificity as a count of criteria and stops there. Count is a
proxy, and it fails in a predictable direction: three trivial criteria — the speaker, the
weather, the time of day — outrank one criterion that changes everything, such as *the
player just wrecked this speaker's brother*. A table that will carry story-critical rows
therefore declares a tier above the count, so that consequence beats decoration by
construction rather than by a writer remembering to pad the important row with filler
criteria.

Matching has one blind spot that no tier fixes: it chooses the best fit for the facts it can
see, and a climactic beat depends on things a query cannot see — what the player has just been
through, what was said a minute ago, what the next scene needs. A matched pick at a climax
lands worse than a placed line, and it lands worse in exactly the moments that matter most. So
the handful of beats that must arrive in order — the turn, the loss of something the player
built, the ending — are placed by sequence and never left to the table. The table owns the
many moments nobody can schedule and placement owns the few that must be scheduled; a design
that lets the table pick its fixed beats has traded its best moments for its coverage.

## The line must name the cause

The second distinction is between reacting to **state** and reacting to **cause**. *You are
in first place* is state: it is equally true of any player in first place, and it reads as a
dashboard read aloud. *You put me in the wall* is cause: it is true only because of what this
player did, and it is the line players quote. Cause lines need attribution facts — who did
it, to whom, how, by what margin, how long ago — and those facts belong to the system that
resolved the event, not to the dialogue layer, which must never re-derive them from
appearances ([react-to-what-the-player-caused](./techniques/react-to-what-the-player-caused.md)).

Attribution carries a sharper failure than silence. A character who thanks the player for
something the player did not do, or blames them for a crash they had nothing to do with,
has told the player the game is not watching — the opposite of what the line was for. So a
cause line fires only on a confident attribution, and an uncertain one falls through to a
neutral row; and a cause line has a freshness window, because a reaction that arrives after
the moment has passed reads as a bug rather than as attention.

## Repetition is the failure players actually notice

Players forgive a character who says too little. They do not forgive one who says the same
thing twice in a minute, and a reactive line that fires on a common event will be heard
hundreds of times across a game. Repetition control is not polish added at the end; it is
half of the selection rule ([repeat-avoidance-by-recency-and-cooldown](./techniques/repeat-avoidance-by-recency-and-cooldown.md)).

Four mechanisms with four different jobs carry it. Recency keeps a line from returning until
its siblings have had their turn. A cooldown keeps a whole row from firing again inside a
stated interval. A talk budget keeps the character from speaking at all more often than a
person would. And a once-only or sequenced row turns the repetition itself into content — the
second time the player does the same thing, the character says *again?*, and the repeat has
become the joke rather than the flaw. Each of these numbers carries its clock: seconds of
play, events, races, sessions or the whole save are different units, and a cooldown written
without one is not a rule
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

The price of getting this wrong is not one worn-out line. A voice that repeats often enough is
a voice players learn to switch off, and once they have muted it or learned to stop listening,
every line in the table — the rare and good ones included — is spent with it. Repetition is
also heard at the level of phrase and idea, not only of whole lines: five synonyms for *watch
out* are one line to the ear, and a distinctive phrase that two characters share makes both of
them sound repeated.

The size of a pool is a calculation, not a feeling. How often the event fires, how long a
session runs, and how long a player will tolerate before a repeat together give the number
of lines a row needs; a row below that number will repeat on schedule, and the honest options
are to write more, to fire less, to let a less specific row absorb the overflow, or to let a
signal stand in.

## What you cannot afford to say, show

No table covers every state. Most of what a character feels from moment to moment — how
angry, how close to breaking, how much they respect the player now — changes continuously,
and continuous state cannot be voiced line by line. The craft is to split the work by kind:
**lines carry changes, signals carry levels**. A rivalry meter, a typeface that hardens as a
speaker loses patience, a colour on a name card, a portrait expression — each reads the same
fact a line would have read, costs nothing per occurrence, and keeps the hidden state the
table is querying visible, so the player understands why the lines differ
([signals-stand-in-for-lines](./techniques/signals-stand-in-for-lines.md)). A signal that does
not have exactly one meaning is noise, and a signal that disagrees with the line spoken over
it is a contradiction the player will believe over either.

## Where the content goes is a design decision

A table's content distribution follows its event frequencies unless someone decides
otherwise, and the default is backwards. The players who see the most failure events are the
ones struggling, and if the table's richest rows hang off victories, the struggling player
hears the thinnest, most repeated material in the game while the skilled player gets the
story. The rule this subject holds is that **losing yields new story**: every loss condition
has rows more specific than *you lost*, keyed to how and to whom and how many times, and some
content — a rival's grudging respect, a confidence, a scene — is reachable only through
defeat, so that a retry is never a rerun ([losing-yields-new-story](./techniques/losing-yields-new-story.md)).
The companion rule is about gating: story advances on *finishing* an attempt, and winning gates
rank and reward, so a difficulty wall can slow the player's progress without walling off the
story.
Budget follows frequency, and the most frequent outcome for the player who most needs a
reason to continue is the one the pool must be deepest for
([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)).

## The table is the interface between writers and the game

A line table works only if writers can extend it without a programmer, and that is a property
of its schema ([line-table-schema](./techniques/line-table-schema.md)). Rows carry a stable
identity, the event, the speaker and addressee, typed criteria over declared facts, a tier,
the line and its budget, the repetition rule with its clock, the facts the line writes when
it plays, and its production status. Facts are declared once in a dictionary with type,
domain, owner and lifetime; a fact nobody has written is *unknown*, never false, and a
criterion over an unknown fact fails rather than defaulting into a match
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

The schema is also where the table becomes checkable. Every criterion names a declared fact;
every declared fact is read by some row, or it is reported as ignored
([declaring-an-input-is-not-consuming-it](../../../_laws.md#declaring-an-input-is-not-consuming-it));
every event has a fallback; and every row has some reachable situation in which it wins. A
row that validates, is written, translated and recorded, and can never be selected because a
more specific row always shadows it, is content that compiles and is not wired
([compiling-is-not-wiring](../../../_laws.md#compiling-is-not-wiring)).

## The failure modes of the naive reading

The naive reading is that reactive dialogue is a writing job — write enough lines, tag them
roughly, pick at random — and it produces six recognizable pathologies.

**The dashboard narrator.** Lines react to state the HUD already shows, so the character
reads the scoreboard aloud. The cause facts were never recorded, so the writers had nothing
else to write against.

**The parrot.** A common event with a small pool and no recency rule. The line that was
charming on the first hearing is a meme by the tenth, and the meme is about the game, not
the character.

**The misattributor.** A cause line fired on an appearance — the rival crashed near the
player, so the player must have done it — and the character confidently says something
untrue. One of these costs more trust than a hundred silences.

**The shadowed gem.** The best-written special case never plays, because a dull row with
more filler criteria outranks it, or because its criteria name a fact nothing writes. It
passed every review, because every review read the text.

**The winner's script.** Story hangs off victories; the struggling player loops the same
loss line and the same restart, and leaves.

**The mumbling meter.** A signal added to cover missing lines that means three things — a
colour for anger, for low health and for a rival — so the player learns to ignore it, and the
cheapest channel the game had is spent.

## Where this subject stops, and what stands next to it

**Against branching narrative graph validation.** That subject owns sequenced conversation:
nodes, guarded edges, reachability from an entry, endings that must be attainable, choices
that must change state. This subject owns queried lines: rows that answer events with no
author-controlled order. The rule for picking is whether the next line depends on the line
before it. When it does — a scene, an exchange, a negotiation — it is a graph and the
neighbour proves it playable. When the line is chosen afresh by matching the current facts,
it is a table and this subject owns the matching, the repetition and the coverage. The two
share the discipline of declared state, and a table row may raise an event that starts a
graph, but a reachability walk over a graph says nothing about whether a table row can ever
win, and a specificity rule says nothing about whether a graph can reach its ending.

**Against agent behaviour authoring.** That subject owns what an agent decides and on what
knowledge, and the decision trace that proves it decided. A speaking agent's remark is
downstream of that decision: the agent chose to ram, and the table chooses what it says about
having rammed. The rule is that the agent layer decides *what to do* and emits the event and
its facts; this subject decides *what is said about it*, by whom, and whether it was said
recently. A bark is not a behaviour, and a trace showing the agent decided is not evidence
that the line it should have spoken exists, can be selected, or did play.

**Against spatial audio scene authoring.** That subject owns playback rationing for sound
events — priority bands, concurrency, cooldowns in milliseconds, who dies when the voice
budget binds. This subject's recency and cooldown rules live one layer earlier and answer a
different question: not whether a sound may play now, but which line, if any, should be
attempted, and whether its content has been heard too recently. A spoken line passes both
gates, and the two must not be collapsed into one cooldown, because an audio cooldown
prevents a buzz and a dialogue cooldown prevents a bore. The seam to keep explicit is
interruption: when the audio layer steals a voice mid-line, the dialogue layer must learn
that the line did not finish, or its memory records as said a line nobody heard.

**Against the short-form writing craft.** The craft of the line itself — its length, its
voice, how a three-second bark lands and how it survives being heard often — sits with the
sibling subject on short-form cards and barks. This subject assumes good lines and owns the
machine that chooses between them.

## The path, in order

1. **List the facts before the lines.** For each reactive moment, name what the game knows at
   that instant, who writes it, its type and its lifetime. A moment with no fact behind it is
   a request to another system, not a writing task.
2. **Separate the placed beats from the matched moments.** The few beats that must land in
   order are sequenced outside the table; everything else is declared as an event with a
   fallback row — the generic answer, or an authored silence — before any special case is
   written.
3. **Write cause rows before state rows**, and gate each cause row on a confident attribution
   and a freshness window.
4. **Size each pool from its fire rate**, then set recency, cooldown and talk budget with
   their clocks named, and decide what a row does when it is exhausted.
5. **Route continuous state to signals**, each with one declared meaning, and keep lines for
   changes.
6. **Audit the distribution by outcome**, and deepen the loss rows until a struggling player's
   tenth retry still hears something new.
7. **Lint the table on every save** — undeclared facts, unread facts, events without
   fallback, rows that can never win — and treat a row nobody has seen selected as unproven,
   however good its text.
