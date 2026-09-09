---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: sample-size-trust-gate
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Trust gate, Sidak correction and peeking guard in one pure evaluator - and the zero-CVR incident that wired the gate shut

Verified against the Czech adtech marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. The whole verdict
lives in one pure module, `src/lib/lp-exp/compute.ts`, with no I/O, so every claim
below is pinned by `test-unit/lp-exp.test.mjs` rather than by a screenshot.

## What the tree proves

**The three preconditions are one predicate.** `evaluate()` (`compute.ts:113-188`)
computes the winner as the highest-CVR non-control arm, then `significant` as
(`compute.ts:169-172`):

```ts
const meetsConfidence = !!winner && confidence >= 1 - effectiveAlpha;
const significant = exp.status === "done"
  ? !!winner && confidence >= 1 - effectiveAlpha
  : meetsConfidence && hasEnoughData;
```

A `done` experiment is read on confidence alone; a `running` one must clear the
corrected confidence bar *and* the sample gate. That conjunction is the peeking guard
as a predicate rather than as an instruction, exactly the standard's shape.

**Sizing reads the corrected threshold.** `correctedAlpha(alpha, comparisons)`
(`compute.ts:108-111`) is the Sidak product form, `1 - (1 - α)^(1/m)`, with
`comparisons = max(1, variants - 1)` (`compute.ts:150`), and `requiredSampleSize()`
(`compute.ts:76-97`) is called with `effectiveAlpha` rather than `DEFAULT_ALPHA`
(`compute.ts:154`). The third arm therefore raises the requirement before it raises
the bar - the reciprocity the technique asks for. `test-unit/lp-exp.test.mjs:27-32`
pins that the correction reduces to α for one comparison and tightens monotonically;
`:95` onward pins that the comparison count reaches the result.

**Progress is the smallest arm.** `minVisitors = Math.min(...visitors)`
(`compute.ts:155`) drives both `progress` and `hasEnoughData`, so a starved arm holds
the gate however healthy the total looks.

**The constants are labelled as conservative defaults.** `DEFAULT_MDE = 0.15`,
`DEFAULT_ALPHA = 0.05`, `DEFAULT_POWER = 0.8` (`compute.ts:38-42`) carry a comment
calling them conservative defaults for a landing-page read; the standard labels the
same three as practitioner convention. The pooled two-proportion formula is written
out in the docblock (`compute.ts:71-75`) and pinned against a hand-computed value,
`requiredSampleSize(0.1, 0.2, 0.05, 0.8) === 3841` (`test-unit/lp-exp.test.mjs:19-22`).

## The structural fact: fail-closed on a zero-CVR control

`requiredSampleSize` returns `Infinity` when the baseline is not strictly inside
(0, 1) (`compute.ts:85`). The comment at `compute.ts:156-162` records the incident:
the non-finite branch was once resolved to the permissive value - `progress = 1`,
`hasEnoughData = true` - and "a near-empty test read as significant once a handful of
challenger signups produced a large z". The fix:

```ts
const sizingKnown = Number.isFinite(requiredPerArm) && requiredPerArm > 0;
const progress = sizingKnown ? Math.max(0, Math.min(1, minVisitors / requiredPerArm)) : 0;
const hasEnoughData = sizingKnown ? minVisitors >= requiredPerArm : false;
```

`test-unit/lp-exp.test.mjs:67-84` pins it with the exact incident shape - control 40
visits / 0 signups, challenger 45 / 6 - and asserts `requiredPerArm` is not finite,
`hasEnoughData === false` ("was true before the fix"), `progress === 0`, and
`significant === false`. The tree proves the standard's claim that "not computable"
must resolve to shut, and shows what the open branch cost.

**The empty case is a gated result, not a throw.** `compute.ts:116-131` returns a
fully gated result for zero arms rather than crashing on `variants[0]!` or
`Math.min()` of nothing; `test-unit/lp-exp.test.mjs:86-93` pins it.

**The gate is consumed downstream, not only displayed.** `mineCreativePatterns()`
(`src/lib/patterns/extract.ts:172-190`) skips any experiment where
`!r.significant || !r.winner`, and the lesson it emits carries uplift, confidence and
the winner's visitor count as its basis. A leader on a collecting test cannot become a
"winning angle" in a later brief.

## Deviations from the standard

- **No runtime gate.** Nothing in `compute.ts` or the counter model knows how many
  days the test has run; a test reaching its per-arm number inside a partial week reads
  as sized. The scout's paid report lists this as below standard (item F5); the
  standard's two-full-weeks convention stays.
- **No sample-ratio-mismatch check.** View counts per arm are never tested against the
  intended uniform split. `foldArmTotals()` (`src/lib/lp-exp/counts.ts:61-74`) sums
  rows and clamps negatives to zero, which is integrity, not a ratio check.
- **No sequential option.** The design is fixed-horizon only; a business that needs
  daily reads has no always-valid path.
- **Sidak on a shared control.** The product form assumes independent comparisons;
  with every challenger sharing one control it is slightly optimistic. At the
  workspace's `VARIANT_MAX = 6` (`src/lib/lp-exp/types.ts:31`) the difference is in
  the third decimal, but the technique's caveat applies and the module does not
  state it.
- **One undifferentiated conversion beacon.** A single `conversions` counter
  (`counts.ts:20`) cannot separate a form start from a submit, so only one primary
  metric is possible - which happens to satisfy the one-primary-metric rule, but by
  limitation rather than by design.

## Upward lesson taken into the standard

The incident comment at `compute.ts:156-162` became the technique's "incident behind
fail-closed" section: an absent requirement resolved to a met one is the single most
dangerous branch in the evaluator because it opens exactly when data is scarcest.
