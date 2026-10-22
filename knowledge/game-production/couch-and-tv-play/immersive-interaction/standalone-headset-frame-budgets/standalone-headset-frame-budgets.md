---
layer: golden-path
type: golden-path
subject: standalone-headset-frame-budgets
status: draft
use_when: [setting authoring limits for a self-contained head-worn device on a mobile-class GPU, a scene that ran on the desk drops frames on the headset, a budget holds at the start of a session and fails later in it, one budget must hold on more than one headset]
techniques:
  - per-content-class-frame-budget
  - overdraw-and-transparency-ceiling
  - forward-path-feature-allowance
  - stereo-draw-call-budget
  - thermal-headroom-reserve
---

# Standalone headset frame budgets

A standalone headset renders two views on a mobile-class, tile-based GPU, inside a battery
and a sealed enclosure, at a refresh rate it does not let the game miss. A dropped frame is
not a stutter the player forgives. The compositor reprojects an old image, and the player
feels the world slip. So the frame is not a target to approach. It is a ceiling with a
reserve held under it, and the game's content has to be authored to fit beneath that
reserve from the first asset. This subject owns those authoring budgets: what each content
class may spend, how much transparent fill a view may carry, which shading features the
forward path allows, how draws are counted under two-eye rendering, and how much of the
frame is left unspent for the clocks the device will drop to in sustained play.

## Status of this subject

This subject is a draft. It is written from practitioner knowledge, hardened with a few
searches, and from one consumer's planned budgets, not from a measured run. Its evidence
gate is owed: device captures, each with n, date, device, build hash and command. There is
no such capture yet, and nothing below should be read as having passed it. The gate is met
by a later application, never by this text. Every figure belongs in that application. The
rules here carry none.

## Boundaries, stated first because the one-copy rule binds here

Neighbours own rules this subject uses and does not restate.

- **The gate belongs to perf regression gating.** A budget split by stage, rather than one
  frame time, is
  [per-thread budgets, not one frame-time](../../../engine-integration/perf-regression-gating/techniques/per-thread-budgets-not-one-frame-time.md).
  The window a capture is read over is
  [bracketed capture window](../../../engine-integration/perf-regression-gating/techniques/bracketed-capture-window.md).
  What a desk figure may claim about a device that is not on hand is
  [host-independent work counts](../../../engine-integration/perf-regression-gating/techniques/host-independent-work-counts.md).
  This subject owns the authoring budgets that gate compares against, not the comparison.
- **Lighting per hardware tier belongs to shader budget authoring**, through
  [hardware-tier lighting presets](../../../asset-production/surface-and-imagery/shader-budget-authoring/techniques/hardware-tier-lighting-presets.md).
  Baked against dynamic light on the headset is that preset table's floor tier. It is cited
  there and not minted here.
- **Polygons per asset class belong to**
  [asset-class poly budgeting](../../../asset-production/geometry/asset-class-poly-budgeting/asset-class-poly-budgeting.md).
  This subject counts a scene's triangles only as the sum those budgets produce.
- **Texture memory belongs to render submission economy**, through
  [residency budget checked before decode](../../../engine-integration/render-submission-economy/techniques/residency-budget-checked-before-decode.md).
  A headset's share of its per-app memory ceiling is set there.
- **How a device measurement is taken belongs to the on-device verification harness.** The
  thermal start state is recorded by
  [fresh state per check](../../couch-and-tv/on-device-verification-harness/techniques/fresh-state-per-check.md),
  and a session is split into the windows it is judged over by
  [separate active race from transition windows](../../couch-and-tv/on-device-verification-harness/techniques/separate-active-race-from-transition-windows.md).
  Every capture this subject asks for is taken under both.
- **Device operations belong to**
  [the television-stick device realities](../../couch-and-tv/fire-tv-device-realities/fire-tv-device-realities.md),
  the nearest single-device-class precedent: one fixed device class, known in advance, with
  its own failure modes. That subject owns installing, waking and running on such a device.
  This one owns what the renderer may spend on it.

## What a principal practitioner holds true

**The frame is fixed and the miss is felt.** On a desk a slow frame lowers the frame rate.
On a headset the display runs at its rate regardless, and a late frame is replaced by a
reprojection. The budget is therefore a hard ceiling with no soft landing, and the content
plan is written against it, not against an average.

**The sustained clock is the budget, not the peak.** A cold headset runs faster than the
same headset after a long session. A budget proved in the first minutes is proved for a
device the player will not have. The reserve under the ceiling is held for the clocks the
device drops to when warm, and the capture that proves it is a long one.

**Fill is the first bill on a tiler.** A tile-based GPU keeps colour and depth on chip and
writes each tile out once. Opaque geometry that writes depth is close to free to overdraw;
blended layers, alpha-tested cut-outs and full-screen passes are not. Most frames that fit
on the desk and miss on the headset miss on transparent fill or on a pass that forced the
tile out to memory.

**Two eyes double some costs and not others.** With a multi-view path the CPU submits each
draw once for both views, and the GPU still runs vertex and pixel work for each view. A
budget that does not say which side of that line a number sits on cannot be checked.

**The most demanding device binds, per quantity.** When one budget must hold on more than
one headset, each quantity is bound by the device that finds it hardest. For fill, that is
the device that renders the larger eye buffer, because the same GPU class shades more pixels.
The eye buffer is set by the runtime, not by the panel, so two displays can tie.
For CPU submission, it is the device with the slower CPU. "The weakest device binds" is
right only when one device is weakest on every quantity, and that is rarely true.

**A budget shapes the content, it does not only cap it.** The limits are known before
anything is authored, per content class, so an artist chooses an additive effect over an
alpha-blended one because of the ceiling, rather than discovering the ceiling in a capture
the week before submission.

## The load-bearing distinctions

- **A per-content-class budget versus one frame time.** The second says the frame is late.
  The first says which class spent the reserve.
- **Opaque overdraw versus blended overdraw.** The first is mostly culled on chip. The second
  is paid in full, once per layer per pixel.
- **On-chip work versus a resolve to memory.** A pass that reads the frame back after it is
  drawn pays for the frame to leave the tile, before its own cost.
- **A draw submitted versus a view rendered.** Submission is counted once under multi-view;
  rendering is counted per view.
- **A cold capture versus a sustained capture.** The first proves the peak clock. Only the
  second proves the budget.
- **A desk figure versus a device figure.** A desk count of draws or layers is a work count.
  It is not a frame time on the headset, and it is labelled so.

## What the naive build gets wrong

- **It states one frame time for everything**, so the particle system and the environment
  both believe the whole frame is theirs.
- **It ports desktop effects unchanged**, and full-screen translucent smoke drops frames on
  the device while the desk shows no cost.
- **It adds a post-process pass by default**, forcing the frame off chip and losing the
  features that apply only to the final swapchain image.
- **It writes a draw-call cap without saying per view or per frame**, so two people read the
  same number two ways.
- **It proves the budget in the first minutes of a session**, then the device warms, drops
  its clocks, and the budget fails well into a session of ordinary play.
- **It lets the weakest headset bind everything**, and is surprised when the device with the
  larger eye buffer runs out of fill first.

## Seams with neighbouring craft

How long a gesture or a timing window may take to judge belongs to hand-tracked timing
windows; this subject only ensures the frame that window reads arrives on time. Which
regressions a gate blocks belongs to perf regression gating. This subject supplies the
numbers it gates against, and those numbers live in applications.
