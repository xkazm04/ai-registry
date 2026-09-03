---
layer: technique
type: technique
subject: production-work-prioritization
technique: fixed-deadline-scope-triage
status: forged
laws: [a-budget-shapes-the-output, law-and-check-share-one-source]
shared_with: []
use_when: [a delivery date is genuinely immovable and the plan does not fit it, authoring a cut list before a milestone rather than during it, an unattended planner will hit a checkpoint short of capacity]
---

# Fixed-deadline scope triage

When the date cannot move, scope is the only variable, and the only question worth asking
early is *which parts leave first*. This technique authors that answer at plan time —
ordered, justified, and attached to the plan as data — so that the decision under pressure
is a lookup rather than a debate.

The discipline comes from time-boxed development, where the deadline is not a target but a
physical property of the event: the work that exists when the clock stops is the work that
shipped. Teams that produce something coherent under that constraint are not faster. They
decided what to abandon before they needed to.

## Why the cut decided under pressure is the wrong cut

The naive plan assumes the team will see how time is going and cut accordingly. What
happens instead is reliable enough to plan around: under pressure, the cut lands on the
item that is *least far along*, not the item that is *least necessary*. Sunk effort
defends itself, visible work defends itself, and the thing nobody has started yet has no
advocate in the room — which is very often the last step of the path everything else
depends on.

There is a second, quieter distortion. Late cuts are made by people who by then can only
see the burn-down. In week one the same people can still see the shape of the product, and
"can we ship without this" is a question about the product. In the last week it is a
question about the schedule, and the answers differ.

So the cut list is authored while the shape is still visible, and executed later
mechanically. That inversion — decide early, apply late — is the whole technique.

## Tiering, and the tier that is usually missing

Sort every item into four tiers: what must exist, what should exist, what could exist, and
what explicitly will not be attempted. The fourth tier is the one that carries the weight
and the one teams skip. An unwritten exclusion is not an exclusion; it is an idea that
will be re-proposed every week by somebody who assumes nobody considered it, and it will
eventually be attempted at the worst possible moment.

The sanity check on the tiering is its own distribution. When most of the scope is in the
must tier, no triage has occurred — the tiers have been used to record enthusiasm rather
than to make a decision, and the plan will fail in exactly the way it would have without
them. A rough working shape is a bare majority must, a quarter should, and the remainder
split between could and explicitly-not; wherever the real proportions land, a must tier
that swallows the plan is the signal to re-run the exercise rather than to proceed.

## The decision rule for what may be cut

**Anything whose absence still leaves the path walkable may be cut. Anything the terminal
observation passes through may not.** That is the entire rule, and it is why this technique
and a declared slice belong together: without a declared path, "essential" is a matter of
opinion and the loudest opinion wins, which is the pressure-cut with extra steps.

An item proposed for cutting that *is* on the path is not a cut. It is a re-declaration of
what is being delivered, and it is a different, larger decision that goes to whoever owns
the milestone.

## Procedure

1. **Establish that the date is immovable and write that down.** If it can move, stop here
   — everything below is theatre, and the cost of the theatre is real.
2. **Author the cut list at plan time, ordered**, each entry naming what is lost and what
   remains walkable without it. Order matters more than membership: an unordered list
   reopens the argument at the moment it was supposed to close it.
3. **Attach the list to the plan as data the planner reads**, not as prose in a document
   nobody re-opens. A cut policy stated only in a kickoff deck and a scheduler that ranks
   work will drift apart, and the drift is invisible from both sides — the deck still says
   the right thing while the ranking quietly recommends the excluded work.
4. **Define the trigger as a checkpoint, not a feeling.** At each checkpoint, if the
   remaining must-tier work exceeds the remaining capacity, the top entry of the cut list
   is cut. No meeting is required for a decision that was already made.
5. **Record every cut with its date and its reason.** A cut is a scope fact and belongs in
   what the milestone reports as delivered; an absence that nothing recorded reads later
   as work that was never planned.
6. **Re-tier only at a checkpoint.** Re-tiering mid-week, under load, is precisely the
   pressure decision the technique exists to prevent, wearing the technique's own clothes.

## Decision rules

- **When the must tier grows after the plan is fixed, something leaves the must tier in
  the same edit.** Additive musts are how an immovable date becomes a movable one without
  anybody deciding that it should.
- **When capacity is short and the next cut is on the path, escalate rather than cut.**
  The planner has run out of legitimate moves and must say so; choosing a path step on its
  own is the failure it was built to avoid.
- **When an unattended planner reaches a checkpoint short of capacity, it cuts from the
  declared list and reports the cut.** It may never invent a cut that is not on the list,
  silently extend an estimate, or mark reduced work as complete against the original
  request — the delivered scope and the requested scope are two numbers and both get
  reported.
- **When a cut is proposed as "ship it, just worse", it is not a cut.** Lowering the bar on
  what remains changes a different variable than the one this technique moves, and it
  changes it invisibly. Cut whole items; hold the bar on the ones that survive.
- **When the exclusion tier is empty, the tiering has not happened yet.** Send it back.

## When not to use this

- **When the date is genuinely movable.** A team that cuts hard against a date that then
  slips has paid for discipline it did not need, and it will not believe the next date —
  which is a far more expensive loss than the slip.
- **When the deliverable is all-or-nothing.** A certification, a legal obligation, a
  contractual feature set: cutting leaves nothing shippable, so scope is not the variable
  and pretending it is wastes the planning window. There the movable variable is the date
  or the resourcing, and the honest move is to say so early.
- **On exploratory work whose scope cannot be enumerated in advance.** A cut list over
  unknowns is a guess promoted to a policy; time-box the exploration itself instead and
  cut the *question*, not a list of deliverables nobody can name yet.
- **As a substitute for estimating.** Triage decides what leaves when the plan does not
  fit. A plan that never fit by a factor of three is not a triage problem, and running the
  procedure over it produces an ordered list of everything.
