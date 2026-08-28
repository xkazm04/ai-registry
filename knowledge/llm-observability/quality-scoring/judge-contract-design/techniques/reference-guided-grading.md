---
layer: technique
type: technique
subject: judge-contract-design
technique: reference-guided-grading
status: forged
laws: [the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [a dimension grades solution correctness the judge could derive itself, a judge misgrades reasoning it can perform standalone, a correctness check is verifiable but not mechanical]
---

# Reference-guided grading

The concern: judges systematically misgrade reasoning they can perform
correctly on their own. Asked to *solve* a problem, the model gets it
right; asked to *grade* a candidate's solution to the same problem, it is
pulled toward the candidate's framing and blesses confident wrong answers.
The founding judge-measurement study quantified the gap on its
math-grading protocol: the default grading contract misgraded most cases;
instructing the judge to reason step-by-step cut the failures by half; and
having the judge **derive its own solution first, then grade against it**
cut them to a small fraction of the default. The mechanism, not the
instruction, is what moved the number.

## The shape

Split the judged dimension into two stages inside one contract:

1. **Reference stage.** The judge receives the input alone — not the
   candidate — and produces its own solution. Withholding the candidate is
   the point: a reference derived with the candidate in view inherits the
   candidate's framing, which is the bias this technique exists to break.
2. **Grading stage.** The judge receives input, candidate, and its own
   reference, and scores the candidate against the dimension's anchors,
   using the reference as the yardstick for factual or computational
   agreement.

## Decision rules

- **Reserve it for derivable answers.** The technique applies when the
  input determines a checkable answer the judge can reconstruct — a
  computation, an extraction, a transformation with a right result that is
  nonetheless too open-ended for a mechanical check. When the check *is*
  mechanically decidable, type it as a mechanical kind and make no model
  call; when the dimension is preference-shaped, a reference is
  meaningless.
- **The reference is scratch, never truth.** It is the judge's working
  material for one verdict. It is not stored as ground truth, not reused
  across candidates for consistency's sake (staleness would masquerade as
  stability), and never surfaces as "the correct answer" in any operator
  view — the judge is under test, and so is its reference.
- **A wrong reference grades wrongly — measure that.** The failure mode
  this introduces is inherited error: where the judge's own solution is
  wrong, the grade follows it. Calibration must therefore spot-check
  reference correctness as its own stratum, and a dimension whose
  references fail often is a dimension this technique cannot carry.
- **Budget for the second stage.** The reference roughly doubles the
  dimension's judge spend. The apparatus is unbudgeted by policy, but the
  spend still concentrates where it pays: gating-relevant correctness
  dimensions first, cosmetic dimensions never.

## When not to use it

Subjective dimensions (tone, helpfulness, style) — there is no reference
to derive, and pretending otherwise laminates the judge's taste into a
fake yardstick. Pairwise preference contracts — position counterbalancing,
not references, is their instrument. And any dimension already typed
mechanical: a reference the size of a regex should be a regex.
