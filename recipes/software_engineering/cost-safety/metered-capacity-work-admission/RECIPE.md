---
name: metered-capacity-work-admission
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/cost-safety
---

# Metered capacity work admission

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A subscription that renews on a window makes the unused remainder look free,
so somewhere there is always a loop willing to spend it on something. The expensive
failure is not overspending. It is that a budget check which passes reads as an
instruction to work, and a worker that must find something will find something, filling
the window with changes nobody asked for and a queue no reviewer can drain. Underneath
sits a reading problem that produces the opposite failure just as quietly: consumption
so far is not headroom, a measurement taken an hour ago is not a measurement of now, and
a window that has just rolled over reads as empty to anyone who never observed it.

**Input.** The latest trusted reading of consumption with the moment it was sampled and
the moment the window rolls over, the window's length, the ceiling this operation has
declared for itself, whatever queue of work already exists, and how much finished work
is already waiting on a person downstream.

**Core action.** Project consumption to the end of the window from the share of it that
had elapsed when the reading was taken, discount the reading for its own age, and decide
against both the declared ceiling and a second cap that has nothing to do with money,
which is how much finished work a person can still absorb. Then treat a passing gate as
permission to consider work rather than as a reason to find some.

**Output.** A decision carrying the terms that produced it, a running count of
consecutive refusals so a gate wedged shut is visible as a fault rather than as quiet
thrift, and either one bounded unit of work that already existed or an explicit nothing.

## Activities

1. Take the latest trusted reading with the moment it was sampled and the window's
rollover *(observe)*
2. Project consumption to the end of the window from the share elapsed at sampling,
discounted for the reading's age *(decide)*
3. Read how much finished work is already waiting on a person, independently of budget
*(observe)*
4. Decide against the declared ceiling and against the downstream cap *(decide)*
5. Take at most one unit from work that already exists, never work invented to fill the
window *(act)*
6. Record the decision with its terms and the run of refusals behind it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Capacity being available is never by itself the reason something was done.**

- A gate that opens is followed by work that already existed before it opened, or by
  nothing, and a run that opened the gate and found nothing eligible is recorded as a
  run that worked correctly rather than as a failure to find something
- One opening authorises one unit, so a window with room to spare ends with room to
  spare rather than with everything the queue held
- A gate that finds nothing eligible does not lower its own standard on the next pass to
  produce a candidate, because a standard that moves when the queue is empty is not a
  standard
- Work invented to fill remaining capacity is separable afterwards from work that was
  queued, since the two are indistinguishable in the change itself and only the record
  can tell them apart
- The gate governs runs nobody is watching; a person invoking the work directly is
  already deciding and is not refused by it, because a control built to stop a loop
  spending unattended becomes an obstruction the moment it is applied to somebody who is
  present

**The decision rests on where consumption is heading, not on where it has reached.**

- Consumption is projected to the end of the window before it is compared to anything,
  because the same fraction spent means opposite things at the two ends of a window
- A reading is discounted for the time since it was sampled, and one older than this
  operation is willing to act on stops the run rather than being used anyway
- A window observed to have rolled over since the reading was taken stops the run rather
  than being read as a window with nothing spent in it, since nobody measured the new
  one and an unobserved window is not an empty one
- Early in a window, where a projection from a small elapsed share is arithmetically
  unstable and will refuse almost anything, the floor that stabilises it is stated as a
  judgment about when a rate becomes meaningful at all rather than carried as a tuning
  constant, and a run refused by that floor is distinguishable in the record from one
  refused by the ceiling

**The gate closes on a full review queue even when the meter says there is room.**

- A cap on how much finished work is waiting on a person is applied independently of
  budget, because the scarce thing downstream is attention and it does not renew when
  the window does
- Consecutive refusals are counted and reported, so a gate held shut by an unsatisfiable
  threshold or an unreachable reading is visible rather than reading as a quiet period
- A ceiling that arrived with the tooling is recorded as a starting point and revised
  against what this operation actually consumes, since a threshold written for somebody
  else's account measures that account

## Guidance

Unused capacity is not free and it is not a mandate. A gate that passes is permission to
consider work, never a reason to invent it, and the run that opens the gate and finds
nothing is the run working correctly. Consumption so far is not headroom: project it to
the end of the window, and discount the reading for its own age. A window nobody
observed is not a window with nothing spent in it. Budget is never the only cap, because
the person downstream does not renew weekly.

## Where this is worth adopting

- A team on a subscription whose weekly allowance expires unused, who wired an agent to
  spend the remainder on maintenance and now receive a steady stream of changes nobody
  prioritised, reviewed by one person who has stopped reading them.
- An operation whose overnight loop read its usage as comfortably low at the start of
  the window, worked all night against a projection nobody made, and met the ceiling on
  the day the window closed.
- A solo maintainer whose scheduled worker has quietly declined to run for three weeks
  because a threshold copied from somebody else's account can never be satisfied here,
  and nothing anywhere reports the refusals.
- A repository where the meter says there is plenty and six machine-authored changes are
  already open, so the constraint that actually binds is the reviewer's afternoon rather
  than the budget.
- A setup whose usage reading arrives from a tool that samples on its own schedule,
  where the difference between acting on an hour-old number and declining to is the
  difference between a controlled spend and finding out afterwards.

## Connector types

`model_hosting`, `source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`time`. The work is a decision about whether to begin at all, and nothing external
announces that a window has room, so the moment to ask is one this operation chooses
rather than one that arrives. Waking on an event would tie the question to something
showing up, which is the coupling that turns available capacity into a reason to act.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The ceiling this operation is willing to project to, since a number that arrived with
  the tooling was measured against somebody else's account and is a starting point
  rather than a decision.
- How old a reading may be before it stops being usable here, because that tolerance is
  the whole difference between a controlled spend and a decision made against an hour
  that has already happened.
- How much finished work the people downstream can absorb, which is the cap that binds
  most often and the one no meter reports.
- Whether this gate governs unattended runs only, because a person invoking the work
  directly is already deciding and a gate that refuses them is an obstruction rather
  than a control.
- Which queue holds work that already exists, since a gate with nothing to choose from
  is precisely what turns a passing check into invented work.

## Dependencies

- a reading of consumption for the provider actually being spent, since a gate cannot be
  built on another provider's meter or on an estimate assembled from this work's own
  history
