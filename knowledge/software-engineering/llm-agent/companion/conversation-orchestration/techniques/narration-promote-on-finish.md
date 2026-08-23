---
layer: technique
type: technique
subject: conversation-orchestration
technique: narration-promote-on-finish
status: forged
laws: [failure-not-empty-success, derivation-names-recomputation, creation-names-reaper]
shared_with: []
use_when: [live progress disappears when a turn settles, an interrupted turn shows no account of what it did, the same trail is written twice on a re-observed settlement]
---

# Promoting narration at settlement

Live beats arrive on an ephemeral channel: a small in-memory list, owned by the
active turn, cleared when the next one starts. The trail a user reads a week
later lives in the conversation record. **Nothing joins those two unless
somebody writes it**, and the failure of not writing it is one of the quietest
in the whole surface — the turn narrates beautifully for four minutes, settles,
and its history shows a bare answer as though it had arrived instantly.

This technique is that write. It is worth stating separately from the
transcript's collapse-at-settlement discipline, which is a change of
presentation over a record that already exists. Here the record does not exist
yet. Promotion has the obligations of a write, not of a re-render: it must be
idempotent, it must have a defined behavior on every terminal path including the
ugly ones, and its absence must be distinguishable from a turn that genuinely
did nothing.

## The handoff, stated as a contract

At the moment a turn reaches a terminal state, the beats accumulated for that
turn are attached to the turn's durable record, and only then is the live
channel released. The ordering is not incidental: releasing first and writing
second loses the trail on any failure between the two, and the failure between
the two is exactly the case — an interrupted or crashed turn — where the trail
was most useful.

The live channel is a resource the turn created, and the turn's terminal
transition is its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). A channel
released by "whoever starts the next turn" leaks across a session that ends
without a next turn, and leaks *content* across threads when the next turn
belongs to a different conversation — a trail attached to the wrong exchange is
worse than a missing one, because it is read as true.

## Idempotency, because settlement is observed more than once

A terminal state can be seen twice: a stream's own completion event and a status
poll that resolves at the same time, a reconnect that replays the tail, a view
that remounts after a route change. A promotion that runs twice produces a
doubled trail, and a doubled trail is not merely cosmetic — it doubles every
count derived from it.

Make the write idempotent by construction rather than by ordering luck. Promotion
is keyed by the turn's identity and is a **replace**, not an append: writing the
same turn's beats twice yields the same record. Do not reach for a "already
promoted" flag held beside the record — that is a second authority for the same
fact, and it is the copy that will be lost on reload.

## Every terminal path promotes, and they promote differently

- **Success.** The trail is written and presented collapsed. The answer is what
  the user wants; the account is one line away.
- **Interrupted.** The trail is written and presented collapsed, and the turn is
  marked interrupted — a third state, distinct from success and failure. A user
  who stopped a turn after three minutes is owed the three minutes: what it got
  through is frequently the reason they stopped.
- **Failed.** The trail is written and presented **expanded**, or one obvious
  interaction from expanded, leading with the last beat before the failure. For
  a failed turn the process is the answer, and collapsing it hides the only
  useful thing the turn produced.
- **No beats at all.** The turn's record carries an empty trail, and the surface
  renders no trail. It does **not** render "0 steps", which is a measurement
  claim about work that was never measured
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
  the model that emitted no beats and the promotion that never ran must not
  produce the same artifact — the second is a defect and should be visible as
  one in telemetry even when it is invisible on screen).

## The summary is derived, and says so

The collapsed form is a short line — how many steps, how long, sometimes the
most notable action. Every part of it is **recomputed from the retained beats**,
never captured from whatever the live view happened to be showing at the end
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
The reason is concrete: the live view is windowed, so a summary scraped from it
counts the window rather than the turn, and the two disagree exactly on the long
turns where the summary matters most.

Where the retained record is **capped** — and a long agentic turn will produce
hundreds of entries that have no business becoming an unbounded blob in a user's
store — keep the newest entries, because the tail is what a reader wants from a
trail too long to show whole, and make the displayed count either the true total
(tracked separately from the retained detail) or visibly partial. A count taken
from a truncated list, printed without saying so, is the one place this
technique quietly lies.

Duration is a property of the turn, not of the beats — first token to terminal
state, or submission to terminal state, but one of them, stated once, and the
same one everywhere the product prints it. Two surfaces showing "how long it
took" with different endpoints is a bug report that nobody can reproduce.

## Re-opening history is not a replay

A settled conversation loads with its trails settled and static. Animating an
old trail as though its beats were arriving now re-runs theater over history,
and it destroys the one signal the live channel exists to give: motion means
*now*. The same rule covers the presence and the ambient surface — nothing about
loading old history may make the companion look busy.

## When not to use this

- **When beats are already durable.** If the narration source is a persisted
  event log the record already references, there is nothing to promote; deriving
  the trail from that log at read time is simpler and cannot drift.
- **When the conversation itself is ephemeral.** A throwaway thread with no
  persisted record has no destination for the write, and adding one to hold a
  trail inverts the cost.
