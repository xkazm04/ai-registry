---
layer: technique
type: technique
subject: data-access
technique: existence-authority-written-last
status: forged
laws: [record-precedes-effect, creation-names-reaper, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [one logical create or delete writes to two stores that share no transaction, a file or blob is written beside a database or registry row, deciding which of two writes goes first when a crash can land between them, a listing is built by enumerating one store and joining the other, a rollback ledger records only what reached the second store, a staged file and a row must both exist before a record is usable]
---

# Existence authority written last

Two writes to two stores that share no transaction are two transactions, and
**the sequential composition of two transactions is not itself a transaction.**
A crash, a failed lock, a cancel or a retry budget can land between them, and
readers will see the half-state for as long as it lasts, which after a crash is
until something repairs it. Order cannot remove the half-state. It chooses which
half-state is reachable. So the question is never "which write feels natural
first". It is: **which store do readers treat as proof that the thing exists?**
That store is the existence authority. Write it last on create, remove it first
on delete, and read it first.

## Find the authority by reading the readers

The authority is not the store that holds the most data or the one the design
document calls primary. It is the one whose presence makes a reader act:

- a listing built by enumerating it (a directory glob, a table scan, an index
  query) and joining the other store for details;
- a loader that resolves the thing by looking in it (a path, a key) and never
  consults the other store;
- a check that validates, authenticates or serves on its presence alone.

Enumerate every reader of both stores before choosing, because the two common
slogans each name the authority by position and are each wrong half the time.
**"Referent before reference"** (write the thing, then the pointer to it) is
correct exactly when readers find things only through the reference, so an
unreferenced referent is unreachable garbage. **"Index before record"** (write
the pointers, then the record) is correct exactly when the record is effective
on its own, so a record no index can reach is live and unaccountable (a
credential nothing can revoke). They are the same rule applied to opposite
readers. A file store beside a metadata row flips between them depending on
whether the listing globs the files or scans the rows.

## The order, per operation

- **Create:** write the dependent store first, the authority last. The crash
  half-state is "detail present, authority absent", which every reader that
  starts from the authority already filters out.
- **Delete:** remove the authority first, the dependent store last. The crash
  half-state is the same shape as create's, so one repair handles both.
- **Replace:** create the new authority entry under a new identity, then retire
  the old one, so no instant has zero or two authorities for one slot.
- **Stage outside the authority.** When the authority is a location (a
  directory, a bucket prefix), producing the payload directly into it *is*
  writing the authority first. Produce into a scratch location the readers do
  not enumerate, commit the dependent write, then move the payload into place.
  A failure before the move leaves the payload in scratch, where the scratch
  area's own reaper takes it
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

When the authority write fails after the dependent write succeeded, retract the
dependent write at once, and make that retraction the same operation the delete
path uses.

## Check the half-state against every reader, not only the listing

"Benign" is a claim about all readers of the dependent store, and it is usually
checked against one. A metadata row whose payload never landed is invisible to a
listing that enumerates payloads, and it is still read by a uniqueness check
that scans rows: the slot it names is now held by something no user can see.
That half-state is acceptable only because the check that trips on it names the
holder, so the conflict is surfaced with the handle needed to delete it. Where a
dependent-store reader would act on the half-state silently, either give that
reader the authority join or give the half-state a sweep.

## Idempotency is the precondition

Ordering leaves a half-state; recovery completes or retracts it by repeating an
operation. That is only safe when both writes are idempotent under an identity
minted once, before the first attempt: a create retried after "dependent
written, authority not" must find its own dependent entry and continue, not
mint a second one. Without that identity, order buys nothing, because every
retry manufactures a new half-state.

## A rollback ledger sees only what it was told

A common shape defeats this rule without anyone choosing to: a long operation
keeps a ledger of what it created so a failure or a restart can undo it, and it
appends to the ledger after each dependent-store write succeeds. If the payload
was already in the authority before that write, a failure in between leaves an
authority entry the ledger never heard of, and the rollback that exists to
prevent a partial result certifies one. The test is to inject a failure into the
dependent write and count authority entries with no dependent entry afterwards.
The count must be zero. A rollback test that fails the payload producer instead
never reaches that window.

## Boundary

[record-precedes-effect](../../../../_laws.md#record-precedes-effect) says an
intent record is written before the effect it records. That record is read by
recovery, not by the readers who decide existence, so it is not the existence
authority and the two rules do not conflict: the intent goes first, the
dependent store next, the authority last. Where one store holds both roles, the
record is an intent only if readers ignore it until it is marked complete.

Where a transaction or an atomic multi-key write spans both stores, use it
instead ([transactions-and-units-of-work](./transactions-and-units-of-work.md)).
Where the question is which of two writes is *newer* rather than which one
*exists*, carry order as data
([sequence-token-write-ordering](./sequence-token-write-ordering.md)); a prefix
guarantee from tokens and an existence authority from ordering compose.

## When not to reach for this

One store, or two stores whose every reader joins both and drops rows missing
either side, needs no ordering rule: the join already filters both half-states,
and the order is a matter of taste. Say so where the join is written, because
the next reader added to that store may not join.
