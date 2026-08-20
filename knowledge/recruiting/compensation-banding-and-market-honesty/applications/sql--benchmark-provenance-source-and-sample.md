---
layer: application
type: application
subject: compensation-banding-and-market-honesty
technique: benchmark-provenance-source-and-sample
stack: sql
status: forged
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
interface are not equally supported, and only the stored sample says so. One
family carries a bare `"source": "manual"` with no factor, median or sample at
all — which is exactly the visible admission the technique wants: an
unprovenanced row is *identifiable* as unprovenanced rather than blending in.

The `_doc` header carries the operational half: the derivation is
reproducible (`npm run market:build && npm run market:apply`), revertible
(`data/salary_benchmarks.manual.json`), and pinned across the language boundary
— "a guard test keeps each block's currency in lockstep with its
`MarketConfig`". That guard test is the substitute for a single shared
definition where a single definition cannot span two runtimes. The `de-berlin`
block is flagged in the same header as "a NON-PRODUCTION sample proving the
seam, not real German data."

## The shared-corpus aggregate: a cohort floor doing two jobs

`app/_lib/db/salary-benchmark.ts:1` computes bands the other way — as
percentiles over a live corpus — and its provenance discipline is about *which
rows may be counted*:

> "aggregated from the SHARED reference corpus: the jobs rows with
> `workspace_id NULL` … Reads ONLY the corpus (`workspace_id IS NULL`), not a
> team's authored openings, so a team's own postings can't skew 'the market';
> this deliberately isn't the `(IS NULL OR = ?)` ownership predicate."

The deviation from the ordinary tenancy predicate is the point, and the comment
says so, because a reviewer would otherwise "fix" it. A band a team is measured
against must not be a function of that team's own postings.

The floor is `SALARY_BENCHMARK_MIN_COHORT = 3`, enforced as an early return:

```ts
if (rows.length < SALARY_BENCHMARK_MIN_COHORT) return null;
```

The header names both reasons the technique gives for a floor, in one clause:
"too few reference roles to be a meaningful — or anonymous — band". A thin
cohort fails on meaning *and* on identifiability, and the same constant gates
both.

The returned shape carries its own sample: `{ roleFamily, seniority, currency,
count, p25, median, p75 }` — `count` travels with the percentiles rather than
being available on request, so a consumer cannot render the median without
having been handed the sample size. The aggregate is over band **midpoints**,
never an individual role's figure, and the currency is a literal type
(`currency: "CZK"`) with the comment "multi-currency bands are a later tier" —
an honest single-market declaration rather than an unlabelled assumption.

**Deviation.** Neither corpus stores an *effective date* separate from the
source year, so the aging factor cannot be recomputed against a new effective
date without editing the row; and the shared-corpus aggregate carries no source
or year at all, only a count. The standard asks for both. The count-plus-floor
does the anonymity and meaning work; the aging discipline lives only in the
anchor corpus.
