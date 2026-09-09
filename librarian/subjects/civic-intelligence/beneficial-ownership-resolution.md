---
domain: civic-intelligence
subject: beneficial-ownership-resolution
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# beneficial-ownership-resolution

## Architecture review - 2026-09-09

Retain the subject and its six techniques. Correct identity, uncertainty,
interval and checksum claims; distinguish historical implementation intent
from the actual inspected classifier. No maturity promotion or refreshed
application witness is asserted.

## Open leads

- Consumer fixtures and repairs for identity collisions, disjoint tenures,
  pre-role events and mixed dated/undated input; return when the runtime
  comparison passes, not merely when the header describes the desired rule.
- Retrieve the authoritative identifier algorithm and applicable historical
  access/retention contracts before certifying source-specific conformance.
- Adjacent attribution subjects must preserve signature/payment distinctions
  and avoid treating an outside-tenure event as causal exoneration.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/beneficial-ownership-resolution",
  "date": "2026-09-09",
  "baseline": "8c670a6506aa87556b42bbf7535e63592cc66fc6",
  "digest": "sha256:7be1b2d166c9ad7f",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Identifier expression and role reconciler implementation inspected in a clean set of local consumer source files. Schema reference checked; live registry access, archive retrieval, historical incidents and consumer runtime were not rerun. Application dates and maturity unchanged.",
  "counterexamples": [
    "Two different people share a birth date; exactly one date match in a partial payload does not prove identity.",
    "A contract before the role started passes a test that checks only the end date.",
    "One undated contract plus one later contract cannot establish that every contract postdates the role.",
    "Combining two disjoint tenures into one envelope falsely includes events in the gap.",
    "Two ownership edges with non-overlapping validity intervals do not form a contemporaneous path.",
    "A legitimate company has a short name or an identifier scheme with letters and no check digit.",
    "A historical export is unavailable or lacks the requested year; repeating a guessed partition cannot prove absence."
  ],
  "sources": [
    {
      "url": "https://standard.openownership.org/en/latest/standard/reference.html",
      "result": "Version 0.4 schema separates identifier schemes, person attributes and dated interests; birthDate permits year/month/day precision and does not provide uniqueness."
    },
    {
      "url": "https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/370246/uniformResourceIdentifiersCustomerGuide.pdf",
      "result": "Identifier guide lists scheme-specific company-number prefixes; one national numeric checksum rule cannot be universal."
    },
    {
      "source": "Local consumer source inspection",
      "result": "Confirmed date-only matching, earliest/latest merging, end-only comparison and removal of undated events before classification. Identifier weights and wrap expression match the published example. Private source pin and pointers retained locally."
    },
    {
      "source": "Worked counterexamples and arithmetic",
      "result": "One accepted decimal final digit per prefix rejects nine of ten final digits; source-code reasoning establishes classifier counterexamples, not execution or population impact."
    }
  ],
  "documents": {
    "beneficial-ownership-resolution.md": {
      "disposition": "clarify",
      "reason": "Use scheme-qualified identity, distinguish inconclusive from contradicted, and preserve both tenure bounds and archive access limits."
    },
    "techniques/identifier-checksum-validation.md": {
      "disposition": "clarify",
      "reason": "Checksum applicability is scheme-specific; replace 10/11 random-token rejection with the conditional 9/10 derivation."
    },
    "techniques/name-to-identifier-discipline.md": {
      "disposition": "clarify",
      "reason": "Common corroborating attributes and short-name heuristics do not prove identity or invalidity."
    },
    "techniques/officer-record-reading.md": {
      "disposition": "clarify",
      "reason": "Birth date is not unique; ambiguous or incomplete matches are inconclusive rather than evidence against a tie."
    },
    "techniques/role-period-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Check starts, ends, gaps and date precision; separate signature from payment and keep mixed undated coverage unresolved."
    },
    "techniques/ownership-chain-traversal.md": {
      "disposition": "clarify",
      "reason": "Require overlapping edge validity and bounded cycle handling; preserve distinct paths without double-counting edges."
    },
    "techniques/struck-off-entity-archives.md": {
      "disposition": "clarify",
      "reason": "Historical access, partitioning and retention are source-specific; inaccessible exports do not establish absence or legal reuse permission."
    },
    "applications/node--identifier-checksum-validation.md": {
      "disposition": "reverify",
      "reason": "Implementation and printed arithmetic inspected; independent current register specification and historical incident impact not verified."
    },
    "applications/node--role-period-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Implementation contradicts claimed ambiguity and mixed-undated handling; source findings recorded, consumer repair and fixtures outstanding."
    }
  }
}
```
