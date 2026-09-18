---
layer: technique
type: technique
subject: model-and-effort-selection
technique: instruction-defect-before-tier-escalation
status: draft
laws: [measure-the-tree-not-the-summary]
shared_with: []
use_when: [a task fails and the instinct is to rerun it with more reasoning, triaging repeated failures of one task across a fleet, deciding whether to fix a task's wording or its configuration]
---

# Instruction defect before tier escalation

The concern: when an unattended task produces a wrong result, the cheapest-looking remedy
is to rerun it with more reasoning. That remedy is correct only when the failure came from
insufficient deliberation. When the failure came from the instruction — a step ordered
wrongly, a case the wording never covers, a rule stated in one place and contradicted in
another — escalation produces the same wrong answer, slower, and now with the authority of
the strongest configuration behind it. **Diagnose which kind of failure it is before
spending a tier on it.**

## The diagnostic

Hold the task fixed. Vary two things independently — the reasoning tier, and the vendor
family — and lay the failures side by side.

- **Identical failure across tiers and across families** → the instruction is the defect.
  Every model read the same text the same way; that is what a wording defect looks like
  from the outside. Fix the text.
- **Failure at the lower tier, correct at the higher, same family** → a deliberation
  difference. The tier is a legitimate lever; weigh it against its cost.
- **Failure in one family, correct in another, at the same tier** → a family behaviour
  difference, not an effort problem. Escalating the losing family usually does not close
  it, because it is a difference in what the model treats as authoritative, not in how
  hard it thinks.
- **Correct at the higher tier in one family only, and the same task is wrong everywhere
  else** → the instruction is defective *and* one configuration happened to route around
  it. Fix the instruction; do not promote the lucky configuration into a default, because
  what it routed around is still there for every other case.

## Decision rules

- **A defect reproduced by every configuration is never escalated.** It is written up as a
  finding against the instruction, with the exact wording that misleads and the exact
  behaviour it produced, so the fix is a text edit and not a procurement decision.
- **The instruction owns the missing case.** Where a procedure covers one branch and is
  silent on its opposite, both readings are defensible and models will split between them.
  Silence is the defect; the split is the symptom. State the missing branch explicitly.
- **Where a task's own instruction and the repository's declared checks disagree, the task
  is wrong** — a task that tells a run to do its own abbreviated version of the checks a
  repository already declares will produce confident wrong verdicts from every model that
  follows it faithfully.
- **Record the diagnosis with the evidence, not the conclusion alone.** "All four
  configurations ordered the steps the way the instruction lists them, and the environment
  step is listed last" is a fix request. "Models get this wrong" is a complaint.

## Why this ordering matters economically

Escalation is the expensive remedy: it multiplies wall-clock and allowance across every
future run of that task, forever, to work around a defect that one edit removes. It is also
the remedy that hides the evidence — once the fleet only runs its strongest configuration,
the side-by-side that would have exposed the wording defect no longer exists.
