---
layer: technique
type: technique
subject: declared-process-graph
technique: additive-live-mutation
status: forged
laws:
  - verdict-survives-boundary
  - identity-survives-reuse
  - creation-names-reaper
shared_with: []
use_when: [adding a node to a graph that is already running, removing an edge without hanging its consumers, a control-plane mutation reports success and nothing changed, a late subscriber waits forever on a barrier that already resolved]
---

# Additive live mutation

A topology that can only change by restarting the whole graph forces every change
into a maintenance window. The alternative is mutating the running graph, and it
is usually done badly because the obvious design — routing tables shared between
the event loop and a control-plane handler, guarded by a lock — puts a lock
acquisition on the hot path of every message and a deadlock in the failure mode
of every mutation.

The technique inverts it. **One loop owns the tables and is the only writer.** A
mutation is a message to that loop, applied between event dispatches, and it is
constrained to be **additive from the loop's point of view**: new entries are
inserted, existing entries are not rewritten in place, nothing currently being
read is mutated. No lock is needed because there is no concurrent writer, and no
reader is ever mid-traversal of a structure that changed underneath it.

## Addition

Adding a node means building everything it needs *before* anything routes to it,
then inserting the routes in one step: its own input tables, its queues, its
identity in the registry, its transport wiring, and only then the entries in
other nodes' output tables that name it. The reverse order opens a window in
which a producer routes to a consumer that has no queue, and the messages that
fall into it are dropped with no record — the mutation "succeeded" and the graph
lost data. Adding a mapping between existing nodes is the same shape and cheaper.
Because the insertion is a single write by the single writer, a message
dispatched before it takes the old table and one after takes the new one, and
there is no third outcome.

## Removal, which is not the inverse of addition

Removal has a step addition does not: **every dependent is told before anything
is purged.** A consumer of a removed edge is blocked on a channel; deleting the
routing entry leaves it blocked forever on a channel with no writer. So the loop
first delivers an edge-closed event to every dependent, on the same stream the
data was arriving on — where the consumer is already looking, rather than out of
band — and only then removes the entry and releases the queue. This is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) at channel
granularity: the edge's teardown names who is told, and in what order, when the
edge is created rather than when someone tries to remove it. Purge itself is
idempotent; a removal that finds a dependent already gone has achieved its
purpose.

**The purge is exhaustive over every table keyed by the node's identifier, and
the reason is identifier reuse.** Routing entries are the obvious ones and not
the dangerous ones. What ruins a system is the bookkeeping — the connected
marker, the open-input set, the pending-message buffer, the deadline table, the
subscriptions to synthetic inputs like timers and log streams, the entry in the
stored document. A leftover entry is not merely a leak: when the same identifier
is added back, and it will be because operators reuse names, the new incarnation
inherits the old one's state — looking already-connected before it has
subscribed, inheriting a subscription that marks it as never finishing, or
carrying a stale deadline rescanned on every tick for the life of the graph. Read
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) in the
direction people forget: not "keep the identity" but "do not let a dead entity's
state adhere to a live one wearing its name". The acceptance test is not removal;
it is **remove, re-add under the same identifier, behave as though the first
incarnation never existed**, in a loop so residue shows up as growth.

Removal has one legitimate in-place cousin: replacing a running node with a new
definition **under the same identifier**, safe exactly when the replacement
preserves the node's edges — the same input mappings, outputs covering every
mapped output — because then no dependent's wiring changes and no edge-closed
event is owed. It is all-or-nothing: a failed spawn leaves the current
incarnation running, never a hole where the node was.

## A mutation commits only on its own reply variant

A control-plane mutation travels as a request and comes back as a reply, and the
reply protocol usually has a generic acknowledgement — "received", "ok" — that
means the request arrived and was well-formed. It does not mean the node is
running, the tables were written, or the transport is up. Code that treats any
non-error reply as proof of commit has erased the verdict between the place it
was computed and the place it was acted on
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
the caller reports success, the operator believes the node is in the graph, the
loop believes nothing of the kind, and every later symptom is investigated as a
routing bug because the mutation is recorded as having worked. So: **one typed
reply variant per mutation, matched exactly.** Every other variant, including the
successful-looking generic one, is a failure of *this* mutation and is reported
with the variant that actually came back.

The same hole has a second face, and a system usually ships both: a mutation that
returns **no** reply. The handler does its work, sends nothing, the transport
layer reasonably drops an empty response, and the caller waits out its timeout
and reports a transport failure for a mutation that in fact applied. Absent and
generic are one defect — the verdict was never given a type of its own — which is
why the audit is per mutation rather than per failure report. A multi-machine
mutation adds one obligation more: a partial application is rolled back by
compensation, and the compensating path runs even when the trigger was a timeout
rather than a refusal.

## The readiness verdict is persisted and replayed

A graph starts behind a **readiness barrier**: nodes register, it resolves when
the declared nodes are present, consumers hold until it does. This is where live
mutation and startup collide, because after the first mutation there is always a
subscriber that was not there when the barrier resolved. A barrier implemented as
a broadcast at the moment of resolution serves exactly the subscribers listening
at that instant; everyone else hears silence, and silence is indistinguishable
from "not yet", so they wait forever. The verdict is therefore **stored and
replayed on subscribe**: any subscriber, at any time, gets the verdict as it
stands. When a barrier resolves as failed that verdict is **never cleared** — the
instinct to reset it so a retry has a clean slate produces the worst state
available, a node that arrives after a failed start, hears "pending", and waits
for a barrier that will never resolve again. A failure that expires turns back
into unknown, and unknown reads as "wait".

Two memberships, not one. The barrier has a **cohort** — the nodes the graph was
declared with — and the cohort is what gates it and inherits its failures. A node
added at run time is not in the cohort: it does not hold the barrier open and
does not inherit a startup failure it had no part in, but it does still *wait* on
the barrier, so it cannot begin producing before its consumers are listening. Two
corollaries, both usually learned the hard way: the cohort is recorded separately
from the set that drains as nodes report in, because a failure is a property of
the declared membership and the draining set is empty by the time you need it;
and the never-cleared failure record is still **scrubbed of a node that leaves
the graph**, or a remove-then-re-add poisons every later subscriber, naming an
identifier that is alive again by the time anyone reads it. Removal is for the
same reason a barrier transition in its own right — taking away the last node the
barrier waited for releases it exactly as that node's arrival would have, because
the removed process will never arrive to do it.

## Decision rules

- Express every mutation as an insert into a table with one writer. A change that
  cannot be expressed that way — a rewire replacing an entry — is add-then-remove,
  in that order, so no window exists with neither entry present.
- Validate the mutation path through the same door as the document: a node added
  at run time passes the same per-kind legality, numeric probing and port
  compatibility as one declared at start. A laxer second path is a second
  topology authority.
- Report the mutated topology from the loop's tables, never from the submitted
  request; and name in the response which dependents a removal told.
- When a mutation is refused, the graph is exactly as it was. A refusal that
  leaves residue is worse than a failure that leaves none, because the next
  attempt starts from a state nobody described.

## When not to use this

A graph whose composition is fixed at deployment and changes only with a release
does not need a mutation path, and building one adds a second way for the running
topology to diverge from the document. Restart is a perfectly good
topology-change mechanism when restarts are cheap and rare. And where a change
alters a node's **edges** rather than only its implementation, the in-place
replacement above does not apply: that is a removal and an addition, both visible
to dependents, and presenting it as an edit hides a discontinuity they need to
see.
