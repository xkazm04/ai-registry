---
layer: application
type: application
subject: video-assembly
technique: pinned-frame-notes
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
---

# A preview player that stores review notes as files an agent reads

The witness for the stack is the tree's `engines` field (node 22 or later); the tree was read at commit `7263a951`.

The engine's preview player lets a person pause on a frame, click a spot or drag an area, and write what should change. `packages/framefields/src/preview/notes.ts:2` "Notes the user pins on the preview" opens the module that stores them, and the record has the technique's parts: a frame and a time in seconds, a spot, optional width and height, text, a done flag and a created stamp. The spot is stored as fractions: `packages/framefields/src/preview/notes.ts:17` "The spot, as fractions of the frame's width and height". A note made on a preview at one size therefore still points at the right place in a re-render at another.

The store is plain files. The ledger is re-read on every change so it can be hand-edited (`packages/framefields/src/preview/notes.ts:6` "is read on every change, so it can be edited by hand"), and each note writes the frame with the spot marked beside it. The engine's skills instruct the agent to read the ledger, open each open note's image, edit the film, run the preview again and let the person tick the notes off, which is the loop the technique describes.

## What this realization cannot do

A note carries no revision of the cut. After the composition is edited, the stored fractions may point at moved content, and a note that was fixed cannot be told from one whose target moved. The technique asks for a revision identifier on each note for that reason.
