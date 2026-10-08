---
layer: application
type: application
subject: perf-regression-gating
technique: equivalence-before-the-saving
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# A simulation step from 77 to 16.5 microseconds, bit-identical, and four ideas that lost

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The simulation core is plain Kotlin 2.0.21 with a fixed step. The wave is the S
(simulation and startup) context of the 2026-10-06 optimize sweep, findings in
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl`, with related equivalence work
from the link (L1) and render (R13, R16) contexts. Every time below is a **desktop** figure — JDK 22, the
`SimBench` scenario of seven playable courses with six classed AI cars at Pro skill and combat on, 6,000
steps, best of five rounds in-process, median of three to five fresh JVMs — and says nothing about the
Fire TV stick, whose step cost was not measured in this wave.

## The references the changes did not write

Two golden references gate every numerically touching change. `CollisionGolden` holds five
contact-heavy replays with their hashes and contact counts and asserts them:
`deathride/core/src/test/kotlin/dev/deathride/core/CollisionGolden.kt:29 "every later change must reproduce them"`,
recorded on the parent of the first optimisation. Its contact counts are part of the expected value, so a
replay that stopped producing contacts would fail rather than pass. The same comment records the one
legitimate re-recording: `deathride/core/src/test/kotlin/dev/deathride/core/CollisionGolden.kt:29 "Hashes re-recorded 2026-10-06 for the Rivet burst/heat model"`
— a gameplay change, re-baselined deliberately with its reason, which is the technique's rule for a
behaviour change.

Where a change replaced a search, the old search became the oracle:
`deathride/core/src/test/kotlin/dev/deathride/core/ProjectionBinsTest.kt:7 "must equal an exhaustive nearest-segment scan, bit for bit"`,
with a floor on what it examined, `checked>=4000`. The CSV parser kept its predecessor:
`deathride/core/src/test/kotlin/dev/deathride/core/ContentParseTest.kt:8 "The pre-optimisation parser, kept as the oracle."`,
run over every table the game ships and asserting more than 150 of them. The phone-packet fast path is
held to the JSON tree parser by a differential test of
`deathride/link/src/test/kotlin/dev/deathride/link/InputPacketTest.kt:26 "repeat(20000)"` random packets
and `deathride/link/src/test/kotlin/dev/deathride/link/InputPacketTest.kt:45 "repeat(50000)"` byte
mutations of real ones. The ring tables assert raw bits,
`deathride/game/src/test/kotlin/dev/deathride/game/UnitRingTest.kt:15 "toRawBits"`.

## Identical by construction, then tested anyway

The four step changes that landed are the technique's first category. The heading trig is cached on the
input's bits,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:188 "recomputed only when the heading bits change"`;
a pure projection is replayed on bit-equal inputs,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:500 "replayed when every input is bit-equal"`;
drift parameters are read through indices resolved once into the same storage the name lookup used
(`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:11 "DriftParameters.indices.getValue"`);
and the projection bins prune coarse-to-fine without being able to discard the true nearest segment.

| change | commit | step, µs (desktop) | gate |
|---|---|---|---|
| coarse-to-fine bins | `84e8b125` | 76–79 → 46.9 | bins oracle, both goldens |
| heading trig cache | `0505a43a` | 46 → 28.8 | both goldens |
| projection replay | `938ce0ac` | 28.8 → 23.2 | both goldens |
| drift by index | `2f95db1d` | 23.2 → 17.1 | both goldens |
| combat rules as fields | `04ec0995` | 17.1 → 16.55 | both goldens |

The bins change also reported its memory: about 0.7 million ints per baked course against 0.3 million,
and a bake of 8–14 ms against 40–110 ms, which is the trade the technique asks to see beside the time.

## The alternatives that lost

Each was built, held to the same goldens, measured against the same benchmark, reverted, and kept as a
finding with its figure:

- `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:9 "45.4 us/step (noise +-2)"`
  — `Math.floor` in the trig routine, against 46.9: inside the noise.
- `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:10 "none once cos is cached"`
  — a bounding reject before the collision pairs, 28.8 against 28.8 (26.8–29.9). Its value depended on a
  cost an earlier change had already removed, which is why the technique measures candidates in landing
  order.
- `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:11 "Interleaving lowers project cost"`
  — one cache line per candidate segment, 17.1 against 17.2: the population is too small for the layout
  to matter.
- `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:12 "total unchanged"` — a lazy
  catalogue and precompiled region patterns; the 14 ms moved to the first world instead of disappearing.

One candidate was refused as an optimisation altogether:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:15 "needs a behaviour decision and a replay baseline, not a bit-identical edit"`
— fewer road samples change which cars see each other, so it is a behaviour change.

## Deviations

- **One kept change sits inside the noise.** Combat rules as fields moved the step 17.1 → 16.55 µs, a
  difference smaller than the ±2 µs the same wave named as noise for this benchmark; the finding kept it
  as "better, small" because the spread narrowed (15.7–20 to 16.5–17.4). Under this technique it is a
  not-better that was kept. It is equivalent and harmless, so the cost is only the precedent.
- **One golden is printed, not asserted.** `SimBench` writes its golden line for a person to compare,
  `deathride/core/src/test/kotlin/dev/deathride/core/SimBench.kt:6 "The printed golden line must be identical before and after any numerically-touching change."`;
  only `CollisionGolden` fails a build.
- **The bins oracle does not cover junctions.** The deferred early-exit finding (S13) notes the oracle
  needs extending to junction and branch courses before a riskier search can rely on it.
- **Two equivalence checks were deleted after one run.** The text-layout re-check (0 mismatches over
  92,293 quads, `a7b22eb9`) and the byte-identity check of the split telemetry JSON (`63f2d090`) survive
  only as commit text, not as switchable checks.
- **The noise is stated, not stored.** "±2 µs" is the finding's judgment from repeated runs; the spread
  is not recorded as a reference the next wave can compare against.
