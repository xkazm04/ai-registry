---
layer: technique
type: technique
subject: usage-event-ingestion
technique: dedupe-key-survives-soft-delete
status: forged
laws: [identity-survives-reuse, deletion-is-not-repair, limits-are-derived]
shared_with: []
use_when: [making a usage endpoint idempotent, choosing a deduplication key, deciding what deleting a billable event means, answering a duplicate submission]
stage: team
---

# The de-duplication key, and why deleting does not release it

An external emitter's delivery contract is at-least-once and cannot be made
anything else. **An emitter whose request timed out does not know whether the
event landed**, and its only correct behaviour is to send it again. Idempotence
at this door is therefore not a robustness nicety; it is the difference between
a customer's packet loss and a customer's over-charge.

## The key is minted by the emitter and carried

The key is a **transmission identifier the emitter chooses and can reproduce on
retry** — [identity minted once at creation](../../../../_laws.md#identity-survives-reuse),
not re-derived downstream. Two alternatives look reasonable and both fail:

- **A content hash** cannot distinguish two identical facts from one fact sent
  twice. Two API calls served in the same millisecond with identical properties
  are two billable events; only the emitter knows that. Hashing under-bills
  precisely the highest-throughput customers, and it does so silently.
- **A server-minted identifier** is unknown to the retrying emitter by
  construction, so it deduplicates nothing at all.

Make the field **required**, not optional-with-a-generated-default. A default
converts every emitter that forgot the field into an emitter with no idempotence,
and the failure surfaces as a billing dispute months later. Document that the
identifier must be stable across retries of the same fact and distinct across
distinct facts — most emitter bugs in this area are one of those two properties
missing, and naming both in the API reference is cheaper than diagnosing either.

## Uniqueness is enforced by the store

The constraint lives in the storage layer as a unique index over the natural
tuple:

```
(tenant, subject, transmission identifier)
```

Not a read-then-write in application code. That check races under exactly the
conditions it exists for: a retry storm, where the original and the duplicate
are in flight together and both read "not present" before either writes. Let the
insert fail against the constraint and translate the failure.

Three notes on the tuple's shape:

- **Tenant is in the key** because transmission identifiers are chosen by
  customers and two customers will choose the same one.
- **Subject is in the key** because it bounds the index and lets the same index
  serve subject-scoped lookups. The consequence is real and must be stated: an
  emitter that reuses one identifier across two of its own customers gets two
  events, not one. That is usually the right answer — they are different facts —
  but it is a choice, and it belongs in the API reference rather than in an
  index definition nobody reads.
- **A high-throughput lane that cannot enforce uniqueness on write** — a store
  built for scanning rather than for constraints — does not get to skip this. It
  deduplicates at **read** time instead: every query that reads events collapses
  repeated keys, keeping one row by a stated winner rule. That is slower per
  query and correct at every query, which is usually the better trade than a
  sweeper racing the aggregation.

### First-write-wins and last-write-wins are different products

The moment a lane deduplicates at read rather than at write, its duplicate
semantics **invert**, and almost nobody notices. A store-enforced constraint
means the first submission is kept and the second is refused: the emitter is
told, and a corrected re-send with the same key does nothing. A read-time
collapse ordered by ingestion time means the *last* submission is kept: the
emitter is told nothing, and a corrected re-send with the same key silently
overwrites.

Both are defensible. What is not defensible is having one of each and calling it
one contract, because the customer-visible behaviour differs in two ways they
will notice — whether a repeat is answered with an error, and whether a
correction by re-submission works. Write the winner rule into the API reference
per lane, and treat any difference between lanes as a divergence to be
documented and converged, never as an implementation detail.

## The duplicate response is terminal

Answering a repeat with something the emitter reads as retriable produces an
infinite retry against a door that will never accept it. Whether the terminal
answer is a success (kind: the emitter's state is already what it wanted) or an
explicit conflict (honest: the emitter learns it is retrying) is a taste
question. That it is **terminal, and never a server error**, is not.

In a batch submission the same rule applies per item. The response is per-item,
keyed by transmission identifier, so an emitter that sees a partial failure can
resend the whole batch safely — the already-admitted items deduplicate and the
failed ones are retried. A batch that must be all-or-nothing is a defensible
choice as long as the per-item report survives it; a batch that answers with one
undifferentiated failure forces the emitter to choose between losing good events
and re-sending bad ones.

### A batch can be a duplicate of itself

The failure that is missed by every design that only thinks about retries: **two
items in the same submission carrying the same key.** A bulk insert against a
unique constraint does not raise for this — it silently collapses the pair, or
skips the second, and returns a success count smaller than the number of items
submitted. The emitter is told everything landed, and one billable fact has been
deleted before it was ever stored.

The check is mechanical and cheap. **Compare the set of keys submitted against
the set of keys the store reports as inserted, and report the difference per
item**, at the item's position in the request, so the emitter can find the
offending pair. Doing it from the store's returned rows rather than from a
pre-scan of the payload catches both cases at once — the intra-batch duplicate
and the key that already existed — with one comparison.

## Deleting an event does not free its key

This is the part that is counter-intuitive, and it is the reason this technique
exists.

The intuitive rule is that a soft-deleted event's key becomes available again —
the row is gone, the tuple is free, a resubmission with the same identifier
should be accepted. Every part of that reasoning is about *your* record, and the
emitter is not looking at your record.

**Deletion is a correction of what you stored. It does not travel backward and
un-happen the emitter's transaction.** If the key is released:

1. Someone deletes an event — a mistaken submission, a test event in production,
   a correction after a support ticket.
2. The emitter's retry buffer, its replay tooling, or its at-least-once
   transport re-delivers the same transmission, hours or days later. It has no
   way to know anything changed; nobody told it.
3. The event is re-inserted, aggregated, and billed. **There is no signal
   anywhere that this happened** — the insert succeeded, the constraint was
   satisfied, the invoice is simply larger.

Excluding deleted rows from the uniqueness predicate is therefore
[deletion presented as repair](../../../../_laws.md#deletion-is-not-repair): the
row that recorded the defect was removed, and with it the only thing that would
have refused the replay.

So the constraint covers **all rows, deleted or not**. Mechanically that means
the unique index carries no partial predicate on a deletion marker — the easiest
thing in the world to add "as a fix" during an incident, and the thing to refuse.
It will look inconsistent beside its neighbours, because the *lookup* indexes on
the same table should exclude deleted rows (nobody wants to read them) while the
*uniqueness* index must not. Write the reason next to the exception or somebody
will harmonize it.

### The pre-check and the constraint must agree about deleted rows

Where a cheap read-then-write check exists in front of the constraint — as a
friendlier error message, not as the enforcement — it is usually written through
whatever query layer the rest of the code uses, and that layer very often hides
soft-deleted rows by default. The pre-check then says "this key is free", the
constraint refuses the insert, and the user gets whichever error the outer
rescue produces rather than the specific one the pre-check was added to give.

The constraint wins, which is correct; the lie is in the pre-check. Any advisory
check in front of a uniqueness constraint queries **exactly the row set the
constraint covers**, deleted rows included, or it is removed. A friendlier error
message that is wrong for the one case the technique exists for has negative
value.

### The price, and how to pay it

The cost is genuine and it should be written at the API boundary rather than
discovered:

- **A deleted event's identifier is permanently spent.** A legitimate
  re-submission of the same fact needs a *new* transmission identifier.
- **An emitter that wants to re-send after a correction must be told so
  explicitly.** They will not guess; their first symptom is a duplicate response
  for an event they can see is not there.
- **A true purge is an administrative operation**, separate from delete, audited,
  and used for the rare cases that genuinely require the key back — a test tenant,
  a compliance erasure. Making it hard is correct; making it impossible is not.

## The retention window is derived, not chosen

Uniqueness cannot be enforced over an unbounded history: the index grows with
every event forever, and a metered system's event table is its largest. So the
window over which duplicates are refused is bounded — and the bound is
[derived from a measured property](../../../../_laws.md#limits-are-derived), not
picked because it is round.

Derive it from the **longest realistic emitter retry horizon**: how long a
customer's transport, buffer or replay tool can hold an event before re-sending.
That is typically a small multiple of their outage tolerance, and it is a
question you can ask your largest integrators. Write the derivation beside the
number. Then state the consequence plainly, because it is a real hole: **a replay
older than the window re-bills.** If that is unacceptable for a customer class,
the answer is a longer window paid for with index cost, not a claim that it
cannot happen.

## When not to use this

- **When the emitter is your own code inside one transaction.** If usage is
  written in the same transaction as the thing it measures, the transaction is
  the idempotence and a separate key is ceremony.
- **When events are not billable.** Product analytics tolerate approximate
  de-duplication and can afford content hashing; money cannot.
- **When there is genuinely no delete path.** If events are append-only and
  corrections are made by compensating entries, the soft-delete question does not
  arise — and that design is a defensible alternative to this one, because it
  never releases a key by construction.
