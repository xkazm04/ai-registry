---
layer: application
type: application
subject: prompt-fitness-and-evolution
technique: min-trials-and-confidence-banded-conclusion
stack: process
status: forged
verified_on: 2026-08-20
---

# A stated stopping policy for variant comparison

Realized in the PoF codebase at `src/lib/prompt-evolution/ab-testing.ts`. The policy is
three constants and two functions, all fixed in code rather than decided at the moment
someone looks at the numbers.

## The floor

```ts
export const MIN_TRIALS_PER_VARIANT = 3;   // ab-testing.ts:15
```

The comment records the incident that produced it: "Concluding at zero trials used to hand
the crown to whichever variant sat in slot A (`rateA >= rateB` with both rates 0), which is
not a measurement — it is a coin flip dressed as evidence." A per-test `minTrials` (default
5) is also stored on the `ABTest` record at creation (`:22`), so the floor and the volume
ceiling are per-experiment parameters rather than global assumptions.

## The bands

`evaluateTest` (`:94`) computes a pooled two-proportion z-test over the arms' success rates
and maps the z-score onto bands:

```ts
const confidence = zScore >= 1.96 ? 0.95 : zScore >= 1.65 ? 0.9 : zScore >= 1.28 ? 0.8 : zScore * 0.5;
const shouldConclude = confidence >= 0.8 || totalTrials >= test.minTrials * 4;
```

(`ab-testing.ts:113-117`.) Two termination conditions, both stated in advance: reach 0.8
banded confidence, **or** reach four times the per-test minimum trials. The volume ceiling is
what stops an inconclusive comparison from consuming budget indefinitely, and hitting it is a
legitimate outcome rather than a failure to decide.

The tie rule is explicit: when `|rateA - rateB| < 0.05`, the arms are within an indifference
margin on quality and the winner is decided on a declared secondary axis — mean trial
duration (`:121-126`). Declared before the run, in code; not "keep the new one because it is
new".

## The manual override still refuses

`forceConclude` (`:150`) is the "decide now" button, and it is the path where the floor
matters most, because nothing else stands between an unmeasured variant and a crown. It
returns a `Result` and, below the floor, an error carrying the per-arm shortfall:

> `Not enough trials to pick a winner — each variant needs 3 (A has 1, B has 0). Dispatch
> this checklist item a few more times.`

A refusal is a result, and a stated one is better than a silent no-op. When it does conclude,
the confidence it reports is capped: `Math.min(0.7, (trialsA + trialsB) / 20)` (`:173`) —
deliberately below every automatic band, so a hand-made decision can never present itself in
the transcript as a measured one.

## What this instrument is honestly for

Three trials per arm with these bands is a coarse filter: it catches large regressions before
a bad prompt authors a batch, and confirms an obvious win cheaply. It cannot rank variants
that sit within a few points of each other, and a z of 1.28 on three trials per arm is a lead
worth extending, not a result worth shipping on. The reported figure is only readable with
its trial count beside it, which is why `formatTestSummary` (`:180`) prints rates as `N/A`
rather than `0%` when an arm has no trials.

## Deviation: allocation is adaptive

`pickVariant` (`:47`) is epsilon-greedy — alternate until each arm has 2 trials, then explore
with probability 0.2 and otherwise serve the current leader. That is an operational choice
(less traffic wasted on the loser) traded against experimental cleanliness: arm sizes diverge,
and early noise steers later allocation. The standard this subject teaches — interleaved fixed
allocation for the comparison itself — is not lowered. Where an adaptive policy is kept, it
must be reported alongside the band rather than left implicit in the serving layer, since the
pooled z-test in `evaluateTest` assumes arm assignment was not a function of the results.
