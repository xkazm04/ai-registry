---
layer: application
type: application
subject: two-thumb-touch-layout-design
technique: pointer-capture-per-control
stack: node
status: forged
verified_on: 2026-10-10
applied: simulation
ab_verdict: better
---

# A single-page phone controller realising ownership, relative steering, layouts, mirror and neutral

Source tree: `firetv-deathride` on branch `deathride/main` at `d9990777`, read 2026-10-10; paths are
relative to its root. This file was first written from the working tree of 2026-10-01. Sixteen of its 27
quotes had moved or gone by 2026-10-10, because a "multitouch hardening" commit (`898f4928`,
2026-10-06) rewrote the handlers and added a fourth layout. The controller is one static browser page
served by the game host. The stack label `node` is the nearest allowed slot for browser-side
JavaScript. No physical phone has run it.

## Per-control capture, and the press that takes over (confirmed)

Every button now shares one claim-and-release routine. The project's own comment states the rule
that replaced refusing a second press:
`deathride/controller/index.html:149 "A new press on a button whose old pointer never reported up simply takes over"`.
The claim swallows a capture failure and then takes the slot unconditionally:
`deathride/controller/index.html:150 "try{el.setPointerCapture(e.pointerId)}catch{}held.set(id,e.pointerId)"`.
Release still listens on three events and still compares identifiers, at
`deathride/controller/index.html:150 "'lostpointercapture'"`. Before `898f4928` each pedal refused a
press while its slot was full. The steering pad still refuses one:
`deathride/controller/index.html:146 "if(steerPointer!==null)return"`, and it takes the slot before
asking for capture.

Swap has no slot and acts on the first contact of its own target only. It now cycles three weapons:
`deathride/controller/index.html:154 "weapon=[0,1,3][([0,1,3].indexOf(weapon)+1)%3]"`.

Fullscreen and orientation lock moved off the press. The reason is recorded at
`deathride/controller/index.html:152 "request it on release, never on a press"`, and the call sits on
`deathride/controller/index.html:153 "document.addEventListener('pointerup',()=>activate())"`.

## Relative anchor, neutral start, and the pad that also brakes (confirmed)

The pad anchors both axes at first contact:
`deathride/controller/index.html:146 "steerAnchor=e.clientX;steerAnchorY=e.clientY"`. Steering is
normalised travel from the anchor, `deathride/controller/index.html:140 "s=clamp(dx/travel,-1,1)"`.
The new default layout reads both vertical directions, each past a fixed dead zone
(`deathride/controller/index.html:51 "PAD_DZ=8"`). Up is go,
`deathride/controller/index.html:141 "a=dy>PAD_DZ?Math.min(1,(dy-PAD_DZ)/(up-PAD_DZ)):0"`, and down is
brake, `deathride/controller/index.html:142 "b=-dy>PAD_DZ?Math.min(1,(-dy-PAD_DZ)/(dn-PAD_DZ)):0"`.
Release cuts every quantity the pad carries:
`deathride/controller/index.html:148 "if(layout?.padThrottle)a=0;if(layout?.padBrake)b=0"`.

## Layouts as data (confirmed): four rows now, and the default changed

The new row authors separate travels for the two directions:
`deathride/core/src/main/resources/data/controller-layouts.csv:2 "Drive,Drive,0,1,90,1,70"`. The original
three remain, for example
`deathride/core/src/main/resources/data/controller-layouts.csv:5 "Split,Split,0,1,100,0,0,Drag UP on the steering pad for GO; right thumb fights"`.
The cruise flag is consumed where held states are combined, and it now covers the ability button too:
`deathride/controller/index.html:109 "layout?.fireDrives&&(fire||ability)?1:0"`. Drive hides both
explicit pedals, `deathride/controller/index.html:31 ".layout-Drive .gas,.layout-Drive .brake{display:none}"`,
which leaves the right thumb with drift, fire, ability, mine and swap.

## Mirror (confirmed)

Mirroring is still a column-order swap over every layout:
`deathride/controller/index.html:11 ".mirrored .steer{order:2}"`. Split hides go with
`deathride/controller/index.html:12 ".layout-Split .gas{display:none}"`. Changing either choice starts
with a clear: `deathride/controller/index.html:155 "function applyLayout(){if(!layout)return;neutral();"`.

## Neutralising (confirmed, one deviation narrowed)

The clearing routine now forgets the pad and pedal slots and the shared button map together:
`deathride/controller/index.html:110 "steerPointer=gasPointer=brakePointer=null;held.clear()"`.
Opening a sheet calls it first, at
`deathride/controller/index.html:157 "$('carButton').onclick=()=>{neutral();"`. A wrecked state from the
host calls it too: `deathride/controller/index.html:132 "if(c.wrecked&&(fire||mine||ability||a))neutral();"`.

## The scrolling sheet: the field fix and what a browser run says

The driving page blocks panning on the root and on every button, with three occurrences of
`deathride/controller/index.html:4 "touch-action:none}"`. The sheet is its own scroll container:
`deathride/controller/index.html:14 ".card{max-height:95dvh;overflow:auto"`. The project diagnosed a sheet
that would not scroll as `docs/concepts/deathride/PITFALLS.md:18 "browser intersects ancestor policies"`,
and fixed it by switching the root while the sheet is open:
`deathride/controller/index.html:18 "html.garageOpen,html.garageOpen body{touch-action:pan-y}"`.

A seven-variant run on 2026-10-10 does not support that diagnosis. It used installed Chrome 154,
headless, with mobile touch emulation and CDP touch drags. A positive control scrolled and a negative
control did not, and two runs gave identical results. A scroll container under
`html,body{touch-action:none}` scrolled by touch with or without its own `pan-y`. A drag that began on a
child button with `touch-action:none` did not scroll, **with the root switched to `pan-y` as well**.
When the buttons were given `pan-y`, the same drag scrolled. In Chrome the intersection stops at the
scroll container, and the elements under the finger decide. A drag that begins on the shop's offer
buttons is blocked whatever the root says. No phone has confirmed this, and WebKit was not run.

## Deviations from the standard

- **The link-loss routine is still a second copy of the clear, and it still omits steering.**
  `deathride/controller/index.html:111 "function fail(){if(!lost){"` zeroes go and brake and forgets the
  pedal slots, `deathride/controller/index.html:111 "a=0;b=0;gasPointer=brakePointer=null;held.clear()"`,
  but leaves `s` and the steering slot. The harm is narrower than first written. Nothing is sent while
  the link is lost, and the link-up handler clears before anything else:
  `deathride/controller/index.html:116 "status('Player '+(slot+1)+' · linked',true);neutral();"`. A thumb
  held across a drop therefore cannot resume driving. Holding steering through a gap is also the host's
  deliberate design: `deathride/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md:73 "holds steering and drops propulsion/braking after 250 ms"`,
  implemented at `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:72 "out.set(steer, if (stale) 0.0 else throttle, if (stale) 0.0 else brake)"`.
  The two copies of the clear can still drift apart. In effect, the glass's steering value during a
  drop is moot.
- **The weapon choice is still phone-local.** It is sent as an explicit index, and that index is still
  derived from a toggle the phone keeps rather than from the host's weapon. After a reconnect the two can
  differ.

## Applied: take-over versus refuse, on the project's own handler text

Simulation on 2026-10-10. The pre-`898f4928` pedal handler and the current `hold` routine were taken
verbatim from git and driven through a fake element, four cases each:

| Case | Refuse while held | Take over |
|---|---|---|
| Release lost, player presses again, lifts | **stuck for good** (1,1,1,1) | recovers (1,1,1,0) |
| Second finger on the same held button, lifts first | correct (1,1,1,0) | **drops while a finger is still down** (1,1,0,0) |
| Browser cancels the touch, fresh press, lift | correct | correct |
| Capture throws (constructed), release goes elsewhere | press ignored (0,0,0,0) | **held with no finger until the next press** (1,1,1,0) |

Verdict **better**, with conditions. Take-over trades a permanent stuck hold for an early release when
two fingers share one button, and an early release is the safe failure. Swallowing the capture error
creates a short-lived stuck hold that only the take-over rescues. The pad, which still refuses and still
takes its slot before capture, keeps the old exposure. Mode: `simulation`. It shows the handler logic,
not what a physical panel delivers.

## Evidence status

The project's browser check drives two, three and four simultaneous CDP touches, including the
pad held together with drift, fire and mine. The owner checklist marks the third finger as the open
physical question: `deathride/OWNER-CHECKS.md:312 "it cannot show whether a real Android Chrome cancels a third finger"`.
Every ergonomic claim in this subject therefore stays authored or emulated.
