---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: active-defense-two-axis-split
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
use_when: [designing a block parry or dodge, diagnosing combat that feels flat, deciding how gear should affect a defensive action]
shared_with: []
---

# An active defence has two axes: the trigger and the magnitude

## The concern

An active defence is any defensive outcome the player causes by an input at a moment: a
block, a parry, a guard, a dodge with invulnerable frames, a counter, a perfect-timing
variant of any of them. It is the point where the action layer and the progression layer
touch, and it is the easiest place in a real-time system to accidentally delete one of
them.

Every active defence is scored on two independent axes:

- **The trigger axis — player-timed.** Did the input land inside the window relative to the
  incoming hit? This is binary or graded (missed / blocked / perfect), it is decided by the
  player's hands, and no stat may decide it outright.
- **The magnitude axis — stat-scaled.** Given that the trigger succeeded, how much did it
  mitigate, for how long, at what resource cost, with what recovery? This is where the
  character's build, gear and investment live.

The system's behaviour is the cross product. Collapse it into one number and one of the two
layers becomes decorative:

- **Collapsed to the trigger axis** (timing decides everything, magnitude is a constant):
  gear stops mattering in the exact moment the player cares most about it. Progression
  becomes a number that changes the fight's length and nothing about how it is played.
  Players report this as "the build doesn't matter".
- **Collapsed to the magnitude axis** (a stat rolls the block, or a held button mitigates a
  fixed share regardless of timing): the player's hands stop mattering. The defence becomes
  a passive with a button attached. Players report this as "combat is flat", and no amount
  of retuning the mitigation percentage fixes it, because the missing thing is not a number.

Both failures look correct in inspection: the defence exists, the input is bound, the
mitigation applies, and every value is within range. What they fail is behavioural — the
system produces the same outcome regardless of one of its two inputs, and that is only
visible when a human plays it against varied timing.

The mitigation figure is also a unit-and-basis case. "Blocks 40%" means nothing until it
says *of what* — the pre-mitigation hit or the post-mitigation remainder — and *under which
trigger grade*, since a perfect block and a late block sharing one percentage is precisely
the collapse this technique forbids.

## Procedure

1. **Write the window before the number.** Define the trigger window in seconds relative to
   the incoming hit's contact moment, including how much of it sits before contact and how
   much after. A window under roughly a fifth of a second is a coin flip; a window over
   about half a second stops feeling like timing at all.
2. **Grade the trigger, do not merely pass it.** At minimum two grades — a normal success
   and a tight-window success — so that skill has somewhere above competence to go. Grades
   are boundaries on the same window, not separate inputs.
3. **Attach the stat scaling to the magnitude only.** The magnitude axis is a named list:
   mitigation share, invulnerable-frame duration, the defence's own cooldown, resource cost,
   recovery length, and the stability or stamina pool that repeated defences drain. Gear,
   attributes and passives move those. They never move the trigger window itself by more
   than a small fraction, and they never substitute for it.
4. **State each magnitude with its basis** — which stage of the mitigation pipeline it
   applies at, whether it is a share of the incoming figure or a flat subtraction, and
   whether it is capped. The genre's mitigation-ordering canon owns that pipeline; this
   technique only insists the defence declares its position in it.
5. **Give failure a cost.** A defence that costs nothing when mistimed collapses to a spam
   input, which is the trigger axis deleted by a different route. Recovery on a failed
   trigger, drained stability, or a punish window are the standard costs.
6. **Test both axes independently.** Hold the build constant and vary timing; hold timing
   constant and vary the build. If either sweep leaves the outcome flat, the collapse has
   already happened.

## Decision rules

- **When a defence is meant to reward mastery, put the reward on the trigger axis as a
  discrete grade with a qualitatively different result** — a stagger, a counter opening,
  full negation — rather than as a larger percentage. Players read a state change; they do
  not read a percentage.
- **When a defence is meant to reward investment, put the reward on cost and sustain** —
  more defences per fight, faster stability regeneration, cheaper recovery — rather than on
  the window. Widening the window with gear is the one stat that genuinely erodes the skill
  axis, because it makes the same input succeed for a different reason.
- **When mitigation would exceed near-total on a normal trigger, move the excess to the
  tight-window grade.** A normal-grade defence that negates everything makes the tight
  grade pointless and the fight a hold-button problem.
- **When a defence can be held rather than tapped, it is not an active defence** — it is a
  stance, and it belongs on the passive-mitigation side of the canon with a stance's costs
  (movement penalty, drain, direction limits). Do not let a held stance claim a timing
  reward.
- **When the same defence exists for several damage types, vary the magnitude by type and
  keep one window.** Two windows for one input teach the player nothing and feel like
  inconsistent code.

## When not to use this

- **Do not split a defence that has no player input at all.** Armour, resistances and
  chance-to-avoid are passive mitigation; they are one-axis by design and forcing a trigger
  onto them invents an input nobody asked for.
- **Do not split in a design that deliberately has no execution layer** — a tactics-flavoured
  or accessibility-first mode where outcomes are meant to be decided by the build. There the
  single axis is the design, and it should be stated as such rather than discovered.
- **Do not add a second axis to a defence whose window is already shorter than perception
  latency.** Fix the window first; grading an unfair window produces two unfair outcomes.
