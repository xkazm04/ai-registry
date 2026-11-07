---
layer: technique
type: technique
subject: eval-harness
technique: contrast-before-adoption
status: forged
laws: [claimant-does-not-adjudicate, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a model edits a harness or prompt from a run and no labelled check exists, deciding whether to keep an edit on a task with no answer key, an improvement loop reports that an edit worked from one re-run, choosing what an adaptation loop may record as learned]
---

# Contrast before adoption

An edit to an agent's prompt, tools or control flow can often be tested by a probe
([probe-confirmed model proposals](../../probe-confirmed-model-proposals/probe-confirmed-model-proposals.md)
owns that case, where an instrument can test each line). Where nothing can test it, because
the task is new and nobody holds a key, the only evidence is how the agent behaved with and
without the edit. That evidence can decide adoption. It cannot establish correctness, and
the record has to say which happened
([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

## The step

1. **Run the current configuration first.** The run shows how the configuration behaves,
   not whether the output is right.
2. **Propose from named moments.** Every edit names the moment in a run that motivated it.
   If nobody can name the moment, the edit is speculation and costs context for nothing.
3. **Run each candidate on the same task**, same model, same environment.
4. **Decide in a separate session.** Each keep or drop cites what decided it. Merging,
   adopting one candidate and keeping the baseline are all legal. Keeping the baseline is
   an answer, not a failure.
5. **Run what was decided.** A merged configuration is untested until then.

## What it does not prove

The result is adopted, not verified. One run per candidate is weak evidence in either
direction. A defect in one of several baseline runs is noise, and one that repeats across
them is the strongest thing available. Candidates drawn from the same evidence share the
same model's biases, so their agreement is support and not independent proof.

The study behind this published its own regressions. A selector with no key chose a 55
over a 95. One premise spread to all four candidates, which all scored 42 against a 50
baseline. A check written by the editor reported a pass three times while 4 of 11 graded
tests needed a case its assumption excluded, because a check cannot catch the assumption
its author built it on
([oracle-frozen-during-repair](../../../../engineering-process/standards-and-gates/quality-gates/techniques/oracle-frozen-during-repair.md)).
Where any held-out check exists, use it instead: this technique is for when none does.

## What it may record

Attribute an effect to a component only when a run isolates that component. Otherwise
write `confounded`, and prefer that over a guess. A lesson resting only on confounded rows
is not a lesson. "No entry" is a valid result. A candidate here may change several
components, so nothing it shows is evidence about any one of them. A loop that means to
learn which part was load-bearing needs one change per round
([failure-attribution](./failure-attribution.md)).

## Read the seam before applying this

One paired design probe on a real prompt-editing seam: two draws per arm, a rubric fixed
before the arms ran, one blind judge from another vendor family. Draws given this document
scored 8 of 10 against 5 of 10, and took the checks on run variation and on what later runs
may learn 4 of 4 against 0 of 4. Both also missed what both draws without it caught: in that
system, the call that marks a version live does not apply it, and they built adoption on that
call. The target moved and the floor fell, so the verdict there is not better. Two draws
cannot say why. The narrow reading holds without a cause: these steps say how to decide, and
they do not say what adopting does in this system, so read that first.

## The measurement and its limits

One 2026 preprint, three professional benchmarks, four model-and-harness configurations,
three shuffled streams per cell, no label used for improvement. One step raised the mean
in all twelve benchmark-configuration pairs, by at most 11.5 points on a 100-point score
and 11.8 percentage points on a criterion pass rate. In 3 of the 12, the gain did not exceed
the larger standard deviation of the two arms
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)). A per-task
revision loop that had to edit, and deployed the edit unprobed, finished below its unmodified
base in seven of the twelve. It also had no scope split, no aggregation and no library, so the
forced edit is not isolated. Editing with no reference run, no candidates and no library lost
10.2 and 4.9 points on two domains.

Two ablations bear on the steps, and neither reports a spread of its own. Replacing separate
procedure and domain proposers with two generic ones cost 2.9 and 3.7 points. Returning the
better candidate instead of merging cost 1.6 and 1.9, which is inside the 2.5 and 2.3
run-to-run spread of the full arm, so the merge itself is weakly supported.

Discount it. The preprint is unreviewed, and its authors ported the competing baselines
themselves. On one benchmark the judge model was the executor in half the configurations, and
on another it was the editor in all of them, so those gains are single-family on the judge's
side.

## Cost

Four executions per task at the smallest setting and twenty at the largest studied, plus
the editing sessions. That rules out a short prompt. It suits a task whose failure costs
more than the runs.
