---
layer: application
type: application
subject: evidence-grounded-claims
technique: provenance-per-figure
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A figure that outlived its document

Source tree: the fleet's grant-writing platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `ae93b7e` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `f5b9e0c` on the project's `main`.

## What the tree already did right

Every extracted fact carries its source attachment identity, the filename and the extraction path
(pattern or model), attached at extraction and persisted with the ledger; the confidence grade is
set at extraction and consumed when two readings of one kind collide. Provenance travels with the
value, which is the first half of the technique.

## The seam, chosen to falsify "provenance is a live link"

The decision rule says a figure goes with its document. The persisted deep ledger is read as
stored: the editor card, the drafting grounding block and the submission seal all take the stored
list whenever it is non-empty, and removing an attachment touched only the attachment. A fact whose
source had been deleted kept rendering with its old filename and a high grade, indistinguishable
from a live one, and it kept entering the grounding block. The technique names exactly this: a
stale value lingering as sourced-looking.

## The paired proof

Arm B filters the stored facts to those whose source attachment is still attached to the draft,
and falls back to the on-demand pattern pass over the remaining documents when nothing live is left.

| Measure | A | B |
| --- | --- | --- |
| stale facts offered after their source was removed (new cases, 2) | 2 of 2 fail | 0 of 2 |
| facts kept while every source is attached | pass | pass |

**Floor**, declared before the run: the whole fact-ledger suite unchanged (48 passing tests),
type check and lint clean. It held.

## What the tree says about the technique

Provenance recorded is not provenance enforced. The link was stored on every fact and consumed by
no reader, so a replaced financial statement could not retire its figures. The enforcement belongs
at the read path every consumer shares, not at the delete, which has no knowledge of the ledger.

## What this realization cannot do

A replaced document (new upload, same figure kind) is only handled once the old one is removed;
the deep ledger is not re-extracted automatically, so the new document's figures appear only after
the next extraction run or via the pattern fallback. A document that stays attached but is edited
in place is not detectable here. Frequency of the stale case on real orgs was not measured.
