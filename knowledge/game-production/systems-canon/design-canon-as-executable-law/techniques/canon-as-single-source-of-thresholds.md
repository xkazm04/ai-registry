---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: canon-as-single-source-of-thresholds
status: forged
laws: [law-and-check-share-one-source, one-authority-per-quantity]
shared_with: []
use_when: [standing up a design canon that checks will read, deciding where a threshold number lives, resolving a disagreement between a design doc and a validator]
---

# Canon as the single source of thresholds

The named concern: **where a number lives**. Not how it is enforced, not who wrote it —
where the one authoritative copy sits, and what relationship every other appearance of
that number has to it. Get this wrong and every downstream technique in the subject is
building on sand, because a derivative of two sources is not a derivative.

The rule is one sentence: **a threshold appears exactly once, in the body of the canon
rule that justifies it, in the sentence a human reads.** Every other appearance is
computed from that one at load time and is never written down.

## The three arrangements, and why two of them fail

**Prose plus a hardcoded checker.** Two copies, two editors, no view where they appear
together. Diverges on a timescale of weeks. This is the arrangement almost every studio
starts in, and the divergence is not detectable from either side — which is what makes
it dangerous rather than merely untidy.

**Prose plus a machine-readable sidecar.** A rule file that carries both a paragraph for
humans and a structured `threshold: 0.15` field for checkers. This looks like the fix and
is the same failure at closer range: two copies inside one file, edited by the same person
who will one day update the paragraph and not the field. It is *worse* than the first
arrangement in one respect — it looks single-sourced, so nobody audits it.

**Prose as the sole source, thresholds extracted.** The paragraph carries the number in
its unit; a parse layer reads it out at load; every checker imports the parsed value. One
copy, one editor, and a mechanical relationship between the sentence and the enforcement.
This is the arrangement to build.

The objection is always the same: parsing prose is brittle. Yes — and that brittleness is
the feature. A canon edit that breaks the parse is a loud failure at load, in front of the
person who just made the edit, and it costs them ten minutes. A canon edit that silently
fails to reach the checker costs a season of content graded against a rule nobody wrote.

## Procedure

1. **Inventory every threshold currently enforced anywhere.** Bands, caps, floors, ratios,
   growth rates, tolerances. For each, find every place it is written: the design document,
   the validator, the tuning spreadsheet, the generation prompt, the reviewer's checklist.
   Expect three to five copies per number and expect at least one pair to disagree.
2. **For each threshold, name its owning rule.** If no rule in the corpus states it in
   prose, the number has no justification and that is the finding — write the rule first,
   with the reasoning, then the number.
3. **Reconcile the disagreements as design decisions, not merge conflicts.** Which copy is
   right is a question for whoever owns the system, and the answer goes into the rule body
   with its reasoning.
4. **Build one parse layer** that reads thresholds out of rule bodies and exports them as
   named constants. One module. Every checker imports from it.
5. **Delete the other copies.** All of them. A commented-out literal beside the imported
   constant will be uncommented in an emergency at two in the morning.
6. **Add a test that the parse still resolves** for every threshold, so the coupling is
   visible in the test suite and not only at runtime.

## Decision rules

- **When a number appears in two places, one of them is wrong — decide which before you
  automate anything.** Automating over an unreconciled pair encodes the disagreement.
- **When a threshold has no prose rule, write the rule before the check.** A number with no
  justification cannot be argued with, so it will be argued around.
- **When a checker needs a number the canon does not state, do not add a parameter — amend
  the canon.** The pressure to parameterize is the pressure to grow a second bible.
- **When two subsystems need the same quantity, they import the same parsed constant.**
  Not the same regular expression applied twice. One reading, one authority; a second
  extraction of the same rule body is a second implementation of the same quantity and
  will diverge in exactly the cases prose is awkward in.
- **When a rule's number is genuinely context-dependent, the context belongs in the rule.**
  A band that differs by content class is one rule that names both classes, not two
  thresholds in two checkers.
- **When someone wants an exception, it goes in the rule body.** A sanctioned exception
  written into the law is law. A special case written into the checker is drift.

## What lives in the canon and what does not

Not every number belongs here. The test is whether the number is a **design decision**
that content is graded against, or an **implementation constant**.

| Belongs in canon | Does not |
| --- | --- |
| the tolerance band a payout must sit inside | the floating-point epsilon a comparison uses |
| the cap a resistance value may not exceed | a retry count in the tool that runs the check |
| the growth rate a progression curve must follow | the page size of a batch query |
| the maximum duration a control effect may last | a cache expiry |
| the ratio between an item's cost and its power | a rendering tolerance for a preview |

The distinction is arguability. If a designer could reasonably want the number changed and
would expect content to change with it, it is canon. If changing it only affects whether
the tool works, it is a constant. When in doubt, ask who would be angry if it changed
silently — a designer means canon, an engineer means constant.

## When not to use this

- **A corpus of under about a dozen rules with one enforcer.** The full apparatus costs
  more than it returns; a single well-reviewed constants module with the rule quoted in a
  comment above each value is honest and sufficient. Adopt this technique when a second
  consumer of the same number appears, which is the moment drift becomes possible.
- **Thresholds that change per run rather than per design decision.** A tuning sweep that
  explores a band is not governed by the band; it is exploring it. Sweep parameters are
  inputs, not canon, and forcing them through the canon makes the canon a configuration
  file.
- **Numbers derived from measurement rather than decided.** A performance budget set by
  profiling a target device is measured, and its authority is the measurement. Record the
  measurement and its conditions; the canon rule states the policy ("stay within the
  measured per-class budget"), not the current number.
- **During a live incident.** If content is broken and the fix is a threshold change, make
  the change and file the canon amendment behind it. The technique is a discipline for
  steady state; treating it as a gate during an outage teaches people to route around it.
