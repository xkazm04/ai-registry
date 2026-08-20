---
layer: application
type: application
subject: judgment-guardbands
technique: confidence-weighted-blend
stack: node
verified_on: 2026-08-20
---

# The scoring engine — two constants, a coverage-scaled blend, and a NaN that would have eaten the report

## The split, as two named constants

`src/lib/maturity/model.ts:77-84` holds the whole policy in two exports and
nothing else:

```ts
/** Blend factor: how much the LLM judgment counts vs. deterministic signals. */
export const SCORE_BLEND = 0.6;

/**
 * Guardband: the LLM's per-dimension score is clamped to within this many points
 * of the deterministic signal score, so it can nuance but never hallucinate an
 * extreme that the evidence doesn't support.
 */
export const LLM_GUARDBAND = 25;
```

The two-knob separation the technique argues for is literal here: `SCORE_BLEND`
governs how much of the model's opinion lands on a typical scan, `LLM_GUARDBAND`
governs the worst case. They live beside `SCORING_RUBRIC_VERSION` (`:74`), whose
comment history (`r6`, `r7`) is a running log of exactly the discipline the
integrity record exists for — each entry states whether the change *moves a
score*, and r6 notes of two prompt changes that "neither moves a SCORE: the
roadmap is not scored and the summary is prose."

Worth recording as a deviation rather than a model: on a 0-100 scale whose
maturity levels are 25 points wide (`LEVELS`, `model.ts:86+`, `L1` at `[0, 24]`),
a ±25 band is one full level, and the widened band is two. The standard in
[score-guardband](../techniques/score-guardband.md) — size the band well below
the tier width — is not met here; the coverage-scaled weight limits the typical
case but not the bound.

## Coverage scales the blend, in the correct direction

`src/lib/scoring/engine.ts:153-155`:

```ts
const coverage = clamp(Number.isFinite(snap.coverage) ? snap.coverage : 1, 0, 1);
const effectiveBlend = SCORE_BLEND * coverage;
```

The comment above it (`:135-142`) is the source of the golden path's direction
rule, and it names the bug the scaling fixed: `coverage` "was computed and
surfaced as report.confidence but never touched the math, so a half-seen,
rate-limited, or truncated repo blended the LLM with the same weight as a full
scan — false precision." Coverage reported but not spent, exactly. The fix
damps the model on thin scans "(which lean HARDER on the deterministic signals,
which are coverage-robust)", and the comment closes with the invariant the
technique insists on: "At full coverage this is exactly SCORE_BLEND, so the
calibrated full-scan path is unchanged."

Note the default direction on the guard: a non-finite coverage defaults to `1`,
the calibrated path — not to zero. Could-not-compute is not low coverage.

## The NaN guard, and why it is one binding

The comment at `engine.ts:143-152` is the strongest single lesson in this
subject, and it is written as an incident:

- `clamp` is built from `Math.max`/`Math.min`, which **propagate** NaN, so a
  broken coverage estimate would pass straight through and poison
  `effectiveBlend` — and with it "every blended dimension score, the overall,
  axes, level, and posture would silently collapse to NaN with no warning."
- The half-fix shipped first. The guard existed "only as a local for the math
  while `confidence` was written from the raw `snap.coverage`", producing "a
  correctly-blended score next to `confidence: NaN` — which JSON-serializes to
  `null` and breaks every percentage render and threshold check downstream."
- The resolution is the technique's rule, stated in the code: "ONE sanitized
  coverage, used by BOTH the blend math and the persisted/rendered
  `confidence`… Same value, one binding: they cannot drift again." It also
  fixes an out-of-range estimate rendering as "200% inspected" — "the blend
  already clamped, the display did not."

## The blend itself, with the band applied first

`engine.ts:200-207`:

```ts
const band = widenedDims.has(s.id) ? LLM_GUARDBAND * 2 : LLM_GUARDBAND;
const guarded = clamp(
  Math.max(s.signalScore - band, Math.min(s.signalScore + band, llmScore)),
);
const score = s.deterministic
  ? s.signalScore
  : Math.round(effectiveBlend * guarded + (1 - effectiveBlend) * s.signalScore);
```

Three technique properties are visible in six lines. The clamp is expressed
around `s.signalScore`, so it is a delta bound and not a range check. The band
is chosen before the blend, keeping "the evidence is wrong" (band) separate
from "the evidence is thin" (weight). And `s.deterministic` is the narrate-only
escape: the security battery takes its signal as final while `llmScore` is
"still recorded for transparency" — the shadow proposal the technique asks for.

Two failure states are handled distinctly just above, at `:169-183`: an unknown
dimension id is skipped with a warning, and a detector that **threw** emits a
placeholder `signalScore: 0` that is dropped rather than folded in, because
otherwise the weighted mean would "deflate the overall as if the repo genuinely
scored 0 on this dimension… rather than penalize the repo for our own
extraction failure." Could-not-measure spelled differently from measured-zero,
with the renormalization to match.

## The integrity record

`engine.ts:340-357` writes `scoreIntegrity` onto the report: `d9Unmeasurable`,
the `widenedDims` actually applied, `widenCapped` when the audit was
distrusted, and `effectiveBlend`. Its comment states the purpose the technique
gives it — "the two LLM-prose-triggered step changes, recorded as data rather
than only as a warnings sentence, so a consumer comparing two scans of the SAME
commit can attribute a headline move instead of reporting it as repository
change" — and the intersection rule: `widenedDims` is filtered to dimensions
that actually reached the blend, because "a discrepancy naming a
dropped/unknown dim never widened anything, and listing it would overstate how
much of this report the model was trusted on."
