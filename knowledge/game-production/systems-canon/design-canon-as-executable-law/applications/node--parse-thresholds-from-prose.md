---
layer: application
type: application
subject: design-canon-as-executable-law
technique: parse-thresholds-from-prose
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Parsing canon prose into checker constants (PoF acceptance invariants)

`src/lib/catalog/acceptance/invariants.ts` is PoF's content-invariant layer: deterministic
checkers that assert a produced catalog artifact obeys a design law rather than merely
having its fields populated. Its entire threshold set is parsed out of `CANON_SEED` rule
bodies at module load.

## The extraction primitives

`src/lib/catalog/acceptance/invariants.ts:22`:

```ts
function canonBody(id: string): string {
  const r = CANON_SEED.find((x) => x.id === id);
  if (!r) throw new Error(`invariants: canon rule "${id}" not found in CANON_SEED`);
  return r.body;
}
function parseCanon(id: string, re: RegExp): RegExpMatchArray {
  const m = canonBody(id).match(re);
  if (!m) throw new Error(`invariants: canon rule "${id}" body no longer matches ${re} — update the parser or the rule`);
  return m;
}
```

Both failure modes throw: a rule id that no longer resolves, and a body that no longer
matches. There is no default branch anywhere in the file. The module header states the
policy in one sentence: *"A parse that no longer matches throws at MODULE LOAD (loud)
rather than silently using a stale literal."* Because these are top-level `const`
initializers, importing anything from the module runs the whole extraction — so a canon
edit that breaks a pattern fails the test suite immediately, not during a conformance run.

## The `\D` idiom — patterns written against the sentence, not its typography

The header explains the choice explicitly:

> The regexes use `\D` (non-digit) runs between numbers so they are robust to the exact
> unicode of the canon prose (±, ≈, ≤, ×, en-dash, minus).

The extraction block that follows (`invariants.ts:33`) shows what that buys:

```ts
// proj-balance: "Tier power target ≈ 100 (±10%). Price/power ratio 0.8–1.2×."
const _bal = parseCanon('proj-balance', /power target\D+(\d+)\D+(\d+)%/);
export const POWER_TARGET = Number(_bal[1]);   // 100
export const POWER_TOL_PCT = Number(_bal[2]);  // 10

// proj-economy: "the per-hour faucet and sink should stay balanced within ±15%"
const _eco = parseCanon('proj-economy', /balanced within\D*(\d+)%/);
export const FAUCET_SINK_TOL_PCT = Number(_eco[1]); // 15

// arpg-ailments: "freeze is a threshold-gated stun ≤3s"
const _cc = parseCanon('arpg-ailments', /stun\D+(\d+)s/);
export const CONTROL_CC_CAP_SEC = Number(_cc[1]); // 3

// arpg-item-level: "requiredLevel ≈ ilvl − 5..15"
const _req = parseCanon('arpg-item-level', /requiredLevel\D+ilvl\D+(\d+)\.\.(\d+)/);
export const REQ_BELOW = { min: Number(_req[1]), max: Number(_req[2]) }; // 5 – 15
```

Every pattern anchors on words a designer would preserve through a clarity rewrite —
`power target`, `balanced within`, `requiredLevel`, `stun` — and then crosses the
punctuation with `\D`. The `≈`, the `±`, the `−` (a true minus, not a hyphen) and the `≤`
in those bodies are never enumerated, so none of them can break the parse.

Two further details worth stealing:

- **The source sentence is quoted in a comment above each pattern**, and the parsed value
  in a trailing comment. A reader sees prose, pattern and result in three adjacent lines.
- **Class-keyed patterns are generated from the class name** rather than captured
  positionally. `rarityLifeBand` at `invariants.ts:66` builds a fresh pattern per tier:

  ```ts
  function rarityLifeBand(tier: string): { min: number; max: number } {
    const m = parseCanon('arpg-monster-rarity', new RegExp(`${tier}\\D*([\\d.]+)\\D+?([\\d.]+) life`));
    return { min: Number(m[1]), max: Number(m[2]) };
  }
  export const MONSTER_LIFE_BAND = {
    Magic: rarityLifeBand('Magic'), // 1.5 – 2
    Rare: rarityLifeBand('Rare'),   // 4 – 6
    Unique: rarityLifeBand('Unique'), // 6 – 10
  };
  ```

  The canon body lists all three bands in one sentence (`Magic ~×1.5–2 life … Rare ~×4–6
  life … Unique ~×6–10 life`). Anchoring each capture on its own tier name means a
  designer can reorder the sentence without silently swapping the Rare and Unique bands —
  which one six-group positional pattern would have done.

## Units converted at the boundary, and named for it

`readCanonThresholds` in `src/lib/balance/canon-conformance.ts:53` converts every parsed
percentage to a fraction in the same expression that parses it, and its interface names
each field with its unit and basis:

```ts
export interface CanonThresholds {
  /** faucet/sink balance tolerance as a fraction (0.15 from "±15%"). */
  faucetSinkTolerance: number;
  /** per-type resist cap as a fraction (0.75 from "capped at 75%"). */
  resistCap: number;
  /** one-shot ceiling as a fraction of EHP (0.33 from "< 33% of a capped … EHP"). */
  oneShotEhpFraction: number;
  /** canon geometric XP growth base (1.08 from "≈ base × 1.08^level"). */
  xpGeometricBase: number;
  /** price/power ratio bounds ([0.8, 1.2] from "0.8–1.2×"). */
  pricePowerBounds: [number, number];
}
```

Each doc comment states the parsed value *and the phrase it came from* — the fastest
possible audit trail from constant back to sentence. The invariants module takes the other
convention and keeps percentages as percentages, with `_PCT` in the identifier
(`POWER_TOL_PCT`, `FAUCET_SINK_TOL_PCT`). Both are honest; what matters is that neither
exports a bare `tolerance`.

## Grading a shape, not a sampled value

`arpg-leveling` says the XP curve *"grows roughly geometrically (≈ base × 1.08^level)"*.
The linter parses 1.08 but does not compare a sampled point against it. Instead
`checkXpCurveShape` (`src/lib/balance/canon-conformance.ts:159`) computes the consecutive
ratio series and its coefficient of variation:

```ts
for (let i = 1; i < xs.length; i++) ratios.push(xs[i] / xs[i - 1]);
// A true geometric curve → ratio constant → CoV ≈ 0. Tolerance 0.15.
if (cov <= 0.15) return [];
```

The comment records exactly why this catches what a point comparison would not: *"the
shipped polynomial `100·level^1.8` has ratios that start far above the canon base and
decay — a high coefficient of variation."* A single sampled level would pass that curve.

## The test that keeps the coupling visible

The header of `canon-conformance.ts` names it: *"if the canon prose changes a number, the
linter follows it (and `canon-conformance.test.ts` asserts the parse still resolves)."*
That assertion is what makes the brittleness productive rather than dangerous — the
failure lands in CI, named, on the commit that reworded the rule.
