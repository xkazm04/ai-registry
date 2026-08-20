---
layer: technique
type: technique
subject: procedural-level-planning
technique: pacing-linter-rules
status: forged
laws: [law-and-check-share-one-source, unmeasured-is-not-a-pass]
shared_with: []
use_when: [checking a generated room graph before anything is built from it, a level plays as a slog or a wall, encoding pacing knowledge a lead reviewer holds informally]
---

# Pacing linter rules

A room graph carrying a type and a difficulty value per room is checkable. This technique
is the small set of rules worth encoding, each stated as a **signature** the linter can
detect plus the **designer consequence** the signature predicts. The consequence is the
half that makes a finding actionable; a rule that reports "three consecutive combat rooms"
without saying what that does to a player gets suppressed as noise within a week.

Run it before geometry exists. It costs milliseconds and it catches what a human only
notices after an hour of walking the space.

## The rules

**Combat fatigue — three or more consecutive combat rooms with no rest between them.**
The player has no window to recover, re-equip or read the space; sustained encounters stop
registering as distinct fights and start registering as a corridor of noise. Two details
decide whether the rule fires correctly. A room breaks the run only if it is a *restful
kind* — safe, puzzle, exploration, transition, a scripted beat — or is explicitly tagged as
rest pacing; and a room of an **unrecognised kind continues the run rather than breaking
it**. Unknown must not grant relief: a room nobody classified is not evidence of a lull.

**Difficulty cliff — a step of three or more between adjacent rooms, in either
direction.** Upward, it reads as a wall rather than a challenge: the player attributes the
loss to the level rather than to their play. Downward, it deflates — the room after the
hard one feels like a mistake, and the tension the hard room built is spent on nothing.
The **threshold is symmetric and the severity is not**: an upward cliff is a defect, a
downward drop is a warning, because a drop is sometimes a deliberate treasure or rest beat
and a spike almost never is. Teams that lint only the upward direction ship anticlimaxes.

**Monotonic ramp — an arc of four or more rooms whose difficulty never reverses
direction, with a net change of three or more.** Each individual step is defensible; the
sequence is a treadmill. A player experiences continuous escalation as flatness, because
with no dip there is nothing for a peak to be a peak *against*. Lint the descending case
by the same rule — an arc that only ever eases is a level the player stops paying
attention to. This fires as the mildest of the five: it describes a shape, and shapes have
legitimate exceptions.

**Unprepared ending fight — a boss room with no adjacent safe or rest room.** The player
arrives at the fight with no place to have prepared for it, and after a wipe re-runs the
approach rather than the fight. Adjacency counts in **both directions**: a safe room the
player passes through on the way in serves exactly as well as one behind the boss door, so
a check that only walks outbound connections reports a defect that is not there. The room
qualifies by being of the safe kind *or* by carrying rest pacing — the role can be borne by
either. This is the placement rule (safe-room-and-boss-placement) restated as a check,
which is the correct relationship: the generator's rule and the linter's rule are the same
rule seen from two ends.

**Unreachable room — a room with no path from the start.** This is a correctness bug
wearing a pacing costume. It fails; it does not warn. Content the player cannot enter is
either a routing defect or wasted production, and both need a person.

## Rest is a designed beat

The idea beneath four of these five rules is that **a quiet room is doing work**. It resets
tension, it is where the player consolidates, and it is what makes the next encounter
legible as an encounter. A generator optimising for interest per unit of floor area
produces a level with no quiet rooms and therefore no peaks either.

This is the same principle that governs pacing *inside* a single fight — the beat structure
of one engagement, its lulls and its recovery windows — which is adjacent craft owned
elsewhere and deliberately not restated here. The scales are different and the rules are
different; the principle is one, and a team that encodes it at the room scale and not at the
encounter scale gets levels that breathe made of fights that do not.

## Procedure and decision rules

1. **Read the thresholds from one canonical statement.** The number in the prose a designer
   reads and the number the linter compares against are the same source, per
   [law-and-check-share-one-source](../../_laws.md#law-and-check-share-one-source). A rule
   documented as "±3" and implemented as "> 3" will be argued about in a review a year from
   now and nobody will know which was intended.
2. **Grade findings, do not binary-pass.** Reachability fails. Pacing rules warn, with a
   severity, and a level with two warnings is shippable while a level with nine is not.
   Making every pacing rule blocking gets the linter disabled.
3. **Every finding names its rooms and carries a concrete suggestion.** Not "difficulty
   cliff detected" but "this room jumps to seven from four; either insert a room at five
   between them or lower this one to five" — the specific rooms and the specific number. The
   suggestion is what converts a linter from a nag into a tool, and writing it forces the
   rule's author to know what the fix actually is. Mark one room as the finding's primary
   anchor so the finding can be shown inline on the graph rather than only in a list.
4. **Narrow the input before linting it.** A room graph that came from a store or from a
   generative authoring pass is arbitrary data, not a trusted structure. Validate every
   field the rules read — kind, difficulty, connection targets — rather than casting. A
   malformed connection entry that is not a room reference will otherwise be reported as an
   unreachable room, and the team will spend an afternoon on a finding the linter invented.
5. **Report rules that could not evaluate as unevaluated.** A graph whose difficulty values
   were never populated has no pacing verdict at all; reporting "no findings" for it is the
   collapse [unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass) forbids, and
   it is the single most likely way this linter comes to lie.
6. **Tune the thresholds against played levels, not against taste.** The numbers above are
   defensible defaults for a difficulty scale where one step is a meaningful increment; a
   project on a different scale must restate them in its own units rather than inherit them.

## When not to use this

- **On a graph without typed rooms or a difficulty value per room.** Without those the
  linter has nothing to read, and inferring a room's type from its size or its contents
  produces findings about the inference rather than about the level.
- **On hand-authored showcase levels** where a deliberate violation is the design — a
  five-room gauntlet as a set piece. Keep the rules, allow a per-level suppression that
  records the reason, and treat an unexplained suppression as a finding of its own.
- **As a quality verdict.** Passing every pacing rule says the level's rhythm is not
  obviously broken. It says nothing about whether the encounters are fair, whether the space
  is legible, or whether it is any fun — those are other instruments.
