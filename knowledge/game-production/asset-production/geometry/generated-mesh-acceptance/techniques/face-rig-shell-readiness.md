---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: face-rig-shell-readiness
status: forged
laws: [compiling-is-not-wiring, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding whether a generated head can be rigged for expressions, gating an expensive downstream stage on a structural precondition, separating asset health from fitness for a job]
---

# Face-rig shell readiness

A **structural precondition for a downstream capability**, measured from geometry alone and
reported separately from the asset's health score. The concrete case: a head can only be
given expressions if the parts that expressions move exist as separable shells.

The pattern generalises. Wherever an expensive later stage has a precondition that is
knowable cheaply from the artifact as it stands, measure it at the gate and report it as
its own axis — not as a pass, not as a fail, as a *readiness*.

## The rule

Expressions and gaze need the eyes, lashes, brows and interior mouth to be addressable
independently. Blend-shape and gaze rigging drive those regions as separate geometry; a
head that arrived welded into a single shell cannot be given them by any tool, because
there is nothing separable to drive.

That yields a minimum: **at least four substantial separable shells** before expression
work is worth attempting at all. Count substantial shells with the face-share rule —
specks are not shells, and a head sprayed with debris is not four-parts-ready because it
has 300 components.

Three outcomes, and all three are real answers:

- **Ready** — enough separable shells; name the count in the reason.
- **Not ready** — with the reason distinguishing the single-welded-shell case (nothing
  separable at all) from the too-few-shells case (some separation, not enough).
- **Unmeasured** — the per-component histogram was absent, so readiness is null with a
  reason saying so. Readiness is never claimed from data you do not have.

## Keep it out of the health score

This is the discipline that makes the technique safe, and it is the one most often
violated: **do not fold readiness into the pass/warn/fail verdict.**

A prop with one shell is perfect. A head with one shell is perfectly healthy and merely
unsuitable for a different job. Fold the second into the first and you have built a gate
that fails props for being props — and you will then be pressured to special-case asset
classes out of a rule they never should have been inside.

Readiness is display and routing: it decides whether to *spend* on a rigging attempt, not
whether the asset may enter the engine. Emit it beside the scorecard on the same card, with
its own field and its own three-valued type.

## Procedure

1. **Derive the component split** from the per-component histogram using the face-share
   rule; do not use a raw component count.
2. **If the split was not measured, return unmeasured** with a reason naming the missing
   input. Do not fall back to the raw count — the raw count is the exact conflation the
   rule exists to remove, and here it would over-claim readiness on a debris-covered mesh.
3. **Compare substantial parts against the minimum shell count.** Return ready with the
   count.
4. **Otherwise return not-ready with the discriminating reason**, so an operator can tell
   "regenerate with separated parts" from "this is nearly there".
5. **Route on it.** Gate the expensive rigging stage on readiness, and let a
   not-ready result short-circuit before the stage spends time.

## Decision rules

- **When the asset class does not want the capability, do not compute or display the
  readiness.** A rock has no expression readiness and printing "not ready" for it trains
  people to ignore the field.
- **When the minimum shell count is tuned per pipeline, keep it a named constant** with the
  reasoning attached — four is derived from the regions expressions actually move, not from
  a distribution.
- **When readiness is false, prefer a generation strategy that produces parts separately**
  over trying to split a welded shell afterwards. Separating a welded head is manual work;
  generating parts separately also preserves sharper local detail.
- **When a structural precondition is satisfied, that is not evidence the later stage will
  succeed.** Four shells make expression rigging *possible*; nothing about the count makes
  it *good*.

## When not to use this

- **As a quality signal.** It is a possibility claim about a downstream stage and nothing
  more.
- **As a fail condition.** Covered above — this is the core constraint of the technique.
- **For preconditions that are not knowable from the artifact.** If deciding the
  precondition requires running the later stage, you do not have a readiness check; you
  have the stage.
- **On an asset whose component structure was not measured.** Unmeasured is the answer, and
  a routing layer must treat it as "cannot decide", never as "go ahead".
