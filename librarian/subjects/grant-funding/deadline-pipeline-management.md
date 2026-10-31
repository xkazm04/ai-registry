---
domain: grant-funding
subject: deadline-pipeline-management
last_touched: 2026-10-31
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

## Architecture re-review - 2026-09-10 (after the compression revert)

I read all eleven documents at their reverted bytes. The record immediately above
this one describes documents that no longer exist: it reports "3 document(s)
repaired" and grades several techniques on wording the revert removed. **I retract
that record's per-document reasons as descriptions of the current corpus.** Its
findings survive only where I re-derived them below; everything else in it should be
read as history of a rewrite, not as an assessment of these bytes.

Two defects re-derived independently, both arithmetic or logical rather than
stylistic. First, `escalating-reminder-thresholds` claims under "When adding a rung"
that the smallest-crossed-unsent rule "fires the new rung only for applications that
legitimately sit inside it, and suppression retires it for everyone deeper." Walk the
rule for an application at day 5 with 30/14/7 already recorded and a new 60-day rung
added: crossed = {60,30,14,7}, unhandled = {60}, so the selector fires 60. Suppression
only retires rungs alongside something that fires; when the new rung is the sole
unhandled crossed rung it *is* the fire. The retro-fire the decision rule promises to
prevent is what the stated rule produces. Second, `miss-risk-scoring` justifies the
`+1` grace day by saying "without it, one day of work due in one day scores at the
ceiling." Without it, `ratio = workLeft/daysOut = 1` and `score = 1/2 = 0.5` — the
midpoint, not the ceiling. The `+1`'s real load-bearing job is guarding `daysOut = 0`
against division by zero; the stated arithmetic is wrong and the Node application
repeats the same comment verbatim. The rest of that technique's arithmetic checks out:
10% done at 2 days is 4.5 work-days over 3, score 0.6, critical against the 0.55 cut;
95% done at 2 days is 0.077, on-track. The anchors land as claimed.

Sources. I read the Grants.gov organization-registration guidance, which states SAM
processing at **7-10 business days** after all information is entered, with Grants.gov
account registration same-day. `process--submission-lead-time-buffers` calls the
official SAM.gov figure "3-5 business days" and its own 10-14 day figure "roughly
triple" it; secondary 2026 guidance consistently attaches 3-5 business days to
*renewals*, not new registrations. Against 7-10 the multiple is about 1.4x, and the
"triple the official estimate" framing does not survive. I also read NIH's late-policy
history: NOT-OD-15-039 states explicitly that when a due date falling on a weekend or
Federal holiday is extended to the next business day, the late window "will be
calculated from that business day" — so the flat claim that grace windows key on the
original date is wrong for exactly the rollover case the same document treats as
standing NIH policy. That notice was **rescinded on 2026-03-31 and replaced by
NOT-OD-26-064**, which for due dates on or after 2026-05-25 confines late submission
to study-section-service circumstances and prohibits it outright for Fellowship, Small
Business and International Collaboration applications. A document dated 2026-08-20 and
titled "2025-2026" does not carry that. I could not open grants.nih.gov directly (403
on both the GPS section and the notice); the notice's content above comes from
institutional research-office restatements, which is why the application is `reverify`
rather than `clarify` — reading a restatement is not reading the policy.

Reading a source is all I did: no code was executed, and the cited repo
(`grant-writing-nonprofits`) is not present on this machine, so every line-number and
code claim in the three applications is unverified rather than confirmed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/deadline-pipeline-management",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:cfa13898c7fbb4b2",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full at reverted bytes. Formula arithmetic (miss-risk anchors, the +1 grace day) and the reminder-ladder selection rule were re-derived by hand. Primary/secondary source checks run on Grants.gov registration timing and NIH late-submission policy. NOT evaluated: the grant-writing-nonprofits repo (absent from this machine), so all application line-number and code citations are unverified; no runtime execution; no consumer or field witness; maturity and verified_on dates untouched.",
  "counterexamples": [
    "Add a 60-day rung while an application sits at day 5 with 30/14/7 recorded: crossed={60,30,14,7}, unhandled={60}, so 'fire the smallest crossed unhandled' fires 60 - the retro-fire the technique's decision rule claims the rule prevents.",
    "A draft at 100% completion scores exactly 0 miss risk while its organization's SAM registration has lapsed; completion is the only work signal the score reads, so the one clock that actually blocks submission is invisible to it.",
    "An NIH due date landing on a Saturday rolls to Monday, and NOT-OD-15-039 computes the late window from that Monday - so 'late-consideration windows key on the original date' reads the rollover case backwards.",
    "The cross-client union computes every day count in the consultant's timezone while each client's own dashboard computes it in the client's; the same deadline shows a different 'days left' on the two surfaces and neither document says which frame the client-facing row is entitled to."
  ],
  "sources": [
    {"url": "https://grants.gov/applicants/applicant-registration/organization-registration", "result": "Read: states SAM processing at 7-10 business days after all information is entered and Grants.gov account registration same-day. Establishes that the application's '3-5 business days' official figure and its 'roughly triple' arithmetic are wrong; does not establish what SAM.gov's own page currently publishes."},
    {"url": "https://grants.nih.gov/grants/guide/notice-files/not-od-15-039.html", "result": "Read via search-surfaced excerpts (direct fetch 403): the two-week window runs from the original due date, but where a weekend/holiday due date is extended to the next business day the window is calculated from that business day. Establishes the rollover exception; also establishes the notice was rescinded 2026-03-31."},
    {"url": "https://grants.nih.gov/grants/guide/notice-files/NOT-OD-26-064.html", "result": "Direct fetch returned 403; content known only from institutional restatements - for due dates on or after 2026-05-25 late submission is confined to peer-review-service circumstances and prohibited for Fellowship, Small Business and International Collaboration applications. Establishes that the application's policy snapshot is stale; does NOT establish the notice's exact wording on the window's basis."},
    {"path": "knowledge/grant-funding/grant-operations/deadline-pipeline-management", "result": "All 11 documents read at reverted bytes; formulas and selection rules re-derived on paper. The referenced repo was not available, so no code citation was checked."}
  ],
  "documents": {
    "deadline-pipeline-management.md": {"disposition": "keep", "reason": "The two-clock split, the four failure axes and the plan-to/expire-by separation all hold at these bytes and are consistent with the techniques beneath them. The opening 'total, silent, and unrecoverable' is rhetoric the buffers technique itself qualifies (funders do extend, and late windows exist), but the golden path names both, so the tension is acknowledged rather than hidden."},
    "techniques/closing-instant-resolution.md": {"disposition": "clarify", "reason": "The decision rule 'Clamp parsed times into valid range rather than rejecting the record' is in direct tension with the same document's closing rule 'do not fabricate precision the funder never published' and with honest-null-over-forced-guess: clamping a mangled 25:73 to 23:59 mints a closing instant no funder stated. Say which mangling is recoverable (a stray separator) and which must return null. Everything else - earliest-future-else-latest-past, absence-is-information, applicant-local as published frame - holds."},
    "techniques/cross-client-deadline-union.md": {"disposition": "keep", "reason": "N-scoped-reads-never-one-unscoped is the right security shape and is argued from the authorization surface rather than asserted. Degrade-visibly and loud-cap-hits are consistent with clean-is-not-ready. The uniform-practitioner-timezone rule is stated as a deliberate trade with its reason."},
    "techniques/escalating-reminder-thresholds.md": {"disposition": "clarify", "reason": "The 'When adding a rung' decision rule is wrong as stated. Under 'fire the smallest crossed unhandled, suppress the rest', an application at day 5 with 30/14/7 already handled has {60} as its only unhandled crossed rung and therefore fires it. Suppression retires deeper rungs only when something else fires. The rule needs a clause that a newly added rung above the smallest already-handled rung is recorded handled without sending."},
    "techniques/miss-risk-scoring.md": {"disposition": "clarify", "reason": "The stated justification for the +1 grace day is arithmetically wrong: without it, workLeft = daysOut gives ratio 1 and score 0.5, the midpoint, not 'the ceiling'. The +1's actual function is the daysOut=0 zero-guard, and the grace is a side effect. Separately, the opening calls the output a 'probability-of-missing estimate' while the decision rules correctly forbid presenting it as a probability; the squash is an uncalibrated pressure index. Anchors and thresholds themselves check out."},
    "techniques/severity-band-triage.md": {"disposition": "keep", "reason": "Band-gates-then-soft-signals is the law applied correctly, the four-band vocabulary is argued rather than asserted, and the 'tune thresholds not vocabulary' and 'divergent day math not divergent thresholds' rules are the right diagnostics. No claim here failed a check."},
    "techniques/submission-lead-time-buffers.md": {"disposition": "clarify", "reason": "'Late-consideration windows key on the original date even when the deadline itself was extended' is stated without qualification and is contradicted by NOT-OD-15-039 for weekend/holiday rollover, where the window runs from the shifted business day. The rule should distinguish a published extension of the call from a rollover of the stated date. The three-clock structure, the hard-gate framing of registrations, and the capacity-collision observation are sound."},
    "techniques/timezone-correct-day-math.md": {"disposition": "keep", "reason": "The failure mechanism (a job between UTC midnight and local midnight), the reference-midnight normalization, the one-function-for-every-consumer rule and the boundary against closing-instant expiry are all correct and internally consistent. The narrow claim that day counts come out 'one too high' in that window is right for zones behind UTC, which is the case the document is explicitly about."},
    "applications/node--closing-instant-resolution.md": {"disposition": "keep", "reason": "A faithful report of the technique in code, and honest about the guess-then-correct DST bound it inherits. It endorses the time-clamping choice, which is the technique's open boundary rather than this document's error. Repo unavailable this run, so line citations are unverified rather than confirmed."},
    "applications/node--miss-risk-scoring.md": {"disposition": "clarify", "reason": "Quotes the source comment '+1 grace: exactly-enough-time != certain miss', which carries the same wrong arithmetic as the technique - the ungraced score at parity is 0.5, not certain. Worth annotating as an inherited defect rather than presenting as the rationale. The anchor cases it cites (4.5 work-days over 2 calendar days -> critical; 95%@2d -> on_track) recompute correctly."},
    "applications/process--submission-lead-time-buffers.md": {"disposition": "reverify", "reason": "Two dated claims fail current checks. The 'official SAM.gov estimate of 3-5 business days' and the 'roughly triple' multiple are contradicted by Grants.gov's own registration page (7-10 business days); 3-5 days is the renewal figure in 2026 guidance. And the NIH late-window paragraph rests on NOT-OD-15-039, which was rescinded 2026-03-31 and replaced by NOT-OD-26-064 - a change this 2026-08-20 snapshot does not carry, and which materially narrows who may file late at all. NIH URLs returned 403 to me, so the replacement's exact wording remains unread: that is the reverify work."}
  }
}
```

## Architecture review - 2026-10-31

Stale because three applications landed on 2026-10-14 and the process application was
re-checked today. I read all fourteen documents. The buffers technique has absorbed
its owed clarify (the rollover exception). The other three clarify items from
2026-09-10 are still in the text: the new-rung rule, the +1 justification and the
time clamp. The new escalating-reminder application independently reproduced the
new-rung retro-fire and shipped the fix (a high-water mark), which is the evidence for
the wording change.

I retract the 2026-09-10 inference that timezone-correct-day-math's "one too high" is
right for zones behind UTC. Worked through: close Wednesday, now Monday 20:00 in New
York = Tuesday 01:00 UTC; the local count is 2, the UTC count is 1. The UTC count is
too low, and the document's own symptoms only follow from a count that is too low.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/deadline-pipeline-management",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:f52d1e09ccc00e73",
  "disposition": "clarify",
  "coverage": "All 14 current documents read in full, including the three applications added since 2026-09-10 (cross-client-deadline-union, escalating-reminder-thresholds, severity-band-triage, all 2026-10-14) and the process application re-checked earlier today. The reminder-ladder rule, the miss-risk +1 and the UTC-midnight day-count direction were re-derived by hand. NOT-OD-26-064 opened directly this run. Not evaluated: the private grant tree at runtime; application line citations; no verification date refreshed by this run.",
  "counterexamples": [
    "A 60-day rung added while an application sits at day 5 with 30/14/7 recorded: crossed = {60,30,14,7}, unhandled = {60}, so 'fire the smallest crossed unhandled' fires 60. The technique's own application reproduced it (day 20, 30 recorded) and fixed it with a high-water mark.",
    "Without the +1, workLeft = daysOut gives ratio 1 and score 0.5, the midpoint, not the ceiling.",
    "Close date Wednesday, now Monday 20:00 in New York (Tuesday 01:00 UTC): local count 2, UTC count 1. The UTC-framed count is one too LOW, which is what makes the day-of reminder fire early and the count go negative a day early.",
    "A funder time published as 25:73 clamped to 23:59 is a closing instant no funder stated."
  ],
  "sources": [
    {
      "url": "https://grants.nih.gov/grants/guide/notice-files/NOT-OD-26-064.html",
      "result": "Opened directly. Quoted: applies 'for applications submitted for due dates on or after May 25, 2026'; 'We don't accept late applications due to situations involving individuals other than a PD/PI'; study-section service 'within four calendar weeks before or after the due date'; no late submissions for Fellowship and Small Business applications with the shortest pre-review time, Collaborative International Research applications (e.g., PF5, UF5), and opportunities that say so; Continuous Submission accepted 'through August 10, 2026'. Supports the process application except that it omits the international-collaboration exclusion and says 'of' rather than 'before or after'."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-registration/organization-registration",
      "result": "Quoted: SAM registration 'can take an average of 7-10 business days after all information has been entered in SAM'. Consistent with the process application's re-checked figures."
    },
    {
      "path": "knowledge/grant-funding/grant-operations/deadline-pipeline-management",
      "result": "All 14 documents read; rules re-derived on paper. No code executed."
    }
  ],
  "documents": {
    "deadline-pipeline-management.md": {
      "disposition": "keep",
      "reason": "Unchanged in substance since 2026-09-10; the two-clock split and plan-to/expire-by separation hold. The ladder summary states the two invariants without the flawed new-rung sentence."
    },
    "techniques/closing-instant-resolution.md": {
      "disposition": "clarify",
      "reason": "Still owed: 'Clamp parsed times into valid range rather than rejecting the record' contradicts the same document's 'do not fabricate precision' and honest-null-over-forced-guess."
    },
    "techniques/cross-client-deadline-union.md": {
      "disposition": "keep",
      "reason": "Unchanged; its application confirms degrade-visibly and loud cap-hits were the rules a conforming fan-out broke."
    },
    "techniques/escalating-reminder-thresholds.md": {
      "disposition": "clarify",
      "reason": "Still owed, and now confirmed by its own application: the 'When adding a rung' rule claims the stated selector prevents a retro-fire it actually produces. The fix the application shipped is a monotone high-water mark: never fire a rung larger than one already handled."
    },
    "techniques/miss-risk-scoring.md": {
      "disposition": "clarify",
      "reason": "Still owed: the +1 justification is arithmetically wrong (ungraced parity is 0.5, not the ceiling); its real job is the daysOut = 0 guard. The opening also calls the output a 'probability-of-missing estimate' while its own rules forbid presenting it as a probability."
    },
    "techniques/severity-band-triage.md": {
      "disposition": "keep",
      "reason": "The added 'ask the band function, never re-state its threshold' rule is backed by its application's paired test."
    },
    "techniques/submission-lead-time-buffers.md": {
      "disposition": "keep",
      "reason": "The 2026-09-10 clarify (rollover exception to the original-date rule) has been applied: the text now distinguishes the standing weekend/holiday rollover. The hardship-exception bullet matches NOT-OD-26-064."
    },
    "techniques/timezone-correct-day-math.md": {
      "disposition": "clarify",
      "reason": "Retracts the 2026-09-10 keep. 'computes every day count one too high' is backwards: after UTC midnight but before local midnight in a zone behind UTC, today-in-UTC is a day ahead, so the count is one too LOW. The document's own symptoms (day-of reminder early, count negative a day early) only follow from a count that is too low."
    },
    "applications/node--closing-instant-resolution.md": {
      "disposition": "keep",
      "reason": "Faithful report of the code; its clamping note describes the code and inherits the technique's open boundary. Line citations unverified (private tree)."
    },
    "applications/node--cross-client-deadline-union.md": {
      "disposition": "keep",
      "reason": "States its unmet gaps (no merged soonest-first list, server-instant day count) and a return condition. Not re-run."
    },
    "applications/node--escalating-reminder-thresholds.md": {
      "disposition": "keep",
      "reason": "The falsifying test and the high-water-mark invariant are the evidence for the technique's clarify. Not re-run."
    },
    "applications/node--miss-risk-scoring.md": {
      "disposition": "clarify",
      "reason": "Still owed: quotes the source comment '+1 grace: exactly-enough-time != certain miss' without noting the inherited arithmetic error. Anchor cases recompute (4.5/3 = 1.5 -> 0.6 critical; 0.25/3 -> 0.077 on track)."
    },
    "applications/node--severity-band-triage.md": {
      "disposition": "keep",
      "reason": "Paired test at eight edge days; scope of the change and the deliberately untouched email prefix are stated."
    },
    "applications/process--submission-lead-time-buffers.md": {
      "disposition": "clarify",
      "reason": "Re-checked earlier today and now largely right; the 2026-09-10 reverify items are resolved in the text. One gap against NOT-OD-26-064 opened this run: the excluded list omits Collaborative International Research applications (e.g. PF5, UF5), and study-section service is 'within four calendar weeks before or after' the due date."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied all six clarify items. Nothing in the subject is now owed beyond the standing limit that the private tree's code citations were not re-checked.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/deadline-pipeline-management",
  "date": "2026-10-31",
  "baseline": "3f7e1dfbc",
  "digest": "sha256-b2:870ba724ad273429",
  "disposition": "keep",
  "coverage": "All 14 documents decided. Every clarify item from the record above was applied and the edited passages re-read; the reminder rule, the +1 and the day-count direction were re-derived, and the NIH change rests on NOT-OD-26-064 opened this run. Other documents are byte-unchanged. No verification date changed. Application line citations remain unverified (private tree).",
  "counterexamples": [
    "A 60-day rung added while an application sits at day 5 with 30/14/7 recorded: crossed = {60,30,14,7}, unhandled = {60}, so 'fire the smallest crossed unhandled' fires 60. The technique's own application reproduced it (day 20, 30 recorded) and fixed it with a high-water mark.",
    "Without the +1, workLeft = daysOut gives ratio 1 and score 0.5, the midpoint, not the ceiling.",
    "Close date Wednesday, now Monday 20:00 in New York (Tuesday 01:00 UTC): local count 2, UTC count 1. The UTC-framed count is one too LOW, which is what makes the day-of reminder fire early and the count go negative a day early.",
    "A funder time published as 25:73 clamped to 23:59 is a closing instant no funder stated."
  ],
  "sources": [
    {
      "url": "https://grants.nih.gov/grants/guide/notice-files/NOT-OD-26-064.html",
      "result": "Opened directly. Quoted: applies 'for applications submitted for due dates on or after May 25, 2026'; 'We don't accept late applications due to situations involving individuals other than a PD/PI'; study-section service 'within four calendar weeks before or after the due date'; no late submissions for Fellowship and Small Business applications with the shortest pre-review time, Collaborative International Research applications (e.g., PF5, UF5), and opportunities that say so; Continuous Submission accepted 'through August 10, 2026'. Supports the process application except that it omits the international-collaboration exclusion and says 'of' rather than 'before or after'."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-registration/organization-registration",
      "result": "Quoted: SAM registration 'can take an average of 7-10 business days after all information has been entered in SAM'. Consistent with the process application's re-checked figures."
    },
    {
      "path": "knowledge/grant-funding/grant-operations/deadline-pipeline-management",
      "result": "All 14 documents read; rules re-derived on paper. No code executed."
    }
  ],
  "documents": {
    "deadline-pipeline-management.md": {
      "disposition": "keep",
      "reason": "Unchanged in substance since 2026-09-10; the two-clock split and plan-to/expire-by separation hold. The ladder summary states the two invariants without the flawed new-rung sentence."
    },
    "techniques/closing-instant-resolution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Clamp parsed times into valid range' replaced by repair-formatting-never-invent: a recoverable slip is normalized, an out-of-range time is dropped and the record falls back to date-only defaults."
    },
    "techniques/cross-client-deadline-union.md": {
      "disposition": "keep",
      "reason": "Unchanged; its application confirms degrade-visibly and loud cap-hits were the rules a conforming fan-out broke."
    },
    "techniques/escalating-reminder-thresholds.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the new-rung rule now states that 'smallest crossed unsent' alone retro-fires (day 5, 30/14/7 handled, 60 fires) and adds the high-water mark its application shipped, with both test halves."
    },
    "techniques/miss-risk-scoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'probability-of-missing estimate' changed to 'miss-pressure index (uncalibrated, not a probability)'; the +1 now justified by the daysOut = 0 guard, with the grace effect stated correctly (below the 0.5 midpoint)."
    },
    "techniques/severity-band-triage.md": {
      "disposition": "keep",
      "reason": "The added 'ask the band function, never re-state its threshold' rule is backed by its application's paired test."
    },
    "techniques/submission-lead-time-buffers.md": {
      "disposition": "keep",
      "reason": "The 2026-09-10 clarify (rollover exception to the original-date rule) has been applied: the text now distinguishes the standing weekend/holiday rollover. The hardship-exception bullet matches NOT-OD-26-064."
    },
    "techniques/timezone-correct-day-math.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'one too high' corrected to 'one too low', with the reason (today-in-UTC is already tomorrow locally)."
    },
    "applications/node--closing-instant-resolution.md": {
      "disposition": "keep",
      "reason": "Faithful report of the code; its clamping note describes the code and inherits the technique's open boundary. Line citations unverified (private tree)."
    },
    "applications/node--cross-client-deadline-union.md": {
      "disposition": "keep",
      "reason": "States its unmet gaps (no merged soonest-first list, server-instant day count) and a return condition. Not re-run."
    },
    "applications/node--escalating-reminder-thresholds.md": {
      "disposition": "keep",
      "reason": "The falsifying test and the high-water-mark invariant are the evidence for the technique's clarify. Not re-run."
    },
    "applications/node--miss-risk-scoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a note added that the quoted +1 comment inherits the old arithmetic. verified_on unchanged."
    },
    "applications/node--severity-band-triage.md": {
      "disposition": "keep",
      "reason": "Paired test at eight edge days; scope of the change and the deliberately untouched email prefix are stated."
    },
    "applications/process--submission-lead-time-buffers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: NOT-OD-26-064 exclusions now include Collaborative International Research applications (PF5, UF5); study-section service is 'before or after' the due date, as the notice says. verified_on already 2026-10-31, unchanged."
    }
  }
}
```
