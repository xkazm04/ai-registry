# takeover-app lessons

## 1.0.0 - 2026-10-18 - personas-web (cold-clone dry run)

- A cold map written from routes and directories reached 100% file coverage (56 contexts), while the curated map had 80%. P2's self-written map is good enough for a first scan.
- The takeover lenses produced 14 of 40 proposals, every one anchored to file:line. Both tier 0 findings came from them; the built-in development and design lenses produced only tier 3 items.
- lens-add refused 3 of 4 bp manifests because their glyphs used relative path commands, which bp's validator accepts. The run worked around it instead of stopping, so P4 now stops on any refusal other than a duplicate id.
- lens-scan execute found no gates because it reads its own overlay, not takeover-app's. The run copied them over by hand, and P4 step 5 now does it.
- Each of the four per-lens packs passed its gates, but the combined head failed 3 tests: each pack's mocks lacked the exports added by another pack. P8 now gates the integration head before the batch gate.
- The real default branch moved twice during the run, so landing was a rebase onto its current head plus a re-gate.
- A viewport-only after shot missed a change below the fold, the cookie banner covered every shot, and harness.py seeded the theme as a bare name where the app reads zustand JSON. P9 steps 2 and 4 now cover all three.
