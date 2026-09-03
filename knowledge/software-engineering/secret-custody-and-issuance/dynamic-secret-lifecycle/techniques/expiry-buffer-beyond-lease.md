---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: expiry-buffer-beyond-lease
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [setting the remote credential's own expiry at creation, deciding what a renewal does to the remote expiry, a revoke keeps arriving after the remote already expired the credential, a credential is found alive after its lease ended]
---

# Expiry buffer beyond lease

Many remote systems can expire a credential on their own: a database user
with a valid-until clause, a cloud role binding with a condition on time, a
certificate with a not-after field. The issuer sets that expiry when it
creates the credential, and the technique is the value it sets. The rule:
**the remote credential's own expiry is the lease's lifetime plus a buffer**,
so that the lease is always the earlier death and the remote's expiry is the
backstop that catches what the issuer's revocation missed, and never the
mechanism the issuer relies on.

## Two clocks, one order

There are two deadlines on every leased credential. The lease's deadline is
kept in the issuer's storage and read by the issuer's expiry loop; when it
arrives, the issuer runs the revocation function. The remote's deadline is
kept in the remote system and read by that system's own enforcement; when it
arrives, the credential stops authenticating whether or not the issuer did
anything. The naive reading sets the two equal: the caller asked for an hour,
the lease lasts an hour, the remote user is valid for an hour. Equal is a race
with three runners. The remote's clock is not the issuer's clock, and an hour
on one is an hour and some seconds on the other in either direction. The
issuer's revocation does not fire at the lease's instant; it fires when the
expiry loop reaches it, after whatever the loop was doing, plus the network
round trip to the remote. And the credential is in use until the last moment
of its lease by a caller who was told it would last an hour.

Three outcomes follow from equal deadlines and all of them are bugs. The
remote expires first and a caller's last request under a valid lease is
rejected by a credential the issuer still says is live. The remote expires
first and the issuer's revoke arrives at a user that no longer exists, which
is survivable only if revocation is idempotent
([idempotent-revoke-and-give-up](./idempotent-revoke-and-give-up.md)) and is
noise even then. Or the issuer's revoke lands first and the remote expiry was
never exercised, which is the intended path — but the issuer cannot tell it
apart from the first two, so nothing in production reports which order
actually happens.

The buffer removes the race by choosing the order. The lease dies first,
always. The remote's expiry sits far enough behind it that the issuer's
revocation has landed long before the remote would have acted on its own. The
remote's expiry then does exactly one job: if the issuer never revokes — the
issuer was down for the whole window, the lease record was lost, the
revocation was exhausted into an irrevocable state — the credential still
stops working, on its own, a buffer later.

## The procedure

At creation, compute the lease's lifetime from the ladder
([ttl-ladder-derivation](./ttl-ladder-derivation.md)), then set the remote's
expiry to the lease's expiry instant plus the buffer. The buffer has a floor
and a choice above it. The floor is the issuer's own internal lag: where the
backend that talks to the remote computes the lifetime and a core that
registers the lease recomputes it afterwards, the lease's instant is later
than the remote's by the time between the two computations, and a buffer
smaller than that gap makes the remote die first on every request. Above
the floor the operator chooses which of two postures the issuer takes. A
buffer of seconds keeps the backstop close behind the lease, so a late
revocation routinely meets an already-expired credential and idempotent
revocation ([idempotent-revoke-and-give-up](./idempotent-revoke-and-give-up.md))
stops being a courtesy and becomes load-bearing. A buffer of minutes, sized
past the expiry loop's worst-case lag and the remote's clock error, means
the issuer's revocation lands first in the normal case and the backstop
fires only when the issuer was absent. Neither is wrong; the issuer states
which it runs. A buffer longer than the typical lease turns the backstop
into a second grant the operator did not ask for, and that one is wrong.

At renewal, do it again. A renewal extends the lease; the remote's expiry was
computed from the old lease and now sits inside the new one, which is the
race the buffer was supposed to remove. Every renewal that extends the lease
therefore also updates the remote's expiry to the new lease instant plus the
buffer, through whatever the remote offers for altering an existing
credential's validity. A renewal that extends the lease and leaves the remote
alone hands the caller a lease the remote will not honour for the lease's
final buffer-and-more.

The renewal update is itself a remote mutation and inherits the write-ahead
discipline of [wal-per-external-side-effect](./wal-per-external-side-effect.md);
if the remote refuses to extend the credential, the renewal fails and the
lease keeps its old deadline, because a lease extended past its remote's
validity is a lie the issuer told about itself.

Record the derivation. The remote expiry is a derived value — lease expiry
plus buffer — and a stored derived value names how it is recomputed
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
An issuer that stores the remote's expiry on the lease, and the buffer as a
single configured constant, can answer "why is this user valid until then" and
can re-derive the expected remote expiry when auditing the remote for
credentials that should not be there.

## The decision rules

When the remote cannot express an expiry at all, the buffer does not exist and
the lease is the only death; the issuer's revocation is then load-bearing
rather than primary, and the revocation lane's retry and irrevocable handling
carry the whole risk. Say so in the issuer's documentation for that remote,
because an operator who assumes every backend has a backstop will size the
revocation lane for the ones that do.

When the remote's expiry cannot be altered after creation, renewal has a hard
ceiling: the lease may be extended only up to the remote expiry minus the
buffer, and a renewal past that is refused. The alternative — re-creating the
credential with a later expiry on renewal — is not a renewal; it is a
rotation, and the caller holding the old value must be told.

When an operator asks for the remote expiry to equal the lease "so the
credential is not usable a second longer than granted", the answer is that
the remote's expiry was never the grant; the lease is. The caller's authority
ends when the lease ends and the issuer revokes; the buffer is the time the
issuer gives itself to do that, and shrinking it to zero does not shorten the
grant, it makes the grant's end a coin toss.

## When not to apply it

A self-revoking artifact tracked natively rather than leased
([lease-vs-native-tracking](./lease-vs-native-tracking.md)) has one clock,
not two: the artifact's own expiry is the grant, there is no lease to die
first, and the buffer has nothing to sit beyond. There the issuer's job is to
make the single expiry honest and to sweep its own records past it.
