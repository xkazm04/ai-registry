---
layer: golden-path
type: golden-path
subject: data-plane-transport-selection
status: forged
use_when: [adding a peer-to-peer fast path beside an existing broker, deciding which messages may bypass the supervisor, throughput improved and a declared guarantee quietly stopped holding, sizing a zero-copy threshold, auditing what a bypass costs]
techniques:
  - size-threshold-by-page-cost
  - route-probe-then-freeze
  - policy-demotes-transport
  - moved-payload-has-no-fallback
  - path-divergence-audit
  - control-plane-off-the-data-path
---

# Data-plane transport selection

A graph of long-lived processes joined by declared edges starts with one way
to move a message: the producer hands it to the supervisor that already exists
to spawn, watch and route, and the supervisor hands it to the consumer. That
**brokered path** is not a compromise. It is where every guarantee the system
advertises actually lives — the edge's queue depth and its eviction rule, the
ordering the consumer is promised, the recorder that observes every message,
the staleness deadline the supervisor refreshes, the one place a policy
declared in a descriptor is read and enforced.

Then someone measures a camera frame going through it, and a **direct path**
appears beside it: producer to consumer with no process in between — a shared
memory region when the two peers sit on one host, a network session when they
do not, resolved behind one interface so the calling code cannot tell which it
got. This subject is the choice between those two routes: the arithmetic that
decides it per message, the proof that a direct route works before anything is
trusted to it, the freeze that keeps every send of one edge on one route, the
rule that a declared guarantee demotes the transport regardless of speed, and
the honest ledger of what the bypass costs. It owns the decision and its bill,
not the queue at the far end of the edge, not the processes at either end, and
not the failure modes of a relay you *add* to a stream.

## The failure this subject exists to prevent

A bypass is adopted for the number in its headline and audited for nothing
else. Large payloads get dramatically faster, the change ships, and four
things are true afterwards that nobody wrote down: small messages got
*slower*, because the direct path's fixed costs now sit under payloads too
small to amortize them; the edge's declared queue policy is enforced by the
broker and the peer path never heard of it; the recorder was a subscriber of
the broker and now observes a fraction of the traffic; and the staleness
deadline that made an edge's silence detectable is refreshed by the very
supervisor the message no longer passes through.

Not one of those produces an error. Each is **a guarantee that was stated for
one path and silently not restated for the other**, which is exactly the shape
of an optional guard ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)):
it protects the path that was measured and is simply absent on the path that
now carries the traffic. Everything below is the refusal of that — a route is
proven before it is used, a declaration outranks a measurement, and every
promise made about one route is re-proved on the other or written down as lost.

## Two routes, and the second one is not "local"

The obvious decomposition has three routes — shared memory for peers on one
host, network for peers on two, broker for everything else — and it is the
first mistake. Three routes means three implementations of every guarantee, of
which one is exercised constantly, one occasionally and one almost never; the
two that diverge are always the two rarely run together, and the divergence is
found in production by a deployment that moved a node to a second machine.

**Keep exactly two routes: brokered and direct.** Locality is not a route, it
is an optimization the direct path resolves for itself — same publish, same
subscription, same semantics, with a shared mapping underneath when the peers
can share one and a copy over the wire when they cannot. The transport layer
is allowed to know where its peer is; nothing above it is, so a node that
migrates between machines changes its performance and not its meaning.

## The threshold belongs to the allocator, not to the benchmark

The direct path is not universally faster, and the crossover is not a small
correction. Below roughly two kilobytes it is substantially *slower* — a
regression of more than half — because its fixed costs do not shrink with the
payload: a block is claimed from a shared pool whose minimum unit is a page, a
descriptor is published, the receiver maps and reference-counts the block, and
the block is returned. Against a few hundred bytes copied into a channel that
already exists and is already warm, all of that is overhead with nothing to
amortize it.

So the rule is a size threshold, and **the threshold is derived from the
allocator's minimum shareable unit rather than read off a benchmark curve**. A
curve's crossover is a fact about one machine's cache hierarchy and one day's
kernel; a page is a fact about the mechanism, and the first size at which the
mechanism is not wasting what it allocates. Ship it engaged by default, expose
it as a runtime override for the deployment that knows its own hardware, and
**leave the small-message path untouched** — the point of a threshold is that
the majority of messages keep the behaviour they already had.
[size-threshold-by-page-cost](./techniques/size-threshold-by-page-cost.md)
owns the derivation, the override, and the first-message cost the threshold
does not cover.

## Prove the route, then freeze it

At the moment a producer wants a direct route, nothing about it is known. The
consumer may not have started, may have started and not joined, may be on a
host where the shared mapping is unavailable because a memory-locking limit
was never raised. Two answers are tempting and both are wrong: assume the
route works, and messages vanish into a session nobody is listening on;
re-check on every send, and every message pays a probe while the edge's
behaviour changes underneath a running graph.

The stance is **probe once, inside a bounded grace window, then freeze**. The
producer emits acked probe markers on each direct route; the window is
measured **from the readiness barrier, not from spawn**, because a consumer
that spends eight seconds loading a model would otherwise be demoted for a
reason that has nothing to do with whether its route works. Whatever is
acknowledged when the window closes is direct for the whole run; whatever is
not is **frozen on the brokered path for the whole run and never upgrades
mid-flight**.

The freeze is the load-bearing half: one edge on one path for a whole run
means ordering, queue behaviour, observability and recording are the same for
the first message and the ten-millionth, and a reader of a recording never has
to establish which half of a run they are looking at. A route that silently
upgrades on message four hundred is a system with two behaviours and one name.
The freeze is also a real cost, stated rather than buried: **one dropped
acknowledgement costs a producer the fast path for its entire run.** That is
the right trade — a stable answer is worth more than an optimistic one, and an
absent acknowledgement is not evidence that a route is bad but the absence of
evidence that it is good
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)) — but it
is defensible only if the demotion is visible, so a demotion is a counted,
logged event naming the edge and the reason, never a quiet fallback.
[route-probe-then-freeze](./techniques/route-probe-then-freeze.md) owns the
handshake, the window, and the freeze.

## A declared guarantee outranks a measured speedup

Size and reachability decide whether a direct route *can* be used. The
descriptor decides whether it *may* be. **An edge whose declared guarantee is
observable only on the brokered path takes the brokered path regardless of
payload size** — a lossless ordering requirement, a recording obligation, a
staleness deadline whose expiry must be detected.

The deadline is the sharp case. A remote consumer that declares one is pinned,
because the deadline is armed and refreshed by the supervisor sitting beside
that consumer, and the bypass removes precisely that supervisor from the path:
deliver the message faster and the consumer stops being able to tell that the
edge went quiet. The fast path is not worth a liveness guarantee the
descriptor asked for.

The rule generalizes: **the declaration is the authority and the transport is
derived from it**, once and centrally, where both the descriptor and the
peers' actual placement are visible. The producer receives a route decision
and executes it. Selection never expects a descriptor's author to know that
declaring a deadline also means "and please do not go fast" — making the
operator hold both halves is how a policy becomes advisory.
[policy-demotes-transport](./techniques/policy-demotes-transport.md) owns the
demotion table and the traps in it.

## Some sends cannot be taken back

A brokered send borrows the caller's payload: it serializes or copies, and on
failure the payload is still there to try again. A zero-copy direct send
**consumes** it — the buffer is claimed from the shared pool, filled in place,
and handed over. That asymmetry decides where the transport decision happens.

**The route is chosen before the payload is committed, never after a send
fails.** A borrowed payload may fall back to the other path; a moved one may
only report failure honestly. Writing the branch the other way — try fast,
fall back on error — produces code that appears to have a fallback, passes
review, and silently drops messages the first time the fast path fails under
load.

The related trap is the shared pool running dry, where the correct answer is
**copy to ordinary memory and send the copy on the brokered path**, not wait
for a block to be freed: a blocking allocation converts a momentary pressure
event into a producer stall, and the burst that exhausted the pool is exactly
the moment the producer must not stop. Which path takes the copy matters as
much as the refusal to block — a fast path offering a priority or best-effort
class usually also has a size ceiling above which a message is fragmented and
silently discarded, so a large payload that missed the pool belongs on the
reliable path rather than on the same fast path with a copy in it.
[moved-payload-has-no-fallback](./techniques/moved-payload-has-no-fallback.md)
owns the branch, the ownership rule, and the exhaustion policy.

## Every guarantee is re-proved on the second path, or written down as lost

This is the discipline that separates a transport optimization from a
transport *decision*, and it is the one usually skipped. A suite written
before the bypass existed exercises the brokered path and keeps passing. It
proves nothing about the traffic that now goes the other way
([gate-sees-target](../../../_laws.md#gate-sees-target)) — the check runs over
a proxy for the system, and diverges from it exactly where the new path is.

So enumerate every guarantee the brokered path provides — queue depth and
eviction order, fairness across a consumer's inputs, delivery to observers,
ordering, backpressure, the staleness deadline, schema and version negotiation
— and for each either land a **paired test** asserting it on both routes, or
write down that it is **lost on the direct path**. Lost is an acceptable
outcome; lost-and-undiscovered is not, and the difference between them is a
sentence somebody wrote. Two findings recur: a recorder that was a privileged
tap on the broker becomes an ordinary subscriber that must copy every message
it observes, so recording stops being free; and a priority class on the direct
path outruns the ordinary messages describing it, so a receiver can hold a
payload whose schema has not arrived.
[path-divergence-audit](./techniques/path-divergence-audit.md) owns the
enumeration and the pairing.

## The supervisor stays off the data path — and off every blocking path

The bypass has a mirror obligation. If payloads no longer pass through the
supervisor then **the supervisor must never touch a payload at all**: it sees
lifecycle notifications, route decisions and health, and a payload copy in its
address space is a design error rather than an inefficiency. A supervisor with
one hand on the data is a supervisor whose event loop is still on the hot
path, which was the thing the bypass was bought to fix.

Two rules follow, both learned expensively. The supervisor's event loop
**never awaits a guaranteed network send**: publishing is offloaded to a
bounded drain channel serviced elsewhere, which drops with a warning when it
fills, because a bounded queue that blocks instead of dropping is an unbounded
queue with a deadlock in it. And the loop **never collects metrics inline**,
because a diagnostic that stalls the control plane makes the system worse
exactly when it is being observed. The deadlock these prevent does not look
like one in review: the loop awaits a delivery-guaranteed send to a peer; the
peer's acceptance requires an event only the loop can process; the loop is
inside the await. The cheap defence is to log any handler that occupies the
loop longer than a low ceiling of milliseconds, which finds the next one
before it becomes an incident.
[control-plane-off-the-data-path](./techniques/control-plane-off-the-data-path.md)
owns the offload, the bounds and the ceiling.

## Where this subject stops, and the neighbours start

Three neighbours sit close enough that a reader can pick the wrong document,
and in each case the rule for choosing is which question is being asked.

[stream-proxy-hop](../../resilience/stream-proxy-hop/stream-proxy-hop.md) owns
the relay you **add** to a long-lived stream — a box that terminates a
client's read, opens its own upstream, and thereafter owes heartbeats, status
normalization, the abort-versus-outage distinction and non-disclosure of the
origin. That is a subject about obligations a new hop acquires; this one is
the mirror image, where the mediator already exists and the question is
whether to leave it out. Adding a hop and removing one are not the same
problem — one inherits failure modes, the other inherits guarantees it must
re-provide or forfeit. "My stream goes through a proxy and stopped delivering"
is the neighbour; "may this message skip the middle process, and what do I
lose" is this one.

[ci-execution-trust](../../../engineering-process/continuous-integration/ci-execution-trust/ci-execution-trust.md)
draws a line with almost the same vocabulary and a different motive. Its
control-plane execution boundary separates what **decides** work from what
**performs** it in order to answer a hostile question: if the decider were
compromised, what could it make the performer do? Those two sides are in
different trust domains and the line exists to be defended. Here both planes
are inside one deployment, mutually trusted, and the line exists to be
*measured*. Pick by the reason you are drawing it: "what if this side is
hostile" is the neighbour's, "what does this side cost and what does it
promise" is this one's. Confusing them produces the characteristic error of
hardening a boundary that was never adversarial while never auditing the
guarantee that actually disappeared.

[subprocess-lifecycle](../../../llm-agent/runtime-and-io/subprocess-lifecycle/subprocess-lifecycle.md)
owns the peers themselves — spawn contract, admission and slots, termination,
reaping, orphan sweeps — and explicitly hands off what flows through the
pipes. This subject begins after both peers exist and are ready: who kills the
child and collects its exit is the neighbour; which route this edge settled on
and what it costs is this one.

The closest boundary is the sibling beside this subject. Edge-queue-policy
owns the queue at the receiving end of an edge — depth, eviction verdict, the
fairness with which a consumer serves its several inputs. This subject owns
which transport *delivers into* that queue, and therefore owes the audit that
the queue behaves identically whichever transport fed it: the policy of the
queue belongs to the sibling, the discovery that a transport bypasses it
belongs here.

## What the bypass owes the operator

- **The route every edge settled on, per run, with its reason** — below
  threshold, un-acknowledged probe, demoted by declared policy, or direct.
  Without it, the first hour of every performance investigation is spent
  establishing which path the traffic took.
- **Demotions counted by cause, not in one total.** A grace window that
  expires under load and a policy that pins an edge by declaration are
  different diagnoses with different fixes
  ([count-carries-predicate](../../../_laws.md#count-carries-predicate)).
- **Every throughput and latency number reported with the payload size that
  produced it.** Here a figure without its size is not a weak measurement, it
  is a reversible one: the same system is several times faster and
  substantially slower depending on the number the report omitted.

## The techniques

- [size-threshold-by-page-cost](./techniques/size-threshold-by-page-cost.md) —
  the threshold from the allocator's minimum shareable unit, the untouched
  small-message path, and the runtime override.
- [route-probe-then-freeze](./techniques/route-probe-then-freeze.md) — acked
  probes in a window measured from readiness, the run-long freeze, and the
  cost of a dropped acknowledgement.
- [policy-demotes-transport](./techniques/policy-demotes-transport.md) — the
  declarations that pin an edge, and why the deadline case is not negotiable.
- [moved-payload-has-no-fallback](./techniques/moved-payload-has-no-fallback.md)
  — borrowed versus consumed payloads, deciding before committing, and copying
  rather than blocking when the pool is dry.
- [path-divergence-audit](./techniques/path-divergence-audit.md) — enumerating
  the brokered path's guarantees, pairing the tests, recording what is lost.
- [control-plane-off-the-data-path](./techniques/control-plane-off-the-data-path.md)
  — notifications only, the bounded drain channel, no inline metrics, and the
  handler-duration ceiling.
