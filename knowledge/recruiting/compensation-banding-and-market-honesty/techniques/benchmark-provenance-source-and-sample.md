---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: benchmark-provenance-source-and-sample
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [designing the schema a benchmark corpus is stored in, defending a pay band to a hiring manager, deciding whether a benchmark row may be published]
---

# Benchmark provenance: source and sample

A pay figure without provenance is not a weak claim, it is not a claim at all —
there is nothing to argue with, nothing to age forward, nothing to correct when
the source is revised. This technique makes provenance a **structural property
of the stored row** rather than a note beside it.

## The required columns

Every benchmark row carries, as required fields:

1. **Source** — the named statistical publication, survey or office the figure
   derives from. Not "market data". Not "industry benchmark". A name a third
   party could go and look up.
2. **Year** — the year the source *measured*, not the year you loaded it. These
   differ by six to eighteen months in practice, and the difference is the
   entire input to aging.
3. **Derivation** — what was done to the source figure to produce this row: the
   aging factor, the percentile taken, the seniority ratio applied, any
   currency or period conversion. Each with its own value, not summarised.
4. **Sample size** — the number of observations behind the source figure for
   *this cell*, not for the survey as a whole. A survey of eighty thousand
   people can still have four in your cell.

Two properties make these load-bearing rather than decorative. First, the
columns are **required**: a row that cannot fill them does not enter the
corpus. A nullable provenance column becomes null on the rows that need it most,
because those are the rows someone was in a hurry to add. Second, provenance
**travels with the number to the surface**. A band shown to a recruiter without
its basis has been laundered; the recruiter will quote it, and by the second
quote it is folklore ([a claim carries its sample and its
basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Aging is mandatory and is recorded

A published earnings figure is old on the day you receive it. Collection is
periodic, publication lags collection, and a compensation decision taken today
against an eighteen-month-old figure in a moving market is systematically low.

The rule: **age every figure to a stated effective date, using a stated factor,
and store the factor.**

- The factor comes from a published wage-growth index for the market, not from
  a guess and not from the previous year's pay round.
- Store the factor, not just the result. A stored result cannot be re-derived
  when the source publishes a revision, and it cannot be audited when someone
  asks why two rows from the same source disagree.
- **Effective-date staleness has a limit.** A source measuring more than about
  a year ago is unfit for a normal role and more than about six months ago for
  a fast-moving one, no matter how large its sample. Past that limit, aging is
  no longer a correction, it is a forecast, and it should be labelled as one or
  the row should be retired.

Aging makes an inference out of a measurement, and the row must say so
([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
A row reading "national statistics office, measured two years ago, aged forward
by a stated index, sample of six hundred" is defensible in a hiring-manager
conversation in a way that the same final number, bare, is not.

## Sample size is a gate, not a footnote

Sample size does three jobs and each is a rule:

- **It gates publication.** Below the cell's floor, the row does not publish.
- **It sets the width.** A thin cell justifies a wider band, not a sharper one.
  The temptation runs the other way, because a thin cell often *looks* tight —
  few observations cluster by accident.
- **It orders competing sources.** When two sources disagree for a cell, the
  larger, more recent, better-matched sample wins, and the loser is recorded as
  a disagreement rather than discarded silently. Persistent disagreement
  between two well-sampled sources is information: usually it means the job
  match differs, and the match is what to fix.

## What provenance forbids

Provenance is a constraint on what may be *said*, not only on what is stored:

- A row may not be presented as more precise than its derivation supports.
  Round to a grain the evidence justifies, and hold that grain at every surface.
- A row may not claim its source's authority after being modified beyond that
  source's method. A figure aged, converted, ratio-adjusted for seniority and
  premium-adjusted for company type is *your* estimate informed by that source
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- A row whose source has been retired or superseded is retired with it, not
  left in place because nothing better has arrived. An expired row that stays
  because the replacement is late is the mechanism by which corpora rot.

## Decision rules

- When a proposed row cannot name a source, a year and a sample size,
  **reject the row**. There is no provisional tier.
- When the effective date exceeds the staleness limit, **retire or relabel** —
  never quietly age further.
- When a consumer surface has no room to show the basis, **show less number,
  not less basis**: a band with its source named beats a midpoint alone.
- When two sources conflict, prefer the larger and more recent sample and
  **record the conflict** on the row.
- When you cannot decide between reporting a median and a mean, report the
  median and say which you reported. Pay distributions are right-skewed; a mean
  quoted as "the market rate" overstates it for most of the population.

## When not to use this

- **Where the figure is not a market claim.** An internal equity range, an
  approved requisition budget or an offer figure are organisational decisions
  with an owner, not derived statistics. They need an owner and a date, not a
  source and a sample — do not force this schema onto them, because doing so
  gives a decision the costume of a measurement.
- **Where the corpus is a single first-party survey run by you.** Provenance is
  still required, but source-conflict resolution is moot and the anonymity
  floor becomes the dominant constraint instead.
