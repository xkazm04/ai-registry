---
layer: technique
type: technique
subject: game-economy-tuning
technique: progression-curve-shape-tests
status: forged
laws: [structural-proof-is-never-sufficient, law-and-check-share-one-source]
use_when: [validating an experience or cost curve against its stated design, a curve feels wrong late but fine early, deciding whether to retune or rewrite a formula]
shared_with: []
---

# Testing a progression curve's shape

The named concern: **whether a curve is the kind of function the design says it is.**
Not whether its values look reasonable — whether its *family* is right. These are
different defects with different repairs, and collapsing them costs a season.

A curve with wrong coefficients is tuned. A curve with the wrong shape cannot be tuned:
every coefficient adjustment that fixes one end breaks the other, and the team
discovers this only after months of adjustments that each helped locally. The
diagnostic that separates them takes an afternoon.

## Why spot checks cannot find a shape error

Any two curves can be made to agree at any two points. If the design calls for
geometric growth — each level costing a fixed multiple of the previous — and the
implementation is polynomial, a check that samples an early level and a mid level can
find both values entirely acceptable while the curves diverge by an order of magnitude
at the top of the supported range.

This is the local form of a general rule: that an artifact exists and its properties
have plausible values proves nothing about its behaviour over its range. A curve that
parses, evaluates and returns sensible-looking numbers at the levels a designer has
personally played has passed a structural check and no behavioural one. The
behavioural check is over the full range and about the ratios, not the values.

## Procedure

1. **State the intended family, in the canon, in prose, with its parameter.** "Each
   level costs about 1.15 times the previous, from level one to the cap" is a testable
   claim. "Costs rise steeply" is not. The check reads its target from that statement,
   so the intended shape and the enforced shape cannot drift apart.
2. **Evaluate the curve across the entire supported range**, not a sample of convenient
   points. Cheap; there is no reason to sample.
3. **Compute the diagnostic that discriminates the family**, and compare it against the
   claim:
   - *geometric*: the ratio of each step to the previous is near-constant;
   - *polynomial*: the ratio of successive steps declines toward one as level rises,
     while the ratio of logarithms is near-constant;
   - *linear*: the difference between successive steps is near-constant;
   - *logarithmic / soft-capped*: successive differences shrink toward zero.
   Do not test by fitting and reporting a goodness-of-fit number; a polynomial fits a
   geometric curve well over a short range and the fit statistic will tell you so.

   For the geometric case the diagnostic reduces to one number worth stating exactly:
   the **coefficient of variation of the consecutive-step ratios**. A truly geometric
   curve has a constant ratio and therefore a coefficient of variation near zero;
   a tolerance of 0.15 separates real geometric growth from a polynomial cleanly, because
   a polynomial's step ratios start far above the intended growth base and decay toward
   one across the range. That decay is the signature, and it is visible in three points.
4. **Report the verdict as a family comparison**: claimed family, observed family, the
   diagnostic value, the range it was computed over, and the divergence at the top of
   the range expressed as a multiple. That last number is what makes the finding
   actionable — "at the level cap, the implemented curve asks for 0.3x what the stated
   shape asks for" is a decision-grade sentence.
5. **Then, and only then, check the coefficients** — first-level cost, growth parameter,
   value at cap — against their intended values. Coefficient findings on a curve of the
   wrong family are noise.

## The deviation that is a design decision

A shape check will sometimes fail on a formula that is deliberate. A polynomial cost
curve in a game whose canon calls for geometric growth may be a considered choice to
keep late-game grind humane, made years ago, working fine.

The honest handling has three parts and no shortcuts. Record it as an accepted
deviation with its reason and its author. Keep the check firing — a suppressed check
becomes an unknown within two releases. And change the canon if the deviation is in
fact the design: the failure mode to avoid is a canon nobody believes, kept intact for
tidiness while the real design lives in an exception list.

What is not acceptable is loosening the diagnostic tolerance until the implemented
curve passes. That converts a known, documented divergence into an invisible one, and
it removes the check's ability to detect the *next* divergence.

## Decision rules

- **When the family is wrong, do not tune. Decide.** Either the formula is rewritten to
  the stated family and every dependent value re-derived, or the canon is amended to the
  family that shipped. Choosing neither is choosing the third option — a curve nobody
  can reason about.
- **When the divergence at the top of the range is under about 10%, treat it as a
  coefficient question.** Family arguments about curves that nearly coincide over the
  whole supported range are theology.
- **When the curve is piecewise, test each segment's family separately and test the
  joins.** The common defect in a piecewise curve is not a wrong segment but a step
  discontinuity at a join, which players experience as a wall.
- **When a curve's supported range grows — a level cap raised — re-run the shape test
  before shipping.** A curve validated to level sixty says nothing about level ninety,
  and a raised cap is exactly the moment a family error becomes visible.
- **When the curve drives multiple systems, test it once at its source.** A cost curve
  copied into a second system to be "adapted" is a second authority on the same
  quantity, and the two will diverge.

## When not to use this

- **On a hand-authored table with no formula.** A per-level table authored by a designer
  has no intended family; checking it for one produces a finding about the check.
- **Before the level cap is decided.** The most useful output of the test is divergence
  at the top of the range, and without a cap there is no top.
- **As a quality judgment.** A curve can be exactly the stated family and still be a
  miserable pace. Shape conformance says the implementation matches the design; whether
  the design is good is a playtest question.
