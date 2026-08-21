---
layer: technique
type: technique
subject: generative-provider-routing
technique: refusal-reroute-hop
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [an image model declines a prompt on safety grounds, a generation returns empty with a green status, deciding which errors may walk the chain]
---

# Refusal re-route hop

Safety refusals are a normal operating condition of generative vendors, not an
edge case: public figures, brand marks, medical and conflict imagery, and a
long tail of classifier false positives all decline routinely, and the
decline is a property of *that vendor's policy*, not of the request's merit.
The technique is the recovery move that actually works, and the discipline
around what may and may not use it.

## The core rule: a different model, one hop

The field-tested clearing move for a refusal is **another vendor for one
hop** — not a retry of the same model, and not a "softened" prompt. The same
model re-refuses the same request with high probability, so a same-vendor
retry is a wall that bills you per attempt. Prompt-softening is worse: it
trades away the brief to appease a classifier, degrading the output even when
it eventually passes, and it teaches the pipeline's operators to self-censor
against the *strictest* vendor in the roster. Different vendors run different
classifiers with different thresholds; what one declines, another commonly
serves unmodified. So the router classifies refusal as a *reroutable* outcome
and walks to the next configured vendor in the plan, with the original
request untouched
([refusal-is-a-state](../../../_laws.md#refusal-is-a-state)).

One hop, not a loop. The chain is finite and ordered; each vendor is tried at
most once per request. If every configured vendor refuses, the request fails
with the trail of who declined — that is a real answer, and the caller's next
move (change the brief, or steer with an avoid on a later attempt) is a human
decision, not something the router should simulate by cycling.

## Reading refusals off the wire

Refusals do not arrive uniformly labelled, and misclassification in either
direction is expensive:

- **Labelled refusals** — a terminal safety status, a block reason, an error
  message naming policy. Map every vendor-specific spelling to the single
  internal kind "refused". A vendor that surfaces its safety block as a
  distinct terminal state and one that buries it in an error string must look
  identical one layer up.
- **The empty success** — some vendors return a *successful* response with
  zero outputs when a safety system intervenes, especially where the block
  shape is undocumented. The rule: **an empty generation result is a refusal
  until proven otherwise.** Read as a refusal, the worst case is one
  unnecessary hop to a vendor that also serves the request; read as a
  success, the caller receives nothing, with green status attached, and the
  failure is invisible. Choose the direction whose failure is cheap.
- **Sniffing is legitimate when shapes are undocumented.** Matching error
  text against a policy-vocabulary pattern is fragile and still better than
  defaulting to "failed" — because "failed" and "refused" route differently,
  and the sniff only has to pick between two internal kinds, not parse the
  vendor.

## What may re-route, and what must not

Reroutability is a property of the *error kind*, decided once at the routing
layer:

- **Re-routes:** refusal; rate-limiting (the next vendor bills against a
  different allowance, so a limit on one says nothing about the next);
  missing credential (skip, record, continue); vendor-side failure and
  timeout, where trying elsewhere is exactly the point of having a chain.
- **Throws immediately:** malformed requests and local validation errors —
  the next vendor will reject them identically, so walking the chain just
  fails N times and muddies the trail; spend-ceiling refusals — the budget
  gate is a decision about *this request*, not about a vendor, and
  re-routing around your own budget is self-defeating by construction; and
  any error raised *after* output was produced (a post-processing failure is
  not a generation failure, and regenerating elsewhere would silently fork
  the asset).

## Decision rules

- When a refusal re-routes and a later vendor serves, the hop must be visible
  on the result's provenance — the style, capability, and cost consequences
  of landing on a different vendor are real, and downstream graders should
  know which model made the plate.
- When the re-route target lacks a capability the request depends on (it
  cannot read the reference images the request carries), the constraint
  outranks the refusal recovery: fail with both facts in the message rather
  than serving an output that ignores half the request.
- When refusals from one vendor recur on a *class* of briefs, that is plan
  feedback, not per-request noise: either the plan order changes for that
  work, or surfaces gain a standing steer — the per-request hop is a relief
  valve, not a permanent architecture.

## When not to use this

Do not re-route refusals when the vendors' policies are the *product* — a
pipeline whose output must satisfy the strictest policy in the roster (brand
safety, regulated content) should treat any refusal as a verdict on the
brief and stop, because clearing it on a laxer vendor ships exactly what the
strict policy exists to catch. And never use the hop to launder content the
operator knows is out of policy everywhere; the technique recovers from
classifier disagreement, it does not arbitrage it.
