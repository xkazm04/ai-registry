---
layer: application
type: application
subject: perf-regression-gating
technique: host-independent-work-counts
stack: process
status: forged
verified_on: 2026-10-07
---

# An optimisation wave for a Fire TV stick, run with no stick in the room

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The stack is `process`: what is realized is the labelling discipline a four-context
optimisation wave (2026-10-06, render, simulation, link and build) used to report its figures when the
device it optimised for — a Fire TV stick, model AFTKM — was not reachable, and the stand-in instruments
it built so that the link could be counted without the stick or a phone.

## The label, written into every method line

Each render finding carries the same sentence in its method:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:1 "counters are host-independent, desktop CPU ms are not Stick figures"`.
That is the technique in one line, and the wave kept to it: draws, binds, sprites, indices, glyph quads
and allocated bytes are reported as the desktop measured them, and desktop milliseconds appear only as
desktop milliseconds. The finding that would have taken the device cost was left open with its gap named,
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:7 "unmeasured (no Stick access in this round)"`.

The wave's ledger then marks itself. The render row is flagged degraded, with the note
`.claude/scan-history/scan-sweep.jsonl:31 "desktop counters only"`, and the link row records
`.claude/scan-history/scan-sweep.jsonl:33 "no physical phone"`. A wave closed on host evidence says
so where the next reader of the ledger will see it.

## A stand-in that runs the real code

The link context could not run the desktop game build at the time and had no phone, so it built a
stand-in: `deathride/link/src/test/kotlin/dev/deathride/link/FakeHost.kt:7 "the real RaceServer and the real controller page"`,
with a 60 Hz loop playing the render thread's part and a real-sized fixture. A browser bench drives the
page against it and reports counts per phase — layouts, style recalculations, document mutations, frames
and bytes sent —
`deathride/tools/controller-bench.mjs:36 "layoutsPerS:dc('LayoutCount')"`, alongside main-thread
milliseconds in a desktop browser throttled to imitate a mid-range phone. The finding states what that
buys: `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-L.jsonl:9 "Future link work can be measured without a Stick or the desktop build."`
Its counts (an idle lobby going from 31 layouts and 91 mutations per second to none) transfer to a
handset as counts; its milliseconds are a throttled desktop browser's.

## Where a count did not transfer, and where the host could not see

- **Scheduling.** The link threads were moved below the render thread's priority, and the finding says
  why the host cannot judge it:
  `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-L.jsonl:10 "desktop cannot show it: Windows priority mapping differs"`.
- **Allocation.** Bytes allocated per frame are counts that depend on the runtime's compiler; the project
  had already seen a desktop allocation test pass because of escape analysis (the allocation-gate
  application in this subject).
- **Counts across builds.** The desktop counted 26.5 draws per frame before the batching change on the
  wave's build; the stick's P5 arm on 2026-10-03 counted 16.5 on an earlier build with different art. Both
  are true counts of different requests, and the wave did not set them side by side.

## Deviations

- **A device figure that does not name its device.** The post-wave probe committed with the ledger
  records `deathride/evidence/probe.json:2 "Unspecified host; record device before interpreting"`; the
  finding that cites its 18.3 ms since-start p95 and 1,145 ms maximum attributes it to the stick, but the
  file cannot. Under this technique the figure is a stick figure only by testimony.
- **No device run closed the wave.** The render chain, the priority change and the link changes all carry
  their device effect as unmeasured; the ledger's `degraded` flags are the honest record of that, not a
  resolution of it.
