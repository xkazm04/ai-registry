---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: lease-vs-native-tracking
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [deciding whether an issued artifact gets its own lease record, the lease store grows by one entry per certificate, an artifact enforces its own expiry at every relying party, an operator asks for revoke-by-lease over a whole issuer]
---

# Lease versus native tracking

A lease is the issuer's instrument for artifacts that will not die on their
own. The technique is knowing which artifacts those are, and refusing the
instrument for the others. The rule: **an artifact that carries its own
expiry and is rejected by every relying party once that expiry passes — a
certificate is the canonical case — is tracked natively, in the issuer's own
store keyed by the artifact's identity, and is not leased unless the operator
opts in; the lease-less store is the default.**

## What a lease buys and what it costs

A lease buys three things. It schedules a revocation the remote would not
perform on its own. It gives the operator revoke-by-prefix and revoke-by-tree
over every lease under a path or a parent. And it lets the caller renew,
extending a life that would otherwise end. It costs a durable write at
creation, an entry in the expiry index that the issuer holds in memory, a
durable write per renewal, a revocation job with retries at the end, and a
place in every restore of the issuer's state, because leases are reloaded on
every leadership change or restart.

For a database user the trade is obviously right. Nothing but the issuer's
revoke will drop that user; there is no relying party that checks a
timestamp before accepting the password; the count is in the thousands. The
lease is the only reaper the user has, and
[creation-names-reaper](../../../_laws.md#creation-names-reaper) is
satisfied by nothing else.

For a certificate the trade inverts on every axis. The artifact's expiry is
enforced by every party that accepts it, without consulting the issuer; the
issuer's scheduled revocation at expiry does nothing a relying party's clock
did not already do. Renewal does not exist for the artifact — a certificate
is reissued, not extended. And the count is in the hundreds of thousands per
issuer, sometimes millions, so one lease per artifact is a million entries in
the expiry index, a million writes, a million revocation jobs that succeed
trivially against a target nobody needed to touch, and a restore that walks
all of them before the issuer can serve. The naive reading leases everything
because "every issued thing should be tracked"; the tracking is right and the
instrument is wrong.

## Native tracking

Natively tracked means the issuer keeps its own record of the artifact —
keyed by the artifact's identity, holding the artifact or enough of it to
rebuild any revocation entry, with its expiry — and reaps that record on the
issuer's own schedule rather than through the lease machinery. The reaper is
the bounded, resumable sweep of
[idempotent-revoke-and-give-up](./idempotent-revoke-and-give-up.md): it
prunes records whose expiry plus buffer has passed, in pages, recording its
progress. Revocation before expiry is still available; it is an operator's
explicit call by identity, and it writes the revocation record and publishes
it under that technique's ordering. What native tracking gives up is exactly
the two lease features that do not apply — scheduled revocation at expiry,
which the artifact does itself, and renewal, which the artifact cannot do —
and one that does apply and is the price: revoke-by-prefix over every
artifact an issuer minted.

That price is why the opt-in exists. An operator who needs "revoke every
certificate issued through this mount, now" as a single verb, and issues few
enough artifacts to pay for it, may turn leases on for that issuer. The
default is off, because the default is what a fleet converges on, and a fleet
that leases a million certificates by default falls over on its first
restart. The opt-in is per issuing configuration, visible in that
configuration, and its cost is stated next to the switch in units the
operator can check: entries in the expiry index and writes per issuance,
with the predicate that produced them
([count-carries-predicate](../../../_laws.md#count-carries-predicate) — "a
million leases" is a number an operator can act on only when it says a
million *of what, measured where*).

## The third mode: store nothing

Native tracking itself has a cost — one write per artifact and a store that
the sweep must walk — and at the volumes where a certificate is issued per
connection or per minute, an operator may need to opt out of it too. A role
that stores nothing issues the artifact and keeps no record of it. The price
is stated where the switch is: an artifact the issuer never recorded cannot
be enumerated and cannot be revoked by identity, because the issuer holds
nothing to build a revocation entry from. The mode is therefore for
artifacts that are non-sensitive or short-lived enough that revocation is
meaningless before expiry, and the role that enables it says so; a role that
stores nothing and also asks for a lease is contradictory, and the issuer
resolves the contradiction toward storing nothing with a warning, because a
lease over an artifact the issuer cannot find has a revocation callback that
can only ever report the target absent.

## The decision rules

When deciding whether a new artifact class is leased or natively tracked, ask
one question: **if the issuer did nothing at expiry, would the artifact stop
working anyway?** Yes means native tracking is the default and a lease is an
opt-in; no means a lease is mandatory, because the issuer is the only reaper.

When an artifact self-revokes but the operator wants revoke-by-prefix, offer
the lease as an opt-in on the issuing configuration, state its cost there,
and keep native tracking on regardless — a leased certificate is still
recorded natively, because the lease may be revoked before expiry and the
native record is what the revocation artifact is built from.

When the native store's sweep is disabled or unscheduled, the store grows
without bound and the issuer's list operations are the first to fail;
treat an unscheduled sweep as a misconfiguration the issuer reports, not a
default it accepts.

When a leased and a natively tracked artifact must be revoked together — a
role revoked with everything it issued — the lease store answers for the
leased ones and the native store is queried by the role's identity for the
rest; there is no single revoke-by-tree across both, and an operator's
runbook says so.

## When not to apply it

An artifact whose expiry is enforced *only* by the issuer — a token the
issuer validates on every use and could refuse regardless of its stated
expiry — is not self-revoking in the sense above, because the relying party
is the issuer; it is the lease's own territory, and the question of native
tracking does not arise. The technique is about artifacts that leave the
issuer and are judged elsewhere.
