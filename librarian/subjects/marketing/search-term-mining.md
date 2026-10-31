---
subject: search-term-mining
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-nbp-1022 (apply)
dry_streak: 0
---

# search-term-mining

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning a search-terms report into negative keywords, deciding whether a query has earned its own exact keyword, designing or reviewing an automated negative/promote recommender, auditing why a converting query stopped serving

**Techniques (6):** campaign-level-phrase-negative, exact-promote-into-serving-ad-group, negatives-before-promotes, never-mine-demo-data, spend-and-click-floors-before-negation, zero-conversions-on-unrounded-count.

**Applications (5; stacks: node):** node--campaign-level-phrase-negative, node--exact-promote-into-serving-ad-group, node--negatives-before-promotes, node--never-mine-demo-data, node--zero-conversions-on-unrounded-count.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-10-22 (apply-exact-promote-1022): exact-promote-into-serving-ad-group applied,
  `code`, `better`. The tree kept unknown match types distinct in its mapper and then
  let them through with a "not exact" gate in another file. Paired A/B: an unknown-type
  row with 3 conversions promoted 1/1 before, 0/1 after an allowlist gate. That became
  one decision rule: list the match types a promote may come from.
- 2026-10-22 (intake-apply-nbp-1022): negatives-before-promotes applied, `code`,
  `better`. The recommender emitted the pinned order. The apply loop kept going past a
  failed criterion move, and a unit test pinned a promote landing after a failed
  negative. Paired A/B: promotes after a failed negative 2/2 before, 0/2 after. The
  tree argues for a narrower reading of the technique's "stop on failure": withhold
  every promote after a failed negative, and let later negatives run, since their
  errors are usually row-specific. Recorded in the application and not in the
  technique, because it rewrites a standing rule from one tree. Return: a second tree,
  or a measured failure rate for negatives.

## Owed

- Single-stack debt, still open after 2026-10-22. The attention scan ranked this
  subject for it. Of the two fleet projects declaring `marketing`, only one reads a
  search-terms report; the other holds freelance gig documents and no ads code. The
  return condition is a second tree that mines search terms.
- Unapplied (no `librarian/applied.md` row): never-mine-demo-data and
  zero-conversions-on-unrounded-count, which have applications but no A/B row.
  spend-and-click-floors-before-negation was applied 2026-10-22 (click floor only; the
  spend floor and the lag allowance wait on a target CPA field and per-day term clicks).

## Architecture review, 2026-10-31

First record: the pre-edit review. Three clarifies were found (one external refutation each in the golden path and the campaign-level technique, and one internal contradiction between two applications). Second record: the same review after applying them. The golden-path note above says five applications; there are six (the floors application landed 2026-10-22).

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/search-term-mining",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:6fc858e75afb3f3b",
  "disposition": "clarify",
  "trigger": "Pending architecture review since the 2026-09-09 forge; three applications landed 2026-10-22.",
  "intended_benefit": "A negative/promote recommender that never blocks a converting query, sizes its floors from the account's own rate, and emits and applies its moves in an order that keeps truncation and partial failure safe.",
  "failure_if_ignored": "Converting queries silently blocked by rounded counts, fixed floors or over-wide criteria; unknown match types promoted into permanent keywords; promotes created beside an open leak.",
  "boundary": "Query-level negatives and exact promotes from a search-terms report. Not campaign severity (campaign-anomaly-triage), not the change envelope (budget-reallocation-prescription), not causal truth of conversions (attribution-and-incrementality).",
  "coverage": "All 13 documents read in full. Three load-bearing platform claims checked against Google's help pages (negative match types and close variants, Performance Max campaign-level negatives, identical-exact prioritization); the hidden-share figure checked only through a search summary (source page 403). All floor arithmetic recomputed. The six application trees were not reopened.",
  "counterexamples": [
    "A converting query can still be blocked by a campaign-scope phrase negative mined from a different, wasteful row that the converting query contains; a per-row gate cannot see it (measured in the campaign-level application).",
    "An identical exact keyword is preferred only when it is eligible: a budget-restricted campaign, a low-search-volume status or a disapproved ad group can leave the broad keyword serving the promoted query anyway, and the preference does not cover plurals or synonyms.",
    "A thin window (three or four conversions in total) derives a click floor near its total clicks and negates nothing; correct by the rule, but indistinguishable from a broken miner unless the recommendation says why.",
    "A tree can emit negatives before promotes and still create a promote after a failed negative, because the apply loop, not the recommender, breaks the order (measured in the negatives-before-promotes application)."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/2453972",
      "result": "Supports the negative match-type rules and the no-close-variant rule, quoted: broad negative \"won't show if the search contains all your negative keyword terms, even if the terms are in a different order\"; phrase \"contains the exact keyword terms in the same order\"; \"Negative keywords won't match to close variants or other expansions.\" Refutes the golden path's looser 'the words in any order' (it is all of them)."
    },
    {
      "url": "https://support.google.com/google-ads/answer/16451273",
      "result": "Dated 2025-08-07: Google \"launched campaign-level negative keywords to all Performance Max campaigns, which apply to Search and Shopping inventory\" and is adding campaign-level negative keyword lists. Refutes the technique's parenthetical that an asset-based campaign's exclusions live at account level."
    },
    {
      "url": "https://support.google.com/google-ads/answer/2756257",
      "result": "Supports the promote's counter-negative reasoning: \"Exact match keywords that are identical to the search term\" are priority 1, \"prioritized over any other broad or phrase keyword or a Performance Max campaign\"; identical includes spell-corrected terms but \"doesn't include plurals or synonyms\"; budget, low volume, disapproval and targeting can still stop it serving."
    },
    {
      "url": "https://searchengineland.com/google-hiding-search-data-advertisers-profiting-446372",
      "result": "HTTP 403 when opened; a search-result summary of it reports hidden totals around 40% of clicks and spend and up to about 85% on some keywords, consistent with the golden path's 'around 40%, above 80% on some broad-match keywords'. Practitioner measurement, labelled as such in the text; not quote-verified this run."
    }
  ],
  "documents": {
    "search-term-mining.md": {
      "disposition": "clarify",
      "reason": "Broad-negative sentence reads 'blocks any query containing the words in any order'; Google's negative-keyword page says the search must contain all the negative's terms. Change to 'all of its words, in any order'. Everything else (invariant, relative floors, lag, order, demo rule, n-gram aggregate) holds; the floor arithmetic checks (ln 0.05 / ln 0.98 = 148)."
    },
    "techniques/campaign-level-phrase-negative.md": {
      "disposition": "clarify",
      "reason": "The decision rule for automated campaign types says their exclusions live at account level; Google launched campaign-level negatives for all Performance Max campaigns in 2025 (Search and Shopping inventory). Rewrite the rule to use the narrowest mechanism the type offers, account level only as fallback. Match-type and close-variant claims verified against Google's negative-keyword page."
    },
    "techniques/exact-promote-into-serving-ad-group.md": {
      "disposition": "keep",
      "reason": "The identical-exact preference holds per Google's prioritization page, which also confirms its eligibility caveats; the allowlist rule from the 2026-10-22 application is already in the decision rules."
    },
    "techniques/negatives-before-promotes.md": {
      "disposition": "keep",
      "reason": "Reasoning holds. The application's narrower reading of step 6 (withhold promotes after a failed negative, let later negatives run) is one tree's evidence and stays out of the technique by the note's own decision; return condition is a second tree or a measured negative failure rate."
    },
    "techniques/never-mine-demo-data.md": {
      "disposition": "keep",
      "reason": "Structural two-half rule is internally consistent and matches its application; no unstable external claim."
    },
    "techniques/spend-and-click-floors-before-negation.md": {
      "disposition": "keep",
      "reason": "Arithmetic verified: 3% x 3 clicks = 0.09 (about one-tenth); ln(0.05)/ln(1-r) gives 148/28/298 at 2/10/1%; 0.92^40 = 0.036 (about one-in-twenty-eight, stated as one-in-thirty, acceptable rounding). The thin-window boundary from the application is already stated."
    },
    "techniques/zero-conversions-on-unrounded-count.md": {
      "disposition": "keep",
      "reason": "Invariant, mapper-boundary reasoning and the property-test prescription are consistent across the subject; fractional DDA/modelled conversions are documented platform behaviour."
    },
    "applications/node--campaign-level-phrase-negative.md": {
      "disposition": "keep",
      "reason": "Internally consistent paired measurement (2 of 2 to 0 of 2) and its limits are stated; tree at 962c2a1b not reopened this run, no contradicting evidence."
    },
    "applications/node--exact-promote-into-serving-ad-group.md": {
      "disposition": "keep",
      "reason": "Measured defect and allowlist fix are consistent with the technique's updated rule; tree not reopened, verified_on unchanged."
    },
    "applications/node--negatives-before-promotes.md": {
      "disposition": "keep",
      "reason": "Measured and scoped honestly, including the two pre-existing suite failures; tree not reopened."
    },
    "applications/node--never-mine-demo-data.md": {
      "disposition": "keep",
      "reason": "Both halves and the provenance-ambiguity deviation are coherent; anchors at 2893314 not reopened, no contradicting evidence."
    },
    "applications/node--spend-and-click-floors-before-negation.md": {
      "disposition": "keep",
      "reason": "Derivation figures 149/29/299 verified (ceil of 148.3/28.4/298.1); 0.98^10 = 0.82 matches 'about four times in five'; spend floor and lag stated as not built."
    },
    "applications/node--zero-conversions-on-unrounded-count.md": {
      "disposition": "clarify",
      "reason": "'Unknown match type loses' says the `!== \"EXACT\"` promote gate keeps OTHER out; the sibling 2026-10-22 promote application measured that gate promoting an OTHER row (A 1 of 1, B 0 of 1). Add a dated review note that the mapper half held and the gate half did not. 0.98^10 = 82% verified."
    }
  }
}
```

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/search-term-mining",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:996df273225b40ca",
  "disposition": "keep",
  "trigger": "Pending architecture review since the 2026-09-09 forge; three applications landed 2026-10-22.",
  "intended_benefit": "A negative/promote recommender that never blocks a converting query, sizes its floors from the account's own rate, and emits and applies its moves in an order that keeps truncation and partial failure safe.",
  "failure_if_ignored": "Converting queries silently blocked by rounded counts, fixed floors or over-wide criteria; unknown match types promoted into permanent keywords; promotes created beside an open leak.",
  "boundary": "Query-level negatives and exact promotes from a search-terms report. Not campaign severity (campaign-anomaly-triage), not the change envelope (budget-reallocation-prescription), not causal truth of conversions (attribution-and-incrementality).",
  "coverage": "Second record after Phase B: the three clarify items were applied; all other documents byte-unchanged with their first-record dispositions. Evidence scope as in the first 2026-10-31 record.",
  "counterexamples": [
    "A converting query can still be blocked by a campaign-scope phrase negative mined from a different, wasteful row that the converting query contains; a per-row gate cannot see it (measured in the campaign-level application).",
    "An identical exact keyword is preferred only when it is eligible: a budget-restricted campaign, a low-search-volume status or a disapproved ad group can leave the broad keyword serving the promoted query anyway, and the preference does not cover plurals or synonyms.",
    "A thin window (three or four conversions in total) derives a click floor near its total clicks and negates nothing; correct by the rule, but indistinguishable from a broken miner unless the recommendation says why.",
    "A tree can emit negatives before promotes and still create a promote after a failed negative, because the apply loop, not the recommender, breaks the order (measured in the negatives-before-promotes application)."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/2453972",
      "result": "Supports the negative match-type rules and the no-close-variant rule, quoted: broad negative \"won't show if the search contains all your negative keyword terms, even if the terms are in a different order\"; phrase \"contains the exact keyword terms in the same order\"; \"Negative keywords won't match to close variants or other expansions.\" Refutes the golden path's looser 'the words in any order' (it is all of them)."
    },
    {
      "url": "https://support.google.com/google-ads/answer/16451273",
      "result": "Dated 2025-08-07: Google \"launched campaign-level negative keywords to all Performance Max campaigns, which apply to Search and Shopping inventory\" and is adding campaign-level negative keyword lists. Refutes the technique's parenthetical that an asset-based campaign's exclusions live at account level."
    },
    {
      "url": "https://support.google.com/google-ads/answer/2756257",
      "result": "Supports the promote's counter-negative reasoning: \"Exact match keywords that are identical to the search term\" are priority 1, \"prioritized over any other broad or phrase keyword or a Performance Max campaign\"; identical includes spell-corrected terms but \"doesn't include plurals or synonyms\"; budget, low volume, disapproval and targeting can still stop it serving."
    },
    {
      "url": "https://searchengineland.com/google-hiding-search-data-advertisers-profiting-446372",
      "result": "HTTP 403 when opened; a search-result summary of it reports hidden totals around 40% of clicks and spend and up to about 85% on some keywords, consistent with the golden path's 'around 40%, above 80% on some broad-match keywords'. Practitioner measurement, labelled as such in the text; not quote-verified this run."
    }
  ],
  "documents": {
    "search-term-mining.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the broad-negative sentence now reads 'containing all of its words in any order', matching Google's documented rule."
    },
    "techniques/campaign-level-phrase-negative.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the automated-campaign decision rule now uses the narrowest mechanism the type offers, notes the asset-based type's 2025 campaign-level negatives, and keeps account level as the fallback."
    },
    "techniques/exact-promote-into-serving-ad-group.md": {
      "disposition": "keep",
      "reason": "The identical-exact preference holds per Google's prioritization page, which also confirms its eligibility caveats; the allowlist rule from the 2026-10-22 application is already in the decision rules."
    },
    "techniques/negatives-before-promotes.md": {
      "disposition": "keep",
      "reason": "Reasoning holds. The application's narrower reading of step 6 (withhold promotes after a failed negative, let later negatives run) is one tree's evidence and stays out of the technique by the note's own decision; return condition is a second tree or a measured negative failure rate."
    },
    "techniques/never-mine-demo-data.md": {
      "disposition": "keep",
      "reason": "Structural two-half rule is internally consistent and matches its application; no unstable external claim."
    },
    "techniques/spend-and-click-floors-before-negation.md": {
      "disposition": "keep",
      "reason": "Arithmetic verified: 3% x 3 clicks = 0.09 (about one-tenth); ln(0.05)/ln(1-r) gives 148/28/298 at 2/10/1%; 0.92^40 = 0.036 (about one-in-twenty-eight, stated as one-in-thirty, acceptable rounding). The thin-window boundary from the application is already stated."
    },
    "techniques/zero-conversions-on-unrounded-count.md": {
      "disposition": "keep",
      "reason": "Invariant, mapper-boundary reasoning and the property-test prescription are consistent across the subject; fractional DDA/modelled conversions are documented platform behaviour."
    },
    "applications/node--campaign-level-phrase-negative.md": {
      "disposition": "keep",
      "reason": "Internally consistent paired measurement (2 of 2 to 0 of 2) and its limits are stated; tree at 962c2a1b not reopened this run, no contradicting evidence."
    },
    "applications/node--exact-promote-into-serving-ad-group.md": {
      "disposition": "keep",
      "reason": "Measured defect and allowlist fix are consistent with the technique's updated rule; tree not reopened, verified_on unchanged."
    },
    "applications/node--negatives-before-promotes.md": {
      "disposition": "keep",
      "reason": "Measured and scoped honestly, including the two pre-existing suite failures; tree not reopened."
    },
    "applications/node--never-mine-demo-data.md": {
      "disposition": "keep",
      "reason": "Both halves and the provenance-ambiguity deviation are coherent; anchors at 2893314 not reopened, no contradicting evidence."
    },
    "applications/node--spend-and-click-floors-before-negation.md": {
      "disposition": "keep",
      "reason": "Derivation figures 149/29/299 verified (ceil of 148.3/28.4/298.1); 0.98^10 = 0.82 matches 'about four times in five'; spend floor and lag stated as not built."
    },
    "applications/node--zero-conversions-on-unrounded-count.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a dated review note says the mapper kept OTHER distinct but the `!== \"EXACT\"` gate promoted it, per the 2026-10-22 promote application; verified_on unchanged (tree not reopened)."
    }
  }
}
```
