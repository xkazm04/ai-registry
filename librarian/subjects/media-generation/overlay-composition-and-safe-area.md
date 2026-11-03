---
subject: overlay-composition-and-safe-area
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# overlay-composition-and-safe-area

First note. The subject was harvested on 2026-11-02 (326b3b04e) from one Castle Control
tree. A Curator dispatch ranked it on "single stack (typescript)".

## State

6 techniques, 3 applications: 2 `typescript` (Castle Control 8ef2d8e) and 1 `react`
(overlord 41536936a). The stack finding is answered from a fleet project the map already
joined (overlord `stage-kit-overlays`, `stage-kit-scene-engine`).

## 2026-11-03 - deepen (ocsa-deepen-1103)

Landed in 9899bafdd (catalog 010825de6). Lanes:
- Counter-evidence (web): EBU R 95 v1.1 and ITU-R BT.1848-1 read from the PDFs; libobs
  `obs-scene.c`, obs-browser and the obs-websocket generated protocol read verbatim; Meta,
  Google and TikTok vertical safe-zone guidance.
- Training-data only, blind: converged on the standards figures and on "no transform at
  create". It gave the platform bands as ranges and marked them volatile itself.
- Field: overlord's stage at origin/main 41536936a (layouts, region test, clip mode,
  upload targets).

- **Refuted: "the outer five per cent on each side as action-safe".** That is the SD
  practice (RP 13 90%, RP 8 80%). The current HD and UHD figures are 3.5% action and 5%
  graphics. Rewritten with the reason that matters for streaming: no overscan, so the
  player's bands set the safe area. On vertical players those bands are the platforms'
  roughly one third at the bottom, kept out of upper layers as volatile.
- **Corrected: default placement.** "Origin or its centre" became the origin, top-left,
  native size and no bounds (libobs `obs_scene_add_internal`).
- **Corrected: the viewport.** The browser viewport is the source's width and height
  settings. A scene scale resamples the rendered texture, so it blurs and sidesteps the
  envelope cap (obs-browser `GetViewRect`).
- **Conditions added.** placement: create disabled, place, enable, where the create call
  carries no transform (CreateInput takes only settings and an enabled flag), plus the
  "tool owns the whole picture" case. provenance-badge: check the badge against the
  vertical player's bands. verify-the-rendered-scene: the safe area belongs to the canvas
  and the player.
- **New application** `react--placement-declared-at-provisioning--overlord`. It records
  the realization (layout table plus a region test over every layout and flag
  combination) and the deviation: the test's floor is the canvas edge, and the clip
  footer holding the AI disclosure sits at y 1812-1868 of 1920, under the bottom band of
  the Shorts and TikTok players it uploads to. All 12 anchors held (check-anchors against
  a git-archive export).
- **Applied, simulation, better.** Three real regions under A (inside the canvas) and
  B (clear of the player bands): A passes all three, B flags all three. Falsifier: a
  capture of an uploaded clip in the platform player with its overlay UI showing. The fix
  is a clip design change, left to the owner. Committed in overlord deef332, local only:
  overlord main also carries sibling commits ahead of origin.
- **Verified untouched.** The envelope-fit formula, one owner of position (the compounding
  is supported by `update_item_transform` building the draw transform from source width,
  then scale, then position; inference, no document states it), and WCAG 1.4.3 contrast
  over images. The scrim guidance is stricter than WCAG, which asks only for contrast
  against the image behind the text, so it stands as design advice, not a standard.

## Impact

No stale verdicts: overlord's 2 pairs and gravitone's 1 are `unknown` (never judged).
gravitone `ui-status-provenance` joins on "provenance / status / badge" and is not a stream
overlay.

## Banked

- An organic (non-ad) vertical-player safe zone from any platform's own page. None was
  found. Return when a platform publishes one, or when a capture of an uploaded clip
  exists to measure.
- SMPTE RP 27.3's own values (paywalled). Return only if an application needs the SD
  figure.
