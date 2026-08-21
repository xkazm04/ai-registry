---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: death-via-state-tag-not-input-disable
status: forged
laws: [one-authority-per-quantity, compiling-is-not-wiring]
use_when: [implementing death or incapacitation, defining which states block ability activation, diagnosing actions that fire after a combatant died]
shared_with: []
---

# Death is an observable state tag, not a disabled controller

## The concern

The quickest way to implement death is to stop the thing from acting: disable the
controller, detach the input, stop the movement component, play the animation. It works
from the player's chair for about a minute of testing, and it is wrong, because *acting* is
only one of the things the rest of the system does with a combatant.

To every other system, a combatant whose controller is off is still a living target. It can
be selected. Effects apply to it. Damage-over-time keeps ticking. The health authority keeps
accepting writes. An attack already in flight resolves against it. An ally heals it. A
resource-refund effect pays out for hitting it. A queued ability that was mid-wind-up when
it died fires afterwards, because the thing that decides whether an ability may activate
never looked at the controller — it looked at the combatant's state, and the state says
nothing happened.

Death must therefore be **a tag on the combatant's state that every gate already consults**.
It becomes one more entry in the same set that holds stunned, rooted, silenced, disarmed
and casting — the set the activation check reads before allowing any ability to start. The
same tag answers targeting, effect application, artificial-intelligence perception, loot
attribution, and the encounter's own accounting. "Can this act", "may this be targeted" and
"is this dead" become three readings of one fact rather than three independent
implementations that will disagree.

This is the compiling-is-not-wiring failure in miniature. The death implementation exists,
runs, and looks right on screen. It was never *registered* with the systems that needed to
know, so it is not done.

## Procedure

1. **Model combatant state as a set of tags, not as a scattering of booleans.** Tags compose,
   can be queried by pattern, and can be added by content without touching the gate.
2. **Define an activation-blocked set once**, and make every ability activation consult it.
   The dead tag and the fully-incapacitating control tags MUST always be members. This is
   not a per-ability choice; an ability that could be cast while dead is a content defect,
   not a design option.
3. **Apply the tag at the moment the health authority crosses zero**, inside the same entry
   point that applied the fatal delta, so there is no window in which health is zero and the
   tag is absent. That window is where every after-death artifact lives.
4. **Cancel in-flight commitments through the tag, not around it.** Adding the tag must
   interrupt wind-ups, end channels, and remove the combatant from the pending-resolution
   sets of anything targeting it. Do it in the tag's own change handler so a future author
   who applies the tag from a new path gets the behaviour free.
5. **Make targeting, effect application and perception read the tag.** A dead combatant is
   not a valid target for a new hostile effect, does not satisfy an aggro query, and does not
   count toward an encounter's living-enemy tally.
6. **Keep the corpse addressable.** Death is a state, not a deletion. Resurrection,
   loot, physics, and post-fight accounting all need the combatant to still exist with the
   tag on it. Removal is a separate, later, deliberate step.
7. **Sequence the death flow so the death reaction is secured before the mass cancel.** The
   standard implementation cancels everything the dying combatant was doing and then tries to
   play a death reaction — which no longer exists, because the cancel removed it. Grant and
   activate the death reaction atomically first, then cancel the rest; and guard the whole
   flow with a re-entrancy flag, because a lethal tick arriving during the flow will
   otherwise run it a second time.
8. **Order the initialisation so the gate exists before anything can activate.** A combatant
   whose tag set is populated after input binding has a race that only appears under load —
   during a level transition, a respawn, a mass spawn — and it fails open, which is the worst
   direction. Bind input after the state system reports itself initialised, and have the
   activation path refuse rather than proceed when it is not.

## Decision rules

- **When any system needs to react to a state, let it key off the tag rather than off the
  event that caused it.** The tag *is* the state's identity: reactions, perception, interface
  indicators and accounting all subscribe to the tag, so a new source of the same state costs
  nothing to integrate. Keying off the causing ability instead means every new source is a new
  integration.
- **When a new incapacitating state is added, add it to the blocked set in the same change.**
  A state that stops a combatant conceptually but not in the gate is the same defect as
  death-by-controller, and it will be found by a player, not by a build.
- **When an effect must still apply to a dead combatant** — a corpse explosion, a delayed
  resurrection, a soul-harvest — let it declare that it ignores the tag. An explicit
  exemption on the effect is reviewable; a gate that silently permits everything is not.
- **When death must be reversible, do not unwind it by re-enabling the controller.** Remove
  the tag through the same authority that applied it, and let the change handler restore
  everything it suppressed.
- **When a combatant is removed for a reason other than death** — despawn, phase change,
  teleport out — use a different tag. Collapsing them makes death-count telemetry and
  quest credit wrong in ways that are extremely hard to trace back.
- **When an ability's cost was already paid and the caster dies mid-wind-up, refund or
  consume by one stated rule.** Whichever the design picks, the tag's handler is where it
  is implemented, so it is the same in every path.

## When not to use this

- **Do not tag-model states that are purely presentational.** A flinch, a hit reaction, a
  cosmetic stagger that does not gate anything belongs in the animation layer; putting it in
  the state set invites someone to gate on it and makes the blocked set unreadable.
- **Do not use this for a non-combat actor with no ability system at all.** A destructible
  prop's death is its removal, and giving it a combatant state machine is ceremony.
- **Do not replace a proper ownership or lifetime model with tags.** The tag says what is
  true of the combatant; it does not say who may write to it. That question belongs to the
  health authority, and the two rules are complements, not substitutes.
