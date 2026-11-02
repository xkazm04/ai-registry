---
layer: application
type: application
subject: broadcast-chain-showcase-capture
technique: shared-marker-per-recording
stack: node
status: forged
verified_on: 2026-11-02
verified_against: node@24
---

# Three recordings, one magenta flash, and a latency that came out negative

Castle Control, a desktop tool for Twitch streamers (Tauri shell, Rust core), filmed its
2026 showcase with a Node capture adapter in `film/`. Read on the main checkout,
2026-11-02; `package.json:8` declares `"node": ">=24.14.0"`. The adapter drives the app in
Dress rehearsal over CDP and records three pictures: the app window (ffmpeg `ddagrab`), the
OBS program output (OBS `StartRecord`), and a Chromium window on the Twitch player
(`ddagrab`). The film was abandoned the same evening; this application reads the clock
machinery as it stood and the take records it left behind.

## Confirmed: the marker travels the chain

- One event, two paths. `film/capture.mjs:7` "a magenta flash at the start and at the end,
  drawn in the app AND as an OBS colour source", and `film/capture.mjs:196` fires both in
  one `Promise.all([drawFlash(app, 450), flash.on()])`. The Twitch recording therefore sees
  the OBS flash after delivery, which is the technique's shared marker.
- Lifted to the top on every firing. `film/lib/obs.mjs:75` "sources the app added after
  setup sit above the flash: lift it to the top first", then `SetSceneItemIndex` to the top
  at `film/lib/obs.mjs:77`.
- Two flashes or fail. `film/lib/desktop.mjs:92` "found ${s.length} calibration flash(es),
  need 2"; the startup grab is explicitly not the clock, `film/lib/desktop.mjs:38` "The
  calibration flashes, not this, fix the clock."
- Declared one-flash fallback for the app file only. `film/capture.mjs:256` sets
  `bMs: aMs + (flashB - flashA)` and `film/capture.mjs:257` logs "only one app flash; app
  clock assumes no drift". The OBS and Twitch files have no fallback and abort the
  alignment through `flashPair`.

## Upward lesson: clear the top layer before the end marker

The in-app flash is a fixed `div` at the highest z-index, `film/capture.mjs:64`
"z-index:2147483647". A drawer open in the app at the end of the take still hid it,
because platform top-layer surfaces paint above any z-index. The fix is in the take:
`film/capture.mjs:227` presses `Escape` twice and `film/capture.mjs:228` navigates to
`#/keep` before `flashB = await doFlash()`. The technique's step "clear every layer the
marker cannot beat" comes from this.

## Deviation: the latency is computed across two files and against the wrong one

`film/capture.mjs:275` records `latencyMs: T.aMs - A.aMs`: the flash's position in the
Twitch file minus its position in the **app** file. Two separately started screen grabs
(`film/capture.mjs:192-193`, then `StartRecord` at `:194`) never start together, so the
figure is the delay plus an unknown start gap. It is also measured against the app
recording instead of the OBS recording, which is the chain's real upstream. The take
records show it: `film/take/take-A/take.json:37` "latencyMs": 900, take-B 1200, take-C 1900,
and `film/take/take-E/take.json:37` "latencyMs": -1266. The run log says the same,
`film/take/capture-full.log:38` "stream latency ~-1266 ms removed". The 0.9-1.9 s figures are
therefore not a clean measurement of Twitch's low-latency delay, and nothing in the adapter
rejects a figure at or below zero.

The take-E figure has a second cause. The review frames of that take's Twitch recording,
`film/out/review/twE-grid.png`, show the OBS main window, with its "Stream Information"
go-live panel and its preview pane, covering the Twitch region. The flash patch is sampled
at the player rectangle's centre (`film/capture.mjs:274`), where the OBS preview shows the
flash at once; the recording "found" both flashes and passed alignment while recording the
wrong window. That is the technique's "a marker found is not the right window found".

## Deviation: a declaration that is not there, and a wait sized by guess

`film/capture.mjs:9` says aligning on the Twitch flash "removes the latency (declared in
film/README.md)". The README's recording section still reads `film/README.md:77`
"**Recording, two streams:**" and never mentions Twitch latency, so the film hid the delay
without the disclosure the code promised. The end-of-take wait is a fixed
`latencyMs: 15_000` (`film/capture.mjs:34`, logged at `film/take/capture-full.log:35`
"waiting 15000 ms"), sized to the prep note's prior, `film/PREP.md:22` "Twitch shows it
3-10 s late", rather than to a measured delay of about two seconds.
