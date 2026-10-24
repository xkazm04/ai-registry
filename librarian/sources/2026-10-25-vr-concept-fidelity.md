---
source: operator-dispatch:vr-concept-fidelity-40of45
kind: operator-dispatch
url: none
title: "Can a small team with agents bring a real-time VR scene to its concept art (40/45)? Five research workers, four builders, one project"
author: operator (bp owner), via the bp session's director
words: about 18,000 across five research reports and four builder reports (session scratch, not retained)
extracted: 17
accepted: 4
declined: 0
leads: 9
already_covered: 2
untriaged: 2
dispatched: 1
applied: 6
shipped: 6
run_id: intake-vr-fidelity-20261024
siblings: 0
---

# Intake: VR concept fidelity, an operator dispatch answered by building

## What arrived

There was no URL. The operator of a managed project (bp, a VR light table on a forward-shaded engine path) judged its
scene at "early-2000s" fidelity. They asked for any effort needed to reach 40 of 45 on its per-element concept scorecard,
plus deep research into the last two months' workflows: modelling-tool scripting, local image-to-3D, and commercial
image generation. They then asked that the work be run "similarly to intake so the registry can learn". **Class: operator
dispatch.** The sub-questions were routed to five research workers:
- local and commercial 3D generation;
- agent-driven modelling-tool workflows;
- commercial image generation and its terms;
- forward-path real-time look development;
- a local audit of the project and its machine.

Their sources form a batch, deduped by publisher. Four builders then applied the findings to the project the same day.
Expected yield, said before the table: **mostly catches and dated facts from the research, and the real yield from the
builds**. The research workers converged on one point: generation is not the bottleneck. That proved true.

## The measured result (the project's own scorecard, 15 elements, 0-3, from the concept's camera)

| Round | Score | Grader |
|---|---|---|
| before the sprint | 19/45 | director |
| after four builders (finishing, hero assets, sheet and UI, light and grade) | 28/45 by the builders, 27 by the director | builders and director |
| the same capture | "about 25-30" | **operator** |

Budget held throughout: draws 144 to 113 at the scoring pose, 250.7k triangles, frame p95 9.52 ms. 40/45 was not
reached. After the engine round every element sat at 2 or below, and every builder named an asset or content cap. The
operator then redirected the next round to sheet clarity and typography, a composition cap.

## Triage (v2.5 scored gate)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | subject (XL) | XL | Concept scene parity: scorecard, destination light, device-only scoring, excess grade, cap attribution | reference-parity-gating (artifact scale), visual-style-locking | new-subject | real gap | escalated E4 | **operator: forge it now** -> forged, see below |
| 2 | K | amendment (boundary) | M | An unspent budget on scripted geometry signals a skipped finishing pass | asset-class-poly-budgeting/budget-shapes-output-not-just-caps ("When not to use it: deterministic authoring") | corrects-claim (adds the inverse) | real gap | 3/0/2 | accept |
| 3 | K | amendment (boundary) | M | When the being is already drawn, brief positively from a crop; inherited bans can ban the approved answer | animatable-character-design/default-attractor-rejection | corrects-claim | real gap | 3/0/2 | accept |
| 4 | K | amendment (mechanism row) | M | Find a feature's gate before striking it from a forward-path allowance; a swap decided is not a probe placed | standalone-headset-frame-budgets/forward-path-feature-allowance | corrects-claim | real gap | 3/0/2 | accept |
| 5 | K | technique | M | Script few-primitive props and rigid characters instead of image-to-3D | sourcing-economics/regeneration-vs-repair-economics (not read in full) | new-technique | partial | 2/1/2 | untriaged |
| 6 | K | technique | M | A permissive model licence does not clear its export path's compiled dependencies | none found | new-technique | partial | 2/2/2 | untriaged (needs a primary on the dependency's licence terms) |
| 7 | K | technique | S | Legibility floor from the scoring pose (text classes dropped, never shrunk) | concept-scene-parity (new) | new-technique | partial | n/a | **lead**: a builder is measuring it now (return below) |
| 8 | K | catch | - | Bake the static room, keep 1-3 hero lights dynamic | forward-path-feature-allowance already says baked equivalents | none | likely catch | - | already covered |
| 9 | K | catch | - | Brief from the target, not from negations (exploration case) | default-attractor-rejection's procedure | none | likely catch | - | already covered (landing 3 is its inverse case) |

`auto=3/0/1 escalated fp=0`. No auto-accepted row died at Phase 6: each amended file was read in full before writing.

## Landed

- **New subject** `game-production/content-pipeline/concept-scene-parity`: a golden path, 5 techniques and 3 applications
  against bp, forged by one worker from `librarian/specs/2026-10-25-concept-scene-parity.md`. The category is now at its
  cap (10).
  - **Worker overrides, all accepted:**
    - the stack tokens;
    - the ceiling-estimate evidence: only one research worker forecast the total; the audit's "40 only if the art
      reaches 3" held;
    - salience is ranked by the judge, not the builders;
    - the grade verdict is `unmeasurable`;
    - "two rounds" was dropped as unverifiable from the tree.
  - **Upward lessons the worker found in the tree:**
    - the review rig drifts from the scene after a light round;
    - the pose command logs the requested FOV, not the rendered one;
    - the grade script's default is the curve model it rejects.
- **Amendments:**
  - `budget-shapes-output-not-just-caps`: the inverse signal for scripted geometry;
  - `default-attractor-rejection`: when the being is already drawn;
  - `forward-path-feature-allowance`: find the gate before striking a feature, a decided swap is not a placed probe, and
    re-read glossy surfaces after a light build.
- **Three applications against bp** for the amendments (python, python, process). Every anchor is quoted and checked.

## Render proof (Phase 6b)

The sheet had four shuffled pairs, with the concept as context:
- lamp brief, negative against positive: discrimination 3.2x over a two-seed floor;
- shelf finishing: no floor (deterministic renders, the editor was closed);
- probe brightness: no floor;
- whole scene: no floor.

The operator answered in words rather than labels, so the reveal is **unblinded**; `verdict.json` records the mapping:
- lamp: B, "looks well";
- shelf: B, "ok, but it is in the background and does not matter";
- probe: tie, "medium";
- scene: B, "about 25-30".

Under v2.17 the three floor-less pairs could not author a landing alone. Landing 2 rests on code read in the tree plus the
operator's B. The probe brightness lands only as "re-read and adjust", with no number.

## Applied (Phase 7.5) and shipped (Phase 8)

Every landing was applied to bp in `code` mode by the builders before it was written up. The commits are on bp
`master`, pushed by the project's session under the project's own rules:
- `9259783`: finishing stack, positive lamp brief;
- `8d87ec4` and `b885603`: capture hands;
- `38405d3`: sheet, pins, scan, card, wrist;
- `d8b1fea`: area-light gate, probes, bake, excess grade.

| Landing | Mode | Verdict |
|---|---|---|
| Lamp brief | code | better |
| Finishing | code | better (low salience) |
| Area-light gate and probes | code | better (before-after, not isolated) |
| Grade | code | unmeasurable (operator never saw it in isolation) |
| Scorecard | task | better |

## Currency signals (world moved; dated facts, no upper-layer change)

- **Image-to-3D licence.** The best-known open image-to-3D model's textured export path depends on a rasteriser
  licensed for research or evaluation only. Ship its geometry, not its textures. (Repo issue plus licence text, checked
  2026-10-24.)
- **EU exclusion.** One vendor's open 3D weights still exclude the EU, UK and South Korea, and no newer open weights
  exist. Checked 2026-10-24.
- **Commercial generators** added native quad output (2026-09-21), automatic part splitting (2026-09-09) and
  triangle-targeted topology (2026-10-15).
- **The modelling tool's next release** adds GPU path tracing on a new ARM laptop GPU class (release notes, 2026-10).
  The current release is CPU-only there, and CPU bakes of 1K prop maps take about 2 s.
- **One image API** permits only its paid tier for EEA users. Its previous image model sunsets 2026-10-29.
- **One video and image platform's API** opened 2026-09-16 and may train on standard-account content.
- **One image service's API** assigns output rights to the caller and does not train on API images. Public images grant
  it reuse.

## Leads (each with a return condition)

1. **Legibility floor from the scoring pose.** Return when the bp typography round (FC3, running at this note's writing)
   reports cap heights in arc-minutes per text class at the scoring pose. Then add it as a technique to
   concept-scene-parity, or file a catch if `design-tokens` or `accessibility` already owns an angular floor.
2. **Script few-primitive assets instead of generating.** Two workers converged on it, and one build measured 8k tris
   and 4 open edges scripted, against 26 open edges over 3 seeds generated. Return after reading
   `regeneration-vs-repair-economics` in full: it may be that subject's missing branch.
3. **Export-path licence audit.** Return with a primary reading of a dependency licence that restricts shipped output.
4. **A VM's default memory cap on unified-memory hosts** (29.3 GiB against 45.4 GiB native, a first-party PR). Return
   when a managed project runs ML in a VM on such a host.
5. **A lighting-channel mask did not hold on a stationary area light** under the forward path (one observation). Return
   when a second project or the engine's source confirms it.
6. **Drawing text into a render target needs a font object and destination-alpha writes**, or it draws nothing on an
   alpha-composited sheet. This is an engine-version fact. Return as an application if a second project draws text into
   targets.
7. **Interchange-imported generic materials lack the instancing usage flag** and fall back silently. Return with a
   second project that instances imported meshes.
8. **Modelling-tool scripting traps:**
   - new faces have zero normals until updated, so an angle-limited bevel measured 0 degrees everywhere and applied to
     no edge;
   - clearing material slots resets face indices;
   - imported objects default to quaternion rotation.
   
   Return as a `mesh-finishing-for-engine-readiness` application when a second scripted kit hits one.
9. **Hidden UV islands shrunk before packing** (texel density 257 to 772 px/m on a filled shelf), and long rails split.
   Return with a second filled-prop kit.

## Untriaged (nobody verified them; carry their anchors)

- Score-only-what-the-device-shows' sibling: OpenXR compositor layers are sharpest in a headset but absent from flat
  captures (r4 section 5).
- Keep the tone curve's shoulder and grade with a LUT. Absorbed into `grade-only-the-excess` by the worker; recorded here
  so a later run does not re-propose it as new.

## Method notes for the scorecard

- The class predicted the yield: the research batch alone produced catches and dated facts. **Every upper-layer landing
  came from what the builders measured.** An operator dispatch that is allowed to build is closer to a repository run
  than to a news run.
- The blind sheet was answered in words. A sheet whose question is "closer to the concept?" invites commentary, not
  labels. Ask for a label per pair explicitly next time.
