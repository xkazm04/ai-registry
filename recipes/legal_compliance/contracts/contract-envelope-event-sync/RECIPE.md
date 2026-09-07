---
name: contract-envelope-event-sync
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/contracts
---

# Contract envelope event sync

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A signature tracker updated by hand is out of date by definition, and the gap
is invisible: a contract stalled at the second signer looks exactly like one that went
out this morning, and a decline is discovered when somebody asks how it went. Wiring it
to the platform's events fixes the typing and introduces a subtler lie, because an event
that was never delivered and an envelope that has not moved produce the same silence.

**Input.** Status events from the platform the contract is out on, the envelope's own
current state read back from that platform, and the tracker the team already keeps.

**Core action.** Treat each event as a notification rather than as truth, read the
envelope back, refuse any write that would move the record backwards, and decide which
changes are worth interrupting a person over.

**Output.** A tracker somebody could act on directly: who each contract is with, what
stage it reached, how long it has been sitting there, and declines and stalls raised as
work rather than filed as rows.

## Activities

1. Take an envelope event as it arrives *(observe)*
2. Read the envelope's current state back from the platform rather than trusting the
payload *(observe)*
3. Refuse a write that would move the record backwards, and collapse a repeat into the
write already made *(decide)*
4. Write the tracker so it says what is true, including how long the envelope has been
where it is *(act)*
5. Route the change to the people it should interrupt, and only them *(act)*
6. Surface a decline, a withdrawal or an envelope that has stopped moving as work rather
than as a row *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The tracker says what is actually true of every contract, including the ones still
moving.**

- A status change is reflected without anyone entering it by hand.
- The same event arriving twice leaves the record exactly as the first one did, and does
  not create a second row.
- An event that arrives after a later one has already been applied is discarded rather
  than overwriting the newer state.
- A contract that has stopped at a stage is visible as stopped, with how long it has
  been there, rather than looking merely open.

**An envelope nobody has heard about is checked rather than assumed unchanged.**

- An open envelope that has produced no event for longer than the adopter expects is
  read back from the platform, because a delivery that failed and an envelope that has
  not moved look identical from here.
- A period where the delivery endpoint was unreachable is reconciled afterwards rather
  than leaving a hole nobody knows the shape of.
- A leg that fails does not fail the whole cycle: the writes that succeeded stay, and
  only the failed one is retried.

## Guidance

The event is a notification, not the state. Read the envelope back before writing,
because payloads are trimmed, repeated and delivered out of order, and the platform is
the only thing that knows what is true now. Never let a write move the record backwards.
The tracker's job is not to hold a status but to make it obvious what is stuck and for
how long, so record when a stage was entered, not only which stage it is. Escalate a
decline; do not merely file it.

## Where this is worth adopting

- A team running signatures out of one platform and reporting on them from a
  spreadsheet, where the two agree on the day somebody updated the spreadsheet and drift
  every day after.
- A deal desk where the question asked every morning is which contracts are stuck and
  with whom, and the tracker can only answer which are open, which is the question
  nobody was asking.
- An operation that discovered a decline three weeks late because it was written into a
  status column and never said out loud, and now wants declines treated as work rather
  than as data.
- A company whose signature volume has outgrown the person who was keeping the register
  current, where the risk is not that entries are wrong but that nobody can tell which
  entries are stale.
- Any adoption where the delivery endpoint will occasionally be down, since the
  difference between a well built sync and a brittle one is entirely in what happens to
  the events that arrived while nobody was listening.

## Connector types

`forms`, `spreadsheet`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[docusign](examples/docusign.md) for `forms`, [airtable](examples/airtable.md) for
`spreadsheet`.

## Recommended trigger

`event`. An envelope changing state is a real external occurrence and the value of
reflecting it decays within hours, so there is nothing to pace between events. Expect
adoption to pair this with an infrequent sweep of still open envelopes, not for
freshness but because a missed delivery and a motionless envelope are indistinguishable
from the receiving side, and only a read of the platform can tell them apart.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where the tracker lives and what its columns mean, since this work writes into a
  structure somebody else designed and a column repurposed silently is worse than a
  missing one.
- Which stages this adopter's contracts actually pass through, because review and
  countersignature steps differ per organisation and a stage the tracker has no room for
  gets flattened into the one before it.
- How long an envelope may sit at a stage before that is worth saying out loud, which is
  a judgment about this counterparty population rather than a constant.
- Which status changes deserve to interrupt someone and which are only record keeping,
  because a channel that announces every routine send stops being read before the first
  decline arrives.

## Dependencies

- A delivery endpoint the signature platform can reach, since this work only starts when
  an envelope event is delivered to it.
