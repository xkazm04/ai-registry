---
subject: goal-pacing-and-forecast
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-iesc-1022 (apply)
dry_streak: 0
---

# goal-pacing-and-forecast

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `measurement-and-economics`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning a monthly revenue or efficiency goal into a month-end forecast, stating a probability of hitting a goal, prescribing a required daily pace or extra spend mid-month, scoring past months against a goal that has changed

**Techniques (5):** band-and-suppressed-early-probability, goal-in-force-per-month, implied-extra-spend-capped, required-pace-divides-by-future-days, weekday-weighted-month-end-projection.

**Applications (5; stacks: node):** node--band-and-suppressed-early-probability, node--goal-in-force-per-month, node--implied-extra-spend-capped, node--required-pace-divides-by-future-days, node--weekday-weighted-month-end-projection.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-10-22 (intake-apply-iesc-1022): implied-extra-spend-capped applied in code on
  systedo-case, `better`. The arithmetic was right, but the card's wording did not
  follow it. A capped curve answer was quoted as an estimate, and a shortfall with no
  return in the window got the on-pace sentence. Two sentences were added to the
  technique: the cap travels as a field, and the replacement copy for an unpriceable
  number must say it cannot be priced. This is the second wording-not-arithmetic finding
  in this subject. The band application of 10-14 found the probability gate obeyed on
  the card and bypassed in the recap, and a third would make it a subject-level rule.
- 2026-10-22 (ia-rpdfd-1022): required-pace-divides-by-future-days applied in code on
  systedo-case, `better`. The arithmetic was right, but the card printed the
  gap-inclusive day count, the projection denominator, as "days remaining" beside a pace
  computed over future days. It never said that any days were missing. Self-contradicting
  displays: A 3/6, B 0/6. This is the third wording-not-arithmetic finding, so the golden
  path now carries it as a failure mode ("the right number among the wrong neighbours"). The technique gained the
  data-to-month-end case: no future days, but not complete. Shipped on branch
  `cur/rpdfd-days-ahead` (6dc7a53c). The master pre-push gate blocked on origin/master
  base reds.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- Applied: band-and-suppressed-early-probability (10-14), implied-extra-spend-capped
  (10-22), required-pace-divides-by-future-days (10-22). Unapplied: goal-in-force-per-month,
  weekday-weighted-month-end-projection.
- The required-pace card does not label a stale series, and it has no warning for a pace
  above the best week the account has delivered (decision rule 4).
- The >2x divergence rule and profit pricing of implied-extra-spend-capped have no
  realization in the fleet. The one marketing code tree shows one basis and knows no
  margin.

## Architecture review - 2026-10-31

First architecture review. All eleven documents read in full. Two internal errors were
found by arithmetic. (1) The recent pace is defined as (projection minus month-to-date)
over future days, but the projection's remainder also carries the expected weight of
interior gap days, so on a gappy month the recent pace is inflated by the same phantom
days the required pace is protected from. A flat 1 000-per-day series with five interior
gaps and its latest point on the 25th of a 31-day month projects 31 000 and reads a
recent pace of 1 833 per day, so the required-to-recent ratio understates the shortfall.
(2) The efficiency extension calls cost over revenue "or its inverse" lower-is-better;
the inverse is higher-is-better. The textbook attribution for the square-root band is
slightly stronger than the source: it says intervals for a sum are tricky because of
correlated errors, and the understatement under positive correlation is arithmetic, not
a quoted warning. The band's square-root growth is exact only for flat weights. No
verification date was refreshed and no consumer tree was reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/goal-pacing-and-forecast",
  "date": "2026-10-31",
  "baseline": "709547f1a",
  "digest": "sha256-b2:4ffe64f12ef56c8f",
  "disposition": "clarify",
  "coverage": "All 11 documents (golden path, 5 techniques, 5 node applications) read in full. One primary source opened (Hyndman and Athanasopoulos, Forecasting: Principles and Practice, section on prediction intervals for aggregates, 2nd and 3rd editions). The P10-P90 quantile and the recent-pace example were recomputed. Not evaluated: the consumer tree at 2893314, 7baeb12a or 7bbd1cab; the practitioner pace-variance bands (10/20/30 percent) and the seven-day velocity index, which the text already labels as convention.",
  "trigger": "pending: no prior architecture-review record.",
  "benefit": "A goal card that keeps banked, projected, band and prescription apart, divides each by the right days, and never prices or prints a number past its evidence.",
  "failure_if_ignored": "On a gappy month the required-to-recent ratio reads easier than it is, the exact comfort the future-day denominator exists to prevent.",
  "boundary": "Monthly revenue or efficiency goals paced from a daily series. Not period significance, campaign budget caps, response-curve fitting or budget moves, which neighbours own.",
  "counterexamples": [
    "A flat 1 000/day series, 31-day month, latest point the 25th, five interior gaps: projection 31 000, (projection - MTD) / 6 future days = 1 833/day although the series runs at 1 000/day.",
    "Return on spend is the inverse of cost over revenue and is higher-is-better; 'a lower-is-better target (cost over revenue, or its inverse)' mislabels it.",
    "With weekday weights of 0.6 and 1.4 on the remaining days, the remaining sum's deviation is sigma x sqrt(0.36 + 1.96) = 1.52 sigma, not sigma x sqrt(2) = 1.41 sigma.",
    "A goal raised in June re-judges March as a miss when scored against today's goal (retained, the subject's own incident)."
  ],
  "sources": [
    {
      "url": "https://otexts.com/fpp3/aggregates.html",
      "result": "Opened 2026-10-31 (also the fpp2 edition, same wording): 'If the point forecasts are means, then adding them up will give a good estimate of the total. But prediction intervals are more tricky due to the correlations between forecast errors.' The book recommends simulation. Supports the honest-minimum framing; does not itself state 'understates whenever positively correlated', which follows from Var(sum) = sum of variances plus twice the covariances."
    },
    {
      "source": "Recomputation",
      "result": "Normal CDF at 1.2816 = 0.900, so P10-P90 is +-1.2816 sd. Recent-pace example above computed: 31 000 projection, 1 833/day recent against 1 000/day actual."
    }
  ],
  "documents": {
    "goal-pacing-and-forecast.md": {
      "disposition": "clarify",
      "reason": "(1) 'Two paces, one card' defines recent pace as (projection minus banked) over future days, which counts gap days' expected revenue as future pace; restrict it to the future days' share of the projection. (2) The textbook attribution should quote what the source says (intervals for a sum are tricky because of correlated errors) and present the understatement under positive correlation as arithmetic."
    },
    "techniques/band-and-suppressed-early-probability.md": {
      "disposition": "clarify",
      "reason": "Step 3's sigma x sqrt(days remaining) is exact only for flat weights; the de-seasonalised model gives sigma x sqrt(sum of squared remaining weekday weights). Gate, quantile (1.2816 checked), zero-noise and all-surfaces rules are sound."
    },
    "techniques/goal-in-force-per-month.md": {
      "disposition": "keep",
      "reason": "Append-only per-month timeline, fallback, idempotent record, complete-months scoring and the back-dated announcement rule are internally consistent and match the application."
    },
    "techniques/implied-extra-spend-capped.md": {
      "disposition": "keep",
      "reason": "Basis choice, cap as an honesty and termination bound, cap-as-field and unpriceable wording rules, and the gate before spend are sound. The 28-day window and 3x cap are labelled convention. It inherits the recent-pace definition from the required-pace technique."
    },
    "techniques/required-pace-divides-by-future-days.md": {
      "disposition": "clarify",
      "reason": "(1) Step 4 divides the gap-inclusive projected remainder by future days, inflating recent pace on a gappy month (counterexample 1); recent daily must be the future days' share of the projection over future days. (2) 'lower-is-better efficiency target (cost over revenue, or its inverse)': the inverse is higher-is-better."
    },
    "techniques/weekday-weighted-month-end-projection.md": {
      "disposition": "keep",
      "reason": "Anchor on latest point, present-day elapsed weight, mean-normalised weights with flat and unobserved-weekday fallbacks, ratio-of-projected-sums and the no-drift statement are consistent and labelled."
    },
    "applications/node--band-and-suppressed-early-probability.md": {
      "disposition": "reverify",
      "reason": "Dated A/B account internally consistent with the technique's two gate rules; the private tree at 7baeb12a was not reopened."
    },
    "applications/node--goal-in-force-per-month.md": {
      "disposition": "reverify",
      "reason": "Line-cited realization and recorded per-scope and back-dated gaps; the tree at 2893314 was not reopened."
    },
    "applications/node--implied-extra-spend-capped.md": {
      "disposition": "reverify",
      "reason": "A/B account consistent with the cap-as-field and unpriceable rules it added; tree at 7bbd1cab not reopened."
    },
    "applications/node--required-pace-divides-by-future-days.md": {
      "disposition": "reverify",
      "reason": "Records the tree's recent daily as (projection minus month-to-date) over future days without naming it as a deviation; under the clarified technique it inflates recent pace on its own gappy fixture. Needs the tree reopened to confirm and record the deviation; not edited here."
    },
    "applications/node--weekday-weighted-month-end-projection.md": {
      "disposition": "reverify",
      "reason": "Line-cited realization at 2893314; records recentDailyRevenue dividing by futureDays (same deviation as above) and sigma x sqrt(daysRemaining). Tree not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items of the record above. The two node applications that
record the tree's recent daily as (projection minus month-to-date) over future days now
describe a deviation from the clarified technique, which they do not name; that stays
`reverify` until the tree is reopened, and is the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/goal-pacing-and-forecast",
  "date": "2026-10-31",
  "baseline": "709547f1a",
  "digest": "sha256-b2:d5a80ab1674925a0",
  "disposition": "reverify",
  "coverage": "All 11 documents decided. The three clarify items owed by the first 2026-10-31 record (golden path, band, required pace) were applied and the edited sections re-read; the FPP aggregates section was opened this run and quoted, and the recent-pace and weight arithmetic recomputed. The other eight documents are byte-unchanged and keep their dispositions. No consumer tree was reopened and no verification date was refreshed.",
  "trigger": "pending: no prior architecture-review record.",
  "benefit": "A goal card that keeps banked, projected, band and prescription apart, divides each by the right days, and never prices or prints a number past its evidence.",
  "failure_if_ignored": "On a gappy month the required-to-recent ratio reads easier than it is, the exact comfort the future-day denominator exists to prevent.",
  "boundary": "Monthly revenue or efficiency goals paced from a daily series. Not period significance, campaign budget caps, response-curve fitting or budget moves, which neighbours own.",
  "counterexamples": [
    "A flat 1 000/day series, 31-day month, latest point the 25th, five interior gaps: projection 31 000, (projection - MTD) / 6 future days = 1 833/day although the series runs at 1 000/day.",
    "Return on spend is the inverse of cost over revenue and is higher-is-better; 'a lower-is-better target (cost over revenue, or its inverse)' mislabels it.",
    "With weekday weights of 0.6 and 1.4 on the remaining days, the remaining sum's deviation is sigma x sqrt(0.36 + 1.96) = 1.52 sigma, not sigma x sqrt(2) = 1.41 sigma.",
    "A goal raised in June re-judges March as a miss when scored against today's goal (retained, the subject's own incident)."
  ],
  "sources": [
    {
      "url": "https://otexts.com/fpp3/aggregates.html",
      "result": "Opened 2026-10-31 (also the fpp2 edition, same wording): 'If the point forecasts are means, then adding them up will give a good estimate of the total. But prediction intervals are more tricky due to the correlations between forecast errors.' The book recommends simulation. Supports the honest-minimum framing; does not itself state 'understates whenever positively correlated', which follows from Var(sum) = sum of variances plus twice the covariances."
    },
    {
      "source": "Recomputation",
      "result": "Normal CDF at 1.2816 = 0.900, so P10-P90 is +-1.2816 sd. Recent-pace example above computed: 31 000 projection, 1 833/day recent against 1 000/day actual."
    }
  ],
  "documents": {
    "goal-pacing-and-forecast.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: recent pace now defined as the projection's share for the future days over future days, excluding interior gap days; the textbook attribution now quotes the source ('more tricky due to the correlations between forecast errors') and states the understatement under positive correlation as arithmetic."
    },
    "techniques/band-and-suppressed-early-probability.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 3 states that the square-root multiplier is strictly sqrt(sum of the remaining days' squared weekday weights), equal to sqrt(days remaining) only for flat weights."
    },
    "techniques/goal-in-force-per-month.md": {
      "disposition": "keep",
      "reason": "Append-only per-month timeline, fallback, idempotent record, complete-months scoring and the back-dated announcement rule are internally consistent and match the application."
    },
    "techniques/implied-extra-spend-capped.md": {
      "disposition": "keep",
      "reason": "Basis choice, cap as an honesty and termination bound, cap-as-field and unpriceable wording rules, and the gate before spend are sound. The 28-day window and 3x cap are labelled convention. It inherits the recent-pace definition from the required-pace technique."
    },
    "techniques/required-pace-divides-by-future-days.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4 now computes recent daily as month-to-date x (future days' weight / elapsed weight) over future days, with the gapless equivalence and the 1 833-versus-1 000 counterexample; the efficiency extension now says return on spend is higher-is-better with the comparison flipped."
    },
    "techniques/weekday-weighted-month-end-projection.md": {
      "disposition": "keep",
      "reason": "Anchor on latest point, present-day elapsed weight, mean-normalised weights with flat and unobserved-weekday fallbacks, ratio-of-projected-sums and the no-drift statement are consistent and labelled."
    },
    "applications/node--band-and-suppressed-early-probability.md": {
      "disposition": "reverify",
      "reason": "Dated A/B account internally consistent with the technique's two gate rules; the private tree at 7baeb12a was not reopened."
    },
    "applications/node--goal-in-force-per-month.md": {
      "disposition": "reverify",
      "reason": "Line-cited realization and recorded per-scope and back-dated gaps; the tree at 2893314 was not reopened."
    },
    "applications/node--implied-extra-spend-capped.md": {
      "disposition": "reverify",
      "reason": "A/B account consistent with the cap-as-field and unpriceable rules it added; tree at 7bbd1cab not reopened."
    },
    "applications/node--required-pace-divides-by-future-days.md": {
      "disposition": "reverify",
      "reason": "Records the tree's recent daily as (projection minus month-to-date) over future days without naming it as a deviation; under the clarified technique it inflates recent pace on its own gappy fixture. Needs the tree reopened to confirm and record the deviation; not edited here."
    },
    "applications/node--weekday-weighted-month-end-projection.md": {
      "disposition": "reverify",
      "reason": "Line-cited realization at 2893314; records recentDailyRevenue dividing by futureDays (same deviation as above) and sigma x sqrt(daysRemaining). Tree not reopened."
    }
  }
}
```
