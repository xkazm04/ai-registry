---
subject: compensation-banding-and-market-honesty
domain: recruiting
last_touched: 2026-09-27
dry_streak: 0
---

# compensation-banding-and-market-honesty

This is the subject's first touch by `/deepen`: a single-subject run dispatched by the
Curator lane on the scan finding "never swept by the librarian". Nothing was expired or
at risk. The scan showed 22 consults and 0 deviations, with kp as the only contributor.
The clock that made a content pass worth running was regulatory: the EU pay-transparency
transposition deadline (7 June 2026) passed after the 08-20 claims were written.

Registry HEAD at dispatch was 55c6bce2. The primary checkout's main was 146 behind
origin, so the run worked from origin/main in a detached worktree. kp was read at
4ca00a8d2, and the experiments ran at f39924f81; no cited file changed between the two.

## 2026-09-27 - the bias runs both ways, a floor counts contributors, price the role not the person

**Depth rung:** L2 primary for the corrections:
- the EU directive's Art. 5 and Art. 34 text;
- the New York pay-transparency statute;
- the 1996 health-care statement text;
- the 2025 worker guidelines;
- a statistics office's disclosure rules;
- NBER working papers on posted versus realised pay and on a state mandate's effect;
- the wage-tracker working paper;
- two applied-psychology experiments on range width;
- the experience meta-analysis;
- court opinions on seniority as a pay criterion;
- arXiv audits of LLM salary advice.

L3 empirical for three rows, all run against kp:
- a mutation A/B on the grounded prompt;
- a read-only query over the live reference corpus;
- the advertised-against-survey ratios from the committed market snapshot.

**Lanes:**
- counter-evidence on pay transparency and advertised pay (web);
- counter-evidence on methodology, anonymity floors and LLM pricing (web);
- training-data-only (blind);
- consumer-tree re-verification (read-only).

**Landed** in be222b6d:
- **Flipped, golden path (both lanes):**
  - The EU directive does not require pay in the advert. It requires pay before the
    interview, "such as in a published job vacancy notice, prior to the job interview
    or otherwise", and it bars asking about pay history.
  - US coverage needs an employer nexus plus a work or reporting location.
  - A wide range is read as evasive. It changes who applies more than how many.
- **Flipped, advertised pay (both lanes):**
  - The bias runs both ways: posted pay sits above earnings in low-wage occupations and
    below them in high-wage ones.
  - Disclosure is an inverted U across occupations.
  - The sanity check fires on a gap in either direction, and a one-factor level
    correction is refused.
  - The capital-last inversion is a corpus tell, not a routine.
- **Conditioned, advertised pay (web; blind on composition):**
  - Widening under mandates is descriptive and patchy; the one causal study found none.
  - The posting lead is about 7 months in the US and roughly concurrent in continental
    Europe and the UK.
- **Flipped, anchor bands (both lanes):**
  - A floor counts distinct contributors with a dominance cap, never rows.
  - The safety zone is withdrawn, and no participant count is a harbour.
  - Interpolation is geometric.
  - Experience is a lawful pay factor. Pay steps keyed to age, and caps that act as age
    filters, are where the risk sits.
- **Conditioned, provenance (both lanes):**
  - The aging factor comes from a salary-increase survey or a wage index.
  - The staleness clock runs from the effective date. Six months is a heuristic.
  - The build date is not the vintage.
  - The median names its pay basis and its percentile method.
- **Conditioned, currency lock (web; blind unsure):** "reproduces across model families"
  is withdrawn. The effect is measured for fiscal figures, not salaries, and the recorded
  mirror failure is a model obeying a hard-coded currency.
- **New technique, `price-the-role-not-the-person` (both lanes):** LLM salary advice
  moves with the asker's name, gender and origin. Voice and model version move it too,
  and anchors counteract it.
- **Applications:**
  - Three re-verified to 2026-09-27, with moved lines and new deviations.
  - One new python application, carrying the mutation A/B.

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Omission concentrates at the top of the market | conditioned: an inverted U across occupations; top-heavy within an occupation or firm | web + blind |
| Advertised pay understates earnings; floors sit below realised pay | refuted as general: both directions by wage level; realised pay falls below floors more often | web + blind |
| Ranges widened under transparency rules | conditioned: descriptive pockets, no causal widening | web + blind |
| A wide range measurably deters applicants | conditioned: impressions yes; volume no; the applicant mix shifts by gender | web; blind unsure |
| Obligation attaches to the work location; the EU requires pay in the advert | conditioned / refuted on the EU wording | web + blind |
| The capital routinely ranks lowest by advertised pay | refuted as routine; a corpus tell | web; blind silent |
| Earnings set the level, postings the trend; postings lead | conditioned: the lead varies by market | web + blind |
| Age by a stated factor; 12 and 6 month limits | 12 confirmed as a norm; 6 unsourced | web + blind |
| Floor of 3 is meaningful and anonymous | refuted: contributors, dominance, no harbour | web + blind, and a kp experiment |
| Median, not mean | confirmed; the basis and the mean's legitimate uses added | web + blind |
| Years is a discriminatory proxy | overstated: lawful factor, age-keyed rules are the risk | web + blind |
| Linear interpolation is adequate | conditioned: geometric | web + blind |
| Models drift to the dominant currency across families | unverified for salaries; mirror failure recorded | web + blind + tree |
| Grounded band read-only; uncalibrated emits nothing; money constants in the market record | confirmed | blind; the tree for the last |

## Impact

- **kp: 9 contexts, 10 pairs** at subject revision 3:
  - `db-tasks-agents-misc`, `job-intake-schema`, `jobs-intake`;
  - `market-data-pipeline`, `matrix-grid`, `results-detail-tabs`;
  - `spark-feature-showcase`, `spark-trust-market`, `tests-interview-jobs`.

  0 judged, so 0 stale verdicts against this subject. The map was rebuilt and committed
  in kp at 2466b18d8. No other fleet project joins this subject.

## Owed to kp (recorded as deviations, not fixed)

- **`belowMarket` is `None` only on a currency mismatch.** A missing market band yields
  `False`. So does a band `normalize_job` imputed and marked `defaulted`, because
  winnability ignores the marker.
- **The Berlin demonstration market's refusal is bypassed for every recognised family.**
  `normalize_job` stamps a band from the `de-berlin` benchmark block, which holds
  "NOT sourced" sample bands, and `draft_offer` refuses only when the job carries none.
  The refusal tests reach the fallback by clearing the band by hand.
- **The reference-corpus floor counts rows.** All 12 published cells are one employer's.
- **`sample_k` means thousands of surveyed employees in the anchor corpus**, yet it is
  documented as rows beside `THIN_SAMPLE_K`. The aggregate fills the same field with a
  row count.
- **No survey vintage on either corpus.** `asOf` is the build or insert date.
- **The market snapshot imputes missing deciles with fixed multipliers**, against its
  own "we leave it out rather than estimate it". The survey period is read from one row.
- **The grounded salary result:**
  - carries no model version;
  - offers the model no anchor;
  - trusts the returned currency, with no plausibility ceiling;
  - hard-codes the period.
- **Two writers of the JD-derived job skip the grounded-band pin helper**: the revision
  revert and the late-link ingest. The PATCH path and first ingest call it.
- **Refusals are not counted.**

## Applied

Five rows in `librarian/applied.md`. Three are also in kp's `.ai/applied.jsonl`
(2466b18d8):
- identity-free prompt: code, better (guard committed at 4c5b45387);
- contributor floor: experiment, better;
- advertised bias both ways: experiment, unmeasurable at region grain;
- geometric interpolation: unapplied, because kp interpolates nowhere;
- golden-path transparency and experience: unapplied, because no fleet project posts
  into a covered jurisdiction.

kp's two commits sit on its local main, **not pushed**. kp main has diverged, 73 ahead
(other sessions' unpushed commits) and 3 behind origin. Integrating that is not this
run's history to rewrite or publish.

## Declined

- **The New Jersey range-width cap (60% of the minimum).** A web-lane search summary
  only; the statute was not read. Not cited.
- **A single numeric lead for posted wages.** Indeed's 7-month figure is a chart
  alignment, not a published lag statistic. It is cited as "about", with the market
  condition, and not as a constant.
- **"Rounding grain must stay below the midpoint progression."** The web lane's own
  inference, with no source and no second lane. Banked, not landed.

## Banked leads

- **The rounding grain against the midpoint progression.** A grain coarser than the
  10-15% step between levels collapses adjacent bands. Return: when a second lane or a
  tree shows two levels rounding to one band.
- **Refuse versus a proxy-derived number** (blind): practitioners price thin markets as a
  base market times a geographic differential, flagged. Return: when a fleet project
  holds a sourced geographic differential.
- **Modifier overlap** (blind): a stage premium and a specialisation premium overlap, so
  the clamp belongs on the product, not only on each factor. Return: when a project
  stacks two modifiers.
- **Job-match quality recorded per cell** (blind): matching error dominates statistical
  choices. Return: when a corpus stores its match method.
- **Ranges shift the applicant mix**, and a sentence on typical starting pay removed the
  gender gap (web, the 2026 field experiment). This belongs to the inclusive-advertising
  neighbour. Return: when that subject is deepened.

## Clocks

No application clock is set; the stacks' derived windows apply. The regulatory claims
move within a year: EU transposition state by state, US coverage thresholds, and the
competition agencies' replacement guidance, whose comment period closed 21 May 2026.
Re-check them by 2027-03-27.
