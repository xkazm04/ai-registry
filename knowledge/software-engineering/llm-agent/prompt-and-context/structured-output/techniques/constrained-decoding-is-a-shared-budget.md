---
layer: technique
type: technique
subject: structured-output
technique: constrained-decoding-is-a-shared-budget
status: forged
laws: [limits-are-derived, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [several independently authored contributions each want constrained decoding on the same request, a provider began rejecting every request after a plugin was installed, the same model is reachable through a native host and a proxy that accept different grammars, deciding who owns the wire form of a constraint]
---

# Constrained decoding is a shared budget

The golden path treats constrained decoding as a per-call quality decision:
where the producer supports it, use it, because it shrinks the tolerant-parsing
ladder — and it still does not remove the validation door, because syntax was
never the contract. Both halves are right, and they describe **one** caller
asking for **one** constrained response.

The picture changes when the constraint can be requested by more than one
party. Then it is not a property of a call, it is a **contended resource with
a ceiling**, and the two ways it fails are ones no single caller can see or
fix.

## The capacity is finite and shared

Providers cap how many constrained schemas or grammars a request may carry —
sometimes explicitly, sometimes as a size or compile-time limit that amounts
to the same thing. The cap belongs to the request, not to the contribution,
so contributions consume it collectively while each one reasons locally.

The failure mode is the ugly kind: the request that breaks is not the one that
asked for too much. Enough independently authored contributions each behaving
reasonably will push a request past the ceiling, and the provider rejects
**every** request from then on — including requests that need none of the
constraints. Diagnosis from the symptom is close to impossible, because the
error names the request, not the claimant, and the remedy a user reaches for
is bisecting their own installed contributions.

So the capacity is admitted like any other bounded resource:

- **A contribution declares intent, not wire form** — that it wants
  strictness, which grammar, and at what **priority**. It does not decide
  whether the constraint is actually sent.
- **The assembling layer holds the budget and sheds by priority**, deriving
  the ceiling from the target provider rather than hard-coding one
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
- **Shedding is visible to the shed party.** A contribution whose constraint
  was dropped must be told, because its parsing posture depends on the
  answer: it has just been moved back onto the tolerant ladder and needs to
  behave accordingly. A silently dropped constraint produces a caller that
  believes syntax is guaranteed while it is not — the
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  shape, arriving as a parse error somewhere unrelated.

The system that has no budget has not avoided this; it has an unmanaged one
whose shedding policy is *whichever contribution loaded last wins*, discovered
in production.

## The dialect is a property of the route, not the model

The second reason this cannot sit with the caller: the grammar's wire form
depends on **how the model is reached**, and the same model is routinely
reachable several ways — a native host, a proxy, a self-hosted server, a
gateway that normalizes some things and not others. A contribution that pins
a grammar dialect has hard-coded one route's answer and will be wrong for a
user who changed a base URL, which is a change the contribution cannot
observe.

This is where the golden path's **third copy** needs a scope note. Its rule —
that the machine-readable schema sent with the request is one rendering of a
single definition, derived rather than hand-typed beside the domain model —
is exactly right and does not go far enough once routing varies: there is one
definition, but potentially **one rendering per route**, and the renderings
are the assembling layer's to produce. Derive them all from the same
definition; never let a contribution carry a pre-rendered one.

Where a route's support is not established, the answer is *unknown*, not
*unsupported*
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
Unknown and unsupported route differently: unsupported means fall back to the
tolerant ladder deliberately, unknown means nobody has checked, and the second
should be visible as a gap rather than silently rendered as the first.

## What stays with the caller

The division is clean enough to state as a boundary:

| The contribution owns | The assembling layer owns |
| --- | --- |
| that a constraint is wanted | whether it is sent on this request |
| the grammar's meaning | its dialect on this route |
| its priority relative to its own needs | shedding across all claimants |
| its parsing posture when told it was shed | telling it |

And nothing here relaxes the validation door. A constraint that survives the
budget and renders correctly for the route still only guarantees syntax. The
document that arrives well-formed, naming an entity that does not exist, is
exactly as dangerous as it was before any of this machinery ran.
