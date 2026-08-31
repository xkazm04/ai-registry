---
layer: technique
type: technique
subject: admission-queue
technique: priority-and-fairness
status: forged
laws: [identity-survives-reuse, count-carries-predicate]
shared_with: []
use_when: [choosing who queues ahead of whom, one origin quietly owns the whole line, cancellation hits whoever moved into that slot]
---

# Priority and fairness

Queue order is a policy even when nobody wrote one: plain arrival order
*is* a scheduling policy, and under mixed workloads it is usually the
wrong one. The moment requests differ in urgency or in origin, the
designer owes the queue two explicit answers — **who goes first**
(priority) and **who may occupy how much** (fairness) — plus the repair
for the pathology both answers create (starvation).

## Priority: ordering by urgency

Priority levels exist because wait tolerance differs by orders of
magnitude across request classes. The person watching a screen tolerates
seconds; the nightly batch tolerates hours; putting them in one
arrival-ordered line optimizes neither. Discipline for the levels:

- **Few, named, and meaningful.** Two or three levels with stated
  semantics ("interactive: a human is waiting", "standard", "bulk:
  deadline is a day") outperform a numeric free-for-all. Open numeric
  scales suffer priority inflation — every caller's work is important to
  its caller, and within a release cycle everything is maximum.
- **Assigned by the class of the request, not the mood of the call
  site.** The mapping from request kind to level has one authority;
  scattering level choices across call sites re-creates the vocabulary
  drift this corpus's laws exist to kill.
- **Priority orders the wait; it does not skip the gate.** A
  high-priority request still receives the same three-verdict admission —
  it queues ahead, it does not stampede past depth bounds or host
  pressure. (The one principled exception: reject-by-class shed, where
  the bound itself is priority-aware — that interaction is
  [depth-bounds-and-shed](./depth-bounds-and-shed.md)'s ground.)

## Fairness: bounding occupancy per origin

Priority is about urgency; fairness is about **origins** — tenants, users,
features, projects — and the queue's duty not to let one origin buy the
whole line at the price of showing up first. The failure is quiet: one
eager origin enqueues fifty requests, every gauge reads healthy (depth
fine, throughput fine), and forty-nine other origins each experience a
dead system. Aggregates hide it by construction
([count-carries-predicate](../../../../_laws.md#count-carries-predicate): "depth
50" without "of which 48 from one origin" is the number that conceals the
outage).

The instrument is the **per-origin cap**: each origin may hold at most K
units of occupancy — running plus queued — and requests beyond K are
refused with the over-quota reason or held in a per-origin overflow that
does not consume shared positions. Two subtleties:

- **Cap the occupancy, not the submission.** An origin resubmitting a
  refused request costs nothing; an origin *holding* fifty positions
  costs everyone. The cap counts held capacity.
- **Snapshot the cap at enqueue.** The origin's limit is read once, when
  the entry joins, and travels with the entry. Re-reading configuration
  at every drain decision makes promotion order depend on config timing —
  an entry admitted under one limit and promoted under another is a
  race with a policy.

## Whether the origin may hold its own capacity depends on who mints the origin

The per-origin cap above assumes something it does not say: that origins are
*attested* — that the identity an entry arrives under was issued by the system,
or by something it trusts, and that a caller cannot manufacture a second one at
will. Under that assumption, giving each origin its own capacity is exactly
right. Where it does not hold, the same instrument becomes the attack.

The failure is arithmetic rather than subtle. If each origin may occupy K units
and the origin key is a value the caller supplies — a session identifier minted
client-side, an unauthenticated tenant header, an API key accepted before it is
validated — then a caller who presents N distinct keys occupies N×K, and the
process-wide bound the queue was defending is whatever the caller decides to
make it. Every gauge reads healthy while it happens: no origin exceeds its cap,
no cap was misconfigured, and the aggregate bound that would have caught it was
never expressed anywhere as a number a gate reads
([gate-sees-target](../../../../_laws.md#gate-sees-target) — a fairness policy
keyed on an identity the caller authors is gating against a fiction).

The repair separates two roles the origin key was quietly serving at once:

- **Capacity is bounded globally, once.** There is a single budget for the
  resource, and every admission — whatever it claims to be — draws from it.
  This bound is the one that must hold, and it must hold against a caller
  actively trying to defeat it.
- **Identity decides the order, not the allowance.** The origin key remains
  genuinely useful, because the thing it is good at survives being untrusted:
  dispatching waiters round-robin across distinct keys stops one busy caller
  from monopolising the *front of the line* under contention. A caller who
  mints a thousand identities gains a thousand positions in the rotation and
  not one byte of additional **concurrent occupancy** — the process-wide bound
  still holds, which is the half that matters and the reason this repair is
  worth keeping.

  Be precise about the half that does not hold. A thousand positions in a
  rotation over `M` honest callers takes roughly `1000/(1000+M)` of the
  *service rate*, not `1/(1+M)` — so the manipulation costs the attacker
  nothing and does take something from everyone else: **throughput share**.
  The two are different currencies and every fairness mechanism degrades in
  one of them under a mintable key. A per-origin **capacity** cap degrades in
  occupancy, and unboundedly — which is why the rule below forbids it. Round
  robin and any hash-bucketed scheme degrade in **share**, bounded by the
  global limit. Only the global bound never degrades at all. State which
  currency a mechanism protects, because "it cannot take capacity" and "it
  cannot take anything" are different claims and only the first is true.

  **"Bounded by the global limit" bounds the resource, not the honest
  caller.** Adding the global bound converts an unbounded occupancy loss into
  a total-but-bounded share loss, and the honest caller can be worse off in
  absolute terms under the correct policy than under the broken one — because
  the broken one was inflating total capacity and serving them out of the
  inflation. A measured instance: a per-key cap of 10/min against one attacker
  minting a thousand keys admitted 10,100/min, of which honest callers got
  100; the same traffic under one global budget of 100/min with the key used
  only for ordering admitted 100, of which honest callers got **one**. Both
  policies gave the attacker 99% of the service; only the second stopped the
  system from buying it. So the global bound is necessary and is not
  sufficient: restoring the honest caller's slice needs an **attested** key,
  and a design that stops at the global bound has protected its own capacity
  and abandoned its users. Say which of the two you have achieved.

- **A replicated per-key limiter degrades in occupancy too, with no attacker
  involved.** Where the bucket map lives in process memory and the service
  autoscales, the effective budget is the per-key limit times the instance
  count — a shard count the design does not control and did not choose. The
  key can be perfectly attested and unmintable and the bound still fails, for
  the same structural reason a mintable key fails: something other than the
  designer is setting the number of shards. A per-key limit is a durable quota
  only where the counter is shared across every replica; otherwise it is a
  speed bump, and the honest thing is to name it as one.

So the rule is: **an unattested origin key is a fairness scheduling key, never
a capacity shard.** Where the key *is* attested — an authenticated tenant, an
internal service identity, a validated API key bound to an account — the
per-origin cap of the previous section is correct and should be used; it is the
better instrument when it is safe, because it isolates rather than merely
interleaves. The question to answer before choosing is not "do we have a tenant
identifier" but "what does it cost the caller to have a second one", and the
answer must be checked against the *unauthenticated* path, since that is the
one an attacker will use.

A system that has already shipped per-key capacity on a mintable key cannot
repair it by validating the key later in the pipeline. Admission runs before
authentication in most designs — deliberately, because parsing and
authenticating a request is itself work worth bounding — so the gate sees the
claim, never the verdict. The bound has to be correct for an identity that was
never checked.

## Starvation, and aging as the repair

Every preference mechanism starves whatever it deprioritizes. Strict
priority starves the lowest class the moment upper-class arrivals are
continuous; per-origin caps starve nobody but can hold work back
indefinitely under sustained same-origin demand. The designed repair is
**aging**: an entry's effective priority rises with time waited, so
nothing waits unboundedly regardless of class. Aging converts "low
priority" from "may never run" into "runs later" — which is what every
caller assumed it meant. Where aging is rejected (a genuinely
sacrificial class that *should* starve under load), that is a legitimate
choice made in writing — the class's callers must know their tier means
"only in slack".

The starvation test is measurable, not rhetorical: **oldest-wait per
class and per origin**, watched over time. If any class's oldest-wait
grows without bound while the system serves others, starvation is
occurring, whatever the design intended. That instrument lives in
[wait-telemetry](./wait-telemetry.md).

## Identity under reordering

Priority and fairness *reorder the queue*, and reordering is where weak
entry identity dies
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Position is not identity: an entry's position changes on every promotion,
every shed, every priority bump, so anything keyed by position — a
cancellation, a status query, a duplicate check — targets whoever happens
to stand there now. Entries carry identity minted at enqueue; position is
a *view*, recomputed freely; cancellation and query address the identity.
The same discipline covers requeue: an entry that is parked and
re-admitted, or refused and legitimately resubmitted, is a **new
admission of the same logical request**, and the design says which
identity persists (the logical request's, for dedup) and which is fresh
(the queue entry's, for this wait).

## Fairness is layered, like the caps it extends

A per-origin cap inside one queue arbitrates that queue. It cannot see
demand the origin routes around it — other queues, other hosts, direct
execution paths. Fairness enforced at one gate while other doors admit
freely is fairness in name; the set of doors must be enumerable, and the
policy applied where they converge. (At the process layer, the same
layered-caps reasoning appears in
[concurrency-and-slots](../../../../llm-agent/runtime-and-io/subprocess-lifecycle/techniques/concurrency-and-slots.md)
— global cap for the machine, per-class and
per-tenant for the mix and the fairness; this technique is the
queue-side face of that structure.)
