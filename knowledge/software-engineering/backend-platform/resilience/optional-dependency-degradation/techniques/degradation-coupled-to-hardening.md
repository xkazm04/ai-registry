---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: degradation-coupled-to-hardening
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
shared_with: []
use_when: [locking down a store's anonymous role, rotating a key to a narrower scope, a fallback path stopped writing and nobody noticed]
---

# Degradation coupled to hardening

Every fallback is written against a permission posture that was true on the day
it was written. Postures change, and they change for good reasons: an anonymous
role is stripped of its grants, row policies are switched on, a bucket's default
becomes deny, a key is rotated to the narrowest scope that covers its known
uses. Each of those is a security improvement, and each can silently remove the
grant a degradation path depended on.

The removal is silent because nothing in the fallback path looks broken. The
client still constructs — the values are present. The request is still issued.
The store rejects it. And if the write path swallows the rejection, or reports
success from a wrapper that only checked whether the call returned, the
deployment has entered a **silent data-loss mode** whose own configuration
document still describes the old behaviour. The document says "unset, so writes
go to the fallback store"; the truth is "unset, so writes are dropped". Nobody
is looking, because both the fallback and the hardening are working as designed
in isolation.

## The coupling, stated as a rule

**A change that narrows grants enumerates the degradation paths that relied on
those grants, and updates the configuration document in the same change.**

The enumeration is only possible because the blast-radius document exists —
which is the strongest practical argument for maintaining it. Without a
per-variable record of which surfaces fall back to what, "which fallbacks used
the anonymous role's insert grant?" is answerable only by reading every route.
With it, the question is a lookup, and a policy change acquires a checklist
instead of a hope.

The reverse direction holds too, and is cheaper to install: a fallback path
records the grant it depends on at the site where it writes, in one sentence. It
is the only note that will be in front of the person who later removes that
grant.

## When a fallback loses its grants, remove the fallback

The instinct on discovering the silent drop is to fix the grants — re-open just
enough permission for the fallback to work. Sometimes that is right. Often it is
not, because the hardening was correct and the fallback was relying on a
permission that should never have existed.

The rule for that case: **the fallback is removed, and the surface switches to
honest refusal.** A write path that cannot write is strictly worse than no write
path, because it is indistinguishable from one that works — it produces the same
response, the same latency, the same absence of alarms. Deleting the broken
fallback converts an invisible data-loss mode into a visible refusal, which is a
smaller product and a truthful one. Leaving it in place because removing it
would "lose a feature" is deleting the symptom rather than the defect
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) is
what the symptom was violating).

Where the fallback must survive, the honest fix is to give it a substrate with
no permission model to lose — process memory, a local file, an operator-owned
queue — which is the reason those fallbacks are preferred in the first place.
A fallback that depends on somebody else's policy is a fallback with a
dependency of its own.

And the comparison that makes this choice easy is worth stating as a
preference order: **a lossy fallback that is never silent beats a
durable-looking path that eats writes.** A local store that loses everything on
restart is a known, documented, bounded loss with a stated consequence; a
hosted store that accepts the call and rejects the row is an unbounded, silent
one. Given the choice between the two on an unconfigured deployment, take the
lossy one — and say in the document that it is lossy.

## Test degraded mode against the hardened posture

The test that would catch all of this is easy to write and almost always
written wrong. A degraded-mode test that runs against a development project —
where the anonymous role still holds the grants that production removed — is a
gate observing a proxy, and it passes exactly on the deployments where the
behaviour is wrong ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

So the target of the test is a store with production's policies applied. In
practice that means the policy definitions live in the repository and are
applied to whatever environment the tests run against, so that "hardened" is a
property of a checked-in artifact rather than of one long-lived project that
somebody configured by hand. When the policies cannot be replicated, say so in
the test's own header and downgrade the claim: this test proves the code path
runs, not that the write is permitted.

## Decision rules

- **A policy change that touches no configuration document is suspect.** Either
  no fallback depended on those grants — and the change says so in one line — or
  the document is now wrong.
- **Every fallback write states the grant it needs**, at the write.
- **A store rejection is never swallowed.** Permission denials on a fallback
  path are the exact signal this technique exists to preserve; they reach a door
  and they are counted separately from transport failures.
- **Prefer fallbacks with no permission model.** A local substrate cannot have
  its grants revoked by a security review.
- **Removing a fallback is a valid outcome of a security review**, and the
  refusal that replaces it is a smaller, truthful product.
- **The degraded path is exercised against hardened policies**, or the test's
  claim is downgraded in writing.
- **Rotation counts as hardening.** A key re-issued with a narrower scope is a
  grant change wearing a maintenance ticket, and it breaks fallbacks the same
  way.

## When the coupling does not apply

A dependency with no permission model, and a fallback that never leaves the
process, cannot drift this way — a temporary directory and an in-memory map
have no grants to lose. That is not an exemption to be claimed casually: the
question is whether the *fallback* has a permission model, not whether the
primary does. A fallback that writes to a second hosted store, a shared queue,
or a different bucket in the same account is fully inside this technique, no
matter how local it feels in the code.
