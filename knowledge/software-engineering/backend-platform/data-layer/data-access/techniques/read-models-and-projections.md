---
layer: technique
type: technique
subject: data-access
technique: read-models-and-projections
status: forged
laws: [derivation-names-recomputation, count-carries-predicate, one-validation-door]
shared_with: []
use_when: [a screen needs four columns from three aggregates, loading a whole aggregate to render one name, a repository grows one method per screen, deciding whether a stored count is a cache or a fact]
stage: team
---

# Read models and projections

The repository rule "the surface returns domain types, not rows" is a rule
about the **write side**. It is what makes an aggregate's invariants
enforceable: the record the application mutates is the record the layer
decoded under one policy, and the write path is one door. Applied without
qualification to *reads*, the same rule produces the two failures that make
teams abandon the pattern: a list screen that loads whole aggregates to
render a name and a status, and a repository that grows one method per
screen until it communicates nothing. This technique is the split that
resolves both — two surfaces with different contracts, in one layer.

## Two surfaces, two contracts

- **The aggregate surface** is shaped by consistency. One module per
  aggregate; reads return the domain type, complete, because the caller
  will mutate it and hand it back; writes go through it and nowhere else.
  Its access patterns are the application's *commands*, and they are few.
- **The projection surface** is shaped by consumers. A projection is a
  plain read-only record — the columns one screen, one report, one
  downstream call actually needs, in the shape it needs them, joined across
  as many aggregates as the question spans. It carries no behaviour and no
  invariants because nothing is ever written *from* it. Its access patterns
  are the application's *questions*, and they multiply with the product.

The line between them is not "reads versus writes"; it is **whether the
result will be handed back to the store**. A read whose result feeds a
mutation is an aggregate read and must return the aggregate, because the
invariant check on the way back in needs the whole record. A read whose
result is displayed, exported, aggregated, or sent elsewhere is a
projection, and returning the aggregate for it is over-fetching with a
principled excuse.

The projection surface lives inside the same module tree as the aggregate
surface. The one-module-owns-the-query-language rule from layering-rules is
untouched: a projection module still owns its statements, still binds its
values, still maps its rows at the seam. What changes is the *return type*
and the *ownership boundary* — a projection module is placed beside the
aggregate modules, named for its consumer or its question, and its
existence states that it breaks when any of the aggregates it reads
change shape. That visibility is the feature; the layering-rules note on
cross-aggregate reads getting a home of their own is this home.

## The projection is not the record

The defect that appears the week after a projection surface exists: a
handler reads a projection, edits two of its fields, and passes it to a
write. Every projection field is a *copy* of store state decoded for
display, possibly stale, possibly renamed, certainly incomplete — and a
write that accepts it has bypassed the aggregate's one door
([one-validation-door](../../../../_laws.md#one-validation-door)) with a
value that was never the record. Three rules hold the line:

- **Projections are read-only by type.** No save method, no mutable
  handle, ideally a distinct type family so a write signature cannot
  accept one without a visible conversion.
- **A command names the identity, not the projection.** The handler that
  wants to change what it saw sends the aggregate's id plus the change; the
  write path loads the aggregate itself, under its own policy, and applies
  the change to the current record.
- **A projected number carries its predicate**
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
  "Children: 12" on a screen is *children matching this screen's filter as
  of this read*; the field name or the projection type says so, or the
  number will be reused as a fact it does not support — compared against
  another screen's count, or worse, written back.

## Stored read models: derived data with a named recomputation

Some questions are too expensive to answer from the aggregates on every
read — a count over a hot table, a rollup across owners, a search index
row, a "latest activity" per parent. The answer is a **stored read model**:
a denormalized row or table maintained alongside the source, read like any
projection. It is the strongest form of the technique and the one with a
standing obligation: the stored value is derived, so it names how it is
recomputed ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Concretely, every stored read model has:

- **An invokable recomputation** — one function that rebuilds the read
  model from the source aggregates alone, for one key and for all keys.
  This is the arbiter: when the stored value and the source disagree, the
  recompute says which is right, and it is also the repair.
- **A declared propagation contract.** *Synchronous*: the read model is
  updated in the same transaction as the source change, and a consumer
  reading it after the commit sees the new value — consistent, and paid
  for on every write. *Asynchronous*: updated by a follower (an outbox
  consumer, a scheduled sweep), with a lag the consumer can observe; the
  read model carries or exposes its own high-water mark so "stale" is a
  readable state rather than a guess. Which one is a decision per read
  model, written where the model is declared, and never left to whichever
  writer got there first.
- **A parity check.** A test, and in production a sampled or scheduled
  job, that recomputes and compares. A stored read model with no
  comparison running anywhere is a cached lie waiting for its first
  incident — the derivation drifts when a new writer of the source forgets
  the follower, and nothing else will notice.

Where the read model lives in a *second store* — a search engine, a cache
service, a reporting database — the parity question above stays exactly
the same and the transport joins it; cross-driver-invariant-parity's rule
that a strictly derived store is a staleness question, not a parity one,
is this obligation seen from the other side.

## Deciding when a projection earns its place

Projections are added on evidence, not on architecture. The signals that
one is owed:

- A caller discards most of what it loaded — an aggregate with twenty
  fields rendered as two.
- A caller stitches two aggregate reads in memory to answer one question
  (the join the layer should own, once — see batching-and-n-plus-one).
- A list operation's query count grows with rows because the per-row data
  lives in another aggregate.
- The aggregate module is accreting methods whose names are screen names.

And the signal that one is *not* owed: the aggregate is the screen. A
single-aggregate form that loads the record, shows every field, and writes
it back is served correctly by the aggregate read, and giving it a
projection twin is two decoders for one fact.

## When not to reach for this

Do not split the models of a system with one screen per table; the
aggregate read is the projection and the split costs a second mapper per
type for nothing. Do not turn "two surfaces in one layer" into two
*stores* with separate models on the strength of this technique — a fully
separate read store, fed by events, is a rung above, pays for itself only
where read and write shapes diverge violently or read load dwarfs write
load, and is the source of most of the pattern's bad reputation; take that
rung per bounded area of the product, never for the whole of it, and
prefer a stored read model in the same store first. And do not let the
projection surface become the escape hatch from the aggregate surface: a
projection that is loaded, edited, and written is the defect in §3 wearing
the technique's name.
