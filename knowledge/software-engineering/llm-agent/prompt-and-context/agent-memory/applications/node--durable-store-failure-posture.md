---
layer: application
type: application
subject: agent-memory
technique: durable-store-failure-posture
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A consolidation pass on a staged copy: safe against failure, blind to a write in flight (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. The realization is a
markdown memory store per project with a "Dream" consolidation: a model plans clusters
of near-duplicate files, rewrites each cluster into one file, and the result replaces the
live store. The design is the good version of the staged pass, and the run below is what
the technique's new section is about. The shipped compiled copy of the memory package
ran against a real SQLite-backed store with the model call stubbed; its string and number
literals match the source in all fifteen files, and logic was not compared.

## The design

The pass consolidates on a private copy of the workspace and identity trees, then swaps
directories:
`src/context/memory/edgeclaw-memory-core/src/service.ts:806 "createDreamStage"`,
then the before-image is installed and the live roots replaced
(`src/context/memory/edgeclaw-memory-core/src/service.ts:852 "installLastDreamSnapshot(stage.snapshot, lastDreamSnapshotMetadata)"`
and `src/context/memory/edgeclaw-memory-core/src/service.ts:853 "replaceLiveRootsWithStage(stage, stage.snapshot)"`).
Undo is gated on the live state matching what the pass produced
(`src/context/memory/edgeclaw-memory-core/src/core/storage/sqlite.ts:1438 "no longer matches the last Dream snapshot"`).
Two model timeouts of three and ten minutes bound the work. This is what the technique
asks for at the *corruption* end: a failed pass leaves the live tree untouched.

## Executed

| Run | What happened | Result |
| --- | --- | --- |
| A | Dream over five files, then undo, undo again, undo a third time | 5 files → 3 → 5 → 3 → 5: the single before-image slot is an undo/redo toggle |
| B | one write after the Dream, then undo | refused: the current state "no longer matches"; a write followed by its own deletion also refused, because the hash covers manifests and times |
| C | a memory written into the **live** store while the Dream's model call was held open | after the swap the listing held only the merged result; **the mid-pass write was gone, and the undo-available flag stayed true** |
| D | two projects sharing a storage root; a second project wrote an identity-tier note while the first's Dream was in flight | the note was gone after the first project's swap |
| E | the second refinement call throws | the live tree unchanged, no failure status recorded, and one leftover staging directory beside the live one |

Row C is the technique's addition: the staged pass has no version comparison at the swap,
and the readiness flag reports that an undo exists while the undo cannot restore the lost
write, because its before-image predates it. Row D is the same loss across scopes, by a
different writer. Row E is the reaper's case, and the retry follows: no failure is
recorded, so the scheduler retries, each attempt costing up to the ten-minute model bound.

## The two guards, and where they stop

The tree's interactive server closes row D with a shared maintenance key
(`ui/server/services/memoryService.js:146 "[path.resolve(dataDir), GLOBAL_MAINTENANCE_TASK_KEY]"`),
and the gateway has its own per-project in-flight guard
(`src/cli/createLocalGateway.ts:957 "if (runtime.memoryMaintenanceInFlight) return;"`).
Both point at the same on-disk memory root, and the two locks are in different processes'
memory, so neither sees the other. Whether both run in one deployment was not verified.

## What would close it

Record the live store's version when the copy is taken and compare at the swap; reject or
replay on a mismatch; derive the undo-ready flag from that comparison rather than from the
presence of a before-image; and give the failed pass's staging directory an owner that
removes it. None was applied to this tree. The row is `unapplied`, with the return
condition *a fleet project runs a consolidation pass longer than one request*.

## Cannot say

How often a write lands mid-pass in real use. The pass runs on a schedule when files have
changed since the last one, and the tree has no idle detection despite saying so in its
README; the exposure is therefore whatever the user does during minutes of model work.
