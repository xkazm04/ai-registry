---
layer: technique
type: technique
subject: video-assembly
technique: pinned-frame-notes
status: forged
laws: [edit-do-not-regenerate, checkability-routes-the-pixel]
shared_with: []
use_when:
  - a person reviews a cut and an assistant or editor makes the changes
  - review feedback arrives as prose such as "the title feels low near the middle"
  - a cut is re-rendered at a different size or frame rate between rounds of review
  - an assistant has to find the layer in source that a reviewer is pointing at
---

# Pinned frame notes

Feedback on a cut is a pointer first and an opinion second. "The caption is
too close to the edge around the twelve second mark" costs the editor a search
- find the moment, find the layer, guess which of three captions was meant -
before any change can be made. The pointer is the expensive part, and it is
exactly the part a tool can capture exactly while the reviewer is looking.

So make the unit of feedback a **note pinned on the picture**, a small record
with five parts:

- **The moment, twice.** The frame number and the time in seconds. The frame
  is exact for this cut; the seconds survive a change of frame rate.
- **The spot, as fractions of the frame.** Horizontal and vertical position as
  a number from 0 to 1, and for an area the width and height from the spot at
  its top left, also as fractions. Fractions are resolution-independent: a
  note made on a preview at one size still points at the right place in a
  re-render at another. Pixels would silently go stale the first time the size
  changed.
- **The text**, one change per note.
- **The frame with the spot marked**, saved as an image next to the record.
  This removes the last ambiguity - the editor sees what the reviewer was
  pointing at, not what a coordinate suggests.
- **A done flag**, and a created timestamp.

## Plain files an editor can read

Store the notes as ordinary files - one ledger and one image per note - in a
folder that keeps itself out of version control. Three properties follow from
that choice and are worth designing for:

- **An assistant can act on them.** Reading the ledger and opening each open
  note's image is all the context needed; from the moment and the spot, finding
  the layer in source is a lookup against the composition, not an
  investigation.
- **They are editable by hand.** The ledger is re-read on every change, so
  closing a note by editing one flag works while the review surface is still
  running. A feedback channel that only the tool can write is a channel the
  editor cannot close.
- **They survive the loop.** Re-running the review after an edit brings the
  notes back with it, so the reviewer checks the fix against the same
  pin and ticks it off, instead of describing it again.

## The gap to close deliberately

A pin means "this moment, this spot, in the cut as it was". After the editor
changes the composition, the same coordinates may point at different content
or at nothing. The reference realization does not record which revision of the
cut a note was made against. Record a revision identifier (a hash of the
compiled spec is enough) on each note, and when the current revision differs,
show the note as *made against an earlier cut* rather than silently treating
it as current. Without that, a closed note and a moved layer are
indistinguishable from a note that was never fixed.

## Decision rules

- When a person reviews a cut, capture the moment, the spot and the marked
  frame at the instant of the note; never ask the reviewer to describe where.
- When storing a position, store fractions of the frame, never pixels.
- When storing a moment, store both the frame and the seconds.
- When the editor is an assistant, give it the ledger and the images as
  files, and let it set the done flag; the reviewer confirms by looking.
- When the cut changes between rounds, bind each note to the revision it was
  made against and show stale notes as stale.
- When a note carries two requests, split it; a ledger of single changes can
  be closed one at a time.

## When not to use it

When the reviewer cannot pause on a frame - a live broadcast, a streamed
review - a pin has no stable target and a time range with prose is all there
is. And when the feedback is about the idea rather than the picture ("this
should be shorter"), a pin adds nothing; keep it in the brief.
