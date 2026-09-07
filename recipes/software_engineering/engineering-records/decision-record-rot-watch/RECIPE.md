---
name: decision-record-rot-watch
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/engineering-records
---

# Decision record rot watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A decision stays presented as current long after the thing it assumed stopped
being true, and the reader who arrives at the old record has no way to tell. There is a
quieter version that a date based review will never catch: the record still says
something true while its implication has stopped being true, because what moved was
underneath it rather than in it. And a record set is not automatically an architecture,
so a handful of records nobody has added to in a year is usually a practice that was
tried and dropped, which is a different finding and needs saying before anything is
audited.

**Input.** The recorded decisions with the assumption each rests on, when each was last
examined rather than merely last edited, activity in the code and dependencies each
governs, and the record of what has already been reaffirmed.

**Core action.** Watch the assumptions rather than the dates, concentrate on the records
most likely to be wrong instead of working through a rota, and never silently reaffirm:
if nothing has changed, say that nothing has changed.

**Output.** Decisions whose assumptions have been contradicted reopened rather than left
standing, a superseded decision that points at what replaced it from its own page, and a
record set too thin or too abandoned to audit reported as exactly that.

## Activities

1. Establish whether there is a record set here worth watching at all *(observe)*
2. Watch for a dependency replaced, a constraint lifted, a service retired *(observe)*
3. Concentrate on the records most likely to be wrong rather than a rota *(decide)*
4. Put each due decision to a person to reaffirm, re-evaluate or deprecate *(deliver)*
5. Make a replacement findable from the old record, not only from the new one *(act)*
6. Archive a deprecated decision once nothing active still references it *(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**No decision is still presented as current after the reasoning that supported it
stopped holding.**

- Each record carries the assumption it depended on, because a record that does not name
  one cannot be watched and can only be aged.
- A decision whose assumption has been contradicted is reopened rather than left
  standing, and the contradiction names what moved.
- A record whose text is still accurate while its implication has stopped being true is
  caught as well, since that failure is invisible to any check based on whether the
  record has changed.
- The status field alone is not read as evidence of currency, because in most record
  sets nearly everything says accepted and the field therefore separates nothing.

**Somebody who lands on the old record finds the one that replaced it without knowing to
look.**

- A superseded decision points at its replacement from its own page, in the part a
  reader sees first rather than in a field near the bottom.
- A supersession recorded on one side only is treated as a signal that the record was
  written by hand, and the other side is checked rather than assumed.
- The old record is kept rather than removed or rewritten, because it is still true that
  it was the decision, and only false that it still is.

**A due decision is judged by a person, and archiving never pulls a record out from
under one that still depends on it.**

- Every due decision is put to a person to reaffirm, re-evaluate or deprecate, and none
  is reaffirmed by nothing happening.
- A pass that examined records and found nothing that has moved records that it looked
  and what it covered, so a quiet corpus and an unexamined one are not confused.
- A decision still referenced by other active decisions is not archived, and the
  references are checked rather than inferred from age.
- A record set too small or too long untouched to be a working practice is reported as
  an abandoned practice, and the pass stops rather than auditing it as though it were an
  architecture.
- A record put forward as contradicted and then reaffirmed unchanged is written back
  against the signal that raised it, not only against the record, because a
  reaffirmation is the only evidence this work ever gets about which assumptions this
  operation actually treats as load bearing, and a signal reaffirmed away repeatedly is
  watching something incidental and should stop raising records on it.

## Guidance

A decision goes stale when the world it assumed changes, not on a calendar, so watch the
assumptions and treat a date as a backstop. Watch for the quieter failure too: the
record still says something true while its implication has stopped being true. Never
silently reaffirm; if nothing has changed, say that nothing has changed. Make a
replacement findable from the old record, because the reader arrives at the old one
first, and archive only when nothing active still points at it.

## Where this is worth adopting

- A record set several years old whose earliest entries describe a system that no longer
  exists, where a new joiner reads them as current because nothing on the page says
  otherwise.
- A set of four records, none touched in a year, where the useful finding is that the
  practice was tried and stopped rather than that four records are overdue for review.
- A decision that was right when the team was three people and is wrong now that it is
  fifteen, whose text has not changed and does not need to, because what moved was
  underneath it.
- The month a dependency or a hosted service is replaced, when several standing
  decisions rest on the thing that went away and nobody has connected the change to any
  of them.
- A reader who arrives at a superseded record through a search and has no way to reach
  the one that replaced it, because the link was only ever written on the new record and
  searches do not start there.

## Connector types

`knowledge_base`, `source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[obsidian](examples/obsidian.md) for `knowledge_base`, [github](examples/github.md) for
`source_control`.

## Recommended trigger

`self_paced`. Look when something a decision assumed appears to have moved: a dependency
replaced, a constraint lifted, a service retired. A fixed review cycle with a fixed
review period turns staleness into an age, which is the substitution this work exists to
reject, and it produces its worst output on the records that are oldest and most
obviously still correct.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which assumptions this operation considers load bearing rather than incidental,
  because every decision rests on dozens and only a few of them decide whether it is
  still right.
- How much activity around the area a decision governs counts as a signal here, since
  that is the cheapest available proxy for an assumption moving and its sensitivity is a
  taste judgment.
- Where the records live and whether they sit beside the code, because a record set
  inside the repository can be superseded in the same change that caused the
  supersession and one outside it cannot.
- Whether these records carry a date they were last examined, separate from the date
  they were last edited, since without it the whole watch degrades to the age based
  review it is meant to replace.

## Dependencies

None.
