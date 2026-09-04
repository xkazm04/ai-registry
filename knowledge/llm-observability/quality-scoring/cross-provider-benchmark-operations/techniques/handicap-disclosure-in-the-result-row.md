---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: handicap-disclosure-in-the-result-row
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when: [a competitor or model could not run the benchmark's workload unmodified, publishing a comparison your own system wins, deciding whether a weakened case still belongs in the scorecard]
---

# Handicap disclosure in the result row

Not every target can run the workload you wrote. One model has no tool-calling
and the agentic case has to be flattened into a single turn; one provider caps
context and the long-document case is truncated; one target cannot express the
structured-output contract at all and the case is hand-lowered into free text
that the rubric then grades more leniently. The benchmark still wants a number
for that cell, so the workload gets weakened until it runs — and at that
moment the run has produced a timing, a score and a cost that are **not
measurements of the declared workload**, with nothing in the artifact saying
so.

The rule: **the handicap applied to a target to make the workload runnable is
part of the measurement, and it belongs in the result row.** A benchmark that
weakened a case and reports only the number has published a figure whose
predicate is missing, and a missing predicate is not a small defect — it is
the difference between "this target is slower" and "this target was asked a
different question". The disclosure is not a courtesy to the target. It is the
unit on the number
([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).

The boundary with the neighbouring disciplines is sharp. Determinism stamping
records how *pinned* a call was — whether a replay would reproduce it. This
records how *equal* the case was — whether the target was asked the same thing
at all. A cell can be exact-stamped and deeply handicapped; a cell can be
faithful to the workload and completely unreproducible. Two axes, two fields.
And normalizing an interface difference at the generation adapter is not a
handicap: absorbing a different request shape while the task stays identical
is the adapter doing its job. The handicap begins where the *task* changed.

## The carriage rule: a typed field, in the same artifact as the number

The concession must be a field with a type in the result schema, written on
the same row as the timing and the score, surviving serialization into the
published result set as its own column, and reaching the comparison surface
attached to the value it qualifies. That is a strong requirement and each of
the popular alternatives fails it for a specific, predictable reason:

- **A methodology section in the report prose** is separated from the number
  by a scroll. The chart is the artifact that circulates; the prose is not.
- **A note in the harness's documentation** does not travel with the data at
  all. Six months on, someone reads the stored result set directly and sees a
  clean comparative table with no idea a third of it was handicapped.
- **A footnote keyed by target** is closer but still detached: the reader must
  decide the footnote applies to the cell they are looking at, and they will
  decide wrong in the direction that flatters the conclusion they arrived
  with.
- **An identifier convention** — encoding the concession in the case name or
  a tag — is a field with no type and no schema, silently dropped by every
  consumer that did not know the convention.

The operational test is not "did we disclose it" but **can any rendering path
display this number without the concession in hand?** If yes, the disclosure
is optional and will eventually be optional in practice. When the field is on
the row, the render is forced to make a choice about it, and the cheapest
correct choice — a visible marker at rest, the full text one interaction
away — is what ships. The marker at rest is the load-bearing half: a chart
that carries the concession only in a hover tooltip loses it the moment
someone screenshots the chart, which is how comparison results actually
travel.

## The granularity rule: finest grain where it is true

Attach the concession at the finest grain where it actually applies — this
case, this run, this cell — and never at the coarsest. A per-target caveat is
tempting because it is one string to write, but it is wrong in both
directions at once: it over-applies to the cases that ran faithfully, and it
under-describes the cases that were mangled worst.

The over-application is the expensive half. A caveat that is visibly false on
cases a reader can check trains that reader to discount it everywhere,
including on the cells where it is exactly true. Clearing the concession on
the subset of cases where no concession was made is therefore not a
politeness to the competitor; it is what keeps the marker meaningful on the
cells that still carry it. The discipline is the same one that keeps a
partial-run banner loud: a warning that is always on is off.

## When the concession cannot be written

Sometimes the workload cannot be weakened into something runnable — the
target cannot express the task in any form that the rubric would still be
grading. That case has three possible renderings and only one is honest:

1. **A slow or low number.** A lie. It reports a capability gap as a
   performance gap, and the two lead to opposite decisions.
2. **A silently missing cell.** Also a lie, in the other direction: an absent
   number is read as "not measured yet" or averaged out of the aggregate, and
   the target's inability disappears from the comparison entirely.
3. **A distinct verdict — *not expressible*.** The correct one. It is a
   measured result with its own state, it participates in the scorecard, and
   it excludes the cell from timing aggregates rather than contributing a
   number to them
   ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).

The state needs its own reason string for the same reason a handicap does:
"could not run" without "because it has no tool-calling interface" is
indistinguishable from "our harness is broken", and the target's advocates
will read it as exactly that.

## The publisher corollary

The strongest case for this discipline is precisely the benchmark **you
publish and win**. That is when the omission is most self-serving, when
nobody with an interest in catching it has your result set, and when the
handicap most plausibly explains the margin. A vendor comparison in which
several competitors could not express the workload, published without the
concessions, is not a comparison; it is a demonstration with a leaderboard
drawn on it.

Inverted, this is a cheap and unusually reliable reader's test for someone
else's comparative benchmark: if the losing columns carry no per-case
concessions at all, either every competitor ran the workload unmodified — an
uncommon outcome across genuinely different systems — or the concessions were
made and not written down. Ask which, and note that only one of the two
answers is checkable from the published artifact.

## Decision rules

- **When a weakening changes what the rubric is grading, the cell needs a
  concession; when it changes only how the request was shaped, it does not.**
  Re-serializing a prompt for a different request format is adapter work.
  Dropping a constraint from the task so the target can satisfy it is a
  handicap. When you cannot tell which one you did, it was a handicap.
- **When the same handicap applies to every target, it is not a handicap — it
  is the workload.** Fold it into the case definition and the dataset version
  rather than annotating every row with a constant.
- **When a handicap is discovered after publication, cut a new run rather
  than editing the old rows.** The old numbers were produced under the
  conditions they were produced under; annotate the run as superseded and
  state the newly-known concession there. Silently repairing the row destroys
  the record of what the earlier decision was actually made on.
- **When a concession is written, the aggregate must decide about it
  explicitly** — either handicapped cells are excluded from the target's mean
  and the exclusion count is printed, or they are included and the mean is
  marked as containing handicapped cells. An aggregate that averages a
  concession-bearing cell in silently has laundered the caveat away at
  exactly the layer most people read.
- **When the concession text would be a paragraph, it is a design finding.**
  A target needing that much weakening is probably not in the same
  comparison; report it as a separate qualitative note rather than as a
  column that looks commensurable and is not.

## When not to use it

A single-target regression run against its own baseline has no competitor to
handicap; if its workload changed, that is a dataset version bump, not a
concession. Calibration and smoke runs do not need the field either — their
purpose is instrument health, not comparison, and nobody reads their numbers
as claims about a target. The technique earns its keep exactly where columns
sit next to each other and a reader is meant to compare them.
