---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: ceiling-as-a-market-assumption
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a deliverable class cannot reach the top of its rubric, deciding how good a generated class is allowed to get, a team is grinding against an unstated quality limit]
---

# The ceiling is a dated market assumption, not a truth

Some deliverable classes cannot currently reach the top of their own rubric. The
honest way to encode that is a **ceiling**: the highest level this class is permitted
to reach, recorded with a written reason and a classification of how permanent the
limit is. The classification is the transplantable part, because it forces the author
to say out loud whether the roof is a fact about the world, a bet about the current
state of tooling, or nothing at all.

## The three-way classification

Every ceiling is exactly one of:

- **Permanent** — the limit follows from what the class *is*. A wireframe schematic
  cannot be judged as a finished composition however good the tooling gets; the
  artifact type does not admit the quality being measured. Permanent ceilings almost
  never change and are safe to encode without a review date.
- **Arguable** — the limit follows from what the current generation of tooling can do,
  or from where the market currently sets its bar. This is the interesting case and
  the majority case: "this class tops out below the reference standard because the
  generative step available today produces work a specialist would redo". An arguable
  ceiling is a dated product decision. It carries the date, the reason, and the
  implicit promise that someone will revisit it.
- **Uncapped** — the class can reach the top of its scale. Recorded explicitly rather
  than by omission, because an absent ceiling and an uncapped class must not look the
  same in the data.

The classification is not a confidence score. It is a statement about *what kind of
evidence would change the ceiling*: nothing, for permanent; a tooling or market shift,
for arguable; not applicable, for uncapped.

## Writing the reason

The reason is prose, one or two sentences, and it must name the constraint rather than
restate the ceiling. "Capped at the third level" is not a reason. "Capped at the third
level because generated output in this class reliably lacks the specific silhouette
intent a specialist supplies, and no available process recovers it without a manual
pass" is a reason: it names the missing quality, names why it is missing, and tells a
future reader exactly what would have to become true for the ceiling to lift.

Every arguable ceiling carries a date. A ceiling written eighteen months ago against
tooling that has since changed is not a standard, it is a fossil, and it will quietly
suppress the grades of work that has actually improved.

## What a ceiling does to a grade

**A class at its ceiling has succeeded.** This is the rule most implementations get
wrong. An artifact that meets every criterion and reaches the highest level its class
permits must render as an achievement, not as a warning or a shortfall against the
absolute top of the scale. Render it as a shortfall and two things happen in order:
the people producing that class learn to ignore the indicator, and then they ignore
the real failures displayed beside it.

**A ceiling is not a target.** It does not raise a weak artifact. It bounds a strong
one. Grades below the ceiling are still full-resolution craft judgments and still mean
what the criteria say they mean.

**Levels above the ceiling stay in the document.** Write the anchors for the unreachable
levels anyway and mark them as not awardable under this version. They are what
calibrates the levels below — an examiner who cannot see the top cannot judge the
distance to it — and they are what a future ceiling revision will be argued against.
Deleting them makes the ceiling look like the top of the scale, which is exactly the
misreading the technique exists to prevent.

**Achievement never outranks an invalidation.** Where a display collapses these states
into one, the order matters: an artifact whose verdict is stale or absent reads as
ungauged first, and only a live verdict can read as at-ceiling. A stale grade rendered
as "at its ceiling" says the roof has been reached when nobody has looked recently, and
that is the most flattering possible lie about the least examined content.

**A ceiling is per class, never per artifact.** A cap that can be argued per piece is a
negotiation, and every producer will negotiate. The class decides; the artifact
inherits.

## Reading the ceiling as an instrument

The distribution of grades against a ceiling is a diagnostic about the rubric and the
pipeline, not about any one piece:

- **Nothing in the class ever reaches its ceiling.** The gap is in the process — a
  missing finishing pass, a step nobody does. Investigate production, not the rubric.
- **Everything in the class reaches its ceiling.** The ceiling is set too low, or the
  criteria below it have stopped discriminating. Either way the class has outgrown its
  lens and needs a new version.
- **An arguable ceiling has not been revisited in a year.** Treat as expired. Re-derive
  it or promote it to permanent with a reason that explains why it stopped being
  arguable.

## Decision rules

- **When in doubt between permanent and arguable, choose arguable.** Permanent is a
  claim about the world that forecloses future review, and it is very rarely warranted
  outside of "this artifact type is not that artifact type".
- **When a class's ceiling is being used to excuse quality, it is misclassified.** A
  ceiling explains why the top level is unreachable; it never explains why a criterion
  below it was missed. If people cite the ceiling in response to a failed criterion,
  the ceiling is being read as a licence and the rendering needs fixing.
- **Change a ceiling only through a version.** A silently edited ceiling re-means every
  historical grade in that class. Ceiling changes are lens changes.
- **One authority holds the ceiling value.** The ceiling belongs to the deliverable
  class, in one place. Restating it inside the lens document as well gives one quantity
  two owners, and they will disagree on the day one is edited. If a duplicate is
  unavoidable for tooling reasons, a check must pin the two together and fail loudly
  when they diverge — a duplicate nothing compares is a future contradiction with a
  date on it.
- **Never let a ceiling be inferred from the data.** Computing "the best anyone has
  achieved in this class" and treating that as the roof is a curve, and a curve set by
  the past. The ceiling is authored.

## When not to use it

- **When the real problem is that the class is mis-scoped.** If a class needs a ceiling
  because it contains two different kinds of artifact and one of them drags, split the
  class. A ceiling over a heterogeneous class caps the good half for the sins of the
  other.
- **When the limit is a defect you intend to fix this quarter.** That is a known issue
  with an owner, not a market assumption. Encoding it as a ceiling makes it invisible
  and therefore permanent in practice.
- **For process or governance classes.** A ceiling is a statement about attainable
  craft in a medium. Applying it to a pipeline stage produces a gate that certifies
  its own limitations.
