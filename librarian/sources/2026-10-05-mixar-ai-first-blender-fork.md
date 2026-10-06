---
source: youtube:Z8xhELifAVs
kind: video
url: https://www.youtube.com/watch?v=Z8xhELifAVs
title: AI Can Do Everything in Blender Now - Mixar
author: Stefan 3D AI
words: 1943
extracted: 18
accepted: 1
declined: 0
leads: 4
already_covered: 5
untriaged: 8
dispatched: 0
applied: 1
shipped: 1
run_id: intake-1005-z8xh
siblings: 2
fetches: 2
fetched_tree: github:Mixar-AI/mixar-app @ edaeb32f28f7b70cd3ba59f906b0e4e1ef40cd55
rescan_when: the agent backend (`mixar-backend`) is published, which is where the routing and sub-agent claims live; or a release after v2.0.0 changes `core/export_verify.py`; or 12 weeks elapse (2026-12-28)
---

# The exporter said FINISHED, and the file held a scene nobody asked for

**Class:** second-hand practitioner review (a creator demoing someone else's release). The
creator says they gave the vendor feedback during beta, so read it as friendly. 1,943 words,
one caption track, one speaker. This is the **eleventh** note from this channel. Ten
earlier notes hold its parts-generation, previs-to-video, tool-surface-over-computer-use
and auto-rig claims, so this run expected catches and leads and got them. **Expected yield,
said before the table:** currency and leads, plus whatever the fetch carries. For a review,
the fetch is the extraction.

**The fetch carried the run.** The tool is open source: a GPL-3 fork of Blender 5.2
(desktop client v2.0.0, 446 stars, pushed the day of this run). One web search found it.
One API read of its contributor guide confirmed the tree is worth a clone: 91 MB of
overlay source, cloned shallow without the upstream submodule, at a short path. The
in-tree documents run about 27,500 words against the 1,943-word video. The agent
architecture document alone is 6,075 words. **The client is open; the agent backend is
not.** The guide says so in its first paragraph
(CLAUDE.md:6 "the AI backend is the separate"). Everything the
video credits for speed and token savings (the orchestrator splitting work into agents,
"smart routing" choosing effort per task) lives in that closed backend and cannot be
checked from the published source. A community fork (Lampway) exists that replaced the
closed backend. It was not read.

**Board at claim:** two live siblings (`intake-1005-xayu` on a security extension-trust
subject, `intake-1005-kgl` on image-prompt composition). No overlap with this run.

**Declared focus (from the 2026-10-04 row):** run the fleet-consumer check before Phase 5
for a generative-bundle home, and carry the predicted apply mode. Done at Phase 4. The
landing's home is `game-production`, whose only fleet consumer is pof, and pof has a live
agent export seam. Predicted mode: `code`. Achieved: `code`, `better`.

## Design record (from the cloned client, `edaeb32f`)

Paths are relative to the clone root. Anchors were verified with
`node scripts/check-anchors.mjs` against the clone before it was deleted.

```
decision:   verify every agent export by reading the written file back in the client, while the path is known
forces:     the backend never receives a local path, so only the client can open the file; the glTF exporter
            walks every scene by default; FBX skips muted clips under the client's presets
buys:       an export receipt that states what the file holds, not that the operator ran
rejects:    trusting the exporter's FINISHED; verifying from the backend
where:      src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:278 "runs after the write while the client still knows the path"
            src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:278 "the emptiness floor is 64 bytes for OBJ/glTF"
            CLAUDE.md:97 "every glTF call site sets `use_active_scene=True`"
            src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:276 "workflows leave every clip muted and the FBX exporter skips a muted track"
            src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:278 "a `temp_override` onto a new scene makes the FBX importer fail on pose bones"
stage:      the last arrow of the finishing bench: the write
corpus:     NONE - mesh-finishing-for-engine-readiness enumerates reduce, unwrap, bake, bind and has no rule for the write;
            generated-asset-world-scale measures what ARRIVED, not what was sent

decision:   snapshot the whole document before every agent turn; rewind document and conversation together
forces:     an agent edits the user's live, non-mergeable document; the user also edits by hand between turns
buys:       revert/reapply any turn, with the user's hand edits on a reverted position kept as a safety copy
rejects:    tracking position in stored state (position is derived from chat length); detecting change by file
            hash or depsgraph traffic (uses an undo-stack fingerprint)
where:      src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:311 "captures the whole document with"
            src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:330 "One timeline, position = chat length"
stage:      the turn boundary of an attended human-agent co-editing session
corpus:     NONE - checkpoint-mode-custody checkpoints the conversation only; rollback-to-last-green is unattended
            HOME IF NEW: contested between agent-runtime-assembly, session-continuation and concurrent-vcs

decision:   each parallel sub-build runs in a throwaway lane scene, merged on success and swept only on proof
forces:     one non-mergeable document, one main thread, several workers
buys:       parallel writers that cannot clobber the user's scene
rejects:    running sub-builds in the active scene; sweeping a lane because its session went quiet
where:      src/scripts/mixar/modules/space_mixie_chat/core/lane_scene_sweep.py:7 "Scene-build mode runs each sub-build in a throwaway lane scene"
            src/scripts/mixar/modules/space_mixie_chat/core/lane_scene_sweep.py:14 "session inactivity is not"
stage:      fan-out
corpus:     fleet-orchestration/parallel-dispatch (isolation per worker) + substrate-reconciliation ("a cleanup sweep
            is about to act on a partial listing") - covered; the document-as-substrate is a boundary case, not a mechanism

decision:   the agent protocol carries no local path; basenames and folder kinds only
where:      src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:274 "The backend never receives a local path"
corpus:     partial - mcp-tools egress gating and operator-surfaces' secret surfaces are neighbours; not opened this run

decision:   mutations refuse while a render runs; reviewed read-only tools proceed
where:      src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:82 "Mutations immediately fail with `render_in_progress`"
corpus:     agent-browser-control/effect-classed-commands by name; not opened this run

decision:   every tool_use gets a tool_result, defended from five angles (timeout, disconnect, queue-full, guard, compaction)
where:      src/scripts/mixar/modules/space_mixie_chat/ARCHITECTURE.md:267 "every `tool_use` the backend emits must get a matching `tool_result`"
corpus:     not mapped this run
```

**Routing count.** NONE: 2 (export read-back, per-turn document checkpoints), both in one
system (the client). HOME IF NEW shared by three or more: no, the two have different homes.
**Under three, so no forge handoff.** Both became `design` candidates.

## Triage

Rules per row: upper-layer rows were scored under v2.5. Currency and leads were admitted
under the corroboration table.

| # | Candidate | Anchor | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | **Prove an export by reading the file back** | design record 1 | none at the write stage | real gap | 3/0/2 | **accepted** → technique `export-proven-by-read-back` + golden-path section + pof `code` A/B (`better`) |
| D2 | Snapshot the document before each agent turn; rewind it with the conversation | design record 2 | `checkpoint-mode-custody` (conversation only), `rollback-to-last-green` (unattended) | real gap after the promoting read | 2/1/2 | **untriaged**: home contested (+1 risk) leaves GAIN-RISK at 1. pof seam: about 20 mutating bridge scripts and no pre-script snapshot |
| 1 | Clicking the DCC through computer use is the worst harness | `[00:00:00]` "the dumbest way will be to use ... computer use" | `mcp-tools`; 2026-09-16 #7 (same channel) | likely catch | - | already covered |
| 2 | One orchestrator splits a scene task into parallel agents in waves | `[00:02:05]`-`[00:02:55]` | `parallel-dispatch`, `substrate-reconciliation` (see design record 3) | catch after tree read | - | already covered. The tree's lane scenes are the mechanism; the corpus owns isolation and sweep-on-proof |
| 3 | Sketch over the viewport and attach the markup to the turn | `[00:02:55]` "I don't like this bridge, remove that bridge" | `review-iteration-loops` (not opened) | partial | - | **lead**: return when a source measures markup against prose feedback by revision count |
| 4 | Same model, faster, because of routing and skills | `[00:03:20]` "It just does it faster with the same model" | `model-routing`; the routing lives in the closed backend | thin | - | **lead**: return when the backend is published or a timed paired run exists. n=1, untimed |
| 5 | The harness, not the user, picks effort per task | `[00:08:49]`-`[00:09:14]` "if I will have control of the effort, I'll just set it to max" | `model-and-effort-selection`, `model-routing/effort-calibration` (not opened) | likely catch | - | untriaged: the operating-half remark (a user with the knob maxes it) is n=1 |
| 6 | Generate a character in parts | `[00:05:52]` "I still do generate them in parts" | `part-cut-planning`, `part-split-budget-division` | likely catch | - | already covered. Third sighting, same author, not convergence |
| 7 | The agent built a full control rig without being asked | `[00:07:08]`-`[00:07:33]` | 2026-09-16 #5 (same channel) | thin | - | **lead**, not independent: return with a second author or a rig checked by `rig_check.py` |
| 8 | Direct the camera in 3D, then hand it to a video model | `[00:07:58]`-`[00:08:24]` "cinema mode ... use it like for AI render later" | `motion-plate-library`; 2026-09-09 #2 | likely catch | - | already covered |
| 9 | A reference board whose items attach to the agent | `[00:01:40]` | `reference-role-map` (not opened) | likely catch | - | untriaged |
| 10 | An AI-first fork must open the incumbent's files unchanged | `[00:06:42]` "there is no migration" | none mapped | thin | - | untriaged |
| 11 | **Currency:** an AI-first fork of the DCC is open source, with an MCP bridge for outside agents, bring-your-own subscriptions and a local runtime | `[00:01:15]`, `[00:03:45]`; tree `CLAUDE.md` | 2026-09-09 lead #6; 2026-09-14 lead #9 (a bridge into a running editor as a third automation mode) | dated | - | **lead**: a fourth automation mode, the agent built into a fork. Return when a fleet project adopts one, or the backend opens |
| 12 | 3D, image, video and splat generation behind one subscription | `[00:04:10]`-`[00:04:37]` | `generative-provider-routing/vendor-fact-ledger` | dated | - | untriaged dated fact |
| D3 | Lane scenes for parallel sub-builds | design record 3 | as row 2 | catch | - | already covered |
| D4 | Path-free agent protocol | design record 4 | partial, not opened | partial | - | untriaged |
| D5 | Mutations refused during a render | design record 5 | `effect-classed-commands` (not opened) | likely catch | - | untriaged |
| D6 | The tool-call pairing invariant | design record 6 | not mapped | - | - | untriaged |

`reconsider?`: rows 11 and 3 touch the 2026-09-09 lead #6 ("a 3D authoring tool as an
assistant surface, with a model picker inside it"). This source is that surface, now open
source, but the lead's return condition (a measured comparison) still has not fired.

## What the source got wrong, and the boundary it handed over

The landing came from the tree, not the video, and the tree was partly wrong in a useful
way. Its export verification uses a **64-byte emptiness floor** for glTF. On Blender 4.2.1
an empty scene exports as a well-formed **132-byte** GLB with zero nodes and zero meshes,
so the floor passes an empty export twice over. The technique therefore says to count
content, not bytes. The tree's **muted-clip** failure did not reproduce under default FBX
options (the clip survived), so the technique says to write the check against the
intended content rather than against a list of exporter bugs. Its glTF multi-scene
warning reproduced exactly.

## Apply (Phase 7.5), chosen to falsify

Seam: pof's agent bridge export script. Its receipt printed on `FINISHED`, and its comment
called that "the strongest evidence available from here". This seam could have killed the
finding: if Blender 4.2's glTF exporter scoped to the active scene by default, arm A would
have been correct and the landing would have been a note about one client's presets. It
did not. Paired, same fixtures, same build:

- **Target:** wrong-content files that still printed a receipt. A: 3 (side-scene leak in
  glTF; empty glTF; empty FBX). B: 0.
- **Floor:** clean fixture (camera, light, skinned mesh, collection instance) identical in
  both arms, no false positive, document census unchanged after the FBX re-import. Held.
- **Isolation:** B's read-back with A's unscoped call caught the leak alone
  (`extra-scenes`, `foreign-objects: Leak`).
- Gate: 95/95 vitest (bridge and scene composer), tsgo, eslint. pof `65974e1e` on
  `master`, pathspec commit, not pushed.

## Leads

1. **Viewport markup as turn context** (row 3). Return: a source that measures revisions
   to accept with markup against prose.
2. **Routing beats the model** (row 4). Return: the backend is published, or a timed paired
   run on one model exists.
3. **An unrequested control rig** (row 7). Return: a second author, or the rig passes
   `rig_check.py` at extreme poses.
4. **An agent built into a fork of the DCC** (row 11). Return: a fleet project adopts one,
   or the backend opens and its orchestration can be read.

## Directions not proposed

None. D1 landed as coverage in the one consumer that has the seam. D2 is untriaged, and a
direction would need the home settled first.

## Cleanup

Clone `C:/t/intake-1005-z8xh` and experiment directory `C:/t/intake-1005-z8xh-exp` (A/B
harness, arm scripts, written GLB/FBX files) deleted by run id at Phase 9. The ingest's
transcript and metadata were deleted from the shared research cache by video id.
