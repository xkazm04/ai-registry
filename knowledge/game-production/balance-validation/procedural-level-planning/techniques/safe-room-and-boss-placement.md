---
layer: technique
type: technique
subject: procedural-level-planning
technique: safe-room-and-boss-placement
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [assigning structural roles to generated rooms, a generated level's ending fight sits next to the entrance, writing the placement half of a generation brief]
---

# Safe room and boss placement

A generated level has structural positions that carry meaning: where the player starts,
where they can breathe, where the reward sits, where the fight that closes the level
happens. Left to uniform random assignment, a technically valid graph becomes unplayable —
the ending fight two rooms from the entrance, the reward behind it, no rest room in the
second half. This technique is the small set of placement rules that prevent that, each
carrying the reason a designer can argue with.

## The rules, with their reasons

**The ending fight goes in the largest room, farthest from the start.** Largest, because a
climactic fight needs space for its mechanics and its arena to read as an arena. Farthest,
because the approach *is* the build-up — the distance is what makes arrival feel earned.

**Farthest is measured in traversal steps, not in metres.** This is the rule teams get
wrong, and it is
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)
biting: a room across a wall is metres away and twenty steps away, and placing the ending
fight by straight-line distance puts it behind the entrance. State the unit in the
placement rule, and compute it over the connection graph the player actually walks.

**A safe or rest room sits at the start, and again near the halfway point of
progression.** The first is the player's baseline — the state they will be compared
against. The second is the load-bearing one: it is the recovery beat that lets the second
half escalate from somewhere. Halfway is measured along progression order, not along the
map.

**The ending fight has an adjacent safe or rest room.** Preparation needs somewhere to
happen: last-moment loadout changes, consumables, reading the door. Without it, a wipe
costs the approach as well as the fight, and the fight stops being the thing the player is
practising.

**The principal reward sits late but before the ending fight — around sixty to seventy
percent of progression.** Early enough that the player can use it in the climax, late
enough that it is not the level's opening move. A reward behind the ending fight is a
reward for a level the player has already finished.

## A role is what a room forbids and offers, not what it is called

Two of these roles are under-specified by their names and get generated wrong for that
reason.

A **safe room** is defined negatively and positively at once: nothing spawns hostile in it,
*and* it offers whatever service the game's recovery loop needs — restock, save, respec,
a vendor. A room labelled safe that offers nothing is a corridor with a good name, and the
player will not stop in it, so the rest beat does not happen.

An **arena for the ending fight** needs more than floor area: a single controlled entry so
the approach reads as a threshold, and cover or elevation so the space supports mechanics
rather than being an empty box. Generating "the largest room" and stopping there produces a
climax in a warehouse.

The secondary placements follow the same shape. Ordinary rewards belong at the ends of dead
branches — that is what makes exploring a branch worth the detour rather than a punishment.
Optional hidden content stays scarce, on the order of one or two per level; the moment it is
routine it is no longer a discovery.

## Procedure

1. **Compute progression order first.** Every rule above is stated in terms of position
   along progression, so the traversal ordering from the start room is the prerequisite,
   not an afterthought. A generator that assigns roles before it knows the order is
   assigning them by map position and will disagree with the player's experience.
2. **Place in dependency order**: ending fight, then its adjacent safe room, then the start
   safe room, then the midpoint safe room, then the reward. Placing the reward first
   frequently strands the ending fight in a small room.
3. **Resolve conflicts by relaxing the softest constraint, and say which.** When the
   farthest room is also the smallest, the tool picks one criterion and reports the
   compromise. Silent relaxation is how a designer ends up unable to explain their own
   level.
4. **Assign the roles as data on the room, not as a naming convention.** A role inferred
   from a room's label is a role that breaks on the first rename, and the downstream
   consumers — the linter, the spawn tables, anything deriving a scene from the same graph
   — need to read it, not parse it.
5. **Verify the placement, then verify it plays.** That every role is assigned and every
   adjacency constraint holds is a structural check, and
   [structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
   applies: a level can satisfy every rule here and still have an ending fight nobody can
   survive or an approach that reads as a dead end. The placement rules buy a plan worth
   building, not a level worth shipping.

## Decision rules

- **When no room satisfies both size and distance, prefer distance.** A cramped climax at
  the end of a long approach still reads as a climax; a spacious one near the entrance does
  not.
- **When the level is short — under roughly six rooms — drop the midpoint safe room rather
  than squeezing it in.** In a short level the start room is still the recent past; a second
  rest beat three rooms later reads as padding.
- **When placement fails a constraint outright, report it rather than placing anyway.** A
  plan that says "no room adjacent to the ending fight can serve as a safe room" is a usable
  finding; a plan that quietly nominates a combat room as the safe room is a defect that
  survives into the build.
- **When the genre inverts a rule, restate the rule, do not delete it.** A level designed to
  strand the player deliberately still needs its absence of rest to be a stated decision
  with a reason attached, because that is what makes it a design instead of an oversight.

## When not to use this

- **Levels with no climax structure** — a hub, a town, a sandbox arena. Forcing an ending
  fight into a space that is not a journey produces a boss in the market square.
- **Non-linear layouts with many valid orderings.** Then "farthest" and "halfway" are not
  well defined against a single order, and the rules must be restated per critical path or
  dropped in favour of coverage constraints — at least one rest room within some number of
  steps of any point, rather than one at a computed midpoint.
- **As a substitute for populating the rooms.** Placement decides where the fight is. What
  is in it, and whether it is winnable, belongs to encounter work and to the simulation that
  validates it.
