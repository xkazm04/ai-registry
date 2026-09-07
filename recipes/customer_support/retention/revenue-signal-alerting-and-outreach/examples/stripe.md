# Stripe as the `finance` connector

What was learned mapping this recipe onto Stripe specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The attempt counter keeps climbing on a failure that is never going to be retried, and
this is the single most important fact in the mapping.** Stripe divides decline codes into
those it will retry and a named set of hard declines it will not, including a lost or stolen
card, an incorrect number, a revoked authorization and a transaction the issuer does not
allow. On a hard decline the scheduled retries continue and the attempt count keeps
incrementing, but nothing executes until a new payment method appears. A seat watching the
counter therefore sees recovery in progress on exactly the accounts where recovery has
already stopped. Read the decline code; the counter is not the signal.

**The recovery window has a configured length and a configured ending, and only one of the
endings is an event.** A retry policy runs for a set number of attempts across a chosen span
(the recommended default is eight tries across two weeks, and it can be set from one week to
two months). When it runs out, the subscription is cancelled, marked unpaid, or simply left
past due, depending on a dashboard setting. The last of those three never announces itself,
so a seat that waits for a cancellation to close the signal will hold it open forever on
accounts configured that way. Read the setting at adoption and decide there what "given up
on" is going to mean.

**Bank debits are not cards and mostly are not retried at all.** ACH, SEPA, BACS and the
other direct debit methods are excluded from automatic retries unless that is explicitly
turned on, and where it is, they get one or two attempts across thirty to forty days rather
than eight across two weeks. A judgment calibrated on card behaviour is badly wrong on these:
the provider is not quietly working on it, and the window is far longer than anyone expects.

**Asking the customer to update their card can succeed and change nothing.** Stripe retries
against the payment method in a specific priority order, and updating a different field from
the one the failure occurred on leaves the retries pointing at the dead card. Outreach that
generates an update in the wrong place looks like a save and is not one, which is a
particularly expensive way for this recipe's closure outcome to be satisfied falsely.

**The webhook is where a retry attempt is observable, not the invoice.** Payment failure and
attempt updates arrive as events, and the next scheduled attempt is carried on the invoice.
Building the suppression window off event arrival rather than off polling is what keeps one
account from producing one alert per attempt, which is the behaviour the recipe exists to
prevent.

## What transfers to any finance connector

- Find the provider's own split between failures it will retry and failures it cannot, and
  make that split the decision. Every provider has one and none of them expose it as a flag
  called "hopeless".
- Ask what happens at the end of the recovery window, because a state that is simply left in
  place is not an event and nothing downstream will ever hear about it.
- Calibrate per payment method, not per provider. Bank debit and card recovery behave nothing
  alike.
