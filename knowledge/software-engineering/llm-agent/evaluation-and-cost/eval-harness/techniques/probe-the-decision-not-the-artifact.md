---
layer: technique
type: technique
subject: eval-harness
technique: probe-the-decision-not-the-artifact
status: forged
laws: [gate-sees-target, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [every metric in a suite is a judge score because the output is prose, a suite is too expensive to run per change, a pipeline decision is suspected and only the final artifact is measured, deciding what to label when the output has no right answer]
---

# Probe the decision, not the artifact

A pipeline whose output is a document, a plan, or a report has no assertable
end state, so the suite reaches for a judge and every metric becomes an
opinion rescaled to look like a rate. Before accepting that, look **upstream**.

On the way to that artifact the pipeline made *decisions*: how wide to fan
out, which route to take, whether to ask before starting, which of three
strategies to apply. A decision has a small, enumerable answer space. A
decision with a labelled expected answer is an **assertion**.

The boundary against the neighbour, stated first, because the two are easy to
confuse. [Assertion vs judgment](./assertion-vs-judgment.md) chooses the
**instrument** for a property you have already decided to measure: can a
deterministic check catch this, or does it need a reading model? This
technique changes the **unit** — it says that when the artifact admits only a
judge, the artifact may be the wrong thing to be measuring, and a decision
upstream of it may be both more diagnostic and cheaper. The two compose: pick
the unit here, then pick the instrument there.

## What makes a decision probe-able

Three conditions, and the third is the one that is usually missing:

1. **The answer space is small and enumerable.** A width, a route, a boolean,
   a choice among named strategies. Not "the plan it wrote".
2. **A competent human can label it from the input alone.** If two reviewers
   disagree about the right fan-out for a task, there is no gold answer and
   this is a product policy nobody has written — which is a finding, but not
   a suite.
3. **The decision is observable in state, not merely inferable from the
   output.** The pipeline must leave a record: the tool call it emitted, the
   route it took, the field it set. Where it does not, **instrument it
   before writing the suite.** Adding the record is almost always cheaper
   than the judge you were about to build, and until it exists the "decision
   probe" is a second judge reading the artifact backwards.

## Three ways it is got wrong

Each of these has been observed in one harness, in one file, and each leaves
the suite green and meaningless rather than red.

**The probe reads a different instance than the label names.** The state a
finished run leaves behind holds *every* instance of a repeated decision — the
first fan-out, the second, the last. A dataset labelled for the first
decision, read off the last record, scores a question nobody asked and says
nothing about the swap. Name the index in the probe, and assert the record's
**position** as well as its value; a probe that cannot tell you which
occurrence it read is not measuring a decision, it is measuring a habit.

**The suite pays for the whole pipeline to observe a prefix.** The decision is
made at a known point; everything after it is spend with no bearing on the
label. Halt there — an interrupt at the node, a stub for the downstream stage,
a recorded run replayed to the decision point. A decision probe that executes
the full pipeline has thrown away the entire cheapness argument, and it will
be the first suite dropped the moment the budget tightens
([eval-economics](./eval-economics.md)) — which is the outcome this technique
was supposed to prevent.

**The decision score is treated as the optimized metric.** The right fan-out
can still produce a bad report, and a pipeline tuned to decide well and answer
badly will score perfectly here. A decision probe is a **threshold**, cleared
or not, and never the number the work exists to move
([metric-role-contract](./metric-role-contract.md),
[gate-sees-target](../../../../_laws.md#gate-sees-target)).

## What it buys

Two things the artifact-level suite cannot give at any price.

**A red case arrives pre-attributed.** [Failure
attribution](./failure-attribution.md) walks seven owners from the label down
to the model, most upstream first, because a wrong label looks like a model
defect further along. A decision probe sits above most of that chain by
construction: the input is the scenario, the output is one field, and the
layers between them are few enough to enumerate in the failure message.

**It converts a judged metric into an asserted one without changing the
instrument's quality bar.** The suite gets a number with a real denominator —
decisions correct over decisions labelled, reported with the population and
the decision it fired on
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
in a system whose every other metric is a reading model's five-point score
divided by five.

## Decision rules

- Before adding a judge, enumerate the decisions upstream of the artifact and
  ask which of them has a small answer space and a labellable gold value.
- Require an observable record of the decision. Where none exists, add the
  record first; do not infer the decision from the output.
- Name the occurrence the label refers to, and assert position as well as
  value.
- Execute the shortest prefix that produces the decision. If the suite runs
  the full pipeline, it has no cost advantage and its case for existing is
  gone.
- Keep the decision score a threshold. Never optimize it, and never report it
  beside outcome scores without saying which is which.
