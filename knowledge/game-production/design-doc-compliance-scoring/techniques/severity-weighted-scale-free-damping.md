---
layer: technique
type: technique
subject: design-doc-compliance-scoring
technique: severity-weighted-scale-free-damping
status: forged
laws: [a-number-carries-its-unit-and-basis, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [turning a list of defects into a score adjustment, a penalty term that caps out, comparing defect load across areas of different sizes]
---

# Severity-weighted, scale-free damping

## The concern

Once findings exist, something must fold them into the score. The reflex is a capped linear
subtraction — two points per finding, capped at ten. That form has three defects operating
simultaneously, and each one teaches a bad behaviour:

- **It saturates.** Past the cap, every additional defect is free. Five findings and five
  hundred produce the same number, so nobody at the bad end of the distribution has any
  incentive to improve, and the metric stops discriminating exactly where discrimination
  matters most.
- **It is severity-blind.** A missing subsystem and an unticked box each cost two points.
- **It is scale-bound.** It counts findings, so a large area always looks worse than a small
  one at the same defect *rate*. The lesson the organisation learns is to split areas.

## Derive from the properties, not from a formula

State what the curve must do first. Four properties, each earning its place:

1. **Strictly decreasing.** Every additional unit of defect load reduces the score by
   something non-zero. This is what kills the cap. Without it the metric is blind over
   precisely the range where a reader needs it to be sharp.
2. **Scale-free.** The input is defect **density** — load over measured surface — not raw
   count. Six findings over eight items is a crisis; six over eighty is a Tuesday. A metric
   that cannot tell them apart rewards re-partitioning instead of repair.
3. **Asymptotic to zero, never reaching it.** A score of exactly zero asserts certainty of
   total failure. Counting findings cannot support that claim — you observed defects in the
   part you measured, which is not the same as observing that nothing works. Reserve the
   endpoints for claims you can actually make.
4. **Severity-weighted.** Load is a weighted sum, not a count, so the curve's input already
   carries the judgement that some findings matter more.

A form with all four, and the one measured in practice:

```
factor = 1 / (1 + load / measuredItems)
score  = conformance * factor
```

Read it: at zero load the factor is 1 and the score is untouched; at load equal to the
measured surface the factor is one half; it approaches zero without arriving. Any curve with
the four properties will do — this one is chosen because it has no tuning constant to argue
about, and because its half-point has a sentence-length interpretation ("one weighted defect
per measured item halves the score") that survives being repeated in a meeting.

## Severity weights

Weights measured on a real surface, and the reasoning that fixes them:

| Severity | Weight | Why |
| --- | --- | --- |
| critical | 4 | the thing does not exist or is actively broken |
| major | 2 | present but does not meet the design |
| minor | 1 | present, meets the design, falls short of the bar |
| informational | 0.25 | bookkeeping — a code-ahead note is not non-conformance |

Keep the ratios coarse and few. Four levels spanning 16× is enough to separate a crisis from
a chore; a nine-level scheme invites arguments about whether something is a 5 or a 6 and
those arguments are never worth their cost. Set informational deliberately near zero rather
than at zero, so a surface drowning in bookkeeping still registers a nudge — the difference
between "we have three loose ends" and "we have three hundred" should be visible somewhere.

## Exclude what the conformance arithmetic already priced

The subtle failure. If a not-implemented item already earns zero credit in conformance and a
partial one already earns half, adding those findings to the defect load punishes them a
second time, and the second punishment is invisible in the output. Same for coverage
findings: an unevaluated item is already reported by coverage, and pushing it into the
penalty converts a coverage fact into a quality one.

So maintain an explicit exclusion set of finding categories that the score already accounts
for, and write down *where* each is priced. The rule is one authority per unit of harm. A
finding excluded from the load is not suppressed — it still appears in the list, because it
exists to be **visible**, not to punish twice.

Resolved findings also leave the load, while remaining listed on their area. The headline
counters report what is outstanding.

## Decision rules

- When someone proposes a cap "so the score does not go too low", ask what decision the
  bottom of the range supports. If the answer is "we would stop everything either way",
  the cap is fine as a *display* clamp and must not be in the model.
- When two areas have equal density but very different absolute counts, the metric should
  rank them equally and the triage list should not. Density belongs in the score; count
  belongs in the work order.
- When measured surface is zero, the damping factor is 1 and the score is not reported at
  all — there is nothing to damp, and a damped nothing is still nothing.
- When tuning weights, change them once and re-baseline everything. Weights that drift are a
  metric whose historical series is meaningless.

## When not to use this

- **Gates with an absolute rule** — "no critical finding may ship" is a predicate, not a
  score, and damping a number is the wrong instrument for it. Run the predicate first; the
  score is for ordering the survivors.
- **Surfaces where defects are independently costed in money or time.** If you can price
  each finding directly, sum the prices; a dimensionless factor throws away information you
  already have.
- **Very small measured surfaces.** At three measured items, density swings violently on a
  single finding. Report the raw list instead and say the surface is too small to score.
