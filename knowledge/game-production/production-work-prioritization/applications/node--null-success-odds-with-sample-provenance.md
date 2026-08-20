---
layer: application
type: application
subject: production-work-prioritization
technique: null-success-odds-with-sample-provenance
stack: node
status: forged
---

# Null success odds in a recommendation payload

`src/lib/nba-engine.ts` in the Proof of Fun repo carries this rule in its type system, not
only in its arithmetic — which is what makes it hold.

## Null in the type, and why

`NBARecommendation.successProbability` is declared `number | null` (`:53`) with the
incident written into the doc comment:

> `null` when NOTHING has ever run for this module and no pattern matched. `null` is the
> honest answer and must be rendered as such — it was previously a hard-coded `0.5`,
> which the card printed as "50% past success on similar work" on brand-new projects.

That is the exact failure the technique exists to prevent, observed rather than imagined.
The factor contribution follows: at `:333`, `breakdown.successProb = moduleSuccessRate ===
null ? 0 : …`, and the renderer's `nbaFactorSegments` drops the "Success odds" segment
entirely rather than drawing an empty bar.

## The sample tiers

`NBASuccessEvidence` (`:74`) declares the three-tier ladder as a union: `'pattern'` (a
matched implementation pattern's own recorded rate), `'runs'` (the module's recorded CLI
runs from `session_analytics`), `'none'` (nothing ran, no pattern matched — odds unscored).
Each carries `runs`, `successes` and a `note` that is "one sentence naming the sample — or
naming its absence", and the field comment states the consumer obligation directly: the
card "is required to quote this instead of a bare percentage — the sample size is the part
that makes the number honest."

## Capped-confidence sample selection

Choosing between competing patterns (`:311`) weights rate by a capped session count:

```ts
(p.successRate * Math.min(p.sessionCount, 10)) > (best.successRate * Math.min(best.sessionCount, 10))
```

A perfect one-session pattern cannot beat a strong twenty-session one; capping at ten
stops a large stale sample from permanently outranking a smaller current one. The blend at
`:317` weights the specific pattern `0.7` against the module track record `0.3`, and the
comment enforces the anti-fabrication rule at the blend boundary: "A module with no
recorded runs adds nothing here rather than a synthesised half-mark."

## The upward lesson: prove the evidence source is written

The `runEvidence` parameter (`:154`) is passed in explicitly, and its comment names a
failure the expert draft did not have:

> Omitted ⇒ fall back to the local `moduleStore.moduleHistory` slice, which nothing in
> the app writes — so the honest result of omitting it is "no evidence", never a neutral
> constant.

A related note at `:191` records the same class of defect for the pattern library: the
store slice is filled only by one evaluator tab and has no persistence middleware, so
"relying on it made both structurally unreachable from a module view". A factor reading a
source nothing populates is structurally dead and reports "no evidence" forever while
looking healthy — indistinguishable, from inside, from an honest young project. The
technique's step 2 (assert reachability per source, once, in a test) comes from here.

## Deviation

There is no minimum-sample disclosure threshold and no dating of the sample. A
single-session pattern rate is reported with its count — which is the honest half — but a
rate measured before a tooling change is still quoted as current evidence. The standard
keeps its requirement that a rate not survive a change that invalidated its conditions.
