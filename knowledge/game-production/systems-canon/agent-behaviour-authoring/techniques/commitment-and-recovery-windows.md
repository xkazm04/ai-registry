---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: commitment-and-recovery-windows
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [an agent stutters between two actions, an agent cannot be punished for a mistake, deciding how often an agent may change its mind, an agent cancels out of the recovery its own attack declared]
shared_with: []
---

# Commitment and recovery windows

The named concern: state, in seconds, how long an agent is bound to a decision once it has
made one — the minimum dwell before it may re-decide, the points at which re-deciding is
permitted, the margin by which a competing option must win before a switch is allowed, and
the recovery its own chosen action obliges it to sit through.

Commitment is usually discovered as a stability problem: an agent alternating between two
near-equal options every tick, visible as a character stuttering between two animations. The
stability reading is correct and incomplete. Commitment is also, and more importantly, a
**fairness** quantity. The interval in which an agent has spent its option and cannot take
another is the interval in which a player can act against it. An agent with no commitment has
no exploitable moment, and a fight against it is not a fight — it is a wall that reacts.

## The three quantities

**Minimum dwell.** Once an intent is chosen, the arbitration layer may not choose again for a
stated time. Sub-second values are the working band for a combat agent; a value near a quarter
of a second is roughly the floor at which a change reads as a decision rather than as noise.
The number is per intent class, not per agent: a repositioning intent tolerates a longer dwell
than a defensive reaction, and one global dwell forces the two to share a compromise that
serves neither.

**Re-evaluation points.** Rather than allowing a decision anywhere after the dwell expires,
name the moments at which the agent is permitted to reconsider — the end of an action, the
completion of a movement leg, the arrival of a fact above a stated confidence. Declared points
are what make an agent's behaviour reproducible enough to trace: a re-decision that can happen
on any tick produces a trace where nothing lines up with anything.

**Switching margin.** A new option must beat the current one by a stated margin before the
switch is taken, not merely tie-break above it. This is hysteresis, it is one number, and it
removes the entire class of oscillation between two comparable targets. Without it, two enemies
at nearly equal threat will trade the agent's attention on whatever the last decimal place did.

## The recovery obligation

An action declares a wind-up and a recovery — those bands belong to the combat rules, and this
technique does not set them. What belongs here is the decision layer's obligation to *honour*
them, and it is violated in three specific ways that are worth naming because each has a
different fix.

**Cancelling out of recovery.** The agent commits to a heavy attack, the player dodges, and
the agent's arbitration — which sees a missed attack and a repositioned target — immediately
chooses a new intent, skipping the recovery its own action promised. The dodge earned nothing.
The fix is that the recovery window is part of the commitment: the decision layer is not
merely discouraged from re-deciding during it, it is blocked.

**Re-targeting inside a commitment.** The agent swings at a target that moves; the swing
tracks. This preserves the agent's damage and deletes the player's positioning, and it is the
same defect as cancelling, applied to the aim rather than to the intent. Target is fixed at
commitment time; a new target is a new decision, taken at a re-evaluation point.

**Overlapping decisions.** A second intent begins while the first is still resolving, so the
agent is executing two commitments whose windows do not agree. The fix is that a commitment
occupies the agent until it releases, and the release is an event the trace records.

## Decision rules

- **When an agent stutters, add dwell and a switching margin before touching the scoring.**
  Rebalancing two near-equal options to be less near-equal is a fix that lasts until the next
  tuning pass; hysteresis is a fix that holds for every future pair.
- **When a player reports that an agent cannot be punished, measure its commitment windows
  against the player's action durations.** A commitment shorter than the player's fastest
  meaningful action is not a window; there is no interval in which the agent is spending
  something.
- **State every window in seconds against a stated basis** — the player's traversal speed, or
  the duration of the action class it applies to
  ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
  Windows quoted in ticks are unreadable across frame rates and become wrong the first time
  the simulation rate changes.
- **A window whose fairness nobody has measured is unmeasured, not adequate**
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). The measurement is
  cheap: replay the encounter, and check that the interval between the agent's commitment and
  its next available decision exceeds the time a player needs to perceive and respond.
- **Interrupt is an authored exception, not the absence of commitment.** Some events must
  break a commitment — being staggered, the target dying, the agent itself being hit by
  something that overrides. Name them as a closed set on the intent, so an interrupt is a
  declared property rather than the arbitration layer quietly winning.
- **Never implement commitment in the animation layer.** Blending and locomotion smoothing hide
  a stuttering decision without stabilizing it, so the trace still shows the agent changing its
  mind eleven times a second while the character looks calm. The defect survives, invisible,
  until something else reads the intent.

## When not to use this

- **On agents whose only intent is continuous.** A patrolling ambient character with one
  behaviour has nothing to commit to; a dwell time on it is a parameter with no effect that
  will nonetheless be tuned by someone.
- **On the reaction to a hard interrupt.** Being killed, being staggered, or losing the ground
  under it are not decisions the agent gets to sit out. Applying dwell to these produces an
  agent that finishes its attack while dead, which is the behaviour the death-state rules
  exist to prevent.
- **As a substitute for a knowledge model.** An agent that changes its mind constantly because
  its facts flicker at a detection boundary does not have a commitment problem; it has a decay
  problem, and adding dwell smooths the symptom while leaving the agent's knowledge oscillating
  underneath. Check the confidence windows before adding a second smoothing layer on top.
- **Where the design wants a genuinely reactive opponent.** A duelling agent that is meant to
  contest every moment can carry very short windows — but the number is then a deliberate,
  stated, low value with a fairness argument attached, not an absent one.
