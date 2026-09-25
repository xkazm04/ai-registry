---
layer: application
type: application
subject: hitl-approval
technique: decision-records
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
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

## Where it departed from the technique (fixed at `ada169077` for the app's own readers)

**The placement was filed as a sent message.** At `39272628` the row is written with direction `out`
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

## The change: a label, not a new direction

The direction column is closed twice, by a `VALID_DIRECTIONS` check at the command
boundary (`src-tauri/src/commands/infrastructure/twin.rs`) and a DB `CHECK` behind it,
so a direction of its own is a schema change. The tree already had a cheaper channel for
a label: `key_facts_json` is an opaque passthrough that nothing in Rust parses, and the
training studio already tags its rows there with a `kind`
(`src/features/plugins/twin/sub_training/topicCoverage.ts`). `ada169077` does three
things. The lane writes `{"kind":"placement"}` on every insert. One predicate,
`isSentMessage` in `src/api/twin/placement.ts`, means outbound and not a placement. And
the two readers that mean "sent" use it: the "Recently sent" list (`SentReplies.tsx`)
and the per-channel send count (`useChannelActivity.ts`). The row is still written on
every insert and every regenerate. The technique asks for a record of each of the app's
own acts, not one per conversation, so the regenerate case needed a label, not
deduplication. `lastByChannel` still counts placements, because a placement is activity
on the channel even though it is not a send.

## Proof

Paired A/B on one fixture: the real lane driven through one insert and two regenerates
into the same box, the three rows it asked the backend to store rendered beside one reply
that really was sent from the outbox. Instrument:
`src/features/plugins/twin/sub_channels/__tests__/browserPlacement.sent.test.tsx`, run
against `392726280` (A) and the fix (B). n = 1 scenario, 3 placements + 1 send.

| | "Recently sent" rows | browser sends counted | real sends counted | placement rows written |
| --- | --- | --- | --- | --- |
| A (`392726280`) | 4 | 3 | 1 | 3 |
| B (`ada169077`) | 1 | 0 | 1 | 3 |

Target: placements that read as sent, 3 to 0. Floor: the real send listed and counted,
every placement still recorded, the lane still reaching `inserted`, the browser channel
still showing activity. All held, with tolerance 0. Gates: vitest over the browser lane
and the twin channel, hub and training suites (66 tests), `tsc --noEmit` clean, eslint on
the touched files clean.

The seam was chosen to falsify, on the reading side. A caught outcome would have been a
surface that needs placements counted as sends, such as channel health, training momentum
or topic coverage. None does. `ChannelHealthStrip` reads only last activity, which still
counts placements.

## What the change cannot do

The backend's own prompt builders still read `direction` alone. The reflect prompt draws
every `out` row as an arrow from the twin (`twin.rs`, `twin_reflect`). The reply
drafter's thread block attributes an `out` row to the twin by name (`twin_draft_reply`),
and a placement would reach it if a contact's handle ever equalled a page host. The
frontend label does not reach either one. Making those truthful needs the direction value
the schema does not yet have, or a `key_facts_json` read in Rust, which today parses
nothing in that column.
