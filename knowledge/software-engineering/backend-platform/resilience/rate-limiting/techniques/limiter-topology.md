---
layer: technique
type: technique
subject: rate-limiting
technique: limiter-topology
status: forged
laws:
  - one-validation-door
  - gate-sees-target
shared_with: []
use_when: [two limiters on one resource through different doors, limiter on a proxy that traffic bypasses, deciding fail-open or fail-closed when counting is down]
---

# Limiter topology

A limit is a number attached to a resource, but enforcement happens at doors —
and most systems have more doors than they remember. This technique is about
the geometry: how many limiter instances exist, which doors they cover, how
layered limits compose, and which direction each limiter faces. Topology
mistakes are the quietest failures in this subject, because every individual
door looks correctly limited while the resource is not.

## One resource, one limiter

Two independent limiters, each enforcing N on the same resource through
different doors, enforce neither's number: the resource sees up to the sum,
delivered with a clear conscience by two components that each pass their unit
tests. The rule is structural, not disciplinary (law: one-validation-door):
**the limit on a resource is owned by one limiter instance, and every door
that can cause the work passes through it.** The doors are enumerable — a
written list, not a hope: the public interface, the automation hooks, the
scheduled jobs, the internal admin paths, the event handlers. New doors get
added to systems constantly, and each addition either routes through the
shared instance or silently raises the effective limit.

The audit is the same as any shared-authority audit: find the resource, list
every path that reaches it, and check each path's limiter *identity* — not its
configuration. Two instances configured identically are still two allowances.

## The gate must sit on the work

A limiter placed on a proxy for the work — the request parser, one particular
client library, a convenience wrapper — passes exactly the traffic that skips
the proxy (law: gate-sees-target). The placement rule: the limiter sits at the
last shared point through which *all* causers of the work flow, as close to
the resource as ownership allows. If no such shared point exists, that is the
finding — create the chokepoint first, then limit it; a limit on 80% of the
doors is a speed bump with a published bypass.

## Layered limits

Real policies stack: a per-key limit inside a global ceiling, a per-endpoint
limit inside a per-tenant one, a burst limit inside a sustained one. Layering
is healthy — the fine layer provides fairness, the coarse layer protects the
resource when the fine keys are numerous or freshly minted (the evasion
backstop from key-design). Two composition rules keep stacks honest:

- **Evaluate all, then commit all.** A request that passes the per-key check,
  consumes per-key allowance, and *then* fails the global check has spent
  fairness budget on work that never ran — and under sustained global pressure
  every key's allowance drains at zero throughput. Check every layer first;
  consume from all of them only when all admit; refuse having consumed
  nothing.
- **The refusal names the layer.** When multiple layers would refuse, report
  the one that binds — with *its* retry-after (the maximum across refusing
  layers, since the request succeeds only when every layer would admit it).
  "You are limited" and "everyone is limited" route to different caller
  behavior and different operator escalation, so a stack that reports only a
  generic refusal has thrown away the diagnosis (see refusal-contract).

## Scoped declarations: precedence, not stacking

Layering is one way several limits meet on one request; scoping is the other,
and a stack and a ladder compose by opposite rules. In a stack every limit
applies and every layer is checked. In a ladder the same *kind* of limit is
declared at nested scopes — the whole system, a tenant, a mounted component, a
path beneath it, a role used to enter it — and exactly one declaration governs
the request: **the most specific applicable one, never the sum and never the
minimum.** The rule: when one quota kind can be declared at several scopes,
resolve through one ordered ladder, stated once in the documentation and once
in the resolution function, and apply only the rung that binds, because each
declaration is an operator's statement about that scope, and a tenant's
deliberately tighter number that a coarser global number could override — or be
added to, or be minimised against — is a declaration nobody can rely on. Two
clauses keep the ladder honest. Two declarations at the same rung for the same
scope are a configuration error refused at resolution, not a tie broken by
iteration order. And whether a coarse declaration *descends* into scopes that
declare nothing is itself declared — an inheritable flag on the coarse rung —
because a global number that silently governs every tenant is as surprising as
one that silently governs none. The naive reading fails in two ways, both
discovered in production: precedence learned by experiment, where an operator
sets a tenant quota, watches it not fire and reconstructs the order from an
incident; or the additive reading, where a global number installed for the
fleet quietly tightens or loosens every tenant's derived one.

The same ladder governs every quota-shaped policy the system carries, including
credential lockout — threshold, duration and counter reset resolve per
authentication mount, then per method, then for all methods, then to defaults —
and a kill switch that disables the policy sits *above* the ladder rather than
inside it, so "off" cannot be out-ranked by a scope. A system with one ladder
for quotas and a different one for lockouts has two vocabularies for one concept
(see key-design's rule that the derivation is singular).

Three clauses complete a scoped quota's declaration. An **exempt set**: the
paths the quota never counts — liveness probes, the endpoints that unseal or
recover the system — declared as data beside the ladder and overridable,
because a quota that can refuse the endpoint used to recover from the quota has
locked the operator out of their own door. An optional **block interval**: a
breach becomes a ban on that key for a stated period rather than a per-request
refusal, which is the right shape against a persistent flooder (one refusal per
interval instead of one per attempt), and the refusal's retry-after is then the
ban's end, not the bucket's refill. And the **unit of counting**, stated rather
than assumed: a quota is per node and per client address unless it says
otherwise, so a three-node cluster enforces three times the number and every
caller behind one egress address shares one — the distribution posture from
"One process, or several", restated where the number is declared.

## Direction: shields and citizens

Ingress and egress limiters share machinery but not epistemology:

- An **ingress** limiter enforces a number this system owns. It is the
  authority; its arithmetic *is* the contract; precision at the boundary is
  worth paying for because the refusal publishes the rule.
- An **egress** limiter paces outbound calls against *someone else's* number.
  It is a local model of a remote authority, and the model drifts: providers
  change tiers, other clients share the quota, the published number was never
  exact. An egress limiter therefore runs slightly conservative, treats the
  provider's actual refusals as *corrections to the model* — feeding the
  observed reset times back into its pacing — and never treats its own green
  light as proof the provider will agree. The caller-side handling of the
  provider's refusals is [retry-backoff](../../retry-backoff/retry-backoff.md)'s
  territory; the egress limiter's job is making those refusals rare, not
  impossible.

The two directions also fail differently: an unavailable ingress limiter
fails open or closed by how recoverable each mistake is (a policy chosen in
advance — see "When the shared state is unreachable" below), while an unavailable egress limiter fails *open with
the provider as backstop* — the remote authority still enforces its real
limit; you have only lost politeness.

## One process, or several

Everything above is simplest when one process owns the resource and its
limiter: state is a map, atomicity is a lock, and the door audit is a code
search. Distributing the limiter — multiple nodes sharing one logical limit —
buys horizontal scale at the price of a consistency decision that must be made
*on purpose*: either centralize the counting (exact, adds a dependency and its
failure modes to every admission) or shard/replicate it (each node enforces a
share or a lagged view; the aggregate overshoots by a bounded, computable
factor). Both are legitimate; the illegitimate move is replicating the limiter
casually and believing the stated number still holds exactly. If the deployment
is single-node, say so and enjoy exactness — pre-distributing a limiter for
scale that is not coming trades away its simplest correctness argument for
nothing.

## When the shared state is unreachable

Centralizing the count adds a dependency, and the dependency will one day be
down. The golden path's rule stands — the direction is chosen in advance — but
a limiter whose counting was *deliberately* centralized has already made that
choice, and the choice is **closed**:

- **Configuring shared state is itself the declaration.** Nobody adds a network
  hop to a hot path for aesthetics. They do it because a fleet of N instances
  each enforcing N locally was enforcing (instances × limit) — a ceiling that
  *rises with autoscaling*, loosening precisely when demand peaks. Degrading
  silently back to per-instance counting on an outage restores the exact hole
  the operator paid to close, and does it unannounced.
- **Recoverability decides the direction, not criticality.** The honest test is
  what each mistake costs to undo. A wrongly refused free request is recovered
  by trying again in a minute. Money spent on an admitted request — inference
  billed per call, a metered upstream, a per-request-billed store — is not
  recoverable at all, and an outage in the counting layer is exactly when a
  wallet-draining flood is most likely to be in progress. Fail closed in front
  of spend; fail open in front of resources whose only injury is load.
- **State how far a fail-open degrades.** In a layered stack (see above) only
  the layer backed by the missing state is lost: a per-key burst cap held in
  local memory keeps working, so the fallback is a *bounded* degradation to the
  older, looser ceiling, not an unlimited one. That bound is what makes an
  availability-first override defensible — and it must be an explicit operator
  choice, off by default, never the code's silent preference.
- **A limiter that could not count did not refuse.** Whichever direction is
  chosen, the outcome is spelled honestly: a fail-closed refusal on unknown
  state has no true retry-after to offer — one window is the only defensible
  answer — and it belongs on its own counter, distinct from refusals the
  limiter actually evaluated (see refusal-contract, limit-observability).

## Decision rules

- **Write the door list down.** The limiter's documentation names the doors it
  covers; reviewing a new door means updating that list. An unenumerated door
  set cannot be audited, only believed.
- **Identity, not configuration.** Sharing a limit means sharing the instance
  (or the backing state), never duplicating the settings. Two limiters with
  the same number are two limits.
- **Consume atomically across layers.** All-or-nothing across the stack;
  partial consumption is a fairness leak that surfaces only under pressure.
- **Keep the model humble on egress.** Conservative pacing, corrections from
  observed refusals, and no alarm when the provider disagrees with the local
  model — disagreement is the expected steady state, at low rate.
- **A centralized counter fails closed in front of spend.** The decision to
  share state is the decision that one ceiling matters; a silent fallback to
  per-instance counting un-makes it. Any availability-first override is opt-in,
  and its degradation is stated as a bound, not as "best effort".
- **Choose the distribution posture explicitly.** "Exact and centralized" or
  "approximate by a stated factor" — either, written down. A distributed
  limiter without a stated consistency stance enforces an unknown number.
- **A ladder resolves to one rung; a stack applies every layer.** Say which a
  policy is. Scoped declarations of one kind pick the most specific, refuse
  duplicates at a rung, and say on the coarse rung whether it descends.
