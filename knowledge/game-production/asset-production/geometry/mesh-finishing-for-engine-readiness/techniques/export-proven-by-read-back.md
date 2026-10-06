---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: export-proven-by-read-back
status: forged
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input, structural-proof-is-never-sufficient]
shared_with: []
use_when: [an automated stage writes the finished asset to an interchange file, a script reports an export as done because the exporter returned success, an agent exports from a document that holds more than one scene or a side workspace, deciding what an export receipt may claim, an exported file arrives downstream missing an object or a clip or holding one it should not]
---

# An export is proven by reading the file back

## The concern

The finishing bench ends with a write. The reduced, unwrapped, baked and bound asset is
handed to an exporter, the exporter returns success, and the stage reports the asset as
delivered. Every arrow before that one has a rule about which version of the mesh it ran
on and what it may claim. The write has none. It is the last operation on the bench, and
it is where the bench trusts a tool's own word.

**An exporter's success status says the operator ran to completion. It says nothing
about what the file contains.** These are different facts, and they come apart in
ordinary use. Measured on a long-term-support release of one authoring tool, with the
calls a production pipeline makes, the exporter returned success in all three cases
below, and two of the files were wrong:

| Case | Exporter said | The file held |
| --- | --- | --- |
| The document has a second scene, a side workspace the user was not looking at | success | **both scenes**, the side scene's object as a node beside the hero |
| The scene being exported is empty | success | a well-formed 132-byte file with **zero nodes and zero meshes** |
| An animation clip is parked on a muted track | success | the clip, under default animation options |

The first is the one that matters most, because the side scene exists *because of*
automation. A parallel agent's throwaway workspace, a backup copy, a test scene: any of
them makes a scene-graph exporter that walks every scene by default put foreign objects
into the hero file. Nothing failed, so nothing reports it. The third case is included
because it did not fail. One open-source authoring client records muted clips as
silently skipped under its own animation presets, and the same check under default
options found the clip present. Which of these failures you get depends on the exporter's
options. So the check cannot be written as a list of known exporter bugs. It has to be
written against what the file was supposed to contain.

## The rule

**Re-read the written file and compare it with the intended content before the stage
claims delivery.** The exporter's status is self-certification
([no-gate-self-certifies](../../../../_laws.md#no-gate-self-certifies)), a file that
exists and parses has passed only the structural rung
([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)),
and an empty file that parses is a check run over nothing
([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).

Four decisions make the read-back worth having:

1. **Read it where the path is known, which is inside the process that wrote it.** A
   remote caller often cannot inspect the file. The bridge may be on another machine, and
   a transport success only means the script was accepted. That is a reason to put the
   read-back in the export script, not a reason to accept the exporter's status as the
   best evidence available. The script that wrote the file can open it a line later.
2. **Count content, not bytes.** A byte floor separates a truncated write from a real
   one. It does not separate an empty scene from a full one: the empty export above
   clears a 64-byte floor twice over. Compare what the file holds with what the stage
   meant to ship. That means one scene where one was intended, the expected object set
   with nothing foreign in it, a mesh count above zero, every requested clip present, and
   world-space bounds within the asset's class. An empty result is a failure with a name,
   never a small pass.
3. **Derive the intended content before the write, from the stage's own inputs.** The
   expected object set is the selection or collection the stage resolved. The expected
   clips are the ones it was asked to carry. Resolve that once and record it, then hand
   the same list to the exporter and to the read-back. A read-back that re-reads the
   live selection after the export compares the file with whatever the user or a sibling
   agent has selected since, and that is a second authority for the same quantity.
4. **Re-read binary formats by importing them into an isolated container, and clean up
   completely.** A text or chunked scene-graph format can be parsed directly: count its
   scenes and nodes, and union its transformed bounds. A binary format usually has to be
   imported back. Import it into a temporary container that the stage owns, read it,
   then remove every datablock the import created and restore the selection, the active
   object and the mode. One client reports that importing into a separate new scene
   breaks on skinned rigs, so it imports into a temporary collection of the active scene.
   That is a single source's report and has not been reproduced here. Treat it as a
   reason to test the container choice on a rigged asset before relying on it.

## What the receipt says

The export receipt carries the read-back's findings beside the path: `checked` (true, or
false with the reason the file could not be read), the counts it found, and the list of
issues. A receipt that says `checked: false` is honest. A receipt that says delivered
because the exporter returned success is the failure this technique exists to remove.
Report an issue as a named finding the caller can route on, such as `extra-scenes`,
`foreign-objects`, `empty-export`, `clips-missing` or `bounds-out-of-class`. Do not
collapse them into one failed flag. The first two point at the document, the third at
the selection, and the fourth at the exporter's options.

## Where this sits

This is the bench's own discipline, which operation ran on which version and what it may
claim, applied to the last arrow. It is not import-side acceptance. Measuring a delivered
asset's extent at the engine edge, or classifying a generated mesh's defects, checks what
*arrived*. This check proves what was *sent*. A pipeline needs both, because the two
fail differently: an import check cannot tell a foreign object written by the exporter
from one the author put there on purpose, and the export stage is the only place that
knows which one it meant.

## Decision rule

- The stage writes a file another stage or person will consume → read it back in the
  writing process before reporting delivery.
- The read-back finds more scenes, foreign objects, zero meshes or missing clips → the
  export failed, whatever the exporter returned. Name the issue in the receipt.
- The file cannot be read back (the format has no reader in this process, or the
  read-back threw) → report `checked: false` with the reason. Never report delivered.
- The document may hold scenes or workspaces the stage did not create → scope the
  exporter to the intended scene explicitly. Keep the read-back anyway, because the
  scoping option is exactly what drifts between call sites.
