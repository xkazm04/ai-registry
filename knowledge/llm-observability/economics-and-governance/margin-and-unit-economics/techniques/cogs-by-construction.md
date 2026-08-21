---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: cogs-by-construction
status: forged
laws: [quality-apparatus-stays-unbudgeted, nullable-never-zero]
shared_with: []
use_when:
  - defining which spend enters the cost side of margin
  - separating quality/eval spend from production cost
---

# COGS by construction

The cost term of a per-customer margin must contain production inference spend
and nothing else. The technique is to make that true **structurally** — by
where data is written — rather than procedurally, by a filter someone must
remember to apply in every query.

## The concern

An observability stack spends money on inference in at least two roles:
serving customer traffic (product cost) and measuring its own quality — judge
scoring, benchmark runs, calibration passes (apparatus cost). The field's
accounting consensus is unambiguous: only production inference is cost of
goods sold; training, evaluation, and experimentation belong with research and
operating expense. Mixing them does two kinds of damage. It overstates every
customer's cost — a fixed measurement overhead smeared across the customer
base. And it creates a perverse coupling: the week you score more traces, your
customers "become" less profitable, which teaches the organization to measure
less.

## The procedure

**Segregate at write time, not at read time.** Route apparatus spend into a
different table or store than traffic spend, at the moment of ingest. The COGS
query then sums the traffic store — and *cannot* include apparatus cost, even
when written by someone who has never heard of the distinction. Compare the
alternative: one events store with a `purpose` column and a `WHERE` clause.
Every new margin surface, every ad-hoc query, every future teammate must
re-remember the filter; the first one who forgets ships a wrong P&L that looks
exactly like a right one.

The decision rule: **when a correctness property must hold across every future
query, encode it in the schema topology; when it only matters to one query,
a predicate is fine.** COGS-correctness is the former — margin, trend,
simulation, per-customer drilldowns, and exports all consume the cost sum.

**Sum only priced cost, and disclose the unpriced.** Rows whose cost could not
be computed (unknown model, missing price at ingest) are null, not zero, and
the margin surface carries the count of rows it could not price. A cost sum
that silently treats unpriced calls as free understates COGS on exactly the
newest models — the ones most likely to be expensive.

**Keep the unattributed bucket inside COGS.** Untagged traffic is still
production traffic; excluding it flatters the business total. It aggregates
under its own key rather than disappearing or being spread across customers.

## Decision rules

- New spend category appears (embeddings for a retrieval feature, a
  safety-screening pass on user inputs): ask "does this run *because a
  customer's request ran*?" If yes → traffic store, COGS. If it runs because
  the operator wants to know something → apparatus store, not COGS.
- A pass is dual-use (a moderation model that both gates production requests
  and feeds a quality dashboard): the production role dominates — it is COGS,
  because removing it would change what customers receive.
- Someone requests "total spend including evals": serve it as a separate,
  labeled surface that unions both stores. Never widen the COGS sum itself.

## When not to use it

At the very start, before any quality apparatus exists, a single store is
simpler and correct by vacuity — but adopt the split the day the first judge
or benchmark call is made, not after a quarter of polluted history. And do not
over-segregate: splitting traffic cost by feature or model into separate
stores buys nothing (those are query dimensions, not correctness boundaries)
and multiplies ingest paths.
