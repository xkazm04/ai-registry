---
layer: application
type: application
subject: keyword-metric-reliability
technique: unknown-metric-sinks-never-flatters
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# An unknown metric sinks, never flatters - the workspace's keyword engine

The Czech-first adtech workspace (commit `2893314930546ed3a314a19a155bcf2f8841a0ea`,
2026-09-08; Node 24) merges keyword ideas from three providers - Google Ads Keyword
Planner, Sklik, and a deterministic sample generator - and ranks the merged set by a
single opportunity score. It realizes half of this technique exactly, in one adapter,
and refutes the other half in the sibling adapter, which makes it a clean witness for
the rule that a default's direction has to be proved per score, not per metric.

## The half that lands: the Sklik adapter

`src/lib/sklik/keywords.ts:10-15` states the technique as its own design note: *"When a
metric is absent, a CONSERVATIVE default is used (documented per field) so a
Sklik-only keyword lands LOW in the opportunity ranking rather than falsely topping
it."* The three defaults are each argued in the direction the technique demands:

- `SKLIK_DEFAULT_VOLUME = 10` (`:24-27`) - *"a small, honest floor (NOT an invented
  headline number), so the idea still surfaces but its normalised-volume contribution
  to `opportunity` is near zero."*
- `SKLIK_DEFAULT_COMPETITION_INDEX = 50` (`:28-30`) - *"mid (index 50) rather than
  optimistic-low, so an unknown-difficulty keyword isn't flattered."* The mid-not-low
  choice is the technique's first decision rule, verbatim.
- No CPC -> `cpc = 0` and both bids `0` (`:57-59`), with the comment *"the idea
  scores 0 on spend efficiency and sinks in that sort, honestly, rather than inventing
  a price."* `spendEfficiency` in `src/lib/keywords/types.ts:179-186` guards the
  divisor (`mid > 0 ? opportunity / mid : 0`), so the zero lands the row last rather
  than at infinity - the per-score check the technique asks for, done for this score.

`competitionIndex()` at `:38-42` also normalises a value that *"may be 0-1 OR 0-100
depending on the surface - offline-unverifiable"*, reading anything at or below 1 as a
fraction. That is the correct treatment of a provider whose units are undocumented: a
seam with the assumption localised and named.

## The half that fails: the Keyword Planner client

`src/lib/google/keyword-planner.ts:16-19` maps every absent numeric field through
`num()`, which returns `0` for undefined. At `:71` an absent `competitionIndex` becomes
`0`; at `:21-27` an absent `competition` level with index `0` becomes the band `"low"`;
at `:74` an absent `avgMonthlySearches` becomes `0`. Trace those through the score:

```
opportunityScore  (types.ts:269-273)
  vol  = avgMonthlySearches / maxVolume     -> 0      (sinks: fine)
  ease = 1 - competitionIndex / 100         -> 1.0    (FLOATS: full 40 points)
```

A Keyword Planner row with no competition data - which the platform omits for
low-volume terms - is awarded the maximum ease any row can earn, and lands above every
measured medium-competition term with the same volume. The Sklik adapter sinks the same
absence to mid; the Planner adapter floats it to best. Two adapters feeding one
formula, one honest and one flattering, and nothing in `mergeRawIdeas` or
`finalizeKeywords` can tell them apart because the default has already been written
into the number. The standard stands: the Planner client should default an absent index
to 50 as its sibling does, and an absent volume should surface as a floor with a
"not reported" label rather than as a measured zero.

## The merge rule, confirmed

`mergeRawIdeas` at `types.ts:81-110` implements provenance-first merging exactly as
the technique's step 5: *"a real provider record (google/sklik) always beats a `sample`
record regardless of the sample's fabricated volume"*, then real-vs-real keeps the
higher `avgMonthlySearches`, then the record carrying bid data, then the first seen,
and *"the kept record's own `source` label is preserved."* The comment names the
incident the rule prevents - the sample generator *"scales head terms to ~9000, which
would otherwise beat Sklik's real figure and discard it"* (`src/lib/keywords/sample.ts:47`
is the `9000 / sqrt(term.length)` base).

Per-row provenance follows the technique's step 4 precisely: `KeywordSource` at
`types.ts:43-48` is *"only set when sources are actually mixed"*, and
`src/lib/keywords/engine.ts:106-114` serves a Google-only or sample-only result
*"BYTE-IDENTICALLY: no per-idea source labels, no reordering"*, tagging rows only when
Sklik contributed. The label is per row, not per result, because a merged result carries
two providers at once.

## The structural fact about the score: bucketed volume treated as cardinal

`opportunityScore` (`types.ts:267-273`) is *"60% normalized volume + 40% inverse
competition"*, with `maxVolume` the set's largest `avgMonthlySearches`
(`finalizeKeywords`, `:283`). That formula reads a bucketed, family-aggregated figure as
a quantity, and three things follow from the arithmetic:

1. **The head term sets the denominator.** With a head term at 9,000 (sample) or a real
   platform figure of that order, every term under about 100 contributes less than one
   opportunity point from volume. The 60% weight is nominal; in a realistic set the
   volume term separates only the top handful of rows and the 40% ease term decides
   everything else. The score is a volume sort with an ease tie-breaker, not a blend.
2. **Bucket boundaries become score gaps.** Two terms at real demand 40 and 60 that the
   platform buckets to 50 and 50 score identically; two at 45 and 55 that straddle a
   boundary get a gap the demand does not have.
3. **"Ease" is ad competition, not organic ease.** `competitionIndex` is Keyword
   Planner's advertiser-density index (`keyword-planner.ts:71`) and Sklik's equivalent,
   yet `spendEfficiency` (`types.ts:173-178`) describes the result as *"how much organic
   upside does this keyword carry relative to what the paid click would cost"*. The
   organic-upside claim rests on a paid-market metric; the subject's golden path names
   this as the category error it is.

The engine is a paid-planning tool, so a paid competition index is the right input for
a spend decision - but the *label* "organic upside" is the deviation, and a rank or
log transform of volume is what the standard asks of the blend.

## Verdict

Confirmed: conservative per-field defaults with documented direction (Sklik adapter);
divisor-guarded efficiency; provenance-first merge; per-row provenance only when mixed.
Deviation: the Planner adapter's `num()` floats an absent competition index to full
ease; an absent volume renders as a measured zero. Deviation: the 60/40 opportunity
formula treats a bucket as a cardinal quantity and labels a paid competition index as
organic ease.
