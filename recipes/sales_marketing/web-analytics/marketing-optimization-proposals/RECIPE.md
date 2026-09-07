---
name: marketing-optimization-proposals
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/web-analytics
---

# Marketing optimization proposals

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Advice that would read the same against any account is not doing anything, a
list too long to evaluate is refused wholesale rather than judged, and a proposal that
never said what it expected to move can never be shown to have been wrong, so the same
bad idea returns every quarter wearing new words.

**Input.** The findings from the performance read, the record of which categories of
change have been accepted or refused before and why, and the accepted proposals whose
predicted effect is now old enough to grade.

**Core action.** Turn the reading into a small number of specific changes worth making,
each carrying the finding that argues for it, an honest estimate of what it is worth,
and the meter it will be judged on later.

**Output.** A short list a person can evaluate item by item, each entry carrying its
evidence, its priority, its expected effect and the window over which that expectation
becomes checkable, plus a graded verdict on the proposals accepted last time and nothing
at all in a genuinely quiet period.

## Activities

1. Read what the performance read actually found *(observe)*
2. Grade the accepted proposals whose window has now closed *(observe)*
3. Set aside the categories the adopter has refused and the ground out of scope
*(decide)*
4. Choose the few changes genuinely worth making *(decide)*
5. Attach the evidence, the expected effect and how it will be checked *(act)*
6. Present a list short enough to be judged item by item and record its predictions
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every proposal carries the finding that argues for it, an honest estimate of what it
is worth, and the meter it will be judged on.**

- Each proposal cites the specific finding that motivated it, and a proposal that would
  read identically against any other account is not written.
- Each proposal names the metric, the direction, the rough size and the window after
  which the claim becomes checkable. An expected effect with no way to observe it is not
  an estimate.
- A proposal resting on a last click figure says so, because that figure is
  systematically generous to whichever channel happened to take the click.
- The list is capped at a size the reviewer can work through item by item, and
  uncertainty is stated rather than rounded away.

**The proposer finds out whether it was right, and the next round is better for it.**

- Before new proposals are written, the accepted ones whose window has closed are
  compared against what they predicted and the verdict is written down.
- A refusal is recorded with its reason somewhere the next run reads, and the same
  category is not proposed again.
- A quiet period produces no proposals and a record that none were warranted, rather
  than filler written to justify the run.
- Nothing enters anybody's backlog without a person accepting it.

## Guidance

Ground every proposal in a finding from the read, because advice that would fit any
account is not doing work. Say what you expect to move, roughly by how much, and after
what window the claim becomes checkable, since an estimate nobody can grade is an
opinion with a number attached. Be suspicious of proposals argued from last click
figures, which flatter whichever channel took the click. Keep the list short enough to
judge item by item, and be willing to propose nothing.

## Where this is worth adopting

- A team whose backlog already holds forty ungraded marketing ideas, where another list
  of plausible suggestions makes the situation worse rather than better.
- An operator who has taken advice from three consultants and cannot tell which change
  was the one that worked, because none of them said in advance what it would move.
- An account where budget is reallocated each month on cost per acquisition, so the
  proposals that keep winning are the ones on terms the buyers were going to reach
  anyway.
- A seat that has proposed into the same refused category four times, because every
  refusal was spoken in a meeting and never written anywhere the next run could read it.
- A genuinely quiet quarter, where the correct output is nothing and the pressure to
  justify the recipe's existence is exactly what produces filler.

## Connector types

`advertising`, `analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Proposals are worth writing when the reading has moved enough to argue for
something new, or when an accepted proposal's window has closed and there is a verdict
to record. A fixed cadence guarantees proposals in periods that earned none, which is
exactly the filler the outcomes forbid.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter is trying to move, because a proposal is only credible against a goal
  they actually hold and improving performance is not one.
- Which changes the seat may make and which need approval, since spend changes are
  consequential and the boundary is the adopter's to draw.
- Which categories of change have already been refused and why, recorded somewhere the
  next run can read, because a refusal that lived only in a conversation gets proposed
  again.
- How granular the evidence source can report, since a proposal about one page or one
  term is only citable if the source reaches that level and otherwise the proposal has
  to be written at the level the evidence supports.
- How long a change takes to show up in this account, which sets the window every
  estimate is graded over and stops a proposal being declared a success on three days of
  data.

## Dependencies

None.
