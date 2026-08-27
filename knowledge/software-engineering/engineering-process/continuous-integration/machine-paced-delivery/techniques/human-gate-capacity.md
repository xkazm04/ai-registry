---
layer: technique
type: technique
subject: machine-paced-delivery
technique: human-gate-capacity
status: forged
stage: solo
laws: [gate-sees-target, absent-guard-is-loud, count-carries-predicate]
shared_with: []
use_when: [changes are merged faster than anyone could have read them, the reviewer is named as the bottleneck but never measured, one person both dispatches the agents and approves their merges, deciding whether to widen the autonomous path or send fewer changes]
---

# Human gate capacity

The merge gate is a server with a finite service rate, and it is the only server in the
delivery path that cannot be bought. Measure what arrives at it and how fast it clears, and
treat a *falling* time-to-verdict under rising arrival as the overload signal it is. Past the
rate at which a person can read a change, the gate has stopped gating — and nothing in the
system says so.

## The second constraint

This subject already names one bottleneck and models it carefully:
[verification-throughput-as-constraint](./verification-throughput-as-constraint.md) measures
wait against capacity, splits arrival by author class, and exhausts demand-side levers before
buying runners. All of it is about machines.

The machine is the first of two servers in the path. Everything that clears it arrives at a
person, because [proposal-not-push](./proposal-not-push.md) makes that unconditional: the
merge decision is human. So the delivery system sizes its first server against machine-paced
arrival and then routes the entire output into a second server whose rate was never written
down. `proposal-not-push` states the fact in one line — *at machine pace the reviewer is the
bottleneck* — and everything it does about that is per-item: one concern, small enough to read,
provenance marked, consistent shape. Those make each verdict cheaper. None of them says how
many verdicts there are.

The two servers differ in the property that actually governs a capacity decision:

| | machine verification | the human gate |
|---|---|---|
| capacity | purchasable, within the hour | fixed, within the window that matters |
| overload signal | queue depth grows | time-to-verdict **falls** |
| degraded mode | work waits | work **passes** |

The third row is why this needs its own technique. **An overloaded machine queue stalls; an
overloaded human gate accelerates.** A person who cannot properly review forty changes does not
review twenty and leave twenty pending — they approve forty, faster, at a shallower depth.
Overload on the machine side produces a complaint. Overload on the human side produces a
dashboard that looks like a record quarter.

## The signature

The sibling technique's tell is that people say the build feels slow while every measured run
is fast. This one's tell is the opposite shape and it is easy to mistake for a win:
**throughput is up, the backlog is empty, time-to-verdict is falling, and defects a reviewer
would have caught are turning up after merge.**

What the reviewer is observing at that rate is not the change. It is the shape of the proposal,
the provenance mark, and the green check beside it — a proxy that agrees with the change right
up until it doesn't, which is the case the gate existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The gate has degraded to unguarded
without a single error, a failed check, or a line in a log, which is precisely the condition
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) exists to forbid: either the
guard holds on its own or its absence is loud, and a human gate past capacity is silent in both
directions.

## What to measure

Four numbers, each reported with its predicate per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate):

| measure | definition | what it decides |
|---|---|---|
| **arrival** | verdicts requested per period, split by reserved-class vs routine | whether the gate is in its linear region |
| **dwell** | requested until decided, as a distribution | whether verdicts are rendered or merely cleared |
| **backlog age** | age of the oldest pending item | whether the gate is stalling instead |
| **post-merge repair** | merged changes needing a follow-up fix inside a window, by author class | whether the verdicts were real |

Dwell as a distribution, never a mean, for the same reason wait is: the interesting part is the
bottom of the range, and a mean hides it.

The last measure is the only one that scores the gate on its output rather than its motion, and
it is available for free — `proposal-not-push` already requires provenance to be marked
durably, which is exactly the split this measurement needs.

Read the four together, because two opposite failures share a queue and have opposite remedies:

- **Stall** — dwell high, backlog old. Decisions are not being made. The gate is a scheduling
  problem.
- **Rubber stamp** — dwell low, backlog near empty, post-merge repair rising. Decisions are
  being made and mean nothing. The gate is a capacity problem.

A system reporting the second one and reading it as health is the ordinary case.

## Reducing arrival, because capacity is fixed

The sibling exhausts demand-side levers *before* buying machine capacity. Here demand reduction
is not the preferred answer, it is the only one — there is no purchase that makes a person read
faster, and hiring changes the number on a horizon longer than the one the overload is
happening on. In order:

- **Send fewer changes.** The arrival rate at the gate is a decision the team is already making
  and usually not looking at. Capacity that produces changes nobody has the hours to review has
  not produced delivery; it has produced a queue with a rubber stamp on the end of it.
- **Make each verdict cheaper** — owned by `proposal-not-push`, and worth doing first because
  it is cheap. Know its ceiling: shape and scope work buys a constant factor, and a constant
  factor does not absorb an order-of-magnitude change in arrival. A team that has done all of
  it and is still over capacity has a demand problem, not a presentation problem.
- **Narrow what needs a verdict at all**, so the human sees *fewer items* rather than the same
  items faster. This is legitimate and it is bounded hard: the classes `proposal-not-push`
  reserves — gate configuration, test deletion, suppression directives, check-driven dependency
  changes, credentials and permissions — are not available at any arrival rate. The pressure to
  delegate them peaks exactly when the gate is overloaded, which is when delegating them is
  worst.
- **Accept a stated service level.** "Routine machine-authored changes are reviewed in two
  batches a day" is a decision, and decisions can be revisited. Silence is not a decision, and
  an unstated level is always discovered later as an incident.

Batching deserves its own note because it is the one lever that raises effective capacity
rather than lowering demand: homogeneous items of the same class and provenance are honestly
one judgment, and the boundary is homogeneity — the rule and its failure modes belong to
[review-queues](../../../../llm-agent/orchestration/hitl-approval/techniques/review-queues.md).

## The gate that reviews its own commission

At this subject's floor — one person and a fleet — the reviewer is also the person who
dispatched the work, chose the goal, and wants it to land. That gate is still worth keeping and
it still catches things. It is not an independent review, and the distinction matters the
moment anything downstream depends on it: where a control requires review by someone other than
the author, an agent's dispatcher is the author for that purpose, and a merge they approved
does not satisfy it.

Say which property you have. A one-person pipeline that records its merges as independently
reviewed has not gained independence; it has lost the ability to notice that it never had any.
The approval mechanics themselves — how the pause is presented and recorded — belong to
[hitl-approval](../../../../llm-agent/orchestration/hitl-approval/hitl-approval.md); what
belongs here is that the gate's rate and its independence are two separate claims, and a
delivery system at machine pace tends to lose both at once while reporting neither.

## Decision rules

- The merge gate is a server. Publish its arrival rate and its dwell distribution beside the
  pipeline's own, with windows and denominators.
- Falling time-to-verdict under rising arrival is overload, not efficiency.
- Distinguish stall (dwell high, backlog old) from rubber stamp (dwell low, backlog empty,
  post-merge repair rising); they have opposite remedies.
- Human gate capacity is fixed in the window that matters — reduce arrival rather than expecting
  the gate to absorb it.
- Per-item slimming is a constant factor; it cannot absorb an order-of-magnitude arrival change.
- Never widen the autonomous path across the classes `proposal-not-push` reserves, whatever the
  arrival rate.
- Publish no gate metric without a named response to it, including an accepted service level.
- A gate whose reviewer commissioned the work is a check, not an independent review; record it
  as what it is.
