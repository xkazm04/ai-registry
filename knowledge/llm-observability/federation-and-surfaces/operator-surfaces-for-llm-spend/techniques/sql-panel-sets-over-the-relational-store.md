---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: sql-panel-sets-over-the-relational-store
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when:
  - building an always-on dashboard wall over a spend store
  - deciding which reports a wide-audience surface may show
---

# SQL panel sets over the relational store

The ambient surface — a dashboarding system on a shared screen, refreshed on
an interval, read by whoever walks past — is best built as **a curated,
version-controlled set of SQL panels querying the relational store directly**,
maintained as a product with a deliberate scope, not as an open query window
onto everything the store knows.

## Curate the set, don't mirror the schema

A good wall answers the standing questions at a glance: error rate and recent
errors, call volume, total cost and cost over time, cost broken down by
project / provider / model, token throughput, score averages and pass-rate
trends, per-entity health. Roughly a dozen panels is a wall; forty is a
schema browser nobody reads. Each panel earns its place by a question someone
actually stands in front of the screen to answer, and the set is reviewed
like an API: additions argued, removals allowed.

The queries live in version control beside the schema they read, because the
panel layer is the consumer most likely to rot silently: a renamed column or
a changed enum blanks a panel without an error, and a blank panel on an
ambient surface reads as "nothing happening" — the most dangerous possible
misreading of a broken query. Migrations that touch reported columns include
the panel diff in the same change.

## Semantics survive the bypass

Panels bypass the product's render layer, so they must re-honor its
semantics in SQL:

- **Nullable measures stay nullable.** Cost that could not be priced is null;
  a panel that `COALESCE`s it to zero manufactures a cheaper week exactly on
  the newest traffic. Aggregate with null-aware functions and, where the
  unpriced share is material, give it its own series so the wall shows "how
  much we could not measure" as a first-class line.
- **Thresholds mirror the product's bands.** If the render layer marks
  limits at eighty percent of threshold, the panel's coloring uses the same
  number, with a comment naming where the canonical rule lives. Two bands on
  two surfaces is one tuning away from contradiction.
- **Windows are explicit.** Every panel states its window in its title or
  axis; an ambient chart with an implicit "last 24h" gets compared against a
  weekly report and starts an argument.

## The panel set is an audience decision

The wall's audience is everyone with eyes on the screen, which is usually
broader than the set entitled to the store's most sensitive reports. So the
scope rule: **the panel set includes what its audience is entitled to see,
not what the store can produce.** Operational health, aggregate spend,
quality trends — yes. Per-customer margin — a ranked P&L naming who is
unprofitable — deliberately *not*, even though the join is trivial; that
report lives only behind authenticated, admin-grade surfaces. The omission is
a designed control, the same shape as refusing to wrap secret-minting for
agents: the safest place for a number that must not leak is a surface that
never renders it. Record the omission in the panel set's own documentation so
a future maintainer reads it as policy, not as a gap to helpfully fill.

## Decision rules

- Read from a replica or an analytical copy where load matters; an ambient
  refresh interval must never contend with ingest.
- Panels are read-only by construction — the dashboard datasource gets a
  credential that cannot write, independent of anyone's discipline.
- Prefer a few faceted panels (cost by project/provider/model as one grouped
  view) over per-entity panel sprawl; entity drilldown belongs on the
  authenticated interactive surfaces.
- When a panel needs a judgment the store does not encode (a health roll-up),
  compute it in the query from stored facts rather than hand-maintaining a
  status table that will go stale.

## When not to use it

Do not grow the panel wall into the investigation surface: drilldown,
filtering, per-customer joins, and what-ifs belong on authenticated
interactive surfaces where entitlement is checked per reader. And where the
"wall" would be visible to genuinely untrusted viewers (a public status
page), the direct-SQL pattern is wrong entirely — publish from a narrow,
pre-aggregated export instead, so the blast radius of a query mistake is a
stale page, not a data disclosure.
