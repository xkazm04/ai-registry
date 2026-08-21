---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: telegraph-or-homing-for-area-effects
status: forged
laws: [structural-proof-is-never-sufficient]
use_when: [designing an ability that resolves on an area, reviewing an attack players call unfair, grading an authored enemy move set]
shared_with: []
---

# An area effect is telegraphed or it homes — never neither

## The concern

An effect that resolves on a *position* asks the player a question: were you standing
there? In continuous time the player did not consent to their position — they were moving
through it while looking somewhere else. So the effect owes them one of exactly two
things:

- **A telegraph**: a perceivable cue that names the affected region before the effect
  resolves there, with enough lead time to leave it.
- **A homing guarantee**: the effect follows its target, so leaving is not the answer and
  the player was never asked a positional question in the first place.

The forbidden combination is *instant, untelegraphed and positional*. It is not a hard
attack; it is a rule the player cannot play against. It reads to them as randomness, and
their adaptation is to stop moving expressively — which removes the movement layer the
whole real-time design was built on.

This is a behavioural obligation, not a structural one. An area effect can exist, be
granted, be reachable, apply the correct damage to the correct set of targets, and pass
every check anyone wrote — and still be an unfair rule, because none of those checks look
at whether it was perceivable in time. Proof that the effect works is necessary and says
nothing about whether it is playable.

## Procedure

1. **Classify the effect by what decides who it hits.** Position-resolved (a ground zone, a
   cone, a shockwave, a shaped blast) or target-resolved (a bolt that tracks, a chain, a
   contact attack). Position-resolved effects enter the telegraph obligation; target-resolved
   ones satisfy it by homing and are exempt.
2. **If position-resolved, define the affected region as a shape the cue can draw.** A
   telegraph is only possible for a region with a boundary. An effect whose region is
   computed at resolution time from state the cue cannot know cannot be telegraphed at all,
   by construction, and must be redesigned into a declared shape.
3. **Set the lead time from the region, not from the animation.** Lead time must exceed
   perception latency plus the traversal time from the worst covered point to the nearest
   safe point at the player's normal movement speed. Perception latency alone is roughly a
   quarter second; traversal is measured, never assumed.
4. **Give the cue at least two sensory channels.** A ground decal alone loses to a camera
   pointed elsewhere; a sound alone loses to a busy mix. Pair a spatial visual with an
   audio tell, and let the wind-up animation carry the same information a third time.
5. **Hold the region still once shown, and accept the whiff.** A telegraph that moves after
   it is drawn revokes the contract: the player solved the problem they were shown and lost
   anyway. The consequence is that a telegraphed effect resolves *where it was aimed* and can
   miss entirely against a moving target — that is not a defect, it is the mechanism working.
   Pay for it in radius or in magnitude, never by letting the region re-aim itself. If the
   region genuinely must track, the effect is homing and should be honest about it.
6. **Verify by observation, not by inspection.** Watch the effect resolve against a moving
   target and confirm a player who reacts at the cue can be clear of the region. A lead
   time that was reasoned about but never watched is unverified.

## Decision rules

- **When an effect can remove a large share of the player's health in one resolution, it
  must be position-resolved and telegraphed.** A homing effect of that magnitude has no
  counterplay at all, which is worse than an unfair telegraph. Big damage buys its
  legitimacy by being avoidable.
- **When an effect must exceed the genre's cap on how much of a defended character's
  effective health one hit may remove, a clear dodgeable tell is the only thing that
  licenses it.** The cap itself belongs to the survivability canon; what belongs here is the
  exchange: readability is the currency an oversized hit pays in, and there is no other
  accepted payment.
- **When an effect is small and frequent, prefer homing.** Telegraphing chip damage floods
  the screen with cues, and cue inflation destroys the readability of the cues that matter.
  Reserve telegraph vocabulary for consequences worth reading.
- **When the wind-up animation is shorter than the required lead time, extend the cue
  ahead of the animation rather than slowing the animation.** Animations have their own
  readable band; stretching one past roughly a second and a half to buy lead time makes the
  attack read as a stall.
- **When several telegraphed effects can overlap, cap concurrent regions.** Past three or
  so simultaneous cues, players stop parsing shapes and start running to the largest empty
  space, which is a different and much shallower game.
- **When the player is committed mid-action, count the commitment against the lead time.**
  A window that is only escapable by a player who happened to be idle is not escapable.

## When not to use this

- **Do not telegraph a player's own abilities to the player.** The obligation is owed by
  effects the player must react to. Self-cast and player-aimed effects are consented by
  the input itself; a cue there is noise. Telegraphing a player's effect *to other actors*
  is a different, legitimate design.
- **Do not telegraph in a design that deliberately trades readability for pressure and
  says so** — a horror encounter whose whole point is an unsurvivable presence. Then the
  effect is not a combat rule and should not be balanced as one. Enumerate the exception;
  do not let it emerge.
- **Do not use homing to rescue an effect whose region is simply too large.** Homing on a
  large-magnitude effect converts an unfair positional puzzle into an unavoidable tax.
  Shrink the region instead.
- **Do not treat a damage-number reduction as a substitute for a telegraph.** An
  unreadable weak attack is still unreadable; it has just stopped mattering, which is a
  worse outcome than the original problem.
