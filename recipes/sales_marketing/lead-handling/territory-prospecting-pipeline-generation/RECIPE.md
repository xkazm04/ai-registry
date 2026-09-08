---
name: territory-prospecting-pipeline-generation
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/lead-handling
---

# Territory prospecting and self sourced pipeline generation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An assigned territory always yields a list, and a list always looks like work,
which is what makes this fail quietly. Effort is the disguise: fifty calls a week is
visibly busy, and if those fifty were chosen because they were the easiest to reach
rather than the likeliest to buy, coverage of the accounts that could actually close
stays shallow while the activity numbers stay healthy. The shortfall surfaces a quarter
later, when the pipeline that should have been built for it does not exist and there is
no longer time to build it. The second disguise is the account touched once and never
again: in every report it counts as prospected.

**Input.** The account universe the territory contains and what is already known or
recorded about each, the trigger events that make now the moment for a given account,
what past attempts in this territory actually returned by segment and by tactic, the
touches the cycle can realistically carry, and the inbound already arriving from
accounts inside the same universe.

**Core action.** Decide which accounts deserve the finite number of touches the cycle
actually has and in what order, then match the tactic and cadence to the segment rather
than running one motion across the whole list. Hold the ordering open to being wrong: a
segment that does not answer is information about the segment or the tactic, and the
honest response is usually to reallocate rather than to try harder.

**Output.** A territory plan that names the worked set, the order, and just as
explicitly the accounts deliberately left out and why, so the next revision is an
argument with a previous decision rather than a rebuild from nothing. Alongside it, a
pipeline where every live opportunity carries a stage, a next step with a date and a
named owner of that step, and a parked set recorded with what was tried and when it may
be worth reopening.

## Activities

1. Map the accounts the territory actually contains and what is already known about each
*(observe)*
2. Segment them by fit and by the trigger events that make now the moment *(decide)*
3. Allocate the cycle's touch budget and pick the tactic and cadence each segment
answers to *(decide)*
4. Work the accounts through first contact and qualification against that allocation
*(act)*
5. Carry each responding account to a named next step with a date and an owner *(act)*
6. Park the accounts that have absorbed their budget without answering, with what was
tried *(act)*
7. Rebalance the plan on what the territory actually answered and record what was left
out *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Which accounts got worked was a decision with a reason, and which did not is equally
on the record.**

- The plan names the excluded accounts and why they were excluded, since a plan that
  lists only the worked set cannot be reviewed and cannot be inherited.
- Priority on a first pass comes from fit and from observable trigger events and says
  so, rather than from a conversion model that has no history behind it yet. A confident
  ranking produced from nothing is the most expensive artefact this work can create.
- An account is judged against the touches it would need, not against its size alone, so
  the largest logo in the territory does not absorb a quarter of the budget by default.
- A segment that returns nothing after a full cadence changes the allocation rather than
  earning more of it, unless there is a reason to believe the tactic rather than the
  segment was wrong, and that reason is stated.

**Every account that responded is either moving, deliberately parked, or closed, and
none of them are simply quiet.**

- Every live opportunity has a next step with a date and a person who owns it, and an
  opportunity whose next step has passed is surfaced rather than left to age.
- An account that has absorbed its attempt budget without a response is parked with what
  was tried and when it is worth reopening, rather than escalated into more of the same
  or dropped without trace.
- An inbound enquiry arriving from an account already in the worked set is joined to
  that thread rather than started as a parallel one, so the prospect is not worked twice
  by two motions that do not know about each other.
- A parked account reopened by a trigger event starts from what was already learned,
  since re running discovery a prospect has already sat through is how a warm reopening
  is turned cold.

## Guidance

The touch budget is finite and it is the real constraint, so the ordering of accounts is
the whole decision and volume is no substitute for it. Prioritise on fit plus a reason
that now is the moment, because an account with no trigger absorbs a full cadence and
returns nothing a later attempt would not have returned more cheaply. Write down who you
are not working, and treat a full cadence with no answer as evidence rather than a
reason to send a sixth message.

## Where this is worth adopting

- A newly assigned territory with several thousand nameable accounts and no history,
  where the temptation is to start calling the first page of an alphabetical list and
  where that choice will not be visible as a choice for two quarters.
- A seller whose activity numbers are strong and whose pipeline is not, who needs to
  find out whether the problem is the list, the tactic or the message, and cannot while
  all three change at once.
- A territory where a handful of large accounts absorb most of the attention because
  they are the interesting conversations, while the segment that actually closes in
  under ninety days goes untouched.
- A handover between sellers, where everything the previous person learned about which
  accounts are dead and why is in their head and will be paid for again from scratch.
- A team where inbound and outbound are run by different motions, and a prospect who
  filled in a form last week is currently receiving a cold sequence from someone who
  does not know that.
- A quarter where a market event has just changed who is in the market, and the plan
  built before it is still being worked as though nothing happened.

## Connector types

`crm`, `research`, `email`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Nothing arrives to start this work: the accounts do not announce
themselves, and that absence of an event is exactly why territories go unworked. A fixed
weekly block does not fix it either, because it produces the same list until somebody
deliberately rewrites it. The honest prompts are a touch budget coming free and a
trigger event landing on an account already in the universe, and deciding which of those
is worth acting on is a judgement made by looking rather than a schedule.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What defines the territory and what the addressable universe inside it actually is,
  because coverage is measured against that denominator and a wrong denominator makes
  every coverage figure meaningless in a way that is not detectable from the figure.
- What a good fit account looks like for this business in terms the adopter would
  recognise, since fit is the input the ordering is built on and a generic firmographic
  proxy will rank the territory confidently and wrongly.
- Which trigger events genuinely mean now for this offering, as the same event carries
  very different weight across businesses and it is what separates a prioritised list
  from an alphabetical one.
- How many first touches this seat can really carry in a cycle, because the plan is an
  allocation of that number and a plan built on an aspirational figure fails as thin
  coverage everywhere rather than as an obvious shortfall.
- Where the inbound motion records its leads, so an account being worked outbound and
  the same account arriving inbound can be recognised as one conversation.

## Dependencies

None.
