# Metric catalog v1.1 - what /lens-scan (and /adopt-bp's baseline) measures

Read from `SKILL.md` phase 2. Each metric is a **lens field key**: the store writes it
as `measurements.metric`, phase 1 writes its latest value into
`facets[feature][lens].values[key]`, and a v3.1 lens manifest declares it as a field
with `metric: { better, method, target?, warn_at? }`. Measure only keys listed here; a
new metric is a catalog change (and a skill version bump), not a run-time invention.

**Lenses with a scan block** (1.2; steps 1.3) are the exception to "measure only keys listed
here": their keys are their own manifest's numeric metric fields, measured by `judgement`
against `scan.instructions`, or by the composed steps of a steps scan (`static` for a
script's rows) ([lens-manifest-scan.md](lens-manifest-scan.md)). The rules below apply to
them unchanged, plus one: a feature the lens does not touch gets no row and a facet
`applicable: false`, never a 0.

## The rules every metric obeys

- **Unmeasurable means no row.** When the method cannot run for a feature (no files on
  disk, no overlay mapping, a harness that crashed), write nothing for that metric and
  log a `note` activity. A `0` is a measurement and claims the thing was counted.
- **One method per metric per feature.** The method is part of the number. When a
  metric could be read two ways, use the method this table names; a change of method
  is a break in the series and is said in the run's note.
- **Evidence is reproducible.** `static`: the counting rule or the exact command.
  `probe` / `harness`: the command and the report path. `judgement`: `file:line` for
  each counted site, comma-separated, or the coverage rows that produced the number.
- **The unit is the metric's own.** An `expected_delta` is in the same unit, signed
  (`-3` findings, `+15` percent points).

## development

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `loc` | lines | down | static | `footprint.mjs`: non-blank lines over the feature's existing `file_paths`. |
| `files` | files | down | static | `footprint.mjs`: existing `file_paths`. |
| `bundleKb` | KB | down | static | Only when the overlay names `bundle_stats` with per-feature chunk attribution. v1 ships no parser: `footprint.mjs` refuses `--bundle-stats`, so the metric stays unmeasured unless the overlay's own command writes it. Never estimated from source size. |
| `depCount` | packages | down | static | `footprint.mjs`: distinct bare-specifier package names (`@scope/name` or `name`) imported by the feature's js/ts files; relative, alias and runtime-builtin imports are not dependencies. Absent when the feature has no js/ts file. |
| `p50Ms` | ms | down | probe | The overlay's `## Probes` command for the feature's timed path; median of its runs. |
| `p95Ms` | ms | down | probe | Same command, 95th percentile. Fewer than 20 samples: report p95 as unmeasured. |
| `dupSites` | sites | down | judgement | Sites in the feature that duplicate logic present elsewhere (same shape, could be one function or component). Evidence lists every site. Through `code-optimizer` / `tech-debt-tracker`. |
| `testRatioPct` | % | up | static | `footprint.mjs`: test lines / non-test js/ts source lines x 100, one decimal, capped at 100. Test lines are the feature's own test files (`*.test.*`, `*.spec.*`, under `__tests__/` or `tests/`) plus every repo test file whose stem names one of its source files. Absent when there is no non-test source line. **1.1: was test files / source files; the series breaks at 1.1** (bp's development manifest always defined it as lines). |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

## security

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `findingsCritical` | findings | down | judgement | `security-auditor` findings rated critical: exploitable without authentication, or exposing secrets or other users' data. |
| `findingsHigh` | findings | down | judgement | Exploitable with a precondition (an account, a crafted input) or a missing control on a sensitive path. |
| `findingsMedium` | findings | down | judgement | Weakens a control without a known exploit path (missing rate limit, verbose errors). |
| `findingsLow` | findings | down | judgement | Hygiene: defence in depth, hardening the code would read better with. |
| `secretHits` | hits | down | static | `footprint.mjs --lens security`: `SECRET_PATTERNS` (key prefixes, private-key headers, long literal credentials) over the feature's non-test files. A hit a human has confirmed as a fixture is still counted until it is moved out of source. |
| `unsafeSinks` | sinks | down | static | `footprint.mjs --lens security`: `SINK_PATTERNS` (dynamic code evaluation, raw HTML injection, document.write, interpolated exec, `shell: true`) over the feature's non-test js/ts files. A judgement pass may remove a false positive with `file:line` and a reason. |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

Severity follows the house profile when it defines one (`house.md`, profile
`## Constraints`); otherwise the four definitions above.

## design

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `axeViolations` | violations | down | harness | Accessibility-engine violations on the feature's screens, summed over the overlay's sizes and themes. |
| `undesignedStates` | states | down | judgement | States the feature can reach with no designed presentation: loading, empty, error, partial, offline, permission-denied. Count per missing state per surface; evidence names the surface and the state. Through `ux-reviewer` / `error-handler`. |
| `rawLiterals` | literals | down | static | `footprint.mjs --lens design`: raw colours (`#hex`, `rgb()`/`rgba()`) written in UI component files (`.tsx .jsx .vue .svelte .html`) instead of tokens. Absent (and the feature named `no_ui`) when it has no component file. Raw sizes and strings are not counted in 1.1. |
| `minTextPx` | px | up | harness | The smallest computed font size of visible text on the feature's screens. |
| `consoleErrors` | errors | down | harness | Console errors and unhandled rejections logged while the harness drives the feature. |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

## performance

The lens is measured before and after a change by the same command, so its numbers are
only as good as the overlay's probes. Every probe runs against a local production build
(never a dev server: hot reload and source maps are not what users run), on the place the
facet's `probeEnv` names; readings from two places are two series.

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `bundleKb` | KB | down | static | The same reading as development's `bundleKb`: only from the overlay's `bundle_stats` with per-feature chunk attribution, never estimated from source size. Absent without a stats file. |
| `startupMs` | ms | down | probe | Cold start (fresh process or tab, empty cache) to the first interactive frame of the feature's entry screen. p95 of the probe's samples. |
| `interactionP95Ms` | ms | down | probe | The feature's main interaction, input to the next paint (the Event Timing duration in a browser; input to the frame presented on a device). p95 of the samples. |
| `frameP95Ms` | ms | down | probe | Frame time while the feature animates or scrolls through its main flow. p95 of the frame durations. Absent when the feature neither animates nor scrolls. |
| `blockingMs` | ms | down | probe | Main-thread time lost to long tasks along the scripted path: for each long task (the browser's `longtask` entries, or a profiler's tasks over 50 ms) the time over 50 ms, summed over one pass. One sample per pass. |
| `jankFrames` | frames | down | probe | Frames longer than 33.3 ms (twice a 60 Hz budget) along the scripted path, counted over one pass. One sample per pass. Catches the stall a p95 averages away. |
| `idleWakeups` | callbacks/s | down | probe | Frame callbacks (`requestAnimationFrame` requests, or timers firing) the page still makes in a quiet second after its motion ends. One sample per pass. |
| `memoryMb` | MB | down | probe | Resident memory (a browser: the tab's `performance.measureUserAgentSpecificMemory()` or the JS heap after a forced GC) after one pass of the main flow. Median of the samples; no target in the manifest, a budget is the app's own. |

**A probe** is one named entry under the overlay's `## Probes`: a feature, a metric and a
command the skill runs in the product root. The command prints one JSON line:

```
## Probes
booking-checkout interactionP95Ms: node scripts/probes/interaction.mjs --feature booking-checkout --runs 30
booking-checkout startupMs: node scripts/probes/startup.mjs --route /book --runs 20
```

```json
{"metric":"interactionP95Ms","feature":"booking-checkout","samples":[84.1,91.0,77.3]}
```

- `samples` are the raw readings in the metric's unit, **20 or more** for a distribution
  (`startupMs`, `interactionP95Ms`, `frameP95Ms`), **3 or more passes** for a per-pass total
  (`blockingMs`, `jankFrames`, `idleWakeups`, `memoryMb`). Fewer: the metric is unmeasured
  for the feature (no row, a `note` activity naming the probe and the count).
- The skill computes the value, never the command, so every probe is summarised the same
  way: p95 by nearest rank for a distribution, the median of the passes for a per-pass total.
- **Pick the metric with headroom.** On a healthy page `frameP95Ms` sits at the display's
  frame interval (16.7 ms at 60 Hz) and cannot show a fix; a frame-rate cap is a floor, not
  a reading. Blocking time, jank frames and idle wake-ups keep headroom on a smooth page, so
  a performance proposal names one of them (or `interactionP95Ms`) unless frames are
  actually slow. One probe command may print several metrics: one JSON line per metric.
- The row is written with `method: probe`; its evidence is the command, verbatim, and the
  sample count (`node scripts/probes/interaction.mjs --feature booking-checkout --runs 30; n=30`).
- A `metric` or `feature` in the output that differs from the entry fails the probe: no row.
- Before and after a change, the same entry runs at the base and at the item's commit; the
  pair is the comparison. A probe edited between the two breaks the series (say it in the
  run's note).

## standardsPct

The share of judged standards the feature conforms to, for one lens:

```
standardsPct = conformant / (conformant + deviation) x 100
```

over the `coverage` rows this run wrote for the feature while judging that lens.
`not-applicable` and `unknown` rows are excluded. No conformant and no deviation row:
unmeasured, no row. A house line (`house:<subject>/<line-id>`) and a registry technique
(`<subject>/<technique>`) count the same; when a house line overrides a technique,
only the house line is judged.

## Targets

A target belongs to the lens manifest (`metric.target`, `metric.warn_at`) or to the
house profile, never to this catalog: the same `loc` is healthy in one product and a
smell in another. A proposal's expected delta is judged against the target where one
exists, and against the feature's own previous value where none does.
