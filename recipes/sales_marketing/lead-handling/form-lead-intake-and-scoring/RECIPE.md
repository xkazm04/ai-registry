---
name: form-lead-intake-and-scoring
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/lead-handling
---

# Form lead intake and scoring

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A form submission that is recorded twice, scored against a generic rubric, or
not recorded at all costs a real opportunity, and none of those failures announce
themselves. The slow version is worse than the loud one: a rubric that looked right on
day one and was never told what became of anything it judged is producing confident
nonsense by month four, and it looks exactly like it did when it worked.

**Input.** Submissions arriving from the forms the adopter runs, the record of who is
already known, what became of the leads this work judged before, and the adopter's own
account of what makes a lead worth attention.

**Core action.** Work out who this is before anything routes, judge how promising they
are against how this business actually sells rather than a generic rubric, and record it
exactly once whether or not they have been seen before. Treat the rubric as perishable
and check it against what actually happened rather than trusting it because it was once
agreed.

**Output.** One record per person, carrying a defensible judgment of how promising they
are and the reasoning behind it, placed where the person who acts will actually see it,
with a returning enquirer recognised as a return rather than as a new arrival.

## Activities

1. Take in the submission and everything it says *(observe)*
2. Decide whether this is somebody already known, before anything routes *(decide)*
3. Read what became of comparable judgments this work made before *(observe)*
4. Judge how promising they are against how this business actually sells *(decide)*
5. Write the record exactly once, or update the one that already exists *(act)*
6. Carry the judgment, its reasoning and its basis to whoever acts next *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every form submission is recorded and judged exactly once, even when the same person
submits twice and even when two delivery paths both see it.**

- Identity is resolved before anything is routed, so one person is never assigned to two
  people who do not know about each other.
- A returning enquirer is recorded as a re-engagement against the existing record,
  carrying the count of touches, rather than as a fresh arrival.
- Replaying the same submission produces no second record and no second alert.
- A lead that cannot be written to the record store is held somewhere recoverable and
  raised, never lost.

**What makes a lead worth attention is said in words, and it is said where the person
who acts will see it.**

- Each record carries the reasoning behind its judgment, and separates what is fit from
  what is behaviour.
- The judgment is readable from the surface the person acting actually works in, not
  only from a field they would have to go and open.
- A first run declares itself a first run and its judgments provisional, rather than
  reporting a tier as though it had a history behind it.

**The scoring stays worth acting on, because what happened to earlier judgments is read
back into later ones.**

- Judgments that turned out wrong are visible as such, so a rubric that has stopped
  predicting can be seen rather than assumed.
- Behavioural signals lose weight as they age, so no record stays promising on the
  strength of something that happened months ago.
- What share of submissions reach the top tier is reviewable, because a tier most leads
  reach has stopped selecting anything.

## Guidance

Resolve identity before anything routes, because two copies of one person become two
salespeople working the same enquiry and neither knows. Score against how this business
actually sells, and treat the rubric as perishable: a model nobody feeds outcomes back
into is noise inside a few months, and behavioural signals should lose weight as they
age. Say what makes a lead worth attention, and put it where the person who acts will
see it. If a write is refused, hold the lead somewhere recoverable and raise it.

## Where this is worth adopting

- A business collecting enquiries through several forms at once, where the same person
  filling in two of them becomes two records and two people chasing, and nobody finds
  out until the prospect mentions it.
- A team whose scoring rules were agreed in a workshop a year ago and have never been
  revisited, where most inbound now lands in the top tier and the tier has quietly
  stopped meaning anything.
- A founder who reads every enquiry personally today and knows the volume that makes
  that impossible is a month away, who needs the judgment written down before it stops
  being theirs.
- An operation moving from a spreadsheet to a real record store, where the migration is
  the moment duplicates get created and the moment to decide what identity actually
  means for them.
- A business whose enquiries are mostly noise with a few serious ones in them, where the
  cost of missing one is high enough that the rubric has to be defensible to the person
  it sends away.

## Connector types

`forms`, `crm`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[tally](examples/tally.md) for `forms`, [formbricks](examples/formbricks.md) for
`forms`, [airtable](examples/airtable.md) for `crm`.

## Recommended trigger

`event`. A submission is a real external event and the work has no meaning before one
arrives. A polling interval here is compensating for an unreliable door, and that is a
separate reconciliation responsibility rather than this recipe's cadence: a recipe that
quietly polls to cover a lossy webhook hides the fact that the door is lossy.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which forms are in scope and what each one asks, because the questions decide what can
  be judged at all and a rubric cannot weigh a signal nobody collected.
- What makes a lead worth the adopter's attention, in their words rather than as a score
  threshold, since the threshold is downstream of the judgment and not a substitute for
  it.
- Where the record of record actually lives, since the store decides what a duplicate
  means, which fields can be matched on, and what happens when a write is refused.
- Whether the adopter can tell this work what became of a lead after it was judged,
  because without that the rubric can only be restated and never corrected, and a rubric
  that cannot be corrected has a shelf life.

## Dependencies

None.
