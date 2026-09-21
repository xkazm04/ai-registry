---
domain: grant-funding
subject: funder-intelligence-index
last_touched: 2026-09-10
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
