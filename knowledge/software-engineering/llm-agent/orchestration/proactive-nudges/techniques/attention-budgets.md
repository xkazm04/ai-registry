---
layer: technique
type: technique
subject: proactive-nudges
technique: attention-budgets
status: forged
laws:
  - count-carries-predicate
  - derivation-names-recomputation
shared_with: []
use_when: [setting a daily cap on machine-initiated contact, one chatty kind eats the whole day's budget, concurrent triggers each take the last free slot]
---

# Attention budgets

Declare the maximum contact allowed for each recipient, channel scope and period.
For multiple kinds, a global cap plus per-kind caps prevents one kind consuming
everything. A single-kind product may need only one counter. Choose limits from
the product's contact promise and evidence, rather than a universal daily number.

## Atomic reservations

Claim all applicable counters together with a unique notice-attempt reservation.
Competing workers must not reserve the same delivery twice. A failed partial claim
rolls back every counter it changed. Claim before dispatch, then record confirmed
delivery, confirmed non-delivery or an unknown outcome.

Release capacity only when non-delivery is established. A network timeout may
follow successful receipt; retain an unknown reservation until reconciliation or
the declared conservative accounting rule resolves it. Destination idempotency
and retry retention determine whether another attempt is safe.

Ordinary deferred notices need not reserve interruption capacity. Explicit scheduled
promises may need capacity allocated at admission. Collection and evaluation still
need their own resource limits even when they spend no attention allowance.

## Periods and reconstruction

Use a declared local-day, UTC-day or rolling window. A user-facing local-day promise
requires its named timezone and a policy for travel and timezone changes. Prevent
changing zones or restarting workers from minting additional allowance. Avoid
rollover bursts; if carryover exists, bound the burst separately.

If counters derive from a ledger, document the recomputation predicate, including
pending and unknown reservations. Rebuild against a consistent boundary so live
claims cannot disappear during repair. Count with its predicate: for example,
three confirmed and one pending out of five recipient deliveries this period.

## Fairness and separate promises

A per-kind refusal skips that candidate, allowing other eligible kinds to proceed.
A global refusal ends this scope's pass. Fair ordering and pacing remain necessary
when a quiet window opens; a daily cap alone permits an immediate burst.

User-requested reminders, responses and operational alerts may use distinct accounts.
Publish what the total covers. Exempting reminders from their kind cap while sharing
an exhausted global cap cannot guarantee their timing. Reserve capacity, prioritize
the promised lane or expose a missed deadline according to the accepted contract.
Permission to bypass quiet time does not imply permission to bypass a budget.

Expose refusals, pending reservations and effective caps. Adaptation may redistribute
capacity within the user's ceiling; it does not authorize raising that ceiling.
