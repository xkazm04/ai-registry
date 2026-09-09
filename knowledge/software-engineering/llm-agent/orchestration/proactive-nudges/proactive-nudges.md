---
layer: golden-path
type: golden-path
subject: proactive-nudges
status: forged
techniques:
  - trigger-evaluators
  - attention-budgets
  - notice-delivery-decoupling
  - quiet-windows
  - nudge-identity-dedup
  - efficacy-feedback
---

# Proactive nudges & attention budgeting

This subject governs machine-initiated suggestions and reminders: who may
receive them, when they may be dispatched, and how repeated or stale contact
is prevented. Adopt the policy for each product and recipient. A useful candidate
does not itself grant permission to contact someone or execute its suggested action.

## Authority and boundaries

Require an enabled purpose, recipient, kind and channel. Recheck current consent
before dispatch; opting out also cancels pending contact. An evaluator cannot
grant itself urgency or re-enable a disabled kind. Contacting another person or
acting on a suggestion needs its own existing authority.

An operational alert follows an adopted response contract; a discretionary nudge
invites judgment. Either can originate from rules or model-assisted analysis.
User-requested reminders carry a separate timing promise. Do not promise delivery
while allowing speculative nudges to consume all of its required capacity.

Presentation belongs to
[toasts-notifications](../../../ui-surfaces/feedback-and-style/toasts-notifications/toasts-notifications.md),
operational thresholds to
[alerting](../../../backend-platform/platform-observability/alerting/alerting.md),
and general suppression machinery to
[cooldown-and-debounce](../../../backend-platform/work-execution/scheduling/techniques/cooldown-and-debounce.md).

## Separate observation from dispatch

[Trigger evaluators](techniques/trigger-evaluators.md) produce candidates from
authorized snapshots. Observation has computation, collection and retention costs;
budget these separately from interruptions. Deterministic value functions simplify
testing, but a function signature alone does not enforce purity.

[Notice/delivery decoupling](techniques/notice-delivery-decoupling.md) retains
useful candidates across temporary suppression. Policy can defer, coalesce, expire
or discard them. Cancellation and opt-out can require deletion. Before delayed
dispatch, check validity, consent, identity, quiet policy and capacity again.

## Bound contact and repetition

[Attention budgets](techniques/attention-budgets.md) atomically reserve capacity
for an identified delivery. Scope counters by recipient and policy period, including
restarts and concurrent workers. A timeout can leave delivery unknown; releasing
that reservation as though nothing happened can exceed the promised cap.

[Quiet windows](techniques/quiet-windows.md) use the user's declared timezone
policy, which may follow travel or stay fixed. Host-local time is insufficient
for remote users. Define boundary and daylight-transition behavior. Any bypass
must come from an adopted, closed policy; an empty bypass class is valid.

[Nudge identity](techniques/nudge-identity-dedup.md) represents the semantic
occurrence within its tenant and recipient scope. Stable recurrence identities
allow requested repeats without treating every evaluation tick as new news.

## Learn within the agreed policy

[Efficacy feedback](techniques/efficacy-feedback.md) separates dispatch, visibility,
interaction and task outcome. Missing interaction is not proof of rejection.
Adapt only with declared evidence thresholds and within user limits; do not make
an ignored kind louder simply because it remains unresolved. A zero allowance
can be the correct policy outcome. None of these mechanisms guarantees usefulness
or convergence; evaluate actual outcomes and unwanted contact.
