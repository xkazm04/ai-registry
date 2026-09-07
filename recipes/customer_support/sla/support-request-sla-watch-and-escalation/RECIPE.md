---
name: support-request-sla-watch-and-escalation
version: 0.1.0
status: seed
domain: customer_support
path: customer_support/sla
---

# Support request SLA watch and escalation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Somebody who asked for help is waiting and nobody knows it. A breach found
afterwards is only a report, while the same fact an hour earlier would have been a save.
Worse, the attainment number can stay green throughout, because the cheapest way to stop
a clock is to move a request into a waiting state while the person carries on waiting.

**Input.** The open request queue with what was promised on each and under which clock,
how long each has actually waited including the time its clock was stopped, and the
history of who has been escalated for what.

**Core action.** Judge which requests are entering their risk window before they breach,
measured on the clock the promise was made in rather than on wall time, and decide which
genuinely need a person, since escalating everything is as bad as escalating nothing.

**Output.** Nobody who asked for help is waiting without either an answer or a human
knowing they are waiting, every escalation carries enough context that nobody rebuilds
the case, and the attainment figure means the same thing as the customer's experience of
it.

## Activities

1. Watch the oldest unanswered request and any commitment coming due *(observe)*
2. Measure each wait on the clock the promise was made in, including stopped time
*(observe)*
3. Judge which requests are entering their risk window before they breach it *(decide)*
4. Decide what genuinely needs a person, since escalating everything is as bad as
escalating nothing *(decide)*
5. Enrich the case with repeat requester and agent load context so a pattern is visible
*(act)*
6. Escalate with enough context to decide, and hand over one account when many break at
once *(act)*
7. Log every escalation and every near miss so later pattern work has something real to
read *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Nobody who asked for help is waiting without either an answer or a human knowing they
are waiting.**

- The oldest unanswered request is always known, and the seat can say why it is still
  open
- A request entering its risk window is warned about before it breaches, not only after
- A request escalated once is not escalated again for the same reason
- A quiet pass is reported as a quiet pass, so silence from this work is distinguishable
  from the work having stopped

**The attainment figure and the customer's experience of waiting say the same thing.**

- Elapsed time is measured on the clock the promise was made in, so a request arriving
  on a Friday evening is not counted as breached by Monday when the promise was in
  working hours
- Time a request spent with its clock stopped is reported beside the attainment figure,
  so a queue that is green because clocks were stopped is visibly green for that reason
- A request that has waited on the customer for longer than the promise itself is
  surfaced rather than left parked

**The cases that need a person reach one directly, the rest do not, and every escalation
leaves a record somebody can later read for patterns.**

- What was promised to a requester is tracked against what actually happened
- When many requests break at once, one account of the situation is handed over rather
  than a stream of alerts
- The share of escalations a person actually acted on is carried forward, so the bar is
  tuned from what the team did rather than from how the queue feels
- An escalation notes when the same requester or the same issue has recurred, and every
  escalation is written where later pattern work can read it

## Guidance

Hold the promise made to whoever asked, and measure it on the clock it was made in: a
working hours promise judged against calendar time breaches every Friday evening by
itself. Watch the waiting states too, because stopping a clock is the cheapest way to
look compliant while somebody waits. Warn inside the risk window rather than after it.
Escalating everything is as bad as escalating nothing, so tune the bar on what people
actually acted on.

## Where this is worth adopting

- A team promising four working hours whose dashboard reports calendar time, so every
  weekend arrival is a breach on the report and nobody trusts the report any more.
- A queue where attainment has been green for two quarters while complaints rose,
  because the fastest way to hold a target is to move a request to waiting on customer
  and leave it there.
- A support rota with one person reachable at night, who needs the two things that
  genuinely cannot wait until morning and needs everything else to stay quiet.
- An account team that learns a customer was unhappy during the renewal conversation,
  because the request that soured it breached into a channel nobody had subscribed to.
- The first hour of an outage, when fifty requests breach at once and a per-request
  alert stream buries the one message that would have explained why.

## Connector types

`support`, `messaging`, `email`, `knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[slack](examples/slack.md) for `messaging`, [notion](examples/notion.md) for
`knowledge_base`.

## Recommended trigger

`self_paced`. What is watched is a clock condition the seat can hold itself: the oldest
unanswered request, and any commitment about to come due. Act sooner when something is
time sensitive and later when the queue is quiet, rather than polling every two minutes
through the night. The request arriving is an event; the waiting is not.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter has actually promised requesters, since urgency is meaningless
  without a commitment to measure it against
- Which clock each promise was made in, because a working hours promise and a calendar
  promise produce different breaches from the same queue and only one of them is real
- Which states legitimately stop that clock here, since this is both the honest way to
  exclude a wait the team cannot control and the easiest way to make a bad quarter look
  green
- Which situations require a person and which the seat may answer alone, which is a
  trust boundary only the adopter can set
- How the adopter wants to be reached when something needs them, and what is important
  enough to interrupt for
- Which requester tiers are in scope, because silencing a tier is a deliberate business
  choice rather than a filter

## Dependencies

- Response commitments defined in the support platform, since a wait has nothing to be
  measured against otherwise
