---
subject: live-response-latency-budgeting
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# live-response-latency-budgeting

First note. Forged 2026-10-19 from Shadowrunr OS, the overlord checkout. Both
applications read the Rust brain, so the scan ranked the subject "single
stack (rust)".

## State

6 techniques, 3 applications: rust x2 (overlord @ 4025231) and typescript x1
(overlord @ 222a13a). Depth rung L2 to L3. The new application rests on the
tree's own recorded runs: 10 wall-clock sandbox sessions and 362 simulated
runs, read line by line. `check-currency --volatile` finds only
self-authored durations and costs, and no vendor-set quantity.

## 2026-10-21 - /deepen, single-stack dispatch (Curator)

- **Widen: second stack found and applied.** Overlord's TypeScript console
  had one latency figure, the brain gauge. It read the core engine's
  `first_text_ms` and labelled it "first words". Over the 10 sandbox
  sessions the wait from a viewer's line to the reply on stage is p50 6.1 s
  / p95 11.5 s (n = 741). The gauge shows 2.7 s / 7.4 s. Every session is
  over the project's own 4 s budget top at p95 (9.5-31.0 s). Fixed in
  overlord 222a13a: Session review shows the reply wait, and the gauge
  names its stage. Applied row: code, better (instrument; the latency is
  unchanged). New `typescript` application.
- **Rule added (condition):** `first-word-budget-decomposition` gained
  "before trusting a dashboard's reply latency, find which stage it
  measures; the end-to-end figure comes from the transcript on a wall-clock
  run".
- **Where the wait goes, measured.** The 5 s beat, then the whole core call
  (p50 4.9 s / p95 9.7 s), because the brain airs a reply when the call
  returns. Each call spends 2.1 s at p50 (3.5 s p95) after its first text.
  This confirms the golden path's "the first word, not the whole reply" and
  "attack the scheduling wait first", with numbers. Both are in the Rust
  tree, so they are banked as leads, not fixed here.
- **Synthetic-clock trap, confirmed on real data.** The simulated runs show
  a reply wait of 2.5 s / 4.8 s, better than the engine's own p95, because
  their stream time skips the call. The technique already names this trap.
  The application gives it a figure.
- **Counter-evidence (first-party tree, plus the provider docs page read
  twice 2026-10-21).** The golden path and `latency-class-per-role` said a
  tier that cannot switch reasoning off is not a live voice. The technique
  also said "off or at its minimum", which contradicts that. The project's
  live voice runs at `--effort low`, the CLI's lowest level, which has no
  off, and the page lists most current models with a lowest level and no
  off. Both files now admit a tier on its measured first-text tail at the
  level it runs at. They refuse only a tier whose reasoning cannot be
  lowered. Applied row: unmeasurable (no off arm on the engine).
- **Left standing, not re-sourced:** "human turn-taking gaps average around
  a fifth of a second". The primary journal page returned 403. The claim is
  hedged and not vendor-set, so it stays; return with the paper read
  verbatim.
- No blind training-data lane ran, and no convergence was claimed. No new
  technique was earned.

## Impact

Overlord, 2 stale verdicts: `stage-kit-overlays` and `stage-kit-scene-engine`,
both judged `not-applicable` against revision 1. That is overlord's
`/conform --stale` queue for this subject. The map was regenerated and
committed (overlord e4266cc, pushed).

**Instrument gap, banked again.** The seams this run changed are
`console-brain-page` and Session review, and the map does not join this
subject to either. This is the third matcher miss banked today, after
audience-absorption-at-scale and live-chat-moderation-and-anti-bait. Return:
the next map-matcher pass.

## Open leads

- **Air the first sentence.** Stream the core reply into lines as they
  complete, and size the output gate to the first unit. This takes 2.1 s p50
  off every reply. L, Rust brain. Return: the next beat-loop rework. The
  instrument is Session review's reply wait.
- **Wake on chat.** The 5 s beat is the largest stage the owner controls.
  Return with the same instrument.
- **Sign the rehearsal gate.** The project's rubric has no reply-wait check.
  Only the silence ceiling gates a session. Return: when the sandbox
  judge's checks are next extended.
