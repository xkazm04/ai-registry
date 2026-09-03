---
layer: golden-path
type: golden-path
subject: persistent-batch-mutation
status: forged
use_when: [a long-lived batch changes membership every step, several components hold per-slot state beside a shared array, designing the contract between a scheduler and its stateful extensions, deciding whether a component may be skipped]
techniques:
  - typed-ordered-mutation-protocol
  - compaction-in-the-protocols-own-operations
  - declared-skippability-at-batch-granularity
---

# Persistent batch mutation

Some systems build a batch, run it, and throw it away. This subject is about
the other kind: a batch that **persists across steps** and is edited in place.
Every step, some members finish and leave, some newcomers join, and the
surviving members may be reseated so the array stays contiguous. The batch is
not a list of work; it is a **seating chart with a lifetime**, and the seats
are read by index by everything downstream of it.

That indexing is what makes the subject hard. Around the batch sit several
**stateful extensions** — components that hold their own parallel arrays,
one entry per occupied slot, and must keep those arrays aligned with the
seating chart on every step. A per-slot penalty accumulator, a per-slot
sampling constraint, a per-slot bias vector: each one is a private array whose
index *i* must mean the same member as slot *i* of the batch, forever, across
an unbounded number of mutations, in every extension at once.

The question the subject answers is therefore narrow and load-bearing: **how
do you tell those extensions what changed, so that every one of them
reconstructs the identical final state?** The naive answer — hand each
extension the new batch and let it work out the difference — is the failure
this whole discipline exists to prevent. Diffing is *N* independent
reimplementations of one algorithm, each free to get the tie-breaks wrong, and
their disagreements do not fail loudly: they produce a system where one
extension's constraint is applied to the wrong member's output and the result
is merely a little bit wrong, forever.

The principal answer is that the difference is **published, not derived**. The
component that mutates the batch already knows exactly what it did; it emits
that as a typed, ordered instruction set, and every extension applies it
mechanically. There is one algorithm, it lives at the producer, and an
extension that follows the protocol cannot disagree with its peers about the
final state — not because it is careful, but because it never had a choice to
get wrong.

## The step is two phases, and they are separate on purpose

A step over a persistent batch has two phases, and collapsing them is the
first mistake:

1. **Reconcile state.** Every extension receives the mutation record and
   updates its private arrays to match the new seating. No work is done on the
   data itself here.
2. **Apply.** Every extension transforms the shared data, now that indices
   agree.

The separation buys three things. Reconciliation is cheap, index-shuffling
work that can be reasoned about and tested without touching the payload.
Application is pure over an already-consistent world, so a bug in it is never
an aliasing bug. And the ordering between extensions is only a question in
phase two, where it is visible, rather than an emergent property of who
happened to notice a membership change first.

The phases also differ in what "nothing happened" means, which is the source
of a persistent class of bug — see the null-update rule in
[typed-ordered-mutation-protocol](./techniques/typed-ordered-mutation-protocol.md).

## Slot index is a position, never an identity

The single most important thing a practitioner holds true here: **the index is
a seat number, not a name**. It is reused the moment its occupant leaves. Any
structure keyed by index — a cache, a log line, a metric label, a cross-step
correlation — is keyed by "whoever is sitting there now", and it will silently
attach one member's history to another's the first time a seat turns over,
which is every few steps.

So identity is minted once, at admission, and carried
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)). The
protocol's operations move *identities between seats*; anything that must
survive a reseat is keyed by identity, and the index appears only inside the
one step that is currently executing. An extension that stores an index across
steps has stored nothing.

The corollary is easy to miss: this is exactly why the protocol needs a
**move** operation at all. If seats were identities you would only ever need
add and remove. Move exists because the seating chart is compacted for the
benefit of the execution below it, and compaction relocates members who did
nothing.

## Three operations, one mandated order

The whole protocol is remove, add, and move, applied in that order. It is
worth being blunt about why so small a vocabulary is enough and why the order
is a rule rather than a convention:

- **Removes and adds are both stated against the arrangement as it was at the
  start of the step**, and the producer keeps them disjoint by construction —
  it never removes a seat it also adds into. Their relative order is therefore
  a specification choice made once, and removes-first is the one to make: it
  reads as "who left, then who arrived", which is the order a reviewer checks
  the record in.
- **An add may land on an occupied seat, and that is a replacement**: the new
  member takes the seat and the previous occupant's state is discarded. This
  is not a corner case — it is the *normal* path, because refilling a departing
  member's seat with an arriving one costs a single entry instead of a remove,
  an add and a compaction move. It also means the operation set has **two ways
  a member can end**, which is the single most common source of leaked state.
- **An add carries the index it lands on as of that moment**, before any move
  is applied — a rule stated explicitly in the protocol because it is the one
  an implementer gets wrong when reading the record out of order.
- **Moves last**, in the order given, relocate survivors. A move may be
  one-way (source seat becomes vacant, and any occupant of the destination is
  displaced and discarded) or a swap (two occupants exchange seats); the two
  are different instructions and must be distinguishable, because a one-way
  move leaves a hole that a later move in the same list is entitled to fill.

Any other processing order produces a *different* final arrangement from the
same record. That is the point: the order is part of the semantics, not
guidance. An implementer who batches all the index arithmetic into one clever
pass has redefined the protocol.

## Membership-unchanged is not nothing-to-do

The record has a distinguished value meaning **the seating chart did not
change this step**. That is not the same statement as "you have no work". An
extension whose per-slot state tracks a growing per-member output still has to
act on an unchanged chart, because the *content* behind each seat grew even
though the seats did not move. Systems that treat the two as synonyms skip the
extension entirely on steady-state steps — which is most steps — and the bug
surfaces only under sustained load with no membership churn, the exact
condition their tests do not have.

## Observation without notification, and what it costs

The protocol's most consequential design choice is not an operation. When a
member is added, its record carries a **live reference to that member's
growing output**, not a snapshot. Extensions therefore observe growth without
being told about it: nobody emits an "output extended" event, because every
holder of the reference already sees it.

This is a deliberate coupling and should be taught as one. It buys an enormous
reduction in protocol surface — the highest-frequency change in the system,
one appended element per member per step, generates no messages at all. It
costs a real obligation: the reference keeps the underlying structure
reachable, so an extension that keeps its entry after the member is gone holds
that member's entire output alive. Discarding is therefore not optional
bookkeeping; **an extension that fails to drop departed members leaks in
proportion to throughput**, and the leak is invisible in the extension's own
accounting because it is holding a reference to somebody else's memory.

The trap is that "gone" has two spellings. An explicit remove is the obvious
one and everybody handles it. The other is an add that lands on an occupied
seat — the *common* path — where the departure is implied by the arrival and
an implementer reading the operation names alone will not see it. State the
discard obligation once, covering both: **an entry is dropped when its member
is removed and when its seat is taken.** Every reference handed out by the
protocol names the operation that drops it
([creation-names-reaper](../../../_laws.md#creation-names-reaper)); here that
operation is the remove, and it is the same remove every implementer already
has to handle.

## Housekeeping belongs inside the operation set

Removals leave holes, and the execution underneath usually requires the
occupied seats to be contiguous. The reflex is to add a compaction callback —
a fourth entry point that extensions implement to "close up the gaps".

Do not. Compaction is expressible as a defined sequence of one-way moves from
the highest occupied seat into the lowest hole, after which the batch shrinks
as a stated side effect. An extension that implements the three operations
correctly gets compaction for free and never learns the word. The general rule
worth carrying out of this subject: **when a protocol's operation set is
complete, its housekeeping is expressible in it, and a housekeeping callback
is evidence the operation set is incomplete.** See
[compaction-in-the-protocols-own-operations](./techniques/compaction-in-the-protocols-own-operations.md).

## Skipping is declared, and the granularity is the trap

Extensions are not always relevant. A transform that provably cannot change
the outcome under the current mode is pure cost, and the engine cannot infer
that — only the extension knows. So the extension **declares** it, and the
engine skips it.

The rule that surprises people is that a per-member property does not buy a
per-member saving. If the transform runs over the whole batch at once, the
skip fires only when **every** occupant qualifies, and one member who does not
qualify pays the full cost for all of them. A property that is per member but
exploitable only per batch is a distinct shape with its own economics, and the
naive reading — "declare it and save the work" — is wrong in exactly the
common case of a heterogeneous batch. See
[declared-skippability-at-batch-granularity](./techniques/declared-skippability-at-batch-granularity.md).

## The boundary with neighbouring subjects

This subject starts *after* the decision to admit a member and ends *before*
the member's own progress is modelled.

- **Deciding who runs now, who waits, and who is refused** is an admission
  problem: bounds, fairness, shed policy, wait accounting. This subject takes
  the outcome of that decision as given and answers only "how is the change
  broadcast to the components that hold parallel state".
- **Keeping one logical operation from running twice** is a guard problem
  about exclusion and idempotency over keys. Nothing here is contended; a
  single producer emits the record and the consumers apply it in a defined
  order.
- **A state machine per item** is the closest neighbour and the one worth a
  discriminating question: *does the transition of one item change the storage
  location of another?* In a per-item machine, no — each item's status
  advances independently and nothing about item A's transition renumbers item
  B. Here it is the defining fact: one member leaving relocates a member that
  did not change state at all. If the answer to the question is no, model it
  as a machine per item and keep this protocol out of it; the machinery below
  is entirely about the coupling that the answer "yes" creates.

## Failure modes of the naive reading

- **"Just hand them the new batch."** N diffing implementations, silently
  divergent, failing as misattributed per-slot state rather than as an error.
- **"Order of operations is an implementation detail."** It is the semantics;
  the same record under a different order is a different arrangement.
- **"The order the lists are declared in is the order they are applied in."**
  It is not, and nothing enforces it. The processing order lives in the
  specification's prose, so a record whose fields are declared in some other
  order is a trap laid for every implementer who reads the type instead.
- **"An add's index is where it ends up."** It is where it lands at the time
  of the add. Reading it as the post-move position corrupts every record that
  contains both adds and moves.
- **"Empty record, skip the extension."** Confuses unchanged membership with
  no work, and breaks precisely the extensions that watch growing output.
- **"We'll add a compaction hook."** A fourth operation that duplicates
  semantics the first three already express, and a second place for the
  arrangement rules to drift.
- **"The extension type is invariant, annotate the class."** The same type
  configured two ways has two answers; the property belongs to the instance.
- **"Mark the members that don't need it and save the work."** Not at batch
  granularity, it does not.
