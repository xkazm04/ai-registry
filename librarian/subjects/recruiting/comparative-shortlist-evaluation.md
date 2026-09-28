---
subject: comparative-shortlist-evaluation
domain: recruiting
last_touched: 2026-09-27
dry_streak: 0
---

# comparative-shortlist-evaluation

First touch by `/deepen`. This was a single-subject run dispatched by the Curator
lane on the scan finding "never swept by the librarian". Nothing was expired or at
risk. Registry HEAD at dispatch was 55c6bce2. The primary checkout's main was 146
behind origin, so the run worked from origin/main in a detached worktree. The
consumer was read at kp's local main, `4ca00a8d2`. The fixes landed at `d7194ea64`
and `29430f170`; the cited files did not change in between.

## 2026-09-27 - the mean is a weighting, a band is compared to a band, the model reads candidates in more than one order

**Depth rung:** L2 primary for the corrections:
- the league-table and ranking-under-uncertainty papers (Goldstein and Spiegelhalter
  1996; Lin, Louis, Paddock and Ridgeway 2009);
- interval-overlap statistics, and the measurement-uncertainty guide on linear
  against quadrature combination;
- personnel score banding: Cascio et al. 1991, Schmidt 1991, and the Ninth Circuit's
  1992 banding opinion;
- the score-adjustment clause of the 1991 civil-rights amendments;
- the federal selection guidelines' small-number clause, and the four-fifths power
  papers (Morris and Lobsenz 2000; Roth, Bobko and Switzer 2006);
- decoy effects in hiring (Highhouse 1996; Slaughter, Sinar and Highhouse 1999),
  with their consumer-research replication failures (Frederick, Lee and Baskin 2014;
  Yang and Lynn 2014);
- joint against separate evaluation (Bohnet, van Geen and Bazerman 2016; a 2026
  field replication for race);
- flat maximum (Wainer 1976; Dawes 1979) and weight-space acceptability (Lahdelma et
  al. 1998);
- axis-truncation perception (Correll, Bertini and Franconeri 2020);
- EU Directive 2023/970 Art. 5 and Art. 34, and California Labor Code 432.3;
- model-judge position bias (Zheng et al. 2023; Wang et al. 2023) and pairwise
  resume-choice bias (Rozado 2026).

L3 empirical: four harnesses over kp's own pipeline, keyless, with nothing written
into its tree. Two code fixes in kp with tests.

**Lanes:** counter-evidence on all ten claims (web); training-data-only (blind);
consumer-tree re-verification (read-only).

**Landed** in b4751b25:
- **New technique, `counterbalanced-candidate-order` (web + blind):**
  - Model judges favour a position, and a pairwise frame brings out name
    preferences that separate rating hides.
  - Decide the claims in code, run order-sensitive steps under at least two orders,
    and emit only what survives the reorder.
  - The human finding runs the other way: joint evaluation debiases people. That
    went into the golden path as its own paragraph.
- **Flipped, cross-scheme (both lanes):**
  - For a linear composite the row mean is the centroid weighting: a weighting, not
    a test.
  - Under tight bounds a pass is near-certain (flat maximum), so the report states
    how far the schemes moved.
  - Variance is read from the scheme vectors, never from a rationale channel.
    That rule came from the consumer.
- **Conditioned, "do not re-rank" (both lanes):**
  - Over estimates from few observations the raw order crowds high-variance records
    at both ends. Shrinkage is re-estimation; lower-bound ranking is still refused.
  - Measured not to bite where absence is scored as lost points.
- **Conditioned, separation (both lanes):**
  - Compare against the runner-up's band, never its point.
  - Non-overlap is a conservative display rule, not a significance test.
  - The linear band is the worst case (web only, the measurement guide).
  - Overlap is not a chain, and never licenses a within-band choice on a
    protected characteristic.
  - Ties at the top are ties.
- **Conditioned, floors (both lanes):** a statistic that clears its floor still
  needs an interval and pooling.
- **Conditioned, composition (both lanes):** the decoy effect holds in hiring and in
  all-numeric displays. Record the membership rule and flag a member dominated on
  every dimension.
- **Conditioned, currency family (both lanes):** pay history is not incommensurable,
  it is excluded outright. A stated expectation is lawful to ask. A withheld value
  says withheld.
- **Corrected, golden path (web + blind):** an axis-truncation marker does not
  repair a stretched scale.
- **Applications:**
  - Three re-verified to 2026-09-27; nearly every line number moved.
  - The 08-20 cross-scheme claim that variance was read from `weightNotes` was
    already false when written. The proposer had noted every candidate since 08-11.
  - Two new: robustness status (node, a code fix) and the narrator's order
    (process, deviations only).

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Keep the point order; change only the vocabulary | conditioned (estimate-noise case) | web + blind |
| Separation = floor strictly above the runner-up's ceiling | confirmed, conditioned (conservative, not a test) | web + blind |
| The band is additive widenings, monotone, clamped for display | conditioned (linear = worst case) | web; blind don't-know |
| Head-to-head floor 2, statistical floor separate | confirmed, conditioned (interval, pooling) | web + blind |
| Cap at a handful | conditioned (composition is a lever) | web + blind |
| A comparison surface is where bias pressure is highest | refuted for human reviewers, confirmed for models | web + blind |
| Cross-scheme robustness, no-op trap, bounded projection | confirmed; the mean flipped | web + blind |
| Ties are ties; do not stretch an axis | confirmed | web (axis), blind |
| Withhold incommensurable fields, do not convert | confirmed, conditioned (pay history) | web + blind |
| The narrator is handed the status, never asked who wins | confirmed | web + blind |

## Applied

Six rows in `librarian/applied.md` against kp and two fleet-level rows:
- **better, code:** the fairness panel read "any weight note" as variance and
  rendered the robust-order copy on 2 of 3 real no-op cohorts. A shared
  `schemesVary` gives 0 of 3 (`d7194ea64`).
- **better, code:** the slate compared a pick's floor with the runner-up's point.
  Every 5-8 point gap between tight bands was marked separated. Band against band
  gives 0 of 3 wrong (`29430f170`).
- **better, experiment:** mean order equals the centroid order in 1,856 of 1,856
  cohorts. No scheme crowned another sole leader (0 of 1,856), and no third
  candidate reversed a pair (0 of 5,764). 96 exact ties at the top were rendered as
  one first place.
- **not-better, experiment:** kp's leader has the widest band in 16.3% of 4,414
  cohorts. The estimate-noise pattern is absent, and the rule gained its condition
  instead of kp gaining a change.
- **unmeasurable:**
  - counterbalancing needs model spend;
  - the decoy needs recruiter choice logs;
  - joint evaluation needs human reviewers.
- **unapplied:** pay history, because kp stores none.

## Impact

kp: 10 contexts map this subject, all unjudged, so the landing staled 0 verdicts.
kp's map is `ba0244f82` and its rows are `bfccdec92`. Both are committed on kp's
local main and not pushed, because kp main carries other sessions' unpushed
commits.

## Deviations recorded as owed (kp)

1. `separationNote` and the table chip are silent for `unknown`.
2. Ties at the top are broken by input order, and no overlap group larger than two
   is reported.
3. The narrator receives no separation, robustness, bands or cohort size. It is
   told to name "who leads", reads candidates in score order, and its deterministic
   twin crowns regardless.
4. A missing currency defaults to the app currency.
5. A withheld figure reads as `null`.
6. Pay basis is unchecked.
7. Early-career and experienced candidates are sorted on one total, despite the
   pipeline's own "two incomparable scales".
8. Differentiators key on raw skill strings, report no hidden count and no
   complement, and are computed for the lead only.
9. The robust-order panel shows no scheme count, no weight distance and no
   flipping scheme, and styles one of two tied means as first.
10. The seal lacks the schemes used, the runner-up band and the withheld fields.

## Declined

- **Composition moves the centroid yardstick.** This was a conjecture of the run,
  not a lane finding. Measured 0 reversals in 5,764 cases under kp's bounds; not
  written.
- **Audit the band's drivers by group.** Single lane (blind). The drivers "few
  skills listed" and "education unknown" may correlate with protected groups. Banked
  with the return condition: when a fleet project records band drivers against
  outcomes.
- **Selection-induced negative correlation inside a shortlist.** Single lane
  (blind). Collider and range restriction could make reweighting flips likelier at
  the top than population flat-maximum suggests. kp's 0 of 1,856 is weak evidence
  against it at ±0.15 bounds. Banked: return when a project runs wider bounds.
- **Stated expectations proxy the gender pay gap.** Single lane (blind, from a
  popular book). Banked: return with a primary study.

## Leads banked

- Weight-space acceptability (SMAA) as a replacement report for the matrix. Both
  lanes name it, but no consumer computes it. Return when a project wants "how much
  would have to change" answered.
- A 2024 retrieval-bias study posted a correction on 2026-08-29 inverting its
  gender-only direction. Do not cite that direction. Its race and intersectional
  results replicated.
