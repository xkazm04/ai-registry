---
layer: application
type: application
subject: two-thumb-touch-layout-design
technique: pointer-capture-per-control
stack: node
status: forged
verified_on: 2026-10-01
---

# A single-page phone controller realising ownership, relative steering, layouts, mirror and neutral

Read from the working tree of the Death Ride repository (no commit pinned; the tree was
read as it stood on 2026-10-01). The controller is one static browser page served by the
game host; the stack label `node` is the nearest allowed slot for browser-side JavaScript.
Paths are relative to `firetv-deathride`. No physical phone has run it.

## Per-control capture (confirmed)

Each held control keeps its own pointer slot. The steering pad claims on first contact and
stores both anchors: `deathride/controller/index.html:77 "steerAnchor=e.clientX;steerAnchorY=e.clientY"`.
Pedals claim with `deathride/controller/index.html:78 "el.setPointerCapture(e.pointerId)"`,
and release on three events, not one, at `deathride/controller/index.html:77 "'lostpointercapture'"`
(the same triple is on the pedals, the attack buttons and drift). A release handler
returns early when the identifier differs from the slot, so a second thumb lifting cannot drop
the first. Swap has no slot and acts on first contact of its own target only:
`deathride/controller/index.html:80 "$('swap').addEventListener('pointerdown',e=>{e.preventDefault();weapon=1-weapon;send()})"`,
which is the "never activated by moving across another button" rule of the plan at
`docs/concepts/deathride/W4-weapons-and-damage.md:23 "never activated by moving across another button"`.

## Relative anchor and neutral start (confirmed)

The relative-drag decision and the deferral of an absolute pad are written down at
`docs/concepts/deathride/W1-feel-research.md:13 "Relative drag avoids a snap at first contact"`.
In the split layout throttle is the upward distance from the vertical anchor at
`deathride/controller/index.html:76 "(steerAnchorY-e.clientY)/layout.throttleTravelPx"`, and a fresh
touch is zero because the anchor is taken at the same instant; the plan states the
intent at `docs/concepts/deathride/W4-weapons-and-damage.md:21 "initial touch starts at zero and needs an upward drag"`.
Release drops throttle with steering: `deathride/controller/index.html:77 "if(layout?.padThrottle)a=0"`.

## Layouts as data and the cruise combination (confirmed)

The three layouts are rows in a data file, with the cruise and split behaviours as flags:
`deathride/core/src/main/resources/data/controller-layouts.csv:4 "Split,Split,0,1,100,Drag UP on the steering pad for GO; right thumb fights"`.
The cruise flag is consumed where the held states are combined, not by name:
`deathride/controller/index.html:54 "layout?.fireDrives&&fire?1:0"`. The plan
described the three as experiments at `docs/concepts/deathride/W4-weapons-and-damage.md:19 "**Classic**: steer left; right thumb pedals plus separate fire/mine/swap"`
and `docs/concepts/deathride/W4-weapons-and-damage.md:20 "**Cruise**: steering left; FIRE right also accelerates"`.

## Mirror (confirmed) and its limit

Mirroring is a CSS order swap over every layout, not a layout:
`deathride/controller/index.html:10 ".mirrored .steer{order:2}.mirrored .pedals{order:1}"`;
split hides the explicit go control with `deathride/controller/index.html:11 ".layout-Split .gas{display:none}"`.
Changing either choice calls the applying routine, which begins with a clear:
`deathride/controller/index.html:81 "function applyLayout(){if(!layout)return;neutral();"`.

## Neutralising (confirmed, with a deviation)

The clearing routine zeroes values, forgets slots and sends at once:
`deathride/controller/index.html:55 "function neutral(){fire=0;mine=0;firePointer=minePointer=null"`.
Opening a sheet calls it first: `deathride/controller/index.html:83 "$('settings').onclick=()=>{neutral();"`;
a wrecked state from the host does too: `deathride/controller/index.html:71 "if(c.wrecked&&(fire||mine||a))neutral();"`.
The plan's statement is `docs/concepts/deathride/W4-weapons-and-damage.md:37 "opening any settings sheet neutralizes the car"`.
The scrolling shop is handled as the intersection rule requires: the driving page sets
`deathride/controller/index.html:4 "touch-action:none"` on root and body, and the shop switches
them while open at `deathride/controller/index.html:17 "html.garageOpen,html.garageOpen body{touch-action:pan-y}"`,
the incident recorded at `docs/concepts/deathride/PITFALLS.md:18 "browser intersects ancestor policies"`.

## Deviations from the standard

- The link-loss routine is a second copy of the clear and omits steering:
  `deathride/controller/index.html:56 "function fail(){if(!lost){fire=0;mine=0;"` zeroes `a`, `b`, fire, mine and drift but not `s` nor the
  steering slot, so the stated rule (one routine, every path) is not met there.
  The host-side stale cutoff covers it only if it zeroes steering, which was not read.
- The weapon choice is a phone-local toggle (`weapon=1-weapon` at line 80) never read back
  from the host's weapon name in the HUD handler, so after a reconnect the phone's bit and the
  host's weapon may differ. The plan promised an explicit index so repeats cannot cycle it
  (`docs/concepts/deathride/W4-weapons-and-damage.md:35 "weapon selection an explicit index so packet repeats cannot cycle it"`); the explicit index is sent, its source is local.

## Evidence status

The plan records an emulated-client check: `docs/concepts/deathride/W4-weapons-and-damage.md:46 "with installed Chrome CDP touch over LAN"`
proving all three layouts emit real inputs and mirroring and disconnect clearing work, and
the same paragraph lists `docs/concepts/deathride/W4-weapons-and-damage.md:46 "Physical-phone ergonomics, vibration support, owner fun and optical latency **not measured**"`.
Every ergonomic claim in this subject therefore stays authored or emulated.
