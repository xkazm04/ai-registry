---
layer: application
type: application
subject: compensation-banding-and-market-honesty
technique: advertised-pay-is-not-earnings
stack: process
status: forged
---

# The market-pulse incident: a national median built from adverts

`scripts/build-market-pulse.mjs:14` states the rule this technique exists to
enforce, and states it as a scar rather than as a principle:

> "Counts come from the vacancy register; every SALARY comes from the ISPV
> earnings survey. That split is the whole point — an advertised salary is a
> statistic about adverts, and reading pay off ÚP postings once put the
> national median at 29 000 Kč with Prague last."

The full post-mortem lives at the top of `scripts/lib/market-earnings.mjs:1-20`:

> "The regional/national/sector medians on the page were derived from the
> salary *advertised* in ÚP postings, and the result was indefensible: a
> national median of 29 000 Kč and Prague dead last at 24 100 Kč — below every
> other region, in the highest-paying city in the country. Two biases stack up.
> Employers advertise the bottom of their band, and ÚP-registered vacancies
> skew hard to service/manual roles (higher-skill and senior corporate jobs go
> to commercial boards) — most of all in Prague. An advertised median is a
> statistic about adverts, not about pay."

Two things are worth extracting from this. The **inverted regional ranking** is
the sanity check that fired: the capital placed last in its own country. And
the second bias named — that a statutory vacancy register under-represents
higher-skill hiring because that hiring goes to commercial channels — is a
*corpus-selection* bias on top of the ordinary censoring and negotiation-shaping
of advertised ranges. An official-sounding source made the number harder to
doubt, not easier.

## The fix is a split, not a correction

The repaired pipeline does not adjust the advertised figures. It replaces the
population being measured, and keeps the two populations separate by
construction. `build-market-pulse.mjs:19-25` documents the resulting data model
tile by tile:

- **Reference salaries** ← ISPV economy-wide earnings (median plus Q1/Q3/D9
  deciles), employment-weighted and rolled up to role family.
- **Locality map** ← per-region vacancy volume for counts, per-region ISPV/RSCP
  earnings for pay — two sources feeding one map.
- **Organisation-type split** ← vacancy counts by public / private / agency,
  with pay from the matching ISPV wage sphere — "agencies have no sphere, so
  that tile carries no pay figure."
- **In-demand roles** ← national open-vacancy counts by family and occupation.

The agency tile is the strongest detail in the file. A slice with counts but no
matching earnings cut renders **no pay figure at all** rather than borrowing
the nearest one. That is the technique's refusal rule realised at tile
granularity, in a surface where a missing number is visually conspicuous and
the temptation to fill it is maximal.

`market-earnings.mjs:34-37` names the sources by their published open-data URLs
(national per-occupation × wage sphere, and the regional RSCP cut across
fourteen regions) with a `Source: MPSV ČR (ISPV / RSCP), CC BY 4.0.` line —
so the earnings half of the page carries the provenance the advertised half
never could.

## What is still an advert statistic, and stays labelled as one

Counts are untouched: "Real counts of real postings. Kept as-is."
(`market-earnings.mjs:7-9`). The vacancy register is exactly the right source
for how many roles are open, for regional demand volume, and for the
representative posting samples the page shows as JD references — all of which
are claims about adverts, matched to a corpus of adverts.

The pipeline also writes a committed snapshot (`data/market_pulse.json`) that
the page reads, and `scripts/refresh-market-earnings.mjs` can re-level that
snapshot from the public JSON without a local ingest server — which means the
earnings half can be re-aged independently of the counts half. The two
populations have separate refresh paths because they are separate populations.
