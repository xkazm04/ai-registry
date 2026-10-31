---
layer: application
type: application
subject: seated-in-world-reading
technique: panel-placement-in-the-view-band
stack: cpp
status: draft
verified_on: 2026-10-31
applied: code
ab_verdict: not-better
proof: before-after
---

# A screen deck placed by a nominal distance, and what moved it

Source tree: bp (public, github.com/xkazm04/bp), `master` at `6bc4f02`, read from an exported
copy of that commit on 2026-10-26. A seated VR light table on Unreal Engine 5.8. In "room mode" a
deck of reading screens stands over the table: one decision or feature sheet in focus and the
next ones queued. The next round re-placed it. That round was uncommitted while this was written,
and it is described here only from its brief and log, not cited as code.

## What the committed placement says

The brief asked for the current screen "at about 60 cm from the target eye ... above the table's
far half". The builder measured the scene, found the conflict, and wrote it into the code:

apps/vr/Source/bp/BpTable.h:333 "where the card stood (the far half of the table is 75 cm and more from the eye, so a screen at 60 cm stands over the"
apps/vr/Source/bp/BpTable.h:338 "static constexpr float DeckDistanceCm = 60.f;"
apps/vr/Source/bp/BpTable.h:339 "static constexpr float DeckYawDeg = 21.f;"

So the deck kept the 60 centimetres and moved 21 degrees right, into the band where an earlier
card had stood. The queue stacks behind and above the front screen:

apps/vr/Source/bp/BpTable.h:341 "static constexpr float DeckStepBackCm = 5.f;"
apps/vr/Source/bp/BpTable.h:342 "static constexpr float DeckStepUpCm = 1.4f;"

The swap animates the screens and never the view:

apps/vr/Source/bp/BpDeck.cpp:5 "a tap on a feature's glyph on the map, and resolving a decision swap them with a short slide; the view never moves."

## Verdict: not-better on placement, better on legibility

- Target: the owner reads the deck as "in front of me".
- Floor that must hold: text at or above the 6-pixel capture floor, and nothing cropped.

Legibility held: the smallest cap was 7.6 pixels. Placement failed. The director's review of the
captures (2026-10-26) found the deck "in the upper-right corner where the card was, angled and
cropped at the frame edge, not in front of me". The rear screens' text bled above the front one,
which is the stacking failure the technique names. The owner then approved the move this
technique prescribes: centre the deck straight ahead at 70 to 80 centimetres, scale it by 1.25 so
the text keeps its angle, and fan the next screens to the side as spines.

That move has since landed. At `master` `d1f37d7` (read 2026-10-31) the deck stands straight
ahead at 75 centimetres, 40 x 22.5 centimetres (1.25 times 32 x 18), with the next screens as
spines to its right:

apps/vr/Source/bp/BpTable.h:347 "static constexpr float DeckDistanceCm = 75.f;"
apps/vr/Source/bp/BpTable.h:348 "static constexpr float DeckYawDeg = 0.f;"
apps/vr/Source/bp/BpTable.h:342 "stand as spines to its right (DeckSpine*), each DeckSpineWidthCm wide, DeckSpineGapCm apart and DeckStepBackCm"

No owner verdict on the moved deck is recorded here, so the verdict above stays on the committed
placement it was measured against.

The geometry conflict was found, and written down in a comment, and still resolved toward the
nominal distance rather than raised with the person who set it. That is the step the technique's
procedure puts before building.

## The wrist panel, the body-anchored case

apps/vr/Source/bp/BpPawn.h:59 "static constexpr float WristPanelWidthCm = 13.f;  // FO: 13 x 10.5 (from 11 x 9.5), room for readable sub-lines (element 11)"
apps/vr/Source/bp/BpPawn.h:76 "static constexpr float WristCaptureOffsetXCm = -3.f;  // FAF: (-3, 1.5, 3.5) x0.6, roll -14 (FAB -4, -1.5, 1, roll -8; FQ -6, 11, 5 x0.66, roll 10)"

The comment carries part of the trail of placements. A blind panel of three judges (2026-10-25)
still scored the wrist 2 of 3 on both products: "small, dim and steeply tilted". This is the case
where moving content off the panel outranks moving the panel again.
