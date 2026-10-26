---
source: first-party:bp-vr-light-table-fidelity-sprint
kind: operator-dispatch (first-party practitioner account with its tree)
url: none
title: "The bp VR light-table fidelity sprint, end to end: 14 -> 38 briefed, 34 blind, 40 not reached"
author: the bp project's build session (director plus about thirty builder rounds and nine research workers), relayed by the operator's dispatch
words: about 53,000 across 37 round logs, 20 briefs and 9 research reports (session scratch, not retained), plus the bp tree at 6bc4f02
extracted: 17
accepted: 5
declined: 0
leads: 7
already_covered: 2
untriaged: 4
dispatched: 0
applied: 6
shipped: 0
run_id: bp-vr-fid-sprint
siblings: 0
---

# Intake: what the bp VR fidelity sprint learned

## What arrived, and its class

The operator dispatched the whole record of a two-day fidelity sprint on a managed project. bp's VR light table runs on a
forward VR path, and the sprint tried to bring it to 40 of 45 on its fifteen-element concept scorecard. The record holds:
- round logs from about thirty build rounds;
- the director's briefs;
- nine research reports;
- a blind three-judge score audit;
- a paired trial of a commercial image-to-3D service;
- the project's committed tree at `6bc4f02`.

**Class: first-party practitioner account with its tree.** It is measured (captures, luma medians, frame-time CSVs, credit
logs) and n=1 (one project, one machine, one sprint). The prior run (registry `70770648`, 2026-10-25) mined the sprint's
first day. This run extends and corrects that one; it does not duplicate it.

Expected yield, said before the table: the research reports would mostly be catches and dated facts, as last time. The
real yield would come from what the later rounds measured: the judging, the plateau, the asset trial and the VR layer
work.

- **Siblings:** 0 live siblings on the board at claim.
- **Declared focus:** the test stage, from the 2.17.0 scorecard. See "Method notes" for whether it moved.

## The measured result

| | Score / 45 | Grader |
| --- | --- | --- |
| Start (2026-10-24) | 14 | one strict briefed judge |
| Trail | 27, 30, 32, 36, 34, 33, 34, 37 | briefed panels (one judge, then three) |
| End of polish round | 38 | briefed panel of three |
| Same frame, blind (2026-10-25) | **34** (36 / 33 / 33); second product 31; control 10 (8 / 11 / 11) | fresh panel of three, no context, anonymised frames |

- The blind panel scored the starting frame 4 lower than the first briefed panel had. The briefed panels inflated by
  about 4 points.
- Builders' self-readings ran 3 to 7 above their panels.
- The per-frame spread across three judges was about 2 points.
- 40 was not reached. The plateau sat at 33 to 38 on the briefed panels, and at 34 blind.

## Triage (v2.5 scored gate)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | A blind panel with the starting frame as a control; briefing inflates about 4 | concept-scene-parity "Who scores" (asserts the judge's score is the score); llm-observability reference-ladder (floor rung, one instrument) | new-technique + refutes | real gap | 3/0/2 | **accept** |
| 2 | K | technique | M | Isolate a region's light by contributor before retuning its surface | concept-scene-parity judge-in-the-destination-light (probe-neighbour rule only) | new-technique | real gap | 2/0/2 | **accept** |
| 3 | K | subject (XL) | XL | Seated in-world reading: angular legibility floor, panel placement in the view band, fade the content not the view | none (design-tokens density owns points, not angle) | new-subject | real gap | escalated E4 | **pre-authorized by the dispatch** -> landed (spec 2026-10-26) |
| 4 | K | technique | M | Declare the producer per asset class from a paired trial (scripted vs generated) | generative-artifact-gating "Deterministic is not a synonym" (names the declaration, gives no procedure); prior note lead 2 | new-technique + convergence | real gap | 3/0/2 | **accept** |
| 5 | K | currency/application | S | Forward-path rows: local fog volumes draw nothing, skin profile shades default-lit, anisotropy off under area lights, no field AO | standalone-headset-frame-budgets python application | dates-application | real gap | (corroboration table) | **admitted** (tree opened, engine source read) |
| 6 | K | amendment | S | A silently-falling-back feature renders *something*, so "renders nothing" never fires | forward-path-feature-allowance | corrects-claim (boundary) | partial | 1/0/1 | untriaged (recorded in the application as evidence) |
| 7 | K | golden-path amendment | S | The plateau: device-bound ceilings (legibility, sub-pixel lines, anatomy) and engine-bound ones | concept-scene-parity Feasibility, cheat column | corrects-claim (boundary) | partial | 1/0/1 | untriaged as an upper-layer edit; **landed as an application** (process--cap-attribution) |
| 8 | K | technique (render-bound) | M | Generate a model's views on ONE orthographic clay sheet, then split it for multiview input | image-to-3d-input-gating multi-view-master-reference, single-subject-plain-background | new-technique? | partial | V2 ok, Phase 6b unmet | **lead + held media row** (see below) |
| 9 | K | catch | - | Triangle targets overshoot; grade delivered, not requested | asset-class-poly-budgeting class-ceiling-vs-requested-budget | none | likely catch | - | already covered |
| 10 | K | catch | - | Thin weights vibrate; dark text needs a bright plate on additive displays | folded into angular-legibility-floor (primary fetched) | none | - | - | already covered by landing 3 |
| 11 | K | amendment | S | Frame-time numbers on a shared machine carry a contention witness and a same-session baseline | perf-regression-gating baseline-bound-to-build-and-machine (not re-read) | corrects-claim | likely catch | 1/1/1 | untriaged |
| 12 | K | amendment | S | A placeholder slot's full-sheet UVs bleed its blank bake into thin baked islands | mesh-finishing high-to-low-bake-coverage (not re-read) | corrects-claim | partial | 1/1/1 | untriaged |
| 13 | K | lead | - | GPU bake backend differs from CPU where shells are coplanar (contact faces bake bright) | mesh-finishing | - | - | - | lead |
| 14 | K | lead | - | Engine tooling traps: async viewport capture, console toggles persisting across play sessions, first play capture blank, baseline before the slowest read, re-import keeping an old embedded texture, material bake black for a converted skin | engine-pitfall-corpus | - | - | - | lead |
| 15 | K | lead | - | Check an acquired backplate's capture viewpoint, not only its licence | acquired-is-not-generated | - | - | - | lead |
| 16 | K | lead | - | Text in the comfortable band, not at the floor, for read-not-glanced panels | angular-legibility-floor | - | - | - | landed inside 3; the measured adoption is the lead |
| 17 | K | lead | - | Text kept under the bloom threshold; shader lines clamped at 1 px and faded | angular-legibility-floor | - | - | - | landed inside 3 as rules; unapplied in the tree |

- `auto=3/2/1`: rows 1, 2 and 4 accepted; rows 6 and 7 rejected as upper-layer edits; row 3 escalated.
- `fp=0`: every accepted row's target file was read in full before writing.
- **Rules each row ran under.** Rows 5 and 13-17 ran under the corroboration table (application or lead). Rows 1-4 and
  6-8 ran under the score.

**Corroboration spent:** 1 fetch of 3. One platform vendor's mixed-reality typography page, read 2026-10-26:
- minimum legible text 0.35-0.5 degrees, comfortable 0.6-0.8 degrees;
- "avoid light or semilight font weights ... thin vertical strokes will vibrate".

Engine facts were re-read in the installed engine's source:
- `SubstrateEvaluation.ush:578`: "anisotropy completely disables area integrations";
- line 948: a diffusion-profile skin sets only `bPostProcessSubsurface`;
- `DeferredShadingRenderer.cpp:2284`: the deferred lighting gate.

Row 3's comfort technique rests on training-data convergence: the rest-frame hypothesis, and the rule that the view moves
only with the head.

**A corrected premise.** The project's floor of 6 px (about 22 arcminutes, from a desktop display standard) is a
*minimum*, at the bottom of the vendor's legible band. The project treated it as the size. Its reading deck sits at 7.6 to
8.1 px, about 33 to 35 arcminutes, which is below the vendor's comfortable 36 to 48. The source located the right
instrument (an angular floor checked in the capture) and stopped one band short. The technique is written from the
primary.

## Landed

- **NEW SUBJECT** `game-production/couch-and-tv-play/immersive-interaction/seated-in-world-reading` (status draft): golden
  path, 3 techniques, 3 cpp applications against bp, 22 anchors held. Spec: `librarian/specs/2026-10-26-seated-in-world-reading.md`.
  - `angular-legibility-floor`: the floor as an angle, checked in the instrument that binds (the capture at about 14
    px/deg against about 25 for the headset). Every class is measured at its worst placement. Foreshortened text is
    tilted or dropped. A floor is not a reading size. Thin weights, bloom, and 1 px lines.
  - `panel-placement-in-the-view-band`: measure the band, the table's depth and the no-cover regions before placing.
    "60 cm" against "above the far half" was a real conflict. Straight ahead, scaled with distance. Fan a queue as spines.
    A wrist panel is small by anatomy.
  - `fade-the-content-not-the-view`: the view moves only with the head. A context switch cross-fades content and the
    room is the rest frame. No blink, because blinks are for locomotion.
- **concept-scene-parity** (2 new techniques and the golden path's "Who scores", light and failure-mode paragraphs):
  - `blind-panel-with-a-control-frame`, with an application recording the audit;
  - `isolate-the-light-before-the-surface`, with a python application over four isolations recorded in bp's look steps;
  - a process application for `cap-attribution-before-the-next-round` recording the plateau: which elements stall at 2,
    and why.
- **generative-artifact-gating**: `declare-the-producer-per-asset-class` and its procedure sentence in the golden path,
  with a process application for the paired trial (18 calls, 695 credits, 2026-10-25).
- **Currency.** standalone-headset-frame-budgets `python--forward-path-feature-allowance`:
  - eight forward-path rows added;
  - `verified_on` moved;
  - one drifted anchor re-pointed.
  
  The same seam hunt re-resolved two of the prior run's applications (`python--grade-only-the-excess`,
  `python--judge-in-the-destination-light`): five anchors had moved two lines at `6bc4f02` with their quotes unchanged.

## The plateau, in one paragraph (the operator asked for it)

The ten scored rounds climbed fast while elements were absent, then flattened at 33 to 38 briefed (34 blind) with most
elements at 2. The process application records the cap for each:
- **Device-bound:** the tags, the wing labels and the scan line need the concept's illegible or sub-pixel marks to reach
  3, and the wrist panel is held by anatomy.
- **Engine-bound on this forward path:** the haze (fog volumes draw nothing, and area lights barely scatter) and the skin
  (default-lit).
- **Light balance oscillating:** the dark studio went "too grey", then "empty", then "too warm".
- **Asset-bound:** the lamp's head still reads as an orb, and the rim glows unevenly.
- **Data-bound:** the rooms and furniture are drawn at real product density, not the concept's.

Only the asset-bound caps are buyable by another tuning round. 40 needs the six device- and engine-bound elements at 3,
so it is a no for this device and path.

## Render proof (Phase 6b) and the review page

This run lands no technique that changes what a generator is told, so no row was render-bound except row 8, which did not
land. Row 8's existing evidence is the trial's pair, single image against front-and-side panels at the same mode and the
same 30 credits. The single image lost the tabletop, and the two panels returned chairs with legs. It is one seed per arm,
with no floor. The best generated result came from a *single* image at the high-detail mode, so the pair is confounded
by mode. No local render was made this run: a parallel project session (round FAI) held the GPU and the editor, and the
standing rule forbids image-to-3D GPU work beside a running editor.

The review page shows the run's evidence from the project's own captures:
`<scratch>/bp-vr-fid-sprint/report/index.html`:
- the concept;
- the blind frames, with the control;
- the plateau elements;
- the deck captures;
- the trial plates.

It carries a verdict chip per landing, matching this note.

## Applied (Phase 7.5)

Every landing was applied to bp by the sprint itself before it was written up. The mode is the one the tree witnesses:

| Landing | Mode | Verdict | Seam (bp) |
| --- | --- | --- | --- |
| blind-panel-with-a-control-frame | experiment | better (38 briefed -> 34 blind; control ordering held) | scorecard rule, docs/concepts/vr-light-table/art-breakdown.md:65 |
| isolate-the-light-before-the-surface | code | better (wall 111 -> 26, panel 117 -> 35, sheet 86 -> 48; paired on/off) | the look steps |
| declare-the-producer-per-asset-class | experiment | not-better as a replacement (frame failed the floor); the declaration written | scripts/lookdev/tripo.mjs, the frame and glyph builds |
| angular-legibility-floor | code | better (before-after; every surviving class clears 6 px; 30/32 -> 32/32 far names) | apps/vr/Source/bp/BpType.h:30 |
| panel-placement-in-the-view-band | code | not-better (placed by nominal distance; rejected as "not in front"; re-placed by the next round, uncommitted) | BpTable.h:338 |
| fade-the-content-not-the-view | code | unmeasurable (no headset comfort session; instrument named) | BpRoom.cpp:2, BpTable.h:284 |

- **Seams chosen to falsify.** The panel-placement seam was chosen because it *failed*: the committed deck shows the
  nominal-distance placement the technique forbids, and the owner's rejection is the evidence.
- **What could have refuted the blind-panel technique and did not:** a control scored the same by both panels.
- **Not written:** the project's `.ai/applied.jsonl`. The dispatch kept the bp tree read-only. The six rows above are the
  seam record. The project session should copy them into its ledger.
- **Shipped:** 0. Nothing in bp was changed by this run, by instruction.

## Currency signals (dated facts, no upper-layer change)

- The image-to-3D service's published credit table matched every one of 18 calls (2026-10-25).
- Its terms give ownership and no-training only to paid accounts. Whether buying API credits counts as a paid account is
  unconfirmed.
- The modelling tool's next release (beta, due 2026-11-04) runs GPU path-traced bakes on the ARM laptop GPU class:
  - ambient occlusion about 5x faster at 1K;
  - output identical to the CPU except where shells are coplanar.
  
  This resets the prior note's "adds GPU path tracing" signal.
- The engine's realistic-human creator needs a separately installed core data pack. Offline, it refuses to export skin
  textures. Its licence page is login-walled (2026-10-25).

## Leads (each with a return condition)

1. **One orthographic clay sheet as the multiview input (row 8).**
   - Return condition: a two-seed paired render, single panel against the split sheet, at the SAME generator mode, with
     a floor drawn from the single-panel arm at two seeds.
   - Held as `queue: media` in `librarian/harvest/backlog.jsonl` (`bpvr-001`).
   - Prompt shape, from bp's lookdev log (2026-10-25): the same single object drawn four times in a 2x2 grid; front,
     side and top as true orthographic projections at one scale on a shared baseline and centre line; a three-quarter
     view; plain light-grey ground; shadowless light; matte clay; no text or dimension lines.
2. **GPU bake parity at coplanar contact (row 13).** Return when a second project bakes on the GPU backend. Then it is a
   `mesh-finishing-for-engine-readiness` application row.
3. **Engine tooling traps (row 14).** Return when bp (or any project) keeps an in-tree, routed pitfall corpus. Then they
   become `engine-pitfall-corpus` applications. Today they live in an operator memory file outside the tree.
4. **Backplate viewpoint (row 15).** Return when a project acquires a sky or city plate for a window. All 37 urban-night
   panoramas in one CC0 library are shot at street level (2026-10-25).
5. **Comfortable-band adoption (row 16).** Return when bp raises its deck body text to the comfortable band and re-scores
   the deck blind.
6. **Bloom threshold and line clamp (row 17).** Return when a project's text panels or shader lines are measured against
   these rules.
7. **Generated furniture at scripted heights.** The trial's untested best-of-both arm. Return when bp runs it. Then it
   is a second row for `declare-the-producer-per-asset-class`.

## Untriaged (nobody verified these; carry their anchors)

- Row 6: forward-path "silent fallback" boundary. Anchor: bp `apps/vr/tools/mcp-steps/py/import_hands.py:9`, and the
  engine source line 948 above.
- Row 7: the plateau as a golden-path paragraph in concept-scene-parity Feasibility. It currently lives as an application.
- Row 11: contention witness and same-session baseline. Measured in bp: post-processing 0.19 -> 1.12 ms with no change
  under other sessions' load; a room-mode baseline taken in the same session.
- Row 12: placeholder UVs bleeding into baked islands. Measured in bp: 91,151 placeholder-signature texels before the fix,
  0 after.

## Prior note touched

`2026-10-25-vr-concept-fidelity.md`:
- lead 1 (legibility floor) is resolved by landing 3;
- lead 2 (script vs generate) is resolved by landing 4;
- untriaged row 1 (compositor layers absent from flat captures) is absorbed into the seated-in-world-reading golden
  path, "The sharpest path is not the scored path". That row is struck and its counter decremented.

## Method notes for the scorecard

- **The declared focus (test: render proof) did not move**, and this run says why. No landing was render-bound. The one
  render-bound row met a live sibling holding the GPU, so it went to the media queue instead of landing on an unfloored
  pair. That is the rule working, not a miss.
- **The strongest landing was about the instrument, not the scene.** A blind panel with a control frame re-based a whole
  trail. The method's own render proof asks the operator for a blind pick, and the same inflation applies to any briefed
  grader, including this skill's director pre-read. Lesson filed.
- **The director drafted the XL subject instead of dispatching a forge worker.** The override is recorded in the spec, and
  every anchor was machine-checked to compensate.
