---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: route-vocabulary-narrower-than-verdict-vocabulary
status: forged
laws: [no-adverse-outcome-is-solely-automated, inference-must-look-like-inference, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [designing the output contract of a screening model, deciding which model outputs the pipeline may execute, reviewing a prompt that asks for a hiring recommendation]
---

# Route vocabulary narrower than verdict vocabulary

## The concern

A model asked to assess a candidate produces an opinion, and the opinion is useful:
"this profile does not meet the stated requirement" is exactly the analysis a recruiter
wants. The mistake is to let the field that *carries* that opinion be the same field the
pipeline *dispatches on*. The moment those are one field, the model has been handed the
authority to terminate an application — not by anyone's decision, but by a schema.

The technique separates them. The verdict vocabulary is wide: the model may recommend
advance, hold, or reject, with a rationale. The **route** vocabulary — the single
machine-actionable field the automation branches on — is strictly narrower: advance or
hold, and nothing else. A recommendation of reject produces a route of hold, always, and
the recommendation rides along as content for the human who picks it up.

## The procedure

1. **Split the contract into two fields with different names and different types.** Call
   one what it is — a recommendation, an assessment, an opinion — and the other a route.
   Do not name them both "decision"; a shared name invites a future caller to treat them
   as one.
2. **Type the route as a closed set of the executable outcomes only.** In a screening
   pipeline that is advance and hold. Reject is absent from the type, so no code path can
   even express it, and a serializer that receives it fails at the boundary rather than
   deep in the dispatcher.
3. **Write the narrowing rule where the contract is defined**, next to the field, in one
   sentence: the model may recommend reject; rejection is never routable; a reject
   recommendation routes to hold and parks at a human gate. The rule belongs with the
   type because that is where the next engineer will look.
4. **Keep the recommendation intact.** Do not discard the reject recommendation when you
   narrow the route — that is the content that makes the human's review meaningful rather
   than a rubber stamp, and it is what the candidate's eventual reason must be checked
   against.
5. **Label the recommendation as inference wherever it is shown.** A model's
   recommendation, and its self-reported confidence, are evidence about the model, not
   measurements of the person
   ([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
   The recruiter surface must not render it in the grammar reserved for verified fact.
6. **Validate the route on the way in, not on the way out.** The narrowing happens at the
   contract boundary where model output is parsed, so that every consumer downstream
   receives an already-safe value. A narrowing applied at each call site is a narrowing
   that will be missed at one of them.

## Decision rules

- **When the model emits a route value outside the narrow set, that is a contract
  violation, not an outcome.** Coerce to hold, log the violation, and treat a persistent
  rate as a prompt or model regression to fix. Never trust a value the type says cannot
  exist.
- **When someone proposes adding reject to the route type "for the bulk tool", refuse.**
  Bulk adverse action goes through a human-approved preview and its own approval token —
  the neighbouring subject's mechanism — and that path is not the automation's route
  field. Widening the route to serve a bulk feature deletes the boundary for every
  feature.
- **When the recommendation and the route disagree, that is the design working.** A
  record showing "recommended: reject, routed: hold, reason: rejection is not routable"
  is the artifact you want in the audit trail. Do not "fix" the inconsistency by
  suppressing one side.
- **When confidence is low, it may narrow the route further** — from advance to hold —
  but it may never widen it. Confidence gates the optimistic action and attaches a
  human-review marker; it has no authority over the adverse one, which does not exist.
- **When a new automated action is added to the pipeline, classify it before wiring it.**
  Adverse and irreversible actions (rejection, withdrawal, blacklisting, silent
  archiving) are never routable. Reversible, non-adverse actions (surfacing, tagging,
  ordering, notifying an internal reviewer) may be.
- **Never let display strings carry routing meaning.** A stage renamed by a customer, a
  localized status label, a model's prose verdict — none of these may be parsed back into
  a route. [Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label);
  route off the stable vocabulary, and compose the words at render time.

## Why the narrowing goes in the contract, not the policy

Teams often implement this as a policy check: compute the route, then before acting,
verify it is allowed. That works until a caller forgets. Putting the restriction in the
*type* of the machine-actionable field moves the enforcement from runtime discipline to
structural impossibility — the unsafe value has no representation, so the unsafe program
does not compile, does not deserialize, or fails at its first boundary rather than at the
candidate.

The policy check still belongs there too, at the apply boundary, for the same
defence-in-depth reason the companion technique gives. But the contract is the cheap
layer and the one that survives refactoring, because it does not depend on anyone
remembering.

## When NOT to use it

- **Not where the model is not driving an action at all.** A summarization or extraction
  step that produces no route field needs no narrowing — it needs provenance labelling.
- **Not as a reason to hide the recommendation from the recruiter.** Narrowing the route
  is about authority, not about secrecy. Suppressing the model's reject recommendation
  leaves the reviewer with less to review and pushes them toward the rubber stamp the
  whole design exists to prevent.
- **Not as a substitute for the human queue actually being worked.** A narrow route
  guarantees that
  [no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)
  only if the gate it parks at leads to a person with the time, the information and the
  authority to decide otherwise. Narrow route plus abandoned queue is automated rejection
  with extra latency.
