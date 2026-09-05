---
layer: technique
type: technique
subject: serving-process-topology
technique: cache-residency-sets-the-balancing-unit
status: forged
laws: [failure-not-empty-success, limits-are-derived]
shared_with: []
use_when: [adding replicas in front of a service that reuses state between related requests, a request's cost depends on which replica served the one before it, deciding whether a general-purpose load balancer can front a stateful serving path, one deployment mode supports a scaling flag and its sibling does not, sizing concurrency for a service whose per-client state lives in a cache, a team refuses replication for a reason its own transport already prevents]
---

# Cache residency sets the balancing unit

Replication is normally treated as a pure capacity term: pick a width, multiply
the per-replica cost, put a balancer in front. That works because of an
assumption nobody writes down — **any replica can serve any request** — and the
assumption is a property of the *cache*, not of the service. A stateless
replica set earns it. A replica set whose members accumulate reusable state
about a caller does not, and the moment it does not, the balancer is making a
correctness decision while presenting itself as a capacity one.

The discriminating question, asked before the width is chosen:

> **Does a request's cost or result depend on which replica served the request
> before it?**

If no, replication is arithmetic and the balancer is free. If yes, the **unit
of balancing is no longer the request** — it is whatever span of requests
shares the state, and the topology has to be built around that unit rather than
around the replica count.

## The two regimes, and why the usual remedy only fits one

The cache-coupling problem has a well-known shape where the coupling is
*incidental*: a producer holds a result some consumer will collect, routing
picks the consumer late, and the correct move is to make the grant fine-grained
so the coupling never reaches the balancer at all. That is the right answer
whenever the coupling can be dissolved.

This technique is about the regime where it **cannot**. When the reusable state
is the client's own accumulated prefix — everything the service has already
processed for this span, held where it was produced, growing with every
subsequent request — there is nothing to lease finely and nowhere else to put
it. The affinity is not an optimization that leaked into the router; it is the
thing that makes the cost model true. Dissolving it means recomputing the
prefix on every request, which is precisely the cost the cache existed to
remove.

Distinguish them by asking **what the state is about**. State about a *work
item* can usually be leased, moved, or re-derived, and belongs out of the
balancer. State about a *span of interaction* — a session, a stream, a
conversation, a growing upload — is defined by its history and cannot be
reconstructed anywhere else without paying for the history again.

## What goes wrong is a wrong answer, not an error

This is the reason the question is worth asking before the deployment rather
than after. A later request routed to a replica that never saw the earlier ones
does not fail. The replica has a valid request, an empty prefix, and no way to
know the difference — so it answers, and the answer is confidently wrong or
silently degraded in a way that looks like the model or the data being poor
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Every symptom points somewhere other than the balancer:

- The defect is **load-dependent**. At one replica it never reproduces, which
  is the shape of a development environment. It appears at width.
- It is **partial**. The first requests of every span are correct, because they
  land before any state exists to miss, so the surface looks healthy and the
  tail is wrong.
- It is **distributed across spans** in proportion to the width, so no single
  trace shows a break — each replica's log is internally coherent.

Where the mis-routing can be detected cheaply, detect it: the state a request
expects to find is usually identifiable, and a replica that is handed a
continuation whose prefix it does not hold should refuse rather than answer
from nothing. That refusal is the only signal in the system that names the
actual fault.

## Ask which layer can still re-route, because one of them may already pin it

The question above is necessary and it is not sufficient, because "the balancer
sends the next request elsewhere" presumes a balancer that gets to decide. Often
something already decided for it, and the deployment is safe for a reason nobody
wrote down — or unsafe at a layer nobody looked at. **Enumerate the layers that
can re-route, and answer at each one:**

- **A connection-oriented transport pins affinity for free.** Where the whole
  span rides one connection — a socket held open for its duration — a
  general-purpose proxy forwards that connection to one upstream and every
  later message on it lands where the first did. No affinity rule is needed,
  because none is possible. This is worth checking *first*: it is the cheapest
  possible answer, it is invisible in a topology diagram, and a team that has it
  may be arguing about sticky routing they do not need.
- **A scheduler below the transport is not pinned by it.** A runtime that
  distributes work across internal replicas does so beneath the connection, so
  the transport's guarantee stops at the process boundary and the span scatters
  anyway. A pinned connection into an internally-replicated engine is the case
  that looks safest and is not.
- **A stateless surface beside the affine one has no pinning at all.** The same
  service commonly exposes both — a session transport and a whole-request
  endpoint — and they have *different* answers. Deciding once, for the service,
  is how the affine half gets governed by the stateless half's reasoning.

The failure this catches is a wrong *reason* rather than a wrong conclusion, and
that is worse than it sounds. A team that refuses replication citing a hazard its
transport already prevents has recorded a rule nobody can maintain: the stated
reason is checkable and false, so the next reader either dismisses the rule or
preserves it as folklore. Meanwhile the real constraint — usually per-replica
memory for the retained state, which multiplies exactly as any other per-process
budget does — goes unstated and unsized. **State the reason at the layer that
actually binds**, and if the answer is "our transport already guarantees this",
write that down too: it is the fact that makes the next scaling decision cheap.

## The shape that follows

Once the unit is the span, the deployment is **N independent single-unit
services with the span routed to one of them**, not one N-wide replica set
behind a request-level balancer. Three consequences the sizing arithmetic has
to absorb:

- **The balancer needs the span's identity, and it needs it early.** Where the
  identifier arrives in-band — after the connection is established, in a first
  message — a proxy operating on connections cannot see it, and the routing has
  to move up to something that can. Check where the identity first becomes
  legible before assuming a general-purpose proxy can do this.
- **The framework's own replication may sit below the router, where nothing
  can make it sticky.** A runtime that distributes internally across ranks
  offers no seam for affinity from outside it, so the correct use of that
  feature is *not to use it* in this regime — the replicas have to be separate
  processes with separate addresses precisely so that something upstream can
  choose between them.
- **Concurrency is bounded by the cache, not by compute.** The number of
  concurrent spans one unit can hold is the cache size over the per-span state
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)), and it binds
  before throughput does. Raise the cache before raising the concurrency limit;
  raising the limit alone converts a queue into evictions, and an evicted span
  is the wrong-answer failure above arriving from inside a correctly routed
  deployment.

## Refuse the sibling's flag; do not omit it

Where two deployment modes of one system differ on this — one stateless and
freely replicable, one span-affine — they will share a launcher, a document
set, and an operator. That operator will arrive from the sibling's instructions
and type the sibling's scaling flag.

**Define the flag in the affine mode and fail on it with the reason**, rather
than leaving it undefined. The two failures are not comparable: an undefined
flag produces a generic complaint that names the flag and nothing else, at
which point the reasonable inference is that the tool is older or the spelling
is wrong, and the next move is to look for the equivalent. A defined flag that
refuses can say what the operator was trying to do, why this mode cannot do it,
and which topology achieves the same throughput — three sentences, delivered at
the moment of the attempt, to the person who needs them.

The same rule bars the worse variant: **accepting the flag and ignoring it.**
A mode that takes a replication width, runs one replica, and reports success
has produced a deployment whose capacity is a fraction of what its operator
provisioned, and nothing will say so until the queue does.

## When not to use this

- **The state is a pure optimization.** If a cold replica returns the same
  answer more slowly, this is a hit-rate question and belongs with capacity
  planning, not correctness. Say which it is out loud — the two are routinely
  confused because both are described as "the cache".
- **The spans are short relative to the routing period.** Where a span is one
  or two requests, the affinity is cheap to abandon and the recompute is
  bounded; take the simpler topology.
- **The state can be externalized.** A shared store that any replica can read
  restores interchangeability, at the cost of the transfer. That is a real
  alternative and should be priced against the routing complexity rather than
  dismissed; it is the right answer when spans are long and traffic is uneven.
