---
layer: application
type: application
subject: talking-avatar
technique: face-signal-across-surfaces
stack: react
status: forged
verified_on: 2026-10-18
verified_against: react@19
---

# One face signal, produced in the window that plays her voice

Athena's desktop app is a Tauri shell with React webviews: her own `athena`
window owns her voice and its player, and the Main window shows her on several
surfaces. Her face (ADR `docs/adr/0120-athena-has-a-face.md`) landed on `main` at
commits `350419a0..d5bb49cd`, 2026-10-18; every citation is resolved against
`d5bb49cd`, paths relative to the athena-portable repository root.

## One producer, on the player's clock

- `apps/desktop/src/lib/face-signal.ts:4` "The `athena` window owns her voice, so it is the only place that knows what her face does. Each"
- The mouth is read at the playing sample, ahead of it:
  `apps/desktop/src/lib/face-signal.ts:14` "**Viseme** is the segment covering the playback sample (`lib/voice.ts`'s `playbackSample`),"
  and `apps/desktop/src/lib/face-signal.ts:35` "export const VISEME_LEAD_S = 0.035;".
- Started by her window alone: `apps/desktop/src/lib/face-signal.ts:143` "Started by the `athena` window's root beside `startHalo`, and nothing else. Idempotent while".

## The mirror

- The cap, borrowed from the halo's: `apps/desktop/src/lib/face.ts:21` "/** The most frames per second the athena window mirrors (ADR 0027's halo cap). */"
  and `apps/desktop/src/lib/face.ts:22` "export const FACE_MIRROR_HZ = 30;".
- A phase change at once, never twice the same:
  `apps/desktop/src/lib/face-signal.ts:206` "/** Mirror a frame: a phase change at once, otherwise no faster than the cap; never twice the same. */".
- Validated and clamped in the shell, as the halo is, and sent to Main only:
  `apps/desktop/src-tauri/src/face.rs:7` "refused, every number is clamped into its range and a non-number is 0 - and re-emits it as".
- A late subscriber starts from the last signal:
  `apps/desktop/src/lib/face.ts:11` "Every source hands a new subscriber the last signal it has, so a face mounted mid-sentence does".
- Hidden window, timer stand-in: `apps/desktop/src/lib/face-signal.ts:20` "and while the window is hidden the clock pauses, so a 34 ms timer stands in for it there: Main".

## Speaking lasts until the audio has

- `apps/desktop/src/lib/face-signal.ts:11` "ahead of playback, so `voice.stopped` can arrive while the end of her line is still sounding."
  and `apps/desktop/src/lib/face-signal.ts:12` "The face keeps `speaking` until the player has played that line's last sample, because a".
- The rule in code: `apps/desktop/src/lib/face-signal.ts:162` "spoken !== null && deps.sounding(spoken)) return"
  over the player's own answer, `apps/desktop/src/lib/voice.ts:143` "/** Whether her voice is still sounding `generation`'s line: true through the tail after its `voice.stopped`. */".
- The timeline is kept until then: `apps/desktop/src/lib/face-timeline.ts:12` "`done` is marked finished and kept until its last word has played, because synthesis runs ahead".

## No say, not zero

- `apps/desktop/src/lib/face-timeline.ts:221` "// A track that leaves the lids out says nothing about them: `null`, so the face keeps blinking."
- Interpolation keeps it absent: `apps/desktop/src/lib/face-timeline.ts:211` "blink: a.blink === null || b.blink === null ? null : a.blink + (b.blink - a.blink) * k,".
- The shell keeps it across the mirror: `apps/desktop/src-tauri/src/face.rs:32` "/// `null` when the motion model does not drive the eyelids (the avatar blinks on its own)."
- The driver honours it: `apps/desktop/src/avatar/driver.ts:219` "// a track that leaves the lids out (blink null) keeps her own blinks; the last lid it drove".

## Out of the first paint

- The store feeds a sink only the drawing window installs:
  `apps/desktop/src/stores/voice.ts:75` "installs a sink (`lib/face-signal.ts` `startFace`); Main's first paint never loads the timeline,"
  installed at `apps/desktop/src/lib/face-signal.ts:148` "setFaceLineSink(FACE_LINE_SINK);".
  Commit `4ca834d8` measured Main's first paint at 161,449 B before and 160,629 B
  after, gzipped, against the ratchet `apps/desktop/scripts/first-paint.mjs:33` "ceilingBytes: 161_000," (one build, 2026-10-18).
- The renderer is a lazy chunk: `apps/desktop/src/avatar/Avatar.tsx:4` "A box of `size` CSS pixels holding one canvas. Everything that draws is in `./runtime`, imported".

## Still at rest — a trade-off not yet ruled on

- `apps/desktop/src/avatar/driver.ts:20` "**It settles.** At rest (idle or gate, silent, no neural track) it keeps living for a short linger",
  six seconds idle and 2.5 s at the gate (`apps/desktop/src/avatar/driver.ts:139` "const idleLinger = options.idleLinger ?? 6;"),
  after which the runtime unsubscribes from the frame clock:
  `apps/desktop/src/avatar/runtime.ts:79` "if (driver.settled) {".
- Cost recorded by the ADR: `docs/adr/0120-athena-has-a-face.md:97` "At rest a face costs nothing per frame; while she speaks it costs one WebGL2 draw per layer per".
  The other cost — no breath at rest — is not yet ruled on by the operator; the
  perpetual-breathing alternative has not been measured, so its idle frame cost is
  *pending*, not zero.

## Deviations

- The settle is a constant, not a switch; the technique asks for the choice to
  stay switchable until the owner rules.
- The mirror's 30 Hz is the halo's cap reused, not derived from a measured need
  of the mirrored face.
