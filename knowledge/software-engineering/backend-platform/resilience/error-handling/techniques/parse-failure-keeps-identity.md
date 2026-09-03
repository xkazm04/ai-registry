---
layer: technique
type: technique
subject: error-handling
technique: parse-failure-keeps-identity
status: forged
laws: [identity-survives-reuse, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [one malformed item stops a reader over a collection you do not own, deciding whether a decode failure fails the batch or the item, a log says an item failed to parse but not which one]
---

# Parse failure keeps identity

You read a collection somebody else writes. Its items are shaped by a schema
other people edit, at a rate you do not control, and one of them will
eventually fail to decode. This technique fixes what happens next: the failure
is isolated to the **item**, and the failed item **still carries its
identity**, so it can be named in a log, complained about on the record
itself, routed to an error state, or excluded by key — none of which is
possible for a failure that arrived anonymous.

## The three postures this replaces

- **Fail the batch.** One malformed item denies the reader the other ten
  thousand well-formed ones. The blast radius of one writer's mistake becomes
  the whole collection, and the reader's availability is now a function of
  every other writer's discipline.
- **Drop the malformed item.** The collection silently shrinks and the reader
  reports a smaller number as if it were the truth — failure spelled exactly
  like empty success
  ([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).
  Everything downstream then reasons about a population it cannot enumerate.
- **Keep an anonymous error.** The reader knows a failure happened and cannot
  say to whom. This is the posture that feels correct and is the most
  expensive to live with: the count is honest, and no action is possible from
  it, because every action anyone would take — tell the owner, quarantine the
  item, fix the item — needs a name.

## The procedure

1. **Buffer the item's raw form before the full decode.** A decoder normally
   consumes its input; the second attempt in step 3 needs the same bytes.
   Buffering is what makes the whole technique possible and it is the one
   structural cost.
2. **Attempt the full decode.** On success the item is an ordinary item and
   nothing else happens.
3. **On failure, decode the same buffered form against the identity
   projection** — the smallest sub-schema that carries the item's key and
   nothing else. Not a parallel schema: a **subset of the same authority**
   ([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
   Two independently maintained descriptions of one item drift, and the drift
   here does not fail loudly — it names the wrong item, which is worse than
   naming none.
4. **Emit the failure as a value in the collection's own slot**, carrying the
   identity and the decoder's own message. It sits where a decoded item would
   have sat; the collection's length is unchanged and its members are
   individually classified.
5. **Make the failure value satisfy the identity interface** every decoded
   item satisfies. Then the logger, the key-based router, the deduplicator,
   and the state store all work on it unchanged, without one line of
   failure-specific plumbing. That is the difference between a technique and
   a special case: consumers that only ever needed the key never learn this
   happened ([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).

## Why the identity projection must be the boring half of the schema

The projection has to be the part of the contract that changes least — the
key, the namespace, the version stamp — because a change *there* takes the
technique down silently: the identity decode starts failing too, and every
failed item becomes anonymous again at the exact moment the schema is
churning and failures are most likely. Choosing the projection is therefore a
judgment about the *stability* of fields, not about their usefulness. If a
field is interesting, it belongs in the full decode; if it is stable and
addresses the item, it belongs in the projection. Very little qualifies for
both.

## Decision rule

**When the collection is externally owned, its items are independently
meaningful, and the reader keeps running after the failure — isolate per item
and keep the identity.** All three clauses are load-bearing. External
ownership is why a malformed item is not your defect to refuse; independent
meaning is why the other items are still worth having; a continuing reader is
why an anonymous failure is intolerable, since the same item will be re-read
on every pass and will emit the same nameless complaint forever.

**When any clause fails, refuse the batch and say why.** A single artifact
whose items are meaningless apart is one document; the honest outcome is a
whole-document refusal naming the offending position.

## The rejected alternative, and where its argument holds

*Validate the whole collection, then reject it if any item fails.* The
argument for it is real: a partially decoded collection is one you cannot
reason about totally, and a consumer that quietly operates on "most of it"
has no statement to make about what it did. That argument holds when you own
every writer and one validation door governs every write — there, a malformed
item is a defect in your own writer, and tolerating it at the reader hides
the defect at the only place it was visible.

It fails on a shared, externally-owned namespace, and it fails in a specific
measurable way: a reader that dies on one malformed item stops seeing every
**well-formed** item too. The failure is not proportional to the fault, it is
inverted — the smallest possible input error produces the largest possible
loss of function, and the party who can fix it is not the party who is down.

## Boundaries

- **Against [structured-propagation](./structured-propagation.md).** That
  technique governs a failure travelling *upward* — enriched at each layer,
  cause preserved, category surviving representation boundaries, decided at
  the top. This failure does not travel upward. It stays at the item and
  travels *sideways*, inside the data, to whatever consumes the collection.
  The propagation rules still govern the error you attach to it; what this
  technique adds is the **address** the error is attached to, which
  propagation alone never supplies.
- **Against foreign-format import.** A staged import converts one foreign
  artifact through a loss ledger to a review gate, where a human confirms
  before anything commits. Here there is no gate and no human: the reader is
  continuous, the collection is re-read forever, and the malformed item will
  arrive again on the next pass. There is no "reject and ask" — only "carry
  the failure with a name until its owner fixes it".

## When not to use it

- **The items are meaningless apart.** Then the batch is the unit and this
  technique's whole premise is absent.
- **You own the writers and they pass one validation door.** Reader-side
  tolerance for something your own writer produced converts a caught defect
  into a permanent tax.
- **The identity is derived from the part that failed to decode.** Then
  there is nothing to project, and the honest report is an anonymous failure
  — a rarer and louder event than an unparseable item, and one that deserves
  its own alert rather than a shrug.
