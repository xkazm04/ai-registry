---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: idempotent-revoke-and-give-up
status: forged
laws: [identity-survives-reuse, deletion-is-not-repair, creation-names-reaper]
shared_with: []
use_when: [writing the revocation callback for a minted credential, a revoke fails because the target is already gone, ordering local revocation against publishing a revocation list, deciding when revoked-artifact records may be deleted, an issuer's signing key has expired but its revocation list is still consulted]
---

# Idempotent revoke and give up

Revocation is the verb the issuer runs most often, in the worst conditions,
against the widest variety of remote states, and the technique is what it
must be true of. Three rules. **A revoke succeeds when the target is already
gone.** **Local revocation lands first and publication is best effort.**
**Cleanup removes revocation and artifact records only past expiry plus a
safety buffer, and never removes the key that signed a revocation artifact.**

## Revoke succeeds against an absent target

The issuer's revoke will meet targets that no longer exist, routinely and by
design. The remote's own expiry backstop
([expiry-buffer-beyond-lease](./expiry-buffer-beyond-lease.md)) fires when
the issuer was late. An operator deleted the user by hand during an incident.
The remote was restored from a snapshot taken before the credential existed.
The revoke itself already ran once and the acknowledgment was lost. In every
case the desired end state — no such credential — is already true, and a
revocation function that returns an error on "not found" reports a success as
a failure. The consequence is not one error. The revocation lane treats the
error as retryable, retries with backoff, exhausts its attempts, and marks the
lease irrevocable; an operator now has a queue of irrevocable leases for
credentials that are not a risk to anyone, and the queue hides the few that
are.

The rule: a revocation callback distinguishes "the target is absent" from
every other failure and returns success for it. The identity the revoke uses
is the one the lease stored at creation
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)) — a
username, a serial, a resource name — and not a value re-derived from
configuration that may have changed, because a revoke that computes the wrong
identity finds nothing, reports absent, and succeeds against the wrong
target. Absent must mean *this* identity is absent.

The mirror case is a revoke against a target that is present but already
past its own expiry. Adding it to a published revocation artifact does
nothing a relying party's clock did not already do, and every such entry
makes the artifact larger for everyone who fetches it. The rule: a revoke of
an expired artifact returns success with a warning that nothing was
published, and the operator who genuinely needs expired artifacts listed —
a relying party with a broken clock, an audit that reads the list as a
ledger — opts in per issuer. Allow a small grace past the expiry when
comparing, because lease and artifact times are truncated to different
granularities and an artifact one second past expiry is not yet safe to call
expired.

What the callback must not do is swallow every error into success. A
connection refusal, an authentication failure against the remote, a
permission error — each means the credential may still exist and the revoke
did not happen; each is returned as a failure so the lane retries. The
classification is a typed outcome, not a string match on the remote's
message, because the remote's messages change and the lane's behaviour must
not.

## Local first, publish best effort

Where revocation has a published form — a revocation list, a status
responder, a broadcast to relying parties — there are two writes: the issuer
records that the artifact is revoked, and the issuer publishes that fact. The
order is fixed: **the local record lands first, then publication is
attempted**, and a publication failure does not undo the local record or fail
the revoke. The reasoning is enforceability. A revocation the issuer has
recorded is enforced at the issuer's next decision — the next lookup, the
next list rebuild, the next status query — regardless of whether any party
has been told. A revocation the issuer published but failed to record is
enforced nowhere the issuer controls, and the next rebuild of the published
artifact will silently un-revoke it.

The naive reading builds the published artifact and the local record in one
transaction, or publishes first because "that is what relying parties read".
The first couples the revoke's success to the publication path's health, so a
signing failure or a distribution outage makes revocation impossible exactly
when an operator is trying to contain an incident. The second creates the
un-revoke race above.

Publication failure is not silent, though. The issuer surfaces it — a warning
on the revoke response, a counter on its health surface, a rebuild scheduled —
so that "revoked locally, not yet published" is a visible state an operator
can act on, rather than a discrepancy discovered when a relying party accepts
a revoked artifact.

## Give up honestly: cleanup keys on expiry, not on revocation

Every record the issuer keeps about issued or revoked artifacts eventually
has to go, or the store grows without bound
([creation-names-reaper](../../../_laws.md#creation-names-reaper): the
record was created, and the sweep that removes it is named here). The
question is when a record may go, and the naive answer — once the artifact is
revoked, the record has done its job — is wrong. A revoked artifact can still
be presented until its own expiry passes; a relying party that checks
revocation must find the revocation for as long as the artifact could be
presented; and a record deleted at revocation time removes the evidence at
the moment it is still needed.

The rule: **a record of an issued or revoked artifact is removed only after
the artifact's own expiry plus a safety buffer has passed.** The buffer
covers clock skew between the issuer and every relying party, and the lag
between the sweep's decision and the last published artifact that still
listed the entry. The sweep is a bounded, resumable operation — it walks the
store in pages, records where it stopped, and can be cancelled without
leaving a half-pruned list — because the store it prunes is the one that
grows to millions of entries, and an unbounded sweep is an outage.

One record is never pruned by the sweep on expiry alone. When an issuer's own
signing key expires — the authority that signed both the artifacts and the
revocation artifacts — the artifacts it signed may still be presented, and the
revocation artifact that names them must still be verifiable. Removing the
expired issuer's key removes the ability to verify or rebuild the revocation
artifact that is the only enforcement left for those artifacts
([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair): the
expired key is not the problem; deleting it removes the visibility of the
revocations it guards). The key stays until every artifact it signed is past
expiry plus buffer, and its removal is an operator's explicit act with that
condition checked, never a side effect of a sweep. The issuer record itself
may be pruned once its own expiry plus a buffer measured in months has
passed — with one exception the sweep enforces rather than assumes: the
issuer currently designated as the default is never removed by the sweep,
expired or not, because removing it changes what the next issuance signs
with, and that is an operator's decision announced loudly, not a cleanup's
side effect.

## The decision rules

When the revocation function is asked to revoke a target it cannot find by
the stored identity, return success and record the outcome as "absent at
revoke" rather than "revoked", so that a later audit can distinguish the two.

When revoking and publishing, write the local record, attempt publication,
and on publication failure return success with a visible warning and a
scheduled rebuild; never return failure, and never publish without the
record.

When the revocation lane has exhausted its attempts against a target that
still answers with a real error, the lease becomes irrevocable — a terminal
state with an operator surface, not a retry with a longer wait — and the
issuer's records keep the lease so the operator can revoke by hand and clear
it. The lane's retry shape and the terminal state's surface are the work
lane's discipline and are not restated here.

When sizing the cleanup buffer, size it from measured skew and publication
lag, and record the number with its reason; a buffer chosen as a round number
will be shortened by the next operator who finds the store large.

## When not to apply it

Revocation that is purely local — a token the issuer itself validates, with
no remote and no published artifact — has one write and no ordering problem;
the first rule still holds (revoking a token that is already gone is
success), and the other two collapse.
