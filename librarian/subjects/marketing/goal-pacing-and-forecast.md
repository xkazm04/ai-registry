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
