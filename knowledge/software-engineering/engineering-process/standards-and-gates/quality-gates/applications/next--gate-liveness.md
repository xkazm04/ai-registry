---
layer: application
type: application
subject: quality-gates
technique: gate-liveness
stack: next
verified_on: 2026-09-02
verified_against: next@16.3.3
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A coverage gate whose oracle cannot see a quarter of its own suite

The tree's coverage gate (`vitest.config.js`) was repaired the day before
this run in the *target* direction: instrumentation now covers every source
file whether or not a test imported it, and the config records the reading
that forced the repair — the hand-scoped list reported 175 files, the whole
tree reports 1,529, of which 490 sit at zero and were "invisible to this
report, not visibly untested". The target population is now honest. The
oracle population is still the default: the unit runner's `include` glob,
one runner, one process.

## The structural fact

The suite's own config describes tests that "do real work (spawning the
doctor subprocess against fixture repos, driving the PDF pipeline end to
end)", and the tree carries a second suite under a different runner
(`e2e/`, `uat/`). Neither of those reaches the coverage instrument: what a
spawned process executes is never instrumented by the parent, and what the
browser runner drives is never collected. Measured with the tree's own
search tool, no coverage run needed:

| Population | Count |
| --- | --- |
| source modules imported by in-oracle unit tests | 313 |
| source modules imported by the end-to-end suite | 0 (it drives the served app, not modules) |
| scripts executed by unit tests through a spawn, outside the coverage `include` | 8 |

The eight scripts are tested and have no coverage number at all — not zero,
absent — and would read as 0% the day someone widened `include` to reach
them, which is the deficient-direction artifact the amendment describes. The
three gated directories happen to be exercised in-process, so no floor is
wrong today; the config's own note that the whole-tree number is "the only
place a NEW untested directory shows up" is exactly the reading a spawned or
browser-driven directory would defeat.

## What A and B were

A is the report as it stands: a module's number is its in-process line
coverage, and a module the oracle never imported reads as zero (or absent,
outside `include`). B is the same report with the oracle's population
declared: each zero is qualified as *in-oracle 0%, exercised by N tests
outside the oracle* where a spawn or an end-to-end spec reaches it. The
predicate is the number of files whose classification changes. Under A the
eight spawn-driven scripts are absent; under B they are "exercised,
unmeasured". The verdict is better because B changes what an operator would
do with the 490 — of which some unknown fraction is browser-exercised — and
A cannot.

## What this cannot show

How many of the 490 zero-coverage files the end-to-end suite actually
exercises. That needs browser-side coverage collection through the
end-to-end runner, which the tree does not have; until it does, the
declared-oracle line in the config is the change to make, and it is a
comment plus one sentence in the baseline's predicate, not a threshold.
