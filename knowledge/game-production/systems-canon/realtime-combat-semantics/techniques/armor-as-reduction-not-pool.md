---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: armor-as-reduction-not-pool
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [adding armor or a defensive stat to a vehicular combat roster, a defensive upgrade makes cars feel unkillable or invisible, deciding whether protection is a multiplier or an extra bar]
---

# Armor reduces the hit; it is never a second health bar

## The concern

A defensive stat can be built two ways. As a **reduction**, it scales every incoming hit
by a factor below one before the hit touches health. As a **pool**, it is a second store
of points that incoming damage drains first, and that can be refilled, shown, exhausted
and destroyed on its own. On a design sheet they look interchangeable ("more armor, more
survivability"), and they behave differently in every way that matters in real time.

For a combat race the reduction is the right default, and the reason is the subject's own
law: a car has one health, written in one place. A pool is a second quantity with its own
writers, its own clamping, its own awkward edge (armor gone, health still up) and its own
drain order. Each is a new place for the single-authority rule to break. A reduction adds
no quantity; it is a multiplier applied inside the one function that already owns health.

## What a reduction guarantees

- **One bar, one death condition.** The interface shows one value and the wreck happens
  when it reaches zero. A player never asks which bar a weapon hit.
- **A defence that scales with every weapon at once.** The hit is multiplied, so a rapid
  gun, a heavy shot and a hazard are all reduced by the same factor. A pool can be
  bypassed by one weapon and drained faster by another, and the counter-matrix quietly
  acquires an armor-piercing and an armor-eating entry nobody designed.
- **No empty state for a stat.** A pool that empties has to be handled: refill, break,
  show. A reduction has nothing to empty and nothing to forget.
- **Linear effective health.** With a constant factor, effective health is health divided
  by one minus the factor, and every armor point adds the same slice. That is easy to
  explain to a player, easy to balance, and the property a full-health floor check relies
  on, because the weakest and strongest cars sit on a known line.

## Procedure

1. **Apply the reduction inside the single damage entry point,** once, after the raw hit
   is known and before health changes. The hit is in health points and the factor is a
   unitless fraction; write both.
2. **Clamp the result at the remaining health,** so the figure credited to the attacker
   and the figure debited from the target are the same number. Crediting the raw hit while
   debiting the reduced one makes every statistic lie.
3. **Cap the reduction by construction.** The factor comes from a stat range with a hard
   maximum, so the best-armored car still takes a meaningful fraction of every hit. A
   factor that can reach one makes a car immune and collapses the matrix.
4. **State the effective-health arithmetic with its reference hit,** even when the
   reduction is flat and the reference hit does not change the answer; a reader should
   not have to discover that it is flat.
5. **Test the formula with exact expected numbers,** one armored and one unarmored case,
   so a later edit that turns the multiplier into a subtraction fails loudly.
6. **Give the defence a visible consumer.** Armor that changes nothing a player can see in
   a fight is not a choice. How long armored cars last should be readable in play.

## Decision rules

- **When a design wants a shield or repairable layer, make it a separate, named feature
  with its own rules.** Do not let the stat slide into a pool because one weapon wanted a
  satisfying break animation.
- **When a weapon is meant to counter armor, give it a different axis, not a bypass.**
  With a flat factor, armor helps equally against every weapon; the counter is range,
  telegraph, position or a specific car trait, and the matrix should say which.
- **When armor and a start-of-match protection interact,** protection comes first: no
  hit is applied, so no reduction is computed and no statistic is credited.
- **When someone proposes subtracting a fixed number from every hit, reject it for a
  stream weapon.** Small hits fall to zero and the rapid gun becomes inert against armor,
  which is a hidden immunity.
- **When repair exists, it writes through the same authority as damage** and cannot
  exceed maximum health. It is not a pool's refill under another name.

## When not to use it

- **Do not apply this where locational damage is the identity of the game,** and armor is
  a per-panel store the player manages. There the pool is the feature, and the discipline
  is to give it a single owner exactly as this technique gives health one.
- **Do not use a reduction where a stat must block one specific weapon.** That is a
  counter and belongs in the weapon matrix as an explicit row, not smuggled in as a number
  on the car.
- **Do not call the roster balanced because the defence is simple.** Linear is easy to
  reason about; only simulated matches, and later people, say whether it is fair.
