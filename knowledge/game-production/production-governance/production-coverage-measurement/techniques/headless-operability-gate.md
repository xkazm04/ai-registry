---
layer: technique
type: technique
subject: production-coverage-measurement
technique: headless-operability-gate
status: forged
laws: [no-gate-self-certifies, compiling-is-not-wiring, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding whether a pipeline step may claim the top readiness rungs, a step only works with an operator present, auditing which of a pipeline's steps can actually be scheduled]
---

# Headless operability gate

A production step that only works with a human at the keyboard is not a production step —
it is a demo. This technique makes that a **reported property of every step**, audited
rather than assumed, and makes it a precondition for the gate-proven rungs of the
readiness ladder.

## Why it is a rung condition and not a nice-to-have

The gate-proven rungs claim something specific: *a real quality gate passed*. A gate that
required someone to open a window and click through a session did not prove a repeatable
property of the pipeline; it proved that on one afternoon, one person got a good result.
That claim cannot be re-run on demand, cannot be scheduled, cannot be regression-tested
when a dependency moves, and cannot be reproduced by whoever inherits the project.

So the rule is: **an item may reach the gate-proven rungs only if its step is proven
machine-operable without an interactive session.** Everything below those rungs is
unaffected — a hand-driven step can absolutely be drafted or reviewed. The gate bites
exactly where the claim gets strong.

## Procedure

1. **Define operability concretely** for your stack: the step can be invoked, run to
   completion and have its result read back by an automated caller with no interactive
   session, no window open and no manual step.
2. **Audit it by running it**, one step at a time, through the automated path. Record the
   result — step address, operable yes/no, when the audit ran, and through which path.
   This is an audited fact, not a declaration; the whole point is that the step does not
   get to self-certify.
3. **Consult the record when grading.** A would-be gate-proven item whose step has no
   coverage entry, or an entry saying not operable, is **demoted one rung** to the honest
   ceiling for a claim the machine cannot reproduce. All other rungs pass through
   unchanged.
4. **Prefix the reason.** The demoted item's rationale begins with the demotion — *not
   machine-operable* — and preserves whatever reason it already carried. A cell that
   silently comes back a rung lower teaches readers to distrust the board.
5. **Report the share.** Publish the proportion of steps proven operable as a headline
   figure in its own right, and count the unaudited ones as their own band rather than
   folding them either way.

## Decision rules

- **When a step is undeclared, read it as not operable.** Absence of an audit is not a
  pass. A step nobody has tried through the automated path and a step proven to work
  through it are different states and must be different values.
- **When demoting, demote — do not fail.** The item still has whatever evidence it earned;
  it simply cannot claim the reproducible-gate rung. Turning a non-operable step red
  destroys the information that the work exists and is good.
- **When the audit record is stale, treat it as an audited fact that can drift.** It was
  recorded against a specific set of tools and addresses; re-run it on the same schedule
  as any other environment fact.
- **When a step is genuinely interactive by nature, record it as such with a reason.** Some
  steps really do need a human — a final art direction call, a legal sign-off. The
  property is still reported; what changes is that the ceiling is accepted rather than
  treated as a defect. What must never happen is the step going unlabelled and quietly
  inheriting an operable-looking grade.
- **When adding a new step, require the operability declaration at authoring time.** A
  property retrofitted across three hundred steps is a project; a property required at
  authoring time is a field.

## The wider principle

Machine-operability is the production-line form of the rule that an artifact which builds
but was never granted, registered or triggered is not done. In both cases the seductive
evidence is *it worked in the room where it was made*, and in both cases the honest
question is whether anything outside that room can make it happen again. A pipeline whose
operable share is two fifths is in a completely different position from one at nineteen
twentieths, and the difference is invisible unless the report has a column for it.

## When not to use it

- **As a quality measure.** Operability says a step can be run unattended; it says nothing
  about whether what comes out is any good. A fully operable step producing placeholder
  work is exactly the high-readiness, low-craft state the two-axis model exists to
  express.
- **On exploratory or research work.** A prototype's job is to answer a question, not to
  be schedulable. Gate the production line, not the sketchpad.
- **Where the automated path does not exist yet.** Auditing every step against a path
  nobody has built produces a uniformly red column that tells you one thing you already
  knew. Build the path, then audit.
