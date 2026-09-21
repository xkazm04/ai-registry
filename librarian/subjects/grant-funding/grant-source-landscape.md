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

### 2026-09-10 — architecture re-review after the compression revert

Read all ten documents at their restored bytes: the golden path, seven techniques,
and the two Node applications. The record immediately above this one was written
against documents that no longer exist (the 2026-09-09 pass rewrote them and the
rewrite was reverted on 2026-09-10), so its per-document verdicts describe text
that is gone. I therefore treated it as a lead list and re-derived every decision
from the current bytes. **Retraction:** that record's blanket `reverify` on six of
ten documents does not survive re-reading. Most of what it called unverified is
either explicitly hedged in the prose ("expect the answer 'history, not calls' most
of the time", "in a typical national export") or is craft judgement that does not
require an external witness. Two of its leads did survive, and one new finding is
mine.

Findings that would justify a content change, all in the documents themselves:

1. `grant-source-landscape.md` says failure modes are "prevented structurally by
   one of the **six** techniques" while the frontmatter, the body links and the
   closing list all carry **seven**. A plain counting error.
2. The golden path's third data kind states supranational funding bodies have "no
   unified registry, only the member states' fragmented ones", and
   `techniques/open-call-vs-awarded-history.md` repeats it in its table
   ("absent at the supranational level"). I checked the EU Funding & Tenders
   Portal's own documentation: the Participant Register issues one PIC per legal
   entity, and a single Central Validation Service validates that entity — plus
   special legal statuses such as non-profit or public body — **for all EU
   services using the Portal**, with the validation valid for every future
   procedure. The claim's true core is narrower: there is no supranational
   *charity or company* register, and no bulk lookup a third party can verify an
   arbitrary applicant against. As written the sentence is contradicted by a
   primary source, and the eligibility-gate consequence drawn from it
   ("degrades to per-member-state verification") is at least partly wrong for the
   programme where it matters most.
3. `techniques/stable-dedup-key-selection.md` lists "close date" among the
   identity fields a composite key may hash, immediately after defining identity
   as "the run-invariant fields". `techniques/close-date-normalization.md`
   requires the stored close date to be **recomputed on each ingest** as
   multi-cutoff deadlines pass. For any multi-cutoff call from a source without a
   publisher id, the two rules fight: the key mutates the moment cutoff one
   passes, and the call re-inserts as a duplicate — the exact failure the key
   technique exists to prevent. Neither document names the other's constraint.
4. `techniques/close-date-normalization.md` and
   `applications/node--close-date-normalization.md` both endorse stamping 23:59 in
   the publisher's home timezone onto **every** row from the US federal
   clearinghouse. Checked against the publisher's own guidance and agency
   restatements of it: 23:59:59 ET is the latest instant the *system* accepts a
   package, but an agency may set an earlier closing time in the NOFO (a 4:00 pm
   ET example is the one agencies publish), and everything after that hour is
   deemed late even though the system took it. A blanket 23:59 stamp can therefore
   overstate the applicant's remaining window by hours on exactly the deadline the
   corpus exists to protect. The technique already has the right shape for the fix
   ("when a source documents an end-of-day convention") — what is missing is the
   rule that a per-record or per-notice stated time overrides the source default.
   The application's claim that "no reader-timezone drift is possible" is true and
   is not the risk here; the risk is a wrong instant, confidently stamped.

Kept without change: curated-floor-vs-live-feed, dedup-records-who-carried-it (its
publisher-not-adapter discipline and its refusal to let carrier count drive merges
are the strongest reasoning in the subject), market-readiness-tiering,
relevance-precision-filtering, and the curated-floor application.

What I could not verify: neither application's repository is in this checkout, so
the quoted line numbers, the Washington Fund Finder dataset and the `deadline-radar#2`
incident are dated field records I read but did not re-execute. Their `verified_on`
dates stand as of 2026-08-19 and I did not refresh them. Settling them requires the
`grant-writing-nonprofits` checkout, not a web source.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-source-landscape",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:605e027ddf0114c2",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full at restored bytes. Two external claims checked against primary/official sources (EU Participant Register validation scope; US federal clearinghouse closing-time convention). Not evaluated: the grant-writing-nonprofits repository, so both applications' line references, dataset identifiers and incident history were read as dated records and not re-executed; no maturity or verified_on change.",
  "counterexamples": [
    "A multi-cutoff call from a source with no publisher id: close-date-normalization recomputes the operative close date as cutoff one passes, which changes the composite key stable-dedup-key-selection built from that same close date, and the call re-inserts as a duplicate.",
    "A NOFO on the federal clearinghouse that closes at 4:00 pm ET: the system still accepts packages until 23:59:59 ET, so a row stamped with the blanket 23:59 convention tells the applicant they have eight hours they do not have.",
    "An EU applicant validated in the Participant Register: a unified, cross-programme legal-entity validation exists at the supranational level, so 'no unified registry' overstates what is actually missing (a public bulk register a third party can query).",
    "A jurisdiction whose only open-call source is a curated floor whose maintained dates have all expired: rendering zero rows is the correct, honest output, not the empty-jurisdiction failure mode."
  ],
  "sources": [
    {
      "url": "https://webgate.ec.europa.eu/funding-tenders-opportunities/spaces/OM/pages/1867804/Registration+and+validation+of+your+organisation",
      "result": "Established that one Central Validation Service validates legal entities and special legal statuses for all EU services using the Portal, and that the registration is valid for future procedures — contradicting 'no unified registry at the supranational level'. Did not establish that this register is publicly queryable in bulk, which is the product-relevant gap the documents were reaching for."
    },
    {
      "url": "https://www.corporateservices.noaa.gov/grantsonline/Documents/FFO_Help_Pages/FFO_Help_Submission_Dates_and_Times.htm",
      "result": "Official agency guidance establishing that the clearinghouse accepts until 23:59:59 ET but an agency-designated earlier closing time makes later submissions late. Read only; no application was submitted and no ingest code was run."
    }
  ],
  "documents": {
    "grant-source-landscape.md": {
      "disposition": "clarify",
      "reason": "Says failure modes are prevented by 'one of the six techniques' while seven are listed in frontmatter, body and closing list. Separately, 'supranational funding bodies have no unified registry' is contradicted by the EU Participant Register and its Central Validation Service; the accurate claim is that no supranational charity/company register or public bulk lookup exists."
    },
    "techniques/close-date-normalization.md": {
      "disposition": "clarify",
      "reason": "Instructs stamping the publisher's documented end-of-day convention onto every row. The federal clearinghouse's own convention is qualified: an agency may set an earlier closing time in the notice and treat later system-accepted packages as late. Needs the precedence rule that a record- or notice-stated time overrides the source default, and that the source default is an assumption recorded as such."
    },
    "techniques/curated-floor-vs-live-feed.md": {
      "disposition": "keep",
      "reason": "Two-layer design, the fail-fast template rule and the curation-honesty rules are internally consistent and correctly bounded by the 'when not to apply' section. Nothing here is contradicted by the current bytes or by a source."
    },
    "techniques/dedup-records-who-carried-it.md": {
      "disposition": "keep",
      "reason": "The publisher-granularity discipline, the republisher rule and the explicit refusal to let carrier count become a merge trigger are the load-bearing content, and each is argued rather than asserted. Its single-carrier rule already forecloses the over-reading of the number."
    },
    "techniques/market-readiness-tiering.md": {
      "disposition": "keep",
      "reason": "Pillar-independent scoring, fetch-don't-cite, dated verdicts and 'a market verdict names what was checked' are stated as method, not as a survey result, so they need no external witness. Tiers are described as shapes, not as a ranking of named markets."
    },
    "techniques/open-call-vs-awarded-history.md": {
      "disposition": "clarify",
      "reason": "The availability column asserting an applicant registry is 'absent at the supranational level', and the matching decision rule about the eligibility gate degrading to per-member-state verification, are contradicted by the EU Participant Register's cross-programme legal-entity validation. Narrow the claim to the absence of a public bulk register."
    },
    "techniques/relevance-precision-filtering.md": {
      "disposition": "keep",
      "reason": "Allowlist-over-blocklist reasoning is sound and its direction-of-failure argument is the substance. The one quantitative claim ('roughly three quarters of rows are in terminal states') is explicitly scoped to a typical national export rather than asserted globally, and the forecast carve-out is handled in the technique it belongs to."
    },
    "techniques/stable-dedup-key-selection.md": {
      "disposition": "clarify",
      "reason": "Lists close date among identity fields for a composite key while defining identity as run-invariant fields, and the sibling close-date technique recomputes that same close date on every ingest for multi-cutoff calls. The two rules produce duplicate rows for exactly the calls the corpus most needs to keep stable; the key document must exclude any field the normalization layer recomputes."
    },
    "applications/node--close-date-normalization.md": {
      "disposition": "clarify",
      "reason": "Faithfully reports the code, but endorses the unconditional 23:59 / America/New_York stamp as the technique's realization without recording the NOFO-specific-closing-time exception the publisher documents. The instructive-gap section names the curated-floor omission but not this one."
    },
    "applications/node--curated-floor-vs-live-feed.md": {
      "disposition": "keep",
      "reason": "A dated field record of a real implementation, including the honest limitations (illustrative-seed labelling, curated rows lacking public URLs, the deliberate non-mapping of a program-level cap). Read as of its verified_on date; the repository was not available to re-execute, which is coverage, not a defect in the document."
    }
  }
}
```
