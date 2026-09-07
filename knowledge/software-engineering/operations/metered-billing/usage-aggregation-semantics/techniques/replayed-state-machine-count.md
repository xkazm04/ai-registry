---
layer: technique
type: technique
subject: usage-aggregation-semantics
technique: replayed-state-machine-count
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [billing seats or licences or provisioned units, a count that must go down when something is removed, deduplicating repeated add and remove events, deciding what a remove without an add means]
---

# Counting what is held, by replay

A metric that bills **how many of a thing the customer currently holds** —
seats, licences, assigned numbers, provisioned instances — is not a count of
distinct identifiers. It looks like one, which is the problem: a count of
distinct identifiers over a period is one expression, it is obviously
correct at a glance, and it counts everything the customer has *ever* had.
It never decreases. Nobody notices, because the test fixtures only add.

The correct fold is a **state machine per identifier**, replayed over the
period's events in order. Each event names an identifier and an operation on
it; the replay decides that identifier's terminal state; the aggregate
counts the identifiers whose terminal state is *held*.

## The state machine

Two states — *held* and *not held* — and two operations. The operations are
worth spelling out including their no-ops, because the no-ops are the whole
value of the technique:

| current state | operation | result | contribution |
|---|---|---|---|
| not held | add | held | the identifier counts |
| held | add | held | absorbed — a duplicate delivery, not a second unit |
| held | remove | not held | the identifier stops counting |
| not held | remove | not held | absorbed — a remove that races or repeats |

An identifier that is added and removed within the period lands in *not
held* and contributes nothing to a count metric. An identifier added twice
contributes one. An identifier removed twice, or removed without ever having
been added inside the window, contributes nothing and raises no error.

Two design commitments make the table above true rather than aspirational:

- **The operation is a property of the event, with a declared default.**
  Emitters will omit it — an older client, a simpler integration, a
  backfill. The default must be *add*, because the overwhelming majority of
  events in every real stream are additions, and because a default of
  *remove* would make an unlabelled stream aggregate to zero. Declare the
  default in one place; two components disagreeing about it is a metric that
  reports different numbers on two code paths.
- **What was true before the window has a stated convention.** The replay
  has to know each identifier's state at the instant the period opened. For
  a window-closed metric the convention is *not held*, so a leading remove
  is absorbed; for a period-crossing metric it is whatever the seed says.
  This is the single most dangerous interaction in the subject and it has
  its own technique — see the seeded recurring aggregate technique here.

## Identity is the whole key

The replay groups by identifier, so the identifier is load-bearing in a way
a distinct-count never made it. Per
[identity surviving reuse](../../../../_laws.md#identity-survives-reuse), it must
be minted once by whoever owns the thing being counted and carried on every
event about it. Three tempting substitutes all fail:

- **A human-readable name.** A seat identified by an email address is a seat
  that changes identity when the person changes their address, and merges
  with another when two systems normalize case differently. The remove will
  not find its add.
- **A position or a sequence number.** Removing the second of five and
  adding a sixth renumbers everything the next emitter sees.
- **A composite of attributes.** Any attribute that can be edited is an
  identity that can be edited, and an edit between the add and the remove
  produces a permanent phantom: an identifier in *held* that no future
  remove can name.

The consequence of a broken identifier is asymmetric and always in the same
direction. A split identity leaves a held unit that never leaves, and the
customer pays for it forever. A merged identity lets one remove clear two
units, and the customer pays for neither. The first is the one that reaches
a lawyer.

**Reuse deserves an explicit decision.** If an identifier can be removed and
later re-added — a seat freed and reassigned to the same person — the
machine handles it correctly for a count metric and *not* for a metric that
bills each activation. Decide which is being sold before the first
reassignment, not after.

## Why replay rather than incremental state

Keeping a running set and mutating it as events arrive is the obvious
alternative and it is materially worse in one respect that matters here:
**it is not re-derivable.** Replay makes the aggregate a pure function of
(the period's events, the seed, the boundary convention), which means it can
be recomputed at any time and must produce the same answer — the
recomputation path required by
[derivation naming recomputation](../../../../_laws.md#derivation-names-recomputation)
exists for free. A mutated running set has no such path: once it has drifted
there is no way to tell whether it drifted, and the only oracle is the thing
that drifted.

Replay also gives idempotence against redelivery for free, which the
ingestion boundary is already trying to provide and will occasionally fail
to. Two independent absorbers of a duplicate are cheap; a billing system
that relies on exactly-once delivery for its arithmetic to be correct is
one queue incident away from an overcharge.

The cost is that the replay is proportional to the period's event count.
That is acceptable for a metric whose events are lifecycle changes —
seats are added by humans, not by traffic — and unacceptable for one whose
events arrive at request rate. If the identifier stream is high-volume, the
metric is probably a flow wearing a level's clothes; check the modelling
before optimizing the replay.

## Decision rules

- **If removal is not expressible in the domain, this is over-engineering.**
  A count of distinct things that genuinely only ever accumulate — unique
  end-users seen in a month, distinct destinations contacted — is a
  distinct-count and should be one. The test: can the customer make the
  number go down by an action? If not, do not build a machine that lets
  them.
- **If the answer must be a level over time rather than at the period's
  end, compose rather than substitute.** "How many seats were held on
  average" is the time-integral technique with this machine's output as its
  running level; "how many seats are held now" is this one alone. They are
  different invoices for the same events, and both are sold.
- **Never resolve a remove-without-add by erroring.** In a stream that
  crosses period boundaries, arrives out of order, or replays, that
  condition is normal. Absorb it, and count how often it happens as an
  operational signal — a rising rate is evidence of a broken identifier or a
  misaligned seed, and it is far cheaper to watch than to reconstruct after
  an invoice.
- **Order by a total order, always.** Two events for one identifier at the
  same timestamp — an add and a remove emitted by the same transaction —
  resolve differently depending on scan order unless a stable secondary key
  decides. Half a period's invoices flipping on a re-run is the symptom, and
  it is diagnosed as everything except a missing tie-break.

## When not to use this

- **When each event is a chargeable act rather than a change of state.**
  Activations sold individually are a flow; do not make them cancel.
- **When the operation vocabulary needs more than two states.** Suspended,
  pending, trialing, over-quota: a richer lifecycle is a legitimate need and
  a two-state machine will be extended by whoever hits it next, in a hurry,
  during a billing run. Either declare the closed vocabulary up front with
  its transition table, or keep the metric two-state and model the rest
  outside it.
- **When the customer's own system already reports the level directly.**
  If the emitter can send "there are now 14", the replay is reconstructing
  something authoritative from something derived. Take the level and use the
  integral technique.
