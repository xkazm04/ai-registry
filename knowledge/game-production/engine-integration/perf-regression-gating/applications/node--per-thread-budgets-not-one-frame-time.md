---
layer: application
type: application
subject: perf-regression-gating
technique: per-thread-budgets-not-one-frame-time
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# Stage thresholds from one budget, an unmeasured stage that becomes a constant, and a graphics ceiling set for a mode with no graphics

Read against a Next.js game-development assistant (`pof`) at master `880bfed9`. The Node
version is witnessed by the type-definition pin, not a runtime pin: the devDependency at
`package.json:57` "@types/node" resolves in the lockfile at
`package-lock.json:3080` "24.13.3"
and the tree declares no `engines` field, version file or CI pin, so `node@24` is the major
its type definitions target and nothing stronger. The capture gate cited below landed on
master the day this was written, from this subject's own spec; where it matches the
standard the match is by construction.

The tree examines the three stages of a frame separately in one place and collapses them in
the rest. This document records both, and the one place where a budget for a stage is
declared in a mode that cannot observe it.

## Three stages, each against a fraction of one budget

The triage engine tests each stage on its own, which is the technique's starting point:
`src/lib/profiling/triage-engine.ts:147` "if (summary.avgGameThreadMs > budget * 0.7) {"
`src/lib/profiling/triage-engine.ts:164` "if (summary.avgRenderThreadMs > budget * 0.7) {"
`src/lib/profiling/triage-engine.ts:181` "if (summary.avgGpuMs > budget * 0.8) {"
A regression in a stage with headroom would be visible here before the frame is late. What
is missing is what the technique puts first: the three share a single `budget`, and the
shares, seventy, seventy and eighty percent, are constants with no stated origin, compared
against a mean (`avg…`) rather than a stated statistic. The finding text reports a consumed
share of the frame budget, but no per-stage budget and no headroom are declared anywhere, so
what share of which interval a stage is allowed is nowhere written. The label for which
stage binds is derived from the same three numbers:
`src/lib/profiling/triage-engine.ts:422` "threads[0].ms > threads[1].ms * 1.3"
which is the technique's "binding stage" claim, made without any stage being allowed to be
absent from it.

## An unobserved stage becomes a constant

The sample type has no way to say a stage was not measured. The numbers are not nullable:
`src/types/performance-profiling.ts:18` "gpuMs: number;"
`src/types/performance-profiling.ts:94` "avgGpuMs: number;"
and the importer fills the gap with defaults. When no stage row exists the frames it builds
carry a fixed game stage, a fixed render stage and a fixed graphics stage:
`src/lib/profiling/csv-parser.ts:205` "* variance || 8;"
`src/lib/profiling/csv-parser.ts:206` "* variance || 6;"
`src/lib/profiling/csv-parser.ts:207` "* variance || 5;"
The same constants appear in the single-sample branch at
`src/lib/profiling/csv-parser.ts:176` "gameThreadMs: totalGame || 8,"
`src/lib/profiling/csv-parser.ts:178` "gpuMs: totalGpu || 5,"
and a sub-stage is derived from the graphics number by a fixed ratio at
`src/lib/profiling/csv-parser.ts:214` "rhiMs: Math.round(gpu * 0.3 * 100) / 100,"
By reading the code path, not by an executed run: an import that carries no row from any of
the three stage groups, including one with only a header line, reaches the second block with
all three totals at zero, so every one of its up-to-three-hundred frames is a game stage of
eight, a render stage of six and a graphics stage of five, with the random spread dropped
because zero times a factor is still falsy. The summary then reports those as averages. No
input produced a measurement and the output is indistinguishable from one. This is the case
the technique's decision rule forbids by name: never a zero, never a default, never a mean
taken from the stages that were seen.

## A budget and its measured twin share one field

The catalogue pipeline for visual effects declares a graphics budget in the sentence form the
authoring subjects settled on. It states the class ceiling and the headroom at
`src/lib/catalog/pipelines/vfx.ts:176` "const classBudgetMs = 0.8;"
and writes the result out so neither number can be read inverted:
`src/lib/catalog/pipelines/vfx.ts:183` "(peak ${gpuPct} ms = ${(1 - headroomPct) * 100}% consumed)"
That half is exactly right. The other half is that the field the chart labels as the peak,
`src/lib/catalog/pipelines/vfx.ts:167` "key: 'gpuMs', label: 'Peak'"
is assigned from the budget itself:
`src/lib/catalog/pipelines/vfx.ts:178` "const gpuPct = classBudgetMs * (1 - headroomPct);"
`src/lib/catalog/pipelines/vfx.ts:184` "gpuMs: gpuPct,"
and the producer says plainly what it is:
`src/lib/catalog/pipelines/vfx.ts:162` "produce() returns author-typed constants"
The data check that grades it compares that field with the same number it was built from:
`src/lib/catalog/pipelines/vfx.ts:231` "withinPercent('gpuBudget.gpuMs',"
so the check passes by construction. A policy and a measurement are one value under one
name, which is the distinction the technique's budget-versus-baseline section exists to keep.

## The runtime check names a mode that cannot observe it

The runtime verification of that budget is specified under the null renderer:
`src/lib/catalog/pipelines/vfx.ts:209` "under -nullrhi at LOD0 peak emit"
and the gate is declared as a deferred runtime check:
`src/lib/catalog/pipelines/vfx.ts:282` "entityRuntimeDeferred('VSVFXPerfTest'"
The tree's own spine describes that mode as one that observes the CPU side only:
`src/types/observation.ts:144` "CPU-only pose/movement metrics"
A mode that does no graphics work has no graphics cost to read, so a graphics ceiling
evaluated there is either not evaluated or evaluated on something else. Elsewhere in the tree
the same gate is recorded as established:
`src/lib/preview/realization-facts.json:1235` "proven"
`src/lib/preview/realization-facts.json:1236` "re-run headless on 5.8 this review"
The test body is not in this tree, so what quantity it reads is not verified here, and this
document does not claim it reads none. The finding is narrower: a graphics-stage budget, a
mode that cannot observe the graphics stage, and a gate marked proven are three statements
that cannot all describe a measured graphics cost, and the output carries no field that would
say which of them gave way. The technique's remedy is a table from stage to the run modes
that can observe it and a result of *not measured* for the rest.

## The newer gate reads one column

The capture gate parses the profiler's per-frame layout and takes the whole-frame column:
`src/lib/profiling/perf-capture.ts:55` "h.toLowerCase() === 'frametime'"
while the fixture it is tested on already carries a per-stage column beside it:
`src/__tests__/lib/profiling/simulated-frames.ts:79` "EVENTS,FrameTime,GameThreadTime"
The gate never reads it, and its result has no field for a stage, so it can say a frame got
slower and cannot say which stage did, which is the one number the technique starts by
refusing. It also records no render mode, so a graphics stage that a null-renderer boot
cannot observe is neither measured nor reported as unmeasured; the omission is silent.

The statistic is a tail, which is right, and a narrow one:
`src/lib/profiling/perf-capture.ts:185` "percentiles: [50, 95]"
with the stated intent at
`src/lib/profiling/perf-capture.ts:150` "p95 is the one that matters; p50 rides along"
At the gate's default window of three hundred frames the ninety-fifth percentile has fifteen
frames beyond it, so a handful of spikes occupies ranks above it and leaves it unchanged, and
the file counts no hitches although the simulated model that tests it generates them
(`src/__tests__/lib/profiling/simulated-frames.ts:20` "Probability a frame carries a hitch.").
The percentile technique's second and third statistics, a hitch count relative to the median
and a count of missed frames against the budget, are absent.

## What a stage-aware gate on this tree would add

Make an unobserved stage representable, and remove every default that stands in for one.
Declare a budget per stage in the headroom sentence, with a statistic, and keep the declared
figure and the observed figure in different fields. Read the per-stage columns the capture
already carries, bind each stage to the run modes that can observe it, and refuse a request
that names a stage the mode cannot see. Put the graphics stage in a lane with a renderer on
a machine that has one, with its own baseline, and let the cheap lane report graphics as not
measured beside the stages it did observe.
