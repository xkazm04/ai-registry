---
layer: application
type: application
subject: eval-harness
technique: probe-the-decision-not-the-artifact
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.11
applied: simulation
ab_verdict: better
proof: structural-only
---

# The right idea, implemented three ways wrong, which is why it is legible

An open-source deep-research agent carries two evaluation suites. The main one
is artifact-level and thorough: six judges over a benchmark of expert-authored
research tasks, each returning a five-point score rescaled to a rate, plus a
comparative harness that ranks two or three implementations head to head with
order randomization on. It is the shape a report-producing pipeline reaches for
by default, and it is expensive - the project's own warning puts a full sweep
at tens to low hundreds of dollars, and its published results table records
runs of 58 to 207 million tokens.

Beside it sits a second file, sixty lines long, that does something else
entirely: it runs the pipeline against a small labelled dataset and scores one
boolean per case - **did the supervisor fan out to the width this case was
labelled for?** No judge, no report, no rubric. A decision with a gold answer.

That file is the technique. It is also the clearest available demonstration of
each of the three ways the technique goes wrong, because it commits all three,
read against the version witness of the tree itself - the runtime the project
declares in its graph configuration.

## It reads a different occurrence than the label names

The dataset is named for the **first** supervisor decision. The evaluator
reaches into the finished run's state and reads the tool calls on the **last**
supervisor message. On any case where the supervisor iterated - which is most
of them, the loop is bounded at six iterations - those are different decisions,
and the score is a fact about a fan-out nobody labelled.

Nothing catches it, because both readings are valid state and the assertion
compares two integers. This is why the technique asks a probe to assert
position as well as value: a probe that cannot say *which* occurrence it read
cannot be checked against the dataset that named one.

## It pays for the pipeline to observe a prefix

The target function invokes the whole compiled graph - supervisor, every
parallel sub-researcher, the per-researcher compression step, and the final
report generation - and then inspects state for a decision made in the first
supervisor turn. Every token after that turn is spend with no bearing on the
label.

The framework it is built on supports interrupting at a node, and the run
already uses a checkpointer, so halting at the decision point is available and
unused. As written, the cheap suite costs what the expensive suite costs, and
its whole argument for existing is gone. A suite in that state is the first one
dropped when a budget tightens - which is the outcome the technique exists to
prevent, arrived at from the other direction.

## The third one it gets right, by accident of scope

The decision score is not reported beside the artifact scores and is not
optimized. Nothing in the tree treats fan-out correctness as the number the
work exists to move. This is the one requirement met, and it is met because the
file is separate and unfinished rather than because anyone drew the boundary.

## Why the failing implementation is worth more than a working one

A correct decision probe would have shown that the shape exists. This one shows
where it breaks: the label and the probe can disagree silently, the cost
argument evaporates unless the prefix is actually cut, and both failures leave
the suite green. All three are cheap to check in review and none is visible in
a passing run.

## What this realization cannot do

There is no measurement here - no reported score for the decision suite, and
the file's own comparative harness is left commented out. The technique's claim
that a decision probe arrives pre-attributed is argued from the structure, not
demonstrated: this tree never ran the probe to a number anyone published.
