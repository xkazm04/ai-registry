---
layer: application
type: application
subject: seated-in-world-reading
technique: fade-the-content-not-the-view
stack: cpp
status: draft
verified_on: 2026-10-31
applied: code
ab_verdict: unmeasurable
proof: structural-only
---

# Room switches that cross-fade the sheet while the studio stays put

Source tree: bp (public, github.com/xkazm04/bp), `master` at `6bc4f02`, read from an exported
copy of that commit on 2026-10-26. The person sits at a VR light table showing a software
product's plan as a building. The owner's doctrine for moving between the product's "rooms": the
user is seated and stationary, there is no locomotion, and switching fades the content, never the
view.

## The doctrine, in code

apps/vr/Source/bp/BpRoom.cpp:2 "desk and nothing moves but what the paper shows: entering a room cross-fades the paper from the site plan to that room's"
apps/vr/Source/bp/BpTable.h:284 "static constexpr float RoomFadeS = 0.3f;"

The alternative entry moves content toward the person, not the person toward content:

apps/vr/Source/bp/BpRoom.cpp:5 "entry first raises the room as the pointed room's glass column, holds it, then dives. Exit fades back to the site plan"

The screen deck follows the same rule:

apps/vr/Source/bp/BpTable.h:345 "static constexpr float DeckSwapS = 0.25f;"

## What the tree shows structurally

- No camera move exists anywhere in room mode. Entry, exit and room-to-room switches are opacity
  and scale on the sheet, the map overlay and the room column.
- The studio, the table, the hands, the lamp character and the wrist panel do not move with the
  transition.
- The design record lists walking or teleporting through rooms as an explicit non-goal. A
  separate "room space" is deferred as its own experiment.

## Verdict: unmeasurable

- Target: no reported discomfort across room switches in a seated session.
- Floor that must hold: room switches stay legible, with the wrist list and the caption naming
  the new room.

Every switch so far ran in the editor and in flat captures. No headset comfort session has been
recorded, so the comfort claim is unmeasured here.

Return condition: a seated headset session of at least 15 minutes with at least 10 room switches,
with a simulator-sickness questionnaire before and after. The instrument is the questionnaire's
total score, compared against the same session length at the static site plan.
