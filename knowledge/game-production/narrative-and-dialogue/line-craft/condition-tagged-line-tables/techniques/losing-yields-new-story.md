---
layer: technique
type: technique
subject: condition-tagged-line-tables
technique: losing-yields-new-story
status: forged
laws: [a-budget-shapes-the-output]
shared_with: []
use_when: [deciding where a reactive table's content budget goes, players quit after a run of defeats, a retry plays exactly like the last attempt]
---

# Losing yields new story

The named concern: make defeat pay out content, so that the player who loses most hears the
most, and a retry is never a rerun. The default content distribution of a reactive table runs
the other way, and the error is structural rather than a matter of taste: the richest rows
hang off victories because victories are what writers picture, and the player who sees the
most loss events is the one who most needs a reason to keep going.

## Why the default is backwards

A table's lines are heard in proportion to how often their events fire. For a struggling
player the most frequent events are losses, restarts and near-misses; for a skilled player
they are wins. If the loss rows are one generic line and the win rows carry the rival's
character, the struggling player hears the thinnest, most repeated material in the game at
the moment of greatest frustration, while the skilled player gets the story. Nothing about
that was chosen. It is what happens when content is written per outcome rather than budgeted
per expected hearing.

The rule is to budget by how often each outcome will be heard by the player who is meant to
hear it, which places the deepest pools on loss events
([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)).

## What a loss row keys on

A loss is not one event. The table distinguishes how the player lost (wrecked, outpaced,
cheated, by a hair, by a mile), to whom (a named rival or the field), how many times in a row
and how many times against this opponent, and what the player did on the way (led until the
end, never got close, took a risk that failed). Each is a fact the loss event carries; each
gives the table a more specific row than *you lost*. A loss by a hair to the same rival for the
third time is a different moment from a first wreck, and the line that treats them the same
tells the player the game was not watching the part that mattered to them.

## Defeat unlocks, not only costs

The stronger form of the rule is that some content is reachable only through losing. A rival
who has beaten the player three times says something they would never say to an equal. An ally
who sees the player lose offers the confidence they withheld from a winner. A scene, a piece of
history, a new route — some story beat sits behind a defeat condition, so a player who loses
has gained something a perfect player never sees. This turns the retry from a repetition of the
same attempt into a continuation, which is the difference between a player who tries once more
and one who stops.

The gating rule follows from it: the story between attempts advances on *finishing* one, and
winning gates rank, money and standing. A beat that waits behind a victory is a beat a
struggling player may never see, and a difficulty wall that also silences the story turns a hard
stretch into a reason to stop. When a beat genuinely depends on the result, it has two forms —
the one a winner sees and the one a loser sees — and neither is the lesser. The bound is the
arc's climax and ending. The canonical failure-as-story design gates those on success, and
rightly, because an ending reached without the win is a different ending. There the release
for a wall is an assist the player can turn on, not an ungated ending.

The retry itself is an event and gets rows. The framing before a second attempt acknowledges the
first, so the third retry reads differently from the first; a world that greets every attempt
identically tells the player their attempts are not part of the story. The attempt count lives
with the save. Kept in memory, it resets when the game is relaunched, and the player who quit
after a fourth attempt is greeted the next evening as if on the first.

The tone of loss rows also moves with the count. Mockery that lands on the first defeat grinds
on the fifth; the sequence should shift — from taunt, to grudging notice, to something the
player can use, whether sympathy or a hint carried in character. A struggle that has gone on
long enough is the right moment for a character to teach, and a line that teaches in voice is
the cheapest help system a game has.

## Auditing the distribution

The check is a census, not a reading. For each outcome class, count the rows and lines
reachable on it, weight by the expected hearings for the target player, and compare. A table
where a struggling player's expected new lines per hour falls toward zero after the first few
losses has the backwards distribution, however good its win material is. The same census
answers the retry test: replay the same loss five times in a simulated session and count how
many distinct lines were heard.

## Decision rules

- **When budgeting lines, weight each outcome by how often the target player will meet it**, not
  by how much the writer wants to write it.
- **When a loss event is raised, carry how, to whom and how many times**, and give the table a
  row more specific than the bare loss for each.
- **When a defeat count passes a threshold, unlock something** — a line, a confidence, a scene —
  that a winner cannot reach.
- **When losses repeat, move the tone**: escalate the rival, then soften, then help, rather than
  repeating the same mockery with a counter.
- **When the census shows new lines per retry dropping to zero, deepen the loss pools first.**
  Loss pools take the budget ahead of win pools. Where even that budget cannot fill a loss row,
  the thin-row options of repeat avoidance apply to it as to any row.
- **When a between-attempt beat is gated, gate it on finishing**, and leave winning to gate rank
  and reward. When the climax or ending waits on success, give the wall an assist rather than
  ungating the ending.
- **When a retry is counted, keep the count in the save.**
- **When a retry begins, answer the previous attempt** before the next one starts.

## Evidence status

That failure should be content rather than a wall is a high-confidence claim from two studio
leads in primary interviews, one about a game built around dying and restarting and one about
writing failure states in unusual depth. The warning that difficulty walls should not block
story comes from the same creative director. The retry acknowledgment rests on a fan-wiki
account of one game and a primary account of another, medium overall. The counter-example of
players rejecting a racing commentator's repetitive post-failure remarks is a low-confidence
community report. The budget-by-hearings census, the defeat-only unlocks and the tone sequence
are practitioner judgement. On 2026-10-09 a web lane and a blind training-data lane
independently bounded "story advances on finishing" at the climax and ending. The web lane read
the shipped scripts of the game built around dying, copied in a third-party repository: its
ending row requires a meeting reached only by clearing a run. A shipped table read the same day
kept its attempt count in memory
([kotlin application](../applications/kotlin--line-table-schema.md)). None of it has been tested in a played game for which this subject
was written.

## When not to use this

A game whose losses are rare and catastrophic — a single permanent failure at the end of a long
run — does not need deep loss pools; it needs one well-made loss scene. And defeat must not
become the better path: if the unlocked content is strong enough that players lose on purpose,
the rows have rewarded throwing the contest, and the unlock belongs behind a genuine attempt —
a close margin, a lead held until late — rather than behind any loss at all.
