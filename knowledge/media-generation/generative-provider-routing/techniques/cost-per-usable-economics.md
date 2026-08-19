---
layer: technique
type: technique
subject: generative-provider-routing
technique: cost-per-usable-economics
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [choosing or reordering generation vendors, a cheaper model is proposed to cut spend, setting a spend ceiling for a generation pipeline]
---

# Cost-per-usable economics

The number a vendor advertises is price per render. The number that routes
money correctly is price per *usable* output — a render that clears the
brief's own acceptance bar — and the two rankings invert often enough that
routing on the advertised number misdirects real budgets
([cost-per-usable-output](../../_laws.md#cost-per-usable-output)). The
technique is the measurement method that produces the routing-grade number,
and the spend controls that assume it.

## The arithmetic, and why it inverts

Cost per usable output = price per render ÷ acceptance rate. Acceptance rates
for generative imagery are low and *wildly* vendor-dependent — a vendor can
be flawless on style and hopeless at following a mechanism instruction, or
cheap per call and prone to rendering text into the plate. So a modest price
gap is routinely swamped by an acceptance gap: in one measured comparison, a
vendor charging 1.75x per render came out at *half* the cost per usable
plate, because its acceptance rate was nearly four times its rival's (26/30
usable against 7/30 on the same grid). The premise the cheaper vendor was
chosen on — better quality per credit — inverted the moment "quality" was
defined as "an output you can actually ship".

## Measuring it honestly

The measurement is a grid, not an anecdote:

- **Crossed conditions.** Several distinct briefs x several distinct style
  treatments, every cell rendered on every candidate vendor. A handful of
  renders on one brief measures that brief; the grid separates model-bound
  failure from prompt-bound failure. The tell: a failure that survives many
  unrelated prompts (a mechanism never once drawn correctly across six
  different style treatments) is model-bound, and no prompt work will
  recover it — whereas a failure concentrated in one brief is the brief's
  problem.
- **Usable is a binary against the production bar, defined before grading.**
  On-brief *and* free of the defects the pipeline cannot tolerate — with
  unconditional fails named as such (stray rendered text is the classic:
  when captions are composited downstream, any in-image text voids the
  plate regardless of its other virtues). A weighted quality score hides
  exactly the cliff this measurement exists to find; a plate is worth its
  price or it is worth nothing.
- **Grade every cell, mechanically where possible** — a vision model against
  each cell's own brief — and count flips: cells one vendor passed and the
  other failed. Flips all pointing the same direction turn a sample into a
  verdict. Per [unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass),
  ungraded cells are not usable cells; an impression of quality is not an
  acceptance rate.
- **Date the verdict.** It binds two specific model versions at one point in
  time; a model refresh on either side re-opens the question. Record the
  verdict where the routing order is defined, so the number and the decision
  it drives cannot drift apart.

## Spend controls that assume the metric

- **Gate before, not after.** A per-window ceiling checked against a
  pre-call estimate, refused *before* any vendor is touched — once per
  request, not per candidate in the chain, and a budget refusal never
  re-routes (routing around your own ceiling is self-defeating by
  construction). A budget that only reports after the fact is a dashboard,
  not a control.
- **Price batches as batches.** A request for N candidates is estimated and
  gated as N renders. Candidate fan-out is the pipeline's largest silent
  multiplier — it is also what *buys* the acceptance rate, so it is not
  waste, but it must be priced as what it is.
- **Book actuals over estimates.** When the call settles, record the
  vendor-reported figure if one arrived, the estimate otherwise — an
  unreported cost still counts against the next ceiling check. Unpriced
  never books as zero.
- **Expected rejects are part of the unit cost.** When forecasting a
  production run, multiply by the measured acceptance rate's inverse — a
  thousand usable plates at 80% acceptance is a 1,250-render budget, and
  quoting the thousand-render figure is an error, not an optimism.

## Decision rules

- When a cheaper vendor is proposed, require its cost per usable output on
  *this pipeline's* bar before it takes a plan position. "Cheaper per
  render" is not evidence; it is the hypothesis.
- A losing vendor may stay in the chain — as a refusal exit, or as the right
  choice for work where the failed dimension does not matter (the bar is the
  brief's, and briefs differ). The verdict orders the plan; it does not
  purge it.
- When acceptance shifts without a deploy on your side, suspect a silent
  vendor model change, and re-run a slice of the grid before re-tuning
  prompts against a moved target.

## When not to use this

Skip the full grid when the decision is not yet worth it — a prototype doing
tens of renders should take the plan-order default and move on; the method
prices decisions that recur. And do not stretch one grid's verdict across
capability boundaries: a vendor's generation acceptance says nothing about
its editing or its vision grading, which are separate measurements on
separate bars.
