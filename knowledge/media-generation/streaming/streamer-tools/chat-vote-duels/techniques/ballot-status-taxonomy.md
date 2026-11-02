---
layer: technique
type: technique
subject: chat-vote-duels
technique: ballot-status-taxonomy
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [explaining to a viewer why a vote did not count, reconciling a duel's total against the chat it read, testing a chat vote counter]
---

# Ballot status taxonomy

A counter that knows only "counted" and "dropped" cannot explain itself. Every dispute
about a chat vote is a question about a line that ended up in the drop bucket, and a drop
bucket has no reasons in it. The technique replaces the bucket with a **closed set of
statuses**, assigns every line the counter saw during a duel exactly one of them, and
makes the statuses add up to the lines seen.

## The statuses

The set is closed and each member names a reason a viewer would understand:

- **counted** — a valid ballot, the viewer's standing one at the close.
- **repeat** (first ballot stands) or **replaced** (latest stands) — a valid ballot that
  is not the viewer's standing one.
- **early** and **late** — timed outside the window's open spans.
- **not a ballot** — did not match the duel's grammar; ordinary conversation lands here.
- **ambiguous** and **unknown option** — named more than one contender, or one not in
  this duel; these exist only where the grammar can produce them, and under a
  first-word grammar of bare numbers they collapse into "not a ballot".
- **withheld** — moderation held or removed the line before the close; a held line
  released after the close is late, not counted. Split it as moderation does: a line
  still awaiting review and a line refused are different facts.
- **ineligible** — the author is outside the duel's declared voter set, where it has
  one.

A line delivered twice is not a status. It is the same line, collapsed by its message
identifier before any of this runs; counting it as a repeat would blame the viewer for
the transport.

Withheld ballots keep the side they would have counted for. The streamer's first
question when moderation removed a wave of spam is whether the wave leaned one way and
whether removing it decided the duel, and a per-side withheld count answers it without
anyone opening a log. Those numbers belong on the streamer's panel, never on the stream.

Order matters when a line could earn two: assign the first that applies in a fixed
precedence — outside the window, then withheld, then ineligible, then grammar (not a
ballot, ambiguous, unknown option), then counted, repeat or replaced — and write the
precedence down. Withheld before grammar matters: a refused line is withheld whether or
not it was a ballot, so the identity rule never sees it and a refused first ballot does
not use up the viewer's one vote. Without it, the same line is "late" in one build and "withheld" in the next, and
the buckets stop being comparable across duels.

## The reconciliation

Because every line gets exactly one status, **lines seen equals the sum of the buckets**,
and counted equals the number of distinct voters at the close. Check both on every
close. "Lines seen" must include the lines outside the window: a counter that filters
them out before classifying has a sum that reconciles by construction and proves
nothing about the lines it dropped — and early and late are exactly the statuses viewers
dispute most. A reconciliation failure means the counter lost or double-handled a line; it is a
broken duel, reported as such, not a footnote. A duel whose line log is incomplete — the
chat connection dropped for a stretch — reports the gap as its own fact beside the
statuses rather than pretending the lines in it never existed; a count made over a gap is
labelled as one.

## What the statuses are for

**Answering the viewer.** "I voted and it didn't count" has a one-word answer — late,
replaced, withheld — that the streamer or a moderator can give without opening logs. For
moderation the answer stays coarse: the status says the line was withheld, never why the
viewer was restricted, because that is between the moderators and the viewer.

**Watching the grammar live.** A spike in "not a ballot" while the window is open, made
of lines that are plainly meant as votes, is a grammar problem the operator can see in
time to say "just type 1 or 2". A spike in "unknown option" usually means the overlay is
still showing the previous pairing.

**Testing the counter.** Assert on statuses, not totals. A test that checks only "option
one got 40" passes when a late ballot was counted and a valid one dropped; a test that
checks every line's status catches both. Seed test chat with one line of every status so
that a counter that loses a category fails loudly.

## Showing them

The panel shows the buckets during and after the window; the overlay normally shows only
the counted totals, because the room is there for the race, not for the audit. Offer the
streamer a one-press view of the buckets for the moment a dispute arises on stream. Never
show per-viewer statuses on the overlay: a public "withheld" next to a name is a
moderation action announced to the room.

## Decision rules

- **When a line is seen during a duel**, give it exactly one status by fixed precedence;
  never let a line vanish.
- **When a duel closes**, reconcile lines seen against the buckets and counted against
  distinct voters; a mismatch fails the duel.
- **When the chat feed had a gap**, report the gap beside the result; do not count across
  it as if it were complete.
- **When writing tests**, assert per-line statuses with at least one line of every
  status in the fixture.

## When not to use it

A duel run on a platform's native poll exposes only the platform's totals, and the
statuses are not knowable; say so rather than inventing them. The taxonomy is also
overhead for a throwaway question the streamer reads by eye; it pays wherever a result
will be acted on, quoted, or carried into the next round of a bracket.
