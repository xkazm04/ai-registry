---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: persist-before-provision
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [ordering the lease write against the remote create, issuing from a node whose storage is read-only or degraded, a credential exists remotely that no local record accounts for, deciding what a caller receives when the ledger write fails]
---

# Persist before provision

The issuer has two writes to make when it mints a credential: one into a
remote system it does not own, one into its own storage. The order of the two
is the whole technique. The rule: **when the lease cannot be stored, refuse to
create the remote credential** — the ledger precedes the effect, and a
credential whose lease was never written is a credential nobody will revoke.

## Why the natural order is the wrong one

The natural order is create-then-record: call the remote, receive the
credential and its identity, then write the lease with the identity you now
have. It reads well because the lease *needs* the identity, and the identity
does not exist until the remote answers. The order fails at exactly one point
and that point is the one that matters: the remote call succeeds and the lease
write does not. Storage is on a replica that cannot accept writes; the store
is full; the node lost its lock between the two calls; the process was
killed. In every case the remote credential now exists, authenticates, and
appears in no ledger. The caller may or may not have received it. The issuer
cannot list it, cannot revoke it on schedule, and does not know to look for
it. This is an unreaped resource in the strict sense of
[creation-names-reaper](../../../_laws.md#creation-names-reaper): something
was created and the thing that names its destruction was never written. The
difference from a leaked temp file is that this one grants access.

## The procedure

Before the remote call, prove the lease can be written. The proof is a write,
not a check: a probe that asks "is storage writable" answers about the instant
of the probe, and the gap between the probe and the real write is the same gap
the technique exists to close. The cheapest honest proof is to write the
record that will become the lease — a placeholder carrying the request's
identity, the role, the requested lifetime and the revocation function name,
with the credential identity still blank — and let that write's success be the
permission to call the remote. On the remote's success, the placeholder is
completed with the credential's identity and the computed expiry. On the
remote's failure, the placeholder is deleted, and if the delete fails the
placeholder stays as a witness that a sweep can inspect and discard, because
a record with no credential identity is provably harmless.

Where the storage layer refuses writes as a class rather than as an event —
a read-serving replica that forwards writes to a leader — the refusal arrives
before the remote call and the whole request is forwarded or failed. That is
the technique working as designed: the issuing node that cannot persist a
lease is not an issuing node.

A subtler form of the same rule governs *what the lease write contains*. The
lease must carry everything the revoke needs — the credential identity, the
role or template it was issued under, the revocation function's name, the
connection it was created through — because at revocation time the request
that created it is long gone and the role may have been edited or deleted. A
lease that stores only the identity and expects to re-derive the rest from
live configuration revokes correctly on the day it was written and fails the
week the role is renamed.

## The decision rules

When the lease write fails before the remote call, return the storage error
and nothing else. The caller receives no credential, the remote holds no new
user, and the failure is spelled as a failure
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)):
a response that reports success with an empty credential, or that returns the
credential with a warning that it was not recorded, converts a clean refusal
into an untracked grant.

When the remote call fails after the placeholder is written, delete the
placeholder and return the remote error. The order of the two is not
important because a placeholder without an identity is harmless; what matters
is that the remote error is the one the caller sees, not a secondary error
from the cleanup.

When the remote call succeeds and completing the lease fails, the issuer is in
the one state the technique cannot fully prevent: a credential exists and the
record that would govern it is a placeholder. The correct response is to
attempt revocation of the just-created credential immediately, using the
identity still in hand, and to return an error either way. Returning the
credential because "it works" hands the caller a grant the issuer has already
lost track of. The placeholder stays with a marker that the completion failed,
so a sweep can retry the revoke; this is the seam with
[wal-per-external-side-effect](./wal-per-external-side-effect.md), which
generalises the witness to every remote mutation.

When the system offers an authority class that is deliberately never
persisted — an authentication that lives only on the request — nothing that
creates a lease may be issued under it. The technique's rule inverts cleanly:
if the caller's authority cannot be recorded, then a credential minted for it
cannot be recorded either, and the issuer refuses the mint or revokes it in
the same request and errors. An issuer that lets a non-persisted authority
mint a persisted lease has created a credential whose parent no ledger holds.

## When not to apply it

A remote system that creates credentials with its own bounded expiry and no
issuer-side obligation — a self-revoking artifact tracked natively rather than
leased, in the terms of
[lease-vs-native-tracking](./lease-vs-native-tracking.md) — still records the
artifact before it releases it, but the record is the issuer's own index, not
a lease, and the consequence of losing it is an unlisted artifact rather than
an unrevoked one. The order rule holds; the stakes are lower, and an issuer
may choose a cheaper witness there.

The technique also does not apply to reads. Looking up an existing credential,
renewing a lease that already exists, or checking a role are not effects and
carry no ledger obligation beyond what the lease already holds. Renewal
rewrites the lease and is subject to the same refusal — a renewal whose
extended lease cannot be persisted is refused, and the caller keeps the
lifetime it already had.
