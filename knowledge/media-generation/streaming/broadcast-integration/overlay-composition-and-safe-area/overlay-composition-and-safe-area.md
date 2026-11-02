---
layer: golden-path
type: golden-path
subject: overlay-composition-and-safe-area
status: forged
use_when: [adding several tool-made overlays to one streamer's scene, deciding where an overlay sits and how large it may draw, diagnosing a stream picture where overlays pile up or read as broken, deciding when an overlay should be created and removed]
techniques:
  - placement-declared-at-provisioning
  - envelope-fit-scale-cap
  - provenance-badge-opposite-corner
  - provisioning-follows-domain-lifecycle
  - designed-for-the-stream-background
  - verify-the-rendered-scene
---

# Overlay composition and safe area

A streamer's tool rarely puts one thing on stream. A vote bar, a giveaway plate, a
contribution meter, a duel scoreboard, a status badge — each is a separate page the
broadcasting software renders as a browser source, and every one of them lands on the
same canvas, over the same game footage or camera, in front of viewers who mostly watch
on a phone. Overlay composition is **the discipline of giving each of those layers a
declared place, a size that cannot overflow it, a moment at which it exists, and a look
that survives whatever is behind it** — and then proving, from the picture itself, that
the composed result is readable.

The principle the subject holds to:

> **The stream picture is the product.** A viewer never sees the tool's settings screen,
> its ledger of what it asked for, or the overlay page on its own. They see one composited
> frame, downscaled, over unknown content. Every decision here is judged in that frame and
> nowhere else.

The naive reading treats each overlay as an independent widget: build the page, add it as
a source, done. Each widget looks right alone. Five of them added the same way land in the
same default spot, at the same default size, one on top of the other, and the stream shows
a pile. Nothing failed — every request succeeded, every page rendered — and the picture is
unusable. That is the characteristic failure of the subject: **composition fails silently,
in aggregate, on the one surface no test looked at.**

## A place is declared, never defaulted

Broadcasting software has a default for where a new source appears — usually the canvas
origin or its centre, at the source's native size. That default is a placeholder for a
human who will drag the source into position. A tool that provisions overlays is not a
human with a mouse, so it must say where each overlay goes as part of creating it: an
anchor (which corner or edge it hugs), an offset inside the safe area, and a scale. An
overlay created without those values has been placed by accident, and every overlay
created the same way has been placed in the same accident.

The place belongs to the overlay *kind*, chosen once by design — the ballot reads across
the top, the giveaway plate sits bottom-right, the status badge top-left — and recorded so
two kinds cannot claim one slot. The streamer may move them; the tool's job is that the
first frame after provisioning is already a composed frame. That is
[placement-declared-at-provisioning](./techniques/placement-declared-at-provisioning.md).

A second, quieter failure lives in the same channel. Position can be set in two places: by
the scene (where the source sits on the canvas) and by the page (where its content sits
inside the source). When both try — a full-canvas source whose page also pins itself to a
corner, then a scene transform that moves the source as well — the two authorities do not
average; the overlay lands somewhere neither intended. Choose one owner of position per
overlay and let the other stay neutral.

## A size is fitted, never trusted

Every overlay is designed against an envelope — the width and height at which its layout
was drawn and checked. The source that renders it may be any size the streamer or the tool
chose, and the canvas may be landscape, vertical, or a lower resolution than the design.
So the page fits itself: it scales to the smaller of the requested scale and what the
viewport can hold, `min(scale, viewportWidth / envelopeWidth, viewportHeight /
envelopeHeight)`, and anchors the scaled envelope inside the viewport. It never overflows
its source, never crops its own text, and never upscales past what the streamer asked for.
A scale knob that can push content off the edge is a knob that will, on the first vertical
canvas. That is [envelope-fit-scale-cap](./techniques/envelope-fit-scale-cap.md).

## The safe area is the floor of every placement

The edges of the canvas are not reliably visible. Platform players lay controls, captions,
chat panes and gradients over the frame; vertical players on phones cover large bands at
top and bottom; clips and thumbnails crop. Broadcast practice has long reserved a margin —
roughly the outer five per cent on each side as action-safe, more for text — and streaming
needs at least that, plus extra for whatever the player paints on top. Every anchored
placement sits inside the safe area, and the safe area is a property of the target canvas
and player, not a constant: a vertical canvas has very different bands from a landscape
one. When one design serves both, it is placed twice, once per canvas.

## Provenance is part of the picture, in the corner that is always free

A tool that can run in rehearsal, demo, or test mode will at some point put a simulated
result on a real stream, or a real one on a recording that looks staged. The overlay
carries its own provenance — "rehearsal", "simulated chat", "test fire" — inside the
overlay, so it travels with the content into every scene, recording and clip. The badge
sits in the corner opposite the overlay's anchor, because that corner is the one the
content grows away from, the one the scaled envelope leaves free, and the one least likely
to collide with a neighbour hugging the same edge. A badge that can be hidden by a scene
crop or omitted by a separate source toggle is not provenance, and neither is one a
streamer's custom design can cover: the badge is chrome the overlay owns, outside whatever
part of the look is authored as data. That is
[provenance-badge-opposite-corner](./techniques/provenance-badge-opposite-corner.md).

## An overlay exists when its subject exists

The tidy instinct is a setup step that provisions every overlay up front, so the streamer
sees the whole layout at once. It fails twice. Overlays whose subject does not exist yet —
a giveaway plate before any draw is sealed, a duel board before a duel is called — either
render an empty frame on air or are skipped by a setup that only provisions what currently
has data, and then never appear. And overlays whose subject has ended linger as stale
furniture. The rule is that **provisioning follows the domain lifecycle**: an overlay is
created when the thing it shows comes into being — or, where the streamer must approve
every change to their own scene, offered at that moment, pre-placed, one confirm away —
removed when that thing ends, and the
setup screen shows the overlays that will appear later with the event that will bring them,
so the streamer can still place them in advance. That is
[provisioning-follows-domain-lifecycle](./techniques/provisioning-follows-domain-lifecycle.md).

## The look is designed for what is behind it

An overlay page is designed in a browser, on a neutral background, at full size. It airs
over a dark game, a bright game, a webcam, a black "starting soon" scene, and is watched at
a fraction of its size. A pale card that looks clean on a design canvas reads as a broken,
unstyled box over black; thin type that reads at full size becomes noise in a phone
preview. Design every overlay against the worst backgrounds it will meet — black, white,
busy footage — with its own scrim or outline so it never depends on what is behind it, and
size its type for the downscaled viewer, not the designer's monitor. The empty and
loading states are designed too, because they air. That is
[designed-for-the-stream-background](./techniques/designed-for-the-stream-background.md).

## The picture is the evidence

The tool's record of what it requested — this source at this anchor and scale — is a claim
about the frame, not the frame. Requests are dropped, the streamer moves things, another
tool adds a source above yours, the software clamps a transform. The only proof that the
composition works is the rendered scene: capture the program output, find each overlay in
it, and check that none overlap, all sit inside the safe area, and the text reads at a
viewer's scale. "Each overlay drew something" is the floor of that check and the most
common place it stops; a pile passes it, because every layer in the pile has pixels. A
composition that was never looked at is unmeasured, not passed. That is
[verify-the-rendered-scene](./techniques/verify-the-rendered-scene.md).

## The failure modes of the naive reading

**Default placement.** Every overlay added without an anchor lands in the same spot. The
pile is the default outcome, not an edge case.

**Composition solved outside the product.** A demo or a recording script that arranges the
overlays by hand produces a clean picture and hides that the product would have piled them.
If the tooling had to fix it, the product has the bug.

**Set up everything first.** A setup step that provisions only what exists today misses
every overlay born later in the session, and the streamer finds out on air.

**Designed on white, aired on black.** Overlays styled for a design canvas look like errors
over a real stream background.

**The ledger as proof.** "We sent the transform" is not "the viewer can read it".

**One layout for every canvas.** A landscape placement on a vertical canvas puts content
under the player's controls.

## Boundaries

**Against [on-stream overlay delivery](../on-stream-overlay-delivery/on-stream-overlay-delivery.md)**,
which serves the pages the broadcasting software renders: delivery owns what the page
receives and from where — the read-only origin, the payload shape, what the page shows when
its feed drops. This subject owns where that page sits on the canvas, how large it draws,
when it is created, and whether it reads over a real stream. The rule: if the question is
about the bytes the page gets, it is delivery; if it is about the pixels the viewer gets,
it is here.

**Against [broadcast software control](../broadcast-software-control/broadcast-software-control.md)**,
which drives the broadcasting software over its control socket: control owns how a source
is created, owned, and proven removed. This subject decides what to ask for — the anchor,
the scale, the moment — and control carries it out safely. The rule: what the scene should
look like is here; how the tool changes the scene without touching what it does not own is
there.

**Against [visible consequence of steering](../../live-show/audience-steering-economies/techniques/visible-consequence-of-steering.md)**,
which governs what an on-screen result claims about a ballot: that technique owns the
content of the claim, read from the tally. This subject owns the frame it appears in. A
ballot bar that is correct and unreadable has failed here; one that is readable and names
the wrong winner has failed there.
