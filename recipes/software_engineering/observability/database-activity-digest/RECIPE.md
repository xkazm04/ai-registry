---
name: database-activity-digest
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Database activity digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A team that only ever sees individual database events has no sense of
direction and cannot tell a bad period from an ordinary one until something breaks; a
team that gets every total instead reads the digest once and then never again.

**Input.** Counts and records across the monitored tables for the period, the same
counts for a previous period of comparable shape, the anomaly record covering both, and
the items this digest was already carrying.

**Core action.** Turn the period's activity into one account that shows direction rather
than a table of totals, keeping only the lines that would change what somebody does, and
being explicit about which comparisons are honest and which sources actually answered.

**Output.** One digest covering the monitored tables with movement against a comparable
previous period, published where it can be found again, with a real zero reported as
zero and a source that could not be read named rather than counted as zero.

## Activities

1. Gather the period's activity across the monitored tables and note which sources
answered *(observe)*
2. Compare against a previous period of the same shape, not merely the same length
*(decide)*
3. Decide which movements would change what somebody does, and drop the rest *(decide)*
4. Carry standing items forward with their age rather than restating them as new *(act)*
5. Publish the digest where it can be found again, naming any source that could not be
read *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The team gets one read on database activity across the monitored tables, with movement
against a period it is fair to compare with.**

- Each monitored table and each class of anomaly appears with its movement against the
  previous period, and the period compared against is named
- A comparison against an abnormal previous period, such as one containing a holiday or
  an incident, is labelled as such rather than presented as a trend
- A movement stated as a percentage also states the counts behind it, and a percentage
  on a base too small to mean anything is not stated at all

**The digest distinguishes nothing happening from nobody having looked.**

- A source that returned no rows is reported as zero, and a source that could not be
  read is reported as unread with the reason
- The digest is published even when a source is missing, rather than being skipped
  because it is incomplete
- A period with genuinely nothing worth reporting produces a digest saying so, so its
  absence is never how a reader learns something broke

**What the digest said is retrievable afterwards, and an item it raised has a visible
end.**

- Each digest is retained where a later reader can find it, so a claim about a past
  period can be checked rather than remembered
- An item carried from an earlier digest shows how long it has been carried, and one
  that has been resolved is shown as resolved rather than silently dropped
- Anything suggesting data loss is escalated at the time rather than appearing as a line
  in the next digest
- A reader asking about something the period covered but the digest left out is recorded
  against that digest, so what counts as movement worth a line is widened from those
  questions rather than settled once at adoption

## Guidance

A line that would not change what anyone does is not worth a line, and a digest of
everything measured is read once. Direction needs a previous period of the same shape: a
week with a holiday in it is not comparable to a full one, so say when it is not. A
percentage on a small base is noise, so show the counts. An empty source is a zero worth
reporting; a source that could not be read is not a zero at all.

## Where this is worth adopting

- A small team with no analytics layer over its production database, where the only
  current answer to whether last month was good is somebody's impression of it.
- An operator who receives individual alerts all week and still cannot say whether the
  direction of travel is up or down, because nothing ever aggregates them.
- A team whose existing digest reports twenty tables and gets skimmed in four seconds,
  where the fix is dropping fifteen of them rather than formatting the twenty better.
- A young product with small daily numbers, where every existing report is full of
  percentage swings on bases of three and nobody trusts any of them.
- A handover, a board update or an incident review, where somebody needs what the
  numbers actually were in a past period and the only record is a chat channel that has
  since scrolled away.

## Connector types

`database`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[supabase](examples/supabase.md) for `database`, [slack](examples/slack.md) for
`messaging`.

## Recommended trigger

`self_paced`. A digest is only meaningful over a settled period, but the period is a
delivery preference rather than a property of the work, and an adopter who wants a fixed
morning digest can bind a time trigger without the recipe assuming one. Look when the
monitored tables have moved enough to be worth summarising, and keep the comparison
period aligned with whatever cadence the adopter settles on.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which tables carry consequences and which are noise, since a digest over everything
  equally is the same as a digest over nothing
- Who reads this and what they are accountable for, because that decides which movements
  belong in it and which are somebody else's business
- What this operation's calendar does to its numbers, such as holidays, billing days or
  campaign weeks, because a comparison that ignores them reports the calendar as a trend
- How small a base is too small here to state a percentage, which depends on the volumes
  this operation actually runs at
- Where the digest lands and where it is retained, given the adopter may have no
  external channel at all and a channel is not an archive

## Dependencies

None.
