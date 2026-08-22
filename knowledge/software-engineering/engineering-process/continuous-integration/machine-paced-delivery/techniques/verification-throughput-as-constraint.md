---
layer: technique
type: technique
subject: machine-paced-delivery
technique: verification-throughput-as-constraint
status: forged
stage: solo
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [builds feel slow but each run is fast, deciding whether to add capacity, agents and people are competing for the same runners]
---

# Verification throughput as the constraint

Measure how long work waits before it starts, separately from how long it takes once started,
and treat the first as the capacity signal. At machine pace it is usually the larger number
and it is almost never the one on the dashboard.

## Why run duration stops being the question

At human pace, an author submits a change and stands in front of the result. Nothing else is
waiting, so queue time is zero and run duration is the whole latency. Every convention about
build speed comes from that regime.

At machine pace the arrival rate rises by an order of magnitude while capacity does not, and
the system moves into the regime every queue eventually reaches: latency is dominated by wait,
wait grows non-linearly as utilization approaches capacity, and the run duration that everyone
is optimizing becomes a decreasing share of the total. A pipeline whose runs take four minutes
and whose median wait is forty is a forty-four minute pipeline. The dashboard reports four.

The practical tell: people say the build "feels slow" while every measured run is fast, and
nobody can reconcile the two. That gap is the queue, and until it is measured separately the
argument cannot be settled.

## What to measure

Four numbers, and the discipline is that each is reported with its predicate per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate):

| measure | definition | what it decides |
|---|---|---|
| **wait** | submitted until started | whether to add capacity |
| **run** | started until finished | whether to optimize the work |
| **arrival rate** | submissions per unit time, by author class | whether the load is what you think |
| **utilization** | capacity occupied over the window | how close to the non-linear region you are |

Report wait as a distribution, not a mean. Queue delay is heavy-tailed by nature and the mean
is the statistic least able to show it — a median of two minutes with a ninety-fifth
percentile of thirty is a system that is fine most of the time and unusable exactly when it is
busy, which is exactly when it matters.

Separate arrival rate **by author class**: human-authored, agent-authored, scheduled. Without
that split, a capacity decision is being made against an aggregate whose composition is
changing underneath it. Most of the surprise in this area comes from that composition shift
rather than from any single number.

## The prioritization rule

When capacity is short, **human-authored work outranks machine-authored work.** Always, and
not by a small margin.

The reasoning is not about the relative worth of the change. It is about what a wait costs on
each side. A person waiting is blocked — context held in a head that will lose it, other work
not started, a session that ends. An agent waiting costs compute and nothing else; it holds no
context it cannot be given again, and it does not get frustrated and go do something else. The
asymmetry is large and it points one way.

Two corollaries follow:

- **Scheduled and backstop work runs at the lowest priority**, and is preemptible. A nightly
  unscoped run that displaces a person's pull request has inverted the ordering.
- **A queue that never drains is a capacity problem, not a prioritization problem.**
  Prioritization reorders a queue; it does not shorten one. If machine-authored work is
  permanently starved, the honest answers are more capacity or less machine-authored work —
  never a quieter dashboard.

## Reducing demand before buying capacity

Capacity is the expensive answer and often the second-best one. Before adding it:

- **Scope the work to the change** (see change-scoped-work-selection). This is usually the
  largest single reduction available and it is free of ongoing cost.
- **Cancel superseded runs.** When a change is superseded before its verification finishes,
  the in-flight run is spending capacity on a question nobody will read the answer to.
  Cancel-on-supersede is a one-line policy with a large effect at machine pace, where
  supersession is common.
- **Move the cheap checks earlier and fail fast.** A plan whose slowest lane starts first and
  whose cheapest lane would have failed in eight seconds is spending its whole budget to learn
  something it could have learned immediately.
- **Deduplicate identical work.** At machine pace the same verification of the same tree gets
  requested repeatedly; a result keyed by the tree's identity is reusable, and the keying rule
  is the whole difficulty — key it on everything the result depends on, or the reuse is a bug
  with a performance graph attached.

## Do not measure what you will not act on

A wait metric with no capacity lever attached is a number that makes people feel bad. Before
publishing it, know what the response is: more capacity, less scope, tighter deduplication, or
an accepted service level. An accepted level is a legitimate answer — "agent-authored work may
wait up to an hour at peak" is a decision, and decisions can be reviewed. Silence is not.

## Instrument honesty

A throughput measurement that cannot distinguish "no work arrived" from "the collector was
down" will report a quiet period as a healthy one, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). Report the
observation window and the sample count beside every figure, and render an absent measurement
as absent rather than as zero.

## Decision rules

- Measure wait and run separately; publish both; never report one as the other.
- Report wait as a distribution with its window and sample count, not as a mean.
- Split arrival rate by author class before making any capacity decision.
- Human-authored work outranks machine-authored work; scheduled work runs last and preempts
  nothing.
- Exhaust scoping, cancel-on-supersede, fail-fast ordering and deduplication before buying
  capacity.
- Publish no wait metric without a named response to it, including "this level is accepted".
- An absent measurement renders as absent, never as zero.
