---
domain: grant-funding
subject: grant-source-landscape
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# grant-source-landscape

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-source-landscape",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:971d360ae5e58197",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A second-stage deadline remains in the future but the applicant never submitted stage one.",
    "All real curated calls expire; showing zero open results is correct.",
    "An amended deadline changes a composite key even though the call is the same.",
    "Two sources carry the same call but publish conflicting amounts: carrier count does not mean agreement."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/funding-landscape/grant-source-landscape",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.hrsa.gov/grants/apply-for-a-grant/understand-the-grants-process",
      "scope": "Primary deadline guidance explicitly says the standard 23:59 Eastern time can vary by NOFO."
    },
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/participant-register",
      "scope": "Primary Participant Register description establishes a cross-programme register; not equivalence with every domestic charity register."
    }
  ],
  "documents": {
    "grant-source-landscape.md": {
      "disposition": "reverify",
      "reason": "Three useful source roles are not exhaustive or exclusive. Supranational participant registration exists but is not a universal domestic charity registry. Global scarcity/abundance claims lack a survey. Feed plus registry does not establish all eligibility or accuracy; source jurisdiction may differ from eligible geography. Seven techniques are listed despite six claimed."
    },
    "techniques/close-date-normalization.md": {
      "disposition": "clarify",
      "reason": "Repaired missing precision, source-specific closing rules, stage-dependent cutoffs and freshness. Original sentence reverses missing-versus-wrong danger; a dated value need not be replaced with an assumed authoritative instant."
    },
    "techniques/curated-floor-vs-live-feed.md": {
      "disposition": "clarify",
      "reason": "Repaired nonempty-corpus guarantee, real versus illustrative data, cross-source deduplication and expiry. Static programmes are monitoring leads until a current window is evidenced."
    },
    "techniques/dedup-records-who-carried-it.md": {
      "disposition": "reverify",
      "reason": "Carrier sets need claim-specific evidence and timestamps; perpetual union retains withdrawn or stale assertions. Multiple carriers need not agree on values, and source count is not calibrated confidence. Upstream independence cannot always be inferred at onboarding; raw history can retain provenance outside the merge."
    },
    "techniques/market-readiness-tiering.md": {
      "disposition": "reverify",
      "reason": "Data pillars may correlate; a two-pillar test does not establish the third or high accuracy. Applicant documents and programme validation can support eligibility without a public bulk register. Tiers overlap and require explicit product scope; endpoint unavailability is not proof of nonexistence."
    },
    "techniques/open-call-vs-awarded-history.md": {
      "disposition": "reverify",
      "reason": "A rolling call may lack a future closing-date column; source roles may mix in one dataset. Cadence and tense are clues, not conclusive type tests. Participant Register contradicts absolute supranational absence, though it differs from national legal registries. Global foundation-feed absence not established."
    },
    "techniques/relevance-precision-filtering.md": {
      "disposition": "reverify",
      "reason": "Ingest-only filtering cannot expire previously stored calls unless deletion/tombstone reconciliation exists. News can announce real calls; allowlist unknown is unclassified rather than proved irrelevant. Positive and negative labeled examples are needed for precision/recall, and forecast preparation is distinct from open submission."
    },
    "techniques/stable-dedup-key-selection.md": {
      "disposition": "clarify",
      "reason": "Repaired mutable deadline/title identity, publisher namespace, collision handling and precedence. False merges can silently corrupt deadlines and are not inherently safer than duplicates."
    },
    "applications/node--close-date-normalization.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. HRSA itself qualifies its 23:59 default by the NOFO; universal clearinghouse stamping is unsafe. Two-stage later deadlines may require invitation. Null parsing and curated date-only records do not prove correct open-state behavior."
    },
    "applications/node--curated-floor-vs-live-feed.md": {
      "disposition": "reverify",
      "reason": "Historical code/date not refreshed. Same schema does not guarantee additive migration or deduplication; illustrative seeds must not enter actionable matching. Missing source links and maintained dates need actual evidence. Claimed single verified state dataset and endpoint availability were not freshly surveyed."
    }
  }
}
```
