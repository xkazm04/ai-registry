---
domain: grant-funding
subject: funder-research
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# funder-research

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-research",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:66c330e07954de75",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A real funder page times out: verification is unavailable, not evidence that the programme is fictional.",
    "A retry finds the exact approved row already persisted: zero changed rows can still mean successful idempotent promotion.",
    "An invitation-only call is usable by an applicant holding an invitation."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/funding-landscape/funder-research",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "funder-research.md": {
      "disposition": "reverify",
      "reason": "Pipeline is useful but scraper failures can return wrong rows and models can return empty results. Invitation-only is actionable for invited applicants; local currency may differ from award currency. Unknown verification must not mean refuted, and human review is not the only possible precision measurement."
    },
    "techniques/adversarial-verification-pass.md": {
      "disposition": "clarify",
      "reason": "Repaired inconclusive versus contradicted evidence, per-claim verification, fresh source scope and bounded operational failures. Independent sessions do not guarantee independent errors."
    },
    "techniques/coverage-gap-driven-planning.md": {
      "disposition": "reverify",
      "reason": "Lowest count is a heuristic, not guaranteed highest marginal value: demand, seasonal supply and verification costs differ. Staging is not live coverage, duplicate populations inflate counts, and research time is not last successful source confirmation. Zero baseline suppresses persistent-zero anomalies."
    },
    "techniques/discovery-with-omit-if-unsure.md": {
      "disposition": "reverify",
      "reason": "Instructions do not prove a lower fabrication rate or make empty output operationally successful. Repeated cap hits can mean abundant real supply. Preserve original titles and actual award currency rather than assuming jurisdiction language/currency; omissions and unavailable discovery need distinct outcomes."
    },
    "techniques/human-review-before-promotion.md": {
      "disposition": "clarify",
      "reason": "Repaired revision-bound approvals, existing-equal writes, atomic retry semantics and material enrichment changes. Delaying a day can lose a deadline; batching speedup and all-rejections-as-ground-truth are unmeasured."
    },
    "techniques/provenance-and-confidence-per-row.md": {
      "disposition": "reverify",
      "reason": "A deterministic completeness score is triage, not calibrated truth. More claims do not imply stronger evidence; duplicate runs may share sources. Field-level provenance is needed when amounts and deadlines differ in support, and prose is not inherently more authoritative than a score."
    },
    "techniques/schema-validation-at-boundary.md": {
      "disposition": "reverify",
      "reason": "Malformed JSON is an execution/parse failure, not a successful empty search. Locale punctuation coercion and permissive dates can alter values; HTTP scheme alone does not make a safe retrieval target. Deadline as identity duplicates amended calls; accent folding may collide. Schema validation does not remove later validation at new boundaries."
    },
    "applications/node--coverage-gap-driven-planning.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date not rerun. Counting staged candidates as serving coverage conflicts with the live-only claim; deduplication and rejected states need inspection. Comparing two runs misses persistent zero and seasonality. Deterministic quality scores do not establish accuracy."
    },
    "applications/process--discovery-with-omit-if-unsure.md": {
      "disposition": "reverify",
      "reason": "Historical prompt and date retained. Default false conflates absence of confirmation with refutation; source snippets and per-field evidence are not demonstrated. Separate CLI context is a useful control, not statistical independence, and locale currency can be incorrect for international awards."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

Read all nine documents at their restored bytes: the golden path, six techniques
and the two applications. The record above was written against the reverted
2026-09-09 rewrite and describes text that no longer exists. **Retraction:** its
`reverify` on seven of nine documents does not survive re-reading. Several of its
stated defects are things the current documents say themselves — the boundary
already rejects unparseable payloads with a recorded reason rather than treating
them as an empty search; discovery already separates field-level nulls from
row-level omission from run-level silence; the confidence formula already declares
itself triage and forbids auto-promotion. Those are not findings.

Two findings survive re-reading, both at boundaries rather than in the substance.

First, `techniques/adversarial-verification-pass.md` closes on "never share context
between discoverer and verifier — independence is the property the whole technique
rests on". Separate contexts remove *anchoring*; they do not produce independence
in the sense the argument needs. Both passes are the same instrument with the same
priors, so a fabrication that is a confident prior rather than a local slip is
exactly the kind that survives a second pass. The technique's own strongest rule —
fetch, don't recall — is what actually carries the load, and the independence claim
should be demoted to what it is: a cheap removal of a specific correlated-error
path, not a guarantee. The application's phrasing ("a separate CLI invocation with
no shared context") is accurate about the mechanism and does not make the stronger
claim, so it needs no change.

Second, `techniques/discovery-with-omit-if-unsure.md` states as a decision rule
that returning exactly the cap on every run "is a padding signal, not a richness
signal", and instructs lowering the cap or raising the confidence language. In a
dense jurisdiction–sector cell the cap will be hit on every run precisely because
supply is abundant, and following the rule there silently caps recall in the cells
that matter most. The signal is real but it is ambiguous, and the document states
it as unambiguous; the discriminator is downstream (verification and rejection
rates on the capped runs), not the cap-hitting itself.

A third item is a cross-subject seam I am recording rather than resolving.
`techniques/schema-validation-at-boundary.md` mints the staging dedup key from
"jurisdiction, funder, title, and the stated deadline". Deadline is mutable — an
amended call re-enters as a new candidate and burns a verification pass — and
deadline is explicitly nullable in the same document, so rows from one funder with
null deadlines collapse toward each other. This is the same defect I recorded this
pass in `grant-source-landscape`'s `stable-dedup-key-selection`, which lists close
date among identity fields while its sibling technique recomputes it. The two
subjects should agree that a field the pipeline itself recomputes or legitimately
nulls cannot be identity.

Kept: the golden path, coverage-gap-driven-planning, human-review-before-promotion,
provenance-and-confidence-per-row, and both applications. What I could not verify:
the `grant-writing-nonprofits` repository is not in this checkout, so both
applications' file and line references, and the quantitative claims inside them
(the ~95% title-copy descriptions, the 0/0 placeholder regression), were read as
dated field records rather than re-executed; verified_on is unchanged. No external
source was needed for this subject — its claims are about pipeline design, not
about the world — and none is cited below beyond the corpus itself.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-research",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:5dc32f745fcfc694",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at restored bytes and cross-read against grant-source-landscape's key-selection technique for the shared identity-field defect. Not evaluated: the grant-writing-nonprofits repository, so both applications' line references and internal measurements were read as dated records, not re-executed; no discovery or verification agent was run; no maturity or verified_on change.",
  "counterexamples": [
    "A dense jurisdiction-sector cell where real supply exceeds the cap on every run: 'hitting the cap is a padding signal' inverts, and lowering the cap suppresses genuine coverage.",
    "A fabrication that reflects a confident prior rather than a local slip: two context-isolated passes of the same model share that prior, so the second pass confirms rather than refutes, and only the fetch requirement stops it.",
    "An amended call whose deadline moved: the staging dedup key changes, the candidate is re-staged as new, and a verification pass is spent on an opportunity the corpus already served.",
    "A real funder page that times out during the adversarial pass: the fail-closed default correctly records not-confirmed, but that is an unavailability, not evidence the programme is fictional, and refusal-rate tuning must be able to tell the two apart."
  ],
  "sources": [
    {
      "url": "https://webgate.ec.europa.eu/funding-tenders-opportunities/spaces/OM/pages/1867804/Registration+and+validation+of+your+organisation",
      "result": "Consulted only to check the sibling subject's supranational-registry claim; it establishes nothing about this subject's pipeline design, and no claim here rests on it."
    }
  ],
  "documents": {
    "funder-research.md": {
      "disposition": "keep",
      "reason": "The trust-pipeline framing, the cheap-to-expensive ordering and the record-every-drop rule are argued and internally consistent. The prospect-research doctrine it transplants (funder's own surface for openness, filing-derived data for behaviour only, invitation-only as a hard disqualifier) is stated as practice with its scope attached."
    },
    "techniques/adversarial-verification-pass.md": {
      "disposition": "clarify",
      "reason": "Claims independence is 'the property the whole technique rests on' on the strength of unshared context. Separate contexts of the same instrument share priors, so correlated fabrication survives; the load is actually carried by the fetch-don't-recall and fail-closed rules. Demote the independence claim to the specific error path it removes."
    },
    "techniques/coverage-gap-driven-planning.md": {
      "disposition": "keep",
      "reason": "Counts-need-their-own-guard is the substance, and the volume-anomaly check is correctly scoped to successful runs with a human investigation rather than an automatic action. The seasonality objection is already named in the document as a reason the flag is not self-acting."
    },
    "techniques/discovery-with-omit-if-unsure.md": {
      "disposition": "clarify",
      "reason": "The decision rule reading a consistently-hit cap as a padding signal 'not a richness signal' is stated unambiguously and is ambiguous in fact: an abundant cell hits the cap legitimately, and acting on the rule there suppresses real coverage. Name the discriminator (verification and rejection rates on those runs) instead of the bare observation."
    },
    "techniques/human-review-before-promotion.md": {
      "disposition": "keep",
      "reason": "The approved-versus-promoted split, the confirmed-non-zero-write condition and the rejected-rows-as-ground-truth argument are precise and each names the failure it prevents. Throttle-discovery-not-standards and the audit-perfect-agreement rule close the two ways the gate goes soft."
    },
    "techniques/provenance-and-confidence-per-row.md": {
      "disposition": "keep",
      "reason": "Explicitly declares the score triage rather than calibrated truth, forbids surfacing it to applicants and forbids threshold auto-promotion, and states the epistemic ordering as the formula's actual content. Its re-derivability test for provenance is a real, checkable bar."
    },
    "techniques/schema-validation-at-boundary.md": {
      "disposition": "clarify",
      "reason": "Mints the staging identity key from the stated deadline, a field the same document declares legitimately nullable and that amended calls mutate. Amended calls re-stage as new and null-deadline rows from one funder collide. Same defect as the sibling subject's key technique; the two should agree that recomputed or nullable fields cannot be identity."
    },
    "applications/node--coverage-gap-driven-planning.md": {
      "disposition": "keep",
      "reason": "A dated record of the coverage model, the anomaly guard and the deterministic quality companion, with the upward lesson it taught the technique stated explicitly. Its internal measurements were read, not re-run, which is coverage rather than a defect."
    },
    "applications/process--discovery-with-omit-if-unsure.md": {
      "disposition": "keep",
      "reason": "Quotes the prompt pair verbatim and is accurate about the mechanism (separate invocation, no shared context) without making the stronger independence claim the technique makes. The three-granularity lesson it contributed upward is correctly attributed."
    }
  }
}
```
