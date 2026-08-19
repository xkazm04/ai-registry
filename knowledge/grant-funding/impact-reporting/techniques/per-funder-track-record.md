---
layer: technique
type: technique
subject: impact-reporting
technique: per-funder-track-record
status: forged
laws: [small-samples-stay-silent, never-fabricate-a-figure]
shared_with: []
use_when: [building a board-facing or public impact roll-up, preparing a renewal conversation with a specific funder, aggregating awarded grants across a portfolio]
---

# Per-funder track record

The most decision-relevant cut of an organization's impact ledger is not the
grand total — it is the breakdown by funder: who gave what, and what it
produced. Boards read it to see concentration risk; development staff read it
to prepare renewal asks ("your three grants funded X across Y periods");
prospective funders read it as social proof. The technique is a small set of
aggregation rules that keep this table truthful under the pressures that
routinely corrupt it.

## The countability rule, defined once

Only an award that actually happened, with a positive amount, enters the
ledger. Pipeline, verbal commitments, applications "expected to close", and
zero-dollar recognitions all stay out. Two design rules make the rule hold:

1. **One predicate, shared.** The countability test is defined in exactly one
   place and imported by both the headline aggregate and the per-funder loop.
   The moment two code paths each restate "what counts as an award", they
   drift — and a board eventually watches a total that doesn't equal the sum
   of its rows. The breakdown must be *derived from the same filtered set*
   the headline counted, at the same conversion rates, so disagreement is
   structurally impossible rather than merely tested for.
2. **Positive-amount, explicitly.** An awarded status with a null or zero
   amount is a data-entry artifact, not impact. Counting it inflates the
   award count while contributing nothing to dollars — the mismatch itself
   reads as manipulation. Publishing money that was never received is
   [a fabricated figure](../../_laws.md#never-fabricate-a-figure) assembled
   by an aggregator instead of a writer.

## The unattributed bucket

Real ledgers contain awards whose funder field is empty or whitespace.
Dropping them silently understates the total and breaks reconciliation with
the headline; inventing an attribution is worse. The rule: bucket them under
an explicit **"Unattributed"** row, visible in the table like any funder.
Dollars are never silently dropped, and the bucket doubles as a data-quality
signal — a growing unattributed row is a prompt to fix records, which nobody
issues for money that vanished from the report unnoticed.

## Ordering and presentation

Sort largest-first by dollars — boards and funders read top-down, and the
first three rows carry the story. Tie-break deterministically (by name), so
the same data always renders the same table; a report that reshuffles between
exports invites "which version is right?" questions it cannot answer.

Present per funder: award count, total dollars, and any modeled derivative
(computed at the same rate as the headline, marked as modeled). Resist the
tempting fourth column: **win rate per funder.** Most organizations hold a
handful of decided outcomes per funder, and a "100% success with this
funder" over two applications is a lie told with true numbers —
[small samples stay silent](../../_laws.md#small-samples-stay-silent). Publish
rates only above a minimum of decided outcomes, and suppress the cell — not
the row — below it. The same suppression discipline applies to per-funder
averages when the count is one or two: the "average" is just the award,
dressed as a statistic.

## Bounded inputs are part of the truth claim

Aggregations run over a finite pull of records. If the pull is capped, an
organization whose history exceeds the cap silently loses its oldest awards
from the totals — and a track record that shrinks as the org succeeds is
absurd. Whatever the cap, detect the at-the-limit condition and surface it
(a logged warning at minimum, a visible caveat if user-facing) until the
aggregation is reworked to scan everything. An unmarked truncated total is a
wrong total.

## When not to use it

The per-funder table is a *delivered-impact* view; do not blend pipeline or
in-progress applications into it to make it fuller — that is a different
report with different epistemics, and mixing them poisons both. For an
audience of one funder (a renewal meeting), extract their row and its
underlying reports rather than sending the whole table: funders do not need,
and some resent, a ranked view of their peers' generosity.
