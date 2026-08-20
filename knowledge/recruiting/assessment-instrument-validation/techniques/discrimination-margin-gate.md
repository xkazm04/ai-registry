---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: discrimination-margin-gate
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [setting the pass condition for a validation run, an assessment ranks correctly but by a hair, defending a threshold under deadline pressure]
---

# Discrimination margin gate

Correct rank order is not evidence of discrimination. If a strong submission
outscores a weak one by a point on a hundred-point scale, and the scoring path
contains a judgment call whose run-to-run drift is several points, the ordering
is a coin flip that landed the right way. An instrument is only shown to
discriminate when the gap it produces is **larger than the noise of the process
that produced it**, and the gate must encode that as a required margin, not as a
direction.

The gate is the pass condition of a validation run: a small set of numeric
thresholds, fixed before the run, each carrying a written reason.

## The thresholds that matter

Four recur, and a gate missing any of them has a known hole.

**A minimum group size.** Below some number of submissions per compared group, a
mean is not a measurement. The floor is not a statistical nicety — it is the
difference between "the instrument separates these groups" and "one submission
happened to score high". Below the floor the run does not fail; it returns
*inconclusive* ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

**A required margin for whatever the instrument is meant to detect.** State it
in the units the instrument reports, and derive it from the observed noise of
that scoring path, not from taste. If you have not measured the noise, measure
it first: run the same submission through the same path several times and look
at the spread. A margin smaller than that spread cannot be defended.

**A tolerance defining "not penalised".** Several validation claims are negative
— that an irrelevant attribute does not cost a candidate, that a legitimate
alternative approach is not marked down. Negative claims need a tolerance, or
they are unfalsifiable in one direction and impossible to satisfy in the other:
exact equality never occurs, and any gap at all will otherwise read as a
penalty. Set the tolerance at the level below which a difference has no
practical effect on an outcome, and say what that level is protecting.

The shape of this check is a **non-inferiority test, not a lead test**, and
conflating the two is a live error. A lead check asks whether one group beats
another by a margin; a tie fails it. A non-inferiority check asks whether one
group falls no more than the tolerance *below* another; a tie **passes**, which
is the entire point of "this attribute is not held against anyone". Building the
negative claim out of a lead check quietly demands that the attribute be
*rewarded*, which is a different and usually indefensible policy.

**A discrimination margin against the right comparators.** This is the
threshold most gates get wrong, and the fix is the core of the technique.

## The strong persona must beat two different things

A gate that requires only *strong outscores weak* validates half the instrument.
It says the rubric responds to quality. It says nothing about whether the rubric
can be moved by behaviour that is not quality.

Require the strong persona to clear the stated margin over **both**:

- **the weak persona** — the honest, low-quality submission. This is the
  competence axis: the instrument responds to how well the work was done.
- **the gaming persona** — the submission optimised for the grader rather than
  the problem, including one that fabricates process signals. This is the
  integrity axis: the instrument cannot be moved by performing competence
  instead of demonstrating it.

The two failures are independent and they have different repairs. Failing the
competence axis means the rubric is not sensitive to the thing it names —
usually score compression, sometimes a criterion that every submission satisfies
trivially. Failing the integrity axis means the rubric's discriminating power
sits in claims the candidate makes about themselves rather than in the artifact
they produced; the repair is to move weight onto artifact-anchored checks, not
to add another self-report question.

An instrument that passes the first and fails the second is the dangerous one,
because it looks validated. It ranks honest candidates correctly, ships, and
then ranks the first person who writes to the rubric above all of them.

## Every number carries its rationale

Store the gate as an explicit, single-source object — thresholds and reasons
together, in the artifact the run reads — and write the reason beside the
number, not in a design document that will diverge from it:

- what the floor is protecting against, and what happens below it;
- what noise level the margin has to clear, and how that noise was measured;
- what the tolerance means in outcome terms;
- what corpus each number was derived from, and how that corpus was stratified.

Two things follow from co-locating them. A threshold argued about under deadline
pressure is argued against its stated reason rather than against nobody, which
is the only argument a threshold can win. And a threshold that is genuinely
wrong can be changed honestly, because changing it means editing the reason too
— which is a visible act with an author, rather than a quiet number swap.

The reasoning also has to say **what is deliberately not gated**, which is the
half teams omit. A composite score containing a component that is structurally
incapable of scoring well — a grounding step for a role that has nothing to
ground against, a dimension the instrument cannot observe in this context —
must not be gated as a composite, because failing it punishes a structural fact
rather than a defect. Gate the component that the change is supposed to improve,
and record why the others were excluded. An unexplained exclusion is
indistinguishable from a threshold quietly dropped because it failed.

## Procedure

1. **Measure the scoring path's own noise** before setting any margin. Same
   input, several runs, record the spread.
2. **Set each threshold and write its reason in the same place.**
3. **Run the cast; compute the comparisons the gate names.**
4. **Evaluate each threshold independently and report each one's result**, not
   just the conjunction. A gate that reports only pass or fail forces the reader
   back into the raw output to find out which margin was missed.
5. **On a miss, name the axis** — competence or integrity — because the repairs
   differ.
6. **Re-derive the thresholds when the scoring path changes materially.** A
   margin calibrated against one judge's noise is not valid against another's.

## Decision rules

- **When the margin is met but the group is under the floor, the verdict is
  inconclusive, never pass.** Small samples make large margins routinely; that
  is what small samples do.
- **When the strong persona beats the weak one but ties the gamer, do not lower
  the margin.** The tie is the finding. Lowering the threshold to make the run
  green converts a discovered vulnerability into a certified instrument.
- **When a threshold has no written reason, treat it as unset.** An unreasoned
  number is a number someone will change on the first inconvenient run.
- **When margins are consistently enormous, check for leakage.** A strong
  persona that outscores everything by a landslide often shares a marker with
  the rubric — a phrase, a structure — and you are measuring the marker.
- **When the instrument reports a coarse verdict rather than a number, express
  the margin as a required verdict difference** — the strong persona clears a
  band the comparators do not. The principle is unchanged; the units are not
  always continuous.

## When not to use it

A margin gate is meaningless where the instrument emits no comparable quantity
at all — a purely narrative assessment with no scored output has to be validated
by structured human review instead. It is also the wrong instrument for group
fairness: comparing selection rates between protected groups is a different
computation with different thresholds and a different legal standing, owned by
the practice on adverse impact and proxy neutrality. Margins here are about
whether the instrument can tell constructed differences apart, and a gate that
is asked to do double duty ends up doing neither job to the standard it needs.
