---
domain: grant-funding
subject: proposal-quality-review
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# proposal-quality-review

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/proposal-quality-review",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f9e854788bb50952",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A 601-word answer violates a hard 600-word portal cap even though it fits a widened editorial band.",
    "A revision removes a leading heading but adds an unsupported percentage; nonempty output is not repaired output.",
    "Two reviewers both read requested before either writes in_review; separate checks alone do not prevent double claim.",
    "The displayed regex flags Chapter XX and [Smith, 2024], but misses an explicit placeholder longer than forty characters."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/proposal-quality-review",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "path": ".bench/e10-probe.mjs",
      "scope": "Local dependency-free reproduction of the two regexes displayed in the application; results true, true, false for Roman XX, legitimate citation and long slot. Not a consumer implementation test."
    }
  ],
  "documents": {
    "proposal-quality-review.md": {
      "disposition": "reverify",
      "reason": "Deterministic checks can be incomplete or heuristic, have compute cost, and depend on policy version and context. Keyword presence does not establish engagement and numerical echo does not establish grounding. Severity depends on stage and actual call constraints; zero critical failures with skipped checks is incomplete. Expert judgment is not infallible and model assistance is not categorically impossible."
    },
    "techniques/critical-vs-quality-severity.md": {
      "disposition": "clarify",
      "reason": "Repaired immutable gate severity contradiction, stage-specific placeholders, binding length caps versus targets, detector uncertainty and incomplete coverage. Green is a scoped check result rather than filing authorization."
    },
    "techniques/expert-review-tier-operation.md": {
      "disposition": "clarify",
      "reason": "Repaired roster versus real capacity, atomic claim/cancel races, revision binding, paid-request recovery and overly absolute refund/earned-fee policy. Review completion does not permanently bar review of a revised draft."
    },
    "techniques/placeholder-and-jargon-detection.md": {
      "disposition": "reverify",
      "reason": "Short Latin label patterns miss long or non-Latin placeholders and flag legitimate bracket citations. Non-letter X guards still flag standalone Roman XX. A slot represents missing data rather than satisfying substantive quantification; supported autofill can propose a resolution for approval. Contextual jargon can be valid."
    },
    "techniques/revise-to-green-single-pass.md": {
      "disposition": "clarify",
      "reason": "Repaired mandatory recheck of revised text, retained-original safety state, no guaranteed repair or majority-conversion claim, grounding and source revision binding. One pass is a budget policy rather than an empirically universal optimum."
    },
    "techniques/rubric-mirrors-prompt-guidance.md": {
      "disposition": "reverify",
      "reason": "Shared requirements should derive from the actual call; agreement between prompt and critic can preserve the same mistake. Independent factual checks are valuable. Keyword presence is not semantic engagement, generic defaults cannot certify unknown sections, and hard caps must never be widened. Human authors are subject to the same binding requirements."
    },
    "techniques/section-word-band-checks.md": {
      "disposition": "reverify",
      "reason": "Word bands are editorial defaults, not universal evidence about reviewer tolerance. A forty-word answer can satisfy a short question; optional empty sections are not necessarily missing. Measure the actual portal unit and counting rules, and never widen hard caps. Logic models have different valid structures and length alone cannot determine development."
    },
    "applications/node--placeholder-and-jargon-detection.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Local reproduction of displayed regexes confirms Chapter XX and [Smith, 2024] flag while a long explicit fill-in slot does not. Named optional coverage flags do not prove all applicable checks exist or ran. Placeholder errors here reflect submission stage, contradicting fixed-severity doctrine."
    },
    "applications/node--revise-to-green-single-pass.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Displayed loop does not establish that replacement was rechecked before return. Whole prompt grounding can include untrusted text and unrelated matching numbers; exempt 0%/100% can be factual fabrications. Numeric presence is not claim entailment, and a nonempty revision may introduce worse failures."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

All nine documents read at reverted bytes. **I retract the preceding record's
per-document reasons** as an assessment of these bytes; they grade a rewrite that was
reverted on 2026-09-10.

The subject's spine - split the mechanical from the judgmental, automate only the
first, staff the second, and be honest about the boundary - is correct and is followed
consistently down into every technique. The two-severity rule with green defined as
zero criticals, the single-pass revision contract with fail-open-to-original, and the
dormant-when-unstaffed rule for the paid tier are each argued from a specific failure
they prevent.

Three findings. First, the severity model does not survive contact with its own
product. `critical-vs-quality-severity` closes with "Do not add a third severity ...
every added level blurs the one boundary that matters," and
`placeholder-and-jargon-detection` places fill-in slots at "quality flag during
drafting, hard blocker only at the submission gate." But
`node--placeholder-and-jargon-detection` documents a second reviewing surface - the
proofreader - running its own scale (`error` for fill-in slots and sloppy markers,
`info` for vague filler), which is both a third vocabulary and an assignment that
contradicts the technique's own ruling on the same finding. Either the proofreader's
scale is a permitted second axis that the technique should name, or the two surfaces
disagree about whether an honest bracket blocks. The subject cannot leave that open,
because the same document family insists two reviewing surfaces must not maintain
divergent tables. Second, `revise-to-green-single-pass` names the fabrication pressure
in its own loop ("grounding that genuinely contains no usable figure, where inventing
one to satisfy a quantification gate would violate never-fabricate-a-figure") and then
prescribes a revision prompt that says "rewrite the section so it passes every check
above." The countervailing mirror rule - that a bracketed slot satisfies the
quantification gate - lives in the gate library, not in the revision prompt, so the
model is told to pass a gate without being told the honest way to pass it. One clause
in the prompt contract would close it. Third, `expert-review-tier-operation`'s state
machine has no exit from `in_review` except `complete`: cancel is closed after claim,
there is no timeout, expiry, release or re-queue, and the fee is earned at claim. A
reviewer who claims and then abandons leaves the request permanently stuck with the
money taken - which is a variant of the very failure the tier's foundational rule
exists to prevent.

Nothing was executed; the cited repo (`grant-writing-nonprofits`) is absent from this
machine, so both applications' line-number and code citations are unverified rather
than confirmed. This subject asserts no dated external facts, so no primary-source
check was owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/proposal-quality-review",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:388163d9f6095a1e",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at reverted bytes and cross-read for rule conflicts across the severity model, the revision contract and the two reviewing surfaces. NOT evaluated: the grant-writing-nonprofits repo (absent from this machine), so all code, line and severity-constant citations are unverified; no gate library run, no draft graded, no false-positive rate measured; no maturity or verified_on change. This subject asserts no dated external facts, so no primary-source check was owed.",
  "counterexamples": [
    "A reviewer claims a paid review and never completes it: cancel is closed after claim, the fee is earned at claim, and the state machine offers no timeout, release or re-queue - the request sits in in_review forever with the money taken.",
    "A generated section fails only quality gates but runs 2,400 words against a 300-750 band; green means zero criticals, so it ships, and the funder's hard cap is deferred to a submission gate that by rule never blocks on a length finding.",
    "A revision fired by a failed quantification gate is told to 'pass every check above' with no statement that a bracketed slot satisfies it; the honest resolution lives in the gate library the model never sees.",
    "A section can sit dead-centre in its band, name every required concept as a keyword, carry no placeholder and no ungrounded percentage, and still be a fluent paraphrase of the RFP that says nothing - which the subject concedes is the human tier's job, but which means a fully green report bounds shape only."
  ],
  "sources": [
    {"path": "knowledge/grant-funding/proposal-craft/proposal-quality-review", "result": "All 9 documents read at reverted bytes and cross-checked against each other; the severity conflict, the revision-prompt gap and the missing in_review exit were derived by reading each technique against its own application. No code executed, referenced repo unavailable."}
  ],
  "documents": {
    "proposal-quality-review.md": {"disposition": "keep", "reason": "The mechanical/judgmental split, the gate families, one-gate-library-two-consumers, the rubric-mirrors-the-prompt principle, the bounded feedback loop, and the two honesty rules (coverage reporting, and shape-not-persuasion) are all correct and are exactly the frame the techniques implement. Its failure-mode list names specific defects with mechanisms rather than generic risks."},
    "techniques/critical-vs-quality-severity.md": {"disposition": "clarify", "reason": "Green-means-zero-criticals and severity-as-a-property-of-the-gate are right, and 'when torn, choose quality' is argued correctly from asymmetric costs. What it does not handle is its own product: the parallel proofreading surface runs a three-level error/info scale and rates fill-in slots error, contradicting both the no-third-severity rule and this document's own ruling that an honest bracket is a quality flag at review time. Say how a second reviewing surface's scale maps onto these two severities."},
    "techniques/expert-review-tier-operation.md": {"disposition": "clarify", "reason": "Dormant-when-unstaffed, one-active-review-per-draft, refund-the-receipt-not-the-list-price, idempotent charge/refund by reference, and charge-before-enqueue are all correct and each closes a real hole. The gap is the state machine's dead end: in_review has no exit but complete - no timeout, release, re-queue or admin path - so an abandoned claim strands the request with the fee earned."},
    "techniques/placeholder-and-jargon-detection.md": {"disposition": "clarify", "reason": "The three-family split with different intents, messages and severities is the correct insight, and the mirror rule (a quantification check must count a bracketed slot as satisfying it) is the single most important sentence in the subject. But its severity assignment for family 1 - quality during drafting, blocker only at submission - is contradicted by the proofreading surface its own application documents, where fill-in slots are error. Reconcile, or state that the two surfaces answer different questions."},
    "techniques/revise-to-green-single-pass.md": {"disposition": "clarify", "reason": "The four clauses are right and the argument for exactly one pass (collapsing marginal conversion, hidden structural signal, drift from grounding per round-trip) is the strongest version of that case. The defect is in clause 3: the prompt is instructed to 'pass every check above' while the honest way to pass a quantification gate - emit a bracketed slot - is enforced only in the gate library the model never sees. Put the mirror rule in the revision prompt contract."},
    "techniques/rubric-mirrors-prompt-guidance.md": {"disposition": "keep", "reason": "The two-defect argument for maintaining rubric and instruction as one standard is correct, the per-section per-family mirror plus a universal floor is the right decomposition, shallow-concept-checks-are-deliberately-shallow is honest about depth, and the sanctioned asymmetry (widen the band, steer with the target) is stated as the single exception rather than left implicit."},
    "techniques/section-word-band-checks.md": {"disposition": "keep", "reason": "Bands as a development-state proxy rather than a quality proxy, per-funder-family bounds as data, the two-tolerances rule, empty-is-not-short, report-the-measurement, and one shared word counter are all correct. The drift example (a generic 80-1000 proofreader window predating the per-section table) is the kind of concrete incident that earns the rule."},
    "applications/node--placeholder-and-jargon-detection.md": {"disposition": "clarify", "reason": "Valuable for preserving two real detector scars (the character class that let '[Insert outcome (e.g., 412 students)]' pass as clean; the non-letter lookarounds that fire on 20XX but not XXL) and for showing the coverage-honest verdict that refuses a Clean stamp when a check skipped. It documents fill-in slots at error severity on a three-level scale without noting the conflict with the two-severity technique - which is where the reconciliation should be recorded. Repo unavailable this run, so line citations are unverified."},
    "applications/node--revise-to-green-single-pass.md": {"disposition": "keep", "reason": "A faithful realization: green computed as zero critical failures, buildRevisePrompt as a pure function, the contract's three clauses visible line-for-line in the loop body, per-site concerns pushed to callbacks, and the observed drift (report and need-statement routes previously ungraded) recorded as the reason the loop was consolidated. It also confirms the grounding gate rides into the revision path, which is the composition the subject claims."}
  }
}
```
