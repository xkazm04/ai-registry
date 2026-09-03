---
layer: technique
type: technique
subject: prompt-assembly
technique: deferred-interface-invalidation
status: forged
laws: [silent-state-is-ungoverned, verdict-survives-boundary]
shared_with: []
use_when: [an operator command changes capabilities or policy inside a live session, deciding when a configuration change takes effect, a cheap-looking command multiplied a long session's bill]
---

# Deferred interface invalidation

A running conversation has a command surface: the operator can install a
capability, edit the house vocabulary, toggle a policy, reload the memory the
context layer draws from. Every one of those mutates a **standing** layer — one
of the stable layers the golden path's ordering deliberately put at the head of
the prompt — and every one of them therefore has two possible moments of effect:
now, or at the next session boundary.

Almost every system answers *now* without noticing it answered. A command that
does not take effect immediately feels broken, each individual change looks
cheap, and the code path for "apply it" is the one that already exists. The
accumulated result is a prompt interface that can be rewritten at any point in a
conversation by anything with a command name.

## Why now is expensive, and why the expense is invisible

The stability-ordered stack exists so that the head of the prompt stays
byte-identical across turns, which is what a provider-side cached prefix needs.
Mutating a standing layer mid-conversation invalidates that prefix from the
mutation point onward — and because standing layers sit at the head, the
mutation point is near the top and the invalidated region is nearly everything.
Per [cache-breakpoint-allocation](./cache-breakpoint-allocation.md)'s
arithmetic, the cost of a change is its position multiplied by its cadence; a
command that edits the identity or capability layer is the most expensive
position available, at whatever cadence the operator happens to type it.

The expense is invisible at the moment it is paid. Nothing fails, the answer
still streams, and the bill arrives later as a session that cost several times
what its length suggests. That is precisely the class of cost a default has to
handle, because no individual command author will ever see it.

## The rule, and the one exception that defines it

> **A command that mutates standing-prompt state defaults to deferred
> invalidation — the change takes effect on the next session — and immediate
> effect is an explicit opt-in the operator asks for.**

The default is not a claim that the change is unimportant. It is a claim about
who is in a position to decide: the operator knows whether they need the new
capability in *this* conversation or in the next one, and the system does not.
Asking costs one flag; guessing wrong costs the remainder of the session.

The rule earns its shape from a single sanctioned exception, and stating the
exception is what makes the policy checkable rather than a matter of taste:
**compression is the only mid-conversation rewrite that pays for itself.**
Compaction breaks the prefix in order to buy back window the conversation
cannot continue without — the rewrite is the thing that keeps the session
alive. Every other mid-conversation rewrite trades the prefix for convenience.
Once that is written down, "may this command apply now by default?" stops being
a judgment call at each call site and becomes one question with one answer:
does this rewrite buy the conversation something it cannot proceed without?

Two boundary cases sit around the rule and neither weakens it:

- **A safety-shaped mutation applies immediately, always.** Revoking a
  capability, tightening a refusal boundary, withdrawing access — a deferred
  revocation leaves a live session holding an ability the operator has taken
  away, and a cache discount is not a reason to keep an unsafe prompt alive.
  The direction is asymmetric on purpose: granting defers, revoking does not.
- **A mutation that lands strictly below the last cut point** is free and may
  apply now. Treat that as an optimisation to be proved per allocation rather
  than as a second default — "strictly below" is a property of the current
  breakpoint allocation, and the allocation moves without the command knowing.

## A deferred change that nobody can see is the worst of the three options

Deferral has a failure mode that is more expensive than either honest answer,
and it is the reason this technique is not one sentence. The operator issues the
command, the system queues it, the acknowledgement reads like success, and for
the rest of the session the operator believes the agent has a capability it does
not have. The divergence surfaces several turns later as an agent inexplicably
failing to use what it was told it has — at which point the cause is many turns
upstream and looks like a model failure.

[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
is the governing law and it prescribes the fix directly: the pending mutation is
converted into an artifact something else can read.

- **The command's answer names which of the two happened**, as a value the
  caller can branch on rather than as a sentence in a success message — per
  [verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary),
  *applied* and *queued* are different outcomes and a caller that cannot tell
  them apart will report the wrong one to the operator.
- **The queue is listable.** "What changes are waiting for the next session" is
  a question the system answers on demand, not a state that exists only inside
  a config file nobody re-reads.
- **The boundary that applies it is named**, not implied. Deferral is not
  indefinite; it terminates at the next session build, and a queue whose drain
  point is unstated is a change that has been quietly dropped.

## Where this sits relative to the fingerprint

[fingerprinting-and-cache-keys](./fingerprinting-and-cache-keys.md) owns
**detection**: a session carries the digest it was born under, and a mismatch
means stale — rebuild, do not continue. This technique owns **avoidance**: the
mutation is held so the digest does not move mid-session at all.

They are complements, and each is weak alone. Detection alone means the system
constantly trips its own gate on changes it made to itself, and a gate that
fires on routine operator activity is one someone eventually widens until it
gates nothing. Avoidance alone leaves the changes that did not come through the
command surface — a deploy, a sibling process, an edited configuration file —
unnoticed. Deferral removes the self-inflicted mismatches so that a fingerprint
mismatch keeps its meaning: something changed the interface from outside this
session, and that genuinely warrants a rebuild.

## The rejected alternative: apply everything, let the fingerprint rebuild

The honest opposite is simpler and worth stating fairly. Apply every mutation
immediately; the session's fingerprint no longer matches, the staleness gate
fires, the session rebuilds, and the conversation always reflects the current
configuration. One code path, no queue, no drain point, no divergence between
what the operator asked for and what the model holds.

It loses on two counts. A rebuild is not free of *conversational* cost — it
discards accumulated session state, or forces a compaction that was not
otherwise due, so a configuration edit becomes a hidden context event. And the
cost stays invisible at the point of decision: the command that rebuilds a
four-hour session looks identical, at the call site and in the acknowledgement,
to the one that changes nothing anybody reads. A default exists to protect the
case its author cannot see, and this default protects the wrong one.

That alternative is not wrong, it is the *opt-in* — which is exactly what the
apply-now flag selects when the operator has decided the rebuild is worth it.

The other rejected shape is leaving the decision to each command. It converges
on immediate application every time, because each author correctly judges their
own change to be small, and none of them is looking at the sum.

## Decision rules

- Classify every command by what it touches. Standing layer: defer by default.
  Per-call payload only: apply now, it costs nothing.
- Give the deferral an explicit opt-out and make the operator name it. Do not
  infer urgency from the command's identity.
- Apply revocations and refusal-boundary tightenings immediately, regardless of
  cost; the asymmetry between granting and withdrawing is deliberate.
- Return applied-versus-queued as a typed outcome, keep the queue listable, and
  name the boundary that drains it.
- Permit exactly one mid-conversation rewrite by default — the one that buys
  back window the conversation cannot continue without — and require any
  proposed second exception to answer the same question.
- This technique governs the *timing* of a standing-layer mutation. What those
  layers contain is [layered-composition](./layered-composition.md); where the
  cached blocks are cut is
  [cache-breakpoint-allocation](./cache-breakpoint-allocation.md); the digest
  and the staleness verdict are
  [fingerprinting-and-cache-keys](./fingerprinting-and-cache-keys.md); and the
  exempted rewrite is
  [amortized-compaction-cadence](./amortized-compaction-cadence.md).
