---
layer: application
type: application
subject: music-prompt-composition
technique: duration-and-tempo-locking
status: forged
stack: node
verified_on: 2026-08-26
verified_against: node@24
---

# Node — a cue row rendered at exact duration through a server-side music seam

`gravitone-gcloud` (branch `music-engine`, 2026-08-26) wires its Score
phase's spotting cues to a generative music vendor through one chokepoint,
mirroring the shape its imaging router established: the browser sends the
**cue row** — title, intent, bpm, exact duration, the production's standing
style block — and the server owns the translation to the vendor's
section-plan wire format (`lib/music/plan.ts`), so the briefing doctrine
lives in exactly one file and no caller can ask for what the doctrine would
not produce.

## The lock, in code

- **Duration comes from the cue list in whole seconds** and is converted to
  per-section milliseconds (`cueToPlan`, `lib/music/plan.ts`): under 20s is
  one section with one job; longer cues split build → release at roughly
  2:1, with "hard ending on the beat" attached to the release section only —
  the ending shape is briefed where the ending is.
- **The bar math is a function, not a habit**: `barsFit(bpm, seconds)`
  returns whole 4/4 bars or `null`, so a caller picking a tempo for a
  picture hit adjusts the bpm, never the picture. The smoke cue used it:
  96 bpm puts exactly 4 bars in 10 seconds.
- **Vendor windows are asserted before spend** (`lib/music/elevenlabs.ts`):
  section count, per-section 3s–120s, total 3s–10min — a plan that cannot
  be executed is refused before any credit is touched.

## What the live render measured (2026-08-26)

One 10.000s cue, briefed as a plan, rendered in 3.0s wall clock:

- **Delivered duration: 10.032s** — a 32ms overshoot on a 10s brief. The
  duration promise holds to well under a frame at any picture rate; the
  cue can be laid against the timeline without a trim.
- **Delivered format deviated**: 192 kbps arrived where 128 kbps was
  requested. Harmless here, but it is the acceptance doctrine's point made
  by the vendor unprompted — the delivered file's properties are measured
  (this one via `ffprobe`), never read off the request.
- **Refusal is a typed state**, not an error path: the provider maps
  policy declines to a `refused` kind, the route maps it to 422, and the
  Score surface renders it as refused-silence — the cut plays silence and
  says so, which the fixture data had already committed to before the
  engine existed.

## What this realization cannot do yet

It renders takes; it does not revise them — there is no section-edit path,
so a note on one section still costs a full re-render (the seam discipline
is doctrine here, not code). Takes live as object URLs and die with the
tab; persistence into the studio's asset store is the next seam. Spend has
no budget ledger — the access gate and rate limit are the only ceiling,
stated in the route rather than papered over. And acceptance is manual:
the duration measurement above was run by hand, not by a scripted gate.
