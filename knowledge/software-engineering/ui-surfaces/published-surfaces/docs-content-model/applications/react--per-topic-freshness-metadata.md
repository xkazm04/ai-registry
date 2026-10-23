---
layer: application
type: application
subject: docs-content-model
technique: per-topic-freshness-metadata
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# Per-topic freshness metadata - a Next.js guide surface, as built here

The three fields existed and a drift detector read them. The review date was
the defect: the repository had done the backfill the technique warns about,
and had done it carefully.

## What A and B were

A: all topics carried a review date, a checked-against version and a coarse
watch set, written in one pass from the version-control history of each
category's content file. The dates were deliberately chosen old rather than
"today", so the detector would flag instead of falsely pass. The same field
held the derived value that a human review would hold, and the coverage report
computed "content reviewed" as the count of topics with a date: 109 of 109,
100.0%, printed beside 109 stale and 109 drifted topics. Nobody had read any of
them against the product.

B: the record gained a basis marker on the review date. A derived date says
so; an earned date leaves the marker absent. The report counts only earned
reviews as reviewed and prints the derived count beside it. Drift queries still
use the derived date as a lower bound, since a date that is too old can only
over-flag.

## Reading

Target: the reviewed share the report prints, A 109 of 109, B 0 of 109 with 109
derived, in text and in the machine-readable output. Floor: type check, lint,
the guide unit tests and the drift figures themselves (109 topics checked, 109
drifted, none skipped) stayed unchanged.

Seam chosen to falsify the technique's claim that a backfill defeats the field:
the repository had already neutralised the dangerous direction (old dates, so
the failure is false drift rather than false clean), and the claim still held
in a different form. The report read 100% reviewed because the count could not
tell a derived date from an earned one. The detector also saturated: with every
topic drifted it separates nothing, so a conservative backfill buys honesty at
the price of discrimination until real reviews arrive.

Not changed: the checked-against version is still the version current on the
backfill day, not a version anything was verified against; the watch sets stay
coarse by design. What this realization cannot do: it records that the dates
are not reviews, it does not produce reviews.
