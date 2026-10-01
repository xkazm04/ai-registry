---
layer: application
type: application
subject: perf-regression-gating
technique: baseline-bound-to-build-and-machine
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# One basis field checked, and a stateless gate with no basis at all

Read against a Next.js game-development assistant (`pof`) at master `880bfed9`. The Node
version is witnessed by the type-definition pin, not a runtime pin: the devDependency at
`package.json:57` "@types/node" resolves in the lockfile at
`package-lock.json:3080` "24.13.3"
and the tree declares no `engines` field, version file or CI pin, so `node@24` is the major
its type definitions target and nothing stronger. The capture gate cited below landed on
master on the day this was written, from this subject's own spec; it realizes the standard
by construction and is not independent evidence for it.

Both mechanisms for comparing frame cost in this tree are interactive aids that a pipeline
could grow into a gate. The finding is therefore not that they are defective as aids; it is
what a gate on top of them would have to add, read against the technique's list of what a
baseline contains: the build, its configuration, the scenario and window, the run mode, the
instrument, the hardware class and the sample itself.

## The one basis field that is checked, and refused across

`compareSessions` computes a single comparability test:
`src/lib/profiling/session-compare.ts:152` "const sameBudget = base.frameBudgetMs === head.frameBudgetMs;"
When the budgets differ the verdict is not a delta with a note but a refusal that names both
sides, built at
`src/lib/profiling/session-compare.ts:155` "Frame budgets differ (base"
and surfaced as an overall state of its own at
`src/lib/profiling/session-compare.ts:162` "!sameBudget ? 'not-comparable'"
The test that pins it is
`src/__tests__/lib/profiling/session-compare.test.ts:56` "different frame budgets -> not comparable"
and it asserts that the reason contains both budgets. That is the technique's rule for a
differing basis, applied to one field: report *not comparable* and name what differed, and
leave the budget-relative rows without a verdict instead of computing a number and
annotating it.

## Where the basis is a constant, the check cannot fire

The budget the check reads is not recorded from how the capture was taken. For every
imported capture it is a literal:
`src/lib/profiling/csv-parser.ts:310` "const budgetMs = 16.67;"
and the type documents the default as such:
`src/types/performance-profiling.ts:108` "Frame budget target in ms (default 16.67 for 60fps)"
So for two imports the equality in the comparison is true by construction. It can differ
only for a session built from the generator, which takes a rate as an input:
`src/lib/profiling/sample-generator.ts:94` "const budgetMs = 1000 / targetFPS;"
The one basis field the tree checks is therefore a target someone typed and not a property
of the run, and a capture taken at a different cap, step or display mode would compare as
equal.

## The session record carries no basis

A `ProfilingSession` holds an id, a name, a source kind, a project path, an import time, a
duration, a frame count, the summary and the series. Its only provenance field is
`src/types/performance-profiling.ts:62` "Project path that produced this data"
There is no field for the build, its configuration, the scenario or window, the render mode,
the attached instrument or the machine, and the comparison reads none of the fields that do
exist. A session generated from a template, which declares itself with
`src/lib/profiling/sample-generator.ts:190` "source: 'manual',"
under a header that promises data
`src/lib/profiling/sample-generator.ts:11` "without needing a real trace"
goes into the same store as a measured import, and the route lets the caller pair any two
ids:
`src/app/api/performance-profiling/route.ts:102` "const { baseId, headId } = body;"
So a generated session and a measured one are comparable, and the result names neither's
origin. Under the technique that is an unattributed comparison, nearer to unmeasured than
to a pass.

## The store is a process, and there is no promotion

Sessions live where the server process lives:
`src/app/api/performance-profiling/route.ts:10` "In-memory store for sessions"
so a baseline here is whichever session the caller names as base, and it ends with the
process. There is no promotion step, no approver, no fingerprint and no way for a gate job
to be denied write access to a reference, because there is no durable reference to protect.
For an interactive aid this is the right shape. For a gate it is the starting point the
technique's promotion rule would be built on.

## An empty comparison reads as no change

`compareSessions` skips a metric either side lacks:
`src/lib/profiling/session-compare.ts:110` "typeof h !== 'number') continue;"
and an overall state is derived from what is left, ending at
`src/lib/profiling/session-compare.ts:166` "'unchanged';"
when nothing moved. With no comparable metric the rows are empty and the answer is
*unchanged*. The route always supplies full summaries, so this is not reachable through it;
it is reachable through the exported function, whose parameters are typed as partial. An
instrument that examined nothing returns the same word as one that examined everything and
found no change.

## The newer gate: stateless by design, and a window length that is checked

The capture gate is declared stateless at
`src/app/api/performance-profiling/route.ts:121` "N baseline captures vs M candidate captures"
under a branch at
`src/app/api/performance-profiling/route.ts:123` "if (action === 'perf-gate') {"
and that is a good property for this technique: the baseline and the candidate arrive in one
call, so there is no stored reference to drift, no way to re-record one silently and no
promotion to approve. It is the technique's preference for a same-job base realized as an
interface, and the part that is not yet enforced is the same-job condition itself: nothing
checks that the two sets were captured on one machine, under one configuration, in one
render mode, with one instrument.

What it does check is the window, because the fixed step makes the length a precondition:
`src/lib/profiling/perf-capture.ts:299` "Math.abs(split.windowMs.length - expectedWindowFrames) > windowFrameTolerance"
refuses a run whose window differs from the plan, with the reason
`src/lib/profiling/perf-capture.ts:300` "truncated or not at the fixed step"
That is a basis check derived from the declared step rather than recorded beside the number,
and it caught a class of mismatch no stored field would have. A half-read set is refused as
a whole, by design:
`src/lib/profiling/perf-capture.ts:281` "a half-read comparison is not a comparison"
and the baseline phase is kept as context only:
`src/lib/profiling/perf-capture.ts:270` "a drift indicator only: it never enters the verdict"
which keeps the within-run reference from being mistaken for the cross-build baseline.

The record the gate returns is
`src/lib/profiling/perf-capture.ts:274` "export interface CaptureGateResult extends PerfGateResult {"
and, read with the interface it extends, carries a verdict, a reason, per-percentile metrics,
the two run counts and a per-run phase summary. It names no build, configuration, render
mode, instrument or hardware, although the launch builder accepts either render mode
(`src/__tests__/lib/perf-capture-launch.test.ts:59` "carries the offscreen render mode through unchanged"),
and the null-renderer mode is declared by the tree's own spine as
`src/types/observation.ts:144` "CPU-only pose/movement metrics"
so the same gate, fed from two modes, would be a comparison across bases with nothing in its
output to say so.

## What a gate on this tree would add, without lowering the standard

Record a basis beside every capture set and compare it field by field: the build
fingerprint, the render mode, the step and cap, the instrument, the scenario and window,
and a hardware class defined by measuring unchanged runs across the machines in it. Refuse
with the differing fields named when they disagree. Keep the stateless call as the primary
comparator, and store a baseline only for the absolute budget. Where a stored baseline is
introduced, give it an approver, a fresh sample and a store the comparing job cannot write.
