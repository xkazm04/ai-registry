---
domain: grant-funding
subject: eligibility-analysis
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# eligibility-analysis

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/eligibility-analysis",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:540babaa972a8182",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A call uses Others but its additional text limits applicants to named institutions: adding that code to every organization falsely passes them.",
    "An organization shares the funder country but is outside a required municipality.",
    "A fit score of 95 with unknown legal eligibility is a promising discovery result, not permission to submit.",
    "A registration can be curable next month while submission is blocked today."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/eligibility-analysis",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.grants.gov/api/status-codes",
      "scope": "Official code definitions distinguish Others from Unrestricted and require supplemental clarification."
    },
    {
      "url": "https://grants.gov/applicants/applicant-registration/organization-registration",
      "scope": "Current published processing estimate and completed-registration prerequisite; no applicant registration performed."
    }
  ],
  "documents": {
    "eligibility-analysis.md": {
      "disposition": "reverify",
      "reason": "The four gates are not exhaustive: registration and call-specific conditions also matter. A deterministic rule is not necessarily authoritative; missing conditions cannot become confirmed eligibility. Capacity heuristics and legal-form lookup need narrower scope."
    },
    "techniques/applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "Repaired code provenance, preservation of subtype constraints and supplemental eligibility text: Others is not unrestricted, and unrestricted can carry clarifications. Unknown codes remain unresolved."
    },
    "techniques/award-size-capacity-fit.md": {
      "disposition": "reverify",
      "reason": "Annual revenue comparisons ignore award duration, currency, eligible work and cash flow; missing bounds are not published zero or infinity. The 5–40 percent range and floor exceeding revenue are not universal eligibility rules."
    },
    "techniques/deadline-and-cutoff-evaluation.md": {
      "disposition": "reverify",
      "reason": "A one-hour timezone error is material at submission. Multiple cutoffs require stage eligibility; invalid dates and missing dates differ. Other gates can expire without a profile edit too."
    },
    "techniques/geographic-scope-gating.md": {
      "disposition": "clarify",
      "reason": "Repaired geography as explicit call predicates for applicant, activities and beneficiaries; same country and international labels do not prove local eligibility."
    },
    "techniques/hard-gate-vs-soft-score.md": {
      "disposition": "clarify",
      "reason": "Repaired provisional discovery versus permission to submit, unknown required conditions, authoritative rule scope, and time-dependent cache validity."
    },
    "techniques/legal-form-eligibility-model.md": {
      "disposition": "reverify",
      "reason": "Legal form may be relevant to both coded and uncoded calls; a regime-wide Boolean cannot replace programme conditions. Eligible-with-note must not pass an unevaluated mandatory condition. Universal validation-stage claims need programme sources."
    },
    "techniques/registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "Curable registration failure can still block submission now. Exclusion must match entity, scope, effective dates and exceptions; not every regime requires only an identifier at application. Lead times are uncertain dated estimates, not marketing-versus-truth classes."
    },
    "applications/node--applicant-type-code-mapping.md": {
      "disposition": "reverify",
      "reason": "Historical code and verified_on preserved, not rerun. Appending code 25 to everyone contradicts the official definition; code 99 also permits clarifications. Broad nonprofit merging and unconditional regime branching can produce false passes."
    },
    "applications/node--hard-gate-vs-soft-score.md": {
      "disposition": "reverify",
      "reason": "Historical implementation and date not refreshed. Excluding structured geography failures while hard-blocking heuristic award fit reverses evidence quality; unknown required conditions can become strong. Input hashing alone cannot invalidate an elapsed deadline."
    },
    "applications/process--registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "Historical snapshot not refreshed. Current registration guidance says average 7–10 business days after complete entry; universal active-registration, exclusion and validation-stage claims require programme exceptions and scope. Proposed-rule assertions and effective-date distinctions were not independently verified."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all eleven documents at their restored bytes: the golden path, seven
techniques, and three applications. The 2026-09-10 record above was written
against documents that the compression revert removed; its digest
(540babaa972a8182) no longer matches the tree (a6127aa5227462e1), and the
"3 document(s) repaired" it reports describes edits that no longer exist. I
treated its findings as leads only.

Most of those leads do not survive contact with the restored text. The claim
that the golden path treats a deterministic rule as epistemically authoritative
is wrong: the section "Deterministic gates outrank every model" already carries
the sub-rule "only evidence of gate-grade reliability may hard-block", and
explicitly demotes heuristics to pass-or-unknown. The claim that the four gates
are presented as exhaustive is also wrong: the golden path introduces
registration readiness as a fifth check of a different character in its own
paragraph. The claim that the 5–40 percent band is offered as a universal
eligibility rule is wrong: award-size-capacity-fit names it "a screening
heuristic, not a published sector norm" and routes off-band cases to unknown.
I retract all three inferences.

What does survive is a real internal contradiction, and it is the finding of
this unit. hard-gate-vs-soft-score, step 4, says a fail from a heuristic
"should either be prevented at the source — heuristics return pass or unknown,
not fail — or excluded from the hard-block set". award-size-capacity-fit then
declares its capacity ceiling "the only fail", and the application record
node--hard-gate-vs-soft-score.md shows the observed hard-block set as
applicant_type, deadline, award_fit. So the single most heuristic gate in the
subject is the one that hard-blocks, while the structured geography gate is
excluded. The application text notices and approves the geography exclusion but
does not notice that award_fit's inclusion contradicts the evidence-class rule
it is illustrating. Either the capacity ceiling is gate-grade evidence and the
rule needs a stated exception, or it is not and the hard-block set is wrong;
the corpus currently asserts both.

Second finding: applicant-type-code-mapping maps "unrestricted codes and
'others' codes" alike to the open-to-all value, and the Node application shows
codes 25 and 99 both resolving to "any" and both appended to every entity
type's eligible set. In the grants.gov vocabulary the "others" category is
defined by reference to a free-text clarification field rather than as an open
audience, so collapsing it to open-to-all converts an under-specified audience
into a pass for everyone — precisely the false pass the golden path's
three-valued logic exists to prevent. I could not settle the verbatim code
definitions against a primary source in this session: the public eligibility
page enumerates categories without codes, and the /api/status-codes endpoint
the earlier record cited covers submission statuses, not applicant eligibility.
The grants.gov opportunity-synopsis XML extract data dictionary would settle
it. I did not execute any grants.gov API call.

Third, a smaller boundary gap: the golden path's "Order of operations" says
"Run all four gates unconditionally and return all four results" and never
places registration readiness in the sequence, so a reader implementing from
that section alone drops the exclusion-list condition the same document calls
"a true hard fail".

The dated US/EU snapshot in process--registration-and-validation-readiness.md
is the subject's evidence debt. The 2 CFR 200 figures it cites (single-audit
threshold 750,000 to 1,000,000 dollars, de minimis 10 to 15 percent, effective
for fiscal periods beginning on or after 2024-10-01) match what I know, but I
verified none of the 2025–2026 items — EO 14332, the 2026-05-29 OMB proposed
rule, or the competing SAM.gov lead-time figures — against a primary source in
this run. I also retract the earlier record's counter-figure of "7–10 business
days", which I could not confirm either. That document is reverify, not keep.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/eligibility-analysis",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:a6127aa5227462e1",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes. Assessed for internal consistency, boundary statements and unsupported claims. Not evaluated: any runtime execution of the grant-writing-nonprofits repo, any grants.gov or SAM.gov or EU Funding and Tenders API call, and the maturity/verified_on fields of the three applications, which are left unchanged.",
  "counterexamples": [
    "An opportunity carrying only the 'others' applicant code with a clarification restricting it to named research institutes passes every applicant when 'others' is mapped to open-to-all.",
    "An applicant whose annual revenue is just under an award floor is hard-blocked by a rule of thumb, while an applicant in a country the opportunity structurally excludes is not — because award_fit hard-blocks and geography does not.",
    "A supranational call whose applicant is on the central register's exclusion list passes the four gates in 'Order of operations', which never runs the registration check.",
    "A fit score of 95 against an opportunity with an empty applicant-code list is an unknown gate, not permission to submit."
  ],
  "sources": [
    {
      "url": "https://grants.gov/learn-grants/grant-eligibility",
      "result": "Enumerates the applicant eligibility categories (government, education, public housing, nonprofit with and without 501(c)(3), for-profit, small business, individuals, foreign applicants). Established that the public category list matches the technique's canonical vocabulary; did NOT establish the numeric code assignments, and does not name an 'others' or 'unrestricted' category at all."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-eligibility",
      "result": "Redirects the reader to the Learn Grants eligibility page; established nothing about codes 25 or 99. The earlier record's citation of /api/status-codes for these definitions is misplaced: that endpoint documents submission status codes, not applicant-eligibility codes."
    }
  ],
  "documents": {
    "eligibility-analysis.md": {
      "disposition": "clarify",
      "reason": "Sound and largely self-correcting; the earlier record's charges of exhaustiveness and model-free authority are retracted. One boundary gap remains: 'Order of operations' runs four gates and never sequences registration readiness, so the exclusion-list hard fail the same document declares terminal has no place in the stated procedure."
    },
    "techniques/applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "'Open to all is a value, not an absence' is right, but it folds 'others' codes into open-to-all alongside unrestricted codes. An 'others' audience defined by reference to a clarification text is under-specified, not open; mapping it to open-to-all appends a universal pass to every entity type. The unrestricted case is separately qualified by the same clarification field."
    },
    "techniques/award-size-capacity-fit.md": {
      "disposition": "clarify",
      "reason": "Correctly and repeatedly labels itself the most heuristic gate, then declares the capacity ceiling 'the only fail'. That contradicts hard-gate-vs-soft-score step 4, which says heuristics return pass or unknown and never fail. The document needs to state why this heuristic is exempt, or stop failing."
    },
    "techniques/deadline-and-cutoff-evaluation.md": {
      "disposition": "keep",
      "reason": "Dates-versus-instants split, the earliest-future-cutoff rule and the explicit daylight-saving imprecision allowance are all stated with their boundaries. The earlier record's objections are already answered in the text."
    },
    "techniques/geographic-scope-gating.md": {
      "disposition": "keep",
      "reason": "The two-layer structured-then-prose design, the prose layer's pass-or-unknown ceiling, and the matching craft rules (whole-word, escaped needle, minimum length, case-sensitive abbreviations, matched granularity) are each tied to a concrete failure. Nothing unsupported found."
    },
    "techniques/hard-gate-vs-soft-score.md": {
      "disposition": "keep",
      "reason": "The separation-of-powers argument, the single shared verdict function and the cache-key rule are correct and evidenced by the application. It is the technique the capacity gate contradicts, not the one at fault."
    },
    "techniques/legal-form-eligibility-model.md": {
      "disposition": "keep",
      "reason": "Four-outcome lookup with two distinct unknowns, regime branching at the jurisdiction model, and the model/evidence split are stated with their failure modes. Eligible-with-a-note is explicitly scoped to conditional forms and does not, as the earlier record claimed, pass an unevaluated mandatory condition."
    },
    "techniques/registration-and-validation-readiness.md": {
      "disposition": "keep",
      "reason": "The three unusual properties (administrative, long-fuse, staged), warn-do-not-fail for curable status, exclusion as the single hard block, and the days-minus-lead-time composition are internally consistent and correctly leave the verdict to the human. Its numbers live in the application layer, which is where the evidence debt sits."
    },
    "applications/node--applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "A faithful field record of the repo as of 2026-08-19, and the alnist guard comment is a genuinely useful upward lesson. But it reports codes 25 and 99 both resolving to 'any' and both appended to every entity type without noting that the 'others' code carries a clarification the mapping discards. Historical code and verified_on preserved; not rerun."
    },
    "applications/node--hard-gate-vs-soft-score.md": {
      "disposition": "clarify",
      "reason": "Accurately shows the single verdict choke point and the cache-key incident. Its 'the hard-block set is an explicit list' section approves geography's exclusion but does not observe that award_fit — the subject's own most heuristic gate — is inside the set, which is the contradiction this unit turns on. Historical implementation and date not rerun."
    },
    "applications/process--registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "The dated snapshot carries the subject's unresolved evidence. The 2024 2 CFR 200 revision figures are consistent with what I know; the 2025-08-07 executive order, the 2026-05-29 OMB proposed rule, and the competing SAM.gov lead-time figures (3-5 business days documented versus 10-14 typical) were not checked against a primary source in this run, and I did not perform any registration. verified_on 2026-08-20 left unchanged."
    }
  }
}
```

### 2026-10-31 - architecture re-review (stale after three new applications)

Stale because three applications landed on 2026-10-14. I read all fourteen documents.
The new applications are falsification-shaped and each found a seam the technique
already names. None of the four clarify items from 2026-09-10 has been applied.

The question that record could not settle is now settled from the Grants.gov
funding-synopsis schema: code 25 is "Others (see text field entitled 'Additional
Information on Eligibility' for clarification)", and code 99 is unrestricted "subject
to any clarification" in that same field. The earlier inference that collapsing 25 into
open-to-all manufactures a false pass is confirmed.

The capacity-ceiling contradiction stays owed. It is shared with
coalition-and-portfolio-strategy/capacity-floor-detection and should be settled once.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/eligibility-analysis",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:198a681c980c0e23",
  "disposition": "clarify",
  "coverage": "All 14 current documents read in full, including the three applications added since 2026-09-10 (award-size-capacity-fit, deadline-and-cutoff-evaluation, geographic-scope-gating, all 2026-10-14). The Grants.gov funding-synopsis schema was opened for codes 25 and 99, and Grants.gov organization registration for SAM timing. Not evaluated: the private grant tree at runtime, any grants.gov / SAM.gov / EU portal API call, EO 14332 and the 2026-05-29 OMB proposed rule, 2 CFR 200.501 (eCFR redirected to a block page). No verification date refreshed.",
  "counterexamples": [
    "An opportunity coded only 25 ('Others (see text field ... for clarification)') whose clarification names research institutes passes every applicant when 25 is mapped to open-to-all.",
    "An applicant just under an award floor is hard-blocked by a rule of thumb while one in a structurally excluded country is not, because award_fit hard-blocks and geography does not (carried, unresolved).",
    "An applicant on the central register's exclusion list passes 'Order of operations' as written, because that section runs four gates and never the registration check.",
    "A PLN-denominated floor read as dollars fails a USD 620k organization (from the 2026-10-14 application; fixed there, and the technique already states the rule)."
  ],
  "sources": [
    {
      "url": "https://www.grants.gov/system-to-system/grantor-system-to-system/schemas/grants-funding-synopsis",
      "result": "Quoted: '25 (Others (see text field entitled \"Additional Information on Eligibility\" for clarification))' and '99 (Unrestricted (i.e., open to any type of entity above), subject to any clarification in text field entitled \"Additional Information on Eligibility\")'. Settles the 2026-09-10 open question: 25 is an under-specified audience, not open-to-all, and even 99 is subject to the clarification text."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-registration/organization-registration",
      "result": "Quoted: SAM registration 'can take an average of 7-10 business days after all information has been entered in SAM'. Refutes the process application's 'SAM.gov's own documentation cites 3-5 business days' as the official first-time figure."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/eligibility-analysis",
      "result": "All 14 documents read. No code executed."
    }
  ],
  "documents": {
    "eligibility-analysis.md": {
      "disposition": "clarify",
      "reason": "Still owed: 'Order of operations' runs four gates and never sequences registration readiness, so the exclusion-list hard fail the same document calls a true hard fail has no place in the stated procedure."
    },
    "techniques/applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "Still owed, now settled from the Grants.gov schema: code 25 means 'Others (see text field ... for clarification)', so mapping 'others' codes to open-to-all turns an under-specified audience into a universal pass. Code 99 is open-to-all but 'subject to any clarification' in the same text field."
    },
    "techniques/award-size-capacity-fit.md": {
      "disposition": "clarify",
      "reason": "Still owed: declares the capacity ceiling 'the only fail' while hard-gate-vs-soft-score step 4 says heuristics return pass or unknown. A cross-subject design decision (shared with coalition-and-portfolio-strategy/capacity-floor-detection), not a wording fix."
    },
    "techniques/deadline-and-cutoff-evaluation.md": {
      "disposition": "keep",
      "reason": "Unchanged; its application found a date-only cutoff resolved as UTC midnight, which is exactly the dates-versus-instants error the technique names."
    },
    "techniques/geographic-scope-gating.md": {
      "disposition": "keep",
      "reason": "The added one-shared-matcher rule is backed by its application's paired test."
    },
    "techniques/hard-gate-vs-soft-score.md": {
      "disposition": "keep",
      "reason": "Unchanged; it is the rule the capacity gate contradicts, not the document at fault."
    },
    "techniques/legal-form-eligibility-model.md": {
      "disposition": "keep",
      "reason": "Unchanged; 2026-09-10 keep stands."
    },
    "techniques/registration-and-validation-readiness.md": {
      "disposition": "keep",
      "reason": "Unchanged; internally consistent and leaves numbers to the application layer."
    },
    "applications/node--applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "Still owed: reports codes 25 and 99 both resolving to 'any' without noting that 25's definition defers to a clarification text the mapping discards. Historical code; not rerun."
    },
    "applications/node--award-size-capacity-fit.md": {
      "disposition": "keep",
      "reason": "Paired test on the currency fallback; names the two sibling readers it did not change. Not rerun."
    },
    "applications/node--deadline-and-cutoff-evaluation.md": {
      "disposition": "keep",
      "reason": "Guard case passes in both arms, two target cases fail on A; scope stated. Not rerun."
    },
    "applications/node--geographic-scope-gating.md": {
      "disposition": "keep",
      "reason": "Two failing-then-passing cases with a stated floor. Not rerun."
    },
    "applications/node--hard-gate-vs-soft-score.md": {
      "disposition": "clarify",
      "reason": "Still owed: approves geography's exclusion from the hard-block set without noting that award_fit, the most heuristic gate, is inside it."
    },
    "applications/process--registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "One item now resolved by a primary source: the 'SAM.gov's own documentation cites 3-5 business days' figure is contradicted by Grants.gov's 7-10 business days (clarify). Still unverified: EO 14332, the 2026-05-29 OMB proposed rule and its comment period, and the 2 CFR 200 figures (eCFR blocked this run)."
    }
  }
}
```

### 2026-10-31 - clarify applied

Applied three clarify items and corrected the SAM figure in the process application (it stays reverify for the executive order, the OMB proposed rule and the 2 CFR 200 figures). Still owed: award-size-capacity-fit's 'only fail' against hard-gate-vs-soft-score step 4 (a design decision shared with coalition-and-portfolio-strategy), and the hard-gate application's silence on award_fit being in the hard-block set, which waits on that decision.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/eligibility-analysis",
  "date": "2026-10-31",
  "baseline": "3f7e1dfbc",
  "digest": "sha256-b2:52865c2e50f9d60f",
  "disposition": "clarify",
  "coverage": "All 14 documents decided. Three clarify items applied and re-read; the code-25 change rests on the Grants.gov schema opened this run. The SAM.gov 3-5 day figure in the process application was corrected to Grants.gov's 7-10 business days, but that document keeps reverify for its unchecked 2025-2026 regulatory items. Other documents byte-unchanged. No verification date changed.",
  "counterexamples": [
    "An opportunity coded only 25 ('Others (see text field ... for clarification)') whose clarification names research institutes passes every applicant when 25 is mapped to open-to-all.",
    "An applicant just under an award floor is hard-blocked by a rule of thumb while one in a structurally excluded country is not, because award_fit hard-blocks and geography does not (carried, unresolved).",
    "An applicant on the central register's exclusion list passes 'Order of operations' as written, because that section runs four gates and never the registration check.",
    "A PLN-denominated floor read as dollars fails a USD 620k organization (from the 2026-10-14 application; fixed there, and the technique already states the rule)."
  ],
  "sources": [
    {
      "url": "https://www.grants.gov/system-to-system/grantor-system-to-system/schemas/grants-funding-synopsis",
      "result": "Quoted: '25 (Others (see text field entitled \"Additional Information on Eligibility\" for clarification))' and '99 (Unrestricted (i.e., open to any type of entity above), subject to any clarification in text field entitled \"Additional Information on Eligibility\")'. Settles the 2026-09-10 open question: 25 is an under-specified audience, not open-to-all, and even 99 is subject to the clarification text."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-registration/organization-registration",
      "result": "Quoted: SAM registration 'can take an average of 7-10 business days after all information has been entered in SAM'. Refutes the process application's 'SAM.gov's own documentation cites 3-5 business days' as the official first-time figure."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/eligibility-analysis",
      "result": "All 14 documents read. No code executed."
    }
  ],
  "documents": {
    "eligibility-analysis.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Order of operations' now runs the registration check beside the four gates where a central register exists: exclusion joins the hard fails, readiness travels with the deadline result."
    },
    "techniques/applicant-type-code-mapping.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'others' codes no longer map to open-to-all; per the Grants.gov schema they route through the clarification text (or unknown), and the unrestricted code is noted as subject to the same text."
    },
    "techniques/award-size-capacity-fit.md": {
      "disposition": "clarify",
      "reason": "Still owed: declares the capacity ceiling 'the only fail' while hard-gate-vs-soft-score step 4 says heuristics return pass or unknown. A cross-subject design decision (shared with coalition-and-portfolio-strategy/capacity-floor-detection), not a wording fix."
    },
    "techniques/deadline-and-cutoff-evaluation.md": {
      "disposition": "keep",
      "reason": "Unchanged; its application found a date-only cutoff resolved as UTC midnight, which is exactly the dates-versus-instants error the technique names."
    },
    "techniques/geographic-scope-gating.md": {
      "disposition": "keep",
      "reason": "The added one-shared-matcher rule is backed by its application's paired test."
    },
    "techniques/hard-gate-vs-soft-score.md": {
      "disposition": "keep",
      "reason": "Unchanged; it is the rule the capacity gate contradicts, not the document at fault."
    },
    "techniques/legal-form-eligibility-model.md": {
      "disposition": "keep",
      "reason": "Unchanged; 2026-09-10 keep stands."
    },
    "techniques/registration-and-validation-readiness.md": {
      "disposition": "keep",
      "reason": "Unchanged; internally consistent and leaves numbers to the application layer."
    },
    "applications/node--applicant-type-code-mapping.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: note added quoting Grants.gov's code 25 definition and what appending it to every type does. verified_on unchanged."
    },
    "applications/node--award-size-capacity-fit.md": {
      "disposition": "keep",
      "reason": "Paired test on the currency fallback; names the two sibling readers it did not change. Not rerun."
    },
    "applications/node--deadline-and-cutoff-evaluation.md": {
      "disposition": "keep",
      "reason": "Guard case passes in both arms, two target cases fail on A; scope stated. Not rerun."
    },
    "applications/node--geographic-scope-gating.md": {
      "disposition": "keep",
      "reason": "Two failing-then-passing cases with a stated floor. Not rerun."
    },
    "applications/node--hard-gate-vs-soft-score.md": {
      "disposition": "clarify",
      "reason": "Still owed: approves geography's exclusion from the hard-block set without noting that award_fit, the most heuristic gate, is inside it."
    },
    "applications/process--registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the 'SAM.gov's own documentation cites 3-5 business days' figure replaced by Grants.gov's 7-10 business days. Still unverified: EO 14332, the 2026-05-29 OMB proposed rule and its comment period, and the 2 CFR 200 figures (eCFR blocked this run). verified_on 2026-08-20 unchanged."
    }
  }
}
```
