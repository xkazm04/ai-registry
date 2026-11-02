---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: designed-for-the-stream-background
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [styling an overlay page, reviewing whether an overlay reads on a real stream, an overlay looked fine in the browser and broken on stream]
---

# Designed for the stream background

An overlay page is a transparent layer over content the designer never sees: a dark game,
a bright game, a camera, a black holding scene, a busy map. Viewers watch it scaled down —
a phone in portrait, a sidebar preview, a thumbnail. Design for that picture, not for the
browser tab it was built in.

## The two lies of the design canvas

The first is the background. A page styled on a white or mid-grey editor canvas borrows
that background for its contrast. Pale cards with thin borders look clean there; on air,
over black, the same cards read as an unstyled box — the look of a page whose stylesheet
failed to load — and over bright footage their text disappears. The overlay must bring its
own contrast: a solid or high-opacity panel, or an outline and shadow on type, so that its
legibility does not depend on anything behind it.

The second is size. The designer sees the overlay at full canvas resolution on a large
monitor. Much of the audience sees the whole canvas at the width of a phone, where the
canvas is shrunk to roughly a third or less of its pixels. Type that is comfortable at full
size becomes a smudge. Practitioners land on different thresholds for the smallest
readable text on a full-HD canvas, which is the honest signal that a fixed number is not
the answer: the answer is to look at the overlay at phone scale, on the real canvas,
before calling it done.

## Procedure

1. **Bring your own background.** Every text-bearing element sits on a panel or carries an
   outline/shadow; nothing relies on the stream behind it for contrast.
2. **Review on a background matrix.** At minimum: pure black, pure white, and a busy
   high-detail frame of the kind the streamer actually shows. An overlay that fails any one
   fails.
3. **Review at viewer scale.** Downscale the composed canvas to phone width and to a small
   preview tile and read every line. Text that cannot be read there is cut, enlarged, or
   moved to a place where it can be.
4. **Design every state that airs.** Empty, loading, disconnected, and finished states are
   on screen for real seconds. A state nobody designed renders as browser defaults.
5. **Favour weight over detail.** Bold, simple sans-serif type, few words, strong figure
   contrast; decorative detail and hairlines do not survive compression and scaling.
6. **Respect the encoder.** Fine gradients band and fast small motion smears under stream
   compression; prefer flat fills and deliberate motion.

## Decision rules

- **When an overlay was only reviewed in a browser tab**, its legibility is unmeasured, not
  passed.
- **When a design looks right on one background and wrong on another**, the design is
  wrong; fix contrast inside the overlay, not by asking the streamer to change scenes.
- **When the stream uses a vertical canvas**, review there separately; a landscape review
  says nothing about the vertical picture.

## When not to use it

A purely decorative frame with no information in it — a border, a texture — does not need
the legibility review, only the background matrix. Everything that carries words or
numbers needs both.
