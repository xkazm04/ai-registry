---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: min-trials-and-confidence-banded-conclusion
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, no-gate-self-certifies]
shared_with: []
use_when: [running a comparison between two prompt variants, deciding when a comparison may conclude, reporting the strength of a prompt result]
---

# Minimum trials and a confidence-banded conclusion

## The concern

A variant comparison needs a stopping rule stated in advance, as policy, in units of trials
and confidence — not as a judgement call made while looking at the difference. Without one,
the comparison stops when someone likes the number, which reliably manufactures favourable
results: peek often enough and every variant leads at some point.

## The policy

Three parameters, fixed before the first trial:

- **Minimum trials per arm.** A floor below which no conclusion is permitted regardless of
  the observed gap. Three per arm is a defensible floor for a coarse filter; below three
  there is no dispersion estimate at all.
- **Confidence bands**, at standard-score thresholds, which is how a difference is reported:

  | Standard score | Band | What it licenses |
  | --- | --- | --- |
  | ≥ 1.96 | strong | Adopt, and say why |
  | ≥ 1.65 | moderate | Adopt provisionally, keep the loser's lineage |
  | ≥ 1.28 | weak | A lead, not a result — extend the run |
  | below | none | No difference detected; report as such, not as a tie |

- **Termination.** Conclude when the banded confidence reaches a stated level — 0.8 is a
  reasonable operating point for a cheap filter — **or** when trials reach a hard ceiling,
  four times the minimum, whichever comes first. The ceiling is what stops an inconclusive
  comparison from consuming budget forever, and reaching it is a legitimate result:
  *no difference detected at this sample size*.

Every one of these is written down before the run. A threshold chosen after seeing the data
is not a threshold.

**The floor binds the manual override hardest.** Every comparison rig grows a "decide now"
control, and that control is the one path where nothing else stands between an unmeasured
variant and a crown. Concluding at zero trials compares two success rates of zero, finds them
equal, and awards the win to whichever arm is listed first — a coin flip dressed as evidence.
So: the manual conclusion refuses below the floor, states the shortfall per arm in the refusal
("A has 1, B has 0; each needs 3"), and when it does conclude, reports a confidence capped
below anything the automatic bands can award. A hand-made decision must never be able to
present itself as a measured one.

## Procedure

1. **Fix the arms.** Parent and one mutation. More than two arms multiplies the chance of a
   spurious leader and needs a correction this instrument does not have.
2. **Hold the input set constant across arms.** Same artifact classes, same difficulty mix,
   same rubric revision. A difference in the input mix is measured as a difference in the
   prompt.
3. **Interleave trials**, never run one arm to completion then the other. Sequential arms
   absorb every drift in the environment — model updates, context changes, judging backlog —
   into the arm difference.
4. **Compute the band on judged trials only.** Unjudged trials do not count toward the
   minimum. Meeting the trial floor with unscored artifacts is meeting nothing.
5. **Report parent, mutation strategy, per-arm trial count, judged coverage, the band, and
   the rubric revision.** A result missing any of these cannot be re-read in six months.
6. **Keep the loser.** The lineage record of a mutation that did not work is the only
   evidence that its strategy class does not work here.

## Be honest about what three trials buys

This is a small-sample instrument and must be described as one. It is genuinely good at two
jobs: **catching large regressions cheaply** before a bad prompt authors a whole batch, and
**confirming an obvious win** without ceremony. At three trials per arm only a large effect
clears even the weak band, which is the intended behaviour of a coarse filter.

It cannot do fine-grained ranking. It cannot order variants that sit within a few points of
each other. It cannot support a claim like "six percent better" — the interval around that
estimate at this sample size spans both directions. And a weak band on three trials is a
lead worth extending, never a decision worth shipping on.

The failure mode is not the small sample. It is a small sample reported in the language of a
large one. State the trial count next to the band every time; the two travel together or
neither means anything.

## Decision rules

- **When the observed gap is large but trials are below the floor, do not conclude.** Extend.
  The floor exists precisely for the case where the early gap looks convincing.
- **When the ceiling is reached with no band, adopt neither**, and record *no difference
  detected at this sample size*. Defaulting to the new variant because it is new is a
  self-certifying gate.
- **When the mutation targeted one artifact class, band that class**, not the overall mean —
  a real effect in one class is diluted to nothing by classes it never touched.
- **When the judging apparatus changed mid-run, void the run.** The measuring instrument
  changed while measuring.
- **When a strong band is reached, still name the mutation strategy in the adoption record.**
  A win that is not attributable to a class of change teaches nothing about the next prompt.
- **When the arms are within a stated indifference margin on quality, break the tie on a
  declared secondary axis** — latency, token cost, output length — chosen before the run.
  Adopting the newer variant because it is newer is how prompts grow; adopting the cheaper
  one on a declared rule is how they shrink.
- **When trial allocation is adaptive** — traffic steered toward the leading arm to reduce
  the cost of serving the loser — accept that arm sizes will diverge and that early noise
  becomes self-reinforcing. Interleaved fixed allocation is the cleaner instrument; adaptive
  allocation is an operational choice that trades experimental cleanliness for regret, and it
  must be declared alongside the band, never left implicit in the serving layer.

## When NOT to use it

- **Safety, correctness or policy fixes are not comparisons.** They ship on the requirement,
  not on a band.
- **Where a difference of a few points genuinely matters** — a criterion tied to a hard ship
  gate — this instrument is the wrong one. Either raise the sample by an order of magnitude
  or decide on human review, and say which you did.
