---
domain: grant-funding
subject: evidence-grounded-claims
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# evidence-grounded-claims

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/evidence-grounded-claims",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:eae35e9e36f31e89",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Source says 78 percent of staff completed training; draft says 78 percent of beneficiaries found work. The numeric set passes an unsupported claim.",
    "100 percent of board members donated is a factual assertion requiring evidence.",
    "Annual revenue for 2024 and 2025 are two valid facts, not necessarily a conflict.",
    "20 of 25 participants gives a traceable 80 percent even if that literal percentage is absent from the source."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/evidence-grounded-claims",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "evidence-grounded-claims.md": {
      "disposition": "reverify",
      "reason": "Grounding does not make fabrication structurally impossible. External cited statistics and explicit derivations can be legitimate; verbatim digits can still attach to the wrong population. The richer-data causal claim needs controlled evidence and percentage-only precision needs measurement."
    },
    "techniques/bracketed-placeholder-over-invention.md": {
      "disposition": "reverify",
      "reason": "Brackets can be overlooked, legitimate citations also use brackets, and the supposedly number-free example says three poorest districts. Matching kind alone does not establish relevance; repeated placeholders may refer to different periods or programmes."
    },
    "techniques/document-fact-extraction.md": {
      "disposition": "reverify",
      "reason": "Regex can misattribute numbers and is neither free nor automatically conservative. Explicit quotation is not truth; confidence cannot resolve source disagreement by itself. Truncation may remove critical qualifiers, and delimiter stripping does not guarantee injection resistance."
    },
    "techniques/placeholder-to-fact-resolution.md": {
      "disposition": "reverify",
      "reason": "Amount, budget and annual revenue are not equivalent. Year can mean founding year rather than fiscal year; deterministic cue rules can guess wrongly too. A human acceptance click reduces risk but does not prove semantic fit."
    },
    "techniques/provenance-per-figure.md": {
      "disposition": "reverify",
      "reason": "Source filenames need precise locations and immutable versions. Old fiscal years remain valid historical evidence; deletion or replacement needs retention and invalidation policy rather than erasing audit history. Extraction error can be corrected against the same original source with a recorded revision."
    },
    "techniques/ungrounded-statistic-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired missing echo versus fabrication, claim context, derived rates, percent versus percentage points, endpoints and detector scope. Numeric equality does not establish support."
    },
    "techniques/verified-fact-ledger.md": {
      "disposition": "clarify",
      "reason": "Repaired sourced candidates versus verification, period-specific cardinality, conflict retention, external sources and explicit derivations; exact quotation and normalized representations can coexist."
    },
    "applications/node--ungrounded-statistic-detection.md": {
      "disposition": "reverify",
      "reason": "Historical code/date not rerun. Numeric sets accept a rate belonging to another group and conflate percent with percentage points; blanket 0/100 exemption misses board-participation claims. Eighty-character bracket matching is not comprehensive placeholder detection. Tiger drill causality and precision remain unverified."
    },
    "applications/node--verified-fact-ledger.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. First-match singular revenue drops multiple fiscal years and conflicts; caps truncate without proving completeness. Filename plus prompt instruction is not enforced truth, and a deterministic placeholder mapper can insert revenue into a grant-budget request."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

All nine documents read at reverted bytes. **I retract the preceding record's
per-document reasons** as an assessment of the current corpus; they grade a rewrite
that was reverted on 2026-09-10.

The subject's core is right and unusually hard-won: the measured finding that
grounding *relocates* fabrication rather than curing it is the kind of claim that
justifies a whole technique, and the placeholder discipline is argued from
recoverability, visibility, machine-legibility and typed resolvability rather than
taste. The five commitments hang together.

Three findings. First, the echo check's grounding is one undifferentiated numeric set.
`ungrounded-statistic-detection` defines the grounding as "the verified fact ledger,
the funder's call text, the funder profile, the org profile," and the application
confirms the implementation reduces the whole prompt to a set of numeric values, with
matching "by numeric value, not by string." So any 78 anywhere in a long RFP - a
cost-share percentage, a scoring weight, a page number, a fragment of a dollar amount
- grounds a fabricated "78% of students" in the narrative. The check's stated
precision argument is about which *draft* numerals it inspects; it never constrains
which *grounding* source may satisfy a match, and the fabrications the technique
describes (a need-framing percentage that sets up a real outcome) are exactly the ones
most likely to collide with a number the RFP already contains. Second, the golden path
claims the discipline makes a fabricated figure "structurally impossible" in a
drafting pipeline. It does not: detection is deliberately scoped to percentages,
counts and dollar amounts are out of scope by design, and the placeholder convention
is enforced only at the submission gate. The honest claim - fabricated percentages are
detectable, and the honest form is available and unpunished everywhere else - is
strong enough without the absolute. Third, `verified-fact-ledger` states two rules that
conflict: "singular kinds keep the first confident match" and, in the decision rules,
"when two entries of a singular kind conflict, surface the conflict to the writer; do
not let recency or confidence silently pick." First-match-wins is silently picking. One
of the two has to give, and the extraction-side application shows the first rule is the
one in force.

Nothing was executed; the cited repo (`grant-writing-nonprofits`) is absent from this
machine, so both applications' line-number and code citations are unverified rather
than confirmed. No external source needed checking - this subject makes no dated
factual claims about the world.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/evidence-grounded-claims",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:7991d799a5017298",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at reverted bytes and cross-read against each other for rule conflicts; the detector's scope, exclusions and matching rule were traced from technique to application. NOT evaluated: the grant-writing-nonprofits repo (absent from this machine), so all code and line citations are unverified; no drafting pipeline run, no false-positive rate measured, no extraction prompt exercised; no maturity or verified_on change. This subject asserts no dated external facts, so no primary-source check was owed.",
  "counterexamples": [
    "A call text quoting a 25% cost-share requirement grounds a fabricated 'we serve 25% of the county's eligible families': matching is by numeric value across the whole grounding, so a funder-side number licenses an organizational claim.",
    "A draft states 'we served 1,200 families' where the ledger says 1,240; the check is scoped to percentages, so the fabricated count ships clean - which the golden path's 'structurally impossible' framing does not admit.",
    "A verbatim ledger value carrying its qualifier ('+14 points, n=388') puts 388 into the grounding set, so a later fabricated '388 participants' echoes cleanly and is never flagged.",
    "Last year's audited financials, still uploaded, yield facts that are verbatim-faithful and currently false; provenance-per-figure's 'facts die with their document' fires only if someone deletes the superseded file, and nothing in the subject requires that."
  ],
  "sources": [
    {"path": "knowledge/grant-funding/proposal-craft/evidence-grounded-claims", "result": "All 9 documents read at reverted bytes and cross-checked for internal rule conflicts; the ledger's singular-kind conflict and the detector's grounding-scope hole were derived by reading the technique against its own application. No code was executed and the referenced repo was unavailable."}
  ],
  "documents": {
    "evidence-grounded-claims.md": {"disposition": "clarify", "reason": "The five commitments and the relocation finding are the right frame and should stand. The overclaim is 'makes a fabricated figure structurally impossible': detection is scoped to percentages by deliberate design, counts and amounts are out of scope, and the placeholder convention binds only at the submission gate. State the bound the pipeline actually delivers - the same page later concedes each of these limits."},
    "techniques/bracketed-placeholder-over-invention.md": {"disposition": "keep", "reason": "Four independent arguments for the ugly form, each of which holds; the honest-but-not-acceptable distinction keeps the submission gate meaningful; 'name the want' and the ban on suppressing the form for polish are the two rules that actually get violated in practice, and both are stated. The internal-documents carve-out at the end is a correct boundary."},
    "techniques/document-fact-extraction.md": {"disposition": "keep", "reason": "Deterministic floor before model pass, both-parts-or-nothing for outcomes, verbatim values with qualifiers, graded confidence, an empty result as a valid result, and the defensive parser that degrades rather than throws or poisons - all sound. The untrusted-document treatment is correctly argued from the ledger being trusted downstream, not from generic caution."},
    "techniques/placeholder-to-fact-resolution.md": {"disposition": "keep", "reason": "Deterministic cue mapping over a model mapper is argued from the failure shape that matters (fabrication with provenance attached, the most convincing wrong value available), the unmapped-returns-null fallthrough is treated as the feature it is, and the three reasons the human click is load-bearing are each real. The gap message that recruits the missing document is a genuinely good detail."},
    "techniques/provenance-per-figure.md": {"disposition": "keep", "reason": "The three travelling fields each have a stated consumption rule, the membership rule at the boundary ('the ledger never launders unsourced numbers into verified') is the load-bearing one, and correction-by-re-extraction rather than in-place edit closes the obvious hole. The third-party-citation carve-out is drawn in the right place."},
    "techniques/ungrounded-statistic-detection.md": {"disposition": "clarify", "reason": "The scope-to-percentages precision argument and the exclusions (bracket stripping, 0/100, value-level matching, report each value once) are all correct. The hole is that the grounding is one undifferentiated numeric set spanning ledger, call text, funder profile and org profile: a percentage need only match some number, from any source, of any kind. The document should require the echo to come from a source of the right kind, or state plainly that a funder-side number can ground an organizational claim."},
    "techniques/verified-fact-ledger.md": {"disposition": "clarify", "reason": "Two of its rules contradict: the entry-shape section says singular kinds 'keep the first confident match', while the decision rules forbid letting recency or confidence silently pick and require surfacing a conflict to the writer. Both cannot hold. The rest - closed taxonomy, verbatim storage, the three-part injection contract with the exclusive clause, empty-renders-to-nothing, facts leave with their document - is correct and load-bearing."},
    "applications/node--ungrounded-statistic-detection.md": {"disposition": "clarify", "reason": "Faithful, and valuable for preserving the Tiger-drill finding and the exact bracket-stripping and 0/100 exclusions. It inherits and makes concrete the grounding-scope hole: percentSet reduces 'the prompt: verified facts + RFP + funder-DNA + profile' to numeric values, so a match against any RFP number passes. Worth naming as a known limit alongside the one it already names (a wrong figure inside the grounding echoes cleanly). Repo unavailable this run, so line citations are unverified."},
    "applications/node--verified-fact-ledger.md": {"disposition": "keep", "reason": "Reports the taxonomy, MULTI_KINDS cardinality with per-kind caps, the provenance triple including via:regex|llm, the verbatim injection block and the null-returning placeholder mapping accurately, and states the deliberate first-party-only scope that keeps the authority claim honest. It also shows singular-kind-first-match is the rule actually in force, which is the evidence for the technique's clarify above."}
  }
}
```
