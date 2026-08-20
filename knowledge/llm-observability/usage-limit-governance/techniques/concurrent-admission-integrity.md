---
layer: technique
type: technique
subject: usage-limit-governance
technique: concurrent-admission-integrity
status: forged
laws: []
shared_with: []
use_when: [caps must hold under concurrent ingest, choosing between locking and optimistic isolation for admission, batch ingest must not bypass a cap by packing]
---

# Concurrent admission integrity

Admission is check-then-act: read rolling usage, decide, insert. Under
concurrency that shape races by construction — two requests arriving
together both read pre-burst usage, both see headroom, both insert, and
the cap admits double at exactly the moment it was supposed to bite. A cap
that holds only under serial traffic is not a cap; bursts are when caps
matter.

## Why the obvious fixes fail

- **A plain transaction is not enough.** Under read-committed isolation,
  two concurrent admissions each read a snapshot that excludes the other's
  uncommitted insert; both pass; both commit. The transaction guarantees
  atomicity of each admission's own writes, which was never the problem.
- **Serializable isolation is enough and still wrong.** It converts the
  race into aborts: concurrent admissions for the same tenant abort each
  other, and every retry re-reads the whole window. A traffic burst — the
  common case, not the attack — becomes a retry storm on the ingest path,
  with tail latency exploding precisely under load. Correctness bought at
  the price of a self-inflicted outage is the wrong purchase.

## The fix: an exclusive section per accounting key

Make admission for one tenant a genuine critical section: an exclusive
lock keyed on the tenant, taken as the transaction's *first* statement and
released by commit or rollback. The second admission for the same tenant
blocks until the first commits, then reads usage that already includes it.
The properties to insist on:

- **Scoped, not global.** The lock key derives from the tenant, so
  different tenants never block each other. The cost of a same-tenant
  burst is latency — waiters queue, one commit per event — never lost
  enforcement and never livelock.
- **Leak-proof by construction.** Bind the lock's lifetime to the
  transaction, so a connection that dies mid-admission releases it
  automatically. A lock released by an explicit unlock call has a leak
  path through every early return and panic between acquire and release.
- **Deterministic key derivation.** The lock key is a stable hash of the
  tenant identifier — the same tenant maps to the same key from every
  connection and every deploy.
- **A total lock order.** If any path takes multiple tenants' locks (a
  mixed batch), take them in sorted order, always — even if today's
  batches are single-tenant by construction. Deadlock-freedom should be a
  property of the code, not of a usage pattern that someone will change
  without reading the lock module.

An embedded single-writer store gets the same guarantee more simply: the
store's own connection lock, held across the read-decide-insert sequence,
*is* the critical section — provided the usage read and the insert happen
under one acquisition, not two. Either way, evaluate the candidate by
folding its own contribution into the rolling total *before* comparing —
the question is "would the window including this event exceed the cap",
and evaluating the window without the candidate admits one event too many
at every boundary.

## The atomic-counter alternative, and when it is enough

The field's dominant substrate for plain rate limits is none of the above:
an atomic increment-and-compare on a shared in-memory counter, often with
the whole check-and-charge expressed as one atomically executed script.
When the admission question reduces to a single counter against a single
threshold, that is the right tool — no lock, no queueing, integrity by
the store's own atomicity. The critical section earns its extra cost here
because this subject's admission does not reduce to one counter: it is a
multi-rule evaluation over per-(window, scope) ledgers, with imputation
computed from the window's own contents and the event insert bound to the
same atomic decision. Squeezing that through an atomic counter means
maintaining a parallel counter per ledger and accepting that the counters
and the store of record can disagree. It also adds a second stateful
system to the admission path, whose outage forces a fail-open-or-fail-
closed choice that silently becomes part of the cap's semantics. Reach
for the counter substrate when throughput outgrows the locked store —
knowingly, as a re-architecture — not as a default borrowed from rate
limiting.

## Batches must count their own admissions

A batch of events through one request is the cheapest cap bypass ever
shipped: if each item is evaluated against usage that excludes its
predecessors in the same batch, a client under a near-exhausted cap packs
fifty events into one request and all fifty read the same pre-batch total.
The rule: **previously accepted items in a batch count toward later
items.** Run the batch in one critical section; let each item's usage
read see the batch's own prior inserts (in a transactional store, reading
inside the same transaction does this for free).

Per-item failure isolation then needs care: in stores where any statement
error poisons the enclosing transaction, wrap each item in its own
savepoint, so one duplicate-id conflict rolls back that item alone while
prior accepted items remain intact — and still counted by the items after
it. And keep the batch's outcome all-or-nothing at the commit boundary: if
the final commit fails, report every item failed rather than returning a
torn result the client cannot reconcile with what was actually stored.

## One verdict from many rules

Several rules can reject the same event — a hard breach and a graduated
shed, say. Derive the response from a precedence: a hard stop outranks a
shed, because its retry hint is the longer wait and the client must hear
the binding constraint, not the transient one. Mark on each evaluated
status whether *it* shed the candidate, so the rejection ledger and the
alerts attribute the decision to the right rule rather than to "limits".

## When the section is not worth it

The critical section serializes same-tenant admission; that is its point
and its cost. If the product's caps are advisory only — observe-and-alert,
nothing enforcing — the race merely mistimes an alert by one event, and
the lock buys latency for nothing: skip it until the first enforcing tier
ships. What is never acceptable is the middle posture — enforcing caps
whose enforcement holds only when traffic is polite. Bursts are not the
exception the cap can ignore; they are the reason it exists.
