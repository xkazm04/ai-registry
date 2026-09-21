---
domain: game-production
subject: production-prompt-architecture
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# production-prompt-architecture

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-prompt-architecture",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2011dcfc98593a8c",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Untagged advice is unclassified unless a schema explicitly defines it as universal. Broad fallback can exceed budget or mix incompatible versions; unknown task kinds must not silently exclude required advice.",
    "Canonical order is a project convention, not a universal attention guarantee. Shared builders can still accept incomplete payloads; matching headings may occur in quoted content, and causal attribution needs controlled comparison.",
    "A bounded or failed scan cannot establish that no artifact exists. Bind to revision and coverage, distinguish partial results, and revalidate before writes. Observed project contents do not override authoritative repository instructions."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-prompt-architecture/production-prompt-architecture.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "production-prompt-architecture.md": {
      "disposition": "reverify",
      "reason": "Reverify universal fixed order, section-count drift, mandatory criteria truncation, scans promoted to complete project truth and version-only fact selection. The acceptance-composition technique is repaired; golden-path and consumer reconciliation remain."
    },
    "techniques/acceptance-criteria-appended-not-replaced.md": {
      "disposition": "clarify",
      "reason": "Repaired immutable baseline plus validated additions, conflict handling, complete criterion identities and refusal or a supported staged workflow when mandatory criteria exceed context. A marker or text-length check is not content completeness."
    },
    "techniques/domain-scoped-knowledge-injection.md": {
      "disposition": "reverify",
      "reason": "Untagged advice is unclassified unless a schema explicitly defines it as universal. Broad fallback can exceed budget or mix incompatible versions; unknown task kinds must not silently exclude required advice."
    },
    "techniques/fixed-section-order.md": {
      "disposition": "reverify",
      "reason": "Canonical order is a project convention, not a universal attention guarantee. Shared builders can still accept incomplete payloads; matching headings may occur in quoted content, and causal attribution needs controlled comparison."
    },
    "techniques/scanned-project-state-do-not-recreate.md": {
      "disposition": "reverify",
      "reason": "A bounded or failed scan cannot establish that no artifact exists. Bind to revision and coverage, distinguish partial results, and revalidate before writes. Observed project contents do not override authoritative repository instructions."
    },
    "techniques/version-keyed-engine-facts.md": {
      "disposition": "reverify",
      "reason": "Engine version alone omits plugins, platform, operation mode and prerequisites. Cache by fact revision and relevant environment; a types package does not witness the runtime. Unknown versions may still have documented compatible facts."
    },
    "techniques/wiring-requirements-section.md": {
      "disposition": "reverify",
      "reason": "No known wiring hint is not proof no wiring is required. Data-table consumption still needs a loader contract; state the missing evidence instead of fabricating a hook or omitting a required obligation."
    },
    "applications/node--fixed-section-order.md": {
      "disposition": "reverify",
      "reason": "The historical builder has nine sections against header/auditor descriptions of six/seven. Heading regexes can match quoted instructions and do not prove order or nonempty required content. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--acceptance-criteria-appended-not-replaced.md": {
      "disposition": "reverify",
      "reason": "The historical 220-character cap and depth-four walk can omit mandatory criteria. Twelve characters plus tier markers cannot establish complete wiring or acceptance coverage; append order alone does not resolve conflicts. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all nine documents at 44c89965. This subject makes no claims about the outside
world - no engine behaviour, no published measurement, no third-party contract - so
there was nothing here a primary source could settle, and I made no source checks. It
is entirely an argument about assembly, and it is checkable only against itself and
its own worked example. That is what I did.

**Four different section counts, and the audit's denominator is not the canonical
set.** The golden path says "around half a dozen parts recur" and immediately
disclaims the count ("the useful claim is not the count - it is that the set is
*closed and ordered*"). `fixed-section-order.md` then tables **nine** sections. The
application's builder assembles nine in practice (project context, quality pack,
domain context, task, asset spec, wiring, best practices, output schema, success
criteria), with two of them numbered 3.25 and 3.5 to record where they were inserted.
And `auditPromptString()` "detects the seven canonical sections", with
`summarizeAudit()` rendering "5 of 7 sections populated".

The disclaimer covers the golden path's vagueness. It does not cover the auditor.
The golden path's central argument for the whole "architecture nobody can verify
adherence to is a style guide" section is that a raw-string auditor reports coverage
against the canonical set - and here the auditor's denominator is seven while the
canonical set is nine. Two canonical sections are outside the coverage figure and
nothing names them. By elimination against the builder's field list the unaudited
pair is almost certainly the quality pack and the asset spec, which are precisely the
two most recently added - but that is my inference from the documents, not something
either document states, and I did not open the code. A coverage metric whose
denominator silently excludes the newest sections drifts in exactly the direction the
section argues against: the skeleton grows, the audit does not, and the number stays
reassuring.

**The reciprocal-output-field rule does not match the section set it is stated
over.** The golden path says: "Pair it with the rule that every required section has a
corresponding **required field in the output**." But only two sections are required -
environment/project context and task - and neither has a reciprocal output field
anywhere in this subject. The one section that does have the mechanism, described in
detail in `wiring-requirements-section.md`, is optional. So the rule as written
mandates output fields for the two sections that have none and omits the one that
demonstrates the idea. The mechanism is good and the sentence generalising it is
wrong about which sections it applies to.

**Empty sections are omitted in one technique and mandatorily rendered in another,
and the asymmetry is unargued.** `fixed-section-order.md` states it flatly: "When a
section has nothing concrete to say, omit it - do not emit boilerplate", with the
reason that boilerplate teaches the producer to skim.
`scanned-project-state-do-not-recreate.md` step 4 states the opposite for its own
section, with an equally good reason: "Omitting the line makes absence
indistinguishable from not-scanned... the producer treats unknown territory as empty
territory and builds." The golden path endorses the second without noticing it
contradicts the first. Both are right, and the discriminator is stated nowhere: a
section's absence may be omitted when the producer's default reading of the absence is
correct, and must be rendered when the absence is itself information. That test also
changes an answer elsewhere - `wiring-requirements-section.md` chooses omit ("when no
per-artifact hints and no known dependencies exist, omit the section"), yet an omitted
wiring section reads to a producer as "this artifact needs no wiring" when it may only
mean "nobody authored hints", which is the same failure the state section refuses.

Minor: `version-keyed-engine-facts.md` says to fail loudly on an unknown version
(step 4) and, three paragraphs later, to state an assumed version explicitly when the
version cannot be determined. On careful reading these are different situations - a
version outside the map versus no project in hand - and step 3 does distinguish them.
A reader skimming will conflate them, and the two prescriptions are opposite.

What I checked and found sound: the order argument itself, which is derived from
function at every step and matches the builder's actual push order; the closed-set
argument and the never-conditional-order rule; the additive-composition argument for
criteria and its consequence that a step which can replace criteria can opt out of the
baseline; the non-authoritative injection boundary and its testable form ("change the
assembler arbitrarily and re-run the grader on stored outputs; every verdict must be
identical"), which is the sharpest single sentence in the subject; the three-tier
knowledge routing and, especially, the distinction between an explicitly empty scope
and an absent one; the fallback-rate measurement as the only signal that routing never
happened.

Both applications remain `reverify`. They cite a PoF checkout by file and line at
`verified_on` 2026-08-20 and 2026-08-30 with no commit pinned; no checkout was made,
no prompt assembled, no audit run. Both record their deviations honestly and both
deviations are correct as stated.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-prompt-architecture",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:04ef223250cb94b2",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at 44c89965 and cross-read against each other and against the worked builder for consistency of the section set, the section order, the required-section rule and the empty-section rule. No external source check was made or warranted: this subject asserts nothing about the outside world. Explicitly NOT evaluated: any PoF checkout, prompt-builder.ts, contractPrompt.ts, any assembled prompt, any audit run, any grader.",
  "counterexamples": [
    "The canonical set is nine sections, the raw-string auditor reports coverage over seven, and nothing names the two that fall outside the denominator - so a prompt can be complete against the audit and short two canonical sections.",
    "'Every required section has a corresponding required field in the output' names the two required sections (context and task), neither of which has one, while the section that does have the mechanism (wiring) is optional.",
    "The general rule omits an empty section; the state technique forbids omitting an empty state section; both give a correct reason and the subject supplies no discriminator between them.",
    "An omitted wiring section reads to a producer as 'no wiring needed' when it may only mean 'no hints were authored' - the exact ambiguity the state section's explicit-empty rule exists to prevent, resolved the other way with no argument.",
    "The rejection rule the producer is shown - a claim under twelve characters is refused - is satisfied by any twelve characters, so it enforces length rather than the substance the technique describes.",
    "'Fail loudly on an unknown version' and 'state the assumed version explicitly when the version cannot be determined' are opposite prescriptions separated only by a distinction (version outside the map versus no project in hand) that a reader must reconstruct from step 3."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-prompt-architecture/",
      "result": "The only check available to this subject is internal: the golden path, the nine-row section table in fixed-section-order.md, and the builder field list and auditor excerpt quoted in node--fixed-section-order.md were read against each other. That established the four disagreeing section counts (six asserted, nine tabled, nine assembled, seven audited), the reciprocal-output-field mismatch, and the omit-empty versus render-empty conflict. It did NOT establish which two sections the auditor omits - that is inference from the builder's field list - and no external source bears on any claim here, so none was consulted."
    }
  ],
  "documents": {
    "production-prompt-architecture.md": {
      "disposition": "clarify",
      "reason": "The reciprocal-output-field rule is stated over 'every required section' when only wiring has the mechanism and neither required section does. It also endorses the explicit-empty state section without reconciling it against the omit-empty rule it states two paragraphs earlier."
    },
    "techniques/fixed-section-order.md": {
      "disposition": "clarify",
      "reason": "Tables nine sections where the golden path says six and the worked auditor checks seven; the audit denominator needs to be the canonical set or the exclusions named. Its omit-empty-sections rule needs the state section's exception written into it. The order argument itself is sound and matches the implementation."
    },
    "techniques/scanned-project-state-do-not-recreate.md": {
      "disposition": "keep",
      "reason": "Scan-do-not-recall, structural classification, counts beside names, the explicit empty case, and above all the argument that the inventory and the instruction each fail alone are precise and mutually reinforcing. The scan-failed rule and the cached-inventory-needs-its-age rule are the kind of detail that only comes from having been burned."
    },
    "techniques/wiring-requirements-section.md": {
      "disposition": "clarify",
      "reason": "Chooses to omit an empty wiring section, which leaves the producer reading absence as 'no wiring needed'. Given the state technique's argument, say why wiring's absence is safely readable and the state section's is not. The four sub-prompts, the flag-what-you-cannot-author rule and the reciprocal output field are all sound."
    },
    "techniques/acceptance-criteria-appended-not-replaced.md": {
      "disposition": "keep",
      "reason": "The unseen-bar and silent-overwrite failures are both real and distinct, compose-in-item-form is the right level to state the fragility at, and the non-authoritative test - change the assembler and every stored verdict must be identical - is executable. Nothing here failed a check."
    },
    "techniques/version-keyed-engine-facts.md": {
      "disposition": "keep",
      "reason": "The wrong-claim-is-worse-than-a-missing-one argument, the no-exceptions stance, fail-loudly-on-unknown, and known-bad ranges rather than only floors are all correct. The unknown-versus-undeterminable pair reads as a contradiction on a skim but is genuinely distinguished in step 3."
    },
    "techniques/domain-scoped-knowledge-injection.md": {
      "disposition": "keep",
      "reason": "The untagged-is-universal tier is the load-bearing idea and the reason scoping is safe at all; the explicitly-empty-versus-absent-scope distinction, the route-as-one-bundle rule and the fallback-rate measurement are each the non-obvious half of their point. The double-sided test is correctly insisted on."
    },
    "applications/node--fixed-section-order.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-30, no commit pinned, nothing executed. Its recorded deviation - the audit is advisory and no bypass rate is aggregated - is correct and matches the golden path's standard. The seven-of-nine audit denominator is visible in its own excerpt and should be recorded as a second deviation."
    },
    "applications/process--acceptance-criteria-appended-not-replaced.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-20, checkout not made. Its deviation - append implemented by reparsing rendered text and stripping numbering - is exactly the fragility the technique's step 3 names, correctly identified and correctly refused as a lowering of the standard."
    }
  }
}
```
