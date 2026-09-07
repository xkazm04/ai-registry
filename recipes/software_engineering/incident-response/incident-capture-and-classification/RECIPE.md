---
name: incident-capture-and-classification
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/incident-response
---

# Incident capture and classification

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** One event gets reported several times by several people and by whatever is
watching, so the record forks into copies of the same thing. Folding them together is
the obvious fix and it is the more expensive mistake: a second, different problem folded
into the first inherits its acknowledgement, its status and its resolution, and
disappears when the first is closed. Severity is then argued down once the pressure
passes, and the record stops matching what happened.

**Input.** An incoming report or automated signal, the incidents already open with what
they affect, and the severity language this team already uses.

**Core action.** Decide whether this is genuinely the same event as one already open or
only looks like it, and set severity from what is happening to real users or real work
rather than from who reported it or how they said it.

**Output.** One record per event carrying a severity anchored to impact, the severity it
was first given, when its next update is due, and a join that can be undone without
losing either side.

## Activities

1. Take the report with enough detail to be judged *(observe)*
2. Decide whether this is the same event as one already open, or only looks like it
*(decide)*
3. Set severity from impact on real users or real work *(decide)*
4. Open or join the record, with when its next update is due *(act)*
5. Tell whoever the severity says should know *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Two reports of one event become one record, and two events never become one.**

- A report that is only probably the same as an open incident is opened separately and
  offered as a possible join, because the cost of two records for one problem is a
  person noticing, and the cost of one record for two problems is the second one being
  closed without anyone seeing it.
- A joined report keeps its own identity inside the incident, so a join can be undone
  with both sides intact.
- A join is made by a person or is reversible by one, and never on similarity of wording
  alone.

**Severity says what is happening to users, and what it said at the start is still
readable at the end.**

- Severity is set from what is affected, how many, and what cannot be done, and never
  from who reported it, their seniority, or the tone of the report.
- An uncertain case is opened at the higher severity and lowered later, since over
  calling costs an hour of a few people's time and under calling costs the people the
  incident is happening to.
- The severity an incident was opened at is kept alongside its current one, and a change
  of severity is an entry in the record naming who changed it and why, not an edit to a
  field.
- What a resolved incident owes afterwards is decided by the highest severity it ever
  held, so lowering it late cannot remove an obligation.
- Severity corrections are read as a set rather than one incident at a time, because a
  class of impact corrected in the same direction every time means the anchor for that
  level is wrong rather than the callers being careless, and it is the anchor that is
  revised.

**Every open incident carries an expectation somebody can be held to, and closure is a
decision rather than a silence.**

- Every record carries when its next update is due, set by its severity, so being stale
  is a fact rather than an impression.
- Closure is confirmed by a person, and an incident that stopped being reported is not
  treated as resolved.
- The spread of severities across recent incidents is visible, because a set where most
  incidents are the highest severity is a scale that has stopped carrying information.

## Guidance

Duplicate reports of one event are normal, but a wrong join is the expensive error: the
second problem inherits the first's acknowledgement and vanishes at its closure. So
default to separate records and offer the join. Rate on impact, never on the reporter.
Open high and lower it in the open, keeping the first call in the record, and tie what
an incident owes afterwards to the worst it ever was rather than to what it ended as.

## Where this is worth adopting

- A team where the same outage is reported by a monitor, by two customers and by whoever
  noticed first, and the board ends up with four records that get resolved at different
  times.
- An operation whose severity scale has drifted until almost everything is opened at the
  top, so the label no longer changes who is woken and people have stopped reading it.
- The week after an incident, when somebody quietly lowers its severity and the review
  it would have required stops being required, which is the same thing as deciding not
  to learn from it.
- A support channel where the loudest customer gets the highest severity, and a quiet
  failure affecting a larger number of people sits below it.
- A handover, where the incoming responder needs to know for each open incident when it
  was last touched and when the next update was promised, and currently has to ask.

## Connector types

`monitoring`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[sentry](examples/sentry.md) for `monitoring`.

## Recommended trigger

`event`. A report or an automated signal is a real external event, and the record has to
be true at the moment somebody reads it, so this work wakes on arrival rather than
pacing itself. The join decision in particular is cheapest while the report is fresh and
most expensive once both records have been worked on separately.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What counts as an incident in this operation, because too wide and the log becomes a
  task list, too narrow and the real ones get handled off the record.
- The severity language the operator already uses and what each level is anchored to
  here, since a scale borrowed without its anchors is the fastest route to everything
  being the top level.
- How often an incident of each severity is expected to be updated, because that
  expectation is what makes staleness checkable rather than a matter of opinion.
- Who should hear about a serious one and how, because severity only matters if it
  changes who finds out.

## Dependencies

None.
