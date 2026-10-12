# Metric catalog v1 - what /lens-scan measures

Read from `SKILL.md` phase 2. Each metric is a **lens field key**: the store writes it
as `measurements.metric`, phase 1 writes its latest value into
`facets[feature][lens].values[key]`, and a v3.1 lens manifest declares it as a field
with `metric: { better, method, target?, warn_at? }`. Measure only keys listed here; a
new metric is a catalog change (and a skill version bump), not a run-time invention.

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
| `testRatioPct` | % | up | static | `footprint.mjs`: test files (`*.test.*`, `*.spec.*`, under `__tests__/` or `tests/`) / non-test js/ts source files x 100, one decimal. Absent when there is no non-test source file. |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

## security

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `findingsCritical` | findings | down | judgement | `security-auditor` findings rated critical: exploitable without authentication, or exposing secrets or other users' data. |
| `findingsHigh` | findings | down | judgement | Exploitable with a precondition (an account, a crafted input) or a missing control on a sensitive path. |
| `findingsMedium` | findings | down | judgement | Weakens a control without a known exploit path (missing rate limit, verbose errors). |
| `findingsLow` | findings | down | judgement | Hygiene: defence in depth, hardening the code would read better with. |
| `secretHits` | hits | down | static | A secret-pattern grep (key prefixes, private-key headers, high-entropy assignments) over the feature's files; the pattern set and command are the evidence. A hit a human has confirmed as a fixture is still counted until it is moved out of source. |
| `unsafeSinks` | sinks | down | static | Calls into a dangerous sink with non-constant input: dynamic code evaluation, raw HTML injection, shell or SQL built by string interpolation, unsafe deserialization. The sink list and grep are the evidence; a judgement pass may remove a false positive with `file:line` and a reason. |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

Severity follows the house profile when it defines one (`house.md`, profile
`## Constraints`); otherwise the four definitions above.

## design

| Key | Unit | Better | Method | How it is measured |
| --- | --- | --- | --- | --- |
| `axeViolations` | violations | down | harness | Accessibility-engine violations on the feature's screens, summed over the overlay's sizes and themes. |
| `undesignedStates` | states | down | judgement | States the feature can reach with no designed presentation: loading, empty, error, partial, offline, permission-denied. Count per missing state per surface; evidence names the surface and the state. Through `ux-reviewer` / `error-handler`. |
| `rawLiterals` | literals | down | static | Presentation values that bypass the design tokens: raw colours, raw pixel sizes and spacing, hard-coded user-facing strings where the repo has a string catalog. Grep pattern and command are the evidence. |
| `minTextPx` | px | up | harness | The smallest computed font size of visible text on the feature's screens. |
| `consoleErrors` | errors | down | harness | Console errors and unhandled rejections logged while the harness drives the feature. |
| `standardsPct` | % | up | judgement | See [standardsPct](#standardspct). |

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
