---
layer: technique
type: technique
subject: edge-queue-policy
technique: eviction-priority-classes
status: forged
laws: [verdict-survives-boundary, creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [a bounded channel carries more than one kind of message, deciding what a full queue sacrifices, a stalled consumer's queue fills with markers]
---

# Eviction priority classes

At capacity, the queue does not choose a *position* to sacrifice; it chooses a
**class**. Position — oldest, newest — is a tiebreak inside a class, and a
policy expressed only in positions will eventually evict the one message the
system could not afford to lose.

## The ladder

Three classes cover the traffic on a standing edge, and the ladder is ordered by
what a loss costs a peer:

1. **Ordinary** — a sample of a continuing signal: a frame, a pose, a reading,
   a chunk of output. Its successor supersedes it, its loss costs freshness
   only, and it is the class the queue exists to spend. Sacrificed first, and
   silently: counted, never logged per occurrence.
2. **Correlated** — one half of an exchange a peer is blocked on: a reply to a
   request, a result or status for a goal, the terminator of a session. Its
   loss is not a lost sample but a **peer stranded in a wait with no other
   terminator**, and nothing downstream will synthesise the missing end.
   Sacrificed last, and loudly — at error level, with the correlation identity
   in the record, because the only repair available to an operator is to know
   which exchange died.
3. **Lifecycle** — the stop signal, and the transitions that end or restart an
   edge. Never sacrificed. A queue that drops the stop signal to make room for
   a frame has traded a recoverable backlog for a process that will not exit.

The drop order that follows is mechanical. At capacity: evict the oldest
ordinary message; if none is queued, refuse the **incoming** message when it is
ordinary — a subtlety worth stating, because the freshness argument for
drop-oldest applies only within a class, and the incoming ordinary message is
worth less than any queued correlated one. Only when nothing ordinary exists on
either side is a correlated message dropped, and the lifecycle class is not in
the search at all.

## The class travels with the message

The class is assigned where the message is constructed, by the code that knows
what it is, and it travels as a typed field
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
The alternative — deriving the class at the drop site by inspecting the
payload, matching a metadata key, or checking whether a correlation identifier
is present — puts a parser in the hottest and least tested path the queue owns,
and gets the answer wrong for exactly the message kind that was added most
recently. A misclassification here is not a slow path; it is a dropped reply
that reads as a hung peer three services away.

A corollary for anyone extending the message vocabulary: adding a kind means
placing it on the ladder. A new kind that lands in "ordinary" by default is a
new kind the queue will discard first, which is the right default only if it
was actually considered.

The predicate that reads the class has exactly one home, and that home is the
**shared message definition** rather than the queue. Send side, receive side,
eviction guard, flush path and the diagnostic that logs a correlated drop all
ask the same function what class a message is; a local copy of the key list
inside the queue is a copy that stops agreeing the day a correlation key is
added, and the failure it produces is a message silently dropped by the one
component that did not learn about the new key. The same discipline covers the
step before it — which message shapes carry a class at all — so the guard and
its diagnostics cannot disagree about whether a given message was classifiable.

## The tombstone leak

Eviction from the middle of a queue is often implemented by leaving a marker in
place — a tombstone, a cancelled slot, a placeholder that keeps positions
stable for a reader holding an index. The marker is cheap and it occupies
capacity, and that combination is a leak with a specific and nasty shape:

A consumer that has stopped reading is the exact condition in which eviction
runs continuously. Every incoming message evicts an older one and leaves a
marker; the markers are never consumed because nothing is consuming; the queue
fills with markers, reaches capacity with **zero deliverable messages in it**,
and then begins refusing or evicting on a queue that is, in every sense the
consumer cares about, empty. Symptom: a stalled consumer whose input reports
full and which delivers nothing when it recovers.

The rule is therefore: **compact on the drop path, not on the read path.**
Whichever code removes a message also removes the markers it can see, because
the read path is precisely what has stopped running in the failure this
protects against. Every slot is created by an admission and released by a named
step — delivery, eviction, flush, or compaction — with none left to a sweep
nobody scheduled
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

The better design avoids the marker entirely where the reader does not need
stable indices; a queue that supports removal from the middle without leaving
residue has no leak to compact. Reach for tombstones only when an index must
survive, and then treat their compaction as part of the eviction, not as
cleanup.

## Testing the ladder

The ladder lives in an intersection that ordinary coverage misses. A depth
bound is easy to test and a message-class taxonomy is easy to test, and both
suites pass in full without ever constructing a queue that is *full* and
*mixed*. Three cases have to exist deliberately:

- a full queue of ordinary messages receiving a correlated message, asserting
  which one is present afterwards;
- a full queue of correlated messages receiving an ordinary message, asserting
  that the arrival is the one refused;
- a full queue receiving the stop signal, asserting that it is delivered and
  that something ordinary is not.

An implementation that has never run these has not chosen an eviction policy;
it has inherited whichever one its data structure implies.

## When a ladder is the wrong instrument

Where every message on the edge is the same class — a pure sensor stream, a
pure log — the ladder is ceremony and drop-oldest on position is the whole
policy. Where the classes need genuinely different *depths* rather than
different priorities, they want different edges; a ladder inside one queue
cannot express "keep the last hundred readings and every command". And where
the queue's entries are work items each owed an execution, this ladder does not
apply at all: sacrificing one is breaking a promise, and the discipline for
that lives with executor admission, which refuses at the door instead of
evicting from the middle.
