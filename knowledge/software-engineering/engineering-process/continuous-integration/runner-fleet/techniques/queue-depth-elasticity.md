---
layer: technique
type: technique
subject: runner-fleet
technique: queue-depth-elasticity
status: forged
stage: multi-service
laws: [count-carries-predicate, creation-names-reaper]
shared_with: []
use_when: [deciding how many runners to run, builds wait at peak and machines idle at night, a scaling policy is thrashing]
---

# Queue depth elasticity

Fleet size is a control loop. The input is **how much work is waiting**; it is not how busy the
machines are. Getting that one choice right is most of the technique.

## Utilization is the wrong signal

A fully-utilized fleet with an empty queue is correctly sized. A fully-utilized fleet with an
hour of backlog is badly undersized. Utilization reports the same number for both, so a loop
driven by utilization cannot distinguish "working perfectly" from "failing badly" — and it also
punishes the correct state, because a well-sized elastic fleet *should* look busy.

Drive on **queue depth** — work waiting and how long it has been waiting. Depth answers the
question directly, degrades gracefully, and points at the right response: sustained depth means
add capacity, sustained zero depth with idle runners means remove it.

Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate), depth carries its
predicate: depth *for which pool*, over what window. A single aggregate number across pools with
different capabilities is meaningless — the queue that is deep is the one lacking a specific
capability, and the aggregate hides which.

## The loop is asymmetric on purpose

**Scale up fast.** Waiting work is a cost being paid continuously by whoever is waiting.
Respond on a short window, and be willing to over-provision briefly.

**Scale down slowly.** Three reasons compound: acquiring a runner has latency, so removing one
you need again in five minutes costs more than it saved; a new runner starts cold and pays for
its environment; and a symmetric loop oscillates, adding and removing capacity in a cycle that
costs more than either steady state. Use a longer window and a higher threshold coming down
than going up.

## Floor and ceiling, both mandatory

**A floor above zero** where latency matters. Scaling from zero means the first job of the
morning pays the full acquisition and cold-start cost, and that job belongs to a person who is
now watching a spinner. A small floor buys away the worst-perceived latency in the system.
Scaling to zero is correct for pools that are genuinely occasional and where nobody is waiting.

**A ceiling, always.** Elastic capacity with no upper bound is an unbounded bill attached to a
loop, and the loop responds to demand it does not evaluate. A runaway generator, a retry storm,
or a machine-paced author can produce demand no human intended. The ceiling is the backstop and
breaching it is an alert, not a silent clamp — a fleet pinned at its ceiling looks identical to
a correctly-sized fleet from the inside, and the queue is growing.

## Every runner names what removes it

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), a runner created by the
loop declares how it is destroyed, at creation:

- **Drain before terminate.** A runner marked for removal stops accepting new work and finishes
  what it has. Terminating a runner mid-job produces a failed build that is nobody's fault and
  looks exactly like a real failure, which is the worst kind of noise.
- **A maximum lifetime** independent of load, so runners cannot live indefinitely and drift.
- **An orphan reaper.** Runners get created and lost — a scaling event that fails partway, a
  process that dies holding a registration. Something enumerates what exists and removes what
  nothing claims. Without it, a fleet accumulates machines nobody knows about, which is the
  bill nobody can explain.
- **A termination deadline.** A runner that will not drain within a bound is terminated anyway,
  with the event recorded so a job hanging forever is visible rather than absorbed.

## Reduce demand before adding supply

The loop responds to demand; it does not evaluate whether the demand should exist. Before
raising a ceiling, check the cheaper levers — scoping work to the change, cancelling superseded
runs, ordering cheap checks first, deduplicating identical work. Those belong to
verification-throughput-as-constraint, and they are usually a larger win than capacity for less
ongoing cost.

## What to publish

Each with its window and pool, per the same law:

- **Depth and wait distribution** — the input, and the thing being managed.
- **Fleet size against floor and ceiling** — how much headroom remains before the backstop.
- **Time at ceiling** — the number that says the ceiling is now the constraint.
- **Cost per unit of work**, if capacity is paid for. Otherwise the loop optimizes latency
  against an invisible budget, and the budget wins abruptly at the end of a billing period.

## When NOT to be elastic

- **Steady, predictable load.** A fixed fleet is simpler, cheaper to reason about, and has no
  scaling defects. Elasticity is for variance, not for size.
- **Acquisition is slower than the queue is long.** If a runner takes ten minutes to acquire and
  the backlog clears in five, the loop adds capacity that arrives after it was needed and then
  removes it. Fixed capacity at the peak is better.
- **Before measuring.** An elasticity policy tuned against a queue nobody measured is tuned
  against a guess.

## Decision rules

- Drive on queue depth and wait, per pool, never on utilization.
- Scale up on a short window, down on a longer one with a higher threshold.
- Set a floor above zero where anyone is waiting; set a ceiling always, and alert on reaching
  it.
- Every runner names its reaper: drain before terminate, maximum lifetime, orphan sweep,
  termination deadline.
- Exhaust demand-side reductions before raising the ceiling.
- Publish depth, size against bounds, time at ceiling, and cost per unit of work.
- Use fixed capacity for steady load, and where acquisition is slower than the backlog clears.
