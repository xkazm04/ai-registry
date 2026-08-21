---
layer: technique
type: technique
subject: arpg-systems-canon
technique: layered-defenses-and-the-ehp-floor
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [setting a survivability requirement per level, judging whether a defence build is viable, deciding what avoidance is allowed to count for]
---

# Layered defences and the effective-health floor

Survivability is not a stat threshold. It is **four layers and a measured floor**.

The four layers, and the reason each exists separately:

| Layer | What it holds | Shape |
| --- | --- | --- |
| **Avoidance** | evasion, block | binary rolls; block chance capped at 75% |
| **Mitigation** | armour, per-type resistance | fractional; armour soft-capped, resistance hard-capped |
| **Buffer** | a life pool, a rechargeable shield, or a per-hit ward | the thing that actually absorbs — a build picks **one** primary |
| **Recovery** | regeneration, leech, consumable bursts | refills the buffer between hits |

The buffer choices are not interchangeable and their differences are the design: a life pool
is steady, a rechargeable shield is a large burst buffer that returns only after a lull out
of damage, and a per-hit ward resets quickly — excellent against many small hits, useless
against a sustained damage-over-time. Recovery sits in its own layer because a defence that
cannot refill is a defence that loses every long fight; a regeneration-shaped build sits
around 2–8% of the life pool per second, and leech is rate-capped rather than instantaneous.

The floor is stated as a sentence with all of its bases present:

> At content level L, the largest single non-boss hit deals less than a third of the
> effective health of a defender meeting the equipment expectation for L, with resistances
> at their cap.

That is a three-hit floor: no death in three hits without counterplay. Three is the tight
end; four to six is comfortable for a genre where the player is expected to see the danger
and act. Below two the game is a coin flip; above ten, hits stop mattering and the encounter
design loses its main verb. A boss slam may exceed the floor **only** behind a clear,
dodgeable telegraph — the exception is bought with legibility, not with a balance argument.

Note what the floor assumes: **capped resistances are the baseline, not an achievement.** A
character below the resistance cap is a failed build, not a data point the floor should be
lowered for. Stating that explicitly is what stops the floor drifting downward over a
project's life.

## Effective health, and why it needs its basis

```
effective health = life pool / (1 - total fractional mitigation against H, T)
```

Every term in that expression is basis-dependent. The mitigation is computed against a
*stated* reference hit, because the armour layer is soft-capped against hit size and has no
percentage of its own. Change H and the same character has a different effective health. So
the floor is always published as a triple — level, reference hit, damage type — and a bare
effective-health number on a character sheet is a number without its basis.

The reference hit itself is canon: one figure per character level, derived from what the
level-appropriate content actually throws. It is the anchor that makes every defensive
comparison in the game commensurable.

## Avoidance does not count at face value

Evasion and block are binary rolls. They have an expected value and they have variance, and
the floor is a statement about the worst realistic case, not the average one.

- A defender with 50% avoidance takes two hits in a row roughly a quarter of the time. Over
  a fight that is not rare; it is routine.
- A floor met by expected avoidance therefore fails several times per session, and players
  experience that — correctly — as the game cheating, because their defence sheet promised a
  number the game did not honour.

There are two honest responses, and a project should pick both. The first is
**entropy-smoothing the roll**, so the displayed avoid percentage is the real long-run rate
and a streak of consecutive unlucky rolls is structurally impossible rather than merely
unlikely. The second is the floor rule itself: **the deterministic layers must meet the floor
on their own.** Avoidance is headroom above the floor, priced separately and shown
separately. Where an avoidance-heavy
build is a design goal, it must be given a deterministic component — a recovery mechanism, a
guaranteed reduction, a shield — to carry the floor, and the floor is then measured with
avoidance set to zero.

The same asymmetry governs how the measurement is reported: a survivability check that was
not run is *not measured*, never a neutral pass. A build with no floor evaluation and a
build that cleared the floor are different states and must render as different values.

## Procedure

1. **Publish the reference hit table** — one hit size and type per character level, derived
   from live content, not invented.
2. **Publish the equipment expectation per level** — the life pool and layer values a
   defender is expected to have. Without it the floor is untestable, because "reasonably
   equipped" is doing all the work.
3. **Compute effective health through the one mitigation pipeline**, with avoidance zeroed,
   against the reference hit for the level.
4. **Compare to N x H(L).** Record the result *and* the inputs it was computed from; a
   verdict is bound to the content it judged, and it becomes evidence about the past the
   moment the numbers change.
5. **Report per-layer contribution.** A build that clears the floor entirely on one layer
   has not passed the design intent even if it passed the arithmetic — see the sufficiency
   rule below.
6. **Re-run on every canon change.** A change to the armour coefficient, the resistance cap
   or the reference table re-prices every character in the game at once.

## Decision rules

- **When one layer alone can reach the floor, the layer is under-capped.** Every layer needs
  a cap or a soft cap that makes stacking it exclusively hit diminishing returns before the
  floor is met. That is the mechanism that forces layering; exhortation is not.
- **When a resistance cap is chosen, remember it fixes the maximum effective-health multiple
  from that layer.** A 75% ceiling means resistance alone can at most quadruple effective
  health against its type; the remaining floor must come from elsewhere.
- **When the floor cannot be met at some level with the expected equipment, the content is
  wrong, not the player.** Either the reference hit at that level is too large or the
  equipment expectation is unreachable from the drop tables.
- **When a defensive affix is added to the pool, price it in effective health at the level
  it drops**, not in its own unit. A flat armour roll and a resistance roll are not
  comparable in their own units and any intuition that they are is wrong.

## When not to use this

- **Do not treat the floor as a ceiling or a target.** It is a minimum viable survivability,
  not a balance point; builds that far exceed it are a separate question about power range.
- **Do not use a single-type floor for a game with meaningful damage-type variety.** If
  content routinely mixes types, the floor is stated per type and the weakest one is the one
  that matters.
- **Do not let the floor stand as proof the game is survivable.** It is an arithmetic
  statement about one reference hit; it says nothing about hit density, telegraph timing,
  recovery rates or whether the player can act inside the window. Those need behavioural
  evidence, and the arithmetic floor is necessary and never sufficient.
