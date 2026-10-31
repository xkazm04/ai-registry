---
domain: game-production
subject: design-canon-as-executable-law
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# design-canon-as-executable-law

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/design-canon-as-executable-law",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d4713e4d73565742",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Skipping non-digits consumes a minus sign or a minimum operator and preserves only the magnitude.",
    "A structured authoritative constraint can generate both readable prose and checker inputs without duplicate authorship.",
    "A polynomial over a narrow high-level range can have nearly constant adjacent ratios."
  ],
  "sources": [
    {
      "url": "https://tc39.es/ecma262/multipage/text-processing.html#sec-characterclassescape",
      "scope": "The character-class definition makes a non-digit class include signs and comparison punctuation. This supports the parser counterexample, not verification of consumer extractors."
    }
  ],
  "documents": {
    "design-canon-as-executable-law.md": {
      "disposition": "reverify",
      "reason": "Reverify the ban on structured authoritative rules and the claim that low ratio variation proves intended geometric growth. Generated prose can share one authored numeric authority."
    },
    "techniques/archetype-aware-envelopes.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory control displacement, inferred archetypes and percentage tolerances. Explicit kinds must handle hybrids, absent blocks, zero targets and units with non-ratio scales."
    },
    "techniques/canon-as-single-source-of-thresholds.md": {
      "disposition": "reverify",
      "reason": "Reverify opposition to structured values with generated prose. One authored authority is the requirement, independent of representation."
    },
    "techniques/flag-your-own-shipped-defaults.md": {
      "disposition": "reverify",
      "reason": "Reverify the requirement to find an actual shipped violation: compliant defaults are possible. Deliberately violating independent fixtures establish checker sensitivity without fabricating a defect."
    },
    "techniques/parse-thresholds-from-prose.md": {
      "disposition": "clarify",
      "reason": "Replaced permissive non-digit extraction with constrained signed/operator-aware parsing, explicit ambiguity rejection, semantic mutation checks and a structured-authority alternative."
    },
    "techniques/self-declared-budget-enforcement.md": {
      "disposition": "reverify",
      "reason": "Reverify finite and zero-budget handling, units and global caps in addition to self-declared limits. Relative tolerance around zero is undefined without an absolute policy."
    },
    "techniques/shape-check-vs-content-invariant.md": {
      "disposition": "reverify",
      "reason": "Reverify classification by proposition rather than numeric appearance. Missing required fields are shape failures and omitted facets remain coverage gaps; one linked check need not enforce an entire rule."
    },
    "applications/node--flag-your-own-shipped-defaults.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed flag-your-own-shipped-defaults contract. Reverify the requirement to find an actual shipped violation: compliant defaults are possible. Deliberately violating independent fixtures establish checker sensitivity without fabricating a defect."
    },
    "applications/node--parse-thresholds-from-prose.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed parse-thresholds-from-prose contract. Replaced permissive non-digit extraction with constrained signed/operator-aware parsing, explicit ambiguity rejection, semantic mutation checks and a structured-authority alternative."
    },
    "applications/process--canon-as-single-source-of-thresholds.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed canon-as-single-source-of-thresholds contract. Reverify opposition to structured values with generated prose. One authored authority is the requirement, independent of representation."
    }
  }
}
```

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. The subject's bytes are unchanged since the 2026-09-10
record; it reads stale because the digest format changed. Two retractions of that record.
(1) It marked `parse-thresholds-from-prose` as `clarify` with the reason "Replaced
permissive non-digit extraction with constrained signed/operator-aware parsing". That
repair is not in the text: the technique still prescribes a non-digit run between anchor
and number and names "true minus signs" among the punctuation to skip. The repair was
lost in a later revert; the defect is open. (2) Its reverify items against
`flag-your-own-shipped-defaults` ("compliant defaults are possible") and
`archetype-aware-envelopes` (zero targets, percentage tolerances) are already answered in
those files: the first has a "finds nothing" branch and a planted-violation rule, the
second prescribes absolute tolerance and restricts percentage bands to strictly positive
targets. Both are now `keep`. New this run: the geometric-shape check passes a
polynomial when the curve is sampled away from its origin, computed below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/design-canon-as-executable-law",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:398ce42cd0bdc279",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full. Byte-unchanged since the 2026-09-10 record (git diff against its baseline is empty for the subject directory). Two claims were checked by executing JavaScript in node 22: what a \\D+ run consumes, and the coefficient of variation of consecutive ratios for 100*level^1.8 over several level ranges. No consumer tree was reopened; application verification dates are unchanged.",
  "counterexamples": [
    "Under /required\\D+(\\d+)/ the text 'required ≈ −5' yields 5, and /stun\\D+(\\d+)s/ yields 3 for both 'stun ≤3s' and 'stun ≥3s': the skipped run carries the sign and the direction of the bound.",
    "100*level^1.8 sampled over levels 5-50 has a consecutive-ratio coefficient of variation of 0.071, under the 0.15 cutoff; over levels 20-30 it is 0.0085 with a mean ratio of 1.076, next to a stated base of 1.08. Only from level 1 does it fail (0.32 over 1-50).",
    "A cap of zero with a measured value of zero equals its cap, which the self-declared-budget technique passes, while its procedure treats a non-positive cap as a finding.",
    "A structured value from which the readable sentence is generated has one authored copy, so the two-copies argument against a sidecar does not reach it."
  ],
  "sources": [
    {
      "source": "node 22 execution of the regex and ratio arithmetic above",
      "result": "Confirms \\D matches '−', '-', '≤' and '≥', so each is skipped and lost; confirms the CV figures quoted in the counterexamples. A true geometric series 100*1.08^level gives CV of about 6e-16."
    },
    {
      "url": "https://tc39.es/ecma262/multipage/text-processing.html#sec-characterclassescape",
      "result": "Not re-opened this run; the 2026-09-10 reading (\\D is the complement of the digit class) is consistent with the execution above."
    }
  ],
  "documents": {
    "design-canon-as-executable-law.md": {
      "disposition": "clarify",
      "reason": "(1) The shape section says a polynomial 'sails past' the CV-under-0.15 test; true only when sampled from level 1. Say to sample from the first level and to check that the ratio does not trend, since a polynomial's ratios fall toward one. (2) 'not a machine-readable field duplicated beside the prose' should allow a structured value that generates the prose, consistent with parse-thresholds-from-prose's own table exception. Unsourced and still owed reverify: a model-authored figure 'fails a band about forty percent of the time'."
    },
    "techniques/canon-as-single-source-of-thresholds.md": {
      "disposition": "clarify",
      "reason": "The sidecar arrangement fails because there are two authored copies. Add that a structured value which generates the sentence a human reads is one copy and satisfies the rule."
    },
    "techniques/parse-thresholds-from-prose.md": {
      "disposition": "clarify",
      "reason": "Retracts the 2026-09-10 claim that this was repaired. The non-digit-run idiom swallows signs and comparison operators (verified by execution). The skip must stop at a sign or operator whose meaning the check depends on: capture an optional sign, and anchor on or assert the operator, or name the direction in the exported identifier."
    },
    "techniques/shape-check-vs-content-invariant.md": {
      "disposition": "keep",
      "reason": "Classification by what a wrong number can fail, not-measured for absent fields, and coverage computation are consistent with each other and with the golden path. The 2026-09-10 reverify item is answered by the 'keep both' rule for a shape check and an invariant over one field."
    },
    "techniques/self-declared-budget-enforcement.md": {
      "disposition": "clarify",
      "reason": "Step 3 flags any non-positive cap while the decision rules pass a value equal to its cap. A zero cap is legitimate where the quantity can be zero; flag a negative cap, and report utilization as undefined at zero instead of dividing by it."
    },
    "techniques/archetype-aware-envelopes.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: absolute tolerance for signed targets, percentage bands only for strictly positive ones, declared kind with unknown kind as not-measured, and a minimum membership per kind are already stated."
    },
    "techniques/flag-your-own-shipped-defaults.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: the technique already says a clean first run may mean genuinely conformant defaults and requires a constructed violating artifact to show the check can fire."
    },
    "applications/node--parse-thresholds-from-prose.md": {
      "disposition": "reverify",
      "reason": "The quoted code skips the minus in 'ilvl − 5..15' but carries the direction in the identifier REQ_BELOW, which the corrected technique allows. The CV comment holds from level 1; which level range the linter samples was not reopened. Private tree not re-read; verification date unchanged."
    },
    "applications/process--canon-as-single-source-of-thresholds.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and discloses its two-parser deviation. Private tree not re-read; verification date unchanged."
    },
    "applications/node--flag-your-own-shipped-defaults.md": {
      "disposition": "reverify",
      "reason": "Header self-findings and facet-gated return shape described with their deviation (no coverage in the return). Private tree not re-read; verification date unchanged."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items the earlier 2026-10-31 record named. The shape check now names the sampling range and a ratio-trend check, the single-source rule admits generated prose, the parse idiom stops at signs and operators, and a zero cap is legitimate. The applications were not touched; with the golden path's unsourced forty-percent figure they keep the subject at `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/design-canon-as-executable-law",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:d57434549eac2017",
  "disposition": "reverify",
  "coverage": "Second 2026-10-31 record, after applying the clarify items of the first. Edited sections re-read; every other document is byte-unchanged from the first record and keeps its disposition. Sources as in the first record; no private tree reopened and no verification date refreshed.",
  "counterexamples": [
    "Under /required\\D+(\\d+)/ the text 'required ≈ −5' yields 5, and /stun\\D+(\\d+)s/ yields 3 for both 'stun ≤3s' and 'stun ≥3s': the skipped run carries the sign and the direction of the bound.",
    "100*level^1.8 sampled over levels 5-50 has a consecutive-ratio coefficient of variation of 0.071, under the 0.15 cutoff; over levels 20-30 it is 0.0085 with a mean ratio of 1.076, next to a stated base of 1.08. Only from level 1 does it fail (0.32 over 1-50).",
    "A cap of zero with a measured value of zero equals its cap, which the self-declared-budget technique passes, while its procedure treats a non-positive cap as a finding.",
    "A structured value from which the readable sentence is generated has one authored copy, so the two-copies argument against a sidecar does not reach it."
  ],
  "sources": [
    {
      "source": "node 22 execution of the regex and ratio arithmetic above",
      "result": "Confirms \\D matches '−', '-', '≤' and '≥', so each is skipped and lost; confirms the CV figures quoted in the counterexamples. A true geometric series 100*1.08^level gives CV of about 6e-16."
    },
    {
      "url": "https://tc39.es/ecma262/multipage/text-processing.html#sec-characterclassescape",
      "result": "Not re-opened this run; the 2026-09-10 reading (\\D is the complement of the digit class) is consistent with the execution above."
    }
  ],
  "documents": {
    "design-canon-as-executable-law.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the shape paragraph now says to sample from the first level, cites 100·level^1.8 over levels 5-50 at a CV near 0.07, and adds a no-trend check on the ratio; 'body holds the numbers' now says a structured value that generates the sentence is still one authored copy. Still owed reverify: a model-authored figure 'fails a band about forty percent of the time' has no source."
    },
    "techniques/canon-as-single-source-of-thresholds.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a paragraph after the three arrangements saying the sidecar fails for holding two authored copies, and that a structured value generating the readable sentence satisfies the rule."
    },
    "techniques/parse-thresholds-from-prose.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the limit of the skip (−5 reads as 5; ≤3s and ≥3s both read as 3), with the remedy of an optional captured sign, an anchored or asserted operator, or a direction-naming identifier; procedure step 3 updated to match. 'the entire class of failure' narrowed to typographic failure."
    },
    "techniques/shape-check-vs-content-invariant.md": {
      "disposition": "keep",
      "reason": "Classification by what a wrong number can fail, not-measured for absent fields, and coverage computation are consistent with each other and with the golden path. The 2026-09-10 reverify item is answered by the 'keep both' rule for a shape check and an invariant over one field."
    },
    "techniques/self-declared-budget-enforcement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 3 now flags a negative cap; a zero cap is legitimate where the quantity can be zero and utilization is reported as undefined there."
    },
    "techniques/archetype-aware-envelopes.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: absolute tolerance for signed targets, percentage bands only for strictly positive ones, declared kind with unknown kind as not-measured, and a minimum membership per kind are already stated."
    },
    "techniques/flag-your-own-shipped-defaults.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify: the technique already says a clean first run may mean genuinely conformant defaults and requires a constructed violating artifact to show the check can fire."
    },
    "applications/node--parse-thresholds-from-prose.md": {
      "disposition": "reverify",
      "reason": "The quoted code skips the minus in 'ilvl − 5..15' but carries the direction in the identifier REQ_BELOW, which the corrected technique allows. The CV comment holds from level 1; which level range the linter samples was not reopened. Private tree not re-read; verification date unchanged."
    },
    "applications/process--canon-as-single-source-of-thresholds.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and discloses its two-parser deviation. Private tree not re-read; verification date unchanged."
    },
    "applications/node--flag-your-own-shipped-defaults.md": {
      "disposition": "reverify",
      "reason": "Header self-findings and facet-gated return shape described with their deviation (no coverage in the return). Private tree not re-read; verification date unchanged."
    }
  }
}
```
