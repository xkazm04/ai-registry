---
layer: technique
type: technique
subject: fleet-orchestration
technique: coordination-failure-triage
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a multi-agent run failed and the fix is being chosen, deciding whether to redesign topology or briefs, auditing a batch of failed traces, budgeting design effort between specification, coordination and verification, a proposed fix adds more agents or more rounds]
---

# Coordination failure triage

When a multi-agent run fails, the instinct is to fix the *coordination* —
more rounds, another agent, a smarter topology — because coordination is the
part that looks like the system. The measured record says the instinct
misallocates. The largest annotated corpus of multi-agent failures to date
(1,600+ traces across seven frameworks, taxonomy built on 150
expert-annotated traces at kappa 0.88) sorts every failure into three
classes, and the shares are the point:

| Class | Share | What it actually is |
| --- | --- | --- |
| **Specification** | ~42% | the brief was violated or under-written: task requirements not followed, steps repeated, termination conditions unknown to the agent, context lost |
| **Inter-agent misalignment** | ~37% | the conversation failed: clarification never sought, task derailed, reasoning-action mismatch, input ignored |
| **Verification** | ~21% | the check failed: premature termination, no or incomplete verification, verification that approves wrong work |

Two readings matter more than the tabulated modes:

- **Well over half of "coordination" failures are not coordination.** The
  specification class is the dispatcher's brief being wrong or unenforced,
  and the largest single modes in the misalignment class — a member
  repeating steps, a member whose stated reasoning and emitted action
  disagree — are *single-agent* defects that surface as system failures.
  Fixing the wiring cannot fix them.
- **The cheap interventions are at the edges, and they were measured.** In
  the same study, rewriting role specifications alone bought +9.4 points of
  success on an unchanged system; adding a task-objective verification
  layer over the existing code checks bought +15.6. Both are brief-and-gate
  work, not topology work — and both left the system far from reliable,
  which is the third reading: a taxonomy diagnoses, it does not cure.

## Procedure

1. **Classify before you fix.** Take the failed traces and label each
   against the closed taxonomy — specification / misalignment /
   verification, then the mode. The label set is small enough that an
   agent judge can do the bulk pass with human spot-checks — **but only on
   the symptom axis.** Measured on one corpus of developer-reported agent
   failures, the same judging agent with the same tools labelled the
   observable *effect* at roughly 0.86–0.90 F1 and the *root cause* at
   roughly 0.45–0.57 on the same artifacts, and agreed with human
   annotators on 39% of held-out items from title and body alone. What a
   machine can read off a failure is what it looked like; what it cannot
   read off is why it happened — and the cause axis is the one that routes
   the fix. So automate the effect pass, keep cause attribution human, and
   treat a cause distribution built by a judge as unlabelled data.

The hazard is wider than an agent judge. A distribution produced by *any*
unvalidated classifier is unlabelled data — a supervised model fine-tuned on a
neighbouring domain and applied here without a reported accuracy, a topic model
whose clusters were confirmed by an unquantified "manual inspection", a
heuristic over metadata. A large corpus makes this harder to see rather than
easier, because the scale reads as rigour: one published study classified more
than forty thousand artifacts this way, reported no classifier accuracy, no
annotator count and no agreement statistic, and its taxonomy was quoted as a
field-wide finding. **Ask what validated the labels, never how many there
are.** The
   discipline is that the *distribution* is computed before any redesign is
   argued,
   because a fix chosen from the most recent failure optimises an anecdote
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
   "our runs fail on coordination" means nothing without the denominator).
2. **Route by class.**
   - Specification-heavy: the fix is the brief — restate invariants,
     termination conditions, and done criteria in the dispatch itself (the
     brief inventory in
     [brief-carries-the-session](./brief-carries-the-session.md), the
     task-envelope discipline one subject over).
   - Misalignment-heavy: check the members before the wiring. Step
     repetition and reasoning-action mismatch are member-level; genuine
     protocol failures (clarification never sought, results withheld)
     get a protocol — a mandatory ask-or-assume declaration in the
     handoff, not another agent.
   - Verification-heavy: the gate is missing, self-certifying, or reading
     the wrong artifact
     ([gate-sees-target](../../../../_laws.md#gate-sees-target)). Add the
     objective-level check before tuning anything upstream, because a
     system whose verifier approves wrong work converts every upstream
     improvement into confidently shipped failure.
3. **Re-measure on the same distribution.** An intervention gets the
   before/after on the same task set, and the honest expectation is
   single-digit-to-teens gains — the measured ceiling of one-class fixes.
   A redesign justified by "it should fix most failures" is claiming three
   classes at once and has the burden of showing it.

## Decision rules

- **When the proposed fix adds an agent or a round, require the class
  distribution first.** More coordination is a treatment for a minority
  class, prescribed for the majority by default.
- **When failures cluster in one framework but not another, suspect the
  harness's conversation plumbing** (resets, context loss) before the
  agents — two of the taxonomy's modes are infrastructure wearing an agent
  costume.
- **When the verifier exists and failures persist, audit what it reads.**
  "No verification" and "wrong verification" measured within a few points
  of each other; the second is worse, because it converts failure into
  false success at the system boundary.
- **When the distribution is flat across all three classes, the system is
  under-specified everywhere** — treat it as specification-first anyway,
  because the brief is the cheapest surface and the other two classes
  inherit from it.

## What this does not settle

The taxonomy is descriptive of current frameworks on current tasks; its
shares will drift as harnesses fix their plumbing, and per-system
distributions differ enough that the published aggregate is a prior, not
your measurement.

**The reason a pooled distribution misleads is composition, not variance, and
that makes the corrective constructive rather than cautionary.** Pool failures
across N systems without a per-system cap and the result describes whichever
system reports most; impose a cap and the result describes the cap. Both
failures have been observed in published corpora — one where a hard cap per
project manufactured uniformity across frameworks of wildly different size, and
one uncapped where two repositories of eight supplied three quarters of the
population and the pooled taxonomy's largest category turned out to be one of
those two repositories' label vocabulary. So **publish per-system distributions
and let the reader pool**, with the per-system denominators beside them. An
aggregate with no composition table cannot be checked and cannot be reused. The technique's claim survives that drift: classify
against a closed taxonomy first, fix the dominant class, and expect
verification and specification — the unglamorous ends — to dominate.
