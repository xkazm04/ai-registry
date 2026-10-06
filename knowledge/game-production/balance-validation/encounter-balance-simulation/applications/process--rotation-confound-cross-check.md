---
layer: application
type: application
subject: encounter-balance-simulation
technique: rotation-confound-cross-check
stack: process
status: forged
verified_on: 2026-10-01
---

# Three instrument reviews on one arcade racing balance harness

Source: the arcade racer in `firetv-deathride` at commit `9793226`, plus its
content worktree `firetv-deathride-content`. Every figure is **simulated**:
seeded races under the shipping fixed-step rules, driven by a proxy controller per class. No human
has played these races, and none of the rates is a felt result.

Paths below are root-relative to `firetv-deathride` unless marked as the content worktree.

## The rotation, and the test that now guards it

The mixed scenario crosses five lead classes with five courses. The scenario builder derives the
course from the seed block and the class from the seed plus slot, and a comment carries the reason:
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:25 "seed % 5 for both silently ties each class to one course"`.
The review that found it is recorded in
`docs/concepts/deathride/G1-REPORT.md:44 "Review caught an initial use of the same modulo rotation"`.
The first mixed result was discarded and the 2,000-race preset rerun. The guard is an enumeration
over the schedule with nothing simulated:
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:46 "mixed preset must cross every lead class with every course"`
collects the (course, lead class) pair for every seed in one period and asserts the set holds all
twenty-five combinations. This is the standard form: enumerate, assert completeness, decorrelate
with a slow and a fast factor.

The report also states what rides along, which is the standard's step four.
`docs/concepts/deathride/G1-REPORT.md:42 "this is a roster balance test, not an isolated causal estimate of chassis power"`
says each rival keeps its controller style with its class. The same line notes a grid advantage for
the lead slot; in the builder the lead is always the first car while the class rotates through it,
so that advantage is spread across classes rather than reported as its own column. Each
class-by-course pair has 80 seeds, so individual cells sit at a spread of several points, and the
report does not rank within them.

## Legal purchases only

The strengthened lead is built through the real shop.
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:14 "Buy the same useful tiers as the real shop"`
explains that forcing all tiers would put unusable armour on an already capped heavy class, and
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:17 "At class limit"`
is one of the two refusal reasons the check accepts, asserting every remaining offer is refused for
a legal reason. The test at
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:44 "already capped armor must not impose an unbuyable handling penalty"`
pins the specific case.
`docs/concepts/deathride/G1-REPORT.md:44 "both discarded summaries are retained"` records that a
second review caught this. Result of the legal build:
`docs/concepts/deathride/G1-REPORT.md:78 "The fully upgraded lead wins **96.45%**"` against stock
rivals, which the report itself labels a deliberately extreme stress probe, not evidence of
later-career challenge.

## The seed-diversity alarm

`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:100 "repeated seed outcomes"`
fires when distinct end-state hashes over runs fall below
`deathride/core/src/main/resources/data/balance-rules.csv:5 "minimumDistinctHashFraction,0.99"`.
Deviation from the idea as first stated: the floor is a fraction of 0.99, not equality, so a
one-percent collision rate does not trip it. The all-clear is worded as the standard asks:
`deathride/core/src/test/kotlin/dev/deathride/core/BalanceReport.kt:107 "No declared numeric alarm fired."`
The motivating incident is
`docs/concepts/deathride/W7-campaign.md:47 "Preliminary reports are preserved as"`: removing the old
modulo-three skill variation left five lane patterns, eight-seed cells repeated outcomes, and
preliminary win rates of 57.93, 49.14 and 35.05 percent became 72.68, 37.08 and 30.53 after a
seeded line offset and phase were added at reset only. The alarm is per scenario, and the incident
shows why a small cell needs its own.

## The threshold that could not fire

In the content worktree,
`docs/concepts/deathride/C1-roster-v2.md:25 "The first 40,000-race sweep used a 55% entry-rate check"`
records three copies per class and a maximum possible rate of 33.3 percent, so the check was
uninformative. The summaries were retained as initial evidence and acceptance moved to class share
of race winners over a declared 50/25/25 course mix, which the text calls stricter than the brief's
literal per-entry threshold. The sibling application on winner share owns the replacement metric;
this review is what found the gate was dead.

## What the repo does not do

- No planted-defect test: nothing in the harness shows the winner-share gate trips on a
  deliberately overtuned class; the reachable range is argued in prose, not asserted.
- The distinct-hash alarm is per scenario, not per cell, so a small cell can repeat itself while
  the scenario total passes.
- The reachable-range audit was done once by a reviewer and is not a standing test over every
  alarm threshold.
