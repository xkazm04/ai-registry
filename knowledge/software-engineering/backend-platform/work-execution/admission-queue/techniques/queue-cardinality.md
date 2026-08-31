---
layer: technique
type: technique
subject: admission-queue
technique: queue-cardinality
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [deciding whether one queue or several should stand in front of a pool, a free worker sits idle while work waits, classes of work need isolation but per-class state is unaffordable, choosing between priority levels and separate lines]
---

# Queue cardinality

Every other technique in this subject answers *what to do with an arrival*.
This one answers the question upstream of all of them: **how many lines are
there, and how does an arrival find its line.** The definite article in "the
queue" is a design decision, and a subject that never examines it has made the
decision by omission — one line, chosen because nobody asked.

The decision is not a matter of taste, and it is not the same decision as
ordering. Priority levels, per-origin caps and aging all reorder *one* line.
They are the right repair for unequal **urgency**. They cannot repair a line
that should not have been one line, because the loss there is not a matter of
who goes first.

## The discriminator is precommitment, not service time

Pooling is real: one line in front of `c` interchangeable servers beats `c`
independent lines, because no server idles while anyone waits. That is the
argument for one queue and it is correct **exactly while the servers are
fungible** — while whoever reaches the front can be served by whichever server
frees up.

The moment an arrival **precommits to a kind of server** before it joins the
line, the shared queue inverts. A job that needs a particular toolchain, a
request that must land on the shard holding its data, a task that only the GPU
box can run: the entry at the front cannot use the server that just freed, and
every entry behind it waits anyway. That is head-of-line blocking, and it means
a free server and waiting work coexist — the one outcome a queue exists to
prevent.

Two consequences are worth stating because both are counter-intuitive:

- **The penalty does not require unequal service times.** A shared line is
  slower than split lines under precommitment even when both classes take
  exactly as long as each other. Skew in service time makes it worse; it does
  not cause it. So "our tasks are all about the same size" is not a defence,
  and a team that checks only for skew will conclude the shared queue is fine.
- **The pooling benefit was never available to give up.** Where the servers
  are already non-fungible, splitting the queue costs nothing at all, because
  no arrival could have been served by the other type's servers in any
  arrangement. The cost of partitioning *machines* — idle capacity stranded
  per type — is a real cost and belongs to that decision; charging it to the
  queue decision is how a team ends up merging lines to recover pooling that
  their own machine types had already spent.

So: **count the queues by counting the sets of servers an arrival could
actually be served by.** One fungible pool, one line. Two kinds of work that
must land on two kinds of server, two lines, and the idle-capacity question is
answered by elasticity per type rather than by a shared line.

## Measure coexistence before you split

The claim above that splitting costs nothing where servers are non-fungible is
true of the steady state and false often enough to be worth an admission test,
because head-of-line blocking requires two classes to be **waiting at the same
instant**. Where arrivals are clustered by class in time — a bulk enqueue, a
fan-out over one job's shards, a per-tenant batch window, a nightly import —
the queue holds one class at a time even though it serves many, the blocking
the split would prevent never happens, and the split's own cost is paid in
full.

The test is a single number and any store with an arrival stamp and a promotion
stamp already holds it: **of the time the queue was non-empty, what fraction
held entries of more than one class?** Near zero means one line, whatever the
class count. A measured instance: a job queue serving twenty non-interchangeable
kinds over four fungible permits spent 1,610 seconds non-empty across a month,
of which **zero** held two classes — every congestion event was a fan-out of one
kind against itself. Enabling that system's already-built per-class caps made
aggregate wait **4.3× worse** and improved nothing, because the only class that
ever waited was waiting behind itself.

Note what that example does *not* excuse. The permits there were genuinely
fungible — any permit ran any kind, and the non-interchangeability lived
downstream in a per-host rate governor rather than in the slot. So the count
question returned one honestly. Coexistence is the second test, after the
fungibility count, and it exists to catch the case where the count says several
and the traffic says one.

## When the classes are origins and you cannot afford to remember them

Splitting by *class of server* is decided by the workload's shape. Splitting by
*origin* — one line per tenant, per caller, per key — has the same motivation
(one busy origin should not occupy the whole line) and an obstacle the first
case does not have: per-origin state. Remembering every origin costs memory
that grows with a number the origins choose, which is a bound an unattested
caller can move.

The stateless alternative fixes the number of lines and **hashes the origin
into them**. A fixed set of queues, an origin's key mapped to one of them, no
per-origin bookkeeping at all: memory is now a property of the design rather
than of the traffic. What is bought with state is paid in **collisions** — two
origins landing in one line share its service, and a busy one degrades a
stranger.

Three properties decide whether that trade is acceptable, and each has a
repair:

- **Collisions under a static hash are permanent, not transient.** Two keys
  that collide today collide on every future request, so a victim does not
  average out — it is durably degraded, and an attacker who finds a colliding
  key holds a durable weapon. **Rotate the mapping** on a schedule. This is a
  second and independent reason to salt a bucketing hash: the familiar reason
  is that an unguessable salt stops an attacker choosing a bucket, and this one
  is that a *rotating* salt stops any collision, chosen or accidental, from
  being forever.
- **A fixed bucket count caps identity-minting; it does not defeat it.**
  Minting keys cannot multiply capacity, because the number of lines is a
  constant the caller does not control. It can still buy **share**: an origin
  occupying `k` of `F` buckets takes roughly `k/F` of the service rate. Bucket
  hashing is therefore a fairness scheduling mechanism and never a capacity
  shard, which is the rule
  [priority-and-fairness](./priority-and-fairness.md) states for unattested
  keys generally.
- **Deal a hand, then choose.** Mapping a key to a *set* of candidate queues
  and placing the arrival in whichever of them holds the least work reduces the
  chance that any two origins share their whole set, and turns a full collision
  into a partial one. It costs one comparison at enqueue and it is what makes
  the stateless design survive an adversary rather than merely a coincidence.

## What the count owes the rest of the subject

Cardinality is decided before ordering, and once decided it changes what the
other techniques mean:

- **Bounds are per line, and the sum is the real bound.** `F` queues of depth
  `d` is a system that admits `F×d`, not `d`. Sizing each line against the
  whole-system tolerance overcommits by the factor of the count, which is
  exactly the failure [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
  describes: a depth number means nothing without the predicate of how many
  lines carry it.
- **Wait telemetry is per line or it hides the defect.** A mean wait across
  lines reads healthy while one line starves, and starvation confined to a
  single line is the characteristic failure of this design rather than an
  exotic one.
- **An entry's identity must survive the mapping.** Where a rotating salt or a
  rebalanced bucket count moves entries between lines, the entry keeps its own
  identity across the move
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); a
  design that re-derives an entry's identity from its current line loses track
  of it at precisely the moment the mapping changes.

## Decision rules

- Count the distinct sets of servers an arrival could be served by. That count
  is the floor on the number of queues.
- Never merge lines to recover pooling across servers that are not
  interchangeable. There is no pooling there to recover.
- Where classes differ in urgency but any server can serve any of them, use
  priority within one line, not separate lines.
- Where origins need isolation and their number is caller-controlled, hash into
  a fixed set of lines rather than remembering origins.
- Rotate a bucketing hash's salt on a schedule; a permanent collision is a
  permanent victim.
- State the bound as depth **per line** with the line count beside it.
- Report wait and depth per line, never only their aggregate.

## What this technique does not own

The *ordering* inside a line, the occupancy caps and the aging that repairs
their starvation are [priority-and-fairness](./priority-and-fairness.md). The
*unit* a depth bound is spelled in is
[resource-denominated-bounds](./resource-denominated-bounds.md). Elastic
capacity per class — the answer to the idle-per-type cost that partitioning
machines creates — belongs to whatever owns the pool, not to the queue in front
of it.
