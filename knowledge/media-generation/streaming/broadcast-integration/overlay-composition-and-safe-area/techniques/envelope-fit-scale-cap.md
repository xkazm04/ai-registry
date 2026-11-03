---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: envelope-fit-scale-cap
status: forged
laws: []
shared_with: []
use_when: [writing the layout root of an overlay page, exposing a size or scale setting to the streamer, supporting more than one canvas size or orientation]
---

# Envelope fit with a scale cap

An overlay page is drawn against an **envelope**: the width and height at which its layout
was designed and checked — say a bar six hundred units wide and ninety tall. The source
that renders it in the broadcasting software has whatever size the tool or the streamer
gave it, on a canvas that may be full HD, lower, or vertical. The page must reconcile the
two itself, every time its viewport changes, without ever drawing outside the viewport.

## The rule

Lay the content out at envelope size, then apply one uniform scale:

> effective scale = min(requested scale, viewport width / envelope width, viewport height / envelope height)

and position the scaled envelope at the requested anchor inside the viewport.

The requested scale is the streamer's or the tool's preference — small, medium, large, or a
number. The two viewport ratios are the ceiling: the largest scale at which the envelope
still fits. Taking the minimum means a request never overflows, a viewport too small for
the request shrinks the content to fit instead of cropping it, and a viewport larger than
needed does not inflate the content past what was asked for. One uniform scale keeps the
proportions the design was checked at; scaling width and height separately stretches type
and is never right.

## Why each half matters

Without the cap, a scale setting is a way to push the bottom line of a result off the
canvas. It will be used that way by accident — a streamer chooses "large" on a vertical
canvas, or a source is created at a smaller size than the design assumed — and the cropped
overlay looks like a bug in the overlay. Without the requested scale, the page simply fills
whatever it is given, and a full-canvas source turns a small badge into a wall.

## Procedure

1. Declare the envelope as a constant per overlay kind, and design and review at that size.
   When the content animates — a meter that grows with intensity, a layer that moves, a
   design authored as data with layers at negative offsets — the envelope is the union of
   every state the content can reach, computed from the extremes, not from the current
   frame. An envelope measured from the current frame refits on every change and the
   overlay visibly pumps as it animates.
2. Read the requested scale and anchor from the overlay's typed parameters; clamp unknown
   values to the defaults rather than failing to render.
3. Compute the effective scale on load and on every viewport resize. The page's viewport
   is the width and height set in the source's own settings, and changing those resizes it.
   Scaling the source in the scene does not: the scene transform resamples the texture the
   page already rendered, so the page never learns about it. A scene scale above one
   blurs the overlay and sidesteps the cap. Offer size to the streamer as the source's
   width and height or the page's own scale parameter, never as a scene scale.
4. Apply the scale as one transform on a single root element, with the transform origin at
   the anchor, so content grows away from the anchored edge.
5. Keep a safe-area inset inside the viewport when the source is full-canvas, so anchored
   content does not touch the frame edge.
6. Name presets in a way that survives the cap: "small / medium / large" are requests, and
   the overlay may honour less than "large" when the room is not there.

## Decision rules

- **When the viewport is smaller than the envelope at scale one**, shrink to fit; never crop,
  never scroll, never wrap into a second layout silently.
- **When a stylesheet sizes the overlay in viewport units and hides overflow**, that is a
  crop with a nicer default, not a fit: at some viewport the last line disappears. Compute
  the scale from the envelope instead.
- **When content is variable length** (names, option labels), the envelope includes the
  longest allowed text, and the text is truncated by rule at the data layer, not by
  overflow at the pixel layer.
- **When the fitted scale would put body text below a readable size** at the target canvas,
  that is a design signal — the overlay is too dense for that slot — not a reason to remove
  the cap.

## When not to use it

A page that is genuinely fluid — a ticker that should span whatever width it is given — is
not envelope-fitted; it reflows along one axis and fits on the other. Use the cap on the
axis that has a designed size and let the fluid axis fill.
