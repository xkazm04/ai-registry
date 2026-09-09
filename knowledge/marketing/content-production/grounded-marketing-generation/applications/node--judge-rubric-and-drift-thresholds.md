---
layer: application
type: application
subject: grounded-marketing-generation
technique: judge-rubric-and-drift-thresholds
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Judge rubric and drift thresholds - the workspace's judged quality run and its CI gate

Verified against the Czech-first adtech workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. The technique is
split across an on-demand judged run (`test-llm/quality/run.mjs`), a recorded
baseline (`test-llm/quality/baseline.json`), and a zero-dependency CI gate
(`scripts/quality-gate.mjs`) that compares the baked scorecard against the baseline
on every `check:ci`.

## The rubric

`run.mjs:154-171` fixes the judge: a strict senior-reviewer system prompt that scores
"ONLY the given output against the task" and a schema of five 1-10 numbers - `score`,
`relevance`, `correctness` ("factual correctness / constraint adherence"), `adherence`
(task and structure) and `tone` (language, on-brand) - plus a one-sentence `verdict`
and an `issues` array "empty if none". `judgePrompt` (`run.mjs:173-187`) hands the judge
the tool's system prompt, the input and the output JSON. This confirms the rubric's
shape and exposes its gap: the judge sees the *prompt* the generator received, so a
grounding block that rode on the user prompt is visible, but nothing tells the judge
which values were supplied versus invented - `correctness` is judged on plausibility.

## Judge discipline

- **Median of three, on one model.** `run.mjs:105` sets `JUDGE_COUNT` to 3 by default;
  `run.mjs:218-234` runs the judges in parallel, keeps only verdicts where `demo ===
  false` and the model matched the intended judge (`isSonnetJudge`, `run.mjs:195`),
  takes the per-dimension median, and shows the verdict of the judge closest to the
  median. When no judge stayed on model the cell is returned `judged: false` with the
  off-model name in `issues` - "rather than accept an off-model score."
- **Home-team bias disclosed.** `run.mjs:145-152` detects targets sharing the judge's
  vendor family and prints a Czech warning that those cells are graded by a sibling
  model and should be read as biased, not neutral.
- **Served or void.** `run.mjs:269` counts a cell only when `res.meta.demo === false &&
  res.meta.model === t.model`; a fallback is reported as `served: false` with the
  serving model named.
- **Validity beside the score.** `run.mjs:277` records `valid`, and
  `quality-gate.mjs:310-316` blocks on any serving cell with `valid: false`, arguing
  that "the model's output failed that tool's own validator, i.e. production would have
  clamped or dropped it."

## The thresholds and their footing

`baseline.json` carries `maxDrop: 1`, `maxMeanDrop: 0.35`, `mean: 7.7`, and its
`$thresholds` note gives the sizing argument verbatim: "half a point is judge variance
(the same variance the 6.5 floor allows for), so a full point is the smallest drop
that means something changed"; the mean rule "is the answer to the failure the
per-cell rule cannot see - every operation losing 0.9 and passing."
`quality-gate.mjs:81` sets `FLOOR = 6.5` with the same variance argument
(`quality-gate.mjs:79`). `quality-gate.mjs:172-173` reads the two drops from the
baseline with the same defaults; `quality-gate.mjs:370` blocks on `was - now >
MAX_DROP`; `quality-gate.mjs:380-381` blocks on `meanWas - meanNow > MAX_MEAN_DROP`.
All three numbers are practitioner convention sized from observed judge variance, and
the tree says so in its own comments - confirming the technique's labelling.

## The baseline is custody

`baseline.json.serving[]` records, per column, the model id and a `declaredBy`
triple - file, symbol, regex - pointing at where `src/lib/llm/models.ts` names the
served model. `quality-gate.mjs:178-205` re-reads that declaration on every run and
blocks when the declared model differs from the measured one: "The scorecard and the
baseline describe a model this app no longer runs." `quality-gate.mjs:352-365` blocks a
baselined cell the new bake no longer scores ("an operation cannot disappear from
measurement while it is still being served"). The header (`quality-gate.mjs:14-25`)
states the floor-versus-baseline distinction the technique rests on and routes every
baseline move through `test-llm/quality/CHANGELOG.md` "for the same reason as the
prompt goldens: re-recording a number is how a regression gets absorbed."
`quality-gate.mjs:435-437` prints the measurement age and flags it past 120 days as
describing "a model line-up that has moved on" - the 120 is convention.

## The tier finding

`tiger/models/benchmark-2026-06-20.md:24-26` scores the ads tool 2.5 / 4.0 / 4.5 on
the fast / mid / top tier, the fast tier breaking character limits and the top tier
"cleanest limit compliance (self-validated)" at roughly five times the latency;
`:30` names the two failure modes (drops grounding, ignores hard constraints) and
`:35` records the corrected boundary from a second pass: "the real split is
categorical vs numeric, not constrained vs creative" - only the pure regrouping tool
was fast-tier safe, and the three numeric tools degraded with "inverted economics /
fabricated counts". The technique carries this as a hypothesis to test, which is also
how the tree presents it: a dated benchmark on one product line.

## What the tree does not do

The `valid` bit the gate blocks on is not the production validator. `run.mjs:277`
calls `tool.validate` from `test-llm/registry.mjs`, and `registry.mjs:71-78` for the
ads tool is a *shape* check (at least two headlines, one description, strings present)
- not the char-limit `validateAds` of `src/lib/ai/tools/ads.ts:115`. The gate's claim
that `valid: false` means "production would have clamped or dropped it" is therefore
stronger than what is measured: an over-limit ad set scores `valid: true` in the
scorecard. The standard stands - validity beside the score means the tool's own
validator - and the fix is to have the registry call the production validator and
treat a non-empty violation list as invalid. The rubric also has no line for
fabrication against supplied facts; the judge is not handed the supplied-values list,
so a fluent invented number is scored on plausibility.
