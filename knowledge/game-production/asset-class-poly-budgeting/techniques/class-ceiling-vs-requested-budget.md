---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: class-ceiling-vs-requested-budget
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
use_when: [designing the geometry gate, a mesh passed the gate but is not what was ordered, a generator accepts no budget parameter, an asset arrives with no class]
---

# Class ceiling versus requested budget

## The concern

Two different questions get asked of a delivered mesh, and most pipelines implement
only one of them:

- **Is it shippable for its class?** Measured against the class ceiling. Answers "may
  this enter the build".
- **Is it what we ordered?** Measured against the budget requested for *this*
  generation. Answers "did the service do what it was told".

A gate that only asks the first accepts a prop delivered at three times its
commissioned budget, because props are allowed more than that in absolute terms. It
also cannot see a unit mismatch at all on any asset whose requested budget was
comfortably below its class ceiling — the doubling stays inside the ceiling and the
gate reports green.

The technique is to run both comparisons, report them separately, and be rigorous about
the cases where one of them cannot be run.

## Procedure

1. **Store the requested budget with the generation record**, in the authored unit,
   alongside the topology asked for. A request that was not recorded cannot be graded
   against, and reconstructing it later from a preset table is a guess.
2. **Grade delivered against requested**: ratio, tolerance, verdict, reason. This is
   the conformance question and it belongs to whoever commissioned the asset.
3. **Grade delivered against the class ceiling** separately, using class-aware
   thresholds rather than one global default. A class-blind ceiling large enough not to
   annoy characters is large enough to pass a grossly over-budget prop.
4. **Report both verdicts.** They disagree usefully: honoured-but-over-ceiling means the
   requested budget was set too high; under-ceiling-but-over-requested means the service
   did not comply.
5. **Render every absent input as unmeasured, with a reason naming what is missing.**
   No measurement, no request, no recognised class — each is its own sentence, none of
   them is a pass, and none of them is a neutral number standing in for one.

## The two honesty rules that are easy to get wrong

**Never fabricate a request so the grader has something to compare against.** Some
generators expose no density parameter at all. The tempting move is to synthesise a
request from the class preset so the delivered-versus-requested path can run. Do not:
that produces the sentence "the service ignored your budget" about a budget nobody ever
sent — a false accusation, recorded as data, that will be believed later. For such a
generator, grade against the class ceiling only, and state that no budget was
requested. The class ceiling is the honest class-aware line for a service you cannot
instruct.

**Never promote an unclassified asset to a "typical" class.** An absent or unrecognised
class must not be silently treated as a prop. A character graded against a prop's
companion limits fails for being assembled — the defect report is then about the
grader, not the mesh, and someone spends a day on it. Degrade to class-blind defaults
if you must, but *say so* in a sentence the caller sees: which class was used, why, and
what the recognised classes are. A degradation that is reported is survivable; the same
degradation, invisible, is the bug this rule exists to prevent.

The general form of both: the gate must be able to say what it graded against, in one
sentence, for every artifact — including the ones it could not grade properly.

## Decision rules

- **When the requested budget exceeds the class ceiling, that is a finding at request
  time**, not at delivery. Catch it where it is cheap.
- **When the class ceiling is revised, historical verdicts do not silently improve.**
  A verdict speaks for the standard it was judged under; re-grade or mark stale.
- **When the delivery is a raw generative output rather than a finished asset, declare
  the stage** on the grade. A failing verdict on pre-finishing output is a fact about
  the producer, not a defect in an artifact that nobody claimed was done — and without
  the stage declared, the two are indistinguishable in a report.
- **Set the ceiling above the requested target, deliberately.** Roughly 1.5x is a
  working ratio: it leaves room for honest imprecision and for assets that legitimately
  need more, while keeping the ceiling meaningful. Equal target and ceiling collapse two
  questions into one.
- **Never let a class ceiling substitute for the absolute standard.** The ceiling says
  what the pipeline can afford, not whether the asset is good. Craft is graded against
  what ships, elsewhere and separately; passing a budget gate is a floor, not a grade.

## When not to use it

- **When the asset was authored by hand to a spec.** There is no service to hold to a
  request; the class ceiling and the reviewer's judgment are the whole check.
- **When the delivery is an intermediate scratch artifact** — a high-density source
  destined for retopology and baking. Grading it against the shipped-class budget
  reports a failure that means nothing. Budget the finished output; measure the source
  only for cost and processing time.
