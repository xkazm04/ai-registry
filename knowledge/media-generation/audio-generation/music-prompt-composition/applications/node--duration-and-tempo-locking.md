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
  duration promise holds to under a frame at 24–30 fps (about two frames
  at 60); at the common picture rates the cue can be laid against the
  timeline without a trim.
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

## Re-checked 2026-10-31

Re-checked 2026-10-31 at gravitone-gcloud@3c66e32e. Everything above holds
at the commit it describes (`e427bd10`, 2026-08-26, now on the main line):
`cueToPlan` split cues of 20s and over build → release at 2:1 with the hard
ending on the release only, `barsFit` returned whole 4/4 bars or `null`, and
the vendor windows were asserted before spend. The 10.000s → 10.032s render
and the 3.0s wall clock match that commit's own record; the 192 kbps
deviation was not re-measured. At HEAD the tree has moved on in four places:

- **The 2:1 split is gone** (2026-08-29). `cueToPlan` in `lib/music/plan.ts`
  now takes the scenes the cue plays under and writes one section per scene,
  merging scenes under the 3s floor forward and splitting a pack over 120s
  evenly. The hard ending goes on the last section only when `barsFit` says
  the span is a whole number of bars; otherwise the brief says outright that
  the span is not whole bars and asks for "arrival". Duration is now derived
  from the summed scene lengths (`cueDurationS`), not typed in. The lock got
  stricter. The "under 20s is one section" rule no longer exists.
- **The vendor windows still hold** (`lib/music/elevenlabs.ts`: 1..30
  sections, 3s..120s per section, 3s..10min in total, all refused as
  `bad-request` before any call), and `refused` still maps to 422 through
  `statusFor` in `lib/music/errors.ts`.
- **The seam moved.** `app/api/music/generate/route.ts` and the Score phase's
  `ScoreSpotting.tsx` were retired at the Phase 6 cutover (2026-10-18). A cue
  now renders through the score producer (`lib/producers/score.ts`) into
  `generateTake` op `"cue"` (`lib/sound/generate.ts`), which still calls
  `cueToPlan` on the server. The doctrine stays in one file. The browser
  still never sends a plan.
- **Three of the four gaps above are closed.** Section edits exist (op
  `"section-edit"`). Takes are filed in the sound store under their
  `{projectId, cueId}`, so they no longer die with the tab. Spend runs under a
  music budget ledger (`lib/music/budget.ts`, which refuses with
  `over-budget`/402 before the vendor is asked). Scripted acceptance of
  delivered duration was not checked here.
