---
domain: grant-funding
subject: funder-intelligence-index
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# funder-intelligence-index

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-intelligence-index",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:32c29fc930875583",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An awarded event later corrected as erroneous must not remain an award forever.",
    "Every fit band wins 10 percent: weak monotonicity is true but the score does not discriminate.",
    "Five organizations all declined: a published zero award rate discloses the sensitive outcome for every known member.",
    "A 16-character hash of a publicly listed programme title can be matched by hashing candidate titles.",
    "0.065 is a valid number in either percent or fraction conventions; clamping cannot infer the intended unit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/funder-intelligence-index",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://scikit-learn.org/stable/modules/calibration.html",
      "scope": "Official calibration documentation distinguishes predicted probabilities and observed positive fractions; no consumer model evaluation performed."
    },
    {
      "url": "https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance",
      "scope": "Primary de-identification guidance located; no claim that this corpus implementation passed a privacy audit."
    }
  ],
  "documents": {
    "funder-intelligence-index.md": {
      "disposition": "reverify",
      "reason": "Coarse hashes are not non-reversible anonymity, own-organization views still require user authorization, and small samples are uncertain rather than lies. A selected panel rate is not automatically personal probability; weak monotonicity is not calibration. Curated/live replacement requires comparable populations, periods and definitions."
    },
    "techniques/award-rate-by-revenue-bracket.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown revenue, immutable submission scope, correction-aware outcome collapse, explicit denominators and panel-versus-population inference."
    },
    "techniques/consent-scoped-contribution.md": {
      "disposition": "reverify",
      "reason": "Read-time filtering is useful but does not invalidate already cached or exported aggregates by construction. Separate operational retention from contribution authority; scope permission by purpose/version and explain withdrawal limits. Public records and private dashboards can still contain sensitive third-party information. All-or-nothing organizational participation is a design choice, not a universal consent requirement."
    },
    "techniques/fit-calibration-monotonicity.md": {
      "disposition": "clarify",
      "reason": "Repaired rank association versus probability calibration, equal-rate and sampling counterexamples, model-version capture and prospective evaluation."
    },
    "techniques/k-anonymity-suppression.md": {
      "disposition": "clarify",
      "reason": "Repaired contributor floor versus anonymity guarantee, dictionary-reversible title hashes, sensitive attribute disclosure, dominance and release-composition review. A larger k or nightly refresh is not a complete defense."
    },
    "techniques/rfp-difficulty-scoring.md": {
      "disposition": "reverify",
      "reason": "Sector rate ranges and thresholds have no supplied primary evidence. Selectivity is not writing effort or individual chance; an observed opt-in panel is not automatically funder-wide selectivity. Fixed cutoffs need uncertainty, versioning and minimum-sample justification; 11 applications is not universally forbidden by a stated floor."
    },
    "techniques/win-probability-confidence-bands.md": {
      "disposition": "clarify",
      "reason": "Repaired count labels versus statistical intervals, dependence and selection, explicit units, missing/invalid values, scoped base rates and comparable curated/live merging."
    },
    "applications/node--k-anonymity-suppression.md": {
      "disposition": "reverify",
      "reason": "Historical source/date retained, not rerun. A 16-hex title hash preserves near-unique grouping and is dictionary-recoverable; invalid revenue must not imply smallest bracket. Award-always-wins ignores corrections, grant identity may conflate repeat cycles, default overrideable k can drift from disclosure, and literal k>=5 suppressed reverses the predicate. No composition or dominance protection is demonstrated."
    },
    "applications/node--win-probability-confidence-bands.md": {
      "disposition": "reverify",
      "reason": "Historical code/date not refreshed. Application-count merge floor does not independently enforce distinct contributors. Clamping cannot detect 0.065 as fraction versus percent, and nonfinite-to-zero fabricates a rate. Counts alone do not establish confidence; frozen score needs actual submission capture plus model version, and equal-rate bands pass monotonicity without ranking signal."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

All nine documents read at reverted bytes. **I retract the preceding record's
per-document reasons**: they grade a rewritten set of documents that was reverted on
2026-09-10, and its claims about what was "repaired" describe bytes that no longer
exist. Nothing below is carried forward from it without re-derivation.

The subject is in better shape than the previous pass implies. Its two quantitative
claims survive checking. `win-probability-confidence-bands` says a rate over ~800
applications "has largely stopped moving (a binomial 95% interval near p=6% is under
+/-2 points)": at p=0.06, n=800 the normal-approximation half-width is 1.96 *
sqrt(.06*.94/800) = 1.65 points, so the claim holds with room; at n=200 it is 3.3
points, which is the "usable with visible uncertainty" the document assigns to
medium. `rfp-difficulty-scoring`'s sector figure ("foundations typically fund
somewhere between 15% and 30% of applicants") is corroborated by current sector
reporting, which puts general proposal success at 10-30%, large national foundations
at 5-15%, and community foundations at 15-25% on full proposals - which also
corroborates the golden path's "low single digits at national-scale funders to 30%
and beyond at local ones."

Three findings that would justify a content change, all about the *floors*, which is
where this subject's own doctrine is sharpest and therefore where a slip is worth
naming. (1) The golden path insists the private statistical floor and the public
privacy floor "differ ... because they defend against different attacks. Reusing one
floor for both jobs means one of the two is miscalibrated," and
`k-anonymity-suppression` insists the floor counts distinct contributors, "never over
rows." Yet `node--win-probability-confidence-bands` documents `mergeQuartiles` gating
live-wins-over-curated on `l.applications >= k` with `k` imported from
`K_ANONYMITY` - a record count tested against the privacy constant, exactly the reuse
the golden path forbids and exactly the record-count floor the technique warns a
prolific single org defeats. The aggregation upstream has already applied the
contributor floor, so this is likely not a privacy hole; it is an undisclosed second
job for one constant, and the document that describes it should say which floor is
being applied. (2) The provenance string `(k>=5 suppressed)` - quoted in
`consent-scoped-contribution` and rendered by `liveSignalNotice` in the Node
application - reads to any careful reader as "cells with five or more contributors are
suppressed," the inverse of the rule. A disclosure whose whole purpose is that
disclosed and enforced floors cannot drift should not be ambiguous about the direction
of its own inequality. (3) `rfp-difficulty-scoring` places its "approachable" cut at
15% while asserting typical foundations fund 15-30% and, two paragraphs earlier, that
"most of the funders a nonprofit shortlists cluster under 10%." Both statements can be
true of different populations, but the document does not say which population the
thresholds are calibrated against, and the scale's meaning depends on it.

I read published sector statistics only; nothing was executed, and the cited repo
(`grant-writing-nonprofits`) is absent from this machine, so both applications'
line-number and code claims are unverified rather than confirmed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-intelligence-index",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:a52b4fc0316b45f7",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at reverted bytes. The confidence-band binomial claim was recomputed; the sector award-rate spread was checked against current published reporting. NOT evaluated: the grant-writing-nonprofits repo (absent from this machine), so every code and line citation in both applications is unverified; no runtime execution; no re-identification testing of any real cell; no maturity or verified_on change.",
  "counterexamples": [
    "A cell with five distinct contributors where one org supplied 96% of the applications passes the distinct-contributor floor while the published rate is effectively that one org's private history - k counts members, not influence.",
    "A publisher operating under a minimum-cell-size rule above 10 (as some US health-data programs do) cannot adopt the k=5 default at all, so 'k=5 is a defensible default' is defensible only inside this domain's own risk appetite - which the technique does not state.",
    "fit-calibration-monotonicity gives no minimum decided count per band before an inversion counts as false, so bands holding 3 and 4 decided outcomes can flip the audit's verdict; the confounder section tells the reader to check counts but the three-valued test itself does not.",
    "Complementary suppression closes subtraction only across cells this index publishes; a third party republishing a subset of the same cells alongside the funder-level total reopens the arithmetic, and nothing in the technique addresses republication."
  ],
  "sources": [
    {"url": "https://learning.candid.org/grant-statistics-funded-proposals-percentage/278283", "result": "Search-surfaced sector reporting corroborates the 10-30% general band, 5-15% for large national foundations, 15-25% community-foundation full proposals. Establishes the golden path's spread and the difficulty technique's 15-30% foundation figure as consistent with published practice; establishes nothing about any individual funder in the index."},
    {"path": "knowledge/grant-funding/matching-and-intelligence/funder-intelligence-index", "result": "All 9 documents read at reverted bytes; the n=800 / p=0.06 binomial half-width recomputed by hand at 1.65 points, confirming the 'under +/-2 points' claim. The repo the applications cite was not available, so no code citation was checked."}
  ],
  "documents": {
    "funder-intelligence-index.md": {"disposition": "keep", "reason": "The four-axis failure decomposition (statistics, privacy, consent, honesty), the two-sided ledger with deliberately different floors, and the per-cell merge over the all-or-nothing cutover are all correct and are the frame the techniques beneath depend on. The published award-rate spread it cites is corroborated."},
    "techniques/award-rate-by-revenue-bracket.md": {"disposition": "keep", "reason": "Bracket-at-write-time is argued from three independent reasons that each hold; collapse-to-applications with idempotent capture and award-wins is the right shape; the submitted-vs-decided denominator distinction is named and resolved by 'choose once, document, publish raw counts'. Nothing here failed a check."},
    "techniques/consent-scoped-contribution.md": {"disposition": "clarify", "reason": "The mechanism (filter at read, unknown is out, per-organization not per-row, one implementation) is sound and the separation from suppression is argued well. The defect is the sample provenance notice it prescribes: 'live, n=37 contributing orgs (k>=5 suppressed)' states the inequality in the direction of what is published, not what is suppressed, so the user-facing string asserts the opposite of the rule it exists to disclose."},
    "techniques/fit-calibration-monotonicity.md": {"disposition": "keep", "reason": "Freeze-at-submit, coarse bands, the submitted/decided/awarded separation, the three-valued answer with weak monotonicity, and the refusal to re-tune against the calibration set are all correct and unusually well-boundaried. The missing per-band minimum is a boundary the confounder section partly covers in prose."},
    "techniques/k-anonymity-suppression.md": {"disposition": "keep", "reason": "Distinct-contributor counting, generalize-before-collect, the three composition attacks, total-not-partial suppression, and the explicit non-substitution with consent are all correct. The 'k=5 to k=10' conventional range is presented as convention rather than as a derived requirement, which is the honest framing."},
    "techniques/rfp-difficulty-scoring.md": {"disposition": "clarify", "reason": "The band cuts (2/6/15%) are said to be drawn from a spread the same page describes two incompatible ways: 'foundations typically fund 15-30%' would make the typical foundation approachable, while 'most of the funders a nonprofit shortlists cluster under 10%' is the premise the cuts actually encode. Name the population the thresholds are calibrated on. The exclusion rules (no effort, no fit, no vibes) and the unrated-vs-approachable distinction are right and should stand."},
    "techniques/win-probability-confidence-bands.md": {"disposition": "keep", "reason": "The base-rate-lookup-first argument, the same-row rule for probability and confidence, the enumerated forbidden fallbacks, the per-cell merge, and the percent-vs-fraction last-mile guard are all sound; the binomial claim behind the 800/200 thresholds recomputes correctly at 1.65 and 3.3 points."},
    "applications/node--k-anonymity-suppression.md": {"disposition": "clarify", "reason": "Faithful on the substance - one constant, orgs.size cardinality gating, total suppression, write-time generalization, consent-first layering, the private dashboard's separate MIN_DECIDED_FOR_WIN_RATE - and the cliff-cutover incident is exactly the kind of upward lesson an application should carry. The defect it reproduces without comment is the disclosure string's inverted inequality, 'k>=5 suppressed'. Repo unavailable this run, so line citations are unverified."},
    "applications/node--win-probability-confidence-bands.md": {"disposition": "clarify", "reason": "Documents mergeQuartiles gating the live-over-curated swap on 'l.applications >= k' with k imported from K_ANONYMITY - an application-count test against the distinct-contributor privacy constant. The golden path forbids reusing one floor for both jobs and the suppression technique forbids record-count floors specifically; the document should say which floor the merge applies and why one symbol serves both. The rest (named confidence constants, one-lookup-both-values, honest null off-cell, the unit-confusion guard, the three-valued calibration audit) is faithful."}
  }
}
```

## Architecture review - 2026-10-31

Ten documents read in full, including the consent application added 2026-10-14.

**Retraction.** The 2026-09-10 record says the Candid page it cites "corroborates the 10-30% general
band, 5-15% for large national foundations, 15-25% community-foundation full proposals", and on
that basis kept the golden path's spread and `rfp-difficulty-scoring`'s "foundations typically fund
15-30%". That record called its own evidence search-surfaced. Opened directly this run, the page
says the opposite: there is "virtually no research on the question of what percentage of proposals
they fund", and its one data point is a 2004 Foundation Center report: "Overall, 35 percent funded
50 percent or more of the grant requests they received." The sector-spread figures in both documents
are therefore unsourced, not corroborated, and become `reverify`.

The three 2026-09-10 clarify items still stand at current bytes: the provenance notice "(k>=5
suppressed)" states the inequality in the direction of what is published; `rfp-difficulty-scoring`
does not say which population its 2/6/15% cuts are calibrated on; and the win-probability
application's merge tests an application count against the distinct-contributor privacy constant
without saying which floor it applies. That application also records `toWinPercent` zeroing
non-finite input, where the technique says to reject non-finite values to a suppressed display - a
zero is a fabricated rate. New, from a primary source: `k-anonymity-suppression` gives the
conventional range as k=5 to k=10, but the US Medicare data-use policy, as ResDAC states it, is
that "no cell ... containing a value of 1 to 10 can be reported directly" - a floor of 11.

The binomial claim (p=0.06, n=800: half-width 1.96*sqrt(.06*.94/800) = 1.65 points) recomputes.
Nothing was executed and no application tree was re-read.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-intelligence-index",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:2f706a1a6b2de40a",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full; the binomial half-width recomputed; the Candid page the previous record relied on opened directly; the CMS cell-size policy checked through ResDAC. NOT evaluated: no application tree re-read, no runtime, no re-identification test of a real cell; no verified_on or maturity change.",
  "counterexamples": [
    "A cell with five distinct contributors where one org supplied 96% of the applications passes the floor while the published rate is effectively that org's history.",
    "A publisher bound by the CMS rule (cells of 1-10 unreportable) cannot adopt any floor inside the technique's stated k=5 to k=10 range.",
    "A reader of \"n=37 contributing orgs (k>=5 suppressed)\" concludes that cells of five or more are hidden, the inverse of the rule.",
    "A typical local foundation funding 25% of applicants is \"approachable\" under the 15% cut, which is right for a shortlist dominated by national funders and wrong as a statement about the sector median the page also cites."
  ],
  "sources": [
    {
      "url": "https://learning.candid.org/grant-statistics-funded-proposals-percentage/278283",
      "result": "Opened directly. States \"virtually no research\" on proposal funding percentages; only data point: a 2004 Foundation Center report, \"35 percent funded 50 percent or more of the grant requests they received\". Refutes the 2026-09-10 claim that this page corroborates the 10-30% / 5-15% / 15-25% bands."
    },
    {
      "url": "https://resdac.org/articles/cms-cell-size-suppression-policy",
      "result": "States \"no cell (e.g. admissions, discharges, patients, services, etc.) containing a value of 1 to 10 can be reported directly\"; zero is exempt; derivation of a 1-10 value from other cells is also barred. Shows a common health-data floor of 11, outside the technique's k=5 to k=10 range, and independently supports its subtraction-attack rule."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/funder-intelligence-index",
      "result": "All 10 documents read; binomial claim recomputed at 1.65 points; technique-versus-application conflicts derived by reading."
    }
  ],
  "documents": {
    "funder-intelligence-index.md": {
      "disposition": "reverify",
      "reason": "Frame (four failure axes, two-sided ledger, per-cell merge, methodology page) sound. The sector spread \"low single digits ... to 30% and beyond\" loses its corroboration with the retraction above; needs a primary source or a hedge."
    },
    "techniques/award-rate-by-revenue-bracket.md": {
      "disposition": "keep",
      "reason": "Write-time brackets, application collapse with idempotent capture, the submitted/decided distinction with raw counts published. Its 5%/12%/1% example is framed as hypothetical."
    },
    "techniques/consent-scoped-contribution.md": {
      "disposition": "clarify",
      "reason": "Still owed: the sample notice \"(k≥5 suppressed)\" states the inequality in the published direction. Rest sound, and the derived-table rule is backed by its application."
    },
    "techniques/fit-calibration-monotonicity.md": {
      "disposition": "keep",
      "reason": "Freeze-at-submit, coarse bands, three counts, three-valued answer, no re-tuning against the audit set."
    },
    "techniques/k-anonymity-suppression.md": {
      "disposition": "clarify",
      "reason": "Conventional range \"k=5 to k=10 (health statistics ... sometimes 10)\" understates practice: the CMS rule bars cells of 1-10, a floor of 11. Widen the range with that example."
    },
    "techniques/rfp-difficulty-scoring.md": {
      "disposition": "reverify",
      "reason": "Clarify owed: name the population the 2/6/15% cuts are calibrated on (the shortlist under 10%), since the page also says typical foundations fund 15-30%. Reverify: that 15-30% sector figure and the ~20% research-funder figure lost their corroboration with the retraction above."
    },
    "techniques/win-probability-confidence-bands.md": {
      "disposition": "keep",
      "reason": "Lookup-first, same-row band, forbidden fallbacks, per-cell merge, last-mile guard; binomial thresholds recompute."
    },
    "applications/node--consent-scoped-contribution.md": {
      "disposition": "keep",
      "reason": "Paired test with a non-consenting org; states the unmeasured leak size and the unopened band-suppression question."
    },
    "applications/node--k-anonymity-suppression.md": {
      "disposition": "clarify",
      "reason": "Faithful dated record. Owed: say that the quoted disclosure string \"(k>=${K_ANONYMITY} suppressed)\" reads as the inverse of the rule it discloses. Code citations not re-read."
    },
    "applications/node--win-probability-confidence-bands.md": {
      "disposition": "clarify",
      "reason": "Owed: the merge gates on an application count against K_ANONYMITY, a second statistical job for the privacy constant the golden path says not to reuse; and toWinPercent zeroes non-finite input where the technique says to suppress. Name both as known limits. Code citations not re-read."
    }
  }
}
```

### 2026-10-31 - after applying the owed clarifications

Five clarify items applied. The golden path's and the difficulty technique's sector-spread figures
stay `reverify`: the source they were credited to does not state them.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-intelligence-index",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:61cbe307a1df9006",
  "disposition": "reverify",
  "coverage": "All 10 documents read in full; the binomial half-width recomputed; the Candid page the previous record relied on opened directly; the CMS cell-size policy checked through ResDAC. NOT evaluated: no application tree re-read, no runtime, no re-identification test of a real cell; no verified_on or maturity change. Phase B applied five clarifications; the golden path and rfp-difficulty-scoring remain reverify for the unsourced sector spread.",
  "counterexamples": [
    "A cell with five distinct contributors where one org supplied 96% of the applications passes the floor while the published rate is effectively that org's history.",
    "A publisher bound by the CMS rule (cells of 1-10 unreportable) cannot adopt any floor inside the technique's stated k=5 to k=10 range.",
    "A reader of \"n=37 contributing orgs (k>=5 suppressed)\" concludes that cells of five or more are hidden, the inverse of the rule.",
    "A typical local foundation funding 25% of applicants is \"approachable\" under the 15% cut, which is right for a shortlist dominated by national funders and wrong as a statement about the sector median the page also cites."
  ],
  "sources": [
    {
      "url": "https://learning.candid.org/grant-statistics-funded-proposals-percentage/278283",
      "result": "Opened directly. States \"virtually no research\" on proposal funding percentages; only data point: a 2004 Foundation Center report, \"35 percent funded 50 percent or more of the grant requests they received\". Refutes the 2026-09-10 claim that this page corroborates the 10-30% / 5-15% / 15-25% bands."
    },
    {
      "url": "https://resdac.org/articles/cms-cell-size-suppression-policy",
      "result": "States \"no cell (e.g. admissions, discharges, patients, services, etc.) containing a value of 1 to 10 can be reported directly\"; zero is exempt; derivation of a 1-10 value from other cells is also barred. Shows a common health-data floor of 11, outside the technique's k=5 to k=10 range, and independently supports its subtraction-attack rule."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/funder-intelligence-index",
      "result": "All 10 documents read; binomial claim recomputed at 1.65 points; technique-versus-application conflicts derived by reading."
    }
  ],
  "documents": {
    "funder-intelligence-index.md": {
      "disposition": "reverify",
      "reason": "Frame (four failure axes, two-sided ledger, per-cell merge, methodology page) sound. The sector spread \"low single digits ... to 30% and beyond\" loses its corroboration with the retraction above; needs a primary source or a hedge."
    },
    "techniques/award-rate-by-revenue-bracket.md": {
      "disposition": "keep",
      "reason": "Write-time brackets, application collapse with idempotent capture, the submitted/decided distinction with raw counts published. Its 5%/12%/1% example is framed as hypothetical."
    },
    "techniques/consent-scoped-contribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: sample notice -> \"cells under 5 orgs suppressed\", with a sentence on why \"(k≥5 suppressed)\" reads as the inverse of the rule."
    },
    "techniques/fit-calibration-monotonicity.md": {
      "disposition": "keep",
      "reason": "Freeze-at-submit, coarse bands, three counts, three-valued answer, no re-tuning against the audit set."
    },
    "techniques/k-anonymity-suppression.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: conventional range \"k=5 to k=10\" -> \"k=5 to about k=11\", citing the Medicare rule barring cells of 1 to 10 (ResDAC, opened this run)."
    },
    "techniques/rfp-difficulty-scoring.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the cuts are now said to be calibrated on the shortlist population under 10%, not the sector-wide figure, and the methodology must name the population. Still reverify: the 15-30% foundation and ~20% research-funder figures have no source since the Candid retraction."
    },
    "techniques/win-probability-confidence-bands.md": {
      "disposition": "keep",
      "reason": "Lookup-first, same-row band, forbidden fallbacks, per-cell merge, last-mile guard; binomial thresholds recompute."
    },
    "applications/node--consent-scoped-contribution.md": {
      "disposition": "keep",
      "reason": "Paired test with a non-consenting org; states the unmeasured leak size and the unopened band-suppression question."
    },
    "applications/node--k-anonymity-suppression.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added that the quoted \"(k>=5 suppressed)\" string reads in the inverse direction. Quote itself unchanged; code citations not re-read; verified_on unchanged."
    },
    "applications/node--win-probability-confidence-bands.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: named the merge test as an application count against the privacy constant (a second statistical job, volume not contributors), and the toWinPercent gap (zero instead of suppression for non-finite; clamp cannot see a fraction). Code citations not re-read; verified_on unchanged."
    }
  }
}
```
