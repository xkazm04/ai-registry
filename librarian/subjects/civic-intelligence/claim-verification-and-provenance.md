---
domain: civic-intelligence
subject: claim-verification-and-provenance
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# claim-verification-and-provenance

## Architecture review - 2026-09-09

Retain the subject with scoped verification and emission contracts. Reverify both consumer applications; no runtime evidence or maturity change is claimed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/claim-verification-and-provenance",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:3a6b28a10bf954c1",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A stable opaque ID survives rebuild through a preserved mapping.",
    "A cached immutable receipt accurately proves an earlier snapshot.",
    "The source value is stale but unchanged.",
    "A decodable ref was never minted by the publisher.",
    "A partial stamp rollout looks uniform among stamped rows.",
    "An approved internal edge has never undergone editorial fact checking."
  ],
  "sources": [
    {
      "url": "https://schema.org/ClaimReview",
      "result": "Fact-check semantics and publication-date meaning checked."
    },
    {
      "url": "https://schema.org/ratingValue",
      "result": "Number and Text accepted; retract numeric-only assertion."
    },
    {
      "url": "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
      "result": "Consumer URL requirement and Search phase-out notice checked; Explorer support distinguished."
    }
  ],
  "documents": {
    "claim-verification-and-provenance.md": {
      "disposition": "clarify",
      "reason": "Scope address, review and verification guarantees."
    },
    "techniques/claim-ref-addressing.md": {
      "disposition": "clarify",
      "reason": "Separate decodeability, issuance, historical versions and privacy."
    },
    "techniques/recomputation-receipts.md": {
      "disposition": "clarify",
      "reason": "Clarify caches, precision, coherent snapshots and actual review policy."
    },
    "techniques/three-verdict-vocabulary.md": {
      "disposition": "clarify",
      "reason": "Require comparable values and disclose unassessed axes."
    },
    "techniques/derivation-comparison.md": {
      "disposition": "clarify",
      "reason": "Cover missing and empty populations and full derivation inputs."
    },
    "techniques/gate-state-as-modifier.md": {
      "disposition": "clarify",
      "reason": "Bind review to versions and actual workflow, preserving safe defaults."
    },
    "techniques/structured-review-emission.md": {
      "disposition": "clarify",
      "reason": "Correct verified primary-source claims and separate consumer support."
    },
    "applications/node--three-verdict-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Historical code and runtime evidence not refreshed; reverify corrected contract."
    },
    "applications/react--recomputation-receipts.md": {
      "disposition": "reverify",
      "reason": "Historical code and runtime evidence not refreshed; reverify corrected contract."
    }
  }
}
```

## Architecture review - 2026-10-31

Stale since two applications landed (claim-ref-addressing, derivation-comparison). The
2026-09-09 clarifies on the six techniques have all landed. Three new clarifies: the golden
path still named a passed internal gate and a numeric rating as the emission criterion,
the emission technique led with a numeric rating that Google's guide says is only
recommended, and the react application lacked two cross-references. Applications stay
reverify: no private tree was reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/claim-verification-and-provenance",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 11 owned documents read, including the two applications added since 2026-09-09 (node--claim-ref-addressing, node--derivation-comparison). Google's fact-check guide re-read 2026-10-31. No consumer runtime, private tree or application witness was refreshed.",
  "counterexamples": [
    "A completed editorial review that rates a claim false legitimately emits a negative rating, though no internal approval occurred.",
    "A textual alternateName with no numeric ratingValue is valid in Google's profile.",
    "A base64url segment with nonzero trailing bits decodes to the same id as the issued one.",
    "A formula change that leaves a cited per-tie figure unchanged need not move its basis.",
    "A cached immutable receipt accurately proves an earlier snapshot (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
      "result": "Re-read 2026-10-31 (page 'Last updated 2026-09-08'). 'We're phasing out support for ClaimReview markup in Google Search', no date given, Fact Check Explorer still supported. claimReviewed, reviewRating and url listed as required; for ratingValue 'Integer values are recommended but not required'; alternateName required. 'There must not be any mismatch between the structured data and page content.' 'A specific ClaimReview must only be on one page on your site.' Supports the emission clarifies."
    },
    {
      "source": "Internal consistency across the subject",
      "result": "Golden path emission criterion vs structured-review-emission's 'Internal pipeline approval alone is insufficient'; react application's url omission vs the guide; react application's canonicalization reverify vs node--claim-ref-addressing."
    }
  ],
  "digest": "sha256-b2:36b08a11e64fd422",
  "disposition": "clarify",
  "documents": {
    "claim-verification-and-provenance.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-09 scoping landed. One inconsistency remains: the emission paragraph says markup goes out for claims that 'passed the human gate' with 'a numeric rating', while the same paragraph and the technique say internal approval is not the criterion and Google's profile requires the textual rating name, not a number. Align both phrases."
    },
    "techniques/claim-ref-addressing.md": {
      "disposition": "keep",
      "reason": "The 2026-09-09 clarify landed (identity boundaries: decodeability vs issuance, privacy, tombstones), and the re-encode decision rule from the 2026-10-14 application is present and correct."
    },
    "techniques/recomputation-receipts.md": {
      "disposition": "keep",
      "reason": "Caches, snapshot consistency, precision and review-policy independence are all stated in 'Reproducibility and review limits'."
    },
    "techniques/three-verdict-vocabulary.md": {
      "disposition": "keep",
      "reason": "Comparable values, unevaluable loaders and unassessed axes are covered in 'Comparison preconditions'."
    },
    "techniques/derivation-comparison.md": {
      "disposition": "keep",
      "reason": "Partial and empty populations are covered; the per-metric ref scope and the live-computed boundary from the 2026-10-14 experiment are present and match that application."
    },
    "techniques/gate-state-as-modifier.md": {
      "disposition": "keep",
      "reason": "Version-bound approval, safe defaults that do not assert a queue, and retention by policy all landed."
    },
    "techniques/structured-review-emission.md": {
      "disposition": "clarify",
      "reason": "The 'well-formed emission' bullet still leads with 'a numeric rating on a declared scale'. Google's guide (re-read 2026-10-31) requires alternateName and says integer values are 'recommended but not required'. Restate the bullet; record the 2026-10-31 re-check of the phase-out, url-required, no-mismatch and one-page rules."
    },
    "applications/node--claim-ref-addressing.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired A/B (aliases and U+FFFD repair closed by re-encoding). The private tree and its 3,822-test run were not reopened."
    },
    "applications/node--derivation-comparison.md": {
      "disposition": "reverify",
      "reason": "Arms and verdict are coherent. The 12.75 bn CZK moved by the change and the 11.82 bn bucket drop for the affected case are different populations but the text does not say so; the replay was not reopened to confirm."
    },
    "applications/node--three-verdict-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; historical code and runtime evidence not refreshed."
    },
    "applications/react--recomputation-receipts.md": {
      "disposition": "clarify",
      "reason": "The account says the emitter omits url, which Google's profile lists as required, so the emission is ineligible there; and its review-limits still ask to reverify decoder canonicalization, which the sibling node--claim-ref-addressing application closed. Add both cross-references; the code witness itself stays reverify."
    }
  }
}
```

### Re-record after apply - 2026-10-31

All three clarifies were applied in the documents' own voice; the record below is against
the new digest.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/claim-verification-and-provenance",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 11 owned documents read, including the two applications added since 2026-09-09 (node--claim-ref-addressing, node--derivation-comparison). Google's fact-check guide re-read 2026-10-31. No consumer runtime, private tree or application witness was refreshed.",
  "counterexamples": [
    "A completed editorial review that rates a claim false legitimately emits a negative rating, though no internal approval occurred.",
    "A textual alternateName with no numeric ratingValue is valid in Google's profile.",
    "A base64url segment with nonzero trailing bits decodes to the same id as the issued one.",
    "A formula change that leaves a cited per-tie figure unchanged need not move its basis.",
    "A cached immutable receipt accurately proves an earlier snapshot (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
      "result": "Re-read 2026-10-31 (page 'Last updated 2026-09-08'). 'We're phasing out support for ClaimReview markup in Google Search', no date given, Fact Check Explorer still supported. claimReviewed, reviewRating and url listed as required; for ratingValue 'Integer values are recommended but not required'; alternateName required. 'There must not be any mismatch between the structured data and page content.' 'A specific ClaimReview must only be on one page on your site.' Supports the emission clarifies."
    },
    {
      "source": "Internal consistency across the subject",
      "result": "Golden path emission criterion vs structured-review-emission's 'Internal pipeline approval alone is insufficient'; react application's url omission vs the guide; react application's canonicalization reverify vs node--claim-ref-addressing."
    }
  ],
  "digest": "sha256-b2:91f2f36cba299241",
  "disposition": "keep",
  "documents": {
    "claim-verification-and-provenance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: emission now goes out only for claims 'whose human review is a completed editorial fact-check', with a rating whose name matches the visible verdict and a numeric value on a declared scale only where one is used."
    },
    "techniques/claim-ref-addressing.md": {
      "disposition": "keep",
      "reason": "The 2026-09-09 clarify landed (identity boundaries: decodeability vs issuance, privacy, tombstones), and the re-encode decision rule from the 2026-10-14 application is present and correct."
    },
    "techniques/recomputation-receipts.md": {
      "disposition": "keep",
      "reason": "Caches, snapshot consistency, precision and review-policy independence are all stated in 'Reproducibility and review limits'."
    },
    "techniques/three-verdict-vocabulary.md": {
      "disposition": "keep",
      "reason": "Comparable values, unevaluable loaders and unassessed axes are covered in 'Comparison preconditions'."
    },
    "techniques/derivation-comparison.md": {
      "disposition": "keep",
      "reason": "Partial and empty populations are covered; the per-metric ref scope and the live-computed boundary from the 2026-10-14 experiment are present and match that application."
    },
    "techniques/gate-state-as-modifier.md": {
      "disposition": "keep",
      "reason": "Version-bound approval, safe defaults that do not assert a queue, and retention by policy all landed."
    },
    "techniques/structured-review-emission.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the well-formed bullet leads with the rating name, notes Google requires alternateName and recommends but does not require an integer value; the primary-source section gained the 2026-10-31 re-check (phase-out undated, url required, no-mismatch, one page per ClaimReview)."
    },
    "applications/node--claim-ref-addressing.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired A/B (aliases and U+FFFD repair closed by re-encoding). The private tree and its 3,822-test run were not reopened."
    },
    "applications/node--derivation-comparison.md": {
      "disposition": "reverify",
      "reason": "Arms and verdict are coherent. The 12.75 bn CZK moved by the change and the 11.82 bn bucket drop for the affected case are different populations but the text does not say so; the replay was not reopened to confirm."
    },
    "applications/node--three-verdict-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; historical code and runtime evidence not refreshed."
    },
    "applications/react--recomputation-receipts.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: review limits gained two cross-references, url omission makes the emission ineligible under Google's profile, and the canonical-form gap was closed per node--claim-ref-addressing; verified_on unchanged because the tree was not re-read. The code witness itself remains unrefreshed."
    }
  }
}
```
