---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: verify-the-rendered-scene
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [after a tool provisions or changes overlays in a scene, before a stream, recording or demo goes out, writing an automated check for overlay layout]
---

# Verify the rendered scene

The proof that a composition works is the composed picture. After overlays are provisioned
or changed, capture what the broadcasting software actually renders and check it — not the
tool's record of the transforms it requested, not each overlay page rendered alone.

## Why the record is not the picture

The record says "ballot bar at top-centre, scale one; plate at bottom-right, scale one".
Between that record and the frame sit many things that can differ: a request that failed
quietly, a default the software applied instead, a transform clamped to the canvas, the
streamer's own sources added above yours, a page whose own layout moved its content, a
canvas of a different shape than the placement table assumed. Each overlay checked alone
also misses the one failure that defines the subject: overlap. Only the composed frame
contains every layer at once.

## Procedure

1. **Capture the program output**, or the scene as the software renders it, at canvas
   resolution — a screenshot request to the software or a frame from its output is enough.
   A browser source in a scene that is not showing may not be painting: a one-off
   screenshot of a hidden scene can catch the embedded browser before its first frame and
   return transparent pixels that look like an empty overlay. Put the scene on program (or
   otherwise keep it showing), wait until each source reports itself active and showing,
   capture, then restore what was on program.
2. **Locate each owned overlay.** Use the placement the software reports for each source
   (its actual bounds on the canvas, read back after the change) and, where possible, the
   rendered content box inside it.
3. **Check that each overlay drew something** — a non-trivial share of visible pixels in its
   box. This is the floor and catches a blank page, but it passes a pile: five overlays
   stacked in one spot each have plenty of visible pixels.
4. **Then check the composition rules mechanically:**
   - no two owned overlays' content boxes intersect;
   - every content box lies inside the safe area of the target canvas;
   - nothing the tool owns covers a region the streamer reserved (camera, game HUD) when
     the streamer has declared one.
5. **Check legibility at viewer scale.** Downscale the captured frame to phone width and
   confirm the overlay text is readable — by a person in review, or by a size threshold the
   team has measured on its own canvas.
6. **Report three states, not two.** Pass, fail with the offending boxes named, or
   unmeasured when the capture could not be taken. A check that could not see the scene
   never reports pass.
7. **Re-run on change.** After every provisioning event, every canvas change, and before
   any take or broadcast where the picture matters.

## The tooling trap

When the picture is wrong, the fastest fix is in whatever is closest to hand — a recording
script that lays overlays out before a take, a manual drag before going live. The picture
then looks right and the product still piles overlays for every streamer who is not
running that script. When a verification fails, fix the cause in the provisioning path,
and treat any composition logic that lives only in test or demo tooling as a defect
report against the product.

## Decision rules

- **When the scene was not captured**, the composition is unmeasured.
- **When the check fails in a demo or rehearsal**, the fix goes into the product's
  placement, not into the demo.
- **When the streamer has deliberately overlapped overlays**, record it as their choice and
  stop flagging that pair; the tool reports its own mistakes, not the streamer's taste.

## When not to use it

A tool that only ever controls one overlay and never touches the scene has nothing to
compose; a manual look before going live is enough. Automate the check when the tool
provisions several overlays or provisions them during the show.
