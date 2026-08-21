---
layer: application
type: application
subject: quality-verdict-integrity
technique: calibration-against-confirmed-labels-only
stack: process
status: forged
verified_on: 2026-08-20
---

# PoF's calibration guard and the v4 rubric bump

Two methodology artifacts in PoF's Quality Program (WS2) show the calibration
and supersession techniques as an actual workflow: `src/lib/judge/calibration.ts`
and the version history at `src/lib/judge/rubrics.ts:25`.

## The honest standing is `provisional`, on purpose

`src/lib/judge/calibration.ts:35`:

```ts
/** Agreement the judge must reach with CONFIRMED human labels. Never lower this to pass. */
export const CALIBRATION_THRESHOLD = 0.85;
```

The module header is the clearest statement of the technique in the repo. It
separates what is enforced from what is merely reported:

- Enforcement runs in `evaluateCalibration` (`:195`) over the latest persisted
  run of `npx tsx scripts/judge-run.ts --calibrate`, and the guard test
  `src/__tests__/lib/judge/calibration.test.ts` fails the build on
  `enforced-fail`.
- "Enforcement is scoped to NON-provisional targets, because a provisional label
  is seeded from prior evidence, not confirmed by a human — agreeing with an
  unconfirmed guess proves nothing."
- All three seeded `CALIBRATION` targets (`:60`) still carry `provisional: true`
  — a 3D mesh labelled `fail`, a dialog icon labelled `placeholder`, an item mesh
  labelled `placeholder`, each with a note recording the prior evidence. So "the
  honest standing of this project is `provisional`: the run reports a rate and
  the guard reports that ZERO confirmed labels back it. That is deliberately NOT
  a green."
- With no persisted run the standing is `unrun` and "NOTHING about the judge is
  proven"; a run scored under an older `RUBRIC_VERSION` is `stale` and "likewise
  proves nothing about the rubric in force".

`evaluateCalibration` computes two agreement figures — `overall` and `confirmed`
(`:158`) — and the provisional message prints both the rate and the confirmed
count (`0 of them carry a confirmed human label`), which is the technique's
"report the rate with its sample size" made literal.

The other two rules hold too. Comparison is by **band**, not raw score:
`bandOf()` maps a 0-100 score through `BANDS` (`rubrics.ts:62`: `shippable` 90,
`placeholder` 70) to the same three-value vocabulary the human labels in. And the
calibration run records **nothing** to `judge_verdicts` — "metered like any other
draw, and recording NOTHING to `judge_verdicts` — calibration is measurement."
The stated next step is to confirm the seeds and "expand to ~20 spanning the
map".

## The v4 bump: quantify the defect, then supersede on it

`src/lib/judge/rubrics.ts:25` holds `RUBRIC_VERSION = 4` with the full history.
v1 was the lenient pre-program era; v2 the strict reviewer bar; v3 added canon
awareness and sibling context — and the comment notes that "bumping the version
correctly makes every canon-blind v2 pass provisional (no longer a strict pass)
until the step is re-judged under v3."

v4 is the harness-defect case, and it is the model for how to do one:

> v4 = v3 with the judge HARNESS corrected. Two measured defects made v3 scores
> non-comparable: (a) `produceDirection` (240/816 artifacts) put the full
> ~5.7k-char generation prompt INSIDE the judged payload, while the rubric
> penalises leaked prompt tokens; (b) the sibling projection emitted only
> scalars, so 314/816 steps projected EMPTY and the judge reported cross-
> references it could not see as invented. The contract TEXT is unchanged — the
> INPUT is. Measured on a 21-cell A/B (median-of-3 per arm): control +0.4
> (sd 3.1), contaminated +16.9, blind-siblings +4.3. Every v3 verdict is
> therefore provisional until re-judged.

Three arms, median-of-3 to suppress judge noise, and a control that establishes
the noise floor at +0.4 with sd 3.1 — which is what licenses treating the +4.3
sibling effect as real and the +16.9 contamination effect as disqualifying.
"The contract TEXT is unchanged — the INPUT is" is the sentence most teams get
wrong; PoF bumped anyway.

## Selection versus strictness

`newestRubricVerdicts` (`rubrics.ts:49`) is THE shared filter, applied by both
the acceptance bridge and the `/status` grader. Its comment records the near-miss
the technique warns about: "the bridge kept `rubricVersion >= RUBRIC_VERSION`,
the grader kept `=== newestRubric` — which agree today and diverge the moment
RUBRIC_VERSION is bumped (the bridge would then keep BOTH v3 and v4 verdicts and
act on whichever failed). Strictness is a SEPARATE question, asked with
`isCurrentRubric`."

## Framing injected canon

`canonFraming` at `rubrics.ts:117` is the sibling-context framing block. It
names what is deliberate ("do NOT dock a modest stat line whose power sits in a
rule-changing mod"), refuses to lower the bar ("canon explains the design's
boundaries, it never excuses weak execution inside them"), and makes violation a
defect ("a value that breaks a stated law, a contradiction with the sibling
context below IS a defect — call it out and score it down"). The block is empty
when no canon is supplied, so an ungrounded judge is never handed an empty
permission structure.

One adjacent lesson from the same file: an earlier strictness contract that told
the judge to "default to a low score / fail correct work" made it refuse
outright. The current wording (`strictnessContract`) keeps the bar high and the
scoring fair — "base every score on specific, observable properties of the asset,
never on a quota".

## Deviation

The calibration set is three targets, all provisional, against a stated target of
~20 spanning the map. PoF reports this accurately rather than claiming
calibration, which is the point of the technique — but three provisional targets
is a smoke test, not a measurement. The standard (roughly twenty confirmed,
stratified targets before an agreement figure means anything) is not lowered to
match what is currently seeded.
