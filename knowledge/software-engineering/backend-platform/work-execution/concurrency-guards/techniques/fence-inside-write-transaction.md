---
layer: technique
type: technique
subject: concurrency-guards
technique: fence-inside-write-transaction
status: forged
laws:
  - gate-sees-target
  - one-validation-door
  - absent-guard-is-loud
shared_with: []
use_when: [a cluster lock sits over a store that accepts writes from anyone, deciding where the fencing token is checked, a write must happen while the lock is deliberately not held, an unfenced write path is being added for a good local reason]
stage: multi-service
---

# Fence inside the write transaction

A lock over a store that accepts writes from any client has the property the
previous technique escapes: the store cannot tell a holder from a former
holder. So the holder carries a fencing token — the lock's identity as of
acquisition — and the store checks it. The whole question is *when*, and the
naive answer is the wrong one. **Validating the token at acquire time proves
only that the lock was held once.** A holder can lose the lock between
acquiring it and issuing its next write: a pause, a partition, a renewal that
failed while a large request was being served. Every write issued after the
loss and before the holder notices is a corruption the acquire-time check was
never in a position to see. The check has to stand where the write is (law:
gate-sees-target): inside every write, and at the commit of every transaction
that writes.

The rule for a transactional store follows from the same fact. Writes buffered
inside a transaction are not visible until commit, so the moment that matters
is the commit; a token that was valid at the first buffered write and invalid
at commit must fail the commit, and a token that is checked only at commit
covers every buffered write at once. Where a store offers both direct writes
and transactions, both doors carry the check, because a transaction commit
that fences while a direct write does not is a fence with a gap the next
contributor will walk through (law: one-validation-door).

## What the check must be, and what it must be atomic with

The check asks the store one question: is the lock row still mine — my
identity, my key, my value — and still within its validity? The answer must
come from the store's own state, not from a cached copy of the lock in the
holder's memory, because the holder's memory is precisely what is stale in the
scenario being defended against. A check that consults the local "am I
leader" flag inside the write path is the acquire-time check relocated.

Then the harder property. **The check is worth exactly as much as its
atomicity with the write.** A read of the lock row followed by a separate
write leaves a window between them in which ownership can change, and a
holder that lost the lock inside that window writes anyway. The window is
narrower than the acquire-to-write gap by orders of magnitude, and narrowing
it is a real improvement, but it is not closure. Closure means the write is
conditioned on the lock in the same unit the store executes atomically: the
condition inside the write statement, or the lock row read under a shared
lock inside the same transaction that commits the write, so that a concurrent
takeover and the fenced commit cannot both succeed. A design that only
narrows should say so in the check's own doc comment, so that nobody cites it
as atomic — the honest sentence is "this makes the race short", not "this
prevents the race".

## The unfenced allowlist

Some writes have to happen while the lock is deliberately not held. A cluster
being initialized for the first time has no active node yet; a sealed cluster
being cleared and re-initialized may have to remove the very rows the lock
lives in. Refusing those writes makes the system unbootstrappable. Permitting
unfenced writes in general reopens everything above. The resolution is an
**explicit allowlist, marked on the request itself**: the caller that needs
an unfenced write says so on the context of that specific call, the fence
reads the mark and steps aside for that call and no other, and the mark is
the only way through. Three consequences hold the shape together.

First, the default is fenced. A write that carries no mark is checked; the
guard engages on its own and absence of the mark means protection, not
omission (law: absent-guard-is-loud). Second, writes issued before any lock is
registered pass — the fence is armed when the active node registers its lock
and not before, so bootstrap needs no mark at all, and the mark exists only
for the rarer case of writing *while a lock is registered elsewhere* on a node
that has sealed itself. Third, and the reason the allowlist is worth a
technique rather than a footnote: **the allowlist is the finding when it
grows.** Every member is a write the design has decided may corrupt state if
the caller is wrong about the cluster being sealed, so every addition is a
review event, the set is enumerable from one grep for the marker, and a
reviewer who finds a second member should ask what changed in the cluster's
lifecycle to justify it — not whether the code compiles.

## Decision rules

- Check the fencing token inside every direct write and at every transaction
  commit, from the store's own lock state; a check at acquire time proves
  nothing about the writes that follow.
- Make the check atomic with the write where the store allows it; where it
  cannot, document the residual window in the check itself and do not call it
  a fence.
- Arm the fence when the active node registers its lock; writes before
  registration pass so bootstrap needs no exception.
- Permit an unfenced write only through a mark on that call's context, read
  by the fence; never through a flag on the store or a mode on the node.
- Treat every new member of the unfenced allowlist as a design finding to be
  reviewed, and keep the set greppable from a single marker.
- Where the store refuses non-leader writes on its own, none of this applies
  and the token is redundant (see leadership-is-the-lock).
