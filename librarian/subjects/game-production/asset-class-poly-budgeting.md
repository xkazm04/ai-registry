---
domain: game-production
subject: asset-class-poly-budgeting
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# asset-class-poly-budgeting

## Architecture review - 2026-09-10

Read all nine documents. Clarified units, request provenance, allocation and
quality evidence. Both historical applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/asset-class-poly-budgeting",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:98668e0d5aba7cca",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A duplicated triangle mesh can produce a 2x ratio without a quad-unit error.",
    "Quad-dominant topology does not guarantee exactly two triangles per counted face.",
    "A budget of one passes a positive-number guard but halves to zero quads.",
    "A shared mesh can save storage while multiple instances still render triangles.",
    "A smaller result can satisfy both quality and a maximum budget."
  ],
  "sources": [
    {
      "url": "https://docs.meshy.ai/en/api/text-to-3d",
      "scope": "Current model/configuration-dependent topology and target settings; does not validate historical consumer or exact quad conversion."
    },
    {
      "url": "https://dev.epicgames.com/documentation/unreal-engine/working-with-naniteenabled-content",
      "scope": "Current documentation includes skeletal meshes; counterexample to blanket exclusions, not project eligibility or performance evidence."
    }
  ],
  "documents": {
    "asset-class-poly-budgeting.md": {
      "disposition": "clarify",
      "reason": "Define units, stages, provider configuration and separate quality/performance evidence."
    },
    "techniques/triangles-as-the-authored-unit.md": {
      "disposition": "clarify",
      "reason": "Avoid universal loader claims and preserve legitimate companion budgets and migration uncertainty."
    },
    "techniques/provider-face-limit-conversion.md": {
      "disposition": "clarify",
      "reason": "Restrict halving to verified pure quads; reject infeasible or invalid requests without dropping limits."
    },
    "techniques/quad-trap-detection.md": {
      "disposition": "clarify",
      "reason": "Treat ratio bands as diagnostic leads and distinguish targets from hard limits."
    },
    "techniques/budget-shapes-output-not-just-caps.md": {
      "disposition": "clarify",
      "reason": "Scope causal claims and preserve legitimate geometry uses and experiment evidence."
    },
    "techniques/part-split-budget-division.md": {
      "disposition": "clarify",
      "reason": "Validate allocation inputs, feasibility and assembly accounting; distinguish storage reuse from instance cost."
    },
    "techniques/class-ceiling-vs-requested-budget.md": {
      "disposition": "clarify",
      "reason": "Separate unknown/inapplicable status, hard ceilings and advisory adherence across stages."
    },
    "applications/node--provider-face-limit-conversion.md": {
      "disposition": "reverify",
      "reason": "Reverify helper guards and provider/model semantics; retain historical runtime claims as unverified."
    },
    "applications/process--class-ceiling-vs-requested-budget.md": {
      "disposition": "reverify",
      "reason": "Reverify local policy parity, split validation and version-specific engine support."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all nine documents at their reverted bytes, re-read the cited consumer
(`C:/Users/kazda/kiro/pof`, `master`) as source, and checked one external currency claim.
Reading source is not executing it: no mesh was generated, measured, or graded.

The core doctrine survives adversarial reading intact. One authored unit, converted
explicitly at the edge, floored not rounded, with the delivered-versus-requested grade
kept separate from the class-ceiling grade and every absent input rendering as
*unmeasured* — each of the four steps is stated with the specific failure it prevents,
and the incident that motivates the whole subject ("I should have said triangles") is a
real recorded event rather than an illustration. The budget-shapes-output argument is the
part that inverts an engineer's intuition, and it is carried by a non-monotonic measured
curve (1,500 quads unusable / 3,000 correct / 6,000 invented a whole head) with the right
reading attached: non-monotonicity is the signature of an instruction, because a cap can
only ever fail downward. The two honesty rules in `class-ceiling-vs-requested-budget` —
never fabricate a request, never promote an unclassified asset — are both stated with the
false sentence they would otherwise produce, which is what makes them memorable enough to
survive a deadline.

I verified the consumer claims and they are exact. `FACE_BUDGET_UNIT` is at
`face-budget.ts:29`, `BUDGET_OVERRUN_TOLERANCE = 1.1` at `:36`, `QUAD_TRAP_BAND = [1.8,
2.2]` at `:39`, `quadBudgetFromTriangles` floors at `:59`, and both `unmeasured` guards
run before any arithmetic at `:109` and `:113` with the reason strings the document
quotes. The preset corpus matches row for row: character 40,000/60,000/24, weapon
15,000/22,500/6, prop 10,000/15,000/6, environment 60,000/90,000/40, modular-part
8,000/12,000/3. This is the most accurately cited application in my group.

Which makes the one contradiction easy to state. The golden path's per-class table gives
the character row the rationale "the highest per-asset budget in the project" while the
environment row two lines below it sits at 60k against the character's 40k. The consumer
carries the same sentence in the same record. The appended "Review boundary - 2026-09-10"
on `process--class-ceiling-vs-requested-budget.md` noticed this and it is right: either
the rationale means "highest among the character-pipeline classes" and should say so, or
it is simply wrong and should be cut. Both the golden path and the process application
carry it.

The second finding is currency rather than error. The golden path's virtualized-geometry
section argues that budgets survive because "skinned and deforming meshes, translucent
materials, and anything driven by per-vertex position offsets fall outside the virtualized
path on most engines". Skinned meshes are no longer categorically outside it: Unreal has
carried Nanite skeletal-mesh support since 5.5, gated behind
`r.Nanite.AllowSkinnedMeshes=1` (with `r.Nanite.Tessellation=1` for the displacement
path). The clause is hedged with "on most engines", so it is not flatly false, but a
dated eligibility claim that a reader will act on needs its engine and version pinned. The
appended boundary on that application makes the same point and I affirm it. Note that the
subject's *argument* is unaffected: the decisive reason it gives is the fourth one — the
generator still needs the number, because a budget too large makes a worse mesh — and that
reason has nothing to do with what the renderer can draw.

**Retraction.** The same appended boundary asserts "A parts<1 check alone does not reject
fractions, infinity or NaN." I read the function. `planPartBudget`
(`polycount-presets.ts:183`) guards `!Number.isFinite(parts) || parts < 1`, which rejects
both infinity and NaN. Only the fractional case survives, and a fractional part count is a
caller error the technique's step 6 does not contemplate either. Two thirds of that
sentence is wrong and it should be narrowed to the fraction case; I am recording the
correction here rather than deleting the paragraph, since I do not edit knowledge.

The rest of that boundary's claims stand or are unresolvable from a document review. Its
Meshy citation is fair — quad-dominant output does not establish an exact two-triangle
conversion — though it overlaps with what `quad-trap-detection` already does about it, by
using a [1.8, 2.2] band rather than an equality test, for exactly that reason. Its
observation that "geometry can legitimately represent lettering or other raised detail" is
a fair boundary on `budget-shapes-output-not-just-caps`'s step 5, which states the
lettering rule without scoping it to generated detail at generation-time density.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/asset-class-poly-budgeting",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:edd3d67956a8cda2",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read at reverted bytes. The cited consumer (C:/Users/kazda/kiro/pof src/lib/visual-gen/face-budget.ts and polycount-presets.ts) was read as source and every named constant, guard and preset row was checked against the applications' claims. One external currency claim (Nanite eligibility for skinned meshes) was checked. Not evaluated: no mesh was commissioned, generated, measured or graded; the hair-density and lettering observations are historical measurements that were not reproduced; the per-class numbers' defensibility against the stated camera distance and platform target is a rendering question this review did not test; the Meshy API's current parameter semantics were not exercised against a live request.",
  "counterexamples": [
    "asset-class-poly-budgeting.md: the per-class table itself. The character row's rationale claims 'the highest per-asset budget in the project' while the environment row in the same table carries 60k against the character's 40k, so the table refutes its own annotation two lines apart.",
    "quad-trap-detection: an asset whose delivery is near 2x because the generator mirrored the mesh, and whose request was for quad topology. The band fires, the message names the unit trap, and the caller re-sends a halved budget - which does nothing, because the defect is a duplicated shell. The technique names the mirrored case in 'when not to use it' but the guard it offers (check whether the request asked for triangles) does not distinguish it when quads genuinely were requested.",
    "part-split-budget-division: parts that are generated, merged and retopologised before shipping, where the retopology ratio is not known in advance. The technique's own 'when not to use it' says the pre-merge counts are scratch, which leaves the division as guidance with no stated way to set a pre-merge target - the case where a generator spending wildly per part is most likely and least detectable.",
    "class-ceiling-vs-requested-budget: a provider that silently clamps a requested limit and does not report the clamp. The decision rule says treat the clamped value as what was requested, which requires knowing it was clamped; where the provider is silent, the grader accuses it of ignoring a budget it partly honoured, which is the same false-accusation failure the fabricate-no-request rule exists to prevent."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/visual-gen/face-budget.ts:29-39, :59, :109-118",
      "result": "Confirmed FACE_BUDGET_UNIT, BUDGET_OVERRUN_TOLERANCE = 1.1, QUAD_TRAP_BAND = [1.8, 2.2], the flooring conversion, and both unmeasured guards running before any arithmetic with the quoted reason strings. Establishes that node--provider-face-limit-conversion is accurate against current bytes; does not establish that the conversion matches any provider's live semantics, which the technique itself says only a measured delivery can settle."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/visual-gen/polycount-presets.ts:68-108, :180-191",
      "result": "Confirmed all five preset rows match the application's table exactly, and confirmed planPartBudget guards !Number.isFinite(parts) || parts < 1 - which refutes the appended review boundary's claim that the check does not reject infinity or NaN. Fractional part counts are indeed unguarded. No budget was planned or graded."
    },
    {
      "url": "https://forums.unrealengine.com/t/nanite-skeletal-mesh-in-unreal-engine-5-5-main/1792367",
      "result": "Established that Unreal has supported Nanite skinned meshes since 5.5 behind r.Nanite.AllowSkinnedMeshes=1 (with r.Nanite.Tessellation=1 for displacement), so the golden path's 'skinned and deforming meshes fall outside the virtualized path on most engines' is a dated claim needing an engine and version pin. It does not establish that the path is default-on, production-ready, or performant for the asset classes in the table, and it says nothing about non-Unreal engines."
    }
  ],
  "documents": {
    "asset-class-poly-budgeting.md": {
      "disposition": "clarify",
      "reason": "Two fixes. (1) The character row's rationale 'the highest per-asset budget in the project' is contradicted by the environment row in the same table (60k against 40k); scope it to the character pipeline or cut it. (2) The virtualized-geometry eligibility claim that skinned and deforming meshes fall outside the path is dated - Unreal has supported Nanite skinned meshes since 5.5 behind r.Nanite.AllowSkinnedMeshes - and needs its engine and version pinned. Neither touches the section's decisive argument, which is that the generator needs the number regardless of what the renderer can draw."
    },
    "techniques/budget-shapes-output-not-just-caps.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The non-monotonic measured curve is the right evidence for the claim and the reading attached to it (a cap can only fail downward, so non-monotonicity is the signature of an instruction) is correct. The probe-at-three-budgets procedure, the record-the-chosen-budget rule and the two exclusions in 'when not to use it' (post-process decimation, deterministic human authoring) are each scoped with a reason. Step 5's lettering rule would be sharper if scoped to generated detail at generation-time density, but as an instruction to a generative pipeline it is not wrong."
    },
    "techniques/class-ceiling-vs-requested-budget.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The two questions are genuinely different and the document proves it with the case a single gate cannot see - a doubling that stays inside a class ceiling. Both honesty rules are stated with the false sentence they prevent, the disagree-usefully reading of the two verdicts is the payoff, and the 1.5x ceiling ratio is given as a working ratio with its reason rather than as a constant."
    },
    "techniques/part-split-budget-division.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The arithmetic that replaces the modular limit's headroom claim is correct (eight parts at 8k against a 40k character), the apply-only-when-it-binds rule avoids triggering the shaping problem in the other direction, the constrained flag carries the information downstream, and the split-is-wrong-not-the-budget rule names the real remedy when a division drops below a part's useful floor. Budgeting the joins is the detail that is only learned by measuring an assembled mesh."
    },
    "techniques/provider-face-limit-conversion.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Modelling the request as a budget-plus-topology pair is what stops the halving from being hardcoded, the floor is a decision with a stated reason, returning nothing for unusable input propagates as unmeasured rather than as a fabricated limit, and the clamp rule prevents grading against a number the service never accepted. The verification section correctly separates unit-testable arithmetic from the one empirical check that can catch a wrong belief about vendor semantics."
    },
    "techniques/quad-trap-detection.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Ratio rather than difference, tolerance before band, a band rather than an equality test with both stacking reasons given (decimator imprecision plus the conversion floor), attribution that changes the message and never the verdict, and the guard on the recorded request when the trap attribution would be wrong. The below-one case being reported rather than celebrated is the non-obvious rule and it is right."
    },
    "techniques/triangles-as-the-authored-unit.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The four reasons triangles win are distinct and each is about a different layer; vertex count is correctly demoted to a reported figure rather than a budget unit with its reason stated; naming the unit in the field is identified as the cheapest fix in the subject and it is; and 'when not to use it' correctly declines to universalise, handing subdivision cages and implicit representations their own declared units."
    },
    "applications/node--provider-face-limit-conversion.md": {
      "disposition": "keep",
      "reason": "Every cited symbol and constant re-read against the live consumer and exact: FACE_BUDGET_UNIT (:29), BUDGET_OVERRUN_TOLERANCE 1.1 (:36), QUAD_TRAP_BAND [1.8, 2.2] (:39), the flooring conversion (:59) and both unmeasured guards with their quoted reason strings (:109, :113). Its appended review boundary's caution that quad-dominant output does not establish an exact 2x conversion is fair and already answered by the technique's band. No mesh was commissioned or measured and verified_on is not refreshed."
    },
    "applications/process--class-ceiling-vs-requested-budget.md": {
      "disposition": "clarify",
      "reason": "The preset table re-read against polycount-presets.ts and matches row for row. Two corrections are owed. It reproduces the character row's 'highest per-asset budget' rationale, which its own table refutes at the environment row. And its appended review boundary claims 'a parts<1 check alone does not reject fractions, infinity or NaN' - planPartBudget guards !Number.isFinite(parts) || parts < 1, so infinity and NaN are rejected and only the fractional case survives; narrow that sentence. Its Nanite point is affirmed. No grading or budget planning was executed and verified_on is not refreshed."
    }
  }
}
```
