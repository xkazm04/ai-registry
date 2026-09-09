---
subject: campaign-anomaly-triage
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# campaign-anomaly-triage

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** ranking which campaigns a paid-search manager should open first, designing badges and alerts over a paid portfolio, deciding whether a metric move is an anomaly or weekday noise, stopping an alert inbox from repeating itself

**Techniques (7):** crater-vs-slow-bleed, disjoint-severity-rules-worst-first, hysteresis-and-cooldown-tombstones, one-target-reciprocal-thresholds, severity-times-spend-attention-order, spend-spike-without-return, weekday-deseasonalised-baseline.

**Applications (3; stacks: node):** node--hysteresis-and-cooldown-tombstones, node--one-target-reciprocal-thresholds, node--weekday-deseasonalised-baseline.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.
