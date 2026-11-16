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
- **The short batch** — a request for N outputs comes back with fewer, and
  the missing ones were refused. At least one vendor documents this as the
  normal shape: filtered images are simply left out of the result array
  unless the caller asks for the reasons. The empty success is only the
  limit case of this. Fewer-than-asked is a **partial refusal**: keep what
  arrived, record asked / returned / refused / failed on the result's
  provenance (present only when short, like the re-route record), and do
  not re-route the whole request. Re-routing it discards outputs that were
  delivered and possibly paid for, and pays a second vendor for all N. If
  the caller needs the full count, the shortfall alone is a new request.
  When every output is missing, it is the empty success above.
- **Whether a refusal bills is a ledger fact, not a constant.** Some vendors
  charge for a block, because the model read the prompt or drew the image
  before declining. At least one documents that blocked images are not
  charged. The spend meter books a refusal from the vendor's recorded
  behaviour. It does not assume either way.
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
  missing credential (skip, record, continue). None of these did paid work
  on the attempt being abandoned, or else, for a refusal, the work was
  declined by policy, and only another vendor's policy can clear that.
- **Re-routes only once the attempt is known dead and its cost known:**
  timeout and vendor-side failure. A timeout is *unknown*, not failed. On an
  asynchronous job the work may still be running and will be billed: one
  vendor documents that a cancelled job is charged for the time it ran.
  Re-routing at that moment pays twice and can fork the asset when both
  finish. Cancel the job or poll it to a terminal state first. A vendor-side
  failure the vendor answered after doing work is presumed billed, so a
  re-route doubles the bill for a request nobody declined. The chain exists
  to cross a policy edge. An outage is a weaker reason to walk it, and a
  weaker one still when the next entry cannot honour the request's
  constraints, because then the outage becomes a silent near-miss. Where the
  failed attempt is known to be unbilled (the vendor never ran it, or
  documents failures as free), walking on is exactly what a chain is for.
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
- When a vendor documents a moderation-strictness field, the router sends a
  value for it on purpose. An omitted strictness field hands the setting to
  the vendor's default, which is the outbound door in
  [non-silent-elimination](./non-silent-elimination.md). Where the vendor also
  says which stage blocked (the prompt on the way in, or the image on the way
  out), keep that on the trail. A brief class whose prompts are blocked on the
  way in is plan feedback. Output-stage blocks scattered across varied briefs
  are classifier noise.

## When not to use this

Do not re-route refusals when the vendors' policies are the *product* — a
pipeline whose output must satisfy the strictest policy in the roster (brand
safety, regulated content) should treat any refusal as a verdict on the
brief and stop, because clearing it on a laxer vendor ships exactly what the
strict policy exists to catch. And never use the hop to launder content the
operator knows is out of policy everywhere; the technique recovers from
classifier disagreement, it does not arbitrage it.
