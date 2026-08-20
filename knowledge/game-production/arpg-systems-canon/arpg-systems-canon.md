---
layer: golden-path
type: golden-path
subject: arpg-systems-canon
status: forged
use_when: [fixing systems law before content authoring, generating item or affix content at scale, resolving contradictory damage or defence numbers, reviewing a loot or power curve]
techniques:
  - added-increased-more-stacking
  - mitigation-order-and-soft-caps
  - rarity-is-an-affix-budget
  - ilvl-gated-affix-tiers
  - ailments-scale-off-the-hit
  - layered-defenses-and-the-ehp-floor
---

# ARPG systems canon

An action-RPG is a volume genre. It ships thousands of items, hundreds of modifiers,
dozens of skills and a monster roster that must all interact without anyone having read
every pair. That volume is only survivable if the *composition rules* are fixed before
the content exists. The canon is that small body of law: how damage is composed and
stacked, in what order a defender subtracts from it, what rarity actually buys, how item
level gates power, how a damage-over-time ailment derives from the hit that caused it,
and what floor the defensive layers must guarantee.

The naive reading is that balance is a tuning activity — author the content, then adjust
numbers until it feels right. That reading fails at scale for a structural reason: a
number is only tunable if it composes predictably with every other number, and whether it
composes predictably is decided by the stacking law, not by the number. Content authored
against an unfixed stacking law is not *undertuned*; it is *unresolvable*. Retrofitting a
bucket assignment onto four thousand existing modifiers is a rewrite of the content, not a
patch to the code.

So the canon is written first, it is short, and it is absolute. Every generated item,
every authored skill, every monster is a *consumer* of these rules.

## The four axes the canon must close

Everything below reduces to four questions. A genre-shaped project that answers all four
before authoring is generable; one that answers three is not.

1. **How does a bonus combine with other bonuses?** Answered by stacking buckets. Without
   it, "+20% damage" has no meaning — you cannot say what two of them are worth.
2. **How does a defender reduce an incoming number?** Answered by a single ordered
   mitigation pipeline with stated caps. Without it, defence values have no exchange rate
   and no offence number can be sized.
3. **Where does power come from on a dropped artifact?** Answered by two orthogonal axes:
   rarity buys *count*, item level buys *magnitude*. Collapsing them into one axis destroys
   the loot curve.
4. **What does a derived effect derive from?** Answered by deriving secondary damage from
   the primary hit, and by defining survivability as a measured floor across layers.

Under all four sits one scalar the canon should name explicitly: the **level of the
content**. It sets the monster's level one-to-one and the item level of everything that
drops there. Nothing else should be hand-tuned per area — tune the level and the area's
rolled modifiers, and let power derive.

## The damage spine

Damage is **typed** — a conventional set is physical, fire, cold, lightning, and a fifth
"chaos"-shaped type that leans toward damage over time and bypasses the physical
mitigation layer. A damage figure without its type and its bucket is not a figure.

Composition, per type, in order:

```
final = (base + added) x (1 + sum of increased) x product of (1 + each more)
```

Three buckets, three different jobs, and the difference between them is *governance*, not
arithmetic.

- **Added** is flat damage that joins the base before anything scales it. It is what makes
  a low-base weapon viable early and irrelevant late, because everything downstream
  multiplies it.
- **Increased** is the *content* bucket. All increased modifiers from every source sum into
  one figure and apply once. Two `+20% increased fire` are `x1.40`, never `x1.44`. That is
  what makes the bucket safe to mint by the thousand: the tenth grant is worth measurably
  less than the first, so a generator producing many small grants produces saturation, not
  an exponent.
- **More** is the *design* bucket. Each `more` is its own multiplier and they compound. Two
  sources of `50% more` are 2.25x, not 2x. This bucket is scarce, hand-placed, never
  generated, and each entry is capped in size — a working envelope is **no single `more`
  above +50%**, so that two stacking is a strong build and not a one-shot.

The practical rule: **generated content may write into `added` and `increased`; only an
author may write into `more`.** A generator with access to the compounding bucket is a
generator with access to the game's difficulty curve.

Two stages hang off the spine and are routinely forgotten:

- **Conversion.** A percentage of one damage type becoming another must resolve *before*
  the target type's increases apply, and total conversion may never exceed 100%. Conversion
  applied after scaling double-counts every modifier that touched both types.
- **Criticals.** Effective critical chance is the base chance scaled by its own increases
  and then hard-capped — 95% is the standard ceiling, because guaranteed criticals collapse
  the distinction between a normal and a critical hit and make the whole stat inert. The
  multiplier is conventionally 2.5x (a "+150%" bonus over the normal hit), and anything past
  roughly +250% is an outlier that must be documented as one. Expected throughput is
  `hit x (1 + chance x (multiplier - 1))`, and that expression — not the raw multiplier —
  is what a comparison screen must show.

## The defence spine

A defender applies layers **in a fixed order**, each consuming what the previous left:

```
avoidance (evasion) -> block -> armour (physical, soft-capped) -> resistance (hard-capped)
```

Order is not cosmetic. Avoidance and block are binary rolls that either delete the hit or
do nothing; armour and resistance are fractional reductions of whatever survived. The two
fractional layers also divide the work by type: **armour mitigates physical, resistance
mitigates the elemental and chaos types**, so they rarely both fire on one hit — but when a
hit carries mixed types, the order decides the answer and there is exactly one
implementation of it.

Their shapes differ deliberately:

- **Armour is soft-capped against the size of the incoming hit.** The canonical form is
  `armour / (armour + 5 x rawPhysicalHit)`. The consequence is the single most misquoted
  fact in the genre: **an armour rating has no mitigation percentage on its own.** It has
  one only against a stated reference hit. A tooltip, comparison screen or balance sheet
  that prints "34% reduction" from an armour value has invented a hit size and hidden it.
  Armour is strong against many small hits and weak against one large one — that is the
  design property, not a defect.
- **Resistance is a flat percentage against its damage type, hard-capped at 75%** (a rare
  max-resistance modifier may raise the ceiling to at most 90%). The cap is what keeps a
  damage type *permanently threatening*: the last quarter of every hit is untouchable, and
  no amount of stacking makes a type inert. Immunity silently deletes every encounter built
  around that type.

Two consequences of the cap define whole families of content. **Overcap is real and
valuable**: resistance above the cap does nothing today and insures against content that
*lowers* it — an area modifier in the band of −30% to −60% all resistances is the canonical
reason to overcap, and attackers answer with two distinct tools, *penetration* (ignore a
percentage of post-cap resistance for one hit) and *resistance reduction* (lower the value
itself, possibly negative, before the hit). And **the cap is asymmetric**: players are
hard-capped, monsters are uncapped and scale resistance with content level. Swapping that in
either direction breaks something immediately.

Accuracy answers evasion on a curve, not a subtraction — a form like
`accuracy / (accuracy + (evasion / 4) ^ 0.8)` with a floor around 5% — and it gates
**attacks only**. Spells and damage over time never miss, which is why the accuracy stat is
a build cost for some archetypes and free for others.

## The two orthogonal loot axes

A dropped artifact gets its power from two independent axes, and keeping them independent
is what makes a loot table generable.

- **Rarity buys affix count**, split across prefixes (numeric power) and suffixes (utility
  and conditional effects), on top of an *implicit* modifier that belongs to the base type
  and is not part of the budget. A plain item is base and implicit only; an enchanted one
  carries at most one prefix and one suffix; a rare one at most three and three. Above that
  sit hand-authored tiers: a curated set piece whose bonus unlocks with pieces equipped, and
  a legendary carrying at least one modifier that *changes a rule* rather than a number.
  Rarity spends one power budget across *more* affixes; it never buys a bigger number on
  one stat.
- **Item level gates affix tier.** Each affix family exists as a ladder of tiers with
  ascending value ranges, each tier carrying a minimum item level and a selection weight
  that falls as the tier rises. A low-level source *cannot* produce a top-tier roll
  regardless of luck, which is what preserves progression under an unbounded number of
  drops.

Behind both sits a rule that sounds like philosophy and is actually an engineering
constraint: **an affix IS a gameplay effect, never an inert tooltip string.** Every affix
resolves to a typed, granted effect naming a target attribute and a stacking bucket, with
the rolled value as its magnitude. If it cannot be executed by the damage or defence
pipeline, it is flavour text and must not occupy a slot. This is what turns the affix pool
into a closed, weighted, gated set — the only shape a generator can safely sample from.

## Derived damage derives

Ailments — ignition, bleeding, poison, and the control-shaped chill, shock and freeze — are
the genre's second channel, and the canon's answer is that they are **not an independent
one**. A damaging ailment's magnitude is a coefficient over the damage of the hit that
applied it, of the matching type, spread over a stated duration. Working envelopes: an
ignition around 90% of the fire hit over four seconds; a bleed around 70% of the physical
hit over five seconds; a poison stack around 20% of the hit over two seconds. Non-damaging
ailments scale off a different basis entirely — the hit's size **relative to the target's
life** — and are capped: a chill slows by at most 30%, a shock amplifies damage taken by at
most 50%, a freeze is threshold-gated and lasts at most a few seconds.

Two things fall out, and both are the reason to do it this way:

- **Ailments inherit all scaling for free.** Anything that raised the hit raises the
  ailment. There is no second scaling tree to balance.
- **A generated ailment modifier cannot escape build power.** An affix granting a flat
  ailment number would be a channel the generator could inflate independently of everything
  else. Deriving forecloses that.

Every ailment must also declare exactly one accumulation law — *refresh* the duration,
*stack* independent instances to a cap, or keep only the *highest* — because the price of
every "chance to apply" modifier in the pool is set entirely by that choice.

## Survivability is four layers and a measured floor

Defence is not the mitigation pipeline alone. It is four layers — **avoidance** (evasion,
block, the latter capped at 75% chance), **mitigation** (armour, resistances), **buffer** (a
life pool, or a rechargeable shield, or a per-hit ward; a build picks one primary), and
**recovery** (regeneration, leech, consumable bursts) — each capped or soft-capped precisely
so that no single one reaches the floor alone.

The floor itself is a measurement, not a stat threshold, and it is stated with all of its
bases: at content level L, the largest single non-boss hit deals **less than a third of the
effective health of a resistance-capped character** — no death in three hits without
counterplay. Boss slams may exceed it only behind a clear, dodgeable telegraph, and capped
resistances are the assumed baseline, not an achievement.

## The failure modes worth naming

**Two implementations of one quantity.** The most expensive failure in this domain is two
damage models — a simple legacy formula somewhere and the real pipeline somewhere else —
that agree on trivial inputs and diverge exactly where the answer matters. It is invisible
because both look correct in isolation. One quantity, one owning implementation; anything
retained for comparison is barred from producing a verdict.

**A percentage without its basis.** Discussed above for armour, but general: mitigation,
throughput, drop rate and ailment damage are all basis-dependent.

**Tuning before the buckets are decided**, producing numbers that are individually
reasonable and jointly explosive. **Rarity inflation** — letting rarity touch magnitude,
almost always introduced as a small "rare items roll slightly higher" concession.
**Avoidance counted as if it were mitigation**, when binary layers have a variance the floor
must not depend on. And **prose law drifting from executed law**: a rule written for humans
and a threshold typed into a validator diverge undetectably, which is why every rule here
carries its numbers — precise enough to be parsed by the checks that enforce them.

## Boundaries

Economy tuning — faucet and sink rates, currency-as-crafting, loot health alerts — consumes
these rules but is a separate concern; this canon fixes what an item *is*, not how many the
world should emit per hour. Moment-to-moment combat semantics — telegraph windows, hit
de-duplication, what counts as escapable — sit above the damage spine and are likewise
separate. Validating that these numbers produce a survivable difficulty curve is a
simulation concern, downstream of this document by construction: you cannot simulate a model
that has not been fixed.
