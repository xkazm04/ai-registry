---
status: EXECUTED (2026-10-25, intake-vr-fidelity-20261024; operator picked "forge it now"; worker overrides: stack tokens, ceiling-estimate evidence, salience ranked by the judge, grade verdict unmeasurable, "two rounds" dropped; legibility-floor technique deferred to a lead)
source: librarian/sources/2026-10-25-vr-concept-fidelity.md
run_id: intake-vr-fidelity-20261024
bundle: game-production
category: content-pipeline
subject: concept-scene-parity
resolved_path: knowledge/game-production/content-pipeline/concept-scene-parity/
category_count: content-pipeline holds 9 subjects now and 10 after; the cap is 10, so V1 clears and the category is then full. engine-integration is AT the cap (10) and was rejected for that reason. asset-production/surface-and-imagery (5) was rejected on the merits, because this subject judges a whole composed scene, not a surface.
---

# Spec: concept-scene-parity

## Why this is XL, and why it is a forge rather than an amendment

An operator dispatch asked one question: can a small team with agents bring a real-time VR scene to a painted concept's
level, 40 of 45 on a per-element scorecard? Five research workers and four builders worked it for one day on a managed
project (bp, `apps/vr`, UE 5.8 forward VR path). The scorecard moved 5/45 to 19, then to 28 by the builders' reading;
the operator read it at 25 to 30.

Five candidates came out of that run with the same home-if-new:
- a per-element scorecard with ceilings;
- judging under the destination light;
- scoring only what the device shows;
- excess-only grading;
- naming what caps each element.

No subject's stated job is "make a composed real-time scene read as its concept image". The closest neighbour,
`reference-parity-gating`, measures ONE generated artifact against a reference it reproduces (geometry, envelope). This
is the scene-level, painted-target, judged-by-eye case, and its forces differ:
- the reference is a painting no engine can reproduce exactly;
- the judge is a person at a fixed camera;
- the levers are spread over art, engine, data and composition.

Three or more candidates with one home fires the XL trigger mechanically. The evidence is one project's day (n=1, with
the operator's verdict as the grader), so every technique must be argued from first principles and the neighbours, not
from the run.

## The subject's job (the golden path's opening must say this and name its boundaries)

A team has a concept image (painted, photographic, AI-generated) and a real-time scene that must come to read as it. The
subject owns the loop that turns "it looks dated" into a measured, attributable gap and a plan:
1. decompose the concept into elements;
2. capture the scene from the concept's camera;
3. score each element;
4. attribute each element's cap to its stage (asset, engine, data, composition);
5. fix the cheapest cap first;
6. re-capture under the same conditions.

It also owns the feasibility question: when to stop and record a limit.

It must NOT absorb any of the following. Say each boundary in the golden path, in prose, with no cross-bundle links:
- **Generated asset vs its own reference.** `reference-parity-gating` owns that. This subject starts where assets are
  placed in a lit scene.
- **Generation-time style consistency.** Media-generation's `visual-style-locking` owns it. Name the discriminator: style
  locking keeps generations alike; this subject makes an engine scene match one image.
- **Which renderer features a headset can afford.** `standalone-headset-frame-budgets` owns that. This subject consumes
  its allowance and reports budget beside every look result.
- **Prompt craft for concept images.** Media-generation owns it.

## Proposed techniques (the decision rule each must carry)

1. **`element-scorecard-from-the-concept-camera`**
   - **Rule.** Decompose the concept into its 10 to 20 visible elements, written down once. Score each 0 to 3
     (absent / placeholder / reads as the element / matches) from a capture at the concept's camera. Report every zero
     and every element by name; a total alone is not a result.
   - **Before building, estimate a ceiling per element** and name its cap. After each round, compare estimate with
     measured.
   - **Evidence.** Five research reports estimated 38 to 42 of 45. One build day measured 28 (operator 25 to 30). The
     estimates were each right about their stage and wrong about the total, because each assumed the other stages would
     deliver 3s. The drafter must say what a ceiling estimate is good for (ranking levers) and what it is not
     (predicting the total).
   - **Corollary to `no-average-hides-a-failure`:** the same law at scene scale. Name it; do not link it.
2. **`judge-in-the-destination-light`**
   - **Rule.** An asset is reviewed only under the destination's own light and reflection environment: dark scene,
     practical lights, the engine's real shadow, AO and reflection setup. Never under a neutral grey studio.
   - **Why.** Grey light hides missing bevels, flat roughness and absent AO, so assets pass review and fail in place.
   - **Evidence.**
     - **Convergence:** two independent research workers reached it from different directions. One came from bpy
       finishing; the other came from engine source showing that the reflection method set to none still uses placed
       probes, and that with no probe placed every glossy surface reflects black.
     - A builder applied it (in-context EEVEE renders), and the operator judged the finished prop better.
   - **Boundary case to include.** A light build re-captures the probes, so glossy surfaces must be re-read after every
     bake. A probe beside a large emissive panel mirrors it onto every glossy surface. The operator judged two probe
     brightnesses a tie, so the rule here is "re-read and adjust", not a number.
3. **`score-only-what-the-device-shows`**
   - **Rule.** The capture that scores must contain only what the target device shows. No capture-only depth of field.
     No compositor layers, which are absent from flat captures but present in the headset (and the reverse). Identical
     pose, FOV and resolution every round.
   - **The pose command must log what the view actually rendered, not what was requested.**
   - **Evidence.** In this project a pose command's FOV never applied until a later change added a camera. Two rounds of
     "approved" captures were taken at a default 90 degrees against a declared 70. That was found only when the
     declared value started to apply and cropped the frame.
4. **`grade-only-the-excess`**
   - **Rule.** When fitting a colour grade (a LUT) from a neutral capture to the concept on a few matched regions:
     - keep the tone curve's highlight shoulder;
     - fit only the excess of the channel that is off (for example, blue above red and green);
     - never fit a full colour matrix or per-channel curves from a handful of regions.
   - **Why.** Both overfit, and they shift skin, amber accents and neutrals. Switching off the tone curve to hit an
     authored colour clips emissives flat white.
   - **Evidence.** The builder's three fitted variants: full matrix turned skin lavender, per-channel curves yellowed
     neutrals, excess-only held. The tone curve had been switched off in an earlier round to protect the paper's blue.
5. **`cap-attribution-before-the-next-round`**
   - **Rule.** After each round, every element below 3 names the ONE stage that caps it: asset, engine, data or
     composition. The next round is funded for the cap with the best score gain per unit of effort, not for the stage the
     team is fastest at.
   - **Evidence.**
     - After the engine round (reflections, bake, rect-light enable, filmic grade, fog), all 15 elements sat at 2 or
       below, and every builder named asset or content as the cap, not rendering.
     - The operator then redirected to sheet clarity and typography, a composition and data cap that no research worker
       had ranked first.
   - **Open question for the drafter.** Does the operator's redirect show that cap attribution must be done by the judge,
     not by the builders? Say what the run shows and what it does not.

**Optional 6th, only if it survives its own argument.** `legibility-floor-from-the-capture-pose`: text classes get floors
in arc-minutes computed at the scoring pose, and a class that cannot reach its floor is dropped, never shrunk. A builder
(FC3) is measuring this while this spec is written. Leave it out unless the source note's addendum carries its numbers.

## Applications to write (the source tree is opened, and bp is public)

At least one application against bp (`stack: ue58-forward-vr`) for techniques 1, 2 and 4, citing:
- `docs/concepts/vr-light-table/runs/2026-10-24-lynx-l34.md` (the scorecard);
- `docs/concepts/vr-light-table/art-breakdown.md` (the element list);
- `scripts/art/studio-kit/render_context.bpy` (in-context review);
- `scripts/lookdev/fit_grade_lut.py` (excess model);
- `apps/vr/tools/mcp-steps/py/fid_look.py`.

Each carries `applied: code`, `ab_verdict` from the operator's verdict (`renders verdict.json`, unblinded, recorded as
such), and `verified_on: 2026-10-25`. Quote every anchor so `scripts/check-anchors.mjs` can verify it against the bp tree.

## Boundaries the drafter decides, rather than discovers
- Whether "feasibility stop rule" (when to stop chasing and record a limit) is a technique or a golden-path section.
  Evidence: the operator framed the run as a go/no-go on making a game.
- Where generated concept art that no engine can match (photographic depth of field, film halation) is scored: as the
  ceiling of 3, or flagged per element as unattainable on the device.

## Neighbours the worker must read first
- `game-production/content-pipeline/reference-parity-gating` (golden path and all techniques);
- `game-production/couch-and-tv-play/immersive-interaction/standalone-headset-frame-budgets` and its
  `forward-path-feature-allowance`;
- `game-production/asset-production/geometry/mesh-finishing-for-engine-readiness`;
- `media-generation/visual-generation/visual-style-locking`.

Resolve each through its bundle's `index.json`.
