---
domain: civic-intelligence
subject: public-procurement-analysis
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# public-procurement-analysis

## Architecture review - 2026-09-09

Reviewed all ten documents. Corrected attribution, aggregation, versioning and
threshold claims. Source checks support only the scopes below. Historical consumer
code, incidents, counts, live ingest and actual indicator precision remain open;
no maturity or application witness dates changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-procurement-analysis",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:fb02d89519f8722c",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read. Primary source checks scoped below; no consumer execution or application witness refresh.",
  "counterexamples": [
    "A cancelled two-party contract with a receiver flag proves no disbursement.",
    "An omitted refund invalidates a positive-subset lower bound on net receipts.",
    "A correction replacing 100 with 10 is not necessarily a legal amendment of -90.",
    "For a regime applying at or above L, equality belongs outside the below-threshold band.",
    "Identical caps can truncate one supplier while fully covering another."
  ],
  "sources": [
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/records_reference/",
      "scope": "Process-level records, compiled state and separate implementation transactions."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "scope": "Historical dump mutation, withdrawal and reuse obligations; no local legal compliance determination."
    },
    {
      "url": "https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/",
      "scope": "2024 guide landing page and 73 indicators; formulas not exhaustively evaluated."
    },
    {
      "url": "https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/",
      "scope": "Announcement only, not current maintenance or installed behavior."
    },
    {
      "url": "https://link.springer.com/article/10.1007/s00181-022-02250-4",
      "scope": "Publisher abstract and bibliographic record; full article, correction text and replication not evaluated."
    }
  ],
  "documents": {
    "techniques/payer-vs-receiver-direction.md": {
      "disposition": "clarify",
      "reason": "Separate intended direction from actual payment; allow explicit multi-party flows and conflicting states."
    },
    "techniques/contract-version-supersession.md": {
      "disposition": "clarify",
      "reason": "Distinguish disclosure corrections, legal amendments, partial releases and deletion reconciliation."
    },
    "techniques/registry-coverage-blind-spots.md": {
      "disposition": "clarify",
      "reason": "Replace automatic floors, heuristic cap detection and equal-query comparability with explicit conditions."
    },
    "techniques/contract-registry-record-model.md": {
      "disposition": "clarify",
      "reason": "Namespace agreement identity and remove parser-as-compliance guarantee."
    },
    "techniques/value-basis-non-summability.md": {
      "disposition": "clarify",
      "reason": "Require non-overlapping compatible amounts; disclosure cannot validate a mixed monetary total."
    },
    "techniques/threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "Correct strict-boundary arithmetic and legal applicability; distinguish test results from manipulation probabilities."
    },
    "public-procurement-analysis.md": {
      "disposition": "clarify",
      "reason": "Correct payment, floor, mixed-total and publication-history claims."
    },
    "applications/node--contract-registry-record-model.md": {
      "disposition": "reverify",
      "reason": "Historical parser, identifiers and incident claims were not replayed; narrow compliance claim."
    },
    "applications/node--value-basis-non-summability.md": {
      "disposition": "reverify",
      "reason": "Composition-only disclosure leaves mixed sums invalid; consumer code and dated counts need reverification."
    },
    "applications/process--threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "Replace broad landscape assertions with bounded primary checks; correct journal volume and adoption guarantees."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

All ten documents read against baseline `44c8996585f2e5e3f36e0cb0bd1983c607cadfd7`.
Eight of the ten are the bytes the restore commit `10c12daf` put back or left
alone; the golden path, `contract-registry-record-model`,
`threshold-proximity-signals`, `value-basis-non-summability` and the two Node
applications carry the salvaged 2026-09-09 appends (dated "Source and execution
boundary" / "Review boundary" sections), which read as tightening rather than
loss and are retained.

**This entry retracts the 2026-09-09 record's blanket `clarify`.** That record
proposed corrections to seven documents against a version of them that no longer
exists, and its stated corrections — "correct strict-boundary arithmetic",
"namespace agreement identity", "require non-overlapping compatible amounts" —
are, on the restored bytes, *already present*. `threshold-proximity-signals`
already resolves jurisdiction, date, category, currency, basis and the
comparison operator before testing a band, already states the at-or-above-`L`
case explicitly, and already calls the 10% band "a triage convention, not a
validated universal default". `contract-registry-record-model` already says
"use a source-namespaced key" and already downgrades the allowlist to "data
minimization, not a compliance guarantee". `value-basis-non-summability` already
requires non-overlapping obligations within one period and perimeter. Six of the
seven proposed technique corrections were therefore either already landed or
were the compression itself. I keep them.

What survives as a real finding is external, and all of it sits in the two
documents that name sources.

**The Tas citation is wrong at the volume.** `applications/process--threshold-proximity-signals.md`
cites "Tas, *Bunching below thresholds to manipulate public procurement*
(Empirical Economics 164, 2023)". The article is Empirical Economics **64**(1),
303–319 (2023), DOI 10.1007/s00181-022-02250-4. There is also a published
Correction (10.1007/s00181-022-02270-0) that neither the document nor the
2026-09-09 record mentions; I could not open it (Springer redirects to an
authentication endpoint), so what it changed is unresolved.

**The same document, and the technique, over-read that paper.** The abstract
establishes: regression-discontinuity manipulation tests on EU procurement data;
10–13% of examined authorities with high probabilities of bunching just below
thresholds; manipulative authorities use competitive procedures significantly
less; below-threshold prices 18–28% higher where bunching probability is
elevated. It does **not** establish "more likely to award to local firms, and
more likely to repeat the same winner" — that pairing is asserted twice, in the
application and again in `techniques/threshold-proximity-signals.md`'s
procedure-type-shift bullet, on a study whose abstract does not carry it. The
"2M+ EU contracts" denominator is likewise not in the abstract. The 18–28%
price finding, which *is* in the abstract and is the paper's most useful result
for a detector's copy, appears in neither document.

Fazekas & Kocsis checked out exactly: *British Journal of Political Science*
50(1), 2020; 2.8 million contracts, 28 European countries, 2009–2014; single
bidding in competitive markets plus a composite red-flag score, validated
against country-level indices. The World Bank cost-overrun link attached to it
in the same bullet is a separate claim I did not resolve.

**Two corpus-anchored percentages have no address.**
`contract-version-supersession` says ignoring the validity flag "inflated counts
by roughly 8%" in one measured national corpus, and infers from it that the
over-count "biases exactly the top of any ranking". Neither this subject's two
Node applications nor any cited source carries that measurement, so the
inference rests on a number a reader cannot reach. `payer-vs-receiver-direction`
carries a similar unaddressed "roughly half of records carry no flag at all",
but nothing in its decision rules depends on it, so I keep it.

Sources read, not software executed: the OCDS records reference (which confirms
one record per contracting process and several awards/contracts inside one
process — the record model's four-identity split is correct as written), the
Registr smluv open-data page (which confirms retroactively regenerated dumps,
removal of *all* versions on withdrawal, and controller obligations on reuse —
the Node application's compliance paragraph is accurate about the source), the
OCP red-flags guide landing page (73 indicators, 2024, lifecycle coverage,
OCDS-mapped), and the Cardinal announcement (10 indicators shipping, eight more
planned; applied to Ecuador and the Dominican Republic; "ready to be applied"
to 50+ governments' OCDS data). No consumer parser, incident, count or ingest
was re-executed; the EU PPDS launch date and the Social Indicators Research
validity caveat were not re-checked this pass.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-procurement-analysis",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:5775aeb0c3d92ff8",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full against the post-restore bytes. Primary sources read (not executed): OCDS records reference, smlouvy.gov.cz open-data terms, OCP red-flags guide landing page, Cardinal announcement, Tas 2023 bibliographic record and abstract via EconPapers, Fazekas & Kocsis abstract. Not evaluated: the politicas consumer code, its line numbers, incident batches and corpus counts; the Tas correction notice (Springer authentication wall); the Tas full text; the EU PPDS launch date; the Social Indicators Research and ScienceDirect false-positive citations; the World Bank cost-overrun link; any live registry ingest.",
  "counterexamples": [
    "A contracting process with two awards to two suppliers has one OCDS record and one ocid, so a per-record count of 'contracts' undercounts agreements exactly where the record model says to key on the agreement.",
    "A withdrawn contract is removed from every historical dump, so a re-harvest that only adds rows leaves a claim standing that the registry no longer publishes at all.",
    "A supplier whose net and gross rows never overlap in period or obligation still cannot be summed, so matching the value basis is necessary and not sufficient.",
    "An authority that bunches below a threshold may award to a distant national firm and rotate winners; the bunching finding constrains procedure type and price, not locality or repetition.",
    "A cluster of awards just under a threshold from one buyer in one week can be a policy-encouraged lot division, which document review resolves and no density test can."
  ],
  "sources": [
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/records_reference/",
      "result": "Established one record per contracting process, one ocid, a compiled release as the merged current state, and that one process may carry several awards and contracts. Did not establish anything about the Czech registry's own mapping or about amendment semantics in non-OCDS sources."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "result": "Established monthly XML dumps regenerated retroactively, removal of all versions of a contract from historical dumps on withdrawal, and GDPR controller obligations including deletion of data made inaccessible. Established no explicit licence statement. Did not verify the cited consumer parser, the search-role asymmetry, the session-bound pagination trap, or any batch measurement."
    },
    {
      "url": "https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/",
      "result": "Established 73 red-flag indicators, 2024, planning-to-implementation coverage, calculation formulas over standardized data mapped to OCDS. Did not establish the December publication month, and no individual formula was evaluated."
    },
    {
      "url": "https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/",
      "result": "Established the 2024-06-12 announcement, 10 shipped indicators with eight more planned, and application to Ecuador and the Dominican Republic with readiness for 50+ OCDS-publishing governments. Did not establish current maintenance, installed behaviour, or that the library has been applied at that scale."
    },
    {
      "url": "https://econpapers.repec.org/RePEc:rsc:rsceui:2019/17",
      "result": "Established the abstract: RD manipulation tests on EU data, 10-13% of examined authorities with high bunching probability, significantly less use of competitive procedures, and 18-28% higher below-threshold prices where bunching probability is elevated. Did NOT establish a 2M+ contract denominator, local-firm favouritism, or repeat-winner concentration."
    },
    {
      "url": "https://link.springer.com/article/10.1007/s00181-022-02250-4",
      "result": "Bibliographic record resolved via search: Empirical Economics 64(1), 303-319 (2023) - not volume 164 as the application states. A separate Correction exists at 10.1007/s00181-022-02270-0; both the article and the correction are behind a Springer authentication redirect and their texts were not read."
    },
    {
      "url": "https://www.cambridge.org/core/journals/british-journal-of-political-science/article/abs/uncovering-highlevel-corruption-crossnational-objective-corruption-risk-indicators-using-public-procurement-data/8A1742693965AA92BE4D2BA53EADFDF0",
      "result": "Established Fazekas & Kocsis, BJPS 50(1), 2020: 2.8 million contracts, 28 European countries, 2009-2014, single bidding plus a composite red-flag score, validated against country-level indices. The application's characterisation is accurate. Did not establish the World Bank cost-overrun claim attached to it in the same bullet."
    }
  ],
  "documents": {
    "public-procurement-analysis.md": {
      "disposition": "keep",
      "reason": "The five distinctions, the four failure modes and the stance survive source contact intact; the salvaged qualifications (contract-only disclosure does not establish payment, disclosure does not validate a mixed sum, repeated publications can represent one agreement) are already present and correct."
    },
    "techniques/contract-registry-record-model.md": {
      "disposition": "keep",
      "reason": "The four-identity split is confirmed by the OCDS records reference, including the process-may-contain-several-agreements caveat the document already carries; the parsing rules and the data-minimization-not-compliance framing need no change."
    },
    "techniques/contract-version-supersession.md": {
      "disposition": "clarify",
      "reason": "The 'roughly 8% inflation' from ignoring the validity flag, and the inference that the over-count biases the top of a ranking, rest on a measurement no application or source in this subject carries. Give the figure an addressable witness or state it as an unverified field observation."
    },
    "techniques/payer-vs-receiver-direction.md": {
      "disposition": "keep",
      "reason": "The three-state rule, the conjunctive documented-payment predicate and the copy-matches-bucket rule are sound; the unaddressed 'roughly half carry no flag' is illustrative and no decision rule depends on it."
    },
    "techniques/registry-coverage-blind-spots.md": {
      "disposition": "keep",
      "reason": "The censoring enumeration, the two-role sweep rule with its decisive test, and the equal-coverage comparison rule are internally consistent and confirmed in shape by the registry's own open-data terms."
    },
    "techniques/threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "The procedure-type-shift bullet claims population-scale studies validate that bunching buyers are 'more likely to award locally, and more likely to repeat the same winner'. The cited study's abstract establishes only reduced competitive-procedure use and 18-28% higher below-threshold prices. Narrow the claim to what the study carries, and add the price effect."
    },
    "techniques/value-basis-non-summability.md": {
      "disposition": "keep",
      "reason": "The basis taxonomy, the no-silent-conversion rule, the unknown-belongs-to-neither-side state and the composition-with-every-total rule are correct as they stand; the overlap-and-perimeter condition the prior record asked for is already in the text."
    },
    "applications/node--contract-registry-record-model.md": {
      "disposition": "reverify",
      "reason": "The registry's open-data terms confirm the compliance paragraph's premises (mutable historical dumps, full-version removal on withdrawal, controller obligations). The batch-012 id collision, the batch-011 search-role test, the header-row assertion and every cited line number are historical consumer claims that were not reopened."
    },
    "applications/node--value-basis-non-summability.md": {
      "disposition": "reverify",
      "reason": "The 82,918 / 36,580 / 2,959 corpus split, the zero-consumer grep, the amountBasis line references and the sums-did-not-move regression are dated witnesses that were not re-executed; recording the basis exposes the mixed total without repairing it, which the document already states."
    },
    "applications/process--threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "Journal volume is wrong (Empirical Economics 64(1):303-319, 2023, not 164); the '2M+ EU contracts' denominator and the local-firm and repeat-winner findings are not in the cited abstract; the study's 18-28% below-threshold price effect and its published Correction are unmentioned. Fazekas & Kocsis, the 73-indicator guide and the Cardinal announcement check out."
    }
  }
}
```
