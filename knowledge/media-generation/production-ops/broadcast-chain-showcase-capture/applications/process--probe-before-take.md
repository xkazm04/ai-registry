---
layer: application
type: application
subject: broadcast-chain-showcase-capture
technique: probe-before-take
stack: process
status: forged
verified_on: 2026-11-02
---

# The film that was abandoned: what the probe checked and what ruined the takes

Castle Control's showcase was filmed on 2026-11-02 through the chain app, isolated OBS, Twitch
test channel, and abandoned that evening as not presentable. Read on the main checkout,
2026-11-02. This is a `process` application: it records a filming practice and its outcome,
and the evidence is the capture scripts, the run log and the review frames left in `film/`.
The abandonment itself is recorded by the director's wave brief, not by any file in the
tree.

## What the probe looked at: the caption

`film/capture.mjs:133` "probe: drive and screenshot every beat, no recording (the smoke test
for a changing UI)". The only picture it saves is the app's, `film/capture.mjs:150`
`app.screenshot(...)`, with no OBS and no Twitch window in play. It caught real UI drift
(`film/PREP.md:46` lists 7/12 beats passing on the first probe), and it could not see any
of the failures below. **Deviation**: the chain was unprobed.

A stream-picture probe did exist, beside the take rather than in front of it:
`film/lib/director-test.mjs:14` grabs the program scene with `GetSourceScreenshot` for each
director shot into `film/out/review/director-<beat>.png`. Its frames
(`film/out/review/director-grid.png`) show pale cards over the sample art; nothing turned
them into a gate.

## What ruined the takes: the evidence

- **The go-live panel over the platform pane, a whole take.** `film/out/review/twE-grid.png`
  (four frames of take E's Twitch recording) shows OBS's "Stream Information" / "Go Live
  Notification" panel and its main window over the Twitch region in every frame. Going live
  happens inside the take, `film/capture.mjs:185` `ensureStreaming(...)`, after the region
  was laid out.
- **Another window over the capture.** The same frames show a terminal window at the
  region's left edge. The adapter re-pins its own two windows every beat
  (`film/capture.mjs:202-203`, `keepOnTop` and `keepTitleOnTop('CC FILM TWITCH')`, the
  title forced at `film/capture.mjs:90`), which is confirmed practice and still not
  enough: pinning yours does not unpin another application's.
- **Overlays stacked in the centre, pale over black.** `film/out/review/obsC-grid.png` shows
  four frames of an OBS program recording (take C, by the file's name): the duel board, vote bar and beacon drawn on top of one another
  in the middle of a black canvas, as light cards. The director's own header explains why:
  `film/lib/director.mjs:2` each app source is "a full 1080p page with its overlay drawn in
  the middle".
- **The end flash hidden by an app drawer.** The fix, not the incident, is in the tree:
  `film/capture.mjs:227` presses Escape twice before the end flash.
- **A shot applied before its overlay existed.** `film/take/capture-full.log:20`
  "director: lot-giveaway shows lot x1.35 (missing: lot)", then `:22` the same for
  lot-cast, then `:23` "lot plate: added to the rehearsal scene". The plate exists only
  after the seal, so the shot hid the other overlays, found no plate, and the plate then
  arrived with its default placement. Both beats still logged `ok`: the director's errors
  are caught into the log, `film/capture.mjs:204` `.catch((e) => log(\`director: ...\`))`,
  and a missing subject is a log suffix (`film/lib/director.mjs:67`), not a beat error.

## Confirmed: abort safety and reset scripts

`film/capture.mjs:236-238` stop the stream and the recording in a `finally`;
`film/lib/stream-off.mjs:1` "safety after an aborted take"; `film/lib/obs-clear.mjs:1`
removes the app's inputs "so a take's setup beat adds them on camera". These are the
probe's abort-safety and leftovers conditions, as scripts the operator runs by hand.

## Deviation in the director: provenance as a separate source

`film/lib/director.mjs:8` `LABEL = 'Film · SIMULATED label'`, created as a GDI+ text input
at `film/lib/director.mjs:35` "SIMULATED · dress rehearsal · sample stream art" and placed
bottom-left. The overlay craft's provenance rule says provenance lives inside the overlay;
the overlays already draw their own SIMULATED badge (visible in `obsC-grid.png`). A label
the director adds as its own source is the shape that rule warns against. Also a deviation:
`film/lib/director.mjs:4` enlarges each overlay "around the frame's centre", so every shot
reads as a centred card, and `film/lib/director.mjs:17` shows all four overlays in the setup
shot.

## The lesson, as a probe

Each failure above is one frame of the right region, captured with the stream live and each
shot applied, before the take. The 2026-11-02 film is the record of what happens when the
probe looks at the tool and the takes are judged by their logs.
