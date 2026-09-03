---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: usage-triggered-rotation
status: forged
laws: [count-carries-predicate, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [choosing when the data key must rotate, a cipher with a per-key operation limit under random nonces, an operator estimating encryption counts from request metrics, persisting a counter that is itself encrypted]
---

# Usage-triggered rotation

An authenticated cipher with random nonces has a **per-key budget**: the
number of encryptions after which the probability of a nonce collision under
one key stops being negligible. For the common mode with a 96-bit random
nonce the standard's stated bound is 2^32 invocations per key, conservative
against an expected first collision near 2^48, and a collision is not a
weakening but a break, because it exposes the keystream and the
authentication key together. A busy server reaches 2^32 in weeks. The
technique is to make the server count its own cipher operations and rotate
the data key before the budget is spent, so that the guard is the server's and
not the operator's.

## Three triggers, first one wins

Rotation is triggered by whichever of three conditions is met first. A
**maximum operation count** per term, set below the cipher's limit by a
margin; a **maximum interval** since the term was installed, because a quiet
server still accumulates exposure of one key across every backup taken in
the period; and an **unknown-count age**: a term whose recorded count is
zero and whose install time is older than a fixed age was installed before
counting existed, or has had its count lost, and is rotated on the
assumption that its true count is unknown rather than small. The third
trigger is the one the naive design omits, and it is the one that matters on
the day counting is introduced: every term already in the field has a count
of zero, and a zero read as "fresh" is unknown rendered as a value. The
decision rule for the count: when the cipher's published limit is L, rotate
at a fixed fraction of L, because the count the server holds is a floor on
the true count and not the true count; the reason it is a floor is in the
next section.

The triggers have floors as well as ceilings, and the floors are derived,
not chosen. A rotation is a keyring rewrite and a new term forever; a
configuration that rotates every few minutes or every few thousand
operations grows the keyring without bound and turns the transient replica
bridge into a permanent stream. So the maximum count has a minimum, the
interval has a minimum, and a configuration below either is clamped at the
door and reported, never silently accepted. Each trigger is checked by the
leader on a periodic tick, never by a replica, because rotation writes the
keyring and only the leader writes. A check that lives on every node and
races to rotate produces two terms with one number.

## Counting is cluster-wide and the count is persisted

The count that matters is the number of encryptions ever performed under the
active term, across every node that has ever held it. Replicas encrypt too,
when they write, or forward writes that the leader encrypts; a design that
counts on the leader only undercounts by the replica writes it never saw. The
practical shape is a counter in memory on each node, incremented on every
encryption, and a periodic persist of the running total into the store, from
which every node reloads on unseal and on term change. The count carries its
predicate ([count-carries-predicate](../../../_laws.md#count-carries-predicate)):
it is "encryptions under term N, measured at the cipher call, persisted every
P operations or every T seconds, reloaded at unseal", and a status surface
that shows the number shows the predicate with it, because the operator who
reads "1.9 billion" needs to know whether that is since unseal or since the
term began.

The count in force is the last persisted total plus the operations since
the persist, and the persist interval is the bound on how far behind the
persisted figure can be. A crash between persists loses at most one interval
of operations from the count, and this is why the trigger fires at a fraction
of the limit rather than at the limit: the true count is always at least the
persisted count, and the margin covers the interval a crash can lose plus
whatever lag the periodic persist admits. The persist is best-effort, a
failure to write it is logged and retried on the next tick and never fails
the encryption it accounts for, because a counter that can refuse writes is
a counter that will be disabled.

## The persist is itself an encryption

The write that persists the count passes through the barrier, is encrypted
under the active term, and is therefore one more operation under it. The
naive implementation counts every encryption except the one that writes the
count, and undercounts by exactly one per persist, which is harmless at 2^32,
and then the same implementation is copied to a design that persists every
operation, and the count is off by half. Count the persist. More generally,
count at the cipher call and nowhere else: a count kept at the request layer
misses every write the server makes on its own behalf, the keyring rewrite,
the lease bookkeeping, the count itself, and those are exactly the writes a
request-side metric was never designed to see.

## Why the operator's estimate is not a guard

The alternative the technique replaces is guidance: publish the cipher's limit,
publish the metrics from which an operator can estimate the encryptions per
day, and let the operator schedule rotation. That is an optional guard, which
is an absent guard ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)):
a fleet converges on the default, and the default is that nobody has done the
arithmetic. Where the server cannot count, because the cipher call is not its
own, the absence is reported on the status surface as "operation count not
tracked for this term" rather than as zero, and the interval trigger is not
optional there.

## The rotation itself

When a trigger fires, the leader performs the append-only keyring rotation,
resets the in-memory counter for the new term to zero, persists the final
count for the old term against that term's record, and the old term's count
stops growing forever because nothing writes under it again. The record of
each term carries its birth time, its final count and the trigger that
retired it, so that an audit can answer "was any term ever used past its
budget" from the store rather than from an operator's memory.
