---
layer: technique
type: technique
subject: admission-queue
technique: depth-bounds-and-shed
status: forged
laws: [failure-not-empty-success, creation-names-reaper, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [deriving how deep the queue may grow, picking which arrivals to shed at the bound, bound keeps getting raised under pressure, urgent work is refused while bulk work waits in the queue]
---

# Depth bounds and shed

The queue's depth bound is the design decision that separates "a system
under load" from "a system in a failure mode it has not noticed yet." An
unbounded queue does not prevent overload; it **stores** it — as memory
growth, as wait times past the requester's patience, and as a backlog of
stale work that outlives the burst that created it. The bound, and the
policy for what happens at the bound, are chosen on purpose and written
down.

## Why unbounded is an outage with latency

When arrivals exceed service rate, queue depth grows without limit, and
three clocks start:

1. **The memory clock.** Every entry holds real resources — the payload,
   the bookkeeping, often a snapshot of context taken at enqueue. Depth
   × entry cost eventually meets the host's ceiling, and the queue that
   existed to protect capacity becomes the thing that exhausts it.
2. **The staleness clock.** Wait time grows with depth. Past some wait,
   the requester no longer wants the answer — the user navigated away,
   the triggering condition passed, a duplicate was submitted. The queue
   is now spending future capacity executing work nobody wants,
   *in preference to* fresh work people do want.
3. **The recovery clock.** After the burst ends, a deep queue must be
   drained before the system feels healthy again. An unbounded queue can
   accumulate hours of backlog from minutes of overload — the outage
   outlives its cause.

A bounded queue converts all three into one visible, immediate event: a
refusal, at arrival time, with a reason. That trade — a loud small failure
now instead of a silent large one later — is the entire case, and it is
decisive.

## Choosing the bound

The bound is derived, not felt. Two anchors:

- **Wait-time honesty.** Maximum tolerable wait ÷ expected service time ×
  service concurrency ≈ the depth beyond which a queued promise is already
  a lie. If entries beyond position N will wait longer than any requester
  tolerates, admitting position N+1 is refusal with extra steps.
- **Entry cost.** Depth × per-entry footprint must fit comfortably inside
  the host budget the queue is allowed, under the pessimistic case where
  every entry is maximal.

State the bound where operators can read it, and make it observable next
to live depth ([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
"depth 47" means nothing until it stands next to "bound 50" and says what
counts as an entry — waiting only, or waiting plus promoting).

Two spelling disciplines for the bound itself:

- **"Unlimited" is a value of the type, never a magic number.** The moment
  zero (or a negative) means "no bound", every reader re-spells the
  convention, they spell it differently, and the disagreement is invisible
  because each spelling is locally reasonable. Make unbounded an explicit
  variant, or floor the number at one — and note that a bound whose
  degenerate value switches it *off* has quietly made "off" the easiest
  configuration to ship.
- **A declared bound that no gate reads is not a bound.** Limits accumulate
  as *data* faster than as *enforcement* — declared in configuration,
  typed, displayed, and never consulted by the admission decision. The
  test is mechanical: from the declared number, can you walk to the line
  of code that refuses because of it? If not, the system is advertising a
  promise its gate has never heard of.

## The shed policies

At the bound, something is not served. Which something is a **policy
choice**, and the three canonical policies serve different workloads:

- **Refuse newest** (reject the arrival). The default. Cheapest to
  implement, preserves every promise already made, and puts the failure on
  the party best positioned to react — the active caller, who is present
  to receive the refusal. Right whenever entries age poorly at equal rates.
- **Evict oldest** (drop the head, admit the arrival). Right when
  freshness dominates: the oldest entry is the *most* stale, and the
  newest request supersedes it — telemetry samples, state-sync requests,
  progress updates. Wrong when entries are independent promises, because
  it breaks the oldest promise to make a newer one.
- **Reject by class** (shed low-priority arrivals first; keep admitting
  high). Right when the queue carries mixed criticality and the bound
  exists to protect the critical class. This is where depth policy meets
  [priority-and-fairness](./priority-and-fairness.md) — the shed policy is
  the priority policy, evaluated at the bound.

Two invariants regardless of policy: the shed party is **told** — an
evicted waiter notified with a reason is a design; an evicted waiter who
finds out by silence is a data-loss bug
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)) —
and every entry's possible exits, shed included, are enumerable at enqueue
([creation-names-reaper](../../../../_laws.md#creation-names-reaper): shed is one
of the named reapers, never an unnamed one).

## Reject-by-class is foreclosed by the order of the two checks

The three policies above read as a menu, and one of them is not freely
available. **Reject-by-class exists only if the gate evaluates class before it
evaluates depth**, and the natural implementation order is the opposite one —
for a good reason. The capacity test is a length comparison, available before
anything about the arrival has been examined; the class usually has to be
derived from the arrival's payload. So the cheap check runs first and returns
the refusal, and the class is computed afterwards, on the survivors, where it
decides *insertion position*. The queue now holds a priority function and a
bound, and its shed policy is refuse-newest — selected by nobody, and
indistinguishable in configuration from the policy the designer believed they
chose.

This is [gate-sees-target](../../../../_laws.md#gate-sees-target) standing at
the admission gate. The check that refuses reads depth and arrival order, never
the class it is thought to be protecting, so it agrees with the intended policy
everywhere except the one arrival the policy existed for: the urgent request
that shows up behind a full queue of bulk work. It diverges only at saturation,
which is the condition this subject is hardest to diagnose under and the only
condition in which the priority levels were ever going to matter.

The test is the mechanical one this technique already applies to the bound,
turned on the class: **from the declared priority, can you walk to the line
that refuses because of it?** A priority function reachable only from the
insertion sort is an *ordering* — it decides who leaves the queue first and
holds no vote on who enters. Ordering and admission are different powers, and
configuring the first does not confer the second.

Two consequences worth stating:

- **Reject-by-class needs a displacement rule, not merely a comparison.** At
  the bound, every position is already a promise; admitting the urgent arrival
  means naming which resident loses its place and telling that resident why
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  A design that only sorts has no such rule, which is the deeper reason
  implementations stop at ordering: the hard half is the eviction, not the
  comparison, and a sort makes the easy half look like the whole job.
- **Both features test clean and the policy still fails.** A depth bound is
  easy to cover and a priority ordering is easy to cover, and each suite passes
  in full without ever constructing a queue that is bounded *and* prioritized.
  The policy lives only in the intersection, so one case has to exist on
  purpose: a maximum-priority arrival at a queue full of minimum-priority
  residents, asserting which of the two is present when it settles. An
  implementation that has never run that case has not chosen a shed policy; it
  has inherited one.

## Backpressure: making producers participate

A refusal that only the immediate caller sees produces the retry hammer:
the caller resubmits on a tight loop, and the queue spends its cycles
refusing the same request it refused a moment ago. Backpressure is the
discipline of propagating "slow down" to where demand is *generated*:

- The refusal carries enough information to act on — a retry-after hint,
  the current depth, the reason — so a well-behaved producer can pace
  itself instead of probing.
- Producers that fan out (one trigger generating N requests) apply the
  signal at the fan-out point, not per request; refusing N times is not N
  independent facts, it is one fact about the fan-out's size.
- Automated producers get their pacing from the signal; human producers
  get it from the interface — a submit affordance that reflects queue
  state prevents the demand instead of refusing it.

Backpressure composes with retry discipline (whose backoff mathematics are
retry-backoff's ground): the queue's duty is emitting an actionable
signal; the producer's duty is honoring it.

## Bound the backlog you produce, not only the work you run

The queue this technique bounds is usually *upstream* of the executor. But
a system that generates work automatically has a second queue worth
bounding: the pile of **un-consumed output** downstream — results awaiting
a reviewer, proposals awaiting a decision, findings awaiting triage. A
concurrency cap limits how fast work runs; nothing in it limits how much
finished-but-unconsumed work accumulates behind a consumer slower than the
producer — and when the consumer is a human, the consumer does not scale.
The most valuable refusal such a system can make is at *production* time:
"there are already more results waiting than will ever be read — refusing
to make more." The mechanics are this technique's, applied one stage
later: the depth being checked is the downstream backlog, the shed policy
is refuse-to-produce, and the refusal names the count, the cap, and the
remedy (consume the backlog). Producer-side gates are rarer than executor
caps and consistently more valuable in autonomous systems, where
production outrunning consumption is the steady state, not the incident.

## The bound is not elastic

The recurring temptation: under pressure, raise the bound "temporarily."
This re-derives the unbounded queue one incident at a time — each raise is
locally reasonable, and the sum restores every failure mode the bound
existed to prevent. If refusals are chronic, the system is undersized or
the demand is unshaped; both are capacity problems, and hiding a capacity
problem inside a deeper queue converts it from a visible refusal rate into
an invisible wait-time regression. Fix the ratio, not the bound.
