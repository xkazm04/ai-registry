---
layer: technique
type: technique
subject: authorization
technique: delegated-authority
status: forged
laws: [verdict-survives-boundary, unknown-is-not-a-value, one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [something in the system performs work for a caller rather than by a caller, an audit trail cannot say who a privileged action was actually for, deciding what authority a queued job runs with when it finally executes]
---

# Delegated authority

The rest of this subject answers "may this caller do this?" — one caller,
one hop, one decision. This technique covers what happens when the thing
performing the operation is not the thing that wanted it: an intermediary
forwarding a request, a worker draining a queue somebody else filled, an
automated runner acting for a person, one component invoking another
that is more powerful than its own caller.

That situation is the default rather than the exception in any system
with more than one tier, and it has a standing name because it is old:
the deputy that is confused about whose errand it is running. This
subject's neighbours already handle their own instances of it — the
brokered door that refuses to attach a secret to a caller-chosen
destination ([brokered-egress](../../credential-vault/techniques/brokered-egress.md)),
and the acting layer that resolves a model-proposed identifier for
existence, ownership and entitlement before touching it. Both of those
defer the entitlement model itself to this subject. This is that model.

## Ambient authority is the default, and the default is the bug

When one component calls another, the callee runs with **its own**
privileges. Nothing about the call arranges otherwise; the caller's
narrower authority simply is not present at the callee, and there is no
error, because nothing was violated. The intermediary was allowed to do
what it did. It was only doing it for the wrong reason.

> **Privilege that is available without being asked for is privilege
> that will be exercised on somebody else's behalf.** An intermediary
> more powerful than its caller upgrades every request it forwards,
> silently and by construction.

The subject's core framing — that authorization is a property of the
dispatch architecture — holds here and cuts a second way. A gate at the
chokepoint sees *the channel that called it*. Where the channel is also
the originator, the tier assigned to that channel is the right input.
Where anything forwards, the channel is a proxy for the originator, and
a proxy that grades higher than the thing it stands for is exactly the
hole. **A tier is a property of a channel; an authority is a property of
a run**, and the two coincide only in the single-hop case the tier table
was built for.

## Authority travels as a value — it is never re-derived at the far end

The far end cannot reconstruct whose errand this is. It can observe that
the request arrived over a trusted channel, and that observation is true
and useless: the trusted channel is the deputy. So the originating
authority is **carried**, from the point it was established, across every
boundary that acts on it, as a typed value the receiver checks rather
than a property the receiver infers
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).

Two failure shapes follow from getting this wrong, and they are opposite:

- **Inference.** The receiver decides the authority from the channel, the
  network position, or the fact that the call came from inside. This is
  the deputy in its plain form.
- **Impersonation.** The intermediary carries the originator's own
  credential and acts as them indistinguishably. This gets the *scope*
  right and destroys the *account*: nothing downstream, including the
  audit trail, can separate what the person did from what the machinery
  did for them, so every later question about accountability has no
  answer to read.

The correct shape keeps both facts: **on whose behalf**, and **by whom**.
An arriving request that carries the first and not the second is running
with an unknown delegate, and an unknown delegate must not be resolved to
"none"
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)) — a
direct request and a forwarded one are different events and the model
distinguishes them or it does not have this property at all.

## Every hop narrows, on both axes

The subject's intersection rule for scopes is the right rule here, applied
across hops rather than across a grant and a resource: **effective
authority is the intersection of every authority in the chain**, and it
can only shrink. A powerful intermediary acting for a weak originator gets
the originator's answer. Union semantics across a chain — the operation is
permitted because *somebody* in it was allowed — is the failure written
out as a design.

Narrowing has a second axis that single-hop reasoning never needs:
**who the delegation is good for**. An authority minted so an intermediary
can perform one errand at one downstream component should be refused when
presented at a different one. Without that binding, a delegation obtained
legitimately for a low-value destination is a general-purpose credential
for everything the originator can reach, and the narrowing on the first
axis buys much less than it appears to. Each hop therefore mints for a
named recipient and for the minimum the errand needs — never forwarding
the authority it received unchanged, which is the same act as having no
delegation model.

The chain is recursive: a delegate may itself delegate, and each further
hop narrows again. Depth is not a special case, but it is a place to
enforce a limit, because an unbounded chain is unauditable by anyone
trying to read it later.

## The audit line has two subjects now

[authorization-audit](./authorization-audit.md) records a decision with
its caller. Under delegation, "the caller" is at least two parties, and
recording either one alone loses the question people actually ask.
Recording only the originator makes automated action indistinguishable
from human action. Recording only the delegate makes the trail a list of
things the machinery did for nobody in particular.

So the decision record carries the chain — originator, each delegate, and
the errand the delegation was minted for — and the gate that reads
requirements reads them against the *intersected* authority rather than
against whichever party is most convenient to look at
([gate-sees-target](../../../_laws.md#gate-sees-target)). The reason
returned on refusal names which party in the chain fell short, because
"denied" over a chain of three is not a diagnosable answer.

## Delegation across time is the same problem, aged

Deferred work is delegation with a gap in it: a caller enqueues, a worker
executes later, and the worker's own authority is usually broad because it
must serve every kind of item. Two rules, both of which follow from the
above rather than being new:

- **Capture at enqueue, check at execute.** The originating authority is
  recorded with the item, and the check happens when the work actually
  runs — not once, at submission, on the assumption that the answer
  keeps. It does not keep: this is precisely the window in which grants
  are revoked and policies tighten, and a check against the submission-
  time answer passes exactly when the world has moved
  ([scope-design](./scope-design.md) states the same rule for a stale
  copy of a grant).
- **An item whose originating authority cannot be resolved is refused,
  not run.** The originator was deleted, the grant was revoked, the
  record is unreadable — each is an unknown, and the worker's own broad
  authority is sitting right there as the tempting default. Running it
  under the worker's authority is the deputy problem with a queue in the
  middle ([failure-direction](./failure-direction.md)).

## What this technique does not own

Establishing the originator's identity in the first place is
authentication, and outside this subject. Holding and applying the secrets
an errand may need is the vault's, which calls into this kernel for its
decision and never the reverse. And the acting-layer doors that consume
this model — resolving an untrusted proposal for existence, ownership and
entitlement before acting on it — belong to the subjects that own those
surfaces; this technique supplies the entitlement model those doors are
told to consult.
