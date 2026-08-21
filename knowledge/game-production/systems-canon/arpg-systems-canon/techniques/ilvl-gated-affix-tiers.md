---
layer: technique
type: technique
subject: arpg-systems-canon
technique: ilvl-gated-affix-tiers
status: forged
laws: [a-number-carries-its-unit-and-basis, law-and-check-share-one-source]
shared_with: []
use_when: [building an affix tier ladder, sizing item power against character level, auditing a progression that flattens or spikes]
---

# Item-level-gated affix tiers

Magnitude on a dropped artifact comes from one axis and one only: the **item level** it
dropped at, which gates which **tier** of each affix may be rolled. Rarity buys slots; item
level buys the size of what goes in them.

The shape is a ladder per affix, conventionally numbered from the weakest tier upward:

| Tier | Min item level | Value range | Selection weight |
| --- | --- | --- | --- |
| T8 (lowest) | 1 | smallest | highest |
| … | ascending | ascending | descending |
| T1 (highest) | deep into the level range | largest | lowest |

A concrete, well-shaped ladder for a maximum-life prefix over a 1–100 item level range looks
like this, and the numbers are the point:

| Tier | Min item level | Value | Weight |
| --- | --- | --- | --- |
| T8 | 1 | +10–19 | 1000 |
| T6 | 18 | +30–39 | 700 |
| T4 | 36 | +50–59 | 400 |
| T2 | 60 | +80–89 | 200 |
| T1 | 80 | +100–119 | 80 |

Two shape constants generalise from it and are worth holding as defaults:

- **Within a tier, the spread is about 1.4x to 1.6x** from minimum to maximum roll. Wide
  enough that a roll feels variable; narrow enough that a tier still *means* something.
- **Between adjacent tiers, magnitude steps about 1.5x to 2x.** Smaller and the ladder is
  bookkeeping; larger and each unlock is a cliff that invalidates the gear before it.

Two monotonicities are canon and must be checked mechanically:

- **The minimum item level ascends with the tier.** This is the guarantee that a starting
  zone cannot produce a top-tier roll no matter how many artifacts drop. Progression
  survives an unbounded number of draws.
- **The value ranges ascend and do not invert.** Adjacent ranges may overlap slightly — a
  lucky roll on a lower tier beating an unlucky roll on the one above is a legitimate source
  of excitement — but the midpoints strictly increase and a lower tier's ceiling never
  exceeds the higher tier's ceiling.

Selection weight moves the opposite way. Higher tiers are rarer *within* their eligible
range, so reaching the level where a tier unlocks is a change in the shape of the
distribution, not an instant upgrade. That is what keeps a zone worth farming after the
first drop.

## Item level, character level, requirement

Three level-shaped numbers live here and are routinely confused. State each one's basis:

- **Item level** — the level of the source that produced the artifact, on a 1–100 scale.
  Gates tiers. It is *never self-assigned*: it equals the level of the area or monster that
  dropped it, which is what makes the content level the single master scalar for gear power.
  Never shown as a power number, because it is not one.
- **Required level** — what a character needs to equip it. Conventionally trails item level
  by five to fifteen levels, so a fresh drop is usable now and stays usable for a stretch.
  Hand-authored items may pin a fixed requirement instead.
- **Character level** — what the player has. It never gates tiers; only the source's level
  does. Coupling tier rolls to character level makes every drop scale with the player and
  quietly deletes the reason to progress through zones.

A base artifact's own numbers scale with item level too, and that scaling is separate from
affixes: an attack-shaped base derives its throughput as
`((minimum damage + maximum damage) / 2) x attacks per second`, with the attack rate held
inside a narrow band — roughly 1.0 to 1.8, fast one-handers at the top, slow two-handers at
the bottom — and a base critical chance around 5% to 6.5% by weapon class. The band is what
makes two artifacts of the same class at the same level comparable before affixes are
considered. Publish both the formula and the band; a throughput figure without the rate it
assumed is not a figure.

## Procedure

1. **Author the ladder as data, one row per tier**, carrying: minimum item level, value
   range, weight. This table is the power curve of the game written down. It is not a
   constant embedded in a sampling function.
2. **Filter, then weight.** Given an item level, take the eligible tiers, then sample among
   them by weight. Do not pick a tier by level bucket and then look up a range — that
   collapses the distribution to a single tier per level and removes the excitement of an
   early high roll.
3. **Derive required level from item level by the canon band**, in one place. Every artifact
   in the game inherits the relationship; a per-item override is a defect.
4. **Check the monotonicities in the build, from the same table the sampler reads.** A rule
   stated in a design document and a threshold typed separately into a validator will drift,
   and the drift is undetectable from either side. The checker reads the ladder; a ladder it
   cannot parse is a loud failure, never a silent fallback to a default.
5. **Publish the ladder to whoever authors content.** An author — human or machine — who can
   see the tier they are writing into, and the range that tier permits, produces numbers
   inside the curve. One who cannot produces numbers that have to be corrected later.

## Decision rules

- **When a tier's unlock level is chosen, choose it against the level of the content that
  drops it**, not against the level a player "should" be. The two diverge, and the content's
  level is the one the sampler actually sees.
- **When the top tier feels unreachable, lower its unlock level or raise its weight — do not
  widen its range.** Range is the promise of what the tier means; availability is the
  tuning surface.
- **When adding an affix to the pool, author the full ladder at once.** A single-tier affix
  is either always available or never worth rolling, and both make it noise.
- **When two ladders must relate (an offensive affix and its defensive counterpart), tie
  them at the unlock levels, not at the values.** Values live in different units and any
  equivalence between them is an assumption that will not survive tuning.

## When not to use this

- **Do not gate by item level in a game with no zone-level progression.** If content does
  not carry a level, the gate has nothing to read and the honest design is a flat pool with
  weights.
- **Do not use a deep ladder for an affix with a narrow useful range.** An affix whose
  weakest and strongest useful values differ by less than the roll variance inside one tier
  should have one or two tiers, not eight; more tiers there is bookkeeping without a
  perceivable difference.
- **Do not gate a mechanically distinct effect behind a tier.** Tiers are magnitude. An
  affix that changes *what happens* rather than *how much* is a different affix, gated by
  rarity or by hand-authored placement.
