---
layer: technique
type: technique
subject: plan-entitlements
technique: capability-gate-predicates
status: forged
laws: [gate-sees-target, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [gating a feature behind a plan, writing an upgrade prompt, a paid button that fails after it was shown]
---

# Capability gates as named predicates

An entitlement check is a **pure function of declared state** returning a
**named decision**. Its inputs are the tenant's tier, the tenant's counted
usage for the relevant period, and any purchased balance. It performs no
input/output, mutates nothing, and hides nothing: given the same three
values, it always returns the same answer, which is what makes it testable
across every combination that matters and what makes the read path and the
write path able to share it.

## The decision is enumerated, not boolean

The most valuable move in this technique is refusing the boolean. Four
outcomes are structurally distinct and demand different handling:

- **unlimited** — the tier includes this without counting. Nothing to meter,
  nothing to warn about.
- **allowance** — included up to a periodic quota, with some of it remaining.
  The caller may proceed and should surface the remainder.
- **credit** — not in the allowance, but payable from a purchased balance.
  The caller may proceed and must decrement.
- **denied** — not included, allowance exhausted, no balance. The caller
  refuses, and the interface can say exactly which of those three it is.

A gate returning `false` for the last two has destroyed the information the
upgrade prompt needs, and the interface will reconstruct it — badly, by
re-querying, by guessing from the tier, or by showing one generic message for
every refusal. Return the decision; let the caller branch.

The decision alone is still not enough for one class of caller. **Bulk and
batch paths need remaining headroom, not just the next-call verdict.** A batch
sizer that caps on the purchased balance alone silently drops work that the
tier's own allowance would have covered — a tenant with an unspent monthly
allowance and an empty balance gets every batched item skipped, and the
symptom looks like a broken feature rather than a billing decision. Return the
remaining allowance beside the decision, with a declared encoding for
unbounded, and let batch callers size against allowance plus balance.

The arithmetic that produces the decision is worth keeping literally pure —
tier, usage and balance in, enumerated decision out — because it is the one
piece of billing logic that a reviewer can verify by reading, and the one
piece where an off-by-one is a revenue defect rather than a rendering glitch.

## One door, two callers

The read gate ("should this feature appear?") and the write gate ("may this
action proceed?") must call **the same predicate over the same state**. This
is [one validation door](../../../../_laws.md#one-validation-door) for entitlement:
two implementations of the same rule diverge, and the divergence is visible to
the customer as a button that exists and fails, or a feature that works but is
hidden.

The write gate is the one that must exist. The read gate is an affordance —
it improves the experience and can never be the enforcement, because a client
can call the server without rendering anything. A product with only the read
gate is [gating a proxy](../../../../_laws.md#gate-sees-target): the check ran over
what the interface displayed, not over what the server did.

## An unknown tenant is unknown

The single most common defect in entitlement code: the lookup finds no record
and the code returns the free tier's allowance. That converts a failure into a
grant. Absence must be
[spelled differently from empty success](../../../../_laws.md#failure-not-empty-success):

- **A missing entitlement record refuses**, and the refusal names itself as a
  lookup failure rather than as an exhausted allowance — the two demand
  completely different operator responses.
- **Unknown-tenant refusals are counted.** A rising count means provisioning
  is broken, and it is the only signal that will say so; without it the
  symptom reaches support as "the product randomly stopped working".
- **An unknown *tier value* is not an unknown *tenant*.** These look alike and
  their safe defaults point in opposite directions. A known tenant carrying a
  tier string the model does not recognize — a retired tier, a typo, a value
  from a newer deployment — resolves to the **lowest** tier: the fallback
  under-grants, which is recoverable and visible. A tenant that could not be
  found at all resolves to a **refusal**: the same fallback there would
  *grant* a stranger the free tier's full headroom. One is a floor, the other
  is a hole; write them as two different code paths so nobody later
  "simplifies" them into one.
- **A store that is unreachable at check time is not a zero balance.** Decide
  fail-open or fail-closed deliberately per call class, state the choice, and
  count every fail-open pass — an undeclared fail-open is how a product gives
  its paid features away during an outage.

## Composition with permission

Entitlement is not authorization. Evaluate them in order and keep them
separate:

1. **May this actor perform this kind of action at all?** — role, scope,
   ownership. Not this subject's question.
2. **Does this tenant's plan include this capability, now?** — this predicate.

A conflated check ("admins get the export") answers neither question
auditably: it grants a paid capability on the strength of a role, and it
refuses a paying member on the strength of a plan they hold. Keep two
predicates and call both. When the refusal is surfaced, the *reason* matters:
"your role cannot do this" and "your plan does not include this" lead to
completely different next actions, and only one of them is a sale.

## Decision rules

- **When a gate needs to do input/output to decide, the state it needs is
  missing from the model.** Fetch it in the caller and pass it in; a predicate
  that queries is a predicate nobody can test exhaustively.
- **When adding a capability, add its flag to the tier model and its case to
  the predicate in the same change.** A gate whose capability is not in the
  model is an ungoverned grant.
- **When the caller only needs "can they?", still return the decision and let
  the caller discard it.** The next caller will need the reason.
- **Every gate is enumerable.** The list of capabilities the product gates is
  a readable artifact derived from the model — if answering "what does the
  paid tier include?" requires a code search, the pricing page and the gates
  are already free to disagree.

## When not to use this

- **For rate limiting and spend ceilings.** Those are consumption controls,
  not inclusion questions, and they belong to their own subjects; this
  predicate reads a balance, it does not maintain one.
- **For a capability that is free to everyone.** Gating what nothing refuses
  adds a branch that can break and a decision nobody makes.
- **In a deployment mode that sells operation rather than capability** — there
  the predicate short-circuits before it evaluates; see
  [deployment-mode-short-circuit](./deployment-mode-short-circuit.md).
