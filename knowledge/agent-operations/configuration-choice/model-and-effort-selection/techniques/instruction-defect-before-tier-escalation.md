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

Hold the task fixed. Vary two things independently — the reasoning tier, and the engine
(a family's release as run in a given harness) — and lay the failures side by side. Check
first that each run executed the configuration its cell names; an unpinned value makes
two cells the same cell
([pin-the-resolved-configuration](pin-the-resolved-configuration.md)).

- **Identical failure across tiers and across families** → the instruction is the first
  suspect, not yet the verdict. Every run read the same text the same way. But the runs
  also shared the environment, often the harness, and much of what the models know.
  Frontier models' errors are strongly correlated, more so the stronger they are, and
  benchmark audits have found tasks that every agent failed for want of the same knowledge,
  not because of the wording. Confirm with a **perturbation**: state the misread step
  differently and rerun two configurations. If the failure moves, fix the text. If it
  holds, clear the environment and the harness before blaming either the wording or the
  models. Read one transcript either way, because a tool error and a misreading can end
  in the same output.
- **Failure at the lower tier, correct at the higher, same family** → a deliberation
  difference. The tier is a legitimate lever; weigh it against its cost.
- **Failure in one engine, correct in another, at the same tier** → a behaviour
  difference in what the engine treats as authoritative. It belongs to the release, the
  harness and the wording together, not to the family name. Whether escalating the
  losing engine closes it is a measurement, not a given: on published
  instruction-conflict tests, higher effort helped one family a great deal and made
  another worse before it recovered. Measure the losing engine at two levels before
  writing escalation off, or recommending it.
- **Correct at the higher tier in one family only, and the same task is wrong everywhere
  else** → the instruction is defective *and* one configuration happened to route around
  it. Fix the instruction; do not promote the lucky configuration into a default, because
  what it routed around is still there for every other case.

## Decision rules

- **A defect reproduced by every configuration is never escalated.** Once a rewording
  has moved it, it is written up as a finding against the instruction, with the exact
  wording that misleads and the exact behaviour it produced, so the fix is a text edit and
  not a procurement decision. One that survives the rewording is written up against what
  the runs shared, and escalation is still not the remedy.
- **Wording does not buy obedience either.** Telling a run explicitly not to take a
  shortcut has been measured to barely move how often it takes one. Where the
  misbehaviour is a shortcut rather than a misreading, the remedy is a mechanical check the
  run cannot pass by taking it, not a sharper sentence or a higher tier.
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
