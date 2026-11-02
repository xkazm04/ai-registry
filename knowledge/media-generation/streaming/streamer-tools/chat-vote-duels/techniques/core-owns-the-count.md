---
layer: technique
type: technique
subject: chat-vote-duels
technique: core-owns-the-count
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [a duel is shown in both a control panel and an on-stream overlay, deciding which process counts chat votes, building test chat or a demo mode for a vote tool]
---

# The core owns the count

A streamer's vote tool has more than one face. The control panel is where the streamer
opens a duel and watches it; the overlay is what the broadcasting software renders for
the room; there may be a phone view for a moderator. Each face is tempted to count,
because each one can see chat. The technique gives the count to **one authority** and
makes every face a renderer of that authority's snapshots.

## Why two counters always disagree

Two processes counting the same chat do not see the same chat. They connected at
different moments, so one missed the first seconds of the window. They reconnect
independently, so a dropped connection leaves a gap in one count and not the other. One
applies moderation as it arrives, the other on a delay. Their clocks close the window a
few hundred milliseconds apart. Every one of those differences is invisible in a quiet
test and visible on stream, where the streamer reads one number from the panel and the
room reads another from the overlay — and a viewer with a screenshot of both has
evidence of a rigged vote that is really evidence of an architecture.

## The shape

One process, the core, owns the duel. It consumes chat **after** the moderation layer,
applies the grammar and the one-per-viewer rule, assigns every line its status, holds
the window on its own clock, applies the tie rule, and produces snapshots: the totals,
the status buckets, the time remaining, and a version that increases with every change.
The panel and the overlay subscribe to snapshots and draw them; they never parse chat
for votes. Each face shows the version or the close time it last drew, unobtrusively,
so that a disagreement between faces is a stale subscriber with a diagnosable version,
not a mystery.

Inside the core, make the count a pure function: the moderated record of chat and the
window's open spans go in, totals and statuses come out, and the whole count is
recomputed from the record rather than incremented as lines arrive. An incremental
counter carries its history in memory, and a restart, a missed event or a reordered
delivery leaves it with a number nobody can reproduce; a recomputed count is the same
number for the live overlay, for the core after a restart, and for anyone auditing the
duel a week later.

Every snapshot replaces the whole duel state rather than patching it. A face that missed
updates during a reconnect draws the next snapshot and is correct; a face built on
deltas draws the next delta onto stale state and is wrong until it reloads. A face that
connects mid-duel is sent the latest snapshot at once rather than waiting for the next
change. A face that writes — the streamer's panel opening, closing or calling a duel —
sends each action once and never replays it on reconnect, and a reply that arrives after
the face disconnected or moved on is discarded rather than allowed to repaint the
picture.

The close belongs to the core. At the close it freezes the count, applies the tie rule,
marks the snapshot **final**, and stops accepting changes to that duel. Nothing after a
final snapshot — a late message, a replay of chat history on reconnect, a moderator
releasing a held line — alters it. A face that has not yet received the final snapshot
shows the duel as closing, never as decided.

When the core cannot read its own state — the store is unavailable, the duel is unknown —
the faces show that the duel is unavailable. A face that falls back to the last numbers
it drew, or to zeros, states a result the core never produced. On stream, an empty card
is the honest form of "unavailable": the overlay that loses its feed or receives a
snapshot it cannot parse clears itself rather than freezing on the last count.

Provenance travels with the count. Each ballot carries whether it came from real chat
or from a generator, and the snapshot carries whether any counted ballot was generated;
when one was, every face shows a simulated badge. Deriving the badge from the ballots
rather than from a mode switch means a rehearsal that leaks into a live session, or a
live session that was fed test chat, labels itself.

## The tooling obeys the same rule

**Demonstration counts are labelled.** A setup screen that shows a fake duel so the
streamer can see the layout is useful, and the fake count must carry its label —
"demonstration" — on every surface it reaches, including the overlay if the streamer
previews it there. An unlabelled demo count is one screenshot away from being taken as a
real result.

**Test chat and the parser share one producer.** The generator that synthesises chat for
tests and rehearsals has exactly one definition of a ballot line, imported by every lane
that needs one — the rehearsal driver and the regression that guards it — and that
regression feeds the producer's exact output through the authoritative parser and
asserts it counts. Better still, the producer builds lines from the parser's own token
list, so it cannot hold a different idea of the grammar. A generator with its own idea
of a ballot drifts in the most expensive way available: it writes the option's name
where the grammar wants its number, every generated line lands in "not a ballot", and an
end-to-end rehearsal runs a whole duel that closes at nothing to nothing and is first
diagnosed as a crash. The opposite repair — loosening the parser until the generator's
lines count — changes the room's grammar by accident.

## Decision rules

- **When a new face needs vote numbers**, it subscribes to the core's snapshots; it never
  counts chat itself, even "just for a preview".
- **When designing the snapshot**, send the full duel state with a version; let faces
  show the version they drew, and send the latest snapshot to a face as it connects.
- **When computing the count**, recompute it from the moderated record and the open
  spans; never keep it only as a running total.
- **When a face reconnects**, never replay its writes, and discard replies addressed to
  a picture it no longer shows.
- **When the window closes**, the core freezes, decides and marks final; nothing changes
  a final result.
- **When the core is unreachable**, faces say so; they never draw remembered or zero
  numbers as current.
- **When building a demo or test chat**, label the demo on every surface and generate
  ballots through the parser's own producer.

## When not to use it

A tool with only one face — a streamer who reads the count from the panel aloud and
shows nothing on stream — has nothing to disagree with, though a single authority still
costs little. When the duel runs on the platform's native poll, the platform is the
authority, and the tool's faces render the platform's result rather than computing their
own.
