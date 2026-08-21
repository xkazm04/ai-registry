---
layer: application
type: application
subject: runtime-observation-evidence
technique: tiers-of-truth
stack: process
status: forged
verified_on: 2026-08-20
---

# The Observation Spine — Tiers of Truth in an agent/Unreal harness

Realized in the Pillars of Fortune (PoF) repo, whose verification methodology between an
agent and a live Unreal Engine editor is documented in
`docs/features/harness-llm-unreal/llm-ue-interface.md:9-32`. This is a `process`
application: the tier ladder is a doctrine and a prompt contract before it is code.

## The ladder as written

The doc's table (`llm-ue-interface.md:13-19`) names five tiers with a question, a mechanism
and an example verdict each:

| Tier | Mechanism | Example verdict |
|---|---|---|
| T0 Existence | `FPackageName::DoesPackageExist`, the asset registry | "asset exists" |
| T1 Structural | compile status, load success | "Blueprint loads" |
| T2 Wiring | reflection / introspection | "AnimBP property correct" |
| T3 Behavioural | tick the `AnimInstance`, read bone transforms — deterministic, headless | "pelvis moves; `isRefPose ≈ false`" |
| T4 Perceptual | render → PNG → a multimodal agent reads and judges it | "I see a walking character, not a T-pose" |

The line the whole architecture rests on (`llm-ue-interface.md:21`): **"T0–T2 are necessary
but never sufficient. The player-movement T-pose passed every structural gate."** That is
the founding incident of the golden path, stated by the repo in one sentence.

Two structural choices in the doc confirm the technique:

- **The tier is declared by the intent, not chosen by the runner** — "Each intent declares
  the tier of evidence it requires" (`llm-ue-interface.md:11`), and the Conductor loop
  (`llm-ue-interface.md:34-41`) reads `Intent (declares required Tier) → Ground
  (ApiGroundingProbe) → [Transaction] snapshot affected .uassets → Act → Observe (the
  REQUIRED-tier observation — T3/T4) → Verdict`.
- **The ladder is mapped once to the content-acceptance ladder** rather than re-derived per
  caller: "L2 ≈ T0–T2 (static), L3 ≈ T3 (runtime/behavioural), L4 ≈ T4 (perceptual)"
  (`llm-ue-interface.md:23`). The engine-side evidence ladder feeds the content-side
  acceptance ladder; they stay two ladders with one stated mapping.

## The verbs

`llm-ue-interface.md:25-32` fixes five observation verbs, each tier-labelled:
`EvaluatePose` (T3 — ticks the anim instance, returns `maxBoneDeltaFromRefPose`,
`pelvisLocationOverTime`, `isRefPose`), `CaptureFrame` (T4), `RunScenario` (T3+T4 — the
composite `{ map, spawn/possess, inputs[], timeline, ticks, observeAt[] }`), `GetState`
(T3 — semantic introspection: "BS_Locomotion: 11 samples, each with N keyframes/M
bone-tracks", which is what "catches empty retargeted clips"), and `ApiGroundingProbe`
(tier-less, a precondition — it queries UE's real API and asset state *before* authoring).

`GetState` is the confirmation for the golden path's claim that semantic introspection sits
above plain existence: an empty retargeted clip passes T0 and T1 and is caught only by
reading how much data the artifact actually holds.

## Cost inversion, confirmed

The doc records why T4 is routine here rather than reserved: "T4 is cheap now precisely
because the driver *is* a multimodal agent — its own read of the captured frame is the
canonical T4 authority" (`llm-ue-interface.md:21`). This is the technique's decision rule
about expiring cost arguments, observed in the field: the rung did not get easier to define,
the observer got cheaper, and the ladder's ordering by containment rather than by cost is
what let the harness absorb that without reshuffling.

## Deviation kept at standard

The doc's tier table names T2 as "properties set, nodes connected" — property-level
introspection. The golden path holds wiring to a stronger bar: reachability from a real
entry point, not only that a property references something. The repo's own law
`compiling-is-not-wiring` agrees with the stronger reading, so the standard stays where it
is; a property that points at a real asset nothing ever grants is still not wired.
