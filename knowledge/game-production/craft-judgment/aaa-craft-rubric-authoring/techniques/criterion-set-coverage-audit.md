---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: criterion-set-coverage-audit
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [defects keep escaping a rubric that reports clean, auditing a criterion set before publishing a version, a grade is being read as a statement about the whole artifact]
---

# Auditing what the criterion set does not ask

A rubric can only report in the categories it was given. A defect in a dimension no
criterion covers is not scored badly — it is not scored, and the composite is computed over
the covered dimensions and then rendered as the artifact's quality. That is the whole
danger: **a blind spot in a rubric renders as silence, and silence reads as a pass.** The
audit is the procedure that finds those spots before a downstream consumer does, and the
rendering rule is what makes surviving one bearable.

The failure is measurable and it is large. Where a production grading setup has been
compared against defects confirmed by other means, the pattern that recurs is a criterion
set exposing a handful of coarse dimensions with no category at all for the behavioural
ones — recovery, state, guardrails — and roughly half of the confirmed defect patterns
living in the dimensions the instrument could not express. The gate's apparent defect rate
approached zero. Nothing in the instrument was wrong; every criterion it held it applied
correctly. It simply held a proper subset of the craft and reported the subset as the
whole. The assessment literature has a name for this and treats it as a validity failure
rather than a reliability one: an instrument can be perfectly consistent between examiners
and still measure the wrong fraction of the thing it claims to measure. Inter-examiner
agreement therefore does not evidence coverage, and a team that measures only agreement
will keep tightening a rubric around its own blind spot.

## The procedure

1. **Enumerate the dimensions of the deliverable class independently of the rubric, and
   before looking at it.** This independence is the entire method; deriving the dimensions
   from the criteria produces perfect coverage by construction and proves nothing. Draw the
   enumeration from four places that were never the rubric: the rejection incidents from
   the field — the specific reasons leads actually sent work back; the defect taxonomy the
   medium already has; the discipline's own breakdown of the craft; and what downstream
   consumers of the artifact require of it.
2. **Map criteria onto dimensions, many-to-many.** A criterion legitimately lands on several
   dimensions, and several criteria legitimately land on one; a set with deliberate overlap
   will be densely mapped and that is expected.
3. **Read the map in both directions.** Dimensions with no criterion are blind spots.
   Criteria with no dimension are the quieter finding: either the enumeration is incomplete,
   or the criterion is measuring something nobody asked for and has become ritual.
4. **Decide each uncovered dimension explicitly**, one of three ways: cover it by writing a
   criterion; declare it out of scope for this instrument and name the instrument that does
   cover it; or declare it unmeasured. All three are legitimate. What is not legitimate is
   leaving it undecided, because an undecided dimension is a covered one as far as the grade
   is concerned.
5. **Store the enumeration with the rubric, dated, and re-run the audit on every version
   bump and after every escape.** An escape — a defect that reached a downstream consumer
   through a passing grade — is the highest-value coverage signal available. Work backwards
   from it to its dimension and ask which of three things was true: the dimension was
   uncovered, or it was covered by a criterion that did not fire, or it was covered and
   fired and was outweighed. Those are three different defects with three different fixes,
   and only the first is a coverage failure.

## The rendering rule

An uncovered dimension renders as **unmeasured**, named, beside the grade. A grade computed
over eight of twelve dimensions is reported as a grade over eight dimensions with the other
four named — not as a grade. A number handed onward without the basis it was computed under
is not information, and "which dimensions this looked at" is that basis exactly. The
temptation to omit it is strong precisely because the omission makes the instrument look
complete, which is the state it is being audited for not being.

This is also what makes publishing an incomplete rubric acceptable. A rubric with three
named unmeasured dimensions and honest rendering is a usable instrument that tells its
reader where it is blind. A rubric that covers everything on paper because nobody enumerated
independently is the same instrument without the label.

## Under machine judgment

At production scale the examiner is instructed with the criteria and may conclude only in
their categories, which is what makes the blind spot airtight: an automated examiner will
not spontaneously report a defect class it was not given language for, and it will produce a
clean, confident verdict beside a defect it can see. Give it one explicit channel for that
case — *a defect visible in this artifact that no criterion covers* — and route the channel's
output to the rubric author, not into the grade.

Both halves of that rule are load-bearing. Without the channel, the coverage audit has no
input from production and depends entirely on escapes reported by consumers, which arrive
late and incompletely. And if the channel's output is allowed to move the score, an
ungoverned free-text penalty has re-entered the instrument, which is unsourced taste with a
new route in — the exact thing the criteria exist to keep out. The channel is a proposal for
the next version. It is not a criterion until somebody writes it as one.

Check where an existing channel points before building a new one. Mature automated graders
usually already ask the examiner for a directive that would raise the score, and route it into
improving the *producer's* instruction — a valuable loop, and not a coverage input, because it
can only speak in the categories the criteria supplied. The coverage channel is a second,
differently-addressed question, and conflating the two loses the one that reports on the
instrument.

Two secondary readings come free once the channel exists. A dimension that repeatedly
appears in the channel and nowhere in the criteria is a blind spot with evidence attached
and belongs in the next version. And a class whose measured defect rate approaches zero
while downstream complaints do not is not a clean pipeline — it is an instrument reporting
on the dimensions it happens to hold.

## Decision rules

- **When a dimension is uncovered because no criterion can be answered from the stored
  artifact, change what the producer persists rather than dropping the dimension.** Most
  uncovered dimensions are uncovered for this reason, and the missing evidence is usually
  cheap to store at production time and impossible to recover afterwards.
- **When the enumeration and the criteria were written by the same person in one sitting,
  the audit proves nothing.** Independence is procedural, not attitudinal: a different
  practitioner, or at absolute minimum a separate pass that reads only the incidents and
  never the rubric.
- **When coverage is complete on paper and escapes keep occurring in one dimension, the
  criterion covering it is not discriminating.** That is a criterion defect, not a coverage
  defect, and rewriting the criterion is the fix; adding a second one over the same
  dimension without diagnosing the first just doubles the silence.
- **Coverage is a list, never a percentage.** A figure like "eighty-three per cent covered"
  reads as a quality score, gets tracked as one, and hides which seventeen per cent is
  missing. Count and name, or do not publish it.
- **Structural dimensions are the ones a criterion set covers by default; behavioural and
  perceptual dimensions are the ones it silently omits.** When an audit finds full coverage
  on the first pass, suspect the enumeration before believing the result — a set of
  dimensions derived without effort tends to reproduce the ones the instrument already
  measures.

## When not to use it

- **On a single-purpose conformance check.** One dimension by construction; the audit has
  nothing to find and its ceremony makes the check look more thorough than it is.
- **As a gate on publishing a lens.** A delayed instrument measures nothing at all. Publish
  with the unmeasured dimensions named, and let the audit run against the version.
- **When the class is mis-scoped.** A dimension enumeration that will not fit one instrument
  because half of it applies to one kind of artifact and half to another is telling you the
  deliverable class holds two crafts. Split the class rather than extending the criterion
  set until it spans both.
