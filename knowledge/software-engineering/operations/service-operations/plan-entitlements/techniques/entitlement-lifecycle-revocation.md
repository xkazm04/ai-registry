---
layer: technique
type: technique
subject: plan-entitlements
technique: entitlement-lifecycle-revocation
status: forged
laws: [creation-names-reaper, failure-not-empty-success, deletion-is-not-repair]
shared_with: []
use_when: [handling subscription lifecycle events, deciding what a lapsed customer keeps, writing a downgrade handler]
---

# Granting, holding, and revoking entitlement

Entitlement is a **lease**. Something grants it, something must take it back,
and the taking-back is where the money-out trust boundary lives — the point
where the product stops delivering value it is no longer being paid for, and
the point where a mistake either gives the product away or removes access
from a customer who is paid up. Every grant states what revokes it and when,
per [creation naming its reaper](../../../../_laws.md#creation-names-reaper).

The delivery of the lifecycle event — proving the sender, deduplicating,
bounding the payload, replaying — is not this technique's concern. This
technique owns what an admitted event **means**.

## Which states entitle

The status vocabulary of a subscription is larger than "active", and mapping
it to entitlement is a policy decision written down as a closed set rather
than discovered one incident at a time. The defensible mapping: **active**
entitles; **cancelled but within the period already paid for** entitles,
because the customer bought that period and ending access early is a refund
the product did not give; **past due inside the payment-retry window** usually
entitles, because a failed charge is more often an expired card than an intent
to leave; **trialing** entitles under the trial's terms; **retries exhausted**
— the state a provider moves to when the last retry fails and the subscription
is left standing rather than cancelled, still generating invoices that nobody
attempts to collect — does not, because the grace has already been spent; and
**expired or fraud-flagged** does not, immediately. A termination timestamp
overrides any status label — a subscription whose end date has passed never
entitles, whatever it is called.

Four qualifications keep that mapping from being read as more than it is:

- **"Active" is the provider's good standing, not proof of payment.** Providers
  document the cases where the two part: a payment method with delayed
  confirmation activates the subscription first and, if the debit later fails,
  voids the invoice while leaving the status active; an invoice that cannot be
  finalized leaves the subscription active and uncollectable; and pausing
  collection — a deliberate free period — keeps the status active by design.
  Decide for each whether the product honours the provider's verdict, and say
  so. The default that matches the providers' own guidance is to honour it,
  because the alternative is a second dunning policy.
- **The retries-exhausted state is provider-configured, and one configuration
  hides it.** After the last retry a provider may cancel the subscription, move
  it to a distinct unpaid state, or leave the label at past-due. Under the
  third, "past due entitles" is "entitles forever", so the product bounds its
  own grace — elapsed time since the first failure, or a count of failures —
  instead of trusting the label to expire.
- **A period end is a renewal boundary, not a termination.** The renewal
  invoice is created and paid *after* the period rolls — providers hold it for
  an hour or more before attempting the charge, and longer when the product's
  own endpoint is slow to acknowledge it — so a stored period end compared
  strictly to the clock revokes paying customers at every renewal. Compare
  period ends with leeway, on the order of a day; compare termination
  timestamps exactly. They are different fields and are stored as different
  fields.
- **A refund does not by itself change the subscription.** It is an event on a
  charge; the provider does not move the subscription's status for it, and
  mapping the charge back to its subscription is a lookup the product performs.
  A refund revokes what the refunded invoice paid for — a purchased pack, a
  period — and the subscription's own state remains the authority on the tier.
  Disputes and chargebacks are the fraud-flagged case, and there the provider
  leaves the access decision to the product.

Write this as one closed set consumed by every reader. A second interpretation
of the status vocabulary elsewhere in the product is a second billing policy.

## The downgrade guard: remove only what this conferred

A tenant's entitlement can have several sources — a subscription, a purchased
balance, a promotional grant, an enterprise agreement, a second subscription
on the same tenant. A cancellation handler that resets the tenant to the floor
destroys entitlements that nobody cancelled, and the customer discovers it
before you do.

The guard, mechanically:

1. **Grants record their source.** Every entitlement row carries what
   conferred it — which subscription, which purchase, which grant.
2. **Revocation is scoped to that source.** The handler removes what *this*
   subscription conferred and re-derives the tenant's effective entitlement
   from whatever remains.
3. **The handler verifies before it lowers.** If the event's subscription is
   not the one currently conferring the tenant's tier — a stale event, a
   superseded subscription, a second subscription the tenant upgraded to —
   the downgrade is a no-op, recorded as such. Out-of-order lifecycle events
   are normal, not exceptional; a handler that assumes ordering will
   eventually downgrade a customer who just upgraded.
4. **Balances are not tiers.** A purchased balance survives a subscription
   ending; it was bought outright. Zeroing it on downgrade is confiscation.

Two mechanical forms of step 3 are worth naming, because they cover the two
realistic collisions:

- **Rank comparison.** If the tenant's current tier *outranks* the tier this
  dying subscription conferred, skip the downgrade entirely. The scenario is
  ordinary: a tenant bought a middle tier, was later granted a higher one by
  another route — a manual override, a negotiated agreement, a second
  purchase — and the now-redundant lower subscription lapses. Flooring
  unconditionally strips the higher grant, and it does so for exactly the
  population that override exists to serve. The rank comes from the tier
  model's declared ordering, not from string comparison.
- **Unrecognized products confer nothing and therefore revoke nothing.** A
  lifecycle event for a product that is not in the plan mapping — a different
  line of business, a deployment that does not sell tiers this way — must not
  touch the tenant's tier. Log it as unrecognized so a mapping misconfiguration
  is visible; do not treat "I don't know what this was" as "remove
  everything".
- **Compare state, never delivery order or event timestamps.** Providers state
  outright that delivery order is not guaranteed, and at least one stamps
  events at second granularity and tells integrators not to order by it — two
  events from one transition can share a stamp. A guard that discards "older"
  events by timestamp therefore fails on exactly the bursts it exists for. The
  robust form treats the event as a trigger and fetches the subscription from
  the provider before acting, applying its current state rather than the
  payload's snapshot; the cheaper form applies only the transitions the product
  recognizes as meaningful and ignores the rest by name, so an irrelevant
  intermediate state cannot overwrite a relevant final one.

### Idempotence is asymmetric between grant and revoke

Lifecycle delivery is at-least-once, so both directions must tolerate replay —
but they need different machinery, and knowing which is which saves a table.
**A grant that adds a quantity is not naturally idempotent**: replaying it
grants twice, so it needs a key — the external transaction identifier —
recorded and checked. **A revocation that sets state to a fixed value is
naturally idempotent**: setting the tier to the floor twice lands in the same
place, which is why two different cancellation events for the same
subscription, or a redelivery of either, converge without any per-event
bookkeeping. Spend the key where replay actually costs money.

## The granted amount is derived, never received

When a purchase confers a quantity — credits, seats, a quota — that quantity
is derived **server-side from the product that was purchased**, by looking up
the purchased product in the product's own mapping. It is never read from a
field in the request or the event payload that a client could have shaped.
This is the one place in the subject where the difference between "trusted
because it came from the payment provider" and "trusted because we looked it
up" is the difference between a billing system and a free-credit dispenser.
The event tells you *which product*; the mapping tells you *how much*.

## An unknown tenant at grant time is a retry, not a refusal

The gate's rule — an unknown tenant refuses — is wrong at the moment of
granting, and the two are easy to confuse because they share a lookup. A
lifecycle event can arrive before the product has created the row it refers
to: the customer is redirected to the success page before the delivery lands,
or the delivery lands before the row the success page creates. Provider
guidance is explicit that fulfilment must be idempotent, keyed on the
provider's identifier, and callable from both the delivery and the landing
page — because neither is guaranteed to come first, or to come at all. A
handler that treats a missing tenant as a refusal discards a real purchase and
counts it as a gate refusal, which is the wrong ledger. Fail the delivery
instead — a non-success response, so the provider retries on its own schedule
— or park the event for a reconciliation pass, and count *that*. Discarding is
the one outcome no later run can repair.

## What survives a lapse

When entitlement ends, access to the capability ends. The customer's data does
not: [deletion is not repair](../../../../_laws.md#deletion-is-not-repair) applies
directly — removing the artifacts created under a richer plan converts a
billing state change into data loss, and it destroys exactly the evidence that
would make the customer want to come back.

The ladder below opens with "read stays, write stops", and that is a default
for content, not a law. The rule underneath it: **stop the side whose stopping
is reversible, and keep the side whose stopping loses something forever.** For
content that is the writes — a refused new item can be created after
re-entitlement, a hidden existing one can be shown again. For a stream the
product collects on the customer's behalf it is the opposite: an event refused
at the door is gone, while a locked read surface reopens the day the tenant
upgrades — so a collection product keeps ingesting for a bounded window and
locks the dashboard, and is still preserving the customer's work. Which side is
reversible is a property of the resource class, which is why the ladder is
written per class.

The graduated ladder, from most to least preserved:

- **Read stays, write stops.** The default for content: existing items remain
  visible and exportable, new ones are refused.
- **Refresh stops, the last result remains.** For anything scheduled or
  recomputed: the last run's output stays, no new runs occur.
- **Over-limit resources go read-only rather than being deleted.** If the free
  tier allows three of something and the tenant has ten, all ten stay
  readable; creating an eleventh is refused. Choosing which seven to destroy
  is a decision the product must not make.
- **Configuration goes dormant, not deleted.** A connection, integration or
  setting that a richer tier allowed stays stored and stops being honored,
  with every reader of it gated on the same predicate. Re-entitlement then
  restores it instantly, and the customer does not have to reconstruct a
  configuration they already made.
- **Export stays available**, ideally permanently. A product that holds data
  hostage on downgrade is one support escalation from a public complaint.

Prefer read floors to deletion for anything time-bounded: a retention tier is
enforced by clamping read queries to a computed cutoff, not by a reaper that
destroys rows. The advertised limit is real either way; only one of them is
reversible when the customer upgrades again.

State this ladder per resource class before the first cancellation, not
during it.

## Re-entitlement must be as reliable as revocation

Recovery is the path least tested and most embarrassing when it fails: the
card is fixed, the payment succeeds, and the tenant stays locked out because
the grant path only ran on first subscribe. Treat re-entitlement as a
first-class transition with its own handling and its own test. And make the
whole thing **reconcilable** — a periodic comparison of the payment system's
active subscriptions against the product's entitlement state. Missed events
happen; without reconciliation the only detector is a customer.

Both directions of drift must be distinguishable, per
[failure spelled differently from empty success](../../../../_laws.md#failure-not-empty-success):
"no differences found" and "the reconciliation could not read the payment
system" are opposite facts, and a run that reports the second as the first is
worse than no reconciliation at all.

## When not to use this

- **A product with no recurring charge** — one-time purchases that confer
  permanent access — needs the grant half and not the revocation half. Keep
  the source recording anyway; refunds exist.
- **Where entitlement is contractual and manually administered**, the
  lifecycle is a human process, not an event stream. The status-to-entitlement
  mapping and the source-scoped revocation still apply; the trigger is a
  person.
