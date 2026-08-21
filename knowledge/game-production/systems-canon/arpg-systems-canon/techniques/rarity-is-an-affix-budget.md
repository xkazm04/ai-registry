---
layer: technique
type: technique
subject: arpg-systems-canon
technique: rarity-is-an-affix-budget
status: forged
laws: [a-budget-shapes-the-output, compiling-is-not-wiring]
shared_with: []
use_when: [defining rarity tiers for droppable items, generating item affixes at scale, reviewing a loot curve that runs away]
---

# Rarity is an affix budget

Rarity buys **how many** modifiers an artifact carries. It never buys **how large** they
are. That is the whole rule, and almost every loot curve that runs away breaks it in the
same small, reasonable-sounding way: "rare items should roll a bit higher."

The budget is a table, and it is short. It counts **explicit** affixes only — the base type
also carries one **implicit** modifier that expresses its identity (a fire-flavoured ring
implies fire resistance) and that implicit is never part of the budget:

| Rarity | Explicit budget | Identity | Who authors it |
| --- | --- | --- | --- |
| Plain | 0 | the clean base type | generator |
| Enchanted | ≤1 prefix + ≤1 suffix | focused, predictable | generator |
| Rare | ≤3 prefix + ≤3 suffix | the build-defining roll | generator |
| Set | fixed mods + a bonus that unlocks by pieces equipped | curated synergy | a person |
| Legendary | fixed mods, ≥1 of which *changes a rule* | a mechanic, not a stat-stick | a person |

Two structural details in that table do real work.

**The budget is split into prefixes and suffixes.** Prefixes carry numeric power (added
damage, increased armour, maximum life); suffixes carry utility and conditional effects
(resistances, attributes, speed). Splitting the budget forces every rare roll to be a mix of
power and utility rather than six copies of one axis, and it gives the generator a cheap,
legible constraint that survives a growing pool.

**The top two tiers leave the generator.** A set piece is a curated synergy across several
items; a legendary must carry at least one modifier that changes how a rule works rather
than how large a number is. Both are design statements, and generating them re-introduces
the magnitude axis through the back door.

Magnitude comes from a completely different axis — the item's level, gating which tier of
each affix may appear. Keeping the two axes orthogonal is what makes the loot table
generable at all: count and magnitude can each be tuned without re-deriving the other.

## Why the budget is the right primitive

A budget handed to a generator is an instruction about the intended size of the thing, not
merely a ceiling it must stay under. Told "up to six", a generator spends six. So the
budget is stated per rarity class as the intended shape of that class, and the output is
graded against what was requested — an enchanted item that came back with four modifiers is
a defect even though four is under the rare ceiling.

The sharpest form of the rule is that **total item power is roughly constant across
rarities at a given level**: a project with a per-tier power target holds that target for a
rare and for an enchanted item alike, and rarity decides how many affixes that same budget
is spread across. A rare is not a stronger item so much as a *broader* one — six moderate
lines instead of two, which is what makes it build-defining rather than merely bigger. Once
that framing is in place, "rare rolls higher" is visibly a violation, not a nuance.

The orthogonality argument is the stronger one. With count and magnitude independent, the
power of a drop is roughly `count x tier-value(item level)`. Let rarity also lift magnitude
and the two multiply: the top of the curve grows quadratically in luck, a single fortunate
drop at any level obsoletes the progression that was supposed to follow it, and the only
remaining lever is lowering drop rates — which trades a broken curve for a boring one.

## An affix is a gameplay effect, not a tooltip string

The budget only means something if every slot it buys is *live*. The load-bearing rule
underneath rarity is:

> **An affix IS a gameplay effect. It is never an inert description.**

Concretely, every affix in the pool resolves to a typed modifier that names:

- the quantity it targets,
- its stacking bucket,
- its value range per tier,
- the minimum rarity that may carry it,
- its selection weight.

If it cannot be executed by the damage or defence pipeline, it is flavour text and must not
occupy a slot. An artifact whose modifiers parse, serialize and display but reach no
pipeline is not finished content — it is content that survived its own validator. The check
that matters is not "does the affix exist" but "does something read it at resolution time".

This is also what turns the pool into a shape a generator can sample: a closed, weighted set
with gates, rather than an open vocabulary of sentences.

## Procedure

1. **Enumerate the affix pool as data**, with weight, target quantity, bucket, tier ranges,
   and a minimum-rarity gate. A pool of a dozen to a couple of dozen well-chosen affixes
   produces more legible variety than a hundred near-duplicates.
2. **Roll count first, from the rarity's budget.** Then sample that many distinct affixes by
   weight, filtered by the item's rarity gate, its category, and its item level.
3. **Enforce distinctness by affix family, not by affix identifier.** Every affix declares a
   family — "life", "fire-resist", "attack-speed" — and one family may occupy at most one
   slot on an item. Two differently named affixes that both add the same quantity in the
   same bucket are one modifier wearing two hats, and rolling both is how an artifact
   quietly doubles a stat. The family field is also what a deterministic crafting bench
   needs later, to know which slot a chosen modifier would block.
4. **Gate the pool by base type and slot as well as by rarity.** A wand may roll spell
   modifiers a sword may not; boots roll movement speed and weapons do not. This gate is
   what makes each equipment slot feel like a different decision rather than a different
   place to put the same six affixes, and it costs one field.
5. **Gate rare-only affixes with a minimum rarity.** The most defining modifiers should be
   unreachable at lower rarities — that is what makes a rare drop feel categorically
   different rather than numerically larger.
6. **Grade the produced artifact against the budget it was given**, not only against the
   class ceiling. Under-spend and over-spend are both defects.
7. **Keep legendaries outside the generator.** A hand-authored item is a design statement
   with a fixed modifier set; letting the generator produce them re-introduces the magnitude
   axis through the back door.

## Decision rules

- **When a rarity feels underwhelming, add a slot or open a gate — never widen a value
  range.** Widening the range at one rarity re-prices that affix everywhere it can drop.
- **When two affixes at different rarities are meant to feel like a progression, they are
  one affix with two tiers**, gated by item level, not two affixes gated by rarity.
- **When an affix is desirable on every item type, its weight is wrong.** Selection weight
  is the tuning surface for desirability; magnitude is not.
- **When a modifier cannot be expressed as a typed effect, cut it.** A description-only
  property belongs in the artifact's flavour, outside the affix budget.

## When not to use this

- **Do not use a count-based budget for a game whose items carry one meaningful stat.** In a
  single-stat economy the count axis has nowhere to go and the honest design is a pure
  magnitude curve with an explicit ceiling.
- **Do not apply the budget to crafted or player-modified artifacts without deciding the
  crafting law first.** Crafting that adds slots is a change to the rarity budget and must
  be reasoned about as one, not as a feature bolted beside it.
- **Do not let a "quality" or "upgrade level" multiplier sit outside the budget.** A global
  multiplier on all affixes is the magnitude axis returning under a different name; if the
  project needs one, it belongs in the item-level tier ladder where it is gated.
