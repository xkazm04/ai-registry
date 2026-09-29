---
domain: recruiting
subject: small-sample-honesty-in-hiring-analytics
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# small-sample-honesty-in-hiring-analytics

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ssh-0929)

The Curator lane dispatched this on "never swept by the librarian". True: the subject stood
at its founding revision of 2026-08-21, with no note, no `applied.md` row and three
applications verified on 2026-08-20. `check-currency` reported no row for it, so no clock had
run out; the pass was driven by the missing sweep and by a consumer that had moved under it
(kp added a significance test to its four-fifths check on 2026-09-26, an accrual-horizon
module on 2026-09-23 that cites the technique by name, and fixed a certified-off-five
headline on 2026-08-29).

Lanes that ran:
- a **blind training-data lane**, no tools and no file, asked for the design rules and the
  three claims a plausible guideline would most likely get wrong;
- a **web counter-evidence lane** on five claims (the thirty-per-group floor and the federal
  selection-procedures text, the small-category audit rule, reciprocal-of-resolution sizing
  against sampling uncertainty, thin-state display against funnel plots and shrinkage,
  suppression floors as privacy versus reliability), with instructions to quote only text it
  had read and to say "not verified verbatim" otherwise;
- an **empirical lane with known ground truth**, on this machine: seeded simulations (equal
  true rates, 20,000 draws per row; eight equal cells), then kp's *real*
  `computeAdverseImpact` at `f0395dbec` run against the same ground truth, 4,000 draws per
  row, and a calibration check of the statement that was then added;
- **primary reads**: 29 CFR 1607.4(D) and the EEOC's Questions and Answers on the guideline
  (both fetched and the quoted sentences matched verbatim on this machine), and a re-read of
  kp for every line citation in the three applications, plus the surfaces they had not
  covered.

**Corrected or conditioned (claims that carried no basis, a stale one, or a contradiction):**
- **"A headline floor is the reciprocal of the resolution you display."** That sizes
  granularity, not noise. At eight one observation moves a rate about twelve points, and four
  of eight is compatible with 22% to 78% (Wilson 95%). Now said, with the interval owed.
- **"The selection-rate floor is a statistical one" (thirty per group).** The guideline text
  names no head-count; its tests are significance, practical significance, whether one
  different person would flip the result, and judging too-small numbers over a longer
  period. Thirty is a borrowed rule of thumb, and kp's own comment says so. The ratio alone
  flagged 78% of equal pairs at thirty per group and a 10% base rate.
- **"Assessed, no concern is a positive claim."** It is, and it is bound to what it could have
  seen. Against kp's real function at a 10% base rate and thirty per group the verdict mix for
  equal groups (3 finding / 77 watch / 20 clean) is the same as for a group at half the rate
  (5 / 78 / 17). A clean line there is a computation that fired.
- **"Count the minimum in the unit the claim rests on."** Extended from the display unit to the
  filtered subset. kp printed "over 9 hires", measured and certifiable, for a median resting
  on five against a floor of eight; the producer had been fixed and nothing read the field.
- **"A refusal with a date is a plan."** Some refusals have no honest date. Three named
  reasons (no pace, a rolling window that can never hold the floor, a point-in-time figure),
  and the pace counted in the sample's own unit.
- **"A highlighted best or worst cell must be measured."** Necessary, not sufficient. Eight
  equal cells of fifteen crown a best at about 47% against a true 30%.
- **"Zero is a measurement."** Kept, and bounded: zero in ten is compatible with about 26%.
- **Floors of five on a group** are a privacy floor, not a reliability floor; the seam now
  says so and points at the benchmark discipline. A permitted small-category exclusion
  (New York City's bias-audit rule, under two per cent of the data) stays a disclosed one,
  with count and rate.

**Verified, left alone:** the three states (the blind lane named five, adding *immature* and
*not evaluable*; both are already carried, by the accrual technique's "preliminary" label and
by the three-verdict check); typed refusal over a sentinel zero; per-claim minimums, and in a
unit (the blind lane reached both unprompted); gating at the granularity the claim is read at;
no percentage, trend or colour below the floor; a skipped check never counts as passed;
pooling over a longer window for a chronically small group; the rule-of-three bound (the
source's own note: exact 26% at n=10 against 30%, slightly overstated below thirty);
"offer acceptance matures in days" (kept, with the tail banked below).

**Earned: one technique.** `state-what-the-sample-could-have-seen`. Convergence: the blind
lane (high confidence on all four clauses: interval beside a rate at the minimum, a zero's
upper bound, a not-evaluable fairness verdict with an exact test above the gate, the winner's
curse ban) reached them before reading the file; the counter lane found the primary sources
(Brown, Cai and DasGupta; Hanley and Lippman-Hand; Gelman and Price; Spiegelhalter); the
ground-truth simulation and kp's real function measured them. The asymmetry (a significant
exact-test result needs no statement and no floor on selections; a clean line does) rests on
the simulation, the guideline text and kp's own test that refuses a numerator floor.

**The tree found what no lane asked.** kp already conformed to two techniques and the
applications did not know: the significance companion and `unassessedGroups`, and the
accrual module (three named no-date reasons; age-matched periods; a per-cell movement gate at
five). It also held one un-noticed seam of its own making: the accrual pace is hires per week
while `time_to_hire` is sampled on the narrower usable set, so its date is about 1.8 times too near on the shipped corpus.

**One mistake in this pass, kept.** The first calibration check of the detectable-gap
statement counted only findings below 80% and read 40% at a 30% base rate with a thousand per
group. The table said the statement was wrong; the fault was in what was counted (the product
also reports a significant gap above 80%). Counting what the product actually reports gave
79-83% in every cell. Measure the claim the way the product states it.

**Applied** (six rows in `applied.md`):
- **code, better:** the detectable-gap statement in kp (`775c5d02e`, local). The real function
  against seeded ground truth: before, the not-significant and clean lines said nothing about
  sensitivity in any cell; after, a group at the stated ratio is shown 79-83% of the time
  across rates 0.1-0.5 and 30-1,000 per group. n is 13 cells of 4,000 draws (two more state that not even a group never selected could be shown), and a
  deterministic test pins it. Four locales, `i18n:check` in parity, `tsc` clean for the files.
- **unapplied, five:** the count-after-exclusions rule (kp already conforms since
  `acaf90157`; the other metrics' samples match their arithmetic), the two accrual conditions
  (kp has the first; the pace-in-the-sample's-unit seam is observed, not changed), the
  disclosed small-category exclusion (kp names how many groups it did not assess, not their
  counts), the superlative rule (no project names a best source or stage), and the interval
  clause on a rate at its floor (the offer acceptance rate shows a whole percent at five).

**Applications.** Three re-resolved against kp `775c5d02e` and re-verified to 2026-09-29;
every line citation had moved in at least one of them, the `certifiable` line had moved from
243 to 361 and gained a clause (a windowed pack is not certifiable off the capacity snapshot
alone), the calibration constant now lives in a generated file, and the guardrail G10 range
was wrong by four lines. Two new node applications: the experiment above, and the accrual
module with its cohort fold.

## Impact

- **kp:** the map rebuilt at this landing (registry `origin/main` plus these commits) joins the
  subject to seven contexts and carries **one** verdict judged against the previous digest, now
  stale: that one context is `/conform --stale`'s queue from this landing. The kp map is
  committed locally as `0b3d183d4`, with the detectable-gap change at `775c5d02e`; kp's main is
  46 ahead of origin and neither was pushed.
- No other project maps this subject.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3 for the adverse-impact and interval claims (kp's real function against known ground truth; guideline text read verbatim), L2 for the audit-rule and reporting-standard claims (a lane's reading of the adoption notice and the agency papers), L1 for the offer-maturity tail (a vendor trend report) |
| Last-pass yield | high: 1 technique, 8 corrections or conditions, 3 applications re-resolved, 2 new applications, 1 code change |
| Dry streak | 0 |
| Clocks | New York City's bias-audit rules and the federal guideline: re-check by 2027-03-29; vendor and press figures by 2026-12-29 |
| Demand | kp, by seven joined contexts |

## Banked leads

- **Offer-decline maturity.** One large applicant-tracking vendor's trend report puts acceptances
  at about two days and decliners at about six, which would make an early read of the offer
  acceptance rate overstate. Single lane, vendor data, and the direction follows from
  censoring but is unmeasured. Return: a second source, or kp's own offer events (sent, decided).
- **The national health statistics reporting standard behind "thirty."** The abstract confirms a
  minimum denominator paired with an interval-width limit; the number itself is from slides
  and a search summary. Return: a fetch of the report text (the agency site refused the
  fetch tool).
- **Cluster correlation in dwell time and time to hire** (candidates within one role are not
  independent; a floor counted in candidates overstates the evidence). Blind lane only.
  Return: a second lane, or a reading of a survey-sampling source.
- **Censoring methods** (survival estimates instead of excluding open cases) as the stronger
  form of the accrual technique. Blind lane only. Return: a second lane.
- **Complementary suppression** (a small cell can be recovered by subtracting from a total, so
  the next-smallest is suppressed too). One product's documentation says it does this; the
  benchmark discipline owns the privacy floor. Return: a check whether that subject states it.
- **OFCCP or EEOC guidance on exact tests and shortfall analysis for small samples.** The lane
  found the guideline's own Q&A and nothing more. Return: an agency technical-assistance read.
- **kp: the levels of the segmented rows** (a source's own conversion rate) were not re-read for
  a floor; only the movement gate was. **kp: the forecast band** does not read the accrual
  module. **kp: the offer acceptance rate** shows a whole percent at five with no interval.
- **A floor for the not-significant "watch" verdict.** At a 10% base rate and thirty per group
  it fires on 77% of equal pairs and 78% of half-rate pairs; the detectable-gap line now says
  so, but the verdict still renders in the same amber. Return: the next kp compliance pass.
