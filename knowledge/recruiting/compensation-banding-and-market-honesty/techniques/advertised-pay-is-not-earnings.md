---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: advertised-pay-is-not-earnings
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a pay figure is about to be computed from job postings, choosing between a posting corpus and an earnings survey, a computed market median disagrees with what practitioners know]
---

# Advertised pay is not earnings

Reading pay off job advertisements produces a statistic about **advertisements**.
It is not a statistic about pay, and the gap between the two is neither small
nor random. This technique exists because the mistake is so easy to make while
feeling rigorous: the data is abundant, current, free, and structurally
mis-shaped in exactly the direction that flatters the analyst who does not
check.

## The four distortions

**Censoring.** A large share of adverts state no figure at all, and the
omission is not random — it concentrates at the top of the market. The
better-paid the role, the more likely the employer prefers to negotiate rather
than post. Dropping the blanks does not give you an unbiased sample of the
market; it gives you an unbiased sample of *the roles employers were willing to
price in public*, which is the lower part ([absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

**Self-selection of employers.** The employers who post figures skew toward
high-volume, standardised, replaceable hiring. Employers doing scarce senior
hiring post fewer adverts and price fewer of them. Weighting by advert count
therefore weights the market toward its most commoditised corner.

**Strategic shaping.** A posted range is a negotiating instrument. Its floor is
set below what will be paid, to preserve room; its ceiling is set to catch
whoever walks in. Under pay-transparency rules, ranges have measurably widened —
particularly in higher-paying occupations — precisely because a wide range
retains flexibility. A wide range is also read as evasive and deters
applicants, but the relevant point here is statistical: a range built for
negotiation is not an estimate of what the job pays, and taking its midpoint
does not fix that.

**Composition.** Advert corpora are dominated by high-churn roles, because
churn is what generates adverts. Compute a national median over adverts and you
have computed the median of a turnover-weighted job mix, not of the employed
population.

To these four add a fifth that is a property of the *corpus*, not of adverts in
general, and which is easy to miss because it hides behind an authoritative
name: **which channel the adverts were collected from**. A public vacancy
register, a state employment office feed, or any single job board is not a
census of hiring. Senior and higher-skill corporate roles are advertised on
commercial channels; statutory registers fill up with service and manual roles.
An advert corpus drawn from one channel inherits that channel's occupational
mix on top of every distortion above — and an official-sounding source makes
the resulting number *more* likely to be believed, not less.

## The geographic inversion

The distortions compound in one direction that is worth naming because it is
the clearest tell that something is wrong.

In a corpus built from adverts, a country's highest-paying region — typically
its capital, its financial centre, its tech cluster — routinely ranks *lowest*
by advertised pay. The mechanism is straightforward once seen: in the
expensive, competitive region, the well-paid roles are the ones that omit a
figure, while the roles that do post figures are the customer-facing,
high-turnover, near-minimum ones the region has many of. The cheaper regions
post figures more often across their whole distribution. The result is a
national median far below reality and a regional ranking that is inverted at
the top.

**When your computed pay ranking puts the most expensive place in the country
last, you have not discovered a surprising fact about the labour market — you
have measured advert-posting behaviour and mislabelled it.** Treat any such
inversion as a failed sanity check on the corpus, never as a finding.

## What the source is legitimately for

The corpus is not worthless; it is mis-labelled. Advertised pay is genuinely
the best available source for:

- **Movement and timing.** It is real-time, where survey data lags by a year or
  more. A market turning shows up in adverts months before it shows up in a
  published earnings statistic. Use it for the *derivative*, not the level.
- **Disclosure behaviour.** What fraction of adverts in a segment state a
  figure, and how wide the stated ranges are, is directly measurable here and
  nowhere else — and is a real input to advertising strategy and to
  transparency compliance.
- **What competitors are willing to say in public**, which is a genuine and
  useful fact about advertising, distinct from what they pay.

Every one of these is a claim about adverts, and each is sound because the
claim matches the population that was measured ([a verdict is bound to what it
judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## Decision rules

- **Never let a posting-derived figure be published as a market rate**, and
  never let it silently back a below-market verdict, an offer recommendation or
  an advertised range. Where it appears at all, its label says "advertised", in
  the same sentence as the number.
- **Never impute the missing figures.** Filling censored adverts from the
  observed ones assumes the missingness is random, which is exactly the
  assumption that is false, and it converts a visible gap into an invisible
  bias.
- **Report the disclosure rate whenever you report a posting statistic.** "The
  median advertised figure in this segment, over the thirty-one percent of
  adverts that stated one" is honest. The same number without the second clause
  is not ([a claim carries its sample and its
  basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **Run the sanity check against a known earnings source before shipping any
  posting-derived aggregate.** Compare the level and the regional ordering. A
  level materially below the earnings source, or an inverted ordering, means
  stop.
- **When both sources exist, the earnings source sets the level and the posting
  source informs the trend.** Never average them; they measure different
  quantities and the average measures nothing.
- **Split the two sources by what each measures, at the data layer, and make
  the split visible in the model.** Where a single surface shows both — how
  many roles are open, and what they pay — counts come from the posting corpus
  and *every* pay figure comes from the earnings source, with no exceptions
  granted for convenience. A surface that mixes them per-tile will eventually
  have one tile silently fed by the wrong half. Where a slice has counts but no
  matching earnings cut, that tile carries **no pay figure at all** rather than
  borrowing one.

## When not to use this

- **Where the whole question is about adverts** — disclosure rates, range
  widths, competitor posting behaviour, transparency compliance. Here the
  posting corpus is the correct and only source, and this technique's warnings
  do not apply, because nothing is being claimed about earnings.
- **Where a jurisdiction mandates posted ranges and enforcement is mature.**
  Censoring falls sharply and the corpus improves, but it does not become an
  earnings survey: strategic widening increases under exactly the same
  pressure, so the ranges get more complete and less sharp at once. Recheck the
  distortions rather than assuming they were solved.
