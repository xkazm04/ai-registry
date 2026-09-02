---
layer: application
type: application
subject: plan-entitlements
technique: entitlement-lifecycle-revocation
stack: node
verified_on: 2026-09-02
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The stale-paid fence, moved from the event's snapshot to the provider's state

How a Next.js product fulfilling Polar subscriptions decides whether a renewal
`order.paid` may assert a tier — and what nine replayed lifecycle sequences
said about reading that decision from the event payload versus from the
provider. Citations are against Ascent's `src/app/api/billing/webhook/`
route and its tests, Node `24.x` per `engines`, `@polar-sh/sdk` 0.48 and
`@polar-sh/nextjs` 0.9.

## 1. Two of the three flipped rules were already in the tree

The technique's status mapping names a retries-exhausted state that does not
entitle, and warns that a provider which leaves the label at `past_due`
turns "past due entitles" into "entitles forever". Here the closed set is
`ENTITLING_SUB_STATUSES = {active, trialing, past_due}` (`route.ts:52`), and
Polar's retries-exhausted state is a distinct label, `unpaid`, which the set
excludes; the comment beside it records the reason the product needs no
grace of its own — exhaustion also fires `subscription.revoked`, which is
the downgrade handler. The grace is Polar's dunning window, and the product
trusts it to end. That trust is the one thing this tree cannot prove: if the
dunning configuration ever stopped emitting `revoked` on exhaustion, nothing
here would notice, because no reader compares elapsed time since the first
failed charge. The bounded-grace clause is therefore *owed on a condition*,
not missing.

The grant-time rule — an unknown tenant is a retry, not a refusal — is
realized at `route.ts:154-156` by throwing, with the mechanism spelled out in
the comment: the adapter answers `200` on a normal return, so a `return` on a
missing org would tell Polar "delivered" and lose the purchase. Three tests
pin the throw. Conformant, and for the right reason.

## 2. The third rule was a documented hole: the fence read the snapshot

The downgrade guard's step 3 says to compare the subscription's *state
fetched from the provider*, never delivery order, timestamps, or the payload.
The tree's fence against a resurrected tier — an old renewal `order.paid`
arriving after `subscription.revoked` — compared `order.subscription`, the
subscription object Polar embeds in the order event. That object is the
snapshot taken when the event was *built*, and a redelivery re-sends the
same snapshot. The file said so itself, in a `LIMITATION` comment above the
check: an event whose own payload showed the lapse was caught, but "a
redelivery carrying a stale *active* snapshot would still pass", and the
remedy the author had in mind was a persisted per-subscription revoked-at
marker, deferred as a schema change.

The technique's robust form is cheaper than that: no new table, one read.
The webhook is a trigger; the provider's current object is the state.

## 3. The A/B: nine sequences, 4/9 → 0/9

`route.replay.test.ts` runs the real handlers over an in-memory org-plan
store and a mutable "provider truth" that the sequence steps update, with
`getPolar()` mocked to answer `subscriptions.get` from that truth. The
predicate: after the sequence, is the org on a tier the provider's final
state does not owe it?

Arm A (the fence on the snapshot) leaves the org on `pro` in four of nine
sequences: the renewal redelivered after `revoked`; `revoked` overtaking the
renewal it followed; immediate cancel then redelivery; and the provider
unreachable during a redelivery. Arm B — `currentSubscription()` fetches the
subscription by `order.subscriptionId` when a client is configured, throws on
fetch failure so Polar retries, and falls back to the snapshot only when there
is no access token — leaves zero. The five sequences that must still grant
(a lone renewal, a plain duplicate, cancel-at-period-end then redelivery, a
late event whose snapshot and provider both say canceled, a one-time order)
grant identically under both arms. The existing 35 webhook tests were
unchanged by the patch except for one added mock export.

The fourth failing sequence is worth naming because it is the technique's
grant-time rule applied on the revoke side: when the provider cannot be read,
arm A asserted the tier from the snapshot it had, arm B refused to assert
anything and failed the delivery. "Fall back to the payload" is the
stale-active case wearing a different name, which is why the patch does not
fall back on error, only on the structural absence of a client.

## 4. What the realization cannot do

- **A webhook-only deployment keeps the hole.** With no `POLAR_ACCESS_TOKEN`
  there is nothing to fetch with, and the fence reverts to the snapshot. The
  product's checkout needs the token, so a deployment that can sell plans can
  also fetch; but the fallback is silent, and a deployment misconfigured
  halfway would look conformant in logs.
- **One provider read per renewal.** The cost the technique's cheaper form
  avoids — recognizing transitions by name — is not available here, because
  Polar's order event carries a status snapshot rather than an `old_status →
  status` pair; there is no named transition to match. The read is the only
  form this provider's payload allows.
- **The sequences are constructed, not recorded.** They are the delivery
  patterns Polar documents (at-least-once, unordered), not captured
  production traffic; a recorded corpus would upgrade the count from
  "predicate over documented shapes" to "predicate over what happened".

## Reconciliation summary

Confirmed: the closed status set with retries-exhausted refusing; an unknown
tenant at grant time failing the delivery, with the adapter's `200`-on-return
named as the reason a throw is required. Applied: the fence against a
resurrected tier now reads the provider's current subscription rather than
the event's embedded snapshot, and a paired replay measured the change at
4/9 → 0/9 resurrecting sequences. Owed: a product-side bound on `past_due`
grace, on the condition that the provider's dunning stops emitting `revoked`
on exhaustion — today nothing in the tree measures elapsed time since the
first failed charge.
