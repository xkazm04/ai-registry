---
status: EXECUTED (2026-10-26, bp-vr-fid-sprint; E4 escalation answered in advance by the operator's dispatch, which allowed a new subject "if the corpus truly lacks it"; drafted by the director, not a forge worker - see "Override" below)
source: librarian/sources/2026-10-26-bp-vr-fidelity-sprint.md
run_id: bp-vr-fid-sprint
bundle: game-production
category: couch-and-tv-play
subcategory: immersive-interaction
subject: seated-in-world-reading
resolved_path: knowledge/game-production/couch-and-tv-play/immersive-interaction/seated-in-world-reading/
category_count: immersive-interaction holds 4 subjects before and 5 after; the cap is 10, so V1 clears. Link depth from the subject folder to the bundle's _laws.md is ../../../_laws.md.
---

# Spec: seated-in-world-reading

## Why this is XL

Three candidates from one source share one home-if-new, which fires the XL trigger mechanically:

1. an angular legibility floor for text and thin marks, checked in the scoring capture's pixels, with pagination or
   dropping instead of shrinking;
2. placing world-space reading panels from measured geometry (the view band, the table's depth, the eye), not from a
   nominal distance;
3. seated comfort: a context switch fades the content and never the view.

`research-map` found no subject that owns reading in a head-worn display. The near neighbours each refuse it:
- `design-tokens/density-and-scale-axes` owns minimum sizes and drop-not-clip for flat screens, where size is in
  points and not in angle;
- `concept-scene-parity` scores against a concept, and a legibility floor is a product rule that binds with or
  without a concept;
- `standalone-headset-frame-budgets` owns cost, not reading;
- `hand-tracked-timing-windows` and `drawn-gesture-command-recognition` own input, not output.

The prior run (2026-10-25) banked "legibility floor from the scoring pose" as lead 1, waiting for a measured typography
round. That round landed in the project (a floor in code, every text class fitted against it, a screen deck measured at
7.6 to 8.1 px), so the lead's return condition has fired.

## Evidence

- One project, one sprint (2026-10-24 to 2026-10-26), a tethered PC headset on a forward path.
- The floor, the deck geometry and the fade are in the project's committed code.
- The judges' readings of the wrist panel and the tags come from a blind three-judge panel (2026-10-25).
- One primary was fetched in-run: a headset platform vendor's typography guidance, with minimum legible text at
  0.35 to 0.5 degrees and comfortable text at 0.6 to 0.8 degrees.
- The comfort technique rests on training-data convergence: the rest-frame account of simulator sickness, and the
  standard rule that the view never moves unless the head moves it. It also rests on the owner's doctrine, which is
  in code.

## Techniques and the rule each must carry

- `angular-legibility-floor`:
  - state the floor as an angle;
  - check it in the pixels of whatever instrument binds (here the flat scoring capture, about 14 px a degree, against
    about 25 on the headset);
  - measure every text class at its worst placement;
  - text lying on a surface seen at a grazing angle is foreshortened, so tilt it toward the eye or drop it;
  - a minimum is not a reading size: body text belongs at the comfortable band;
  - thin weights vibrate;
  - lines and marks have a floor too: fade them by intensity, not by width.
- `panel-placement-in-the-view-band`:
  - place by geometry measured from the seated eye;
  - "at N cm" and "above the far half" can be incompatible;
  - the front screen goes straight ahead;
  - queued screens go beside it as spines, not stacked behind or above it;
  - nothing may be cropped at the frame edge;
  - nothing may cover the focus surface or the agent;
  - a distance change rescales the panel so the angle holds;
  - a body-anchored panel is small and oblique by anatomy, so it carries few rows at large type.
- `fade-the-content-not-the-view`:
  - seated and stationary means no locomotion and no artificial camera motion;
  - a context switch cross-fades the content surfaces while the room stays as the rest frame;
  - transitions are short and are on content only;
  - no blink-to-black, which belongs to locomotion.

## Must not absorb

- Frame cost: owned by `standalone-headset-frame-budgets`.
- Scoring against a concept: owned by `concept-scene-parity`. That subject records the floor as a cheat-column ceiling.
- Flat-screen type scales: owned by software-engineering's design tokens. Name the discriminator (angle against points)
  and do not link across bundles.
- Hand input timing and gestures.

## Override

The director drafted the subject instead of dispatching a forge worker. The evidence was already loaded in the director
from the source read. A worker would have had to re-read the same 50,000 words of scratch and the project's code. A
parallel build session (the project's FAI round) was also live on the same files, so the director kept one reader on
the tree. The director's review of its own diff is the weaker check. Every anchor goes through `check-anchors.mjs`
against an exported copy of the project's HEAD to compensate.
