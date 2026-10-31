---
domain: civic-intelligence
subject: roll-call-vote-analysis
last_touched: 2026-10-22
touched_by: intake
dry_streak: 0
---

# roll-call-vote-analysis

## Architecture review - 2026-09-09

Reviewed all nine documents. Corrected binary-measure interpretation, support,
identity and aggregation boundaries. Application implementation claims remain
reverify work; no maturity or historical witness dates were refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/roll-call-vote-analysis",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a43921646b1b581e",
  "disposition": "clarify",
  "coverage": "All nine owned documents read; official source schema checked. Consumer code, fixtures, historical counts and field behavior not evaluated.",
  "counterexamples": [
    "Fifty divisions with one group voter each pass a personal count floor without establishing supported group lines.",
    "Two unanimous opposing groups yield average within-group Rice 1 and pooled Rice 0.",
    "A ballot identity swap preserves chamber totals while reversing individual records.",
    "A yes/no measure can survive a merge of abstention categories it never used.",
    "An unaffiliated member can still have a valid pairwise agreement rate."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "scope": "Publisher codes, merged category, unavailable individual ballots, excusal precedence and challenge semantics; no national-law opinion or live-data recount."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "scope": "Full-snapshot update and dependent-data consistency guidance."
    }
  ],
  "documents": {
    "roll-call-vote-analysis.md": {
      "disposition": "clarify",
      "reason": "Qualify source completeness, abstention semantics and support-floor inference."
    },
    "techniques/club-line-and-rebellion.md": {
      "disposition": "clarify",
      "reason": "Require dated membership and separate line support; a personal count floor cannot validate thin group lines."
    },
    "techniques/co-voting-agreement-matrix.md": {
      "disposition": "clarify",
      "reason": "Guard duplicate person/division rows and qualify reliability and cross-period rate comparability."
    },
    "techniques/positional-vs-participation-bases.md": {
      "disposition": "clarify",
      "reason": "Separate binary convention, participation evidence and valid subset fractions; preserve unaffiliated pairwise analysis."
    },
    "techniques/rice-cohesion-index.md": {
      "disposition": "clarify",
      "reason": "Remove whipping inference and distinguish average within-group cohesion from pooled chamber cohesion."
    },
    "techniques/tally-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Require same-snapshot comparison and affected-output gating; allow traceable repairs to confirmed ingest defects."
    },
    "techniques/vote-choice-vocabulary-mapping.md": {
      "disposition": "clarify",
      "reason": "Keep raw codes and restrict vocabulary-break claims to affected metrics."
    },
    "applications/node--club-line-and-rebellion.md": {
      "disposition": "reverify",
      "reason": "Dated source mapping checked; consumer membership, thin-line and ranking implementations not executed."
    },
    "applications/node--tally-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Publisher aggregate columns checked; consumer recount and historical incident not replayed."
    }
  }
}
```

## Apply - 2026-10-10 (intake, run intake-apply-co-voting-2026-10-10)

First application of `co-voting-agreement-matrix`, a code change on politicas with
verdict `better`, shipped and pushed. The run was dispatched for the single-stack
point, and a third node application does not move that point. The run chose the
seam because it could falsify the technique's baseline rule. The profile's
agreement panel printed rates with denominators but without a reference, under an
alliance label. A replay of the public term-10 dumps through the project's own
matrix function measured the baseline: the same-club median is 0.996 and the
cross-club median is 0.431. 87% of the rows shown were the MP's own club. The
panel now prints both medians and no longer says "allies". The seam partly
refuted the expectation, because most rows sit more than one ballot above the
club median. It also returned a second finding, now a boundary in the technique:
rounded stored rates tie at the cut on 151 of 203 profiles. The write-time prune
and the duplicate-ballot rule are latent on this corpus (0 pairs pruned,
0 duplicates).

The application documents carry the measurements.

## Apply - 2026-10-22 (intake, run intake-apply-vcvm-1022)

First application of `vote-choice-vocabulary-mapping`: a code change on politicas
with verdict `better`, proof ab-paired, shipped and pushed (f4c09cd). The run was
dispatched for the single-stack point, and a sixth node application does not move
it. The seam was chosen to falsify rule 3. The ingest half conforms: the schema
quoted, the raw code kept, unknown reserved, the merged code kept merged. The
display bucketer one layer up re-listed the presence set, and its default arm
filed `unknown` as away, pinned by a test. Away is the slot reconciliation never
compares, so the error would have surfaced nowhere. Fixture: A filed 2 of 2
unknown ballots as absences, B 0 of 2, counted in `coverage.unknownChoice`. A first
draft of B dropped the seat with the ballot (3 to 2), and the paired print caught
it before landing. Live term-10 ballots: 495,800, all documented codes, 0 unknown,
so no figure moved. The technique gains one paragraph: every mapping built on the
vocabulary owes rule 3, with typed input, imported sets and no default arm.
Residual: the count is not yet rendered on the page.

## Architecture review - 2026-10-31

Re-review of all 13 documents. The 2026-09-09 clarifies are in the text, and four applications and two boundary paragraphs arrived since. One example in the golden path drops the condition that makes it true.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/roll-call-vote-analysis",
  "date": "2026-10-31",
  "baseline": "c283f0c50",
  "digest": "sha256-b2:1fb04612acd77185",
  "disposition": "clarify",
  "coverage": "All 13 current documents read in full. Prior clarifies checked by diff against the 2026-09-09 baselines; applications' internal arithmetic recomputed. Primary sources listed were opened this run unless marked otherwise. Not evaluated: any connected-project tree, dump replay or test run. No verification date refreshed.",
  "counterexamples": [
    "Twenty members who vote 10 yes and 10 no while 80 stay away score Rice 0, not 1, so the strategic-absence example needs the shared direction.",
    "A display bucketer with a default arm files an unknown code as an absence, the one slot reconciliation never compares.",
    "Rounded stored rates tie at a top-N cut, so store order picks the last partners shown.",
    "Two unanimous opposing groups yield average within-group Rice 1 and pooled Rice 0 (retained)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "result": "Re-read 2026-10-31. hl_poslanec.id_poslanec is 'Identifikátor poslance, viz poslanec:id_poslanec' (the mandate row). Codes: 'A' ano, 'B' or 'N' ne, 'C' zdržel se, 'F' nehlasoval, '@' nepřihlášen, 'M' omluven, 'W' hlasování před složením slibu, 'K' zdržel se/nehlasoval; 'Od účinnosti novely jednacího řádu 90/1995 Sb. se nerozlišuje zdržel se a nehlasoval'. Manual votes: 'R - ruční (nejsou známy hlasování jednotlivých poslanců)'; 'E' marks votes with data missing through a technical fault. zmatecne votes are those 'na jejich výsledek nebyl brán zřetel'; hl_check records challenges, where mode 1 is only a note for the transcript. Supports the vocabulary, merged-category ceiling, coverage and challenge-is-not-annulment claims."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "result": "Not re-opened; retained from 2026-09-09 (full-snapshot updates)."
    }
  ],
  "documents": {
    "roll-call-vote-analysis.md": {
      "disposition": "clarify",
      "reason": "2026-09-09 clarifies landed (coverage before census, binary metric cannot classify abstention intent, support floor is a convention). Owed: 'a party where 20 of 100 members vote and 80 stay away scores as perfectly unified' is true only if the 20 vote the same way; rice-cohesion-index says '20 of 100 members vote yes'. Align."
    },
    "techniques/club-line-and-rebellion.md": {
      "disposition": "keep",
      "reason": "Dated membership, a separate per-division line-support rule, leave-one-out disclosure and per-group rollup across switches are present."
    },
    "techniques/co-voting-agreement-matrix.md": {
      "disposition": "keep",
      "reason": "One resolved ballot per person/division, cross-period comparability and the 2026-10-10 rounded-rate tie boundary are present and consistent with the application (151 of 203 tie cuts)."
    },
    "techniques/positional-vs-participation-bases.md": {
      "disposition": "keep",
      "reason": "Binary convention scoped, subset fractions named, unaffiliated pairwise analysis preserved, eligibility respects mandate dates."
    },
    "techniques/rice-cohesion-index.md": {
      "disposition": "keep",
      "reason": "Whipping inference removed; within-group versus pooled cohesion separated; arithmetic checks: a 2-1 group of three scores 1/3, majority share = (Rice + 1) / 2."
    },
    "techniques/tally-reconciliation.md": {
      "disposition": "keep",
      "reason": "Same-snapshot comparison, affected-output gating, traceable repair of confirmed ingest defects and the identity-swap limit are present."
    },
    "techniques/vote-choice-vocabulary-mapping.md": {
      "disposition": "keep",
      "reason": "Raw codes kept, vocabulary-break claims limited to affected metrics, and the 2026-10-22 second-mapping paragraph is consistent with its application. Code list and the 90/1995 merge confirmed against k=1302 this run."
    },
    "applications/node--club-line-and-rebellion.md": {
      "disposition": "reverify",
      "reason": "The quoted 1995 ceiling note matches k=1302 (novela 90/1995 Sb.). Consumer code and fixtures not executed."
    },
    "applications/node--tally-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer recount and the historical incident not replayed."
    },
    "applications/node--co-voting-agreement-matrix.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (1,624 - 1,419 = 205 cross-club rows; 1,568 / 1,624 = 96.6%). Replay and private tree at 486c1bd not re-run."
    },
    "applications/node--positional-vs-participation-bases.md": {
      "disposition": "reverify",
      "reason": "Structural-only proof with two observed-but-unchanged defects disclosed; tree not reopened."
    },
    "applications/node--rice-cohesion-index.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B; the live share of thin days is explicitly unmeasured; tree not reopened."
    },
    "applications/node--vote-choice-vocabulary-mapping.md": {
      "disposition": "reverify",
      "reason": "The four live codes it reports are documented codes in k=1302. Fixture A/B and 495,800-ballot count not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the golden-path clarify. Applications untouched and keep `reverify`, now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/roll-call-vote-analysis",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:175c79131c4adda4",
  "disposition": "reverify",
  "coverage": "All 13 documents decided. The clarify items owed by the earlier 2026-10-31 record were applied and re-read; other documents are byte-unchanged and keep their dispositions. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "Twenty members who vote 10 yes and 10 no while 80 stay away score Rice 0, not 1, so the strategic-absence example needs the shared direction.",
    "A display bucketer with a default arm files an unknown code as an absence, the one slot reconciliation never compares.",
    "Rounded stored rates tie at a top-N cut, so store order picks the last partners shown.",
    "Two unanimous opposing groups yield average within-group Rice 1 and pooled Rice 0 (retained)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "result": "Re-read 2026-10-31. hl_poslanec.id_poslanec is 'Identifikátor poslance, viz poslanec:id_poslanec' (the mandate row). Codes: 'A' ano, 'B' or 'N' ne, 'C' zdržel se, 'F' nehlasoval, '@' nepřihlášen, 'M' omluven, 'W' hlasování před složením slibu, 'K' zdržel se/nehlasoval; 'Od účinnosti novely jednacího řádu 90/1995 Sb. se nerozlišuje zdržel se a nehlasoval'. Manual votes: 'R - ruční (nejsou známy hlasování jednotlivých poslanců)'; 'E' marks votes with data missing through a technical fault. zmatecne votes are those 'na jejich výsledek nebyl brán zřetel'; hl_check records challenges, where mode 1 is only a note for the transcript. Supports the vocabulary, merged-category ceiling, coverage and challenge-is-not-annulment claims."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "result": "Not re-opened; retained from 2026-09-09 (full-snapshot updates)."
    }
  ],
  "documents": {
    "roll-call-vote-analysis.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the strategic-absence example now reads '20 of 100 members vote yes and 80 stay away', matching rice-cohesion-index; without the shared direction the 20 would not score as unified. Source-completeness, abstention-semantics and support-floor clarifies from 2026-09-09 are present."
    },
    "techniques/club-line-and-rebellion.md": {
      "disposition": "keep",
      "reason": "Dated membership, a separate per-division line-support rule, leave-one-out disclosure and per-group rollup across switches are present."
    },
    "techniques/co-voting-agreement-matrix.md": {
      "disposition": "keep",
      "reason": "One resolved ballot per person/division, cross-period comparability and the 2026-10-10 rounded-rate tie boundary are present and consistent with the application (151 of 203 tie cuts)."
    },
    "techniques/positional-vs-participation-bases.md": {
      "disposition": "keep",
      "reason": "Binary convention scoped, subset fractions named, unaffiliated pairwise analysis preserved, eligibility respects mandate dates."
    },
    "techniques/rice-cohesion-index.md": {
      "disposition": "keep",
      "reason": "Whipping inference removed; within-group versus pooled cohesion separated; arithmetic checks: a 2-1 group of three scores 1/3, majority share = (Rice + 1) / 2."
    },
    "techniques/tally-reconciliation.md": {
      "disposition": "keep",
      "reason": "Same-snapshot comparison, affected-output gating, traceable repair of confirmed ingest defects and the identity-swap limit are present."
    },
    "techniques/vote-choice-vocabulary-mapping.md": {
      "disposition": "keep",
      "reason": "Raw codes kept, vocabulary-break claims limited to affected metrics, and the 2026-10-22 second-mapping paragraph is consistent with its application. Code list and the 90/1995 merge confirmed against k=1302 this run."
    },
    "applications/node--club-line-and-rebellion.md": {
      "disposition": "reverify",
      "reason": "The quoted 1995 ceiling note matches k=1302 (novela 90/1995 Sb.). Consumer code and fixtures not executed."
    },
    "applications/node--tally-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer recount and the historical incident not replayed."
    },
    "applications/node--co-voting-agreement-matrix.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (1,624 - 1,419 = 205 cross-club rows; 1,568 / 1,624 = 96.6%). Replay and private tree at 486c1bd not re-run."
    },
    "applications/node--positional-vs-participation-bases.md": {
      "disposition": "reverify",
      "reason": "Structural-only proof with two observed-but-unchanged defects disclosed; tree not reopened."
    },
    "applications/node--rice-cohesion-index.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B; the live share of thin days is explicitly unmeasured; tree not reopened."
    },
    "applications/node--vote-choice-vocabulary-mapping.md": {
      "disposition": "reverify",
      "reason": "The four live codes it reports are documented codes in k=1302. Fixture A/B and 495,800-ballot count not re-run."
    }
  }
}
```
