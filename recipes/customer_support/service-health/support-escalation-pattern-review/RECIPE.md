---
name: support-escalation-pattern-review
version: 0.1.0
status: seed
domain: customer_support
path: customer_support/service-health
---

# Support escalation pattern review

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A support function that only reports its escalations absorbs the same pain
forever. The cause behind fifty tickets gets described fifty times and owned by nobody,
because a description arrives with no denominator, no cost, and no answer to whose
problem it actually is.

**Input.** The escalation history far enough back to see a shape, the categories the
team tags with, the causes already filed as work and whether that work shipped, and what
the last account said.

**Core action.** Name the cause behind a recurring escalation rather than restating the
escalations, and decide which kind of cause it is, because a product defect, a broken
handoff, a document that no longer matches the product and a promise nobody set look
identical in a queue and go to entirely different owners. File the fixable ones with
enough weight that they can be ranked against work nobody escalated.

**Output.** A short comparative account of what the escalations keep saying, each
fixable cause filed as work carrying its size and its cost, and the causes filed earlier
checked to see whether the fix actually held.

## Activities

1. Read the escalation history far enough back to see a shape *(observe)*
2. Check what earlier passes filed, and whether that work shipped and held *(observe)*
3. Name the causes behind recurring escalations rather than restating the escalations
*(decide)*
4. Decide which kind each cause is, since each kind goes to a different owner *(decide)*
5. Weigh each cause by its share of contacts, its direction, and what the repeats cost
*(decide)*
6. File a fixable cause as work, or re-raise one whose earlier fix did not hold *(act)*
7. Give whoever is accountable a short comparative account, saying plainly when the
product is at fault *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A problem that keeps producing escalations gets fixed instead of escalated again.**

- Recurring causes are named and filed as work, not restated in each account
- A filed cause carries its share of contacts against a denominator, its direction, and
  what the repeat contacts are costing, so it can be ranked against work that did not
  come from support
- A cause already filed and still open is not filed again, and a cause whose fix shipped
  while the escalations continued is re-raised as a failed fix rather than left
  suppressed
- A pattern that is getting worse is escalated rather than waited on

**Each named cause is attributed to the kind of problem it actually is, so it reaches
somebody who can fix that kind.**

- Every named cause says whether it is a product defect, a process or handoff failure, a
  document that no longer matches the product, or an expectation nobody set
- A cause that belongs to support itself is named as readily as one that belongs
  elsewhere
- A pattern read entirely off category tags is reported as what it is, since tags are
  applied under time pressure and a pattern in them can be a pattern in the tagging

**The person accountable sees what changed, not a repeat of numbers they have already
read.**

- The account distinguishes what changed from what has always been true
- Repeat requesters and unusually long waits are called out by name rather than buried
  in an average
- A pass that found no new pattern says so, rather than promoting the largest category
  of an ordinary period
- It is short enough to be read at the end of a long day

## Guidance

Read your own escalation history for causes, not for volume, and remember the categories
you are reading are tags somebody applied under time pressure, so a pattern in them can
be a pattern in the tagging. Say which kind of cause it is, because a product defect, a
broken handoff and a stale document go to different people. File it with its size and
its cost so it can compete with work nobody escalated. Say plainly when the product is
at fault.

## Where this is worth adopting

- A support team whose escalation channel has become a log, where the same three causes
  are described every week and none has ever been converted into work somebody owns.
- A product manager who declines support requests because they arrive as anecdotes, and
  who would rank them if a cause came with the share of contacts it drives and what
  those contacts cost.
- A team that shipped a fix for a known cause last quarter and never went back, so the
  escalations continued, the cause stayed on the already-filed list, and a failed fix is
  still assumed to have worked.
- A company whose contact reasons have been tagged by four generations of agents against
  a taxonomy nobody has revisited, where the largest category is simply the easiest one
  to pick.
- A support lead going into a planning cycle who has to argue that one specific defect
  is the cheapest thing engineering could fix, in a room that has only ever seen the
  total ticket count.

## Connector types

`support`, `ticketing`, `knowledge_base`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Act when enough escalations have accumulated to see a shape, or when one
cause has recurred often enough to be worth naming. A fixed evening slot produces an
account on days with nothing to say, which is how a digest trains its reader to skip it.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where filed causes should go, since a backlog and a knowledge base serve different
  follow up, and a cause with no destination becomes another description
- Who reads this account and what decision they make with it, which sets its length and
  shape
- How far back the adopter considers relevant, because pattern detection over the wrong
  window invents trends
- What the denominator is here, because a share of contacts is a finding and a raw count
  is an anecdote, and the two are indistinguishable in an account

## Dependencies

None.
