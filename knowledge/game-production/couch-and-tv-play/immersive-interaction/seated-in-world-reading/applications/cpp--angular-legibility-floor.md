---
layer: application
type: application
subject: seated-in-world-reading
technique: angular-legibility-floor
stack: cpp
status: draft
verified_on: 2026-10-31
applied: code
ab_verdict: better
proof: before-after
---

# A text floor in one header, with far names stood on cards

Source tree: bp (public, github.com/xkazm04/bp), `master` at `6bc4f02`, read from an exported
copy of that commit on 2026-10-26. The VR app is Unreal Engine 5.8 on the forward path, seated
at a light table. Its typography lives in one header, and every surface that draws text reads its
size from it. No C++ standard is pinned in the tree, so this document carries no version witness.

## The floor is one constant pair, with its basis

apps/vr/Source/bp/BpType.h:30 "constexpr double FloorPx = 6.0;"
apps/vr/Source/bp/BpType.h:31 "constexpr double FloorArcmin = 22.0;"

The comment above them gives both bases: the capture renders, and a display standard.

apps/vr/Source/bp/BpType.h:27 "The floor, in capture pixels at the target pose and in arcminutes at the play pose. 6 px: the smallest cap the"

It also states which instrument binds, which is the technique's central point:

apps/vr/Source/bp/BpType.h:12 "is the capture almost everywhere (it resolves about 14 px a degree; a Quest 3 about 25)."

The fit rule says that text is cut or dropped, and never drawn smaller:

apps/vr/Source/bp/BpType.h:14 "is abbreviated (blueprint-ui's fit rule: cut at a word with an ellipsis) or dropped, never drawn smaller."

The face was chosen against foreshortening, and thin weights were rejected for it:

apps/vr/Source/bp/BpType.h:8 "Thinner weights break up when the sheet is minified toward the far edge."

## Foreshortened names stand on tilted cards

The far rooms' names could not meet the floor lying flat. They now stand on cards tilted toward
the eye:

apps/vr/Source/bp/BpTable.h:256 "static constexpr float RoomNameTiltDeg = 60.f;"
apps/vr/Source/bp/BpTable.h:253 "three times the cap a flat name would (the far rooms' flat names could not meet BpType's floor in the strip). The"

Measured on the 32-room product: 30 of 32 names were dropped flat. With tilted cards, 29 of 32
fitted at first and all 32 after the card layout settled (the build's own fit log, 2026-10-25).

## The reading panels log their worst case at build time

apps/vr/Source/bp/BpDeck.cpp:382 "// The type against the floor, at the front screen's farthest corner from the target eye (BpType: 6 px in the capture)."

The panels wrap and paginate under the same rule:

apps/vr/Source/bp/BpDeck.cpp:107 "*  smaller, cut or paginate). MaxLines 0: no limit. */"

## Verdict

- Target: text classes that clear the floor at their worst placement.
- Floor that must hold: the plan's labels unchanged in placement (the project's level check,
  `labels_moved 0`).

Before the floor existed, the far names were unreadable. After it, every surviving name and every
panel line clears 6 pixels. The deck's smallest cap is 7.6 to 8.1 pixels on two products
(2026-10-26), and the level check still reports `labels_moved 0`. This is `before-after`, with no
paired arm.

## What this realization does not do

- **Floor taken as the reading size (deviation).** It has a floor and no comfortable-band
  constant. The deck's body text sits at 7.6 to 8.1 pixels, about 33 to 35 arcminutes at the
  capture's resolution. That is above the floor and below the 36 to 48 arcminutes published as
  comfortable reading in headsets.
- **Labels judged oversized (deviation).** A blind panel of three judges (2026-10-25) called the
  floor-sized pin tags oversized against the concept on both products. That is the concept's
  cheat (its tags are unreadable marks). The tree records no device ceiling for the element, so
  the tags read as a defect.
