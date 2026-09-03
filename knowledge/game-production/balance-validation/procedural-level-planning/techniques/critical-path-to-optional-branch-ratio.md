---
layer: technique
type: technique
subject: procedural-level-planning
technique: critical-path-to-optional-branch-ratio
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a generated space reads as a corridor or as a maze and nobody can say which knob did it, declaring the intended shape of a space before generating it, grading a generated layout against the brief it was generated from]
---

# Critical path to optional branch ratio

Every space that has an objective has a **critical path**: the ordered set of rooms the
player must enter to reach it. Everything else is optional space. The ratio between the
two, and the depth of the branches that make it up, is the single number that describes
what kind of space this is — and a generator that is not given it will produce a corridor
or a maze depending on where its other parameters happened to land.

The naive reading is that this is taste, and therefore not specifiable. The failure that
follows is a specific and expensive one: the space plays badly, playtesters report
"boring" or "confusing", nobody attributes either word to a layout property, and the team
tunes encounters for a month to fix a shape problem. A corridor and a maze are both
defects and neither has a name until this ratio is declared. Declaring it converts an
unnameable complaint into a number a designer can move.

## The two numbers, and the basis each carries

**The critical path is computed over the traversal graph with gating applied, from the
start room to the objective room.** Not the geometric shortest route, and not the raw
adjacency: a route through a locked connection is not a route the player can take, so the
path is computed on the graph as the player experiences it. State this basis with the
number, per
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis) —
a critical path of five rooms computed on raw adjacency and one of eleven computed with
gates are both correct and describe different spaces, and a team that does not record
which it used will compare them.

**The ratio is optional rooms per critical room.** A space with eight critical rooms and
twelve optional ones sits at one and a half. The second number is **branch depth**: the
number of traversal steps from the critical path to the deepest room of each branch,
reported as a distribution rather than a mean. This second number is not optional and it is
the one teams omit. Two spaces at the same ratio play nothing alike when one is twenty
one-room alcoves off a corridor and the other is two long wings — the first reads as
clutter, the second as a place with parts.

A third figure is worth carrying because it changes the cost of everything else:
**a dead-end branch is paid for twice.** The player walks in and walks back, so a dead end
of depth four costs eight steps of traversal; a branch that rejoins the critical path
costs its length once and returns the player somewhere new. Loops are therefore cheaper
than dead ends at equal depth, and a budget that counts rooms without counting the return
walk systematically over-builds dead ends.

## The budget is the intended shape, not a ceiling

State the ratio per space class, as the size the space is meant to be, per
[a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output). This is not
pedantry about phrasing. A generator handed "up to three optional rooms per critical room"
will spend all three, because a generative process spends what it is given; handed "around
one, branches two to three deep" it produces the space that was wanted. The classes are
few and stable: a corridor-class space — an opening sequence, a chase, the approach to the
closing fight — declares a ratio near zero, and any optional space in it is a defect
because the class exists to hold attention on one line. An exploration-class space declares
roughly one optional room per critical room with branches two to four deep. A hub inverts
the relation entirely and is graded on coverage instead.

Derive a sub-space's budget from the whole space's budget rather than restating the
whole's allowance for each part, or every wing is built to the size of the level.

## What makes a branch optional content rather than padding

The rule is single and it is the one that keeps the ratio honest: **a branch counts toward
the optional budget only if its terminus holds something the player cannot get on the
critical path, and that something is named in the plan as data.** A reward, a shortcut
that changes the return route, a distinct encounter, a piece of the space's information —
named, on the room, machine-readable. A branch whose deepest room holds nothing is padding,
and padding counts *against* the space rather than toward it: it spent the player's
traversal budget and returned nothing, and it added a decision point that has to be made
legible.

Two corollaries follow and both are checks. A dead-end branch deeper than the class budget
with an empty terminus is a finding, with the fix stated — put something there or prune it.
And a branch that holds something but whose contents duplicate what the critical path
already gives is padding wearing a reward's label; grading the *presence* of a reward
rather than its distinctness is how a generator learns to satisfy the check by scattering
the same pickup.

## Procedure

1. **Require the objective room to be marked before measuring.** A plan with no objective
   has no critical path and therefore no ratio; report it as unmeasured and stop, per
   [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass). A default of zero
   here reads as "perfectly linear" and is the most misleading value the check can emit.
2. **Compute the critical path on the gated graph**, recording the basis alongside it.
3. **Classify every remaining room** as belonging to a branch, and compute each branch's
   depth and whether it dead-ends or rejoins.
4. **Measure the ratio and the depth distribution**, and compare both against the declared
   class budget.
5. **Report achieved beside requested, always.** A space that asked for one and got
   two-point-four is not a failure, but showing only the request implies it was met — the
   same dishonesty as a generation parameter reported as consumed when it was approximated.
6. **Emit findings with the fix, naming rooms.** "Three empty dead ends at depth four;
   prune these two and place the region's reward in the third" is usable; "ratio out of
   budget" is not.

## Decision rules

- **When the ratio is under budget, add branches at existing decision points rather than
  lengthening the critical path.** A longer mandatory route is the one change every player
  is forced to experience, and lengthening it to hit an exploration target is how a space
  becomes a slog.
- **When the ratio is over budget, prune the shallowest empty branches first.** They cost
  the most legibility per unit of content: each is a junction the player must read and a
  detour that pays nothing.
- **When the generator cannot reach the budget, report the compromise rather than
  re-rolling silently.** A stated "achieved zero-point-four against a target of one, the
  layout admits no branch points past the third room" teaches the designer which parameter
  to move. A silent re-roll teaches nothing and is where iteration dies.
- **When the class of the space is not declared, refuse to grade it.** The same layout is
  an excellent chase and a terrible exploration space; grading against an assumed class
  produces a confident finding about the assumption.
- **When raising the ratio, raise the landmark budget with it.** Every branch adds a
  decision point, and a decision point the player cannot read is worse than the branch is
  worth. The two budgets are coupled, and moving one without the other is how an
  exploration space becomes a maze.

## When not to use this

- **Spaces with no objective** — a hub, a town, a sandbox arena, a persistent social space.
  There is no critical path to be a ratio against, and coverage rules replace it: how far
  from any point the nearest service is, whether every region is entered by some route.
- **Worlds measured at region scale rather than space scale.** In a large continuous world
  the critical path is a property of the campaign, not of a room graph, and applying the
  room-scale rule to it reports every region as over-branched.
- **As a quality verdict.** A space inside its ratio budget with well-filled branches can
  still be dull, unfair or ugly. The ratio says the space has the shape it declared; it
  says nothing about whether the shape was the right one or whether the contents are worth
  the walk.
