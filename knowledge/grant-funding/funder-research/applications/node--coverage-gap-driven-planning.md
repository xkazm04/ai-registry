---
layer: application
type: application
subject: funder-research
technique: coverage-gap-driven-planning
stack: node
status: forged
verified_on: 2026-08-19
---

# Coverage-driven planning and silent-decay guards in a grants research engine

The `grant-writing-nonprofits` repo implements the planning loop as pure
Node/TypeScript modules under `src/features/grant-research/`, with the decay
guards in `src/features/admin/`.

## The coverage model (`coverage.ts`)

`computeCoverage(jurisdictionId, candidates, corpusGrants)` produces one
`SectorCoverage` per taxonomy sector: a `count` and a `lastResearchedAt`
timestamp (coverage.ts:12-66). Two of the technique's rules are visible as
deliberate code decisions:

- **Count both populations, one classifier.** The count includes staged
  research candidates *and* live corpus grants already serving the
  jurisdiction — added in the repo's P6 precisely "so the planner stops
  re-researching a sector the ingest adapters already fill" — and corpus
  grants are bucketed with `categorize(...)`, *"the SAME categorizer as the
  research pipeline, so ingested grants and staged candidates are bucketed
  consistently"* (coverage.ts:19-35).
- **Unclassifiable rows count toward no cell** — stated in the doc comment:
  *"A candidate/grant with no sector counts toward none, leaving those cells
  emptier so the planner prioritizes them."*

`prioritizeSectors` (coverage.ts:68-80) is the ranking: fewest candidates
first, then stalest, with never-researched (`null` → `""`) sorting before any
ISO timestamp — oldest-first exactly as the technique prescribes. The planner
(`plan.ts`) takes the head of this list as the next sweep's tasks; before the
coverage model existed the scaffold swept sectors in fixed order, and the
repo's own comment marks the upgrade ("a coverage/freshness model will
reprioritize cells (stalest+emptiest first)").

## The silent-decay guard (`admin/anomaly.ts`)

The technique's decay warning is implemented as `detectAnomalies`
(anomaly.ts:23-51), and the header comment (anomaly.ts:3-9) is the incident
rationale verbatim: a source's status is otherwise derived only from
`lastError` + item count, so a scraper broken by an upstream schema change or
bot-wall that returns 0 *without throwing* records "ok" and the source stays
"live" on its old items *"while the corpus quietly decays."* The mechanics
match the technique's rules:

- Successful runs only — errored/incomplete runs are excluded because *"an
  errored run is caught by status, not by volume"* (anomaly.ts:26-29).
- Latest vs. prior successful run per source, requiring a baseline
  (`prior <= 0` → skip).
- Two anomaly shapes: `"zero"` (latest fetched 0) and `"drop"` (decline
  beyond `ANOMALY_DROP_THRESHOLD = 0.5`, i.e. >50% — anomaly.ts:13).
- Output ranked worst-first and surfaced as admin annotations
  (`anomalyBySource`), not auto-actions — a human investigates.

## The quality companion (`admin/quality.ts`)

Coverage counts are kept honest by a deterministic per-source×market quality
scorer — six universal 1–5 criteria (completeness, freshness, categorization,
validity, richness, volume; quality.ts:1-13 and `computeQuality`) computed
*"straight from the corpus + ingest runs — no LLM"*. Two hard-won predicates
show why counting rows is not enough: `hasAward` refuses fabricated `0/0`
placeholder amounts (a real null-vs-zero ingest regression in one source's
2026 vintage), and `hasRealDesc` refuses descriptions that are verbatim
title-copies (~95% of one source's "descriptions" — "hollow enrichment").

## Upward lesson

The draft technique treated decay detection as an afterthought of planning.
The repo's incident comments taught the stronger framing adopted in the
technique body: **a coverage planner trusts counts, so the counts need their
own guard** — volume anomalies across *successful* runs are a distinct
failure channel from errors, and a cell can be numerically full of rows that
are qualitatively hollow (title-copy descriptions, placeholder amounts),
which is why the quality criteria sit beside the coverage map rather than
inside it.
