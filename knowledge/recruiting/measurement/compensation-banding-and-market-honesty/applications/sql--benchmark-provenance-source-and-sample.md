---
layer: application
type: application
subject: compensation-banding-and-market-honesty
technique: benchmark-provenance-source-and-sample
stack: sql
status: forged
verified_on: 2026-09-27
applied: experiment
ab_verdict: better
---

# Two corpora, two provenance disciplines

This deployment holds two independent sources of a market band, and they carry
provenance in two different ways because they answer to two different risks.

## The anchor corpus: source, year, factor, sample size per row

`data/salary_benchmarks.json:1` is a role-family × seniority grid keyed by
market (`markets[<market_id>]`), so "onboarding a second market is
configuration (add a block) not a full-file swap". Each row is four seniority
anchors plus four provenance columns:

```json
{
  "family": "software_engineering",
  "junior": [42000, 65500],   "medior": [65500, 103000],
  "senior": [103000, 154500], "lead":   [140500, 206000],
  "source": "manual×ISPV rok 2025",
  "factor": 0.936,
  "ispv_median": 81800,
  "sample_k": 117,
  "occupations": 12
}
```

Every field of the technique's required set is present and per-row rather than
per-file: the **named statistical source** with its **measured year** (`ISPV
rok 2025` — the national earnings survey, not an advert corpus), the
**derivation factor** applied to the survey median, the **survey median
itself** so the derivation can be re-run, and the **sample size in this cell**
(`sample_k`, in thousands of observations) alongside how many occupation codes
were rolled up.

The sample column is what makes the corpus arguable rather than merely
authoritative. `software_engineering` rests on `sample_k: 117` across twelve
occupations; `data_ai` rests on `sample_k: 25` across five, with a visibly
different `factor` of 0.825. Two rows that look equally confident in the
interface are not equally supported, and only the stored sample says so. Two
families (`product_project` and `hr_people`; one on 08-20) carry a bare
`"source": "manual"` with no factor, median or sample at all. That is exactly
the visible admission the technique wants: an unprovenanced row is
*identifiable* as unprovenanced rather than blending in.

The `_doc` header carries the operational half: the derivation is
reproducible (`npm run market:build && npm run market:apply`), revertible
(`data/salary_benchmarks.manual.json`), and pinned across the language boundary
— "a guard test keeps each block's currency in lockstep with its
`MarketConfig`" (`pipeline/jobfit/tests/test_market_config.py`,
`CrossBoundarySyncTest`). That guard test is the substitute for a single shared
definition where a single definition cannot span two runtimes. The `de-berlin`
block is flagged in the same header as "a NON-PRODUCTION sample proving the
seam, not real German data."

## The shared-corpus aggregate: a floor that counts the wrong unit

`app/_lib/db/salary-benchmark.ts:3-11` computes bands the other way, as
percentiles over a live corpus. Its provenance discipline is about *which rows
may be counted*:

> "aggregated from the SHARED reference corpus: the jobs rows with
> workspace_id NULL … Reads ONLY the corpus (workspace_id IS NULL), not a
> team's authored openings, so a team's own postings can't skew "the market";
> this deliberately isn't the (IS NULL OR = ?) ownership predicate."

The deviation from the ordinary tenancy predicate is the point, and the comment
says so, because a reviewer would otherwise "fix" it. A band a team is measured
against must not be a function of that team's own postings.

The floor is `SALARY_BENCHMARK_MIN_COHORT = 3` (`:13`), enforced as an early
return (`:70`):

```ts
if (rows.length < SALARY_BENCHMARK_MIN_COHORT) return null;
```

The doc comment gives both reasons for a floor in one clause: "too few
reference roles to be a meaningful — or anonymous — band". The 08-20 reading
took that at its word. The floor counts **rows**, though. The query selects
`salary_min, salary_max, created_at` and never the `company` column the `jobs`
table carries, and the type comment says what the corpus is: `currency: "CZK";
// the reference corpus is Česká spořitelna (CZK)`.

**Measured 2026-09-27.** A read-only query over the live database groups the
reference rows by the same cell key as the aggregate (`workspace_id IS NULL`,
both salary bounds present, role family and seniority). It found 100 rows in
12 cells. Every cell clears the row floor, so all 12 publish. Every cell's
rows come from **one company**. A contributor floor with a dominance cap
(three distinct contributors, none over 75% of the cell) withholds 12 of 12.
The "cross-company reference tier" is one employer's pay structure, published
as a market band.

Anonymity is not the harm here. The header calls the rows "synthetic reference
roles" attributed to that employer, so nobody's real pay is exposed. The harm
is meaning: every percentile is a statement about one organisation's ladder,
and a team measured against it is measured against that employer, not a market.

The returned shape has grown since 08-20. It now adds `source` (the corpus id
`kp-reference-corpus`) and `asOf` to `{ roleFamily, seniority, currency, count,
p25, median, p75 }`. `count` still travels with the percentiles, so a consumer
cannot render the median without the sample size. Percentiles are linearly
interpolated between order statistics (`:44-50`), so at `count: 3` the median
is one role's own midpoint.

**Deviations, as re-read 2026-09-27.**
- Neither corpus stores the survey's *effective date*. The benchmark block's
  `asOf` is the date the snapshot was built. The aggregate's `asOf` is the
  newest row's `created_at`, the date it was inserted. The survey year survives
  only inside the `source` string and a `benchmark_source_id` of `cz-ispv-2025`,
  so the aging factor still cannot be recomputed against a new effective date
  without editing the row.
- `sample_k` means two things. In the anchor corpus it is the survey's
  employee count in thousands (`apply-market-salaries.mjs:169`: `sample_k =
  ref.employees_k`). The thin-sample threshold beside it (`taxonomy.py:778-788`,
  `THIN_SAMPLE_K = 30`) is documented as rows: "separates 'a couple of dozen
  rows' from 'a real sample'". The aggregate fills the same field with
  `rows.length`. A figure resting on 19 000 surveyed employees and one resting
  on 19 reference roles are both surfaced as "19".
