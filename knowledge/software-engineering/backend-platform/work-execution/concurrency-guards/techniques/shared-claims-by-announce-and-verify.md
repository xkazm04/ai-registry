---
layer: technique
type: technique
subject: concurrency-guards
technique: shared-claims-by-announce-and-verify
status: forged
laws: [gate-sees-target, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [readers must coexist while a writer excludes them and the store offers only per-key conditional writes, one object per guarded name cannot represent several holders, a second reader was granted and nothing was persisted for it, upgrading a shared claim to an exclusive one, two backends behind one lock interface disagree about an upgrade, choosing what a conditional-write error means]
---

# Shared claims by announce and verify

An exclusive claim over an object store or a key-value store is the easy case:
one key per guarded name, taken with a create-if-absent write, and the store's
own atomicity does the work (see [cross-process
exclusion](./cross-process-exclusion.md)). A **shared** mode is where that
design quietly breaks. One object per guarded name can record one holder, so the
second reader is "granted" without anything being written for it. Its claim is
untracked, it vanishes when the first reader releases, and a writer checking the
key sees one reader or none and proceeds beside a live one. The repository this
technique was drawn from shipped exactly that and found it in an audit; its fix
is the mechanism below.

## Two keyspaces, and each side announces before it looks

The exclusive claim keeps the canonical key for the guarded name. Each shared
claim gets its own key, named by guarded name and holder, written without a
condition because readers never conflict with each other. Then both sides follow
one discipline: **write your own announcement first, then read the other class's
announcements, and withdraw if you find one.**

- **Exclusive.** Take the canonical key with create-if-absent (refresh it if it
  is already yours). Then list the shared keyspace for the name. A live
  announcement by any other holder means withdraw: delete your reservation and
  report blocked, naming that holder.
- **Shared.** Read the canonical key; a live exclusive claim by another holder
  means blocked. Otherwise write your shared key, then read the canonical key
  again. If an exclusive claim by another holder appeared in between, delete your
  shared key and report blocked.

Why it holds: for a writer and a reader to both proceed, each one's read would
have to miss the other's write, and each wrote before it read. On a store whose
reads and listings see completed writes, that cannot happen. A tie, where both
announced before either looked, makes both withdraw: no double grant, possibly no
grant at all. Retry with jittered backoff so a tie does not repeat in lockstep.

## The store property is a precondition, not an assumption

The argument above is only as good as the store's consistency. It needs
read-after-write on single keys and a listing that includes every key written
before the list began. A store, a gateway or a replication setup that serves
listings from a lagging index lets the writer's verification miss a reader that
announced in time, and the protocol double-grants without any error. Name the
property in the design, and test it against the store you actually run rather
than the one the interface was written for (law: [the gate must see its
target](../../../../_laws.md#gate-sees-target)): the verification read *is* the
gate.

## Upgrading a shared claim is a writer request that excludes only itself

A holder of a shared claim that asks for the exclusive one must reserve the
canonical key and then verify with its own shared key excluded and **every other
reader still counted**. The tempting shortcut, "this holder already has a row,
update its mode", grants the upgrade beside the other readers. That shortcut was
measured in the source: its transactional backend took it, and replaying that
backend's statements in order (holder A shared, holder B shared, holder A
exclusive) granted A the exclusive claim with B's shared claim still in place.
The object-store backend of the same interface refused the same sequence. One
interface, two meanings; only a suite run against every backend sees it (see
[cross-driver invariant
parity](../../../data-layer/data-access/techniques/cross-driver-invariant-parity.md)).

## Expiry, refresh and release are per holder and conditional

Each announcement carries its holder's identity, which is what makes it
releasable and refreshable on its own ([identity survives
reuse](../../../../_laws.md#identity-survives-reuse)). Three operations then need
care:

- **Reclaiming an expired announcement is a takeover**, and a takeover must be
  replace-if-unchanged. The source reclaimed an expired exclusive claim by
  deleting the key by name and retrying its create; a second reclaimer that
  judged the same expired claim deletes the first one's fresh claim, and both
  hold. Use the store's conditional delete where it has one (by version or
  entity tag); where it has none, serialize reclaimers.
- **Refresh re-reads before it rewrites.** A heartbeat that rewrites every key
  from a listing taken earlier resurrects a claim released in between, or
  overwrites one another holder took. The source fixed this by re-reading each
  key and rewriting only one that still exists and is still owned; a small
  window remains on stores without conditional writes, and should be said so.
- **Release deletes only what you own**, from both keyspaces: your shared key
  unconditionally, the canonical key only if it is yours.

## What an error means is decided in advance

A conditional write that fails has three distinct meanings: the key exists (the
claim is held), the store does not support conditions, or the request failed.
Only an explicit signal for each of the first two may be read as such. The
source's first version treated *any* error from its conditional write as "this
store does not support conditions" and fell back to an unconditional write; a
throttled or timed-out request on a store that does support conditions therefore
became last-writer-wins, and two agents could hold one exclusive claim. Its fix
fails closed on everything except the provider's explicit not-supported codes.
Classifying by searching an error's text for a status number is the same defect
in a different place: any message that happens to contain those digits, a
request identifier for instance, would read as "not found" ([failure is not empty
success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- Give exclusive claims the canonical key and shared claims one key per holder;
  never represent several holders in one object.
- Announce, then verify the other class, then withdraw on any live conflict; a
  tie withdraws both, and retries are jittered.
- State the consistency the verification relies on and test it on the store in
  use.
- An upgrade reserves the exclusive key and still counts every other reader.
- Reclaim, refresh and release are per holder; reclaim is conditional, refresh
  re-reads, release deletes only what is yours.
- Read "exists" and "conditions unsupported" only from explicit codes; every
  other error fails closed.
- Run one conformance suite over every backend behind the interface.
