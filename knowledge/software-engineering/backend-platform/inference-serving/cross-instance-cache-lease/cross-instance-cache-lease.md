---
layer: golden-path
type: golden-path
subject: cross-instance-cache-lease
status: forged
use_when: [one process holds an expensive result for another process to collect later, choosing how long to keep a cache entry alive for a peer, a retention timeout is stranding memory or discarding work, a deadline computed on one machine is compared on another]
techniques:
  - renewal-beats-a-tuned-timeout
  - renew-from-arrival-not-from-work
  - monotonic-renewal-never-shortens
  - a-deadline-is-not-portable-between-clocks
---

# Cross-instance cache lease

One process finishes an expensive computation and does not need the result
itself. A second process — on another machine, in another failure domain — will
come and take it. Maybe in eight milliseconds. Maybe in forty seconds, because
it is queued behind a traffic surge. Maybe never, because it died between
asking and collecting. Until it arrives, the first process is holding the
result at real cost: gigabytes of the fastest memory in the building, taken
from the working set that serves everyone else.

**How long does the holder wait?** That is the whole subject. It looks like a
tuning question and it is not one; it is a structural question with a known
answer, and the reason it is worth a subject of its own is that the naive
answer — a retention timeout — is a single number that two failure modes pull
in opposite directions.

The shape recurs far outside any one system: a build cache holding an artifact
for a downstream job, a staging area holding a decoded frame for a consumer
stage, a session store holding a materialized view for a follow-up call, an
intermediate result parked for a worker that has been dispatched but not yet
started. Whenever **the producer's obligation to keep something outlives the
producer's own need for it**, this subject applies.

## The unit is retention, not exclusion

The first distinction, because getting it wrong imports the wrong mechanism
wholesale. A lock or an exclusive lease answers *who may act on this resource*;
its hazard is two parties acting at once, and its correctness argument is about
mutual exclusion. This subject's lease answers *how long must this resource
survive*; its hazard is a unilateral reclaim by the holder, and nobody is
contending for anything. Two collectors both pulling the same cached blocks is
not a bug — reads do not conflict.

The discriminating question, asked out loud before building: **if the grant
were absent, would two parties collide, or would one party throw away something
another still needs?** Collision means exclusion, and the disciplines that
follow are conflict scoping, all-or-nothing acquisition and drain-on-stop. Loss
means retention, and the disciplines are the four below. A retention problem
solved with an exclusion mechanism gets a serialized pipeline it never needed;
an exclusion problem solved with a retention mechanism gets silent corruption.

A second neighbour worth separating: **a keep-alive on a transport is not a
renewal on a lease.** A keep-alive exists because an idle connection is
indistinguishable from a dead one to intermediaries that reap it, and it
defends a *connection*. A renewal extends a *deadline held as state by a peer
that will outlive the connection*: drop every connection between the two
processes and the lease is still ticking, still needs extending, and still
expires at a moment the peer computed. Ask which one is at stake by asking what
is lost on silence — a socket, or an object.

## Both failure modes, and why one number cannot serve them

State the two failures as a pair, because the pairing is the argument:

- **The collector crashed.** With a long retention timeout, the holder keeps
  gigabytes reserved for minutes on behalf of nobody. That is not merely
  wasted; it is *actively harmful and invisible*, because every unrelated
  request that lands on the holder in the meantime runs against a smaller
  working cache, evicts more, recomputes more, and answers slower. The
  degradation shows up as a latency regression with no error attached to it.
- **The collector is merely slow.** With a short retention timeout, the holder
  releases the result before it is ever collected. The collector arrives, finds
  nothing, and redoes the expensive work — which is the exact cost the whole
  mechanism existed to avoid, now paid twice, at the worst moment, because the
  reason it was slow was that the system was already saturated.

Lowering the timeout is the obvious move and it does not work: it converts the
second failure into the first and back. Any value is right for one arrival
distribution and wrong for the other, and the arrival distribution is set by
load you do not control. There is no correct number, so the search for one is
the mistake.

**The general rule, which is the most transferable thing in this subject: when
two failure modes pull a single parameter in opposite directions, the parameter
is the wrong control surface.** Do not tune it, and do not add a second
parameter to correct the first. Find the signal that distinguishes the two
cases and key on that instead. Here the signal is blunt and cheap: *is the
collector still alive and still intending to collect?* A crashed collector
cannot say so; a queued one can, at negligible cost. So the answer is a **short
initial lease plus renewal while the intent persists** — bounded and short for
the dead case, unbounded for the slow case, with nothing left to tune between
them. That is the golden path, and the three remaining techniques are what make
it safe.

## The four disciplines

1. **Renewal replaces the tuned timeout** (renewal-beats-a-tuned-timeout). A
   short grant at request time, extended repeatedly while the collector still
   wants it. The initial grant is sized for the dead case only; the renewal
   interval is derived from the grant, not chosen beside it.
2. **Renewal begins at arrival, not at execution**
   (renew-from-arrival-not-from-work). The instinct is to renew from the code
   that does the work, because that is where the work is. The instinct is
   wrong, and this is the failure that gets shipped.
3. **Renewal is idempotent and monotonic**
   (monotonic-renewal-never-shortens). Extend to the later of the existing
   deadline and the new one; never assign. One line, one whole class of race
   removed.
4. **A deadline is not portable between clocks**
   (a-deadline-is-not-portable-between-clocks). A monotonic clock is
   per-process. Correct at the comparison, using the offset the handshake round
   trip already gave you for free.

## Granularity: lease the work item, not the peer

Grant one lease per request, not one per peer instance. A per-instance grant
couples every in-flight item to the unluckiest one: a single collector that
hangs holds everything that peer ever asked for, and a single collector that
dies frees results other live collectors are still coming for. Per-request
leasing costs a small map and buys independent failure — the property the whole
design is purchased for.

There is usually a second, harder reason, and it is worth looking for because
it turns a preference into a constraint: **the holder often does not know which
collector the result belongs to at the moment it produces it.** Where routing
picks the collector after production, per-instance leasing would force the
router to commit to a pair before it has the information to choose well.
Leasing per item keeps that coupling out of the load balancer, and the peer
identity arrives later, with the first renewal.

The cost of that granularity is message volume, and the answer is **batching,
not coarser leasing**: all renewals owed to one peer in one scheduling step
travel as one message. N in-flight items against one holder cost one renewal
message per interval, not N. Batching is the reason per-item granularity stays
affordable, so the two decisions are made together — split the lease finely,
then coalesce the traffic. A design that leases coarsely to save messages has
paid for message volume with correctness.

**The fanout is asymmetric, and only one direction is dangerous.** Where one
collector must pull from several holders, it must renew with *every* one of
them; missing a holder loses that holder's share of the result, and the failure
is partial, which makes it harder to diagnose than a total one. The opposite
direction — several collectors renewing one holder for the same item — is
harmless and needs no coordination at all, because extension is monotonic.
Enumerate the fanout before writing the renewal loop: the many-holders case is
where the bug lives.

## Carry renewals on a channel that already exists

Renewal is small, frequent, tolerant of loss and reordering, and needed exactly
when the peer relationship already exists. That is the profile of a message
that should ride an **existing** channel — the notification stream, the control
plane, the same session the transfer uses — and not of one that justifies a new
socket, a new port to open in a firewall, a new listener to supervise, and a
new failure mode where the data path is healthy and the liveness path is not.

Reuse also inherits the existing channel's transport negotiation and fallbacks
for free, which matters because renewal must work on every deployment the
transfer works on, including the ones with the exotic interconnect and the ones
with none. If the only channel available is one whose failure is *correlated*
with the resource being held — so that losing the resource and losing the
renewal are the same event — that correlation is an argument for a separate
channel, and it is the only argument that is.

A renewal send is allowed to fail. Log it at a low level and move on: the
derived interval already provides several attempts inside one grant, and
monotonic extension makes a late or duplicated one harmless. This is only true
*because* of those two properties, so a design that abandons either must
revisit the error handling at the same time.

## Renewal runs in the loop you already have

Put renewal in the existing execution loop — the scheduler tick, the event
pump, the frame — and not in a background thread. Concurrency around a
deadline map is exactly where a lease dies wrongly: a renewal racing an expiry
sweep, a lock held across a network send, a thread that survives the object it
renews.

That is legitimate **only when the margin is stated**. The loop's period must
be at least an order of magnitude shorter than the renewal interval, so that
ordinary jitter, a long step, or a step spent entirely inside a compute call
cannot push a renewal past a deadline. Write the two numbers next to each other
and write the ratio; a margin nobody wrote down is an omission wearing the
costume of a decision. State also what invalidates it: if the loop can ever
block for a time comparable to the renewal interval — a synchronous
recompilation, a model swap, a stop-the-world pause, a step whose duration
grows with batch size — the margin is gone and renewal has to move somewhere
with its own clock, or the grant has to grow.

## What a lease cannot do on its own

A lease bounds a *belief about time*. It does not bound *action*, and the
difference is where systems get hurt when they later add mutation:

- **A lease is not a fence.** If the holder can reallocate the resource after
  expiry, then a collector that stalls, resumes and pulls against its stale
  belief must be rejected by something other than its own opinion of the clock.
  The mechanism is a monotonically increasing generation number minted by the
  holder on every grant, carried in every subsequent operation, and checked at
  the point of effect: an operation bearing a generation older than the current
  one is refused, not merely logged. While the protocol is read-only — the
  collector copies bytes and mutates nothing — the fence is not yet needed, and
  saying so explicitly is what makes it cheap to add on the day the protocol
  stops being read-only.
- **The reclaimer's clock decides, not the holder's request.** Expiry is
  evaluated where the resource lives. A collector that believes it has 200
  milliseconds left is making a prediction, not holding a right, and it should
  treat a pull that fails with *gone* as an ordinary outcome with a recompute
  path — never as an invariant violation.
- **The safety margin belongs to the reclaimer.** A holder that reclaims at
  exactly the deadline races every renewal in flight. Reclaim at the deadline
  plus a margin covering one renewal transit; the collector, symmetrically,
  renews well before its own deadline rather than at it. Both sides err toward
  keeping the thing.

## Where this mechanism does not apply — and say so

Renewal requires a party that knows it still wants the resource and can cheaply
say so. When the next access is **externally timed** — a client that may or may
not come back with a follow-up, a user who may reopen a session, a caller whose
arrival is a property of human behaviour rather than of a queue you can see —
there is no such party. Nobody can renew on behalf of an intention nobody has
formed yet, and a heartbeat from a client is a different mechanism with
different trust properties.

For that case, keep a plain fixed timeout, size it from the observed
inter-access distribution, and treat it as what it is: a cache eviction policy,
not a lease. **A design that names the case it does not cover is more
trustworthy than one that quietly covers everything**, and a system with both
kinds of retention should be able to point at each and say which discipline it
is under. The same argument that made a single tuned number wrong for the
in-flight case makes it *right* here: with no liveness signal available, there
is no better control surface, and the honest move is to admit the number is a
tradeoff rather than dress it as a lease.

## Failure signatures

- **Latency regressions on a machine with no errors and no traffic change**:
  retention is stranding memory for collectors that are gone.
- **Expensive work redone under load, and only under load**: the grant expired
  in the queueing window, which is the window that grows when it is worst to
  grow.
- **A deadline that moves backwards under retry**: assignment instead of
  monotonic extension.
- **Expiries clustered around the arrival of a slow peer**: renewal wired to
  the execution path rather than to arrival.
- **Sporadic early expiry on some peer pairs and not others**: a foreign
  monotonic deadline compared as if local.
- **A resource released while a pull is in flight**: no reclaim margin, or the
  holder trusting the collector's clock.

## Observability: the expiry is an incident, not a statistic

Count *collected releases* and *expired reclaims* as separate outcomes, and put
the second on a dashboard next to recompute cost. In a healthy system the
expiry path is the crash path, so a nonzero steady-state expiry rate says
either that collectors are dying at that rate or that renewal is broken —
either way it is a question, not a background level. Record, on each expiry,
how long the grant had been held and how many renewals it received: one renewal
and out is a crash; hundreds of renewals and out is a collector that is alive,
starving, and being punished for it, which is a scheduling problem the lease
correctly refused to hide.
