---
name: database-schema-picture-refresh
version: 0.1.0
status: seed
domain: data_ai
path: data_ai/data-access
---

# Database schema picture refresh

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Anything answering questions about a database works from a cached picture of
its structure, and the caching is usually done once and never revisited. When the real
database moves and the picture does not, the answers stay confident and become wrong,
which is worse than failing. The hardest case leaves the structure untouched: a column
that kept its name and changed its meaning passes every comparison there is.

**Input.** The real structure of the database as this credential is permitted to see it,
the picture currently held, and when that picture was last confirmed.

**Core action.** Decide whether a fresh read is trustworthy enough to replace what is
held, since a bad read that overwrites a good picture does more damage than a stale one,
and decide what a difference actually is, because a rename is not a drop followed by an
addition.

**Output.** A picture of the schema that either matches the database or is openly known
to be the last good one, dated with when it was last confirmed and against which
database.

## Activities

1. Read the real structure of the database as this credential can see it *(observe)*
2. Compare it against the picture currently held *(decide)*
3. Read a rename as a rename rather than as a drop and an addition *(decide)*
4. Decide whether the read is trustworthy enough to replace what is held *(decide)*
5. Replace the picture, or keep the last good one when the read failed *(act)*
6. Date the picture with what was confirmed, when, and against which database *(act)*
7. Say what moved, and say plainly when the picture could not be refreshed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The held picture of the schema never lies about what the real database looks like.**

- New tables, altered columns and dropped entities are detected and reflected
- A renamed entity is recorded as a rename with its previous name kept, so a query
  written against the old name fails with an explanation rather than as a missing table
- A failed read leaves the last known good picture in place rather than corrupting it,
  and is disclosed rather than left silent
- A structural change that anyone answering questions depends on is announced, not only
  stored

**A consumer of the picture can tell how old it is and what it is a claim about, instead
of assuming it is current.**

- The picture carries when it was last confirmed, not only when it was last changed
- A pass that found no change records that it looked and found none, because that is
  what dates the picture
- The picture names which database it was read from, since a read against a replica or a
  staging copy is not a claim about the one the answers come from

**A clean report is not taken as a promise that the data still means what it did.**

- A column that kept its name while its meaning moved is out of reach of this work, and
  a clean report says so rather than implying otherwise
- A part of the database this credential is not permitted to see is reported as unseen
  rather than as absent

## Guidance

Protect the picture before improving it: a failed read that overwrites a good one does
more damage than a stale one, so keep the last good version and make the failure
visible. Read a rename as a rename, because recording it as a drop and an addition
destroys every query that used the old name. Date every picture, including the passes
that found nothing, and say which database it came from. A clean structural report is
not a claim that the data still means what it did.

## Where this is worth adopting

- A team that stood up a question answering assistant six months ago, whose schema was
  read once at setup and never again, and whose answers have been quietly degrading
  since the first migration.
- A product shipping migrations weekly, where a column rename lands on a Tuesday and
  everything downstream reports a missing table until somebody notices on Thursday.
- An analytics stack pointed at a read replica, where a schema confirmed on the replica
  is treated as a statement about production and the two have diverged before.
- A data team inheriting a warehouse whose documentation was written at handover, where
  nobody can currently say which of two hundred tables are still written to.
- An engineer at three in the morning trying to tell whether an assistant's wrong answer
  came from a bad question or from a schema that moved underneath it, with nothing on
  the picture saying when it was last confirmed.

## Connector types

`database`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[postgres](examples/postgres.md) for `database`.

## Recommended trigger

`self_paced`. What is watched is the picture going stale: time since the last good read,
and any sign the structure moved under an answer. A nightly cron is one realisation of
that, and it refreshes on quiet nights while still letting a picture be wrong all day
after a morning migration.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which database and which schema this picture covers, since one picture across several
  is a different job
- Which environment this picture is a claim about, because reading a replica or a
  staging copy is cheaper and is not the same claim as reading the database the answers
  actually come from
- Who needs to hear that the structure moved, because a dropped column breaks whoever
  was relying on it and not everybody
- How often the structure realistically changes here, which is what makes a refresh
  worth doing at all
- Whether this adopter has anywhere that records what a column means, since that is the
  only place the change this work cannot see would be caught

## Dependencies

None.
