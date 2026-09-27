---
layer: application
type: application
subject: deterministic-run-verification
technique: declared-rule-verification
stack: process
status: forged
verified_on: 2026-09-27
applied: experiment
ab_verdict: better
---

# Process: asking the ignore check about committed files, across thirteen trees

The technique's first check is exclusions: ask the repository's own tooling whether a
committed path is excluded. On 2026-09-27 that instruction was followed literally, and then
the way it has to be followed, over every tracked file in thirteen repositories
(about 46,000 paths).

## The literal instruction answers no for everything

A = version control's ignore check over the tracked paths, as a harness would first write
it. **0 hits in all 13 trees.** The check reports a tracked file as not ignored by default,
because exclusion rules do not govern tracked files. A throwaway repository with one
force-added `*.log` file confirmed it: the default form says "not ignored" and exits 1, and
the form that disregards the index names the file.

B = the same check with the index disregarded. **129 tracked-and-excluded paths in 7
trees.** Read row by row, they are not one population:

- **Grandfathered.** Configuration files in one repository were added in November and the
  rule excluding their directory was written in January. A data file in another predates
  its pattern by two weeks. The paths were tracked before any rule applied, so they say
  nothing about any run.
- **Force-added after the rule.** Screenshots under an excluded reference directory, a
  results README, a ship-loop configuration: each added weeks or months after its rule,
  which needed an explicit override. These are decisions, as the technique says.
- **Run artefacts committed.** An unattended session's lane report, committed by that
  session's own "exceeded 20 min and was stopped" commit. Writing it was the task;
  committing it was the violation the technique describes.
- **One tree's 104** are a whole run-evidence directory under one pattern, the largest
  single group, and they need their own reading before anyone calls them a rule override.

## One answer depends on the machine

The lane report above is excluded only by the clone's own exclude file, which the loop that
runs the lanes writes on the machine it runs on. No commit carries that rule. On a fresh
clone the same path is not excluded at all, so the answer to "did this run commit an
excluded file" differs by machine for the same commit. That is why the technique now says
to record which source matched and to give reproducible verdicts only from committed
sources.

Verdict `better`, as an experiment. The instrument as first written finds nothing, on
every tree. The corrected one finds the real population, and the dating splits it into
grandfathered paths and decisions, which is why the technique now judges only paths the run
added, against the starting revision's rules. Nothing in the repositories was changed.
