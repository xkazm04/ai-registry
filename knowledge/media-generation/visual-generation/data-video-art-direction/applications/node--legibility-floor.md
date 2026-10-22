---
layer: application
type: application
subject: data-video-art-direction
technique: legibility-floor
stack: node
status: draft
verified_on: 2026-10-22
applied: experiment
ab_verdict: not-better
proof: structural-only
---

# A shrink-to-fit overlay drawer against the floor

A Node service draws on-screen supers and an end-card onto a canvas in
headless Chromium, at delivery size (1080×1920 for 9:16), inside a per-aspect
safe zone. Its fit routine starts a super at about 5.8% of the short side
(63 px at 1080) and shrinks by 10% per step until the lines fit in three
rows and the widest line fits the safe box, with a hard lower stop at 18 px.
That lower stop is the micro-credit size, not the story-text size.

## What was run

The real page script, instrumented to read the chosen size, over eight super
texts (3 to 20 words, plus one 72-character unbreakable URL) on three
aspects. Arm A is the shipped routine. Arm B is the same routine with the
lower stop moved to 26 px, which is the technique's rule written as a clamp.
24 draws per arm. Target: supers drawn under 26 px. Floor: drawn text stays
inside the safe box.

## What was read

- **Ordinary copy never reached the floor.** Every prose super, up to the
  service's 120-character cap, stayed at or above 37 px on 9:16 and 46 px on
  1:1. The longest one lost 41% of its starting size on 9:16 to fit, which is
  the technique's "cut words, never size" broken in spirit while the floor
  held. The service's separate script validator caps supers at seven words;
  at seven words every aspect draws at the full 63 px.
- **Only the unbreakable token breached it:** 22 px on 9:16 and 24 px on
  1:1, 2 of 24 draws. Arm A and arm B differ here only in what fails.
- **The clamp does not fix it.** At 26 px the 9:16 URL overflows the safe box
  (the floor that matters more), and the 10% step overshoots the clamp in
  any case (24 px on 1:1). No size satisfies both the floor and the box for
  a token wider than the box.

## What it shows

Target 2 of 24 in arm A, 2 of 24 in arm B (one of them now also breaching
the box): `not-better` as a clamp. The technique's rule is right and a
renderer cannot enforce it by sizing. For a token that cannot break, the
decision belongs upstream of the drawer: replace it or move it to the
credit line. The service has the upstream gate (a word cap) on one request
path and only a character cap on the other, which is why the drawer is the
last place the breach can show.

## What this cannot show

No frame was looked at on a phone, so legibility of the 37 to 46 px cases is
inferred from the number, not seen. One service, one font stack, copy
written for the run.
