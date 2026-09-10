---
domain: grant-funding
subject: deadline-pipeline-management
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# deadline-pipeline-management

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/deadline-pipeline-management",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:55269caa7133934a",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A 100-percent-written application with no authorized submitter or receipt can still miss the deadline.",
    "If 30/14/7 rungs were handled and a new 60-day rung is added at day 5, smallest-crossed-unhandled selects 60 and retro-fires it.",
    "A stage-two deadline is not available to an applicant that missed a mandatory stage-one qualification.",
    "Without the added grace day, equal positive work and time produces ratio 1 and score 0.5, not 1."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/deadline-pipeline-management",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://grants.nih.gov/grants/policy/nihgps/HTML5/section_2/2.3.9_application_receipt_information_and_deadlines.htm",
      "scope": "Opened March 2026 policy: applicant-local 17:00, weekend/holiday rollover, case-by-case late consideration and shifted-business-day late-window basis; not an assessment of a particular application."
    },
    {
      "url": "https://grants.nih.gov/grants/guide/notice-files/NOT-OD-26-012.html",
      "scope": "Opened historical notice: Oct 1-Dec 5 2025 deadlines accepted through Dec 8 2025, without an additional two-week late window."
    },
    {
      "url": "https://grants.gov/applicants/applicant-registration/organization-registration",
      "scope": "Official search excerpt gives average 7-10 business days for complete SAM processing; individual registration timing not verified."
    }
  ],
  "documents": {
    "deadline-pipeline-management.md": {
      "disposition": "reverify",
      "reason": "Clock separation is useful, but missing a deadline is not universally unrecoverable and a finished unsubmitted draft still has submission risk. Calendar-band ordering and risk-first ordering conflict without a surface-specific policy. Later multi-stage cutoffs may require prior qualification. Internal buffers are planning targets, not proof an opportunity is legally closed."
    },
    "techniques/closing-instant-resolution.md": {
      "disposition": "clarify",
      "reason": "Repaired invalid-time clamping, acceptable one-hour DST error, unknown-as-open and indiscriminate next-cutoff selection. Preserves source precision, timezone ambiguity, stage eligibility and provisional planning assumptions separately from authoritative expiry."
    },
    "techniques/cross-client-deadline-union.md": {
      "disposition": "reverify",
      "reason": "Membership fan-out is one design, not proof of authorization. Check roles/current access per read and cached input, prevent tenant-key collisions and cross-client digest leakage. A correctly authorized set query can be valid. Sort by resolved instants while labeling day-count frame; partial failures and cap hits must remain visible to the user, not only logs."
    },
    "techniques/escalating-reminder-thresholds.md": {
      "disposition": "clarify",
      "reason": "Repaired sent-set as exactly-once guarantee and new-rung retrofire claim. Adds atomic durable selection, delivery outcome/idempotency, separate suppressed status and application/deadline-cycle/policy identity. Explicit extension, recipient and missed-run handling preserve a useful reminder history."
    },
    "techniques/miss-risk-scoring.md": {
      "disposition": "clarify",
      "reason": "Repaired draft-complete as risk-free, heuristic score as probability and arithmetic explanation of the grace day. Includes submission/approval dependencies, available working capacity, uncertain inputs and confirmed receipt; keeps formula only as a labeled pressure index."
    },
    "techniques/severity-band-triage.md": {
      "disposition": "reverify",
      "reason": "Bands are presentation policy, not eligibility-style hard gates. Prioritize available action, remaining work and consequence; overdue items need a separate route. Fixed four-band/eight-row rules are not universal. Shared date math does not prevent threshold/config drift; explain truncated scope and offer access to all obligations."
    },
    "techniques/submission-lead-time-buffers.md": {
      "disposition": "reverify",
      "reason": "Use prerequisite dependencies and actual business calendars rather than summing possibly overlapping buffers. Published durations are planning estimates, not hard infeasibility proofs. Late-window rules vary and the current NIH policy includes a weekend/holiday shifted-date basis. An internal plan date does not establish formal closure."
    },
    "techniques/timezone-correct-day-math.md": {
      "disposition": "reverify",
      "reason": "Calendar-day arithmetic needs one stated planning frame and validated civil dates. For a known closing instant project both endpoints into that frame; retaining a foreign source date can shift the count. After UTC midnight before local midnight, UTC-based days remaining is too low, not too high. A reference-midnight representation is optional, UTC may be an intended business zone, and offset transitions can differ from one hour."
    },
    "applications/node--closing-instant-resolution.md": {
      "disposition": "reverify",
      "reason": "Historical Node/consumer implementation and verification date were not rerun. Invalid time clamping invents a deadline; DST ambiguity is not acceptably bounded by one hour worldwide. Null cannot mean definitely open, raw ISO cutoff selection needs stage/time semantics, and a console warning alone does not expose omitted obligations to the user. 02:00 UTC equals 22:00 Eastern only during daylight time."
    },
    "applications/node--miss-risk-scoring.md": {
      "disposition": "reverify",
      "reason": "Historical Node implementation and verification date were not rerun. Formula yields 0.6 for 4.5 work-days and 2 daysOut because denominator is 3; without grace equal work/time gives 0.5, not certain miss. Forty characters can be meaningless, equal sections can have unequal effort, and submitted status/receipt must be separated from unfinished draft triage."
    },
    "applications/process--submission-lead-time-buffers.md": {
      "disposition": "reverify",
      "reason": "Historical process verification date retained. Current primary checks support NIH 17:00 applicant-local and weekend/holiday rollover, but its late window can start from the shifted business day; the universal original-date claim is false. NOT-OD-26-012 covered Oct 1-Dec 5 deadlines through Dec 8 with no extra window. Current Grants.gov guidance says roughly 7-10 business days, not the cited official 3-5. Institution-specific offsets and other historical notices were not independently rechecked."
    }
  }
}
```
