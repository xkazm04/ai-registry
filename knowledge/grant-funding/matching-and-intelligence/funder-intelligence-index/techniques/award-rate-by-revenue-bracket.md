---
layer: technique
type: technique
subject: funder-intelligence-index
technique: award-rate-by-revenue-bracket
status: forged
laws: [small-samples-stay-silent, provenance-per-field]
shared_with: []
use_when: [computing publishable per-funder award statistics, answering "do orgs my size win here", designing the outcome record schema]
---

# Award rate by revenue bracket

The single most decision-relevant figure an index can publish is not a
funder's overall award rate — it is the award rate for *applicants like the
reader*. A national funder may award 5% overall while awarding 12% to
organizations under $1M revenue and 1% to those above $10M, or the reverse;
the overall figure actively misleads both. The unit of publication is
therefore the **(funder × applicant-size band)** cell: applications, awards,
award rate, and median award amount, each computed from pooled outcomes.

## Bracket at write time, not query time

Applicant size enters the record as a coarse bracket, decided when the
outcome is written, for three reasons that all point the same way. First,
privacy: an exact revenue figure is close to an identifier for small
organizations, and what is never stored cannot leak. Second, stability: a
bracket assigned at submission reflects the organization *as it applied*,
which is what the funder judged — recomputing from current revenue rewrites
history every fiscal year. Third, producer–consumer agreement: the bracketing
function is shared between the code that writes outcomes and the code that
aggregates them, because two independently maintained bracket definitions
will drift and silently split one population across two cells.

Four or five bands spanning roughly under-$250K to over-$10M cover the
nonprofit distribution; finer bands feel more precise but starve every cell
of sample. The bands are a published part of the methodology — a reader must
be able to place themselves in one without guessing. Malformed input gets the
most conservative band, not an error and not a made-up midpoint.

## Rates are computed over applications, not events

An application's life emits multiple records — submitted, then awarded or
declined — and a rate computed over raw records double-counts every decided
application. The aggregation therefore **collapses records to applications**
first: all rows for one (organization, application) pair reduce to a single
datum whose verdict is "awarded" if any row says so. Two rules keep the
collapse honest:

- **Idempotent capture.** The record's identity is (organization,
  application, transition), so re-marking the same transition overwrites
  rather than duplicating. Retry loops and UI double-clicks must not be able
  to inflate a denominator.
- **Award wins.** State rows can arrive out of order or contradictorily; the
  terminal positive verdict takes precedence, and the awarded amount rides
  with it.

The denominator question deserves one more distinction: *submitted* and
*decided* are different counts. A cell's award rate may use all submitted
applications (the "if I apply, what happens" reading) — but then pending
applications drag the rate down during a cycle, so the choice must be made
once, documented, and held constant. Whichever reading is chosen, publish the
raw counts alongside the rate so a reader can reconstruct the other.

## Every cell answers for itself

A published cell is a derived value and carries its derivation per
[provenance-per-field](../../../_laws.md#provenance-per-field): the application
count behind the rate, the number of distinct contributing organizations, and
whether the cell is observed or curated. The count is not decoration — it is
what downstream consumers (difficulty scoring, win-probability confidence)
key on, and it is what lets a reader distinguish a rate backed by 4,000
applications from one backed by 40. Median award is preferred over mean
because award distributions are heavy-tailed and one flagship grant should
not move the "what should I expect" number.

Cells below the publication floor are suppressed entirely — see
k-anonymity-suppression for the floor mechanics; this technique's obligation
is only that suppression happens *here*, in the aggregation, per
[small-samples-stay-silent](../../../_laws.md#small-samples-stay-silent), and
not left to the display layer's discretion.

## Dimensions beyond size

The same cell structure extends along two more axes when sample permits:
**program** (via the coarse program bucket, since one funder's programs can
differ in selectivity by an order of magnitude) and **funding cycle** (a
quarterly or per-cycle bucket, since award rates trend and a three-year-old
rate is a different fact). Each added dimension divides the sample, so the
practical rule is: publish the funder × size cell as the primary product,
and add program or cycle splits only where the split cells independently
clear the floor. Never let a reader sum published sub-cells to reconstruct a
suppressed one.

## When not to use this

Skip bracketed rates when the pool is a single organization's own history —
there the bracket is constant and the interesting splits are by program and
cycle. And do not bracket on dimensions the funder cannot see or does not
judge (internal team size, tooling): the bracket earns its place only if the
funder's decision plausibly varies along it, because the published claim is
"the funder treats these bands differently," not "we can group by anything."
