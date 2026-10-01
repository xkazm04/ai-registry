---
layer: application
type: application
subject: perf-regression-gating
technique: noise-floor-before-the-threshold
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# A guessed one-percent band, and a gate that takes its own A/A spread over simulated frames

Read against a Next.js game-development assistant (`pof`) at master `880bfed9`. The Node
version is witnessed by the type-definition pin, not by a runtime pin: the devDependency at
`package.json:57` "@types/node" resolves in the lockfile at
`package-lock.json:3079` "node_modules/@types/node" to
`package-lock.json:3080` "24.13.3". The tree declares no `engines` field, no version file
and no CI pin, so `node@24` is the major its type definitions target and nothing stronger.

Two mechanisms for judging a frame-cost change live in this tree side by side, and the pair
is the lesson. The older one compares two imported sessions against a fixed band. The newer
one, `src/lib/profiling/perf-capture.ts`, landed on master the same day this document was
written, from this subject's own spec in the same intake run. It is therefore a realization
of the standard and not independent evidence that the standard was found: where it matches,
the match is by construction, and the deviations below are the part that teaches.

## The older mechanism: one band, derived from nothing

`compareSessions` decides whether a metric moved by testing the difference against a fixed
fraction of the larger magnitude. The comment at
`src/lib/profiling/session-compare.ts:37` "A change within 1% of the larger magnitude is capture noise"
sits over the constant at
`src/lib/profiling/session-compare.ts:38` "NOISE_FRACTION = 0.01;"
and line 112 applies it identically to every row:
`src/lib/profiling/session-compare.ts:112` "NOISE_FRACTION * Math.max(Math.abs(b), Math.abs(h))"
An average frame time, a minimum frame rate that is a single frame
(`src/lib/profiling/session-compare.ts:27` "key: 'minFPS', label: 'Min FPS'"), and a maximum
collection pause (`src/lib/profiling/session-compare.ts:33` "key: 'maxGcPauseMs', label: 'Max GC pause'")
share one number. A tail statistic and a mean do not have one spread.

What it does right is represent a third state:
`src/lib/profiling/session-compare.ts:48` "null = no verdict: within noise"
keeps a within-band row from becoming better or worse. What it does wrong is stop there.
Nothing in the four older files of that directory replicates a run, takes a range or a
deviation, or names a lane: a search of them for replicate, repeat, spread, deviation and
the A/A label returns the constant and its use, one comment about repeated finding ids, and
three fix-prompt advice strings; the control is that the constant itself matches. When every
row is inside the band the verdict is a word the tree chose for it,
`src/lib/profiling/session-compare.ts:166` "'unchanged';"
and the interface labels it
`src/components/modules/evaluator/PerformanceProfilingView/SessionCompare.tsx:17` "unchanged: { label: 'Unchanged'"
A within-noise result is rendered as a statement of sameness, where the standard asks for
*unverifiable at this resolution* unless the resolution is known to be adequate.

## The series the band is applied to is partly generated

The import path is a stat-dump reader. It selects aggregate rows at
`src/lib/profiling/csv-parser.ts:156` "s.group === 'GameThread' || s.group === 'RenderThread'"
and the comment over the code that follows is
`src/lib/profiling/csv-parser.ts:187` "Aggregate by unique call counts as proxy for"
Up to three hundred frames are then drawn with a spread the generator invents:
`src/lib/profiling/csv-parser.ts:204` "const variance = 0.8 + Math.random() * 0.4;"
and draw calls are
`src/lib/profiling/csv-parser.ts:216` "drawCalls: Math.round(500 + Math.random() * 300),"
Two imports of one capture therefore carry different series. By arithmetic on those lines,
not by an executed run: the mean of three hundred draws spread evenly over 0.8 to 1.2 has a
sampling error of about 0.7% of its mean, so a pair of imports of the same input differs by
roughly the tool's own 1% band. The high percentile the summary reports is taken at
`src/lib/profiling/csv-parser.ts:304` "frameTimes[Math.floor(frameTimes.length * 0.99)]"
over that generated spread, and carries nothing about the capture's own tail.

The newer file says so in its own header:
`src/lib/profiling/perf-capture.ts:6` "synthesizes frames from aggregates with Math.random"
and that the older path cannot supply the per-frame times a noise-floor gate needs. Nothing
marks the generated series on the older path's output, so a gate reading it would have an
instrument with no input.

## The newer mechanism: a spread taken before a verdict

`gatePerfRuns` reads the capture the way the technique asks. Its header states the principle
at `src/lib/profiling/perf-capture.ts:13` "two runs of the SAME build already differ by the spread"
and the outcome rule at
`src/lib/profiling/perf-capture.ts:18` "the noise is too large to tell. Never pass, never fail."
The replicate is a whole capture window: the percentile is taken per run at
`src/lib/profiling/perf-capture.ts:243` "baselineRuns.map((r) => percentile(r, p))"
and aggregated across runs by the median, and the spread is defined at
`src/lib/profiling/perf-capture.ts:169` "max - min of the percentile across the baseline runs"
The verdict rule reads the noise-adjusted upper bound. A fail needs
`src/lib/profiling/perf-capture.ts:205` "if (effectMs > spreadMs && effectMs > toleranceMs) {"
and a pass needs
`src/lib/profiling/perf-capture.ts:208` "effectMs + spreadMs <= toleranceMs"
with everything else unverifiable. That form, a pass only when the change plus its spread
stays inside the tolerance, was an upward lesson for the technique's draft, which had stated
the weaker condition that the spread alone be smaller than the effect. A floor under the
tolerance reflects the timer's resolution:
`src/lib/profiling/perf-capture.ts:158` "the frame timer's own resolution decides"
A set of runs too small to estimate a spread is refused with its reason:
`src/lib/profiling/perf-capture.ts:233` "runs per side to estimate an A/A spread"

## Deviations: the guesses, and what was not measured

The defaults are placeholders presented as parameters. The replicate count is a floor, not a
stop-on-stability rule:
`src/lib/profiling/perf-capture.ts:152` "fewer cannot estimate a spread. Default 3."
The minimum frames and the tolerance are chosen, not derived from a lane:
`src/lib/profiling/perf-capture.ts:154` "Default 300 (5 s at the fixed 60 fps step)"
and
`src/lib/profiling/perf-capture.ts:188` "toleranceFraction: 0.05,"
The spread comes from the baseline side alone:
`src/lib/profiling/perf-capture.ts:200` "const spreadMs = range(base);"
so a noisier candidate lane is invisible. The estimate is a range over a handful of runs taken
in one call, which says nothing about days, cold machines or interleaving, and a range grows
with the number of runs, so the number is as much a function of the count as of the lane.

The tree is candid about the larger gap. The fixtures are labelled
`src/__tests__/lib/profiling/simulated-frames.ts:2` "No engine produced any of"
and
`src/__tests__/lib/profiling/simulated-frames.ts:5` "The model parameters are guesses and are named as such"
The test header says
`src/__tests__/lib/profiling/perf-capture-simulated.test.ts:11` "It does not measure a real engine"
and the launch plan records
`src/types/observation.ts:187` "Not exercised against a running engine from here."
The scenario controller is not known to emit the window markers at all:
`src/types/observation.ts:189` "UNVERIFIED: that PoF's UScenarioController emits the events"
and until it does, the splitter's answer is
`src/types/observation.ts:192` "never a guess."
That is the technique's decision rule about a lane that does not yet exist, and it is kept:
the gate's logic is exercised against a stated noise model and the real lane's spread is
reported as unmeasured.

## What the simulation did and did not show

The simulated comparison pits the older single-run one-percent rule against the new gate.
`src/__tests__/lib/profiling/perf-capture-simulated.test.ts:105` "expect(FIVE_AA.aFlags).toBeGreaterThan(0);"
asserts that the one-percent rule flags at least one unchanged pair under the model, and the
run recorded in the tree's ledger gives
`.ai/applied.jsonl:28` "Five A/A pairs: A flagged 1, B flagged 0 (5 unverifiable, 0 pass)"
and, across a sweep of run-to-run drift,
`.ai/applied.jsonl:28` "A false flags 21 to 48, single-run 5% rule 0 to 42, B 0 to 2"
All of it is simulated. The part worth keeping is the parenthesis of the first quotation: at
the default tolerance and the model's drift, the gate returned unverifiable for every
unchanged pair and passed none, which is the resolution rule working as designed — the lane
as modelled cannot certify a pass — and is exactly what a guessed band would have hidden.

## What the older compare would need

Keep the new gate for verdicts and derive its constants from a measured lane. Retire the
fixed band from any path that blocks, and until then label its output advisory. Where the
compare must stay for interactive use, mark the synthesized series in the output it
returns, so a within-band row is never offered as a measurement of the capture's own
variation.
