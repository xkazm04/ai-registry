---
layer: application
type: application
subject: arpg-systems-canon
technique: rarity-is-an-affix-budget
stack: process
status: forged
verified_on: 2026-08-20
---

# The canon as authored doctrine: long form, short form, and the prompt that reads it

PoF (`C:\Users\kazda\kiro\pof`) generates game content through an LLM catalog pipeline, and
its answer to "how do thousands of generated items stay mutually consistent" is a
**two-representation canon**: a long-form doctrine document a human reads, and a short-form
rule set injected into every generation prompt.

## The two representations

**Long form** — `docs/catalog/ARPG-LAWS.md`, 253 lines across twelve sections. Each section
has a fixed internal shape: *(a) Rule / intent · (b) Data shape · (c) Balance envelopes ·
(d) Catalog + engine mapping*. That template is what makes the document usable by a
generator rather than merely readable: (a) is the reason, (b) is the schema, (c) is the
number band, (d) is the wiring.

§1 states the rarity budget in its strongest form:

> higher rarity = more affixes, not bigger raw numbers on the same affix. Rarity is a
> budget tier, not a quality multiplier on a single stat.

and pins it to a project-wide power target: *"Total item power still targets the tier ≈100
(±10%) envelope — rarity spends that budget across more affixes, not a larger sum."* That
sentence is where the technique's "total power is roughly constant across rarities" claim
comes from; it is stronger than the usual formulation because it names the invariant that
makes the orthogonality checkable.

**Short form** — `src/lib/catalog/canon/canon-seed.ts:40-59`, twenty ARPG rules as typed
records with `id`, `category`, `scope`, `title`, `body`, `refs`. The rarity rule
(`canon-seed.ts:40`) compresses §1 to two sentences:

```
arpg-item-rarity — 'Normal = base+implicit only; Magic = ≤1 prefix + ≤1 suffix;
Rare = ≤3 prefix + ≤3 suffix; Set/Unique carry fixed mods (Unique has ≥1 rule-changing
mod). Higher rarity spends the tier-≈100 power budget across MORE affixes, never as a
bigger number on one stat.'
```

The `refs: ['docs/catalog/ARPG-LAWS.md#1']` field is the link back to the long form. The
`scope: 'items'` field is what selects which rules are injected into which pipeline's
prompt — a generator producing a monster never sees the affix rules, which keeps the prompt
budget on rules that can actually be violated by the artifact at hand.

## The load-bearing companion rule

`canon-seed.ts:43` carries `arpg-affix-is-ge` in `category: 'project'` rather than `'game'`
— it is a wiring law, not a balance law:

> Each explicit affix maps to a `GE_` (e.g. `GE_Affix_AddedFireDamage`) applied while
> equipped, modifying a `UARPGAttributeSet` attribute or granting a `Stat.`/`Keyword.` tag —
> never an inert tooltip string. The rolled value is the GE magnitude.

That is the rule that makes the affix budget mean something: a slot the budget bought must
resolve to a granted effect naming a real attribute. §12 of the long form generalizes it
into the **no-gray-box rule** — an artifact that compiles but is never granted or activated
is not config-complete — and into a four-field declaration contract every generated artifact
must fill: *Granted by · Activated by · Dependencies · Verification*.

## Where the pipeline consumes it

`src/lib/catalog/pipelines/items.ts:21-38` restates the contract in the pipeline header
("Rare = ≤3 prefix + ≤3 suffix rolled from ilvl-gated tier pools"; "Affixes are NOT tooltip
strings (canon `arpg-affix-is-ge`)"), and the prompt-side tier tables at
`items.ts:200-290` show the budget and the tier ladder used together: each family carries a
`slot: 'prefix'|'suffix'`, a `group` for family-blocking (`group: 'life'`), the effect
identifier it realizes to, the attribute it moves, and its tier rows. The `group` field is
exactly the "distinctness by family, not identifier" rule made mechanical.

## A live deviation worth reading

`src/lib/economy/item-economy-engine.ts` — the Monte-Carlo economy simulator — does **not**
implement the canon. Its `AFFIX_COUNT_RANGES` (`:13`) gives `epic: [4,5]` and
`legendary: [5,6]`, generating the two rarities the canon reserves for hand authoring; its
`AFFIX_POOL` (`:31`) has no prefix/suffix split, no `group`, and no `ilvlReq` — magnitude
comes instead from a smooth `base * (1 + 0.1 * itemLevel)` at `:172`, a continuous
multiplier rather than a gated tier ladder.

The standard does not move for that. It is a simulator with a different job — projecting
loot distribution and economy health, not authoring shippable items — and it predates the
canon. But it is worth naming as the shape of the failure the technique warns about: with a
continuous item-level multiplier and no tier gates, a level-1 source and a level-25 source
sample the same affix rows and differ only by a 3.5x scalar, so the progression is a smooth
ramp with no unlock moments and no guarantee that an early drop cannot roll a late-game
value. That is the loot curve the tier ladder exists to prevent.
