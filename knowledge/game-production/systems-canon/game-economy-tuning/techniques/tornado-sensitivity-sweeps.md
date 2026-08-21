---
layer: technique
type: technique
subject: game-economy-tuning
technique: tornado-sensitivity-sweeps
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [deciding which tuning lever to pull first, prioritising which uncertain input to go measure, defending a tuning decision against intuition]
shared_with: []
---

# Tornado sweeps: which lever actually moves the outcome

The named concern: **ranking a model's inputs by how much each one moves each outcome.**
In an economy with thirty inputs and a handful of outcome measures, intuition about
sensitivity is unreliable and confidently so — teams argue for weeks about a knob worth
two percent while an unexamined frequency estimate is worth forty.

The method is deliberately simple. Vary one input at a time across its plausible range,
holding everything else at the baseline; record the outcome at each end; the swing
between them is that input's influence. Sort inputs by swing, widest at the top. The
resulting chart is wide at the top and narrow at the bottom — hence the name — and it
is read top-down: everything below the first few bars is, for this decision, noise.

## Choosing the ranges — this is the whole technique

The output is entirely determined by the ranges you sweep, and this is where the method
is most often misused. An input swept across a wider range looks more influential; sweep
every input by an arbitrary uniform amount and you have measured the model's partial
derivatives, not the decision's sensitivity.

Sweep each input across **its plausible range** — the interval it might genuinely take
given what is known about it:

- for a *measured* input, the confidence interval of the measurement;
- for an *estimated* input, the range the estimator would not be surprised by;
- for a *design choice*, the interval the design would actually consider shipping.

Record which of the three each range came from, alongside the range itself. A ranking
whose ranges are not stated is not interpretable and cannot be compared against a later
run — a swing figure without its basis is not information.

The convenient implementation is a single uniform fraction — sweep everything at plus
and minus fifty percent — because it needs no per-input knowledge and produces a chart
immediately. It is worth being explicit that this is a *ranking of the model*, not of
the decision, and that it is only defensible while every input genuinely has a similar
plausibility width. State the range in the result either way; a swing figure quoted
without the range that produced it cannot be interpreted or compared.

## Sweep the inputs that can actually be wrong

An economy entry has at least three sweepable inputs — its magnitude, its scaling term,
and its per-hour frequency — and a sweep implementation usually reaches only the first,
because magnitude is the field an override is easiest to plumb.

That restriction quietly excludes the input most likely to dominate. Magnitudes are
authored numbers that somebody chose deliberately; frequencies are estimates, often made
once, often from a single playtest, and they multiply their magnitudes linearly into the
result. A tornado over magnitudes alone will rank the confident numbers and never show
the guesses. If the sweep can reach only one field, say so in the result — a ranking
that silently covers a third of the inputs reads as if it covered all of them.

## Choosing the outcomes

Sweep against the outcomes decisions are made on, not against intermediate quantities.
For a resource economy, three carry most of the weight:

- **wealth concentration** — does this input change who the economy is for;
- **net flow** — does it move the balance band verdict;
- **count of critical alerts** — does it change how many things are broken.

That third one is worth arguing for. It is coarse and discontinuous, and it is the one
that answers the question a producer actually asks: *if I move this, does the number of
things wrong with the economy go down?* An input with a small effect on every continuous
outcome and a large effect on the critical count is exactly the lever worth pulling,
and a purely continuous outcome set hides it.

## Procedure

1. **Fix the baseline** — the full configuration, including the active stance vector and
   the progression point. Every swing is relative to it, and a swing quoted without its
   baseline is meaningless.
2. **Enumerate the inputs** and give each a plausible range with a recorded provenance.
3. **For each input, evaluate the model at both ends of its range** with everything else
   at baseline. Where the model is stochastic, use enough trials that the swing exceeds
   the run-to-run noise; if it does not, the honest result for that input is *not
   distinguishable from noise*, not zero.
4. **Record the swing per outcome** and sort per outcome. One input may top the ranking
   for concentration and sit at the bottom for net flow; a single merged ranking loses
   exactly the information the sweep was run to get.
5. **Cross the ranking with provenance.** A high-swing input that is an *estimate* is
   the highest-value measurement to go and take. A high-swing input that is a *design
   choice* is the lever to pull. A low-swing estimate can remain an estimate — that
   conclusion is worth as much as the top of the chart, because it retires work.
6. **Re-run per horizon.** The dominant lever at hour five is rarely the dominant lever
   at hour two hundred, and a ranking computed at one progression point does not
   transfer to another.

## What the method cannot tell you

One-at-a-time sweeps miss interactions by construction. Two inputs that each move an
outcome by three percent alone may move it by thirty together, and the sweep will rank
both near the bottom. It also assumes monotonicity within each range: an input with an
interior optimum shows a small end-to-end swing and looks unimportant while being the
most important input in the model.

Both are acceptable, because the method is a triage instrument, not a model of the
system. State the limitation with the result. If interactions are suspected — the usual
tell is a sweep whose top bars fail to explain the variance the team observes — the
follow-up is a joint sweep over the top few inputs, not a wider one-at-a-time run.

## Decision rules

- **When the top bar is more than about three times the second, tune only the top one
  and re-run.** Simultaneous changes to two levers of similar magnitude leave the result
  unattributable.
- **When the ranking contradicts the team's intuition, re-check the ranges before
  re-checking the model.** The most common cause of a surprising tornado is a range that
  is wider or narrower than the input's real plausibility.
- **When an input's swing is inside the model's own run-to-run noise, report it as
  indistinguishable, not as zero.** A zero says "measured and irrelevant"; those are
  different claims and the second one is not one you made.
- **When the top-ranked input is an unmeasured frequency estimate, stop tuning and go
  measure it.** Continuing to tune under an unresolved dominant uncertainty is fitting
  the model to a guess.
- **When no input produces a meaningful swing on an outcome, the model is not
  responsive on that outcome** — the outcome is dominated by something outside the swept
  set, and the sweep's honest verdict is that it found nothing.

## When not to use this

- **On a model with fewer than about half a dozen inputs.** Ranking five things you can
  reason about directly is ceremony.
- **When the outcome measure is not trusted.** A sensitivity ranking over a broken
  outcome is a precise map of a wrong place, and its precision makes it persuasive.
- **As evidence that a change is safe.** A low-sensitivity input is low-sensitivity for
  the swept outcomes at the swept baseline and says nothing about the outcomes nobody
  put in the model.
