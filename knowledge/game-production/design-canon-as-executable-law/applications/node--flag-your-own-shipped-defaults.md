---
layer: application
type: application
subject: design-canon-as-executable-law
technique: flag-your-own-shipped-defaults
stack: node
status: forged
---

# A linter whose header condemns its own project (PoF canon conformance)

`src/lib/balance/canon-conformance.ts` is PoF's balance linter — a pure function over
simulation output that flags where a simulation, *or the shipped defaults feeding it*,
violates the ARPG canon. What makes it trustworthy is its first paragraph.

## The header admission

`src/lib/balance/canon-conformance.ts:1-19`:

```
/**
 * Canon conformance linter — a PURE check that flags where a simulation (or the
 * shipped defaults feeding it) VIOLATES the ARPG-LAWS canon. Sims can silently
 * drift from the design laws (the shipped `loot-driven` economy default runs the
 * faucet hot and the sink cold, which breaks the ±15% balance law); nothing else
 * catches that. This does.
 *
 * Thresholds are READ from the canon seed (`src/lib/catalog/canon/canon-seed.ts`),
 * never hardcoded — if the canon prose changes a number, the linter follows it
 * (and `canon-conformance.test.ts` asserts the parse still resolves). This is not
 * a competing canon module: it reads the ONE seed.
 *
 * Laws checked (≥5):
 *   1. faucet/sink balance ±15%     (proj-economy)      — economy result metrics
 *   2. per-type resist cap 75%      (arpg-resists)      — defender resist values
 *   3. no one-shot ≥33% of EHP      (arpg-defenses)     — biggest hit vs EHP
 *   4. XP curve is geometric        (arpg-leveling)     — curve shape vs ~1.08^level
 *   5. price/power ratio 0.8–1.2    (proj-balance)      — item price vs power
 */
```

The self-finding is in the third sentence of the file, before the design rationale, before
the law inventory. The project's own `loot-driven` economy preset — the default that ships
to anyone who never changes it — violates the `proj-economy` ±15% faucet/sink law, and the
file that enforces that law says so in the place a maintainer cannot avoid reading it.

That is response 3 from the technique: keep both, document the deviation with its reason
and location. The band was not widened. `proj-economy`'s body still reads *"the per-hour
faucet and sink should stay balanced within ±15%"*, and the linter still parses 15 out of
it.

The second self-finding is the XP curve. `checkXpCurveShape`
(`src/lib/balance/canon-conformance.ts:157`) exists specifically because the shipped curve
is a polynomial:

> A geometric curve has a near-constant consecutive ratio; the shipped polynomial
> `100·level^1.8` has ratios that start far above the canon base and decay — a high
> coefficient of variation. We flag a non-geometric shape.

Two of the five laws this linter enforces are, at the time of writing, violated by the
project's own defaults, and both violations are documented in the checker rather than
absorbed into its thresholds. That is the entire credibility argument for the module.

## The violation shape

`src/lib/balance/canon-conformance.ts:68`:

```ts
export interface CanonViolation {
  /** Canon rule id (canon-seed) that was violated. */
  lawId: string;
  /** Human-readable law title. */
  law: string;
  /** What was measured. */
  metric: string;
  /** The actual measured value. */
  actual: number;
  /** The allowed envelope, human-readable (e.g. "≤15%", "0.8–1.2"). */
  allowed: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}
```

Every finding carries the rule id (a link back into the corpus, not just a title), the
metric name, the measured value, the envelope rendered the way a human states it, and a
message that puts all three in one sentence:

```ts
message: `Faucet/sink imbalance ${pct(imbalance)} (inflow ${inflow}/hr vs sink ${outflow}/hr) exceeds the ±${pct(t.faucetSinkTolerance)} law`,
```

Note the units carried into the message — `/hr` on both sides of the comparison, because
a faucet rate and a sink rate are only comparable per unit time.

## Severity is derived from the exceedance

Severity is not a constant per law. It is computed from how far past the line the value
landed:

```ts
severity: imbalance > t.faucetSinkTolerance * 2 ? 'critical' : 'warning',   // faucet/sink
severity: frac >= 1 ? 'critical' : 'warning',                                // one-shot vs EHP
```

For the one-shot law the boundary is semantic rather than arithmetic — a hit at or above
100% of effective HP *is* a one-shot, so that is where warning becomes critical. For the
faucet/sink law it is twice the tolerance. Either way the ordering is what lets a large run
be triaged. The price/power law emits `'info'` for every violation, which is a defensible
call for a per-item advisory but is the one place the module assigns rather than derives.

## Facet-gated: an absent input yields no result, not a pass

`lintCanonConformance` (`src/lib/balance/canon-conformance.ts:200`) takes a
`CanonLintInput` of optional facets and runs each check only when its data is present:

```ts
export function lintCanonConformance(input: CanonLintInput, rules: ProjectRule[] = CANON_SEED): CanonViolation[] {
  const t = readCanonThresholds(rules);
  const violations: CanonViolation[] = [];
  if (input.economyResult) violations.push(...checkFaucetSinkBalance(input.economyResult.metrics, t));
  if (input.resists) violations.push(...checkResistCap(input.resists, t));
  if (input.defense) violations.push(...checkOneShot(input.defense, t));
  if (input.xpCurve) violations.push(...checkXpCurveShape(input.xpCurve, t));
  if (input.itemPowers) violations.push(...checkPricePower(input.itemPowers, t));
  return violations;
}
```

Each individual checker also guards its own preconditions and returns `[]` rather than
inventing a verdict — `if (metrics.length === 0) return []`, `if (xs.length < 3) return
[]`, `if (defense.ehp <= 0) return []`. Every checker is exported individually and pure, so
each is testable on its own.

## The deviation the standard does not lower

An empty violation array means *nothing violated among the facets supplied*, and the
function's return type cannot distinguish that from *nothing was measured*. A caller
handed `{}` gets `[]` and can render it as green. The standard from the golden path is
that unmeasured is a reportable state, not an absence — the return should carry which
facets ran alongside the violations, so a report can state coverage as well as failures.
Likewise, no policy is stated anywhere about which severity blocks a gate; that decision
is currently left to each caller, and it belongs in one place, in the open.
