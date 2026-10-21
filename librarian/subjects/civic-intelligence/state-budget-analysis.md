---
domain: civic-intelligence
subject: state-budget-analysis
last_touched: 2026-10-22
touched_by: intake
dry_streak: 0
---

# state-budget-analysis

## Architecture review - 2026-09-09

Reviewed all nine documents. Corrected fiscal perimeter, debt consolidation,
normalization, small-sample policy and money-attribution boundaries. Consumer
fixtures, source band definitions, local accounting and historical incidents
remain reverify work. No maturity or application witness dates changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/state-budget-analysis",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:5e14df01c1948e67",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Primary consolidation guidance checked; no consumer runtime, national accounting conformity or incident replay.",
  "counterexamples": [
    "Debt held by another unit inside the perimeter requires stock consolidation.",
    "A publisher can disclose a contract without being a contracting party.",
    "A multi-town contract value of 100 does not establish that each town owes 100.",
    "Five eligible peers with only two reporting a metric do not meet a five-reporting-peer floor.",
    "A zero or negative population is not a valid divisor.",
    "An ordinary median uses one or two central values even with more than five observations."
  ],
  "sources": [
    {
      "url": "https://www.imf.org/external/Pubs/FT/GFS/Manual/2014/gfsfinal.pdf",
      "scope": "GFSM 2014 paragraphs 3.159-3.161: consolidation eliminates reciprocal flows and stock positions within a defined boundary; no local-accounting certification."
    },
    {
      "url": "https://www.elibrary.imf.org/display/book/9781616351564/ch008.xml",
      "scope": "Public Sector Debt Statistics chapter 8: consolidation of intra/intersectoral debt positions."
    },
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/records_reference/",
      "scope": "Contract values and implementation transactions are distinct source objects; no consumer join verification."
    }
  ],
  "documents": {
    "state-budget-analysis.md": {
      "disposition": "clarify",
      "reason": "Scope municipal comparison and remove universal per-capita and real-budget claims."
    },
    "techniques/consolidated-vs-headline-figures.md": {
      "disposition": "clarify",
      "reason": "Correct debt-stock consolidation and define perimeter, accounting basis and budget stage."
    },
    "techniques/median-over-mean-for-peers.md": {
      "disposition": "clarify",
      "reason": "Unify below-floor publication with widening and distinguish typical-town from resident-weighted estimands."
    },
    "techniques/municipal-money-trail.md": {
      "disposition": "clarify",
      "reason": "Require actual party identity and transaction proof; distinguish involvement from allocation and gate undated period sums."
    },
    "techniques/peer-group-construction.md": {
      "disposition": "clarify",
      "reason": "Make mandate/perimeter prerequisites explicit and qualify official-band and dynamic-cohort prescriptions."
    },
    "techniques/per-capita-normalisation.md": {
      "disposition": "clarify",
      "reason": "Validate positive population and aligned reference definitions; remove household-liability and solvency inferences."
    },
    "techniques/small-sample-widening.md": {
      "disposition": "clarify",
      "reason": "Fix false median rationale and align small-population exception with per-metric coverage and comparability."
    },
    "applications/node--municipal-money-trail.md": {
      "disposition": "reverify",
      "reason": "Historical join and review-state implementation not executed; identify payment, publisher, mixed-sum and allocation gaps."
    },
    "applications/node--peer-group-construction.md": {
      "disposition": "reverify",
      "reason": "Historical bands and code not reverified; per-metric counts and latest-period alignment remain open."
    }
  }
}
```

## Apply - 2026-10-22 (intake, run intake-apply-cvhf-1022)

First application of `consolidated-vs-headline-figures`: a code change on politicas,
verdict `better`, proof ab-paired, shipped and pushed (ab72023). The run was
dispatched for the single-stack point, and a third node application does not move
it. The seam was chosen to falsify rules 1 and 3, because the ingest half already
conforms on expenditure (it reads the consolidated variants, records the gap and
takes the ratio from one variant). The source's own per-indicator metadata, fetched
for all 132 batch towns over 2021-2025, showed that debt is a balance-sheet stock
with no consolidated variant and covers the town alone: organization debt is a
separate indicator in 330 of 660 town-years and 90 of 132 towns. The page captioned
all of it "consolidated FIN 2-12 M". B names each field's variant from one
definition, pinned to a live capture. Two tests fail on A and pass on B, no figure
moves, and the pre-push gate passed 4,215 tests. The technique gains one boundary
sentence: the non-comparable flag is usually dropped at the caption, and provenance
should be built from the source's per-indicator declaration, not a naming suffix.
Residual: the debt perimeter (town alone or with its organizations) is the owner's
decision and is recorded in the project's route doc.
