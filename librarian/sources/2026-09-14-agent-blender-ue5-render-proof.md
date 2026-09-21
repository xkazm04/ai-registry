---
source: youtube
kind: practitioner build-walkthrough (tour half dominant)
url: https://www.youtube.com/watch?v=3yXYIXczKXI
title: "How to Connect GPT-6 Astra (or Fable5.1) to Blender & UE5 (Elden Ring Demo)"
author: Coding Crash Courses
words: 1271
extracted: 10
accepted: 0
declined: 0
leads: 4
already_covered: 2
untriaged: 4
applied: 1
shipped: 1
dispatched: 0
run_id: yt3d-3yxy
siblings: 1
intake_version: 2.9.0
---

# Agent-driven Blender and engine - the first 3D render proof

Intake 2.9.0, the second run under Phase 6b and the first on its 3D path, at the operator's
request. A source originates a finding; it never authorizes one. Captions `vtt/en.*`, 1,271
words, read in full; the last third is an unnarrated demo. One live sibling at claim
(`intake-litho`, a software-engineering subject), no overlap. Declared focus from the previous
run - price the noise floor before designing arms, and distrust a tie - applied from the start:
every approach was rendered twice by independent agents before any pair was judged.

**Class and expected yield.** A practitioner build-walkthrough whose tour half (installing three
command bridges) is most of the words and whose operating half is two sentences: concept images
first, then a detailed spec the agent executes by driving the tools, "not a one shot ... it took
me one day". Expected: catches and dated facts. The source's value here is the ROUTE it
demonstrates - a coding agent authoring 3D assets by scripting the content tool - not any claim
it makes about that route.

## Workflow recovered

1. Install a content-tool command bridge (agent -> running modelling tool), an engine-editor
   plugin exposing editor functions as tools, and a hosted voice/music bridge [00:00:26-00:04:44].
2. Verify the bridges answer before building [00:05:09].
3. Concept images for the boss, a knight, stairs and walls [00:05:34].
4. A very detailed spec of look, feel and enemy behaviour; the agent picks and drives the tools
   [00:05:59-00:06:25].
5. Not one-shot: one day to the demo [00:06:25].

## Triage

Upper-layer rows scored (G/R/C; auto-accept at GAIN - RISK >= 2 and GAIN >= COST); currency and
leads admitted under the corroboration table.

| # | Candidate, anchor | Shape | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Concept images before building assets, 00:05:34 | technique | `image-to-3d-input-gating` | likely catch | 0/0/1 | Already covered |
| 2 | **An agent authors geometry by scripting the content tool**, 00:00:26 + 00:06:25 | technique (route) | all four `asset-production/geometry` golden paths are scoped to a generator's or service's output; an uncapped grep of `asset-production` for procedural, scripted or agent-authored geometry returned nothing | real gap | render-bound | **Phase 6b. No perceptual verdict -> lead** (below) |
| 3 | Engine editor functions exposed to the agent as tools, 00:00:26 | technique | `software-engineering/.../mcp-tools` (outside `--domain`) | partial | 1/2/2 | Untriaged (domain constraint) |
| 4 | Detailed spec before building, 00:05:59 | technique | `content-pipeline/judgeable-spec-authoring` | likely catch | 0/0/1 | Already covered, and stricter |
| 5 | Voices and music good, sound effects weak from one vendor, 00:03:25 | dated fact | `sound-effect-generation` | thin | n/a | Untriaged |
| 6 | A vendor's local tool server deprecated for a hosted one, 00:04:18 | currency | `mcp-tools/transport-selection` | real, dated | n/a | Lead |
| 7 | Install the bridge runtime with its own installer, 00:01:18 | dated fact | none | strip: nothing | n/a | Untriaged |
| 8 | The engine install is ~150 GB, 00:02:09 | dated fact | none | strip: nothing | n/a | Untriaged |
| 9 | A bridge into a RUNNING editor is a third automation mode, 00:00:26 | amendment | `headless-dcc-capability-limits` | partial | 1/2/1 | Lead (promoting question needs the bridge installed) |
| 10 | "It took me one day", 00:06:25 | dated fact | `production-pipeline-phasing` | thin | n/a | Lead |

Admission: 0 auto-accepted, 1 render-bound, 2 catches, 4 untriaged, 4 leads (rows 2, 6, 9, 10).
`auto=0/9/1`, `fp=0`.

## Render proof

**Instruments proven before scoring:** the modelling tool headless with GPU rendering and a
deterministic workbench renderer; no command-bridge add-on installed; no image-to-3D weights; a
real-time engine installed at the source's version. The local route is the source's route minus
its transport: an agent writes a content-tool script, the director's harness runs it headless.

**Harness asserted before any arm counted.** A planted control (a 2x-scaled box with no UV map, an
open prism buried inside it) returned exactly the expected structural card. The harness was then
corrected twice before any pair existed, and re-asserted each time: engine collision proxies an
agent added unprompted would have scored as buried geometry (now counted separately), and
interpenetration inside ONE assembled object was invisible to an object-pair test (now measured
across every shell). A perspective camera also made the 1.8 m scale figure lie with depth, and was
replaced with an orthographic one.

**Design.** Two asset kinds with different scale contracts - a modular stairs kit piece and a
two-handed warhammer. Four independent agents per asset, each seeing only its own brief: two on
the source's method (spec-driven, "game-ready", nothing more), two on the corpus contract compiled
from HEAD (commissioned extents, triangles as the unit under a class ceiling, one closed surface,
UVs, one shading owner). The harness owns everything evaluative.

**Structural cards, n = 2 per approach:**

| Arm | Extent (m) | Tris | Shells | Intersecting shell pairs |
| --- | --- | --- | --- | --- |
| stairs, source 1 / 2 | 7.70 x 10.56 x 4.39 / 7.20 x 10.36 x 5.62 | 15,842 / 18,060 | 222 / 235 | 279 / 394 |
| stairs, contract 1 / 2 | 4.00 x 4.00 x 3.00 / 4.00 x 4.00 x 3.29 | 2,282 / 4,242 | 1 / 1 | 0 / 0 |
| hammer, source 1 / 2 | 0.55 x 0.28 x 1.74 / 0.44 x 0.26 x 1.83 | 5,720 / 11,150 | 33 / 42 | 61 / 58 |
| hammer, contract 1 / 2 | 0.45 x 0.15 x 1.60 / 0.45 x 0.24 x 1.60 | 2,412 / 3,454 | 1 / 1 | 0 / 0 |

Every arm had UVs and applied transforms unprompted, so those rules do not separate the
approaches. Commissioned size, assembly and density do, absolutely and in both replicates. Both
contract agents measured their output against a stated number and caught a 6 mm and a 29 mm
length error; neither source-method agent had a number to miss. The engine's own importer
reported one contract hammer as 2,412 triangles and 1,208 vertices, identical to the harness.

**Perceptual half - no verdict, reached honestly:**

| Presentation | Discrimination (between / seed-and-agent floor) | Gate | Operator |
| --- | --- | --- | --- |
| Turntable, whole-frame pixels | stairs 4.92 / 3.67, hammer 2.19 / 2.07 | refused | not shown |
| Turntable, foreground-masked (rule fixed in writing before it ran) | stairs 32.10 / 27.28, hammer 21.06 / 20.73 | refused | not shown |
| Claim render: stairs 3x3 on the 4 m grid, hammer on a hand socket | stairs 26.76 / 22.16, hammer 20.57 / 11.98 | stairs refused, hammer passes | **neither usable** |
| Engine: stock rigged mannequin, weapon on the hand bone, kit on the engine grid | never produced a complete set | - | - |

The operator on the hammer pair: *"Both are basically same with difference in height. Result does
not remind even closely realistic hold of the hammer, our approach needs to be redesigned."* The
failure was the director's: a capsule with a cube for a hand is a scale proxy, used as a usage
context. **An isolated asset on a turntable, or against a proxy, does not carry the question a
person is asked about a game asset.** Two agents on one approach differed visually about as much
as the approaches did, so the contract's visible effect sits inside agent variance while its
structural effect does not.

The engine route was the operator's choice and the only local instrument with a rigged humanoid.
It was stopped after nine attempts at 7 of 16 captures, by a stopping rule stated before the last
attempt. Candidate 2 therefore lands as a lead: no render-bound candidate lands without a render
verdict.

## Engine automation findings (the half that did land, in a managed project)

Probed live against the installed engine at the source's version, each by asking the editor
whether the effect occurred:

- **An asynchronous screenshot call resolves and captures nothing if the session ends.** The call
  returned; the file did not exist when the script finished. A session driven frame by frame, that
  waits in seconds and checks the file, did get files. Unresolved: even then 7 of 16 captures
  arrived, and which arms rendered varied between runs.
- **A per-frame editor callback is re-entered from inside an asset import.** The import advances
  the UI loop, the loop calls the callback again, and the nested call started a level change inside
  the import - the same map created three times in 200 ms, then a crash. A busy guard fixed it.
- **The run-a-script launch flag exits the editor when the script returns**, so a callback
  registered for later frames gets one frame. A project start-up script gives a session that keeps
  ticking.
- **Two signature details**: an actor relative-rotation setter requires its sweep and teleport
  arguments positionally, and the viewport-camera setter on the level-editor subsystem requires a
  viewport config key.

Shipped as entries in pof's engine pitfall corpus: see `librarian/applied.md`.

**What this run claimed and then withdrew.** Two headless probes crashed at spawn, and the draft
recorded "headless spawn is fatal". The corpus's own application for `headless-dcc-capability-limits`
records spawn working on the same build. Two confounds were tested: obtaining the subsystem
correctly still crashed; a probe that spawned without the preceding import sequence succeeded, in
the default world and after a new level. **The corpus was right. A crash in a multi-step probe is
evidence about the sequence, never about its last step.** The attach-to-bone failure (weapons left
at the world origin) and the window-focus hypothesis for dropped captures were likewise not
isolated and are not recorded as capabilities.

## Leads

1. **Constructive geometry authoring (row 2).** A coding agent that scripts the content tool is a
   sourcing route none of the four geometry subjects model, and the structural cards say the
   corpus's commissioning contract changes it absolutely (size, assembly, density, replicate
   agreement). **The second independent source already existed, in the fleet rather than the
   corpus:** pof mined a different creator's video on 2026-09-07 into a construct-vs-generate rule
   for hard-surface assets - construct from primitives rather than generate, claiming topology on
   the hard edges and an order-of-magnitude polygon economy. Two creators, two runs, one route: that
   is the convergence the corroboration table names. **The cards also qualify that rule, and the
   qualification shipped to pof:** construction ALONE produced interpenetrating shells, 4-8x the
   triangles and invented sizes; construction under the commissioning contract produced one
   closed shell at the commissioned size. The route is sound only when the constructing agent is
   handed the numbers. Still a lead in the registry, because the finding is render-bound and no
   perceptual verdict was reached. Return: that verdict in a real usage context (the engine pass
   completed, or a consumer project's own level), and a placement decision - the four geometry
   subjects are all scoped to a generator's output, so the route needs either a boundary section
   in `asset-class-poly-budgeting` and `generated-mesh-acceptance` or a subject of its own.
2. **Probe re-entrancy, not only availability.** A surface that drives its own event loop can call
   the automation back from inside the operation it was asked for. Amendment candidate for
   `headless-dcc-capability-limits`. Return: a second surface showing the same, or a fleet project
   whose automation registers per-frame callbacks.
3. **A bridge into a running editor is a third mode (row 9).** Return: the bridge installed
   locally and the same operators probed in both modes.
4. **Vendor bridge deprecated local-for-hosted (row 6)**, dated 2026-09-14. Return: a fleet project
   wires that vendor's bridge.

## Cleanup

After the verdicts and the pof commit: the render scratch directory (87 MB: turntables, claim
renders, eight arm scripts, FBX, control) and the engine project at a short path (267 MB,
including copied mannequin content and engine intermediates) were deleted by name. The 3D outputs
did not carry the run id as a filename prefix, so `render-triage clean` could not scope them - a
Phase 6b rule this run broke on the 3D path, recorded in the lessons.
