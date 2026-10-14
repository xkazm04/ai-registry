---
layer: application
type: application
subject: deadline-pipeline-management
technique: escalating-reminder-thresholds
stack: node
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Node: the reminder ladder in a grant-writing pipeline

A daily cron runs a pure selector over in-flight drafts: ladder 30 / 14 / 7 / 1
plus a bounded overdue ladder, thresholds read from an environment string and
sanitized to positive, de-duplicated, ascending integers with a wholesale
fallback, a recorded sent-set keyed on draft id and threshold, suppressed rungs
recorded as handled only after the superseding digest was confirmed sent, and
one digest email per organisation per run. That is most of the technique, built
independently: the project was already conformant on selection, idempotence,
sanitizing, digest batching and the failed-send retry.

## The seam chosen to falsify

The technique's decision rule says adding a rung (say 60) must not retro-fire
for applications already past it. The selector's own test file covered 30 / 14
/ 7 / 1 only, so the rule was untested. A caught outcome would have changed what
the landing says: either the rule is wrong for a ladder with a sent-set, or the
"smallest crossed unsent" wording is incomplete.

## A and B

- **A (as it was):** the selector took the crossed rungs, removed the recorded
  ones and fired the smallest. With 60 added to the ladder and a draft 20 days
  out whose 30 rung was already recorded, 60 counted as unsent and fired a
  "closes in 60 days" nudge for a deadline 20 days out. The rule as written
  fails here, because a rung added after the draft passed it is both crossed
  and unsent, and only the smaller of two unsent rungs is protected.
- **B:** a crossed rung larger than the smallest rung already handled for that
  draft is retired as suppressed rather than fired. Overdue stages are negative
  and untouched.

Target: a retro-fired stale rung, 1 case under A, 0 under B (a new test fails
on A, passes on B). A second new test pins that a rung the draft legitimately
sits inside (45 days out, nothing handled) still fires. Floor: tsc and eslint
clean, the full suite 382 files / 3653 tests green.

## What it taught the technique

The technique held and its decision rule was right; the sentence "fire the
smallest crossed unsent rung" alone does not deliver it. The invariant that does
is a monotone high-water mark: **never fire a rung larger than one already
handled for the same application**. Not measured: whether the production ladder
is ever reconfigured (it is one environment string, so the case is reachable by
an operator edit alone).
