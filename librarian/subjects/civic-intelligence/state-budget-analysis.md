---
domain: civic-intelligence
subject: state-budget-analysis
last_touched: 2026-10-31
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

## 2026-10-22 - median-over-mean-for-peers applied to politicas (run apply-mompeers-1022)

Applied in `code` mode, verdict `better`, proof `ab-paired`. The null rules were
already held, and a pin test already guarded the debt-only sample count. So the
seam targeted the first decision rule: the minimum belongs on each metric's
reporting peers after widening. The tree applied it only as a widening trigger,
so nothing stopped a red verdict against a sub-floor median. Over the batch the
smallest sample is exactly 5, so the rule held by data, not construction. B
withholds the verdict below the floor and still prints the median with its
count. A fixture test fails on A and passes on B, and no verdict on the real
batch moves. No technique edit: its rule already says "after permissible
widening". Residual: the trend line and the peer table carry no sample guard
of their own.

## Application - 2026-10-22 (per-capita-normalisation, politicas, experiment)

Seam chosen to falsify the finite-positive divisor rule: the shared routine
guards null and non-positive but not NaN or infinity. Real batch, 660 cells:
both arms identical, because the live client and the snapshot parser filter
non-finite values upstream. The rule holds by composition, so no technique
edit and no tree change; the first node application for this technique is
`applications/node--per-capita-normalisation.md`. Lead: one town's divisor
steps -15.7% between 2021 and 2022 and the technique says nothing about a
divisor that breaks between periods; wait for a second town before amending.

## Application - 2026-10-31 (small-sample-widening, politicas, code)

Seam chosen to falsify decision rule 4 (the floor applies to the effective
sample): the per-metric medians were computed from each metric's own
reporters, but all three verdicts were guarded with the debt count. Batch
probe: 0 of 132 towns had a capex or saldo sample that differed, so the rule
held by data, and a pinned test would have blocked the next thinning batch
instead of rendering it. The fix splits the count per metric and prints it
when it differs. The fixture went red on A and green on B, and no batch
verdict moved. First application document for this technique:
`applications/node--small-sample-widening.md`. The single-stack point stays:
the fleet has one civic consumer. Owed: a per-point floor on the debt trend
and on any future rank.

## Architecture review - 2026-10-31

Re-review of all 13 documents. The 2026-09-09 clarifies are in the text, and five applications arrived since, two of which added boundary sentences. One precedence statement in the golden path disagrees with its technique.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/state-budget-analysis",
  "date": "2026-10-31",
  "baseline": "c283f0c50",
  "digest": "sha256-b2:4feef15a43fc221c",
  "disposition": "clarify",
  "coverage": "All 13 current documents read in full. Prior clarifies checked by diff against the 2026-09-09 baselines; applications' internal arithmetic recomputed. Primary sources listed were opened this run unless marked otherwise. Not evaluated: any connected-project tree, dump replay or test run. No verification date refreshed.",
  "counterexamples": [
    "Debt reported for the town alone sits beside consolidated expenditure under one 'consolidated' caption.",
    "A capex median over four reporters passes a guard that counts five debt reporters.",
    "A town's population base steps 15.7% between two years, so a per-resident trend partly measures the divisor.",
    "Five eligible peers with only two reporting a metric do not meet a five-reporting-peer floor (retained)."
  ],
  "sources": [
    {
      "url": "https://csu.gov.cz/docs/107508/211ffe08-c8da-ce70-c3cd-796bacaa99ad/340130-22dds.htm",
      "result": "Read 2026-10-31. The statistics office's dataset 'Velikostní skupiny obcí' defines ten groups: under 200, 200-499, 500-999, 1 000-1 999, 2 000-4 999, 5 000-9 999, 10 000-19 999, 20 000-49 999, 50 000-99 999, 100 000 and over. This locates an official ten-band definition matching the application's 'ten bands' description; the consumer's constants were not re-read, so the application stays reverify."
    },
    {
      "url": "https://www.imf.org/external/Pubs/FT/GFS/Manual/2014/gfsfinal.pdf",
      "result": "Not re-opened; retained from 2026-09-09 (GFSM 2014 3.159-3.161 consolidation)."
    },
    {
      "source": "Arithmetic across documents",
      "result": "1.85 bn / 794 mil = 2.33 (the 2.3x case); 17,103 to 14,420 = -15.7%; 132 x 5 = 660 cells."
    }
  ],
  "documents": {
    "state-budget-analysis.md": {
      "disposition": "clarify",
      "reason": "2026-09-09 clarifies landed (municipal-comparison scope, no universal per-capita). Owed: the principles bullet puts 'size class and comparable mandate first, geography second', while peer-group-construction rule 1 orders 'comparable mandate, reporting perimeter and period first; size next'. Align the precedence."
    },
    "techniques/consolidated-vs-headline-figures.md": {
      "disposition": "keep",
      "reason": "Debt-stock consolidation, perimeter/basis/stage and the 2026-10-22 per-indicator provenance sentence are present. The single 2.3x case is consistent with the application's adapter figure (1.85 bn / 794 mil = 2.33) and with its batch range (1.14x to 7.98x)."
    },
    "techniques/median-over-mean-for-peers.md": {
      "disposition": "keep",
      "reason": "Below-floor policy unified with widening; typical-town versus resident-weighted estimands distinguished."
    },
    "techniques/municipal-money-trail.md": {
      "disposition": "keep",
      "reason": "Party identity, transaction proof for payment, involvement versus allocation and undated-period gating are present."
    },
    "techniques/peer-group-construction.md": {
      "disposition": "keep",
      "reason": "Mandate/perimeter prerequisites and qualified official-band and dynamic-cohort prescriptions are present."
    },
    "techniques/per-capita-normalisation.md": {
      "disposition": "keep",
      "reason": "Finite positive divisor and aligned reference definitions present. Open lead (a divisor that steps between periods) has one sighting and is not owed here."
    },
    "techniques/small-sample-widening.md": {
      "disposition": "keep",
      "reason": "The false median rationale is gone; the small-population exception is per metric. Decision rule 4 is now corroborated by its application."
    },
    "applications/node--municipal-money-trail.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; publisher-or-party join and paid predicate gaps disclosed; not executed."
    },
    "applications/node--peer-group-construction.md": {
      "disposition": "reverify",
      "reason": "The statistics office's ten size groups were located this run (csu.gov.cz dataset 'Velikostní skupiny obcí'), matching the application's 'ten half-open bands'. The consumer's POPULATION_BANDS were not re-read, so conformity is still unverified; per-metric sample is now fixed per the small-sample application."
    },
    "applications/node--consolidated-vs-headline-figures.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (330 of 660 town-years; 1.85 bn / 794 mil). The 660-call source capture and private tree not re-run."
    },
    "applications/node--median-over-mean-for-peers.md": {
      "disposition": "reverify",
      "reason": "Batch counts and fixture A/B not re-run; residuals (trend line, table) disclosed."
    },
    "applications/node--per-capita-normalisation.md": {
      "disposition": "reverify",
      "reason": "17,103 to 14,420 is -15.7%, as stated. Arms not re-run."
    },
    "applications/node--small-sample-widening.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B and the 0 of 132 probe not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the golden-path clarify. Applications untouched and keep `reverify`, now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/state-budget-analysis",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:1eb6844cff16b102",
  "disposition": "reverify",
  "coverage": "All 13 documents decided. The clarify items owed by the earlier 2026-10-31 record were applied and re-read; other documents are byte-unchanged and keep their dispositions. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "Debt reported for the town alone sits beside consolidated expenditure under one 'consolidated' caption.",
    "A capex median over four reporters passes a guard that counts five debt reporters.",
    "A town's population base steps 15.7% between two years, so a per-resident trend partly measures the divisor.",
    "Five eligible peers with only two reporting a metric do not meet a five-reporting-peer floor (retained)."
  ],
  "sources": [
    {
      "url": "https://csu.gov.cz/docs/107508/211ffe08-c8da-ce70-c3cd-796bacaa99ad/340130-22dds.htm",
      "result": "Read 2026-10-31. The statistics office's dataset 'Velikostní skupiny obcí' defines ten groups: under 200, 200-499, 500-999, 1 000-1 999, 2 000-4 999, 5 000-9 999, 10 000-19 999, 20 000-49 999, 50 000-99 999, 100 000 and over. This locates an official ten-band definition matching the application's 'ten bands' description; the consumer's constants were not re-read, so the application stays reverify."
    },
    {
      "url": "https://www.imf.org/external/Pubs/FT/GFS/Manual/2014/gfsfinal.pdf",
      "result": "Not re-opened; retained from 2026-09-09 (GFSM 2014 3.159-3.161 consolidation)."
    },
    {
      "source": "Arithmetic across documents",
      "result": "1.85 bn / 794 mil = 2.33 (the 2.3x case); 17,103 to 14,420 = -15.7%; 132 x 5 = 660 cells."
    }
  ],
  "documents": {
    "state-budget-analysis.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the principles bullet 'size class and comparable mandate first, geography second' now reads 'comparable mandate and reporting perimeter first, then size class; geography last', matching peer-group-construction rule 1. Per-capita and real-budget universals removed by the 2026-09-09 pass remain removed."
    },
    "techniques/consolidated-vs-headline-figures.md": {
      "disposition": "keep",
      "reason": "Debt-stock consolidation, perimeter/basis/stage and the 2026-10-22 per-indicator provenance sentence are present. The single 2.3x case is consistent with the application's adapter figure (1.85 bn / 794 mil = 2.33) and with its batch range (1.14x to 7.98x)."
    },
    "techniques/median-over-mean-for-peers.md": {
      "disposition": "keep",
      "reason": "Below-floor policy unified with widening; typical-town versus resident-weighted estimands distinguished."
    },
    "techniques/municipal-money-trail.md": {
      "disposition": "keep",
      "reason": "Party identity, transaction proof for payment, involvement versus allocation and undated-period gating are present."
    },
    "techniques/peer-group-construction.md": {
      "disposition": "keep",
      "reason": "Mandate/perimeter prerequisites and qualified official-band and dynamic-cohort prescriptions are present."
    },
    "techniques/per-capita-normalisation.md": {
      "disposition": "keep",
      "reason": "Finite positive divisor and aligned reference definitions present. Open lead (a divisor that steps between periods) has one sighting and is not owed here."
    },
    "techniques/small-sample-widening.md": {
      "disposition": "keep",
      "reason": "The false median rationale is gone; the small-population exception is per metric. Decision rule 4 is now corroborated by its application."
    },
    "applications/node--municipal-money-trail.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; publisher-or-party join and paid predicate gaps disclosed; not executed."
    },
    "applications/node--peer-group-construction.md": {
      "disposition": "reverify",
      "reason": "The statistics office's ten size groups were located this run (csu.gov.cz dataset 'Velikostní skupiny obcí'), matching the application's 'ten half-open bands'. The consumer's POPULATION_BANDS were not re-read, so conformity is still unverified; per-metric sample is now fixed per the small-sample application."
    },
    "applications/node--consolidated-vs-headline-figures.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (330 of 660 town-years; 1.85 bn / 794 mil). The 660-call source capture and private tree not re-run."
    },
    "applications/node--median-over-mean-for-peers.md": {
      "disposition": "reverify",
      "reason": "Batch counts and fixture A/B not re-run; residuals (trend line, table) disclosed."
    },
    "applications/node--per-capita-normalisation.md": {
      "disposition": "reverify",
      "reason": "17,103 to 14,420 is -15.7%, as stated. Arms not re-run."
    },
    "applications/node--small-sample-widening.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B and the 0 of 132 probe not re-run."
    }
  }
}
```
