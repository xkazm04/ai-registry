---
layer: application
type: application
subject: hitl-approval
technique: decision-records
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
---

# The page's send button as the gate, and a record that claims a send (personas)

personas is a desktop agent platform with an embedded browser. Its "twin" is a model
of the user's own writing voice. The Twin toolbar
(`src/features/browser/twinDraftLane.ts`) lets the user click a comment box on any web
page and have the twin draft a reply straight into it. `verified_against` is the
`react ^19.2.6` range in `package.json`. Read at `39272628`.

## The gate is the surface's own commit control

The lane's header records the design decision (`twinDraftLane.ts:11-17`). The draft is
typed into the page's box, "there is no app-side draft panel", and the user edits the
text in place and sends it "with the site's own button or the toolbar's Submit". The
user guide says the same thing from the user's side: "Nothing is sent until you send it"
(`docs/features/browser.md:129`). The technique's boundary applies. A panel in the app
asking "use this draft?" in front of a box the user is already looking at, followed by
the site's own send button, would ask the same question twice.

The toolbar's own Submit is a different act, and the lane gates it. `requestSubmit`
(`twinDraftLane.ts:311`) shows an inline "Submit the form?" line, and only
`confirmSubmit` (`:326`) presses the page's submit control. There the app, not the
person, is pressing someone else's button, so the confirmation is the only human
answer on that path and is not a duplicate.

## The record binds to the app's own act, written at insert time

`draftAndFill` (`:222`) drafts, fills the box, marks the lane inserted, and then writes
a twin communication on channel `browser` (`:238`). The app never learns whether the
page's send button was pressed, so insert time is the only moment available for a
record. The failure rule is relaxed exactly as the technique describes: the write is
caught into the error channel (`:248`), and the comment above it explains that "the
text is already in the box: a failed ledger write is telemetry, not a failed insert,
and telling the user 'failed' over a draft they can see would be a lie."

## Where it departs from the technique

**The placement is filed as a sent message.** The row is written with direction `out`
(`twinDraftLane.ts:238-247`) through the same `record_interaction` every outbound reply
uses (`src-tauri/db/src/repos/twin.rs:670`). The row has no field that separates
"placed in a box" from "delivered". Only the channel name hints at it. The feature
docs call it "an outbound `browser` communication" (`docs/features/plugins/twin.md:223`).
Two consequences follow from the code:

- A draft the user deleted, or a page they closed, still reads as an outbound message.
- Regenerate drafts into the same box again through the same path. Every regeneration
  therefore writes another `out` row, and one comment that was eventually posted (or
  never posted) leaves as many "sent" records as there were drafts.

A placement label, or a direction value of its own, would make both cases truthful
without the app ever needing to see the send.
