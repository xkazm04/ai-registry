---
name: embedded-software-design-specification
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/engineering-records
---

# Embedded software design specification against hardware interfaces

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Embedded software can be written and tested against an assumed device and look
finished, because in that state everything it controls is its own model of the hardware.
The bill arrives at integration, and what arrives is not a bug in a function but a
shape: an interrupt that can re-enter, a register write that takes longer than the loop
budgeted, a boundary drawn so that software now owns a deadline the hardware could have
met in a gate. By then the cheap corrections are gone, the board is fabricated and the
schedule assumed software was done, so the fix is paid in the only discipline that can
still move, usually out of the timing margin.

**Input.** The operational and timing requirements the system is actually bought for,
the hardware as currently proposed rather than as finally built, what the platform and
its scheduler guarantee as opposed to what they typically do, the interfaces that
already exist on both sides, and the design decisions previously committed together with
whatever has moved underneath them.

**Core action.** Decide where the hardware and software boundary sits and which side
owns each deadline, then commit the contracts that are only cheap to commit now, the
shape and direction of every exchange, who may block and for how long, the worst case
latency and what a missed deadline does, judging each commitment by what unwinding it
costs after fabrication rather than by what writing it costs today.

**Output.** A recorded design carrying the boundary with the reason it sits there,
interface contracts detailed enough that either side can be built and exercised against
a stand-in for the other, a timing budget stated as worst case with the remaining margin
named, a defined behaviour for every deadline that can be missed, and an explicit list
of the hardware assumptions implementation is entitled to rely on, so that one of them
changing is a design event rather than a defect discovered in test.

## Activities

1. Read the operational and timing requirements the system is actually bought for
*(observe)*
2. Establish what the hardware and the scheduler guarantee rather than what they
typically do *(observe)*
3. Place the hardware and software boundary by what moving it costs after fabrication
*(decide)*
4. Commit the interface contracts both sides will build and test against independently
*(decide)*
5. Budget deadlines as worst case, naming the margin and the behaviour on a miss
*(decide)*
6. Put the boundary, the contracts and the budget to the disciplines that will be held
to them *(act)*
7. Record the hardware assumptions implementation may rely on, so a change to one
reopens the design *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Where hardware ends and software begins was decided on cost of change, at the last
moment both disciplines could still act on the decision.**

- The boundary carries the reason it sits where it does, expressed as what unwinding it
  would cost on each side after fabrication, not as which team had capacity that
  quarter.
- A deadline the hardware could meet in a gate is not handed to software because the
  software schedule looked emptier, and where it is, the design records what that
  bought.
- A commitment made against hardware that is proposed rather than built is recorded as
  provisional with the observation that would confirm it, since a design frozen against
  a moving board is one that will be found wrong late.
- A first design on a platform this operation has not shipped on states the platform
  guarantees it could not verify as unverified, rather than importing typical figures
  from a datasheet as if they were commitments.

**Hardware and software can each be built and exercised against a stand-in for the
other, so integration confirms rather than discovers.**

- Each contract fixes the shape, the direction, the ownership and the timing of every
  exchange in enough detail that a stand-in can be written from it without asking a
  question.
- The contract states who may block, for how long, and what the caller observes when the
  other side is not ready, because that is precisely the part left implicit and then
  discovered during integration week.
- A contract changed after commitment is changed as a recorded change with the other
  side notified, never absorbed quietly on whichever side the change was cheaper.
- An interface inherited from a previous generation is re-stated rather than assumed,
  since the assumption that made it work on the old part is usually written nowhere.

**Every deadline carries the worst case path that has to fit inside it, the margin that
remains, and what happens when it does not.**

- Deadlines are stated with a worst case and a named margin, not with a typical figure,
  because typical figures pass in bench testing and fail on the occasion when everything
  coincides.
- Each missable deadline has a defined behaviour on miss, so an overrun is a specified
  state and not whatever the system happens to do next.
- Interrupt and concurrency ownership is committed, including which handlers may
  pre-empt which and what may be touched from both, since the failure this prevents is
  intermittent and will not reproduce on demand.
- A requirement that no proposed partitioning can meet is reported back as unmeetable,
  naming what would have to change, rather than accepted into a budget with no margin
  left and discovered by the first added log line.

## Guidance

Commit what is only cheap to commit now: the boundary, the interface shapes, and who
owns each deadline. Judge each by what unwinding it costs once the board is fabricated,
not by what writing it costs today. State timing as worst case with the margin named,
because typical figures pass every bench test and fail the day everything coincides. Say
who may block and what a missed deadline does. Write down the hardware assumptions
implementation may rely on, so one changing reopens the design instead of surfacing as a
defect.

## Where this is worth adopting

- A board still at layout, where moving a function into hardware costs a schematic
  revision this week and a respin in three months.
- A team bringing up a real-time platform they have not shipped on before, whose worst
  case scheduler behaviour is known to them only through the vendor's typical figures.
- A programme where hardware and software are built by separate groups against one
  schedule, and the first time either runs against the other is an integration week the
  plan holds no slack in.
- A control loop that meets its deadline comfortably on the bench and misses only when
  fault handling, logging and the communications stack land in the same period.
- A second generation product reusing the previous design's interfaces, where an
  assumption that held on the old part is recorded nowhere and the new part behaves
  differently.

## Connector types

`source_control`, `documentation`, `project_management`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. This design is worth doing at one moment, when the requirements are known and
the hardware can still change, and that moment is created by a programme event rather
than a clock: a requirement set landing, a hardware revision proposed, an assumption
discovered false. On a schedule the work produces reviews of a design nothing has moved,
and it misses the week a board revision quietly invalidated an assumption implementation
was already relying on.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which hardware assumptions this programme treats as settled and which are still
  proposals, because the provisional half of the design rests on that line and it is
  almost never written down anywhere.
- What this operation accepts as evidence of a worst case, a measurement, an analysis or
  a datasheet figure, since that is what decides whether a timing budget is a commitment
  or a hope.
- Which disciplines must accept the boundary and the contracts, and who can rule when
  hardware and software disagree about where a deadline should live.
- Where the design record lives relative to the code and the schematics, given that an
  assumption list kept apart from both is one nobody consults on the day a part is
  substituted.

## Dependencies

None.
