---
name: cross-project-progress-briefing
version: 0.2.0
status: seed
domain: general_professional
path: general_professional/digests
---

# Cross-project progress briefing

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Someone running several projects at once loses track of which ones moved and
which quietly stopped, and the briefing meant to fix that degrades into a list of
everything recent. Every line reads green, the project that has been still for three
weeks is the one line missing, and within a month the reader has learned to skip it.

**Input.** Observable activity per project from the sources the requester named, the
record of what the last briefing reported, and the standing goals each project is
supposed to serve.

**Core action.** Report the difference since the last briefing rather than the current
state, lead with the item that costs something, and keep what was observed separate from
what is being concluded and from what could not be read at all.

**Output.** One short message whose first line is the finding worth acting on, with each
still project named alongside how long it has been still, the sources that could not be
read named as unread, and a record of what was reported so the next briefing is a
difference again.

## Activities

1. Read each project's activity from its own sources, noting which could not be read
*(observe)*
2. Work out what changed since the last briefing, and how long each unmoved project has
been still *(decide)*
3. Separate what was observed from what is being concluded from what could not be seen
*(decide)*
4. Drop the movement that changes nothing the reader would do, and account for what was
dropped *(act)*
5. Put the finding that costs something first and its reasoning underneath *(act)*
6. Deliver one message, naming unread sources and the assumption any conclusion rests on
*(deliver)*
7. Record what was reported so the next briefing is a difference and the first one says
it is a baseline *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A project that has not moved is the briefing's finding rather than its omission.**

- Every project in scope appears with either what changed or how long it has been since
  its last real activity.
- A stall is reported as a duration since the last observed change, not as an absence
  from the list.
- The first briefing states that it is a baseline and reports no differences, rather
  than presenting current state as change.
- Nothing is reported as new that an earlier briefing already reported.

**A reader can tell what was seen from what was concluded from what could not be looked
at, without asking.**

- Each claim is identifiable as an observation, a conclusion, or a gap.
- A conclusion names the assumption it rests on and what would have to be observed to
  overturn it.
- A source that could not be read is named, and the projects it covers are marked as not
  assessed rather than reported as quiet.

**The reader can judge the filter rather than only the list, so a quiet briefing is
still worth opening.**

- The message states how many items were looked at and what class of routine activity
  was left out.
- A period with nothing worth acting on is delivered saying so, with the counts, rather
  than skipped or padded.
- A briefing with no uncomfortable finding says that plainly instead of promoting the
  least comfortable item it could find.
- Something the reader retrieves from what was cut is recorded against the class it was
  cut under, in the same record the next briefing reads back, and that class is carried
  from then on rather than cut again.

## Guidance

Lead with the thing that costs something. A project that has not moved across the last
three briefings is a stronger finding than three that shipped, and a briefing where
every line reads green stops being opened long before anyone says so. Keep what you saw
separate from what you concluded, and name the source you could not read rather than
letting its silence pass as calm. Report the difference since last time, never the
current state.

## Where this is worth adopting

- A solo operator carrying four or five efforts at once, where the one that has gone
  quiet is always the one they meant to check and the cost of noticing three weeks late
  is the whole project.
- A founder whose picture of their own company is assembled from whatever they happened
  to look at yesterday, so the loudest project reads as the healthiest and a slow one is
  invisible until a deadline arrives.
- A manager receiving status from people who report to them, where the reports are
  already filtered for comfort and the useful briefing is the one built from what the
  work itself shows rather than from what was said about it.
- A team that has been sending a recurring status mail for a year that nobody opens,
  because it reports current state every time and a reader who cannot find the change
  stops looking for it.
- A period of deliberate focus on one thing, when the value of the briefing is entirely
  the confirmation that nothing else broke while attention was elsewhere, and the counts
  are what make that confirmation trustworthy.

## Connector types

`messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[slack](examples/slack.md) for `messaging`.

## Recommended trigger

`self_paced`. Nothing about a difference is defined by a calendar boundary. A fixed hour
produces a briefing whether or not anything changed, which is how a recurring report
teaches its reader to skip it. Speak when there is a difference worth acting on or when
enough time has passed that the silence itself is the finding, and stay inside the hours
the requester is willing to be interrupted in.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which projects are in scope and where progress on each is actually observable, because
  a briefing over sources it cannot read degrades into restating what it was told, which
  is the failure mode of every status report ever written.
- What the requester counts as movement for each project, whether that is a commit, a
  shipped milestone, a conversation or a decision, because otherwise the briefing
  reports activity and calls it progress.
- How long a project has to be still before the stillness is worth reporting, because
  the answer differs between a project with a weekly rhythm and one that moves in
  bursts, and a threshold set too low turns every slow week into an alarm.
- When they are willing to be interrupted, because self-paced work with no boundary
  eventually chooses a bad moment and the briefing is judged on that moment rather than
  on its content.

## Dependencies

None.
