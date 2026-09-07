---
name: release-candidate-review
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/release
---

# Release candidate review and approval

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Merged work either sits unreleased for no reason anybody could state, or gets
tagged on a day of the week whether or not the suite is green and whether or not there
is anything worth shipping; and when the release does go wrong, the batch is large
enough that nobody can tell which part of it did the damage.

**Input.** The set of work merged since the last release with anything reverted or
superseded removed, the full check suite, what undoing a release costs in this system,
and the reason any earlier candidate was declined.

**Core action.** Decide whether what has accumulated is worth releasing yet, weighing a
larger batch against how hard it will be to attribute a failure inside it, prove the
candidate as a built artifact rather than as the changes that went into it, and take it
to a person with the cost of undoing it stated.

**Output.** A candidate with notes grouped so they can be read, a full suite run against
the artifact that will actually ship, a plain statement of what rolling it back would
cost, and a tag only after explicit approval.

## Activities

1. Gather what has merged since the last release, dropping what was reverted or
superseded *(observe)*
2. Decide whether this is worth releasing yet, against how hard a larger batch would be
to attribute if it breaks *(decide)*
3. Build the candidate once and run the full suite against that artifact, not against
the changes that went into it *(act)*
4. Establish what undoing this release would cost, including anything in it that cannot
be undone *(decide)*
5. Draft notes grouped by what a reader would care about *(act)*
6. Take the candidate to a person with that cost stated, and tag only on approval
*(deliver)*
7. Carry a decline reason forward instead of re-proposing the same candidate *(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Merged work reaches a release with notes a person can read, and nothing is tagged that
has not been through the full suite and been explicitly approved.**

- A proposed release states what is in it, grouped so it can be read rather than listed
  by commit, with reverted and superseded work excluded rather than listed
- The full check suite passed against the candidate as a built artifact, and the
  artifact that was tested is the one that ships rather than one rebuilt afterwards
- Nothing is tagged without a person approving it, and the approval is recorded against
  the candidate it approved

**The person approving a release knows what undoing it would cost before they approve
it.**

- The candidate names anything in it that cannot be reversed, such as a one-way data
  migration or an external state change, rather than leaving it to be discovered during
  a rollback
- Where the release can be rolled back cleanly, that is stated too, because it is what
  makes an ordinary release cheap to approve
- A candidate whose batch has grown large enough that a failure inside it could not be
  attributed is flagged as such rather than proposed as normal

**A rejected candidate results in a recorded reason and follow-up work, not a silent
drop.**

- The reason a candidate was declined is recorded and shapes the next proposal rather
  than being re-proposed unchanged
- A candidate awaiting approval has a visible age, so one nobody answered is
  distinguishable from one still being considered
- A period in which the work was reviewed and judged not worth releasing is recorded as
  such, so the next look starts from that judgement instead of repeating it
- When a person says an increment held back should already have gone out, that is
  recorded against the threshold that held it rather than against the candidate, because
  from inside this work a hold nobody minded and a hold that was wrong look identical

## Guidance

The gap between merged and released is a judgement, not a day of the week. Release when
there is something worth releasing and the checks are green, and remember the reason to
release often is that a large batch makes attribution impossible when it breaks. Test
the artifact you will ship, not the changes that went into it. Say what undoing this
would cost before asking anyone to approve it, because that is the question they are
actually being asked.

## Where this is worth adopting

- A team that merges continuously and releases whenever somebody remembers, where three
  weeks of work goes out at once and the next incident cannot be attributed to any part
  of it.
- A project on a fixed release day, where the tag goes out over a red suite roughly once
  a quarter because the calendar rather than the state of the code decided.
- A maintainer publishing to other people's dependency trees, for whom the notes are the
  only communication most users will ever read and a bare commit list is the same as no
  notes.
- A release that includes a data migration, where the approver is being asked a much
  bigger question than usual and nobody has told them so.
- A team where the last declined candidate was re-proposed unchanged the following week
  because the reason for the decline lived only in a conversation.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[github](examples/github.md) for `source_control`.

## Recommended trigger

`self_paced`. Watch the unreleased set: how much merged work is waiting, whether any of
it is time sensitive, and whether the checks are currently green. Binding this to a
fixed day substitutes a calendar for the judgement about when an increment deserves a
release, which is exactly the substitution this recipe exists to remove.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the operator considers enough to justify a release, because the threshold is a
  judgement about their users and their appetite for release overhead
- Who the release notes are written for, since notes for the team and notes for users
  are different documents and one of them is wasted effort
- How far this work may go on its own, from drafting notes through to tagging
- What rolling back actually means in this system, because a release that is a container
  swap and one that migrates data are the same act with completely different approval
  questions
- Where the candidate and its approval are recorded, so a release proposed and never
  answered is visible rather than forgotten

## Dependencies

- git, since a release is a tag in a real repository
- the repository's full check suite, installed and runnable, because the first outcome
  rests on running it against the candidate
