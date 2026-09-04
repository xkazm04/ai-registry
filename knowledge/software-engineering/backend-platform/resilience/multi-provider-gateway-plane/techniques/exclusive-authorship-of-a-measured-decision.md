---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: exclusive-authorship-of-a-measured-decision
status: forged
laws: [count-carries-predicate, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a strategy comparison keeps coming back inconclusive and nobody can say why, deciding whether a new selection policy should fall back to the old one when it fails, an outcome record attributes a result to a candidate that did not serve it, granting a component authority over a decision the plane already has three other ways to change, a compliance trail reports no substitution on a request that was substituted]
---

# Exclusive authorship of a measured decision

A plane that selects among candidates usually wants two things from the
selector at once: that it decide well, and that the decision be *evaluated* —
compared against the previous selector, promoted on evidence, tuned from
outcomes. Those two wants are in tension, and the tension is invisible because
it never produces an error. It produces a comparison that will not resolve.

The rule that resolves it is a single sentence with a wider blast radius than it
looks:

> **A decision you intend to measure must be the only thing that determined the
> outcome you record.**

Everything below is that sentence applied in the three directions a plane can
violate it: something answered *instead of* the selector, something overrode the
selector *after* it answered, and nothing checked whether either had happened.

## Nothing may answer in its place

The selector can fail — a policy process is unreachable, a scorer's artifact did
not load, a classifier returns a shape the contract does not admit. The obvious
answer is a fallback to a simpler selector that is always available, and the
obvious answer is what makes the whole plane unmeasurable.

A fallback here is not a degraded response. It is a **silent substitution of the
product**: both selectors return a candidate, both candidates return an answer,
and the answer the caller receives is well-formed and plausible either way. The
substitution has no signature in the output. So the fallback absorbs exactly the
population the evaluation exists to observe — every request on which the new
selector was broken becomes a request the old selector served successfully, and
the comparison reads as "no regression" precisely when there is one.

The failure mode is worth stating in its finished form, because a plane that has
one rarely recognises it: the more the primary selector degrades, the more of its
traffic the fallback serves, and the *better* the primary's measured outcomes
look, because its worst requests are no longer in its sample. A fallback is a
survivorship filter attached to the thing it is protecting.

So where a substitution is invisible in the output, the selector's failure is a
failure: bounded retries and then an error the caller can see
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The question that immediately follows is the right one — *then where does
availability come from?* — and it has an answer that does not cost the
measurement:

- **Replication and readiness**, so a single instance's loss is not the
  selector's loss. Two ready replicas and a readiness probe that asserts the
  artifact is actually loaded buys more availability than a fallback does, and
  buys it without changing what the plane serves.
- **Immutable, pinned artifacts.** A selector that resolves a mutable pointer at
  boot has an availability problem *and* a reproducibility problem; one that
  loads a pinned id with a verified digest has neither.
- **Staged rollout by population**, so a bad selector reaches a slice rather than
  the fleet.
- **An operator-level lever for rollback** — and this is the distinction that
  makes the rule practical rather than austere. An operator flipping a
  deployment back to the previous selector is *also* a substitution, and it is
  fine, because it is one decision, made by a person, at a known instant, on the
  record. What is forbidden is the *automatic, per-request* version of the same
  move, which is a decision nobody made, at an unknown rate, on no record.

That pair — operator lever yes, per-request fallback no — is the technique's
sharpest edge, because both are usually called "fallback" and only one of them
destroys the evidence.

## Nothing may override it afterwards

The second direction is subtler and is where mature planes actually fail. The
selector answered; the plane then served something else.

Planes accumulate mechanisms that adjust a decision after it is made, each
individually reasonable and each added by someone who was not thinking about
attribution: a session-level pin that reuses whatever served the last request, a
cost or cache-aware planner that overrides on expected value, a failover ladder
that substitutes on a retryable error, a response cache that answers without
consulting any candidate, an auxiliary call the plane generates on its own
initiative, a loop-breaker that rewrites the request after selection.

Six such mechanisms is not an unusual number, and every one of them can change
what served without changing what was selected. So **granting a component
authority over a decision is not a flag on the selection step — it is the
suspension of every other writer of that decision**, and the list has to be
written down. The workable form is an explicit capability the selector declares
and the plane honours by naming, in the contract, exactly which mechanisms it
disables while the capability is in force. The invariant those disablements buy
is worth stating as the acceptance test:

> one accepted decision maps to one dispatch attempt.

Two properties of the list matter more than its contents. It must be
**enumerated rather than assumed** — a plane cannot suspend writers it has not
inventoried, and the ones that get missed are the ones added last. And it must
be **honest about its exceptions**: a mechanism that decides whether the request
is routed *at all* sits upstream of the selector rather than beside it, and
excluding it is correct — but the exclusion is stated, with its reason, rather
than left as an omission a reader has to notice.

## Something must check that neither happened

The two rules above are design-time. Both leak, because a plane is edited by
people who did not read them, so the third rule is the one that survives:
**record the decided value and the served value separately, compare them, and
treat a mismatch as a fact about the record rather than a rounding error.**

The remedy on mismatch is the counter-intuitive part. The instinct is to correct
the record — to write down whatever actually served and carry on. That is wrong
when the record's purpose is attribution, because a corrected row still says the
selector produced an outcome it did not produce; it only lies about a different
field. **The correct remedy is to mark the sample ineligible for the thing the
record feeds** — excluded from training, excluded from the comparison, counted
separately — and to log the mismatch as an error, because a mismatch is evidence
that a writer nobody inventoried is still live.

The audit that does this must observe the substitution itself and not a proxy
for it ([gate-sees-target](../../../../_laws.md#gate-sees-target)). The common
defect has a recognisable shape: an audit flag derived from the *coarsest* axis
of the decision — did the provider change, did the vendor change — on a plane
whose substitutions happen on a finer axis, the model within a provider. Where
the coarse axis has one value in the current deployment, that flag is a constant
`false` computed at runtime, and it reports "no substitution" over every
substitution the plane makes. The values needed to compute the true answer are
usually already persisted a few lines away, which is what makes the defect so
durable: nothing is missing, the wrong pair is being compared.

Any number that leaves this plane — a cost, a win rate, a per-candidate quality
score — carries which decision produced it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
the mismatch check is what makes that claim true rather than aspirational.

## The corollary about A/B

One deployment pattern is ruled out entirely by the first rule, and it is
popular enough to name: **comparing two selectors by wiring one as the other's
runtime fallback.** It looks like an A/B and it is the opposite of one. The arms
are not independent — arm B runs only on the requests where arm A failed, which
is the least representative sample available — and arm A's failures are removed
from arm A's own results by construction.

Compare selectors by deploying them as peers over disjoint traffic, and promote
on each one's own merits. If a selector is not good enough to serve a slice
unaided, that is the finding, and it is one a fallback would have hidden.

## When not to use it

- **When the substitution is visible in the output.** A fallback that returns a
  materially different, self-describing result — a cached answer flagged as
  cached, a refusal, a lower-fidelity artifact the caller can identify — does
  not corrupt attribution, because the record can tell the two apart. The rule
  binds where the arms are indistinguishable downstream.
- **When nothing is being measured.** A plane that publishes no comparison, feeds
  no training, and tunes nothing may buy availability with a fallback and pay
  nothing for it. Say so explicitly, because the day someone adds an evaluation
  is the day the fallback silently becomes a defect, and the note is what makes
  that findable.
- **When the decision is not the plane's to own.** Where the caller pinned the
  candidate, there is no selector to protect and no attribution to preserve; the
  pin is the decision and the plane's job is to honour it.
