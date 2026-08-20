---
layer: technique
type: technique
subject: arpg-systems-canon
technique: ailments-scale-off-the-hit
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [defining a damage-over-time ailment, balancing a second damage channel, stopping an ailment build from scaling independently]
---

# Ailments scale off the hit that caused them

An ailment — bleeding, ignition, poison, and their kin — is a damage-over-time effect
derived from the hit that applied it. Its magnitude is a **coefficient over the damage of
that hit, of the matching type, spread over a stated duration**. It is not an independent
damage source with its own scaling, and refusing to let it become one is the entire
technique.

The canonical form:

```
ailment damage per second = coefficient x (matching-type damage of the applying hit) / duration
```

A hit that dealt some fire damage applies an ignition worth a fixed fraction of that fire
damage over a few seconds. A physical hit applies bleeding on the same pattern against the
physical portion.

Working envelopes for the three canonical damaging ailments, each paired with the
accumulation law that gives it its character:

| Ailment | Source type | Envelope | Accumulation |
| --- | --- | --- | --- |
| Ignition | fire | ~90% of the hit over 4s | **highest** — only the strongest is active |
| Bleeding | physical | ~70% of the hit over 5s | **stack** to a small cap (around 8), amplified while the target moves |
| Poison | chaos-shaped | ~20% of the hit per stack over 2s | **stack** additively, uncapped |

Those three are deliberately different archetypes: one big number you want to maximise per
hit, one medium stack that rewards sustained pressure, and a swarm of small stacks that
rewards attack rate. The coefficients are not interchangeable — they are the whole reason a
fast-attacking build and a slow-hitting build have different ailment ceilings.

## Control ailments have a different basis

The non-damaging ailments — chill, shock, freeze — have no damage to derive, so they scale
off a *different* stated basis: **the hit's size relative to the target's life pool**. That
is what makes a large hit on a small monster a hard freeze and the same hit on a boss a
flicker, without any per-monster tuning. Each is capped: a chill slows by at most 30%, a
shock amplifies damage taken by at most 50%, a freeze is a threshold gate — it only triggers
when the hit crosses a fraction of the target's life — and lasts at most a few seconds, with
bosses carrying heavy resistance or immunity to it.

The pattern to take from this: a derived effect always names its basis, and *hit damage* and
*hit-relative-to-life* are two different bases. Bosses may be immune to the control ailments
without being immune to the damaging ones, and that split is a canon decision worth writing
down, because it is the difference between a boss that ignores your build and one that
ignores your crowd control.

## Why deriving is the right answer

**Scaling comes for free and cannot desynchronize.** Everything that raised the hit — added
damage, the increased sum, the compounding multipliers, weapon quality, an affix rolled
three zones ago — raises the ailment by exactly the same factor. There is no second scaling
tree to balance and no possibility of a build that scales one channel far past the other.

**A generated modifier cannot escape build power.** If an affix could grant a flat ailment
figure, the ailment would be a channel the generator inflates independently of the offence
curve. Since ailment output is a function of hit output, the only levers the pool needs are
*chance to apply*, *duration*, and *ailment effect* — all of which are bounded and all of
which compose with the hit rather than beside it.

**One authority.** With a derived model, "how much damage does this ailment do" has a single
owning implementation: the hit pipeline plus one coefficient. A separate ailment damage
model is a second authority for a quantity that already has one, and its disagreement with
the first is invisible until an encounter is built on the wrong number.

## The basis decisions the canon must make once

The derivation is only unambiguous if the canon fixes its basis. Four questions, answered once,
globally:

1. **Pre- or post-mitigation?** Does the coefficient apply to the hit as composed, or to the
   damage that actually landed after the defender's layers? Post-mitigation makes ailments
   respect defence twice and makes them weak against resistant targets; pre-mitigation makes
   them a way through defence. Both are legitimate designs; having two answers in two places
   is not.
2. **What do the ticks pass through?** Whether an ailment tick is subject to avoidance,
   block, armour and resistance — or to none of them, or to resistance only — is a canon
   decision, not a per-skill one. The common design has ticks bypass the binary layers
   (nothing to evade) and respect the type resistance.
3. **How do multiple applications combine?** Declare **exactly one** of: *refresh* (reset
   the duration), *stack* (independent instances summed, with a maximum), or *highest* (only
   the strongest instance is active). Each produces a different build and a different worst
   case; the choice is canon because the generator's *chance to apply* and *duration* affixes
   are priced entirely by it. "Refresh and also stack a bit" is not a fourth option — it is
   two unstated options in a trench coat, and it will be implemented differently by whoever
   touches it next.
4. **What removes it?** Whether a cleanse ends the effect, and whether an entity can be
   immune to control ailments while remaining vulnerable to damaging ones, is one decision
   made once. Immunity granted ad hoc per encounter is how a whole build archetype silently
   stops working in the last third of the game.

Every one of these is a unit-and-basis statement. An ailment figure quoted without them is
not information, and two systems that quote it under different assumptions will agree in
testing and diverge in play.

## Procedure

1. **Compute the applying hit first, by type.** The ailment needs the typed breakdown of the
   composed hit, so the damage pipeline returns per-type figures, not only a total.
2. **Apply the ailment's chance roll after the hit resolves**, using the canon's chance
   sources; a hit that was avoided applies nothing.
3. **Multiply the matching-type portion by the coefficient**, divide by the duration, and
   store the resulting per-second figure *with its type* — the type is what the tick's
   mitigation path will read.
4. **Tick on a fixed cadence** and resolve each tick through the canon's ailment mitigation
   path, never through the full hit pipeline unless the canon says ticks are hits.
5. **Let duration and effect scale the stored figure, not the coefficient.** Modifiers that
   extend duration must state whether they extend total damage or dilute it; the canon
   answers that once, and it is the single most argued-about line in this whole area.

## Decision rules

- **When an ailment is meant to be a build's main damage source, raise the coefficient and
  the duration — never give it an independent scaling stat.** An "increased ailment damage"
  bucket that does not also raise hits is a second scaling tree in disguise.
- **When a skill deals no damage of the matching type, it applies no ailment of that type.**
  Do not special-case a floor value; a skill that should apply the ailment should deal the
  type.
- **When the ailment's chance is the tuning surface, cap it below certainty** for the same
  reason critical chance is capped: at guaranteed application, every modifier touching the
  chance goes inert and the affix pool loses a whole family of useful rolls.
- **When ailment throughput must be displayed, show it per second with the type and the
  duration.** A total figure hides whether it is front-loaded and makes two ailments with
  different durations look comparable when they are not.

## When not to use this

- **Do not derive when the ailment is a control effect rather than a damage effect.** A slow,
  a stun or a shock that only amplifies has no damage to derive; its magnitude is its own
  quantity with its own cap, and forcing it through a damage coefficient produces a number
  nobody can reason about.
- **Do not derive from the hit in a game whose damage-over-time is environmental.** A
  hazard that ticks on a floor has no applying hit; it is authored damage with its own
  stated basis.
- **Do not derive when the design explicitly wants a channel that ignores build power** —
  for example a fixed percentage-of-maximum-life drain used as a pressure mechanic. That is
  a deliberate exception, and it must be enumerated in the canon rather than emerging from
  an affix.
