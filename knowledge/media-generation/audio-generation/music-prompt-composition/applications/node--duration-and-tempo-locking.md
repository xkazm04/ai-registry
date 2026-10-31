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

*Pinned at gravitone-gcloud `e427bd10` (2026-08-26, branch `music-engine`,
now on the main line). Everything until the last section describes that
commit; the tree has since moved on, and the last section says how.*

At `e427bd10` the studio wired its Score phase's spotting cues to a
generative music vendor through one chokepoint, mirroring the shape its
imaging router established: the browser sent the **cue row** — title,
intent, bpm, exact duration, the production's standing style block — to
`app/api/music/generate/route.ts`, and the server owned the translation to
the vendor's section-plan wire format (`lib/music/plan.ts`), so the briefing
doctrine lived in exactly one file and no caller could ask for what the
doctrine would not produce.

## The lock, in code

- **Duration came from the cue list in whole seconds** and was converted to
  per-section milliseconds (`cueToPlan`, `lib/music/plan.ts`): under 20s was
  one section with one job (`MIN_TWO_SECTION_S`); longer cues split
  build → release at roughly 2:1, with "hard ending on the beat" attached to
  the release section only — the ending shape briefed where the ending is.
- **The bar math is a function, not a habit**: `barsFit(bpm, seconds)`
  returns whole 4/4 bars or `null`, so a caller picking a tempo for a
  picture hit adjusts the bpm, never the picture — 96 bpm, for instance,
  puts exactly 4 bars in 10 seconds. At this pin `barsFit` had no caller in
  the tree; it was a helper offered to whoever chose the tempo.
- **Vendor windows are asserted before spend** (`lib/music/elevenlabs.ts`):
  1..30 sections, per-section 3s–120s, total 3s–10min — a plan that cannot
  be executed is refused as `bad-request` before any credit is touched.

## What the live render measured (2026-08-26)

One 10.000s cue, briefed as a plan, rendered in 3.0s wall clock (both
figures recorded in the `e427bd10` commit message):

- **Delivered duration: 10.032s** — a 32ms overshoot on a 10s brief. The
  duration promise holds to under a frame at 24–30 fps (about two frames
  at 60); at the common picture rates the cue can be laid against the
  timeline without a trim.
- **Delivered format deviated**: 192 kbps arrived where 128 kbps was
  requested. Harmless here, but it is the acceptance doctrine's point made
  by the vendor unprompted — the delivered file's properties are measured
  (this one via `ffprobe`), never read off the request. This reading was
  taken in the forging session and is not recorded in the tree.
- **Refusal is a typed state**, not an error path: the provider maps
  policy declines to a `refused` kind, `statusFor` maps it to 422
  (`lib/music/errors.ts`), and the Score surface (`ScoreSpotting.tsx`)
  rendered it as refused-silence — the cut plays silence and says so, which
  the fixture data had already committed to before the engine existed.

## What this realization could not do at the pin

It rendered takes; it did not revise them — there was no section-edit
path, so a note on one section still cost a full re-render (the seam
discipline was doctrine, not code). Takes lived as object URLs
(`lib/musicClient.ts`) and died with the tab; persistence into the studio's
asset store was the next seam. Spend had no budget ledger — the access gate
and rate limit were the only ceiling, stated in the route rather than
papered over. And acceptance was manual: the duration measurement above was
run by hand, not by a scripted gate. The commit message lists the first
three as "Not yet".

## Since 2026-08-26

Re-checked 2026-10-31 at gravitone-gcloud@3c66e32e.

- **The 2:1 split is gone** (`d5c10093`, 2026-08-29). `cueToPlan` now takes
  the scenes the cue plays under and writes one section per scene, merging
  scenes under the 3s floor forward and splitting a pack over 120s evenly
  (`packScenes`). Duration is derived from the summed scene lengths
  (`cueDurationS`), not typed in, and a cue with no picture is refused, not
  defaulted. `barsFit` got its first caller: the hard ending goes on the
  last section only when the span is a whole number of bars; otherwise the
  brief asks for "arrival" and says outright that the span is not whole
  bars. The lock got stricter, and the "under 20s is one section" rule no
  longer exists.
- **The vendor windows still hold** (`lib/music/elevenlabs.ts`, same
  ranges, same `bad-request`), and `refused` still maps to 422 through
  `statusFor`.
- **The seam moved.** `ScoreSpotting.tsx` was deleted with v1's studio on
  2026-10-16 (`6d24d9b8`) and `app/api/music/generate/route.ts` at the
  Phase 6 cutover on 2026-10-18 (`ed151a11`). A cue now renders through the
  score producer (`lib/producers/score.ts`) into `generateTake` op `"cue"`
  (`lib/sound/generate.ts`), which still calls `cueToPlan` on the server.
  The doctrine stays in one file, and the browser still never sends a plan.
- **Three of the four gaps are closed.** Spend runs under a music budget
  ledger (`lib/music/budget.ts`, `2b516166`, 2026-08-29), which refuses with
  `over-budget`/402 before the vendor is asked. Takes are filed in the sound
  store under their `{projectId, cueId}` (`e2e907bb`, 2026-10-05), so they no
  longer die with the tab. Section edits exist (op `"section-edit"`).
  Scripted acceptance of delivered duration was not checked here.
