---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: hit-dedup-per-swing
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
use_when: [implementing a sweeping or lingering damage volume, diagnosing damage that varies with approach angle, reviewing a beam aura or piercing projectile]
shared_with: []
---

# One activation, one identity, one hit per target

## The concern

In continuous time, contact is not an event — it is a condition that is true for a stretch
of frames. A weapon volume sweeping through a target overlaps it for several frames. A
lingering aura overlaps everything inside it on every frame it exists. A piercing projectile
can re-enter the volume it just left. A beam is contact by definition.

The damage number an author wrote is quoted *per swing*. The system, left alone, applies it
*per frame of overlap*. Nobody wrote the conversion factor, and the factor is not even
constant: it depends on approach angle, relative motion, animation speed and frame rate. A
number whose real multiplier is an unstated frame count is a number without a basis, and
the resulting damage is not merely too high — it is unrepeatable, which is why players
describe the symptom as randomness rather than as imbalance.

The fix is to give the *activation* an identity and let that identity own the set of targets
it has already resolved against. "Has this swing already hit you" is a question with exactly
one owner: the activation. Any other owner — a cooldown on the target, a global timestamp, a
flag on the weapon — is a second authority for the same fact and will disagree with the
first at the worst moment.

This generalises past melee. Any continuous-volume interaction that can tick needs an
activation identity: a healing aura, a slow field, an environmental hazard, a persistent
ground zone, a repeated-contact hazard that is supposed to hurt once per entry. The pattern
is the same; only the vocabulary changes.

## Procedure

1. **Give every activation an identity distinct from the actor and the ability.** The unit
   of deduplication is one use of the ability — one swing, one beam sweep, one zone
   instance — not the ability itself and not the character holding it.
2. **Attach a set of already-resolved targets to that identity — on the activation instance,
   not on the detection window.** The animation event that opens and closes the contact test
   is a *trigger*, and it can fire more than once per activation; a set that lives on it is
   cleared at the wrong moments and repopulated at the wrong ones. The set is created when
   the activation begins and belongs to the activation for its whole life. On each contact
   report, consult the set; if the target is present, ignore the report; otherwise resolve
   the hit and insert.
3. **Run the contact test only inside an authored damage window.** The activation declares
   the sub-interval of its action during which contact counts — a start and an end in
   seconds within a wind-up of roughly 0.4–1.5 s — and the test is idle outside it. Testing
   every frame of the action costs performance and, worse, makes the number of contact
   reports a property of the animation's length rather than of the design.
4. **Clear the set when the activation ends, not on a timer.** A timer-based clear
   reintroduces the frame-count problem at a coarser grain and breaks the moment weapon
   speed changes.
5. **Decide, per ability, whether a multi-strike action is one activation or several.** A
   three-hit combo is three activations with three sets. A single wide sweep is one. This is
   an authoring decision and must be visible on the ability's specification, because it is
   the difference between a triple-damage and a single-damage attack.
6. **For a persistent volume that is meant to tick, dedupe per tick rather than per
   activation.** The activation owns the tick schedule; each tick opens a fresh set. The
   period is then the honest, authored answer to "how often does this hurt", instead of the
   frame rate answering it.
7. **Verify with the worst geometry, not the convenient one.** Sweep through a target
   lengthwise, along the volume's axis, at the slowest and fastest animation speeds
   available, and confirm the damage is identical. Identical damage across those cases is
   the only proof; a passing unit test on a single overlap event proves the code runs, not
   that the rule holds.

## Decision rules

- **When a target can legitimately be hit twice by one action, model it as two
  activations** — a second swing, a second projectile — rather than as an exemption from
  deduplication. Exemptions are invisible in review; extra activations are visible on the
  specification.
- **When a projectile pierces, the projectile is the activation.** Its set persists for its
  whole flight, so it cannot re-hit a target it passed through when its path curves back.
- **When a volume is attached to a moving actor and is meant to hurt on re-entry, use a
  per-target re-entry delay in addition to the activation set,** and state that delay in
  seconds as a normal authored period. That is not a substitute for the set; it is a second,
  explicitly authored rule layered on top.
- **When an ability's damage is displayed to the player, display it per activation.** Any
  other basis makes the tooltip and the combat log tell different stories about the same
  attack.
- **When a hit applies a secondary effect — an ailment, a stagger, a resource gain — the
  deduplication governs those too.** A deduplicated damage figure with a non-deduplicated
  status application is the same bug moved one layer down, and it is much harder to spot
  because the health bar looks right.

## When not to use this

- **Do not dedupe a volume whose entire design is continuous drain** — a lava pool, a
  crushing gas. Those want a tick period, which is a different technique's problem; adding
  an activation set on top makes the zone hurt once and then be safe forever.
- **Do not dedupe across activations to "smooth out" burst damage.** Suppressing the second
  swing because the first landed recently makes attack speed silently stop scaling, which is
  a balance defect with no visible cause.
- **Do not build deduplication on the target's identity alone.** The second swing must be
  able to hit the same target; that is the whole point of a second swing.
- **Do not rely on a shared registry of recent hits owned by a manager rather than by the
  activation.** It works until two actors swing at the same target in the same frame, and
  then it eats one of the hits.
