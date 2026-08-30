---
layer: technique
type: technique
subject: eval-harness
technique: measurement-revision
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a re-run disagrees with a published result, deciding whether a second pass corrects a first or merely samples it again, a harness defect was found after results were circulated, reporting what fraction of past failures were instrument artifacts, a follow-up study reverses an earlier conclusion]
---

# Revising a published measurement

A suite's results get quoted, and then something changes underneath them —
a harness defect surfaces, a fixture turns out to be wrong, someone re-runs
a cell and gets a different answer. The revision is a measurement in its own
right, and it is routinely conducted with less rigour than the thing it is
revising, because it feels like housekeeping rather than science.

It is not housekeeping. A revision inherits every design obligation the
original had, plus one the original did not: **it must establish that it is
better evidence than what it overturns**, and being later does not establish
that.

## A re-run at the same sample size is a second sample, not a correction

This is the whole technique in one line, and it is violated almost
automatically, because a contradicting re-run arrives with a narrative
attached — the first result was *wrong*, and here is the *right* one.
Chronology is doing the work in that sentence, and chronology is not
evidence.

The case worth carrying: a defect audit sampled a set of failing cells once
and reported a per-condition pattern. A second pass re-sampled the same
cells once, disagreed, and was accepted as a correction — the per-condition
ratios were revised on its authority. A third pass replicated every arm five
times and returned the *first* pass's ratios exactly. The second pass had
observed a real phenomenon and misestimated its size by sampling it once.

Two things follow, and the second is the one teams miss:

- **To correct an n=1 result, raise n.** Repeating at the same size adds a
  sample to a set of two disagreeing samples; it does not adjudicate them.
  If the arms disagree, the honest report is *two samples, disagreeing* —
  which is a smaller and more useful claim than either arm alone.
- **A pass that only re-samples must not be written up as a revision.** Once
  a "correction" is circulated, the original stands corrected in everyone's
  notes, and the third pass that restores it has to fight the second's
  framing rather than the first's data. The cost of mislabelling a sample as
  a correction is paid at the next revision, not this one.

The cheap sufficient design is per-cell **rates** rather than binary flips:
replicate each arm enough times that a single flip cannot masquerade as
signal, and report the rate. Five replicates per arm is not a confidence
interval and should not be described as one, but it is the difference
between "this cell changed" and "this cell changes."

Two design hazards ride along with revisions specifically, both from
treating the revision as cheaper than the original:

- **Arms recorded at different times are not a controlled comparison.** A
  fresh arm compared against one recorded hours earlier inherits variance
  from both sittings, and the gap is invisible in the results table.
- **A flag changed for convenience is a changed condition.** Re-running with
  a different permission or confirmation mode than the original used is a
  difference asserted to be irrelevant. Say which flags differ and that the
  irrelevance was assumed rather than tested.

## Report a concentrated effect as its distribution, never as its mean

The result a revision most wants to publish is a single number: *what
fraction of the old failures were the instrument's fault?* That number is
usually the least defensible thing the study produced.

When the audit above replicated properly, six of seventeen cells carried the
entire effect and ten carried none of it. A mean over those seventeen is
arithmetically correct and misleads in both directions at once: it
overstates the ten cells that were genuine failures, and understates the six
that were wholly artifacts. Nobody reading the mean can recover either
group, and both groups imply different work.

So: **report which cells moved, by how much, and which did not move at
all.** The distribution is the finding. If a single figure must be quoted,
quote the count of affected cells rather than the average effect — a count
travels with its predicate
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)),
and an average travels without one.

The same discipline governs the summary sentence. When two passes yield
different fractions and the design cannot bound the difference, **neither
fraction is a point estimate**, and publishing either is a precision claim
the study cannot support — one that will be quoted stripped of its caveat,
because point estimates always are. The defensible statement is
directional: a minority of the old failures were artifacts, most survive,
and the sample cannot tighten it further. That sentence is not a weaker
result, it is the actual result
([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).

## State the direction of the revision, because it is not always a retreat

Revisions are assumed to subtract, and this assumption suppresses them:
nobody wants to publish the study that weakens their own numbers, so the
re-analysis stays in a branch.

The assumption is wrong often enough to be worth checking explicitly. The
audit above began from a commit that had flagged **every** failing trial as
confounded — a wholesale disclaimer, correct on the evidence then available
and much too broad. Quantifying it left most of the negatives standing, so
the suite's negative findings came out of the revision **more** defensible
than they went in. The revision's job was to shrink an over-broad
retraction, not to widen a narrow one.

Write the direction into the revision's opening line — what the old claim
was, what the new one is, and whether the change is a narrowing, a
widening, or a reversal. A reader who cannot tell which of the three
happened will assume reversal, and will discard results that were never in
question.

## What a revision may not do

- **It may not silently re-baseline.** The old numbers keep their identity
  and their conditions; the revision is an additional record, not an edit.
  A result whose conditions were replaced in place cannot be compared with
  anything, including itself.
- **It may not extend past the cases it re-ran.** Coverage is part of the
  claim: a study that replayed two thirds of the reachable cells has said
  nothing about the other third, and the unreached cells are not
  distributed like the reached ones if reachability had a cause — a
  configuration that was retired, an artifact no longer available.
- **It may not convert a hypothesis's survival into its support.** Removing
  an instrument defect as the dominant explanation for a set of failures
  does not confirm whatever hypothesis the failures were originally
  collected to test. It removes one rival. Saying so plainly is what keeps
  the next revision from having to relitigate this one.
