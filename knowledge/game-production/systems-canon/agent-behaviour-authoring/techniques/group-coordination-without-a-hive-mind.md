---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: group-coordination-without-a-hive-mind
status: forged
laws: [one-authority-per-quantity, refuse-rather-than-destroy]
use_when: [several agents make the same decision at the same instant, designing squad or pack behaviour, an encounter feels like one enemy repeated, a commander component has become a single point of failure]
shared_with: []
---

# Group coordination without a hive mind

The named concern: make several agents behave as a group without any of them stopping being
an agent — by turning coordination into **competition for scarce claimable resources on
shared state**, rather than into orders issued by a controller.

The problem it solves is a symmetry problem. Identical agents running identical arbitration
over nearly identical knowledge are the same function, so they produce the same output at the
same instant. Four attackers lunge together; four flankers take the same flank; a pack
converges into a single point. Players read this immediately, and they read it as *one enemy
drawn four times* rather than as a group.

## Why the commander is the wrong first instinct

Adding a controller that assigns roles works, and it costs three things that are not obvious
at the time.

It is a **second decision layer** with its own knowledge model, its own arbitration, its own
commitment windows and its own proof burden — every obligation in this subject, duplicated,
for a thing the player never sees.

It is a **single point of failure**. A defect in the controller disables every agent under it
simultaneously, and the symptom is a room full of idle characters, which is the hardest
symptom in this whole subject to attribute.

And it produces the wrong feel. Agents that receive orders stop deciding, so their behaviour
becomes uniform in a new way: not four identical decisions, but four puppets moving in step.
The coordination reads as choreography, which is not the same thing as a group.

## The construction

**Model the coordination as a small set of scarce, claimable slots.** There are three
engagement positions around the target, not four. A flank approach is one claim. A suppression
role is one token. The scarcity is the design: the group's shape is whatever the slot layout
is, and changing the feel of a pack is changing a table of slots rather than rewriting
behaviour.

**Put the registry on the contested resource, not on the group.** The ring of melee positions
around a defender is owned by the defender and sized to its silhouette — roughly four around
something person-sized, eight to sixteen around something large, whatever the shape actually
admits. This placement is not a detail. A group-owned table cannot answer what happens when
two groups converge on one defender, when an attacker retargets, or when an agent belongs to
no group; a resource-owned table answers all three without a special case, because the
question *who may stand here* was always a question about the here.

**Every claim has exactly one holder**, and the registry is the single authority on who holds
what ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). An agent
that believes it holds a slot the registry has not granted is a replicated-by-convention state
bug, and it is how four agents each end up believing they alone hold the flank.

**Claims are leased through a request, an offer and a confirmation.** The claimant asks; the
registry offers a *specific* slot and holds it provisionally; the claimant must arrive and
confirm within a stated timeout or the offer is reclaimed. The confirmation step is what the
naive version omits, and its absence has a definite symptom: a slot held indefinitely by an
agent that is stuck on geometry, unreachable, or dead, while the agents that could use it wait
politely forever. An expiring, unconfirmed offer returns the slot without anyone having to
detect the failure
([refuse-rather-than-destroy](../../../_laws.md#refuse-rather-than-destroy)) — which is the
whole point, because the code path that would have released it explicitly is precisely the
path that failed.

**A claimant may need more of the resource than one unit.** A large attacker needs two
*adjoining* positions, and two free positions that are not adjacent do not satisfy it. That
forces one extra move in the registry: the ability to ask a smaller holder to reseat so the
free space compacts. Without it, a large agent starves in a ring that is half empty, and the
observable behaviour is the biggest enemy in the encounter circling and never engaging.

**Some events invalidate every claim at once.** The defender dies, teleports, is thrown, or
leaves the ground: the whole claim set is cancelled in one operation, and every dispossessed
holder falls back to a stated alternative — a ranged option, or a retarget — rather than
continuing to swing at a position nothing occupies. Declare that fallback with the slot
layout. A per-lease expiry alone handles the slow failures and is far too slow for this class
of event.

**Every agent still decides locally.** It looks at the claim table the way it looks at any
other knowledge: as facts about the world. *The near flank is taken* is an input to its own
scoring or its own condition, exactly like *the target is at eleven metres*. Nothing tells it
what to do. What changes is that the options are no longer identical for all four agents, and
the symmetry is broken without a single order being issued.

**Contention is resolved by the registry, deterministically.** Two agents requesting the same
slot in the same tick must get a stable answer — by a stated priority, by proximity, by
arrival order — and the loser must be told it lost so it can decide again rather than
proceeding as though it had won. A contested claim that silently succeeds for both is the
hive mind with extra steps.

## Decision rules

- **When agents converge, add scarcity before adding logic.** Three slots for five agents
  produces waiting, staggering and rotation with no new behaviour authored. Writing an
  explicit take-turns behaviour instead produces the same visible result and a new decision
  surface to maintain.
- **When a role must exist at most once, make it a token, not a condition.** A condition of
  the form *if nobody else is suppressing* is evaluated independently by every agent in the
  same tick, and every one of them concludes nobody else is. A token is claimed, and only one
  claim succeeds.
- **Lease everything; expire everything.** State the lease duration and the confirmation
  timeout next to the slot. An agent holding a claim it is no longer acting on must lose it on
  a timer, because the code path that would have released it is exactly the path that failed.
- **Cap concurrent use below the slot count.** Holding a position and being permitted to act
  from it are two different grants, and separating them is what turns a ring of attackers into
  a rhythm: everyone stands where they belong, two act at a time, and the player is never
  attacked from every direction at once. Collapsing the two produces the stun-lock the slot
  system was adopted to prevent, at a slower rate.
- **Keep the group surface small.** Every key at group scope is a key two agents can disagree
  about. Claims, a shared alert level and a shared last-known contact cover most of what a
  pack needs; anything larger is an agent's private memory that was promoted without a reason.
- **Give the group a stated size band.** Coordination behaviour designed for three agents does
  not survive being handed twelve, because the slot layout is a spatial claim and twelve agents
  around three positions is nine agents idling. Declare the band the layout was authored for
  and report a group outside it rather than degrading silently.
- **Broadcast facts, not commands.** One agent seeing the player and writing that fact to group
  scope is coordination; one agent telling the others to attack is a commander that grew inside
  a peer. The distinction is whether the receiving agent may decide otherwise — it must be able
  to.

## When not to use this

- **Solitary agents and agents that never share space.** The claim machinery costs shared state,
  contention handling and a lease clock, and buys nothing where there is nothing to contend.
- **Where the design genuinely wants a single mind.** A swarm meant to read as one organism, a
  possessed group, a hive that the fiction says is centrally driven — these want the commander,
  and the commander is then a designed feature with a stated failure behaviour rather than an
  architectural accident.
- **For strictly choreographed set pieces.** A scripted ambush that must happen in one exact
  order is authored as a sequence. Emergent claim-based coordination will produce a *plausible*
  order, and plausible is the wrong target when the moment is directed.
- **As a substitute for individual competence.** Coordination on top of agents with no knowledge
  model produces four blind agents taking turns. The slots break the symmetry; they do not
  supply the behaviour, and a group that feels empty usually has an agent problem rather than a
  coordination problem.
