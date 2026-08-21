---
layer: technique
type: technique
subject: arpg-systems-canon
technique: added-increased-more-stacking
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [assigning a stacking bucket to a new modifier, auditing a runaway damage build, writing the damage composition kernel]
---

# Added, increased, more — the three stacking buckets

Every bonus in the game belongs to exactly one of three buckets, and the bucket is part of
the bonus's identity in the same way its unit is. A modifier recorded as "+20% damage" with
no bucket is not underspecified — it is meaningless, because you cannot say what two of
them are worth.

The composition runs **per damage type**, in order:

```
final = (base + added) x (1 + sum of all increased) x product over sources of (1 + more_i)
```

- **added** — flat magnitude that joins the base before any scaling. Summed.
- **increased** (and its negative twin, *reduced*) — all sources sum into one figure, and
  that single figure is applied once.
- **more** (and *less*) — each source is its own multiplier; they compound.

## Why the split exists

The split is a governance mechanism disguised as arithmetic.

**The increased bucket saturates.** Because every source lands in one sum applied once, the
marginal value of the Nth grant is `1/(1 + S)` of the first, where S is the sum already
present. A character at `+300% increased` gains 2.5% of their damage from another `+10%`;
the same grant on a fresh character gains 10%. That decay is what makes the bucket safe to
mint by the thousand. A generator can hand out small increased modifiers on every artifact
in the game and the top of the curve stays finite.

**The more bucket compounds.** Two sources of `50% more` are 2.25x, three are 3.375x. Value
does not decay; it accelerates. Every historically famous broken build in the genre is a
`more` chain someone could assemble by accident.

So the operating rule is a permissions rule, with a size envelope attached:

> **Generated content writes to `added` and `increased`. Only a human author writes to
> `more`, every `more` in the game is enumerable on one page, and no single `more` exceeds
> +50%.**

The +50% ceiling is what makes the compounding bucket survivable: two of them stacking is
`x2.25`, a strong build; without a ceiling, two of them is whatever the two largest values
in the game happen to multiply to, which nobody has checked. If the affix pool contains a
compounding modifier at all, the generator owns the difficulty curve.

## Conversion is a stage, and it sits in a specific place

Where a design lets a percentage of one damage type become another, that conversion
resolves **before the target type's increases apply**, and total conversion may never exceed
100%. Ordering it after scaling means every modifier that touched the source type and every
modifier that touches the destination type both apply to the same magnitude — a silent
double-count that grows with build power and is therefore invisible in early testing. Where
several conversion sources exist, fix their order too (skill-granted conversion before
equipment-granted conversion is the common choice); like the bucket order itself, any
consistent answer works and two answers do not.

## Procedure

1. **Declare the bucket at the modifier's definition site, never at its application site.**
   The bucket travels with the modifier through serialization, tooltips and comparison
   screens. A pipeline that infers the bucket from the wording of a description string will
   eventually infer it wrong, silently.
2. **Compose in one implementation.** One function takes base, the set of applicable
   modifiers and the damage type, and returns the composed figure. Comparison screens,
   simulators, encounter previews and the live combat loop all call it. Two implementations
   of this expression is the domain's canonical expensive bug: they agree on the simple
   inputs anyone tests with and diverge exactly on the stacked inputs that decide balance.
3. **Sum within bucket before crossing buckets.** Collect all `added`, then all `increased`,
   then fold the `more` product. Interleaving is how partial sums leak into the wrong
   multiplier.
4. **Apply criticals as a separate stage on the composed hit.** Chance and multiplier are
   their own quantities. Effective chance is `base chance x (1 + increased critical chance)`
   — note that the *critical chance* modifier is itself an increased-bucket modifier over a
   small base (weapon classes typically sit at 5%–6.5%), which is why those affixes read as
   large percentages and grant small absolute gains. The result is hard-capped at 95%, and
   the multiplier is conventionally 2.5x with anything past roughly +250% treated as a
   documented outlier. Guaranteed criticals are barred deliberately — at 100% the distinction
   between a hit and a critical hit vanishes and every modifier touching either stat goes
   inert.
5. **Report expected throughput, not the raw multiplier.** The number a player compares two
   weapons with is `hit x (1 + chance x (multiplier - 1))`. Publishing the multiplier alone
   invites the player to do the composition themselves, badly.

## Decision rules

- **When a designer asks for a modifier that must feel powerful, do not reach for `more`.**
  Reach for a larger `increased` first and measure it against the character's expected sum
  at the level it drops. `more` is for modifiers that are meant to define a build, are few,
  and are reviewed as a set.
- **When two modifiers describe the same quantity through different words, they share a
  bucket and a target.** "Increased physical damage" and "increased damage" that both reach
  physical damage sum together. Discovering late that two spellings were kept in separate
  sums is a balance failure, not a text failure.
- **When a modifier's magnitude is a flat number in the same unit as the base, it is
  `added`** — even if it is written as a percentage of something else. Percent-of-base
  conversions resolve to added magnitude before composition, never after.
- **When the composed result must be shown to a player, show the basis.** The same modifier
  set produces different figures against different bases and different damage types; a
  displayed figure names the weapon, the skill and the type it was computed for.

## When not to use this

- **Do not impose three buckets on quantities that are not damage-shaped.** Movement speed,
  cooldown, area of effect and resource cost each need a stacking law, but "increased" for
  a cooldown reduction that stacks additively toward a floor is a different mechanism with
  a different cap. Copying the damage buckets wholesale onto every stat produces caps
  nobody chose.
- **Do not use a `more` bucket at all in a project with no hand-authored build-defining
  layer.** If every modifier in the game is generated, two buckets are the honest design,
  and the third is an unexploded shell.
- **Do not add a fourth bucket to fix a tuning problem.** A new multiplier stage is a change
  to the composition law and therefore to the meaning of every modifier already authored.
  The correct fix is almost always a cap or a coefficient inside an existing bucket.
