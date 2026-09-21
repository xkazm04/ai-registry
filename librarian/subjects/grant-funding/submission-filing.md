---
domain: grant-funding
subject: submission-filing
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# submission-filing

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/submission-filing",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:c099364040bbafd9",
  "disposition": "reverify",
  "coverage": "All 8 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Five filings contain only one portal URL; a high global sample tier does not corroborate that URL.",
    "A fabricated nonempty confirmation string satisfies the displayed verifiable expression.",
    "An awarded record leaves FILED_STATUSES and loses its derived proof despite having a valid historical receipt.",
    "An attachment required only for one applicant type disappears under a global majority."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/submission-filing",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.grants.gov/help/applicants/check-application-status",
      "scope": "Official status guidance distinguishes received, validation errors and agency receipt; no application submitted or tracked."
    }
  ],
  "documents": {
    "submission-filing.md": {
      "disposition": "reverify",
      "reason": "Deterministic derivation is not evidence of current truth. Crowd precedence, sample-size confidence and irreversible status are overgeneralized. Preserve filing events while supporting correction, withdrawal and resubmission. Evidence presence alone does not prove receipt, and outcome transitions must not erase historical filing. Registration and deadline rules need call-specific sources."
    },
    "techniques/crowd-verified-filing-profiles.md": {
      "disposition": "reverify",
      "reason": "Per-funder aggregation mixes programs, rounds and applicant types. Total sample size does not establish per-field coverage, independence or accuracy; first-seen plurality is not majority. Retain correction and freshness, distinguish missing answers from explicit none, protect private receipt references and reject unsafe destinations beyond URL scheme. Mark-filed is not the only valid capture moment."
    },
    "techniques/funder-portal-resolution.md": {
      "disposition": "clarify",
      "reason": "Repaired identifier shape as non-proof of existence, listing versus filing destination, current authoritative instructions before crowd reports and safe URL handling. Search can discover sourced candidates without itself establishing authority."
    },
    "techniques/majority-rule-doc-consensus.md": {
      "disposition": "clarify",
      "reason": "Repaired majority as descriptive frequency rather than requirement authority, response denominator and conditional requirements. Minority reports may identify genuine obligations; do not erase them solely to simplify a checklist."
    },
    "techniques/proof-of-filing.md": {
      "disposition": "clarify",
      "reason": "Repaired evidence presence versus validation, status-independent filing history, subject/package binding, correction and downstream policy. Receipt, validation, acceptance and timeliness are separate claims."
    },
    "techniques/standard-materials-checklist.md": {
      "disposition": "reverify",
      "reason": "Generic materials are jurisdiction and applicant dependent; a determination letter or annual return is not universal. A partial crowd list should not replace a complete requirements list. Keep source labels per item when combining differently sourced guidance; an empty known-required list differs from unknown requirements."
    },
    "applications/node--crowd-verified-filing-profiles.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Counting only current filed statuses can remove awarded/declined filings. Per-filing samples mislabeled org counts, global sample confidence can mask one portal report, repeated-org dominance and note-sentinel ambiguity remain. Scheme checks do not prevent phishing or private receipt disclosure."
    },
    "applications/node--proof-of-filing.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Nonempty user strings do not prove funder receipt, referenced artifact storage is deferred, and changing status to awarded/declined can make filed false. Local timestamp, missing validation and absent identity/package checks prevent a verified or guarantee verdict."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

Read all eight documents at their restored bytes: the golden path, five techniques
and the two Node applications. The record above was written against the reverted
2026-09-09 rewrite. **Retraction:** its `reverify` on five of eight documents does
not survive re-reading. Its charges about crowd sampling — that total sample size
does not establish per-field coverage, that repeated filings by one org are one
perspective, that a minority report may identify a genuine obligation — are all
rules the current documents state themselves, in `crowd-verified-filing-profiles`
and `majority-rule-doc-consensus` respectively. One of its charges was right and I
have kept it, sharpened.

The substantive finding is about the one-way door, and it is external. The golden
path argues that marking a submission filed is "irreversible by design ... because
the funder's copy cannot be un-sent". Checked against the US federal clearinghouse's
own applicant guidance and agencies' restatements of it: an applicant who discovers
an error can submit a changed or corrected application before the closing date, and
the most recent submission is the one deemed timely — the federal health-research
funder runs an explicit changed/corrected application process on the same basis.
The funder's copy is not un-sent; it is *superseded*, which is a different fact with
different consequences. The product rule (no path back to drafting, because metrics
key on submission counts) can stand on the metrics argument alone. What cannot stand
is the domain claim used to justify it, and the model it produces has no way to say
that filing #2 replaced filing #1 against the same opportunity — the evidence, the
duration and the document list captured at the first filing remain attached to a
package the funder will not review. The technique's own missing-confirmation
playbook ("check the portal's status page before re-filing") lands the user in
exactly this case and then has nowhere to put the outcome.

The second finding is an internal contradiction between the golden path and both
applications, and it is the one the previous record got right.
`applications/node--proof-of-filing.md` records that "`filed` means the record's
status is in `FILED_STATUSES` (`filed_manually` / `filed_auto`)", and
`applications/node--crowd-verified-filing-profiles.md` records that only rows in
those statuses contribute to the aggregate. The golden path states that from filed,
"only outcomes follow: awarded, declined". Put together: the moment a filing is
awarded, its status leaves `FILED_STATUSES`, so `filed` becomes false, `verifiable`
— derived as `filed AND evidence` — becomes false, and the filing drops out of the
funder profile's sample. A confirmation number the funder issued stops proving
anything at the moment the application succeeds, and the profiles get systematically
thinner for the funders orgs actually win with. Both applications list their
deviations from the standard honestly (per-filing rather than per-org counting; no
stamped funder instant; no post-submission validation state) and neither names this
one. It is the more consequential of the set, because it silently inverts the
technique's central derivation.

Kept: the three remaining techniques and the two knowledge-grade distinctions the
golden path rests on. `standard-materials-checklist` is unusually disciplined about
the thing that actually makes it honest — the caption travelling with the list as
data rather than as render-time copy — and its refusal to merge a verified list with
the generic floor closes the smuggling path. `funder-portal-resolution`'s ladder,
its purity requirement and its both-boundaries URL revalidation are each tied to the
specific harm they prevent. `majority-rule-doc-consensus`'s argument for *strict*
majority over at-least-half at n=2 is the sort of reasoning this corpus exists to
preserve.

What I could not verify: the `grant-writing-nonprofits` repository is not in this
checkout, so both applications' line references and quoted comments were read as
dated records rather than re-executed; no submission was filed and no portal status
was checked. Their verified_on dates are unchanged. Settling whether the
`FILED_STATUSES` contradiction is live in the product needs that checkout; it is
already a contradiction between the documents as written.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/submission-filing",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:6c54de904ee365f0",
  "disposition": "clarify",
  "coverage": "All 8 documents read in full at restored bytes and cross-read for contradictions between the golden path's status model and the applications' status filters. The irreversibility claim was checked against official applicant guidance on corrected resubmission. Not evaluated: the grant-writing-nonprofits repository, so both applications' references were read as dated records; no application was submitted, tracked or withdrawn; no maturity or verified_on change.",
  "counterexamples": [
    "An applicant who spots an error and files a corrected package before the closing date: the earlier filing is superseded rather than un-sent, and the model has no way to say which of two filings against one opportunity the funder will review.",
    "An awarded submission: its status leaves FILED_STATUSES, so the derived filed flag goes false, verifiable goes false with it, and the funder-issued confirmation number stops proving receipt at the moment the application succeeds.",
    "Five filings by one organization that all name the same portal URL: the global sample tier reads as high confidence while the evidence is one org's perspective repeated, which the technique's per-org rule anticipates and the implementation does not apply.",
    "A document required only of one applicant type: a global strict majority across mixed applicant types erases a real obligation for the segment it applies to."
  ],
  "sources": [
    {
      "url": "https://grants.nih.gov/grants-process/submit/submit-track-view/changed-corrected-application",
      "result": "Establishes that a major federal funder runs an explicit changed/corrected application process before the deadline, so a filed submission can be superseded. It does not establish that any funder permits retraction after the close, which is the narrower claim the one-way door could honestly rest on."
    },
    {
      "url": "https://www.dol.gov/agencies/eta/grants/apply/faqs",
      "result": "Agency restatement that a corrected application resubmitted before the deadline is the one deemed timely, and that clearinghouse validation is not the agency's responsiveness review. Read only; no application was submitted and no status was tracked."
    }
  ],
  "documents": {
    "submission-filing.md": {
      "disposition": "clarify",
      "reason": "Justifies the irreversible transition with 'the funder's copy cannot be un-sent', which official guidance contradicts: a corrected package filed before the close supersedes the earlier one and is the timely submission. The metrics argument for irreversibility is sound on its own; the model needs a supersession relation so the second filing's evidence and materials are not attached to a package nobody will review."
    },
    "techniques/crowd-verified-filing-profiles.md": {
      "disposition": "keep",
      "reason": "Capture-at-the-moment-or-never, optional fields to protect the transition, sanitize at both write and read boundaries, median rather than mean, the confidence tier travelling with the value, and the per-org preference at small samples are each argued from the specific distortion they prevent. Keeping conflicting contributions in the sample is the right call and is explained."
    },
    "techniques/funder-portal-resolution.md": {
      "disposition": "keep",
      "reason": "The three-rung ladder with an honest null at the bottom, the shape test as the proof the derived page exists, resolver purity, and revalidation of crowd URLs at both boundaries are precise and each tied to a named harm. The refusal to close the nulls with search or model recall is the load-bearing rule."
    },
    "techniques/majority-rule-doc-consensus.md": {
      "disposition": "keep",
      "reason": "The union-versus-intersection argument and the case for strict majority over at-least-half at n=2 are the substance and are reasoned rather than asserted. The identity problem, the alias-table-not-fuzzy-merge rule and the applicant-type segmentation carve-out are all named."
    },
    "techniques/proof-of-filing.md": {
      "disposition": "keep",
      "reason": "The two-boolean model, verifiable derived rather than stored, the funder's-clock rule, receipt-not-acceptance, opaque evidence strings and the never-generate-a-confirmation rule are internally consistent and correctly bounded. The upgrade path handles late-arriving evidence; only supersession, recorded as a counterexample, sits outside it."
    },
    "techniques/standard-materials-checklist.md": {
      "disposition": "keep",
      "reason": "The caption travelling with the list as data rather than as render-time copy is what makes the generic floor honest, and the displace-do-not-merge rule closes the path by which unverified items acquire a verified caption. The compliance carve-out correctly refuses the list as a completeness check."
    },
    "applications/node--crowd-verified-filing-profiles.md": {
      "disposition": "clarify",
      "reason": "Records that only rows in FILED_STATUSES contribute to the aggregate without noting that the golden path's own status model moves every awarded or declined filing out of those statuses, so the profile loses exactly the filings from funders orgs won with. The per-filing-not-per-org gap is named; this larger one is not."
    },
    "applications/node--proof-of-filing.md": {
      "disposition": "clarify",
      "reason": "Records filed as membership in FILED_STATUSES, which combined with the documented one-way progression to awarded or declined makes verifiable flip to false on success and discards a funder-issued confirmation. The deviations section names the missing stamped instant and the missing post-submission validation state but not this inversion of the central derivation."
    }
  }
}
```
