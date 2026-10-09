---
layer: technique
type: technique
subject: condition-tagged-line-tables
technique: react-to-what-the-player-caused
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [characters comment on play but it feels generic, deciding which facts an event must carry for dialogue, a character blamed the player for something they did not do]
---

# Reacting to what the player caused

The named concern: make reactive lines answer the player's own actions rather than the
state of the game, so that a line is true of this player and this moment and would have
been false of anyone else. The lines players remember and repeat to each other are of this
kind. The lines they mock are the other kind.

## State lines and cause lines

A **state line** reacts to a condition: the player is leading, health is low, the timer is
nearly out. It is true of every player in that condition, and the game already shows the
condition on screen, so the line adds a voice to a readout. A **cause line** reacts to an
act and its author: the player overtook this rival on the inside, the player let the wounded
driver go, the player took the same shortcut for the third race running. It is true only
because of what this player did, and it is evidence that the game was watching.

The rule is to write cause rows first and to let state rows exist only as fallbacks. A table
whose most specific rows are all about state has spent its specificity on things the
interface already says.

## What the event must carry

Cause lines are only as good as the attribution the event carries, and the attribution is
the expensive part, not the line. An event that will feed reactive dialogue carries: the
actor and the target; the method, from a small declared vocabulary (rammed, overtook,
blocked, spared, ignored); the margin or severity where it is meaningful; and the time of the
act, so freshness can be judged. The speaker's memory adds the history: how many times this
actor has done this to this target, and when the last one was.

Attribution is resolved by the system that resolved the act — the collision resolver knows
who struck whom, the race logic knows who overtook whom. The dialogue layer reads that
answer and never re-derives it from appearances, such as which car was nearest when another
crashed ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). Two
systems with two opinions about who caused a crash will eventually disagree, and the
disagreement will be spoken aloud by a character.

## Confidence and freshness

A misattributed cause line is worse than no line. A character thanking the player for a rescue
they did not perform, or accusing them of a foul they did not commit, tells the player the
game is guessing. So attribution carries a confidence — certain, likely, ambiguous — and
cause rows require the confident value; an ambiguous event falls through to a state row or
to silence. When the resolver cannot give a confidence, treat every attribution as ambiguous
until it can.

The gate binds the claims a player can check, and the sharpest of those is what the player
did. A speaker announcing its own intention, as in *flanking left* or *I'm going for the
leader*, is not an attribution. It may run ahead of what the agent actually does, and players
credit a voiced intention with more than the game performed. Holding such lines to the
confidence gate silences the cheapest legibility the game has.

Freshness is the second gate. A reaction is legible only while the act is still in the
player's mind, which in fast play is a few seconds and in slow play may be a scene. Every
cause row states the maximum age of the act it answers, in a named clock, and a stale event
is not answered by that row. Age is checked when the line is about to be spoken, not when it
was chosen. A line that waited behind another re-queries its row, and a follow-up line is
chosen when its cue arrives, not when the exchange began. The usual failure is a line queued behind a talk budget or a
higher-priority speaker and delivered after the moment — a remark about an overtake that
plays half a lap later reads as a malfunction.

## Memory is what makes causes accumulate

The cheapest reactivity in any table is the callback: a line that answers the present act by
naming a past one. *That's twice now.* *You didn't do that last time.* Callbacks need the
speaker's memory to record acts with counts and times, and they need lines to write their
own facts back when they play — *the speaker has accused the player once* — so that the next
line can escalate rather than repeat. A cause recorded and never read is a missed callback;
an act that matters to a relationship and is never recorded is a callback nobody can write.

Every callback row has a fallback beneath it. The callback is a flag that may never have been
set — the player never did the planted thing — and the event must still be answered by the
row that does not need it.

Long-horizon causes — a choice made hours earlier, a rival spared a chapter ago — are the
most valuable lines per word in the game, because they prove memory across the gap where
players assume none exists. They are also the most fragile: the fact must survive the save,
and its lifetime must be declared, or it will quietly reset at a session boundary.

## Decision rules

- **When a reactive moment is proposed, name the act and its author first.** If no system
  records who caused it, the proposal goes to that system's owner, not to a writer.
- **When attribution about the player is ambiguous, do not claim it.** Fall through to a row
  that does not assign cause. A speaker's own intention is exempt.
- **When a cause line could be delayed, give it a maximum age** and let a stale event lapse
  rather than play late.
- **When an act repeats, count it**, and give the row a sequence so the third occurrence is
  answered as the third.
- **When a line plays, write the fact that it played**, so later lines can refer to having
  said it.
- **When the same fact drives a line and a score, read it from the same owner**, so the
  character and the scoreboard never disagree about what happened.

## Evidence status

That players value lines showing the game is paying attention, and that a tally of who beat
whom is a cheap engine of it, comes from a studio creative director's own interviews, which the
dossier rates high. Memory-driven callbacks with a fallback line are a high-confidence pattern
across two primary studio accounts. The sharp split between state lines and cause lines, the
attribution owner, the confidence gate and the freshness window are practitioner judgement;
the sourced examples mix the two kinds (arriving low on health is reacted to as if it were a
cause), so the split is this document's standard rather than a sourced finding.

On 2026-10-09 a web lane over primary sources and a blind training-data lane bounded the
confidence gate independently. Both put it on claims about the player, because voiced
intention works on weak backing. The primary source for that is a shipped squad AI's own
postmortem. The rule to check freshness at speaking time is stated in the conference talk this
subject rests on. No source either way was found for the claim that a misattribution costs
more than a silence.

One field experiment measured the attribution rule
([kotlin application](../applications/kotlin--react-to-what-the-player-caused.md)). A dialogue
layer inferred who hit whom from per-frame damage totals, beside a resolver that recorded every
hit's author. The inference named the wrong author for a small share of spoken lines, and the
share grew with frame time. That is the rule's predicted failure, at a rate a hitch-prone
device can reach. None of it has been tested in a played game.

## When not to use this

Ambient chatter that sets a place — the crowd, the radio, the background argument — is not
about the player and should not pretend to be; tying it to player causes makes the world
revolve visibly around them. And where an act's attribution cannot be made reliable at
reasonable cost, cause lines for it should not be written at all; a smaller set of state
lines that are always true beats a larger set of cause lines that are sometimes false.
