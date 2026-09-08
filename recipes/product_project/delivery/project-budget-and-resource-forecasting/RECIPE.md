---
name: project-budget-and-resource-forecasting
version: 0.1.0
status: seed
domain: product_project
path: product_project/delivery
---

# Project budget and resource forecasting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Estimates are collected from the people who will be asked to deliver them, so
each one is individually plausible and the sum is impossible. The failure is not that
the total is wrong, it is that the total is the number everyone trusts: it is precise,
it is comparable across projects that built it three different ways, and it is the wrong
question. The number that decides whether the plan survives is who is oversubscribed in
which month, and that one is never produced, because each function's own view shows its
work fitting and nothing in the organization holds the view where the same two people
appear in four projects at once.

**Input.** Scope and effort from the functions who will do the work, with how each
estimate was made and what it assumes, the named people and scarce skills each project
consumes and when, the actuals from projects already running and already finished, and
the other candidate projects competing for the same money and the same capacity.

**Core action.** Build a cost and staffing forecast that carries the uncertainty it
actually has rather than a flat contingency, then find where the same scarce money or
people are promised to more than one project and judge which of those contentions a
project can resequence around and which only leadership can resolve.

**Output.** A forecast per project and across the portfolio that is current enough to
plan against, each figure carrying when it was last confirmed and how it was produced,
contention stated as a named person or skill in a named month rather than as an annual
utilization percentage, and a refresh against actuals that reports where this
organization's estimating is biased instead of only restating the totals.

## Activities

1. Collect scope and effort from the functions who will do the work, with the assumption
behind each *(observe)*
2. Record how each estimate was produced and how far that method has been wrong before
*(decide)*
3. Build cost and staffing over time in named people and scarce skills, not headcount
totals *(act)*
4. Overlay the other projects competing for the same money and the same capacity
*(decide)*
5. Separate the contentions a project can absorb from the ones only leadership can
resolve *(decide)*
6. Present the forecast as a decision with its range, rather than as a total *(deliver)*
7. Refresh against actuals and report where the estimating itself is running biased
*(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A reader can tell how much to trust each number, because the forecast reports how it
was made as well as what it says.**

- Each estimate records the method behind it, whether that was a bottom up build, an
  analogy to a past project or a figure given quickly under pressure, since comparing
  three projects costed three ways as if the totals meant the same thing is the most
  common mistake this work exists to prevent.
- The range around a total is derived from how far this organization's own estimates
  have missed, not from a contingency percentage chosen once and never tested against a
  completed project.
- A range narrower than the historical estimating error is reported as unsupported
  rather than presented, because a confident number is more damaging than a wide one.
- A first forecast with no completed projects to calibrate against says it has no
  history, sets a deliberately wide range and states that the range will narrow with
  evidence, instead of borrowing an outside benchmark that then behaves like measured
  data.
- An estimate the requester revises downward is recorded as a revision with who made it,
  so a plan cut in the room is distinguishable later from one the functions actually
  agreed to.

**Where capacity is oversubscribed, the forecast says who, when, and what class of
decision it needs, rather than reporting a portfolio that balances on average.**

- Oversubscription is stated as a named person or scarce skill in a specific month,
  because a portfolio that balances across a year still breaks in every quarter of it
  and an annual utilization figure will never show that.
- A contention a project can absorb by resequencing is separated from one that requires
  a hire, a spend or a project to stop, and only the second class is put in front of
  leadership, so escalation keeps meaning something.
- A contention with no resolution is carried as unresolved and reported again, never
  closed by assuming overtime, by assuming a hire that has not been approved, or by
  moving a date the owning function has not agreed to.
- The forecast names which project would have to give way for each contention to
  resolve, since a contention presented without that choice attached is returned to the
  project manager to solve and reappears a month later.
- Capacity is counted against the time these people actually have for project work, not
  their full availability, because the support and maintenance load that always arrives
  is the reason a plan built to full capacity is late from the first week.

**Every figure is either recently confirmed or visibly stale, and finished projects make
the next forecast better.**

- Each figure carries the date it was last confirmed, and one older than the refresh
  interval is shown as stale rather than as fact, because a stale figure and a current
  one are indistinguishable in a spreadsheet and equally persuasive.
- A refresh reports the direction and size of the gap against actuals, so a function
  that consistently underestimates by a third is visible as a pattern rather than as a
  series of unrelated overruns.
- A completed project is closed out into the estimating history rather than removed,
  since the only calibration this forecast will ever have is what past projects actually
  cost.
- A project whose scope changed materially has its forecast marked as superseded rather
  than adjusted quietly, so the record of the estimate that was approved survives next
  to the one now being worked to.
- A period in which nothing changed enough to move a decision is reported as such with
  the figures unchanged, rather than being skipped, which is how a forecast stops being
  read.

## Guidance

The total is the number everybody trusts and the least useful one you will produce. Ask
instead which named person or scarce skill is promised twice in the same month, because
that is what the plan breaks on and no single function's own view can show it. Carry the
range the organization's own misses justify, not a contingency nobody has checked.
Separate contentions a project can resequence from those needing money or a project
stopped, since escalating both teaches leadership to ignore the class that mattered.

## Where this is worth adopting

- A portfolio of half a dozen projects where every functional lead says their own plan
  is achievable, and the same two specialists appear in four of them across the same
  quarter.
- A funding decision between three candidate projects whose budgets were built by three
  different people using three different methods, being compared as though the totals
  were the same kind of number.
- A team that has added the same contingency percentage to everything for years and
  still overruns, having never once compared that percentage against what the last ten
  projects actually cost.
- A project that landed inside its budget and four months late, because the money was
  tracked every month and the staffing plan was a spreadsheet nobody reopened after
  kickoff.
- An organization where oversubscription always surfaces during the phase it hits, when
  the only answers left are overtime and a date change, and the aim is to see it two
  quarters earlier when other answers still exist.
- A scope change midway through a phase, where the useful output is not a new total but
  a statement of which other project now has to give way.

## Connector types

`project_management`, `spreadsheet`, `finance`, `bi`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. A forecast is worth rebuilding when something has changed enough to move a
decision: a scope change, a slip, a new candidate project, actuals diverging from plan.
A monthly cycle produces a re-typed forecast in quiet months, which trains its readers
to skim, and arrives weeks late in the month a project doubled. Refresh when the inputs
have moved and say so when they have not, since a forecast that reports nothing changed
is still evidence that somebody looked.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which people and skills are genuinely scarce here, because a forecast that tracks
  every role equally hides the two or three constraints that decide every plan, and
  those are usually specific individuals rather than job titles.
- How much of a person's time this organization treats as available for project work,
  since planning against full availability guarantees a contention in month one and the
  realistic figure is knowledge only the adopter has.
- How past projects actually finished against their estimates, because the width of
  every range in this forecast comes from that record and there is no substitute for it.
- What leadership here is willing to decide on, given that the value of the escalation
  depends entirely on the split between contentions a project absorbs and contentions
  that need a decision above it.
- Where the committed budget lives and how it is structured, because a forecast that
  cannot be compared like for like against the approved figure will be reconciled by
  hand every time it is presented.

## Dependencies

None.
