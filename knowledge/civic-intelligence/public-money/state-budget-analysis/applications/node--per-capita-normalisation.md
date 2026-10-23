---
layer: application
type: application
subject: state-budget-analysis
technique: per-capita-normalisation
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The divisor rule holds by composition, not inside the routine

The politicas budget mirror (`/rozpocty`) divides two stocks and flows by
population in exactly one routine, `perCapita` in the MONITOR ingest module,
imported by the one series builder. The witness for the stack is the CI
workflow's `node-version: 24`. Three of the technique's rules are visible in
the tree without any test: one shared routine, a null (never zero) for a
missing divisor, and a population taken from the same reporting period as the
numerator (the series builder says so in its own header comment and reads the
`obyvatele` cell of the same year).

## The seam, chosen to falsify the divisor rule

The technique requires a **finite positive** population. The routine guards
only `null` and `<= 0`. A caught outcome would have been a published figure
built on a non-finite operand: `NaN` passes the `<= 0` test and returns `NaN`,
and an infinite population returns 0 Kč per resident, which the page would
render as a real, very low debt. That would have moved the rule from the
shared routine to the data boundary, and shown the technique's "finite" is not
enforced.

## What was read

Arm A is the routine as shipped. Arm B adds the technique's full predicate
(both operands finite, population positive). Both ran over ten synthetic
operand pairs and over the page's real batch.

- Synthetic: the arms differ on 4 of 10 pairs, all of them non-finite
  operands (`NaN` or infinite population or numerator).
- Real batch: 132 towns x 5 years = 660 cells. No population is null, zero or
  negative; no numerator is present beside a missing population. The arms
  agree on all 660 cells for both headline metrics.
- Why the difference cannot be reached: both feeders refuse non-finite values
  before the routine sees them. The live client maps any non-finite indicator
  to null, and the packed-snapshot parser throws on a non-finite cell. The
  finite half of the rule is enforced at the boundary, not in the routine.

So the finding held, in a weaker form than the technique states it: the rule
is true of the system and false of the function. Adding the predicate to the
routine moves no number on any reachable input, so nothing was changed in the
tree.

## One thing the real batch did show

One town's population steps from 17,103 in 2021 to 14,420 in 2022 (-15.7%,
the only year-on-year move over 15% in the batch) and holds near 14,500
afterwards. Divided by the same-period figure, as the technique requires, the
per-resident series is internally consistent, but a reader comparing 2021 with
later years is looking partly at a change of population base, not only of
debt. The technique does not yet say what a surface should do when the
divisor itself breaks between periods. Left as a lead, not an amendment: one
town in one batch.

## What this realization cannot do

It cannot show that the population the source attaches to a period matches
the period's stock date; the page trusts the source's `obyvatele` for the
period, and the technique itself notes that a fiscal source may rely on a
separate statistical authority. No arm here measures that alignment.
