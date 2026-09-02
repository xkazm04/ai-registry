---
layer: application
type: application
subject: plan-entitlements
technique: entitlement-lifecycle-revocation
stack: spec
verified_on: 2026-09-02
refresh_by: 2026-12-02
source: "Stripe Billing documentation, live pages retrieved 2026-09-02"
---

# The lifecycle technique against one provider's published contract

## The pin

Stripe's documentation is unversioned prose over a versioned API; the pages
below were retrieved on 2026-09-02 and quoted as they stood that day.
`refresh_by` is set on a three-month vendor window because the statuses,
retry behaviour and the entitlements product all move on the vendor's
schedule, and no `verified_against` is recorded because a documentation set
is not a runtime.

- *How subscriptions work* — `docs.stripe.com/billing/subscriptions/overview`
- *The Subscription object* — `docs.stripe.com/api/subscriptions/object`
- *Using webhooks with subscriptions* — `docs.stripe.com/billing/subscriptions/webhooks`
- *Receive Stripe events in your webhook endpoint* — `docs.stripe.com/webhooks`
- *Fulfill orders* — `docs.stripe.com/checkout/fulfillment`
- *Pause payment collection* — `docs.stripe.com/billing/subscriptions/pause-payment`
- *Entitlements* — `docs.stripe.com/billing/entitlements`
- *Manage products and prices* — `docs.stripe.com/products-prices/manage-prices`

## 1. Eight statuses, and where the provider tells you what to do

The status enum is `incomplete`, `incomplete_expired`, `trialing`, `active`,
`past_due`, `canceled`, `unpaid`, `paused` (Subscription object, `status`).
The technique's closed set maps onto it as follows, quoting the provider's
own access guidance where it gives one:

| technique state | provider status | provider's guidance |
| --- | --- | --- |
| trialing | `trialing` | "you can safely provision your product for your customer" |
| active | `active` | "in good standing" — but see §2 |
| past due, in retry window | `past_due` | "notify the customer directly and ask them to update their payment details" |
| cancelled, paid-through | `active` + `cancel_at_period_end=true` | no distinct status; `customer.subscription.deleted` fires at period end |
| retries exhausted | `unpaid` | "Revoke access to your product when the subscription is `unpaid` because payments were already attempted and retried while `past_due`" |
| expired | `canceled`, `incomplete_expired` | "When a subscription changes to `canceled` or `unpaid`, revoke access" |
| trial ended, no card | `paused` | "Invoices are no longer created"; `customer.subscription.paused` — "you can revoke the customer's access ... until they add a payment method" |

Two things the table makes visible. First, "cancelled but within the paid
period" is not a status here; it is a flag on an `active` subscription
(`cancel_at_period_end`, with `canceled_at` recording the *request* time, not
the end), so a mapping keyed on the status string alone cannot express the
technique's second clause. Second, what happens after the last retry is a
Dashboard setting, not a fact: "you can configure the subscription to move to
`canceled`, `unpaid`, or leave it as `past_due`" (overview, status table).
Under the third option the label never changes, which is the case the
technique's "retries-exhausted state is provider-configured" qualification
was written for.

## 2. Three documented ways `active` and "paid" part company

- **Delayed-confirmation payment methods.** "a subscription can move directly
  to `active` after creation and bypass `incomplete`. If the payment fails
  later, Stripe voids the invoice but the subscription remains `active`. Use
  this behavior when you design your access control and retry logic"
  (overview, *Payment methods with delayed payment confirmation*).
- **Invoice finalization failure.** "Subscriptions remain active if invoices
  can't be finalized, which means that users may still be able to access your
  product while you're not able to collect payments" (webhooks with
  subscriptions, *Invoice finalization failure*).
- **Paused collection.** "the subscription remains `active` and invoices
  continue to generate, but Stripe doesn't collect payment. Your customer
  retains access to the service during this time" (pause payment collection);
  the object reference adds that `pause_collection` "will not be updated to
  `paused`". This one is deliberate — the page calls it "a grace period" —
  and it is the case where honouring the provider's verdict is plainly right.

The technique's qualification — "active is the provider's good standing, not
proof of payment" — is a paraphrase of these three passages.

## 3. The renewal boundary, in the provider's own leeway

"Stripe waits an hour after receiving a successful response to the
`invoice.created` event before attempting payment. If we don't receive a
successful response within 72 hours, we attempt to finalize and send the
invoice" (webhooks with subscriptions, *Successful invoice finalization*).
The recommended integration therefore stores an access-expiration timestamp
and, on each `invoice.paid`, "updates the customer's access expiration date
in your database to the appropriate date in the future (plus a day or two for
leeway)" (*Track active subscriptions*). "A day or two" is the provider's own
number for the technique's "on the order of a day", and the 72-hour figure is
the reason a slow webhook endpoint widens the window a strict comparison
would revoke inside.

## 4. Ordering, replay, and the fetch

"Stripe doesn't guarantee the delivery of events in the order that they're
generated" — the example given is subscription creation producing
`customer.subscription.created`, `invoice.created`, `invoice.paid` and
`charge.created` in any order. "Snapshot events record `created` in seconds,
so distinct events can share a timestamp. Don't use `created` to determine
event order or whether you've already processed an event. Track event IDs to
identify duplicate deliveries instead. You can also use the API to retrieve
any missing objects" (webhooks, *Event ordering*). That passage is the
technique's "compare state, never delivery order or event timestamps" bullet,
and the last sentence is its fetch-then-decide form. Retries: "up to three
days with an exponential back off in live mode"; manual resend for up to 15
days from the Dashboard and 30 from the CLI (*Automatic retries*, *Manual
retries*).

## 5. The grant-time race, as the provider describes it

"You can't rely on triggering fulfillment only from your checkout landing
page, because it's not guaranteed customers visit that page" — and the
converse: "webhooks can sometimes be delayed", so the landing page should
trigger fulfilment too. The consequence is stated flatly: "your
`fulfill_checkout` function might be called multiple times, possibly
concurrently, for the same Checkout Session." The function is required to
accept the session id, "retrieve the Checkout Session from the API", check
`payment_status`, and "record fulfillment status" (fulfill orders, *Create a
fulfillment function*). Hosted Checkout "waits up to 10 seconds for your
server to respond to the webhook event delivery before redirecting your
customer" — a bounded courtesy, not an ordering guarantee. The technique's
"an unknown tenant at grant time is a retry, not a refusal" is the product
side of this contract: whichever caller arrives first must not treat the
other's absence as an error.

## 6. Refunds are charge events

`charge.refunded` "contains the updated Charge object". Finding the
subscription it belongs to is a four-step lookup — charge → PaymentIntent →
invoice payment → invoice → `parent.subscription_details.subscription` (API
version `2025-03-31.basil` and later) — and nothing in that section moves the
subscription's status (webhooks with subscriptions, *Handle refund events*).
The technique's "a refund does not by itself change the subscription" is this
page read literally.

## 7. The provider now sells the capability flags

The *Entitlements* product attaches Features (each with a unique
`lookup_key`) to Products; "When a subscription becomes `active`, Stripe
creates an active entitlement for each feature associated with the
subscribed product." The `entitlements.active_entitlement_summary.updated`
event carries "the customer's full, up-to-date entitlement summary" — capped:
"a maximum of 10 entitlements. If a customer has more than 10 active
entitlements, use the `entitlements.url` field in the payload to fetch the
complete, paginated list." A list endpoint exists "on application startup,
for authorization checks, or to reconcile state after a webhook delivery
failure", and the page recommends "you persist these entitlements internally
for faster resolution."

Three consequences for the subject. The tier model's boolean capabilities can
now live in the price book, which moves their authority out of the product —
the single-source rule still holds, but the source is the provider and the
product's copy is the persisted projection the page recommends. Revocation is
documented for cancellation and for "canceled automatically due to failed
payments"; the page does not say what an entitlement does during `past_due`
or `unpaid`, so a product mapping those states must still do it itself. And
a catalog change does not reach existing subscribers immediately: "Existing
subscriptions will create active entitlements for any product feature changes
at the start of the next billing period" — adding a feature to a product
entitles new buyers today and current ones at renewal, which a product that
flips its own flag on the same day will get wrong in one direction or the
other.

## 8. Prices are immutable objects

"After you create a price, you can only update its `metadata`, `nickname`,
and `active` fields." "you can't change a price's amount in the API. Instead,
we recommend creating a new price for the new amount, switch to the new
price's ID, then update the old price to be inactive." Archiving is
non-destructive to subscribers: "any existing subscriptions that use the
price remain active until they're canceled." The `lookup_key` with
`transfer_lookup_key=true` is the provider's mechanism for repointing a
stable name at a new price object (manage prices, *Lookup keys*, *Edit a
price*). This is the basis for the price-book technique's correction that a
drift detector compares by price identifier or lookup key, not by product.

## Reconciliation summary

Confirmed against the provider's text: trialing and active provision;
past-due notifies and retains; retries-exhausted and cancelled revoke;
ordering is not guaranteed and timestamps are not an ordering; replay is
keyed on event id; fulfilment is idempotent and dual-triggered; refunds are
charge-level. Read from this text into the technique: the three cases where
`active` is not paid; the provider-configured end of the retry window; the
"day or two" of renewal leeway; the charge-level nature of refunds; the
immutable-price basis for keying the drift detector. Not stated by the
provider and left to the product: entitlement behaviour under `past_due` and
`unpaid` in the Entitlements product, and any grace beyond the retry
schedule.
