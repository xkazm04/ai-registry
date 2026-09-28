---
domain: media-generation
subject: live-system-demo-film
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# live-system-demo-film

Subject note. Part of [[index]]; graded against [[standard]]. Forged 2026-09-16 by
harvest from one portable agent runtime's demo pipeline (7 techniques, 2 node
applications). There was no note before this one.

## Touch log

### 2026-09-27 - `/deepen`, first pass (dispatched on "single stack (node)")

**Why it ran.** The single-stack clause, plus a computed event behind it:
`check-currency` flagged both applications as stack drift (`node@22` against a fleet
on 24). The subject had never met counter-evidence (dry streak 0, never saturated).

**Lanes.** Counter-evidence (web, with vendor claims re-read from the installed
package instead of doc pages), a blind training-data-only lane, a re-read of the
source tree, and a new tree (a public Go terminal recorder, shallow-cloned and read,
not built: no Go toolchain on the box).

**Widened.** `go--recording-that-asserts-its-claims` is the first non-node
application. The tree's `Wait` matches the terminal emulator's *rendered* grid, not
the process output. That converges with "assert on what the audience sees" from an
unrelated project, and the blind lane named the same practice. The tree is also the
counter-case for the failure policy: a timed-out `Wait` aborts, and no film renders.

**Corrected (2 lanes plus a measurement converged):**
- `audio-first-beat-pacing`, the "measured clip" clause: a probe returns a
  bitrate estimate for an MP3 without its frame-count header, and says so only at
  warning level.
  - Known-ground-truth fixtures (3.000 s, n=4): CBR estimates match; VBR without
    the header probed 2.942 s against 3.02 s decoded.
  - A new decision rule: read the probe's diagnostics or decode, and treat an
    estimate as unmeasured.
  - The source tree probes at `-v error`, so it cannot see the difference. That
    deviation is recorded on the application.
- `audio-first-beat-pacing`: "conventional guidance puts pause-heavy delivery ten
  to fifteen percent above" had no measured source (calculator pages only, and
  they disagree). It is now labelled folklore.
  - The wpm band is re-sourced to the speech-rate literature: average 125-160 wpm,
    radio 160. The PDF text was read directly.
  - That method deducts silences over 3 s, which is exactly what a pause-marked
    script adds back.
- `recording-that-asserts-its-claims`, the carry-on decision rule: it now states
  its economic condition. A take that costs seconds and spends nothing before
  capture may fail fast.
- `recording-that-asserts-its-claims`: the capture's own dropped frames join the
  stated-uncertainty bullet. On a fixed-rate frame sequence, a dropped frame
  shortens the film, so the picture clock stops being the script's.

**Re-verified, untouched:** both node applications at the source tree's HEAD
`c48c9b0`.
- No commit since `c5ec8cae` touches the demo paths, and spot-checked anchors hold.
- The example's `tsc --noEmit` is clean under node 24.14, with a positive control
  that both cited files were compiled. `verified_against` moves to `node@24`, which
  clears the drift.
- The recorder application gained a dated Playwright 1.63.0 capture section and
  `refresh_by: 2026-12-28`.
  - The size is set, so the 800x800 default downscale is avoided.
  - The VP8 bitrate is fixed at 1M.
  - Frames are timed from page creation.
  - `page.screencast` exposes a per-frame timestamp and a quality setting.
  - The tree needs no `expect.soft`: soft assertions cover assertion failures,
    not driving failures, and the tree's per-beat catch covers both.

**Confirmed and left as written:**
- The film as a build regenerated in CI: the Go tree's README says so, and the
  blind lane rated it high.
- Captions derived from the same beats: WCAG 2.2 SC 1.2.2 (Level A) requires
  captions, and the technique already derives them.
- Seeded stage with disclosure: the blind lane converges, and nothing refutes it.

**Declined** (why):
- Request stitching across per-beat clips (the vendor's `previous_text` and
  request ids) belongs to [[creator-voice-and-tone]]. This subject treats the
  clip as opaque and owns only its length, so it is a proposal there, not a
  landing here.
- Playwright's unreleased main-branch fps/bitrate change: lane-reported and not
  in any installed release. The application's clock covers it.
- A new "late picture" technique (the picture reaching its asserted state after
  the line ended): one lane plus my own synthesis, not convergence. Banked below.

**Impact.** Both joins are `state: unknown` (never judged), so no verdict went
stale:
- `systedo-case`: 7 joins, lexical-only (in-product demo pages).
- `gravitone`: 2 joins (the trailer-script context).

The fleet map was **not** regenerated here, for two reasons:
- Both joined projects carried a sibling session's uncommitted
  `.ai/registry-map.json` rebuild, written at 22:11 local on 2026-09-27, which a
  rebuild would have overwritten.
- A scratch build (`--out`) showed the join set unchanged at 2 + 7 and 0
  elsewhere. Only the digest moves.

The next map build carries it. No `applied.md` row is owed: there is no new
technique, and no golden-path rule flipped.

**Open leads (banked, with return conditions):**
- **The probe fix in the source tree.** Two lines: `-v warning`, plus treating
  the estimating message as unmeasured. The tree sits outside the registered
  fleet and has a sibling's uncommitted work in it. Return when it is registered,
  or when a take exists on disk to check whether the vendor's default MP3 carries
  the frame-count header (nothing was on disk on 2026-09-27).
- **Late-picture detection.** Record per beat the instant the asserted state
  appeared, relative to the clip's end. The pacing formula cannot see a picture
  that arrives after its line; pre-roll prevents it but nothing detects it.
  Return when a second source or a take record shows it happening.
- **Request stitching** as a condition on per-beat synthesis continuity (lane
  report: unavailable on the vendor's newest model). This is for the voice
  subject's next pass, and needs a blind A/B listen to earn anything.
- **Single tree per stack.** Each stack has one tree, and no fleet project runs a
  captured demo film; the joins are lexical. Return when a registered project
  grows a scripted capture.

**Saturation.**
- Depth rung: L2 primary for the vendor claims, L3 for the probe fixtures (n=4).
- Last-pass yield: 1 application, 4 corrections, 2 re-verifications.
- Clocks: node applications on the node window; recorder application
  `refresh_by: 2026-12-28`.
- Demand: lexical joins only.
- Dry streak: 0.

Points 5 -> 3; "never swept by the librarian" remains.
