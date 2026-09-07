# Stripe as the `finance` connector

What was learned mapping this recipe onto Stripe specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The failed-collection half maps cleanly, and that is unusual.** The payment failure event
carries an attempt count that increments across the provider's own retry schedule, and the
invoice stays open while retries continue. That is what makes the recipe's rule of raise once
with the attempt count and close on recovery implementable rather than aspirational: the
mapping does not have to reconstruct the retry state, it can read it.

**The decline reason is the whole classification and it arrives in two layers.** There is the
provider's own outcome for the charge and there is the reason the issuing bank returned, and
they are not the same field. The distinction this recipe turns on, whether a further attempt
could ever succeed without the customer doing something, lives in the second. Insufficient
funds, a temporary hold and a network timeout will clear on their own; a closed account, a
reported-stolen card or a permanent block will not, and no number of retries changes that.
Building the mapping on the first layer alone produces a recipe that waits out the retry
schedule on cards that were never going to work, and the recovery window is spent.

**Upcoming expiry is available and is not an event.** The stored payment method carries the
expiry month, so the credentials that will fail at the next renewal are knowable today by
looking rather than by waiting. This is the one part of the recipe that is not event-driven on
this connector: it is a periodic read across active subscriptions, and it has to be arranged
deliberately or the pre-expiry criterion silently never fires. The provider may also update a
card behind the scenes when the issuer reissues it, so a card that looks expired may have been
replaced; read the current stored method rather than the one recorded when the subscription
started.

**Subscription status is a lagging summary of all this.** A subscription moves to a past-due
or unpaid state some way into the retry schedule, and it is tempting to key the whole recipe
on that transition because it is one clean signal. It arrives late, after most of the recovery
window has gone, which is exactly the failure the recipe exists to prevent.

**Events can arrive more than once and out of order.** Delivery is at-least-once, so the
scoring has to be idempotent per event and the duplicate-suppression window has to survive a
replay. A score moved twice by one redelivered failure is a band crossing that never happened.

## What transfers to any payments connector

- Find the field that says whether a retry could ever succeed. It is usually deeper than the
  headline status, and the recipe's central distinction lives in it.
- Ask whether upcoming expiry is readable. If it is, the pre-expiry signal is a scheduled read
  rather than an event, and it has to be arranged separately.
- Assume events can be redelivered, and make the scoring idempotent before making it clever.
