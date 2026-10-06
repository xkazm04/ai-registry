---
layer: application
type: application
subject: on-device-verification-harness
technique: keep-the-failed-baseline
stack: process
status: forged
verified_on: 2026-10-01
---

# A soak that failed, a probe that disturbed it, and the report that kept both

Source tree `C:\Users\kazda\kiro\firetv-deathride` (root of every path below). The stack is `process`: the
realization is a measurement history across reports and pitfall logs, not a single module. One streaming stick, one
controlling machine, scripted clients, emulated touch. Nothing was felt; the optical figures were never
collected.

## The baseline that failed and was kept

The final report names the failed run and says why it stays: `docs/concepts/deathride/G1-REPORT.md:119 "failed the zero-rejection assertion"`, and its numbers (900.17 seconds, twelve races, 3 of 4 stale input frames rejected, worst transition 566.57 ms,
worst fully active race maximum 129.50 ms) are listed in the same paragraph. The retained file is named `w8-soak-baseline.json` rather than overwritten. The framing is the technique's own:
`docs/concepts/deathride/G1-REPORT.md:119 "these are measured corrections, not exclusions of inconvenient data"`.

## The instrument that disturbed it

The pitfall log records the probe's cost: `docs/concepts/deathride/PITFALLS.md:32 "ordinary `dumpsys meminfo <process>` coincided with an explicit copying GC"`, with a roughly 110-130 ms render interval every minute. The remedy and the retention rule are in one line: the device's own help documents the local option, and
`docs/concepts/deathride/PITFALLS.md:32 "Preserve the initial intrusive run"`. The final soak says it used the cheap path:
`docs/concepts/deathride/G1-REPORT.md:115 "to avoid invoking an application dump/explicit GC"`. Upward lesson folded into the technique: the log also says the real output "still includes TOTAL PSS and GL mtrack", so the local report is still a measurement of
totals, and it omits the heap breakdown, which the draft had not stated.

## The transition that was in the maximum

The scenery build profile is the connecting measurement: `docs/concepts/deathride/PITFALLS.md:34 "yield between bounded primitive groups"`, after a one-frame rebuild of 110-121 ms plus 179-206 ms of disposal. The report keeps the nominal-budget caveat and the slice maxima. The reporting rule for phases:
`docs/concepts/deathride/G1-REPORT.md:117 "Report active race windows separately"` and the population count is stated at `docs/concepts/deathride/G1-REPORT.md:102 "71 fully active race windows"`.

## The claim not written

The report refuses the strict reading against the first measured baseline:
`docs/concepts/deathride/G1-REPORT.md:110 "would be false"` (the worst active window's ninety-fifth percentile was 0.07 ms above the earlier run's final window), and says the performance gate is "not a full pass" against the originally proposed bar.

## Where the tree falls short of the standard

- **The cause of the stale-frame rejections is not isolated.** The baseline kept the failure and not the diagnosis of whether the game or the harness's timing caused it.
- **The intrusive and the local totals were not compared at one instant.** The technique's step one, a paired reading, was not done; the claim that the local reading is faithful rests on its output shape.
- **A different method than the proposal.** The result is a baseline; the proposed bar stays missed, and the log does not say who decides whether the bar or the build moves.
- **Fixed output paths for ordinary runs.** Only the named baseline survived by choice; there is no rule that every failed run is copied before the next starts.
