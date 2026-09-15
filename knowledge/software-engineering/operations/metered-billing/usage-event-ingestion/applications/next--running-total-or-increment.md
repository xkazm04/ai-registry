---
layer: application
type: application
subject: usage-event-ingestion
technique: running-total-or-increment
stack: next
status: forged
verified_on: 2026-09-15
verified_against: next@16.3
applied: code
ab_verdict: better
proof: ab-paired
---

# Two stores, one metrics report, opposite encodings

The stack version is witnessed by the tree's own manifest (`"next": "^16.3.3"`)
and its CI pin (`node-version: "24"`). The tree is a public engineering-analytics
codebase (an open-source maturity index for AI-native teams); it is cited here by
structure, and the file-level seam and both arms' fixture live in its own applied ledger
beside the commit.

## The seam

The product accepts a coding agent's metrics export over an interval-report
protocol and reads **one request body into two stores**. A per-repository,
per-day usage table is written with increments: its upsert adds the incoming
values to the stored row. A per-session "attempt" table, added later to answer
cost per unit of work, is written by replacement: its upsert sets the stored
counters to the incoming values. The attempt table's header comment gave the
reason in the confident register of a fact: the exporter "emits cumulative
per-session counters", so adding would multiply a long session.

Neither reader looked at the field that settles it. The vendor's monitoring
documentation, fetched in-run, gives the exporter's temporality preference a
**default of delta** and an export interval of sixty seconds, and the product's
own connect instructions never override it. Under the default, the day table was
right and the attempt table kept each session's final minute. The day table was
not right by design either: nothing in it read the declaration, so an operator
who switched the exporter to cumulative would have had every day's usage
multiplied by its export count.

## The paired proof

The measurable was the stored token total for one session after two consecutive
exports, against the true total of 1500. One fixture, pushed through the real
parsers and the real upsert calls over an in-memory double of the store that
applies set and increment exactly as the ORM does, run once against the tree as
it stood and once after the change:

| exporter setting | reports | A (as found): day / session | B (after): day / session |
|---|---|---|---|
| delta (the default) | 1000, then 500 | 1500 / **500** | 1500 / 1500 |
| cumulative | 1000, then 1500 | **2500** / 1500 | refused and counted / 1500 |

Arm A filled exactly the two cells the technique predicts for a system that holds
both shapes. The change reads the declaration once per counter (absent or
unspecified resolves to delta, with the vendor document named in the comment),
carries a `cumulative` flag on each parsed session so its upsert increments or
replaces accordingly, and has the stateless day-bucket parser count a cumulative
datapoint under its own skip reason instead of summing it; the ingest response
then names the exporter setting that fixes it. The project's suites covering the
database, integration and ingest-route modules stayed green (114 files, 2085
tests), with the typechecker and linter clean, and the fixture stays in the tree
as the regression pin.

The seam was chosen to falsify. The day table was the half that could have shown
the technique to be redundant here — it was correct for the setting every user
actually runs. The half that returned something was the one written specifically
to avoid the running-total mistake, which inverted it.

## What the tree's shape says

**Both readers had passing tests, and both test files encoded their own reader's
belief.** The day parser's fixtures were single exports; the session parser's
fixtures were single exports. A single export cannot distinguish the encodings,
so no test in either file could have failed. Only a two-export fixture fed
through both stores observes the contract, which is the technique's claim that
the gate must be the fixture across every reader rather than each reader's own
suite.

**The damage is not repairable from storage.** Every attempt row written before
the change holds one interval of its session; the earlier intervals were
overwritten, not kept. The realization cannot backfill them. Rows before the
commit instant are a different measurement, and the project's own ledger carries
that as its return condition: a cutover label on the cost-per-attempt view, or a
re-ingest from retained exports.

## What this realization cannot do

It does not difference running totals for the day table. That would need
per-series state across requests and a rule for series restarts, and the ingest
route is stateless; refusal is the honest limit, and it is loud. It trusts one
vendor's documented default for an absent field. A second provider arriving in the
same ingest path brings its own default, and the comment pinning the first one is
the line to re-check.
