---
layer: technique
type: technique
subject: data-access
technique: sequence-token-write-ordering
status: forged
laws: [identity-survives-reuse, one-validation-door, unknown-is-not-a-value]
shared_with: []
use_when: [one logical stream spans stores with different durability guarantees, two writes in the same clock tick have to be ordered, a replay or repair pass must decide which of two records is newer, deciding whether a tie between writers may be broken arbitrarily]
---

# Sequence-token write ordering

Ordering is usually a property you inherit. One store, one boundary, one
surrogate sequence, and "which write happened first" is answered by the
engine for free. The moment a logical stream spans stores that do not agree
about durability — a server that has transactions beside a file that has a
rename — that inheritance ends. **An ordering guarantee expressed as a
transaction exists in the deployments whose store has transactions and
nowhere else**, which means it is not a guarantee; it is a coincidence of
configuration.

The move is to stop expressing order as a property the store provides and
start carrying it as data: **every write in the stream is stamped with a
monotonic sequence token, allocated above the stores, on the way in.** Order
becomes reconstructible after the fact from the tokens, identically on a
file-backed single-process install and a server-backed multi-process one.
That identity is the real prize — an ordering bug that reproduces in only
one topology is the expensive kind.

## Allocating the token

The token is minted **once, at submission, by one allocator**, and carried
unchanged through retries
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
token re-derived on retry re-dates the write and lets a replayed record
supersede a newer one — the exact defect the token exists to prevent.

The allocator's recipe is short and each clause earns its place: **take the
larger of the current clock reading and one past the last token issued.**

- The clock reading gives tokens a rough correspondence to real time, which
  is what makes them legible to a human reading a record and comparable
  across generations of the format.
- *One past the last issued* is what makes them an order rather than a hint.
  A clock alone is not an allocator: two writes inside one tick collide, and
  a tick collision is a normal reachable outcome rather than an anomaly,
  because the coarser the clock the more of them there are. A clock that
  steps backwards — correction, suspend, a virtualised host — issues tokens
  that re-date history.
- The high-water mark is state, so it is guarded by exclusion and the guard
  is cheap enough to sit on every write. Where writers span processes, the
  allocator is shared state or the tokens are only comparable within a
  writer — and which of those you have is a fact to write down, not to
  assume (below).

What the token must never be: an index or position in a list, which
renumbers on every insert; a bare wall-clock stamp, for the reasons above; or
a value a caller may supply, which hands the ordering to the layer that has
the least reason to be honest about it.

## One door stamps, or the stream has holes

The token is applied by the single write door, not by callers
([one-validation-door](../../../../_laws.md#one-validation-door)). A write
path reachable without passing the stamp produces records with no token, and
a record with no token is not *earliest* — it is **unordered**, a different
fact ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Two rules follow, and both are routinely broken in the comparison function
rather than in the writer:

- **A missing token never reads as older.** Defaulting an absent token to
  zero makes every legacy record lose every comparison, so a repair pass
  cheerfully overwrites records it should have left alone. The honest
  spelling is a comparison that requires both sides to carry a token before
  it answers, and falls back to a *named* coarser rule — with its weakness
  stated — when either side does not.
- **A tie is an answer.** When two tokens are equal, the correct output is
  *these are not ordered*, and the consumer must have a policy for that.
  Folding a writer identity into the token to force a total order is worse
  than the tie it removes: it hides an unordered pair behind an arbitrary
  winner, and the arbitrariness is now invisible to everyone downstream.

## State the guarantee, including where it stops

A sequence token bought one specific property, and every neighbouring
property it did *not* buy has to be written down beside it, because each one
is something a reader will otherwise assume:

- **Stamp time, not commit time.** The token records when the write was
  submitted, not when it became durable. Two writes can commit in the
  opposite order to their tokens if the slower one was submitted first. For
  the last-writer-wins question this is usually the ordering you actually
  want; for an audit of what the store did, it is not.
- **Order, not atomicity.** The reason the token exists is that the writes
  span stores no boundary covers. A crash between two stamped writes leaves
  the later one missing, and the honest guarantee is a *prefix* one — every
  write up to some token is present in every store — which a reconciliation
  pass checks and reports. Naming that guarantee is what makes the residue
  an accepted design property instead of an undiscovered bug.
- **Order, not conflict resolution.** The token says which of two writes is
  later. It does not say which should win: last-writer-wins, merge, and
  refuse are all legitimate, and choosing between them is a policy decision
  belonging to the replication layer, not to the allocator. A token is the
  input to that policy.
- **Comparable within a scope.** If the allocator is per process, tokens
  from two processes are comparable but not totally ordered, and the design
  document says so in those words. Silence here is read as a total order by
  everyone downstream.

## The read side is half the technique

A token nothing sorts by is ceremony with a lock on it. Readers that need
order sort by the token explicitly, with a deterministic tie-break; a store
that "usually" returns rows in insertion order is the trap this technique
exists to escape. Where the backend can index the token, it does, because a
sort the store cannot serve is a sort done in memory over the whole stream.

Two consumer rules that catch most misuse: the sequence is a **total order,
not a dense counter** — an allocated token whose write failed leaves a gap,
gaps are normal, and anything computing a record count from the maximum
token is wrong. And a **reused token is corruption** where a gap is not:
detecting duplicates is worth a cheap assertion in the repair path, since a
duplicate means the allocator's exclusion or its high-water mark failed.

## Boundary

[transactions-and-units-of-work](./transactions-and-units-of-work.md) is the
answer whenever the writes fit inside one store that has a boundary. Where a
boundary exists, use it: stamping tokens around two writes to the same
transactional store instead of opening a scope is a downgrade that buys
ordering and gives up atomicity. This technique starts exactly where that one
runs out — when no boundary can span the stores in play.
[layering-rules](./layering-rules.md) keeps the allocator inside the layer:
the token is not a parameter on the surface, because a caller that can choose
its own token has been handed the stream's ordering along with it. And the
policy that decides which of two ordered writes wins belongs to the
replication and conflict machinery, which consumes the token and is a
different subject's concern.

## When not to reach for this

One store with a native ordering guarantee, or one writer, needs none of
this — the token duplicates something the engine already promises and adds an
allocator to keep correct. Where every deployment is homogeneous and always
will be, prefer the engine's sequence and spend the effort elsewhere. And
where no reader consumes the order, do not manufacture it: the discipline is
justified by a consumer that must decide which record is newer, and in the
absence of that consumer it is a lock, a field, and a migration for nothing.
