---
layer: technique
type: technique
subject: usage-limit-governance
technique: enforcement-placement-and-reconciliation
status: forged
laws: [estimation-announces-itself, no-retroactive-restatement]
shared_with: []
use_when: [deciding where a cap physically sits relative to the provider call, an inline cap must decide before the response reveals what the call cost, layering a platform cap over a provider-side ceiling, capping streaming traffic whose spend grows after admission]
---

# Enforcement placement and reconciliation

A cap is a policy; where it sits decides what the policy can physically do.
There are three seats, and each buys a different guarantee:

- **Record-side (ingest).** The cap governs what is *recorded* and applies
  back-pressure to cooperative clients. It cannot un-spend the provider
  call — the golden path's honesty rule — but it is the only seat that
  sees the platform's full accounting: imputation, scopes, the customer
  linkage the money uses.
- **Inline (gateway or proxy, before the provider call).** The cap can
  refuse the call itself — prevention, not back-pressure. But it decides
  with less evidence: at admission time the response does not exist yet,
  so the very metrics operators cap on are only partly knowable.
- **Provider-side (the ceiling the provider itself enforces).** Coarse —
  typically one monthly number per organization or project, breached as a
  quota error — but it is the only cap that still holds when everything
  the operator built is down. Where the provider offers one, set it; a
  platform cap is layered above it, never sold as a substitute for it.

## Inline enforcement is estimate-then-reconcile

Token and cost metrics are only fully known *after* the response: the
prompt side can be counted or estimated up front, the completion side
cannot. An inline cap therefore runs in one of two modes, and the choice
should be explicit, not emergent:

- **Enforce on actuals.** Admit, read the true usage from the response,
  charge the window, and block *subsequent* traffic once the limit is
  crossed. Simple and exact — but structurally one call late: the first
  over-budget call always goes through. Near a tight cap with expensive
  calls, "one call late" can be a meaningful fraction of the budget.
- **Estimate before the call.** Count the prompt side up front, bound the
  completion side by the request's declared output ceiling (or a running
  per-route mean), and refuse before spending. Fewer wasted calls, but
  every refusal now rests on an estimate — so the estimate must announce
  itself in the refusal, and an appeal path ("the actual would have fit")
  is a support conversation the operator should expect.

Either mode ends the same way: **the actuals reconcile the window.** The
overshoot an estimate missed, or the call that slipped through on-actuals
enforcement, is debited against the window so the *next* admission sees
it. Overshoot is never forgiven and never restated — it ages out of the
window like any other spend. A cap whose documentation states its mode
and its worst-case overshoot is honest; one that implies exact prevention
of a quantity it cannot know at decision time is not.

## Streaming spends after admission

A streamed response grows its own cost after the admission verdict, which
breaks the assumption that admission is the last moment of choice. The
two postures are cut-off (terminate the stream when the running total
crosses the cap) and debit (let it finish, charge the window). Cutting
off mid-stream destroys the response's value while still paying for most
of it — the spend happened; only the benefit was refused — so debit is
the ordinary answer, with cut-off reserved for runaway protection at a
multiple of the cap rather than at the cap itself. Whichever posture,
the window must be charged with what actually streamed, not with what
admission assumed.

## Caps in different seats will disagree

A layered deployment has the same dollar counted on three clocks: the
provider's billing meter, the inline gateway's price table, the record-
side platform's stamped-at-ingest cost. They will not match — different
price books, different receipt times, different treatment of failures and
retries — and reconciling them into one number is not the goal. The goal
is knowing which seat's number each surface is quoting, and which cap is
the *binding* one at any moment. Treat the provider ceiling as the
backstop that catches everything including your own outage; treat the
inline cap as the prevention layer; treat the record-side cap as the
governance layer with the richest scopes. A dashboard that silently mixes
seats invites the operator to "fix" a disagreement that is structural.

## When not to build the inline seat

Inline enforcement puts the platform on the request path: its latency is
added to every call and its failure mode becomes part of the traffic's
availability. A platform whose product is observability should not drift
into the proxy business by accident — take the seat deliberately, with a
fail-open-or-fail-closed decision written down (fail-open forfeits the
cap during your outage; fail-closed makes your outage the customer's),
or stay record-side and say so plainly.
