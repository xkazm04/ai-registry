---
layer: technique
type: technique
subject: streaming-output
technique: sink-reversibility-decides-the-commit
status: forged
laws: [failure-not-empty-success, record-precedes-effect]
shared_with: []
use_when: [deciding whether a partial row may be shown before it is complete, one producer writes to both a re-renderable view and an append-only record, a reader signals "this is only a prefix" by appending text to the prefix, a record the producer really emitted leaves no trace in any sink, deciding what to replay to a surface that survived the disconnect, a resize must re-wrap history the surface no longer owns]
applied: code
ab_verdict: better
---

# Sink reversibility decides the commit

The rest of this subject answers *when the content is safe to show*: how far
back the producer can revise, and therefore how far behind the frontier the
display cursor sits ([emit-behind-the-revision-window](./emit-behind-the-revision-window.md)).
That question has a companion nobody asks out loud, and it has the opposite
shape. Not *will this change?* but **if it changes, can I take back what I
already showed?**

The two are independent. A producer with an unbounded corrector feeding a
surface that repaints from a model loses nothing by rendering at the frontier —
the next paint replaces the last, and the user sees a draft improving. A
producer that never revises at all, feeding a sink that can only append, still
cannot show a prefix if the prefix might later need to be *read as a whole
record*, because there is no second write in which to correct it. The first
case licenses everything and the second licenses almost nothing, and the
difference is not a property of the producer, the content, or the latency
budget. It is a property of the sink.

## Reversibility is a property of the sink, and nothing probes it

Capability models in this area are built around what the *producer* supports
and what the *protocol* still guarantees. The sink is usually typed by what it
is for — display, record, store, forwarded copy — and by what it executes,
never by whether a write to it can be withdrawn. So the question gets answered
by whichever assumption the first implementation happened to hold, and that
assumption then propagates to every sink added afterwards.

Name it explicitly, per sink, in the sink inventory:

| | **Reversible** | **Irreversible** |
| --- | --- | --- |
| what it is | a view derived from a model the writer owns and can repaint: a keyed row list, a grid the program fully redraws, a document re-rendered from its source | a surface the write leaves and does not come back from: an append-only record, a line handed to a host-owned scroll history, a forwarded copy, anything a reader may already have consumed |
| showing a partial | free — the next paint replaces it | a commit |
| retracting | a repaint | impossible; the best available is a later correction that does not hide the first write |
| what "commit" means | the moment the writer stops deriving the row from the live buffer | the moment of the write |

Two ordinary mistakes follow from leaving it implicit. A writer that believes
every sink is reversible retracts content from one that is not, and the record
disagrees with itself. A writer that believes every sink is irreversible holds
back a reversible surface to a latency it never needed to pay — which looks
like caution and is the reason a live view feels dead.

## One producer, two sinks: the in-band trap

The interesting case is not either sink alone. It is one producer feeding both,
which is the normal arrangement: the same bounded reader that fills a live view
also writes the durable record, and often the same string is handed to a
parser that turns it into events.

Here the producer has to say something the sinks need to know — *this is a
prefix, not a whole record* — and the cheap way to say it is to mutate the
prefix: append an ellipsis, a marker, a `…[truncated]`. That choice is correct
for exactly one of its consumers. A surface that only displays the bytes wants
a visible marker and has nowhere else to put it. A consumer that **parses** the
bytes is handed a record whose grammar the producer just broke, discards it on
its malformed arm, and the record vanishes — no partial, no error, no
placeholder ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
a record that arrived and left no trace is indistinguishable from one that
never arrived, and the user watched this one arrive).

The rule is therefore not "hold the prefix" and not "mark the prefix". It is:

> **The clip travels beside the bytes, never inside them.** The producer
> reports *that* it stopped short, *why*, and *how much exists*; each sink then
> applies its own policy. The display sink appends the marker itself. The
> parsing sink refuses the prefix as a record and surfaces it as a counted
> anomaly instead of dropping it.

Out of band is what makes both policies available at once. A producer that
decides in band has decided for every sink it has and every sink it will grow,
and it has decided in favour of whichever one it was written for.

## The producer serves the lower bound — by reporting, not by holding

Where the sinks disagree, the conservative instinct is to run the whole
producer at the irreversible sink's discipline: hold everything until it is
final, so nothing needs taking back. That is the right instinct applied one
layer too high. It pays the irreversible sink's latency on the reversible one,
for no benefit, and it does not even solve the problem — a record held until
final can still exceed a bound and still has to be described somehow.

What the producer owes both sinks is the *information*, not the delay:

- **The bytes, unmutated.** Whatever was received, exactly. The producer's own
  metadata is not part of the record.
- **The clip, if any**, with its reason and its extent. The reason is a closed
  set — a size bound, a time bound, a boundary the framing could not close —
  because each one means something different downstream.
- **Nothing else.** In particular not a verdict about whether the prefix is
  usable; that is the sink's call, and the sinks differ.

The asymmetry then resolves per sink, at the sink, which is also where the
grammar is known ([record-precedes-effect](../../../../_laws.md#record-precedes-effect)
supplies the ordering for the irreversible one: the write is the effect, so the
description of what is being written exists before the write).

## The replay corollary: a surviving sink is its own history

The same asymmetry decides what a reconnect owes. The standard mechanism for
handing a returning viewer its context is a **bounded tail replayed into a
fresh surface**: the surface was destroyed at disconnect, so the tail rebuilds
enough of it, and the bound is affordable precisely because eviction costs a
replay rather than history.

That mechanism has an unstated precondition — *the surface did not survive*.
When it did, replay is the wrong instrument in both directions:

- **Replaying is a duplicate, not a restoration.** The history is already on
  the surface, and an append-only surface cannot be cleared first. Delivery
  must be **exactly once for the life of the surface**, which means a position
  the producer and the surface agree on across the disconnect, not a tail sized
  for a rebuild.
- **A tail cannot serve a reflow.** A surface whose geometry changes has to
  re-lay-out the history it is showing. A reversible surface does that from its
  model. An irreversible one cannot re-wrap what it has already emitted, so the
  policy has to be stated rather than discovered: either the history keeps the
  geometry it was written at and only the live region re-wraps, or the writer
  owns a region it is allowed to repaint and the boundary between that region
  and the committed history is explicit. A bounded tail contains neither the
  full history the first option needs nor the boundary the second one needs.

So for a surviving irreversible sink the substrate is an **exactly-once
history with a stated resize policy**, and the bounded ring belongs to the
case it was designed for: a sink that is rebuilt from nothing on attach.

## What it does not license

- **It does not make a reversible sink free.** Repainting at the producer's
  frontier still costs the layout work the throttling discipline exists to
  bound, and it still shows the user text that will change, which
  [emit-behind-the-revision-window](./emit-behind-the-revision-window.md)
  answers on its own axis. Reversibility removes the *correctness* objection to
  showing early, not the other two.
- **It does not make a partial actionable.** A consumer that will do work on a
  prefix needs the agreement heuristic and the confirmation gate, whatever the
  sink is; a reversible display is not evidence that the content is stable.
- **It does not permit rewriting an irreversible record to fix it.** The
  honest correction is a later write that leaves the first one standing
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in the
  record's own voice). A sink that can be rewritten was reversible.

## When the distinction collapses

- **The producer has exactly one sink and always will.** Then in-band is not
  wrong, only unnecessary; say in one line which class the sink is, so the
  second sink's author inherits the question rather than the assumption.
- **The record is never read back by a machine.** A sink read only by humans
  tolerates in-band markers indefinitely, and mutating for legibility is the
  right call. The trap is the sink that is *described* as human-only and is
  later parsed — a log read back to measure something is the common case, and
  the mutation is discovered as a shortfall in the measurement, at a distance
  from the reader that caused it.
