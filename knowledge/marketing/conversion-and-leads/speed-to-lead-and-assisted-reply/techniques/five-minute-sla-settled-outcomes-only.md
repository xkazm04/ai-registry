---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: five-minute-sla-settled-outcomes-only
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold, label-convention-as-convention]
shared_with: []
use_when: [setting a first-response target, computing or displaying a within-target rate, choosing what an open lead counts as]
---

# Five-minute service level, measured on settled outcomes only

A first-response service level has two halves: the target, which is a convention the
business chooses, and the rate, which is a measurement and must behave like one. Most
implementations get the first half right by copying a number and the second half wrong
by counting hope.

## The target and its footing

The five-minute figure is practitioner convention with a vendor-sponsored study behind
it. The 2007 study that made it famous measured, over web-generated leads, the odds of
*reaching* a person and of *qualifying* them as response time grew; it reported a steep
decay across the first hour and popularised "five minutes". It did not measure revenue,
it was sponsored by a company selling response-time tooling, and it has not been
independently replicated at the five-minute granularity. What has been measured more
than once is the shape of the decay and how far businesses sit from it: a 2011 audit
of 2,241 firms put the median first response at 42 hours, with 37% answering within an
hour. So the honest statement is: *the first hour is where the leverage is - measured;
five minutes is a target inside it - convention.* State this footing wherever the
target appears
([label convention as convention](../../../_laws.md#label-convention-as-convention)).

Two targets can coexist. A live-desk drill measured in minutes and a work queue
measured in a quarter hour are different promises for different surfaces; each is
legitimate. The rule is that a surface names which one it reads, and every badge, sort
and band on that surface reads the same constant
([one target, one threshold](../../../_laws.md#one-target-one-threshold)). A
pre-breach warning state - a fixed share of the target remaining, roughly a third by
convention - belongs to the same constant, derived from it, never typed beside it.

## The three outcomes

Every lead is in exactly one of three states against the target:

- **Hit** - answered, and the measured response time is at or under the target.
- **Miss** - answered late, *or* still open and already past the target. An open
  breached lead is a settled miss: no future action can turn it into a hit.
- **At risk** - open and still inside the target. No verdict exists yet.

The rate is hits over (hits + misses). At-risk leads are excluded from the denominator
and shown as their own count. When nothing has settled, the rate is *null*, rendered as
"no verdict yet" - never 100%, never 0%
([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

## Why the third state is not optional

Count at-risk leads as hits and the instrument inverts: an inbox where six leads
arrived in the last two minutes and nobody has answered reads 100%, and the rate
*falls* as the team answers and time passes. This is not a rounding problem; it is the
opposite of the signal the surface exists to sell. Count them as misses and the rate
punishes a team for leads that arrived a minute ago, so people learn to ignore it.
Either two-state design produces a number nobody should act on; the three-state design
produces a rate that only moves when something settles, and a separate at-risk count
that is the actual "handle now" list.

## Procedure

1. Define the target as one exported constant per surface, with a comment saying which
   surface and that the number is convention.
2. Record arrival and first-response timestamps on the lead. Derive everything else
   from those two and the current clock; store no phase.
3. A settled lead - one with a first response - can never be overdue. Compute the phase
   for open leads only: breached if past the deadline, warning if inside the warning
   share, on track otherwise.
4. Roll up: measured response times for answered leads (median, and per-channel
   averages only for channels with at least one answered lead); hits and misses for the
   rate; at-risk as its own count; null rate when judged is zero.
5. Render at-risk as the queue, sorted breached-first, then by remaining time.

## Decision rules

- When a lead is open and inside the target, exclude it from the rate and show it as at
  risk, because a verdict that can still change is not a verdict.
- When a lead is open and past the target, count it as a miss now, because no later
  answer can make it a hit and delaying the miss flatters the rate.
- When no lead has settled, report no rate, because a rate over an empty denominator
  is a fabricated zero or a fabricated hundred.
- When two surfaces measure different queues, give each its own labelled target,
  because a single number across them is a contradiction on one of them.
- When the median and the rate disagree - a fast median with a poor rate - trust both:
  the median describes answered leads, the rate includes the ones never answered.

## When not to use this

Do not apply a minutes-scale target to a channel where the business cannot answer in
minutes - an e-mail inbox checked twice a day is a different promise, and the honest
move is a longer target labelled as such, not a permanently red badge. Do not use the
rate to compare reps on small samples; a handful of leads per rep is a description, not
a ranking, and the sample-size discipline of the measurement subjects applies before any
league table. Do not let the target leak into customer-facing copy - that is the
concern of the first-reply technique, and the reason it promises a channel rather than
a number of minutes.
