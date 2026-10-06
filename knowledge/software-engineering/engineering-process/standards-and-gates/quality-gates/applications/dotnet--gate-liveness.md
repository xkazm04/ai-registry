---
layer: application
type: application
subject: quality-gates
technique: gate-liveness
stack: dotnet
verified_on: 2026-10-06
verified_against: dotnet@10.0.401
---

# A performance gate announced as shipped, whose gate step is never instantiated

`microsoft/mcp` at commit `b7533190a98d989469dce9d61b0d4752943bceaa` is Microsoft's
official MCP server monorepo. The stack version is witnessed by `global.json`, which
pins the SDK to `10.0.401` with `rollForward: latestFeature`. #2510 (5b563eff,
2026-09-14) added the performance lane read here: startup, dispatch, resource and
concurrency harnesses under `eng/scripts/`, a versioned workload catalog
(`eng/perf-workloads.json`), and a `Perf` stage in the nightly pipeline.

The release notes describe it as a gate four times. `servers/Azure.Mcp.Server/CHANGELOG.md`,
under 3.0.0-beta.44, says of each harness that "Results are gated against a baseline
with tiered budgets": p50/p95 within 10%, p99 within 20%, scaling efficiency within 15%,
and no unbounded soak growth.

## Where the gate is, and why it never runs

The regression checkers themselves are strict, and they are the right shape for this
technique. `eng/scripts/Check-StartupPerformanceRegression.ps1` takes both paths as
`[Parameter(Mandatory)]` (`:37-38`), sets `$ErrorActionPreference = 'Stop'` (`:46`), and
says in its own help that it "Fails (throws) if any budget is exceeded" (`:15`). If it
ran without a baseline, it would fail loudly rather than pass quietly.

It does not run. The pipeline instantiates the step only when a parameter is passed
(`eng/pipelines/templates/jobs/perf-test.yml:82-84`, "Regression gate — only active when
BaselinePath is provided", inside `${{ if ne(parameters.BaselinePath, '') }}`). The only
caller passes no such parameter. The four baseline lines in
`eng/pipelines/templates/common.yml:141-145` are commented out under "Uncomment to gate on
regressions once a baseline is committed". No baseline is committed: the only JSON files
under `eng/` are the workload catalog and a credential-scan suppression list.
Template expansion removes the step before the run begins, so the pipeline UI shows no
skipped gate. There is no step at all, only measurement steps that pass when they finish.

The local entry point has the silent-skip shape in miniature.
`eng/scripts/Test-StartupPerformance.ps1:330-333`, given a baseline path that does not
exist, writes `Write-Warning "Baseline file not found: … (skipping regression check)"`
and exits as it would on a pass.

So the lane reports green on every run of a stage labelled as a gate. The stage runs
when `RunPerfTests` is set in the internal project (`common.yml:125`), and the changelog
says that is nightly. In three weeks no comparison has ever executed. The technique names both halves: "a
gate whose scope is empty unless a flag is passed", and the could-not-run case folded
into pass. One more property this tree adds: **the deactivation is at the
template-expansion layer**. No log line, skipped-step marker or warning exists for an
operator to find, because the gate was removed before the run was planned. The changelog
is the only artifact that says a gate exists, and it is the one artifact no build reads.

## What the lane does right

It is not a careless lane. Per the same changelog section, the harnesses embed a self-describing environment block
(commit, runtime, OS, CPU, memory, workload-catalog version) in every result, which
the technique's history-keeping section asks of a liveness probe. The budgets are tiered
by percentile rather than one threshold, and the default repetitions were raised to ten.
A state-isolation signal counts concurrent responses whose tool count does not match the
expected count. That is a real cross-request leakage check, and it is the measurement
a catalog-projection server most needs under concurrency. Everything needed for a gate
is present except the baseline and the four lines.

## What this realization cannot do

It cannot tell a reader of its own release notes that it is not yet a gate. A seeded
regression would not turn it red, because there is no step to turn red. The cheapest
liveness probe here is a check that fails when a stage named as a gate contains no step
that can fail. It costs one template assertion, and nothing in the tree performs it.
