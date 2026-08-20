---
layer: golden-path
type: golden-path
subject: regeneration-vs-repair-economics
status: forged
use_when: [a generated asset has been rejected and something must happen next, deciding whether to pay for another generation or repair locally, designing a critique-and-refine loop that has to terminate, choosing among several generated attempts]
techniques:
  - defect-class-to-remedy-map
  - reroll-economics-per-credit
  - refuse-the-fix-that-cannot-help
  - bounded-refine-iteration
  - score-basis-must-be-stated
  - best-of-n-parameter-sweep
---

# Regeneration versus repair economics

An automated gate has just rejected a generated asset. This subject is what happens in
the next second, and there are exactly three branches: **pay for another roll**, **repair
it locally for what the repair costs**, or **ship it with its residual defects named**.
The naive pipeline has only one branch — regenerate until good — and that branch is not a
strategy. Once each attempt costs money, "until good" is an unbounded purchase order
signed by a process that cannot see the bill.

The decision is a *routing* decision, and it is made from the defect classification, not
from the score. Which is why the shape of this subject is fixed: a rejection arrives as a
list of named defect classes; each class maps to the remedy that can actually cure it;
where no remedy on the map applies, the honest outcome is refusal, and refusal routes to
the third branch. The general practice of metering and attributing model spend is a
separate operator concern and is not duplicated here — what follows is only the craft
judgment that decides what to do with one rejected artifact.

## Regenerate-until-good fails for a structural reason, not a budget reason

The reason is worth stating precisely, because the budget framing invites the wrong fix
(a spend cap) when the real fix is a classification. Most defects in generative output
are **properties of the stage, not of the draw**. A raw generator handing back dense,
fragmented geometry does so on every roll, because density and fragmentation are what that
stage produces. Rolling again samples the same distribution and returns the same defect
class with different numbers on it. Measured on one image-to-3D generator: four
independent rolls of a single prompt scored zero out of a hundred on all four, and every
one of them was condemned for the same class — stray disconnected fragments, sixteen to
fifty of them, and thirty-five to fifty-six substantial parts. The counts moved every
roll. The verdict never did.

So the first discrimination is not *how bad* but *what kind*:

- **Draw-determined defects** — the generator returned nothing, or returned something
  flat and degenerate. A bad draw genuinely can come back different. These are the classes
  where another paid roll is a rational act.
- **Stage-determined defects** — density, part count, fragmentation, unwrapped surfaces.
  These arrive every time and are cured, if at all, by the next processing stage.
- **Content defects** — it is the wrong thing, or it does not read at silhouette distance.
  A structural gate cannot see these; a different critic must, and the remedy is upstream
  of generation, in the input.

A pipeline that cannot tell these apart will pay for the second category and be surprised
that nothing improves. The list of draw-determined classes is usually **very short** —
two, in the measured case above — and that shortness is the finding, not a gap in the map.

## The map is built from measurement, and measurement will contradict you

The single most valuable thing in this subject is a worked example of intuition being
wrong. The obvious remedy for geometry that is far over budget is a local reduction pass,
and the obvious belief is that reduction, being a simplification, cannot make anything
worse. Measured on a real before/after pair: a mesh at roughly 1.48 million faces with
two components and one stray fragment graded *warn*; after reduction to about 47,000
faces it had **seventeen components and sixteen stray fragments** and graded *fail*. The
reduction cured the defect it was aimed at and multiplied the defect that was actually
driving the rejections across the corpus.

Two rules fall out, and both are load-bearing:

1. **A remedy earns its place on the map by measurement on a before/after pair, never by
   plausibility.** The pair is the unit of evidence: the same artifact, graded by the same
   grader, before and after the remedy ran.
2. **A remedy is listed only for the classes it demonstrably resolves.** Listing the
   dominant failure class under a remedy that does not cure it lets a routed repair claim a
   cure it will not deliver, and the pipeline then spends real minutes to arrive at the same
   verdict. The temptation to list it is strong precisely because it is the dominant class —
   resist it.

The procedure for building and maintaining the map is
[defect-class-to-remedy-map](techniques/defect-class-to-remedy-map.md). The defect taxonomy
it consumes — the codes, the severities, the fail/warn split — is authored by the
acceptance gate and is a separate subject; the seam is that **acceptance names the defect,
this subject decides its remedy**, and neither may quietly redefine the other's vocabulary.
When acceptance adds a class, the map gains an entry whose remedy is *unknown* until
someone measures a pair. An unmapped class is not a class with no remedy; it is a class
whose remedy has not been established, and the two must render differently.

## Refusal is a routing outcome, not an error

A router that must always produce a plan will produce a bad one. Give it a first-class
refusal: a stated precondition failure, naming what was asked, why no remedy applies, and
what would have to change. A refusal costs nothing, is auditable, and is strictly better
than a repair run that burns compute to reproduce a verdict.

Refusal also carries the operational half. A repair stage is real machinery: it takes
paths, allocates memory proportional to input size, and writes files. The router is the
component that decides to invoke it, which makes the router the right place to bound it —
never invoke an operation with a known pathological cost profile, never accept a
caller-supplied write destination when a derived one inside an allow-listed location will
do. One measured incident is enough to justify the permanent ban: a component-splitting
operation over high-density geometry that consumed 211 GB and took the machine down. The
operation stayed unreachable only because nothing called it; the first router to exist is
the first thing that could, and it must decline in code, not in a comment.
[refuse-the-fix-that-cannot-help](techniques/refuse-the-fix-that-cannot-help.md) covers
both halves. What the repair bench itself does — joining, reducing, unwrapping, baking —
belongs to the finishing subject and is not re-derived here.

## The arithmetic, and the null option

When a class *is* draw-determined, the branch is still a purchase, and a purchase deserves
arithmetic. Compare four numbers, in the same unit, over the same asset class: the cost of
a roll, the expected improvement per roll, the cost of the local repair, and the cost of a
person doing it by hand. Expected improvement is the term everyone skips, and it must come
from the **measured pass rate of the class you are actually re-rolling**, not from an
assumption that the next one will be fine. A re-roll whose expected improvement is unknown
is a purchase made blind; the correct response to an unknown pass rate is to measure it
over a small sample, not to buy anyway.

The null option — accept the artifact, name its residual defects, and move on — is the
third branch and it is real. It is correct whenever the residual defects are tolerable at
the artifact's tier, whenever the remedy costs more than the defect, and whenever the
remedy is unknown. It has one hard requirement: the residuals travel with the artifact,
named by class, so the next stage cannot mistake a knowingly-accepted defect for a clean
pass. That is the difference between shipping a compromise and shipping a lie. Placement
of the gate *before* the paid stage, so that a doomed input never becomes a bill, is a
neighbouring concern; this subject starts after the money has been spent once.
[reroll-economics-per-credit](techniques/reroll-economics-per-credit.md) is the
arithmetic.

## A loop needs a bound before it needs a critic

Published agentic-generation methodology converges on one loop — generate, observe,
critique, refine — and the papers that describe it are candid that they specify no
termination criterion. Do not adopt the loop without adding one. An unbounded
critique-and-refine cycle is not a pipeline; it is a process that can oscillate between two
valid-looking outputs forever while paying for each transition.

The bound is a hard cap on attempts, paired with a spend or time budget, and a **recorded
best** so the cap is not a total loss. "Stop when it stops improving" is a weaker criterion
and should not be the primary one: improvement is measured by the same critic that may be
wrong, the signal is noisy across stochastic rolls, and a plateau is indistinguishable from
a critic that has saturated. Cap first; use the improvement signal only to stop *earlier*.
Two further disciplines from the same literature transfer directly: a critic that shares a
mind with the generator will ratify its own mistakes, so prefer a separate critic or a
deterministic tool-grounded one; and structured critique output beats free-form, because
the loop has to route on it. When the cap is reached, emit the best attempt, its score, its
basis, the attempt count, and the residual defects — never silently the last one, and never
silently nothing.
[bounded-refine-iteration](techniques/bounded-refine-iteration.md) is the loop contract.

## A score without its basis cannot be compared, and comparison is the whole job

Every branch here ranks things: this roll against that roll, this variant against that one.
Ranking is done on a score, and a score is only meaningful alongside the basis it was
computed on. The failure is concrete. A blend of two components — structural health and a
fidelity measure — silently reads a missing component as zero, so a generator that reports
no fidelity measure at all has every one of its outputs halved. A structurally perfect
artifact reads as mediocre, the cap is invisible in the number, and the ranking inverts.
The fix is not a better default: **drop the component nobody measured, state what remains,
and never average in a measurement that does not exist**. Averaging an unmeasured component
is a claim of precision that was not earned.
[score-basis-must-be-stated](techniques/score-basis-must-be-stated.md).

## Buy variance you already own before you buy variance you must pay for

Before the paid branch, there is a cheaper one that is often better: sweep the parameters
you control, generate several attempts, grade each one, keep the best. For a deterministic
generator this is the *only* free lever — re-running the same input returns the same output
byte for byte, so the sweep must vary something real: input framing, extraction resolution,
the input image itself. For a stochastic generator it is best-of-n in the ordinary sense.
Either way, the selection is only as good as the grader, and the cost is n times the
generation cost, which is exactly why the sweep belongs on the free or cheap side of the
ledger and n stays small.

Two rules keep the sweep honest. First, sweep **one axis at a time** unless you can afford
the cross product, and record which axis moved — a sweep whose winner cannot be attributed
teaches nothing for the next asset. Second, keep every candidate and its card, not just the
winner: the losers are the measured pass-rate data the economics branch needs, and they are
free once generated. [best-of-n-parameter-sweep](techniques/best-of-n-parameter-sweep.md).

## The naive readings, in one place

- *"Regenerate until it passes."* Pays repeatedly for a class the draw cannot change.
- *"The score went up, so the remedy worked."* Not without a before/after pair on the same
  artifact and the same grader — a remedy that cures one class while multiplying another
  can raise a scalar and lower the verdict.
- *"Repair is free, so always repair."* Repair costs minutes, memory and risk; a repair
  that cannot address any failing class costs all three and delivers the same verdict.
- *"Shipping with defects is failure."* Shipping with **unnamed** defects is failure.
  Naming them is a result.
- *"The loop will converge."* Only if something makes it. Nothing does, by default.
