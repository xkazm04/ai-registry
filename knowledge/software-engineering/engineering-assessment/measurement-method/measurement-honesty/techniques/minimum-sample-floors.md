---
layer: technique
type: technique
subject: measurement-honesty
technique: minimum-sample-floors
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [deriving a percentage or rate from a countable set, a metric swings wildly between runs, a new or low-volume subject is being scored]
---

# Minimum sample floors

Every derived rate has a denominator, and the denominator is the part that does
not render. Once the quotient is formatted, "80%" over five observations and
"80%" over five hundred are the same eleven pixels, and every consumer treats
them the same way. The floor is the rule that stops the first one from being
produced at all.

## The argument from swing width

The decisive quantity is not statistical significance — it is **swing width**:
how far the reported number moves when one more observation arrives.

| denominator | one observation is worth | can it cross a 25-point band? |
| --- | --- | --- |
| 1 | 100 points | trivially |
| 2 | 50 points | trivially |
| 4 | 25 points | exactly |
| 5 | 20 points | usually |
| 10 | 10 points | rarely |
| 25 | 4 points | no |

Set the floor where the swing drops below the width of the smallest decision
the number feeds. If the number selects among bands twenty-five points wide,
a denominator of four means one arrival can flip the classification —
the metric is reporting the composition of the sample, not the property of the
subject. **Below the floor there is no signal to report at any confidence, so
report none.**

This is why "a rough number is better than nothing" is false here in a specific
way: the rough number is not a low-confidence estimate of the truth, it is a
high-variance function of which items happened to be in the window. Averaging
it, trending it, or banding it all inherit the variance and none of them
recover a subject property.

## The procedure

1. **Pick the floor from the consuming decision, not from tradition.** Take the
   narrowest band or threshold the rate feeds; require a denominator at which
   one observation moves the rate less than that width. A floor around five is
   a reasonable default for rates feeding coarse classification, and it is a
   floor to justify, not a constant to copy.
2. **Apply the floor to *every* derived rate in the family, in one place.**
   Rates computed side by side must share the gate, or the report shows one
   suppressed cell beside three fabricated ones and the reader concludes the
   suppression is a bug.
3. **Return absence, not a sentinel.** Below the floor the rate is
   *unmeasurable-for-now* in the sense of
   [unmeasurable-vs-zero](./unmeasurable-vs-zero.md), and it must be typed as
   absent. Zero, negative one, and "0%" are all worse than absence and all get
   charted.
4. **Report the denominator with the rate, always.** Above the floor, the
   number still carries its predicate — "72% of 18 reviewed" — per
   [count-carries-predicate](../../../../_laws.md#count-carries-predicate). This is
   what lets a reader apply their own, stricter floor.
5. **Make the refusal actionable.** "Insufficient data (3 of 5 needed)" is a
   next action; a blank cell is a bug report. The refusal names the shortfall
   and, where the subject controls it, what would close it.
6. **Never let a below-floor rate reach an aggregate.** A suppressed rate that
   still contributes to a parent average re-imports exactly the variance the
   floor removed. It leaves the numerator and the denominator both.

## Secondary rules that travel with the floor

- **Precision follows the sample.** A rate over seven items resolves to about
  fourteen points; rendering it to two decimals claims a resolution four orders
  of magnitude finer than the evidence. Round the display to the granularity
  the denominator supports — whole percents at two digits of sample, and
  nothing finer.
- **Window and floor interact.** Shrinking a time window to make a metric
  "current" shrinks its denominator; a rate that was solid at ninety days can
  drop below the floor at fourteen. Recompute the floor check per window rather
  than per metric, and expect short-window views to legitimately show more
  refusals.
- **A floor is not a warm-up excuse.** For a genuinely new subject the floor
  produces refusals for a while, which is correct and should be labeled as
  *new*, not as *bad*. The one thing never to do is grant new subjects a
  provisional number "until real data arrives" — provisional numbers are
  screenshotted, cited, and never revisited.

## When not to use it

- **For counts, not rates.** "Three incidents" is a complete fact at n=3; it
  needs its predicate, not a floor. The floor exists because division amplifies,
  and only ratios divide.
- **When the population is the sample.** If the denominator is the entire
  universe of the thing — all four services a team owns, all three release
  channels — the rate is a census, not an estimate, and swing width is not an
  error term. Say "3 of 4", not "75%", and no floor applies.
- **When the rate is a leading indicator whose direction is the payload.** Some
  operational signals are consumed as "is this obviously broken", where crossing
  from *any* to *none* matters more than the ratio's value. Gate the *display of
  a percentage* rather than the underlying alarm.
- **When suppression itself leaks.** If a subject can be identified as
  low-volume by the pattern of its refusals, and that inference is sensitive,
  the floor needs to be paired with a suppression policy that hides the shape
  too — a concern that belongs to whichever subject owns disclosure ethics, not
  here.
