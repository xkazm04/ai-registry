---
layer: technique
type: technique
subject: arpg-systems-canon
technique: mitigation-order-and-soft-caps
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [defining how a defender reduces an incoming hit, displaying a mitigation percentage, reconciling two defence implementations]
---

# Mitigation order and soft caps

A defender does not have "defence". A defender has an ordered pipeline of layers, each
consuming what the previous layer left, each with its own shape and its own cap. The order
is canon, there is exactly one implementation of it, and the numbers it produces do not
exist outside the context they were computed in.

The canonical order:

```
raw hit
  -> avoidance (evasion): binary roll, hit deleted or unchanged
  -> block:               binary roll, hit deleted or reduced (chance capped at 75%)
  -> armour:              fractional, soft-capped against hit size — PHYSICAL only
  -> resistance:          fractional, hard-capped per type — elemental and chaos
  -> final damage
```

The two fractional layers divide the work by damage type: armour answers physical, per-type
resistance answers everything else. A hit carrying mixed types therefore runs both, on
different portions — which is exactly why the pipeline must be typed end to end and why a
"total damage" figure entering it is already a lost cause.

## Why the order is load-bearing

The two binary layers must run first because they either resolve the hit to zero or leave it
untouched; running a fractional reduction before a roll that may delete the hit wastes the
computation and, worse, makes any intermediate figure meaningless to display.

The two fractional layers do not commute in effect even though multiplication commutes,
because **armour's reduction is a function of the hit size it sees**. Put resistance first
and armour sees a smaller hit, which — under a soft cap of the form
`armour / (armour + k x hit)` — means armour mitigates a *larger fraction*. The final
number differs. Whichever order is chosen is fine; having two answers is not.

Evasion also differs from block in a way worth designing for: the honest implementation is
**entropy-smoothed**, so that the displayed avoid percentage is the real long-run rate and
long unlucky streaks are structurally impossible rather than merely improbable. An
independent roll per hit produces a defence that is correct on average and routinely
catastrophic in the moment, and players read that — correctly — as a broken promise.

## The soft cap, and what it costs you

The standard armour form is:

```
reduction = armour / (armour + k x rawHit)      with k around 5
```

This gives armour a property the design wants: it is strong against a stream of small hits
and weak against a single large one, so it cannot be the only defence a character has. It
also has a consequence teams keep re-learning:

> **A mitigation percentage does not exist for an armour rating alone.** It exists only for
> an armour rating *and a stated reference hit*.

Every tooltip, comparison screen, balance spreadsheet and generated item description that
prints "34% reduction" from an armour value has invented a hit size and hidden it. The
correct surfaces are: publish the rating and the curve; or publish a percentage explicitly
labelled against a named reference hit for the character's level; never a bare percentage.
This is the same discipline as never handing a quantity across a boundary without its unit.

Resistance is the opposite shape on purpose: a flat percentage of its damage type, hard
capped (75% is the standard ceiling; a rare max-resistance modifier may raise it to at most
90%). The cap is not a balance convenience — it is what keeps every damage type
*permanently threatening*. With a hard cap at 75%, the last quarter of every elemental hit
is untouchable, and no amount of stacking makes a type inert. Immunity silently deletes
every encounter designed around that type, and the deletion is invisible until someone
notices a whole content area is trivial.

## What the cap makes possible: overcap, penetration, reduction

The hard cap turns three otherwise-similar mechanics into three distinct design levers, and
a canon that conflates them loses all three.

- **Overcap** — resistance above the ceiling. It does nothing today and buys insurance
  against content that *lowers* resistance. This is why an encounter modifier in the band of
  −30% to −60% all resistances is such a productive piece of content design: it converts a
  dead stat above the cap into a live decision, and gives high-level areas a difficulty lever
  that costs no monster tuning at all.
- **Penetration** — the attacker ignores a stated percentage of the target's *post-cap*
  resistance for that hit. It bypasses; it does not invert. A target at the cap facing 20%
  penetration mitigates as if at 55% for that hit only.
- **Resistance reduction** — a curse or exposure that lowers the target's resistance
  *value*, applied before the hit and able to drive it negative (a negative resistance
  amplifies the hit). It stacks with penetration and it is visible on the target.

The pipeline must also honour an **asymmetry between player and monster**: the cap is a
player-side rule. Monsters are conventionally uncapped and scale resistance with the content
level, some carrying themed high resistances or immunities. Giving a monster a player-style
cap flattens every themed pack; giving a player a monster-style uncapped resistance deletes
the elemental threat model outright.

## Procedure

1. **Write the pipeline once, in one typed function**, taking the raw hit, its damage type,
   and the defender's layer values; returning the final number and, for diagnostics, the
   amount each layer absorbed. Every consumer — live combat, the simulator, the preview
   screen, the balance tooling — calls it.
2. **Bar every legacy formula from producing a verdict.** A simpler older model may survive
   for compatibility with old saved content, but it must be structurally incapable of
   answering "how much damage did this take" for anything that ships. Two models answering
   one question is worse than one model and worse than none, because the disagreement is
   invisible until it is load-bearing.
3. **Return absorbed-per-layer, not just the final figure.** A pipeline that returns only
   the total forces every caller to re-derive the breakdown, which is how a second
   implementation gets born.
4. **Cap at the layer, not at the end.** Resistance clamps to its ceiling before it is
   applied; a post-hoc clamp on the composed reduction loses the per-type information.
5. **State the resistance floor as well as the ceiling.** Negative resistance from a
   penalty or a curse must be representable and must increase damage taken; a pipeline that
   silently clamps resistance at zero deletes a whole class of encounter design.
6. **Gate avoidance on the attack channel only.** Accuracy answers evasion on a curve —
   a form like `accuracy / (accuracy + (evasion / 4) ^ 0.8)` with a floor around 5% and no
   hard ceiling below certainty — and it applies to attacks. Spells and damage over time
   never miss. That single rule is why accuracy is a real build cost for some archetypes and
   free for others, and a pipeline that applies the avoidance roll uniformly quietly
   re-prices half the game's skills.

## Decision rules

- **When a surface needs a single defence number, use effective health against a named
  reference hit**, not a mitigation percentage. The reference hit is a canon value per
  character level, and it is published with the number.
- **When adding a new defensive layer, decide its position in the order and its cap in the
  same change.** A layer without a cap becomes the only layer anyone stacks; a layer without
  a position produces two answers within a month.
- **When a layer is binary, do not fold it into the fractional math as an expected value
  inside the pipeline.** Expected-value folding belongs in the survivability analysis, where
  its variance can be stated, not in the function that resolves one hit.
- **When the soft-cap coefficient is tuned, treat it as a canon change.** It re-prices every
  armour roll on every item in the game simultaneously.

## When not to use this

- **Do not apply the hit-size soft cap to a layer that is meant to be predictable.** A
  shield value that players are supposed to reason about arithmetically should be flat or
  ratio-based; soft-capping everything makes the defence sheet unreadable and pushes players
  to external calculators.
- **Do not run the full pipeline for damage over time ticks unless the canon says ticks are
  hits.** Whether an ailment tick passes through avoidance, block, armour and resistance is
  a separate canon decision; running the hit pipeline by default silently answers it.
- **Do not use an ordered pipeline at all in a game with one defensive stat.** The order is
  a cost paid for layering; a project that genuinely has a single defence should have a
  single formula and no pipeline to keep consistent.
