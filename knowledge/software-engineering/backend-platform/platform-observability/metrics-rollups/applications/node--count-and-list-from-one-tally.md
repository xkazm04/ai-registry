---
layer: application
type: application
subject: metrics-rollups
technique: count-and-list-from-one-tally
stack: node
status: forged
verified_on: 2026-10-27
---

# Promotion counters and the merge requests behind them (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). An agent's autonomy for a class of actions climbs one
rung only when its record clears a policy bar — "accepted 3 / 5 over the last five outputs",
reverts, guardrail blocks, merges nobody else edited. Those counters decide a permission, so
the screen that shows each one opens onto the merge requests it counted.

## One selection, two folds

`src/server/poller/derive/counters.ts:5` states the design: "The outputs are selected once
(tallyOf): countRecord totals them and ./sources.ts lists them, so a count and its list never
disagree." `tallyOf` (`src/server/poller/derive/counters.ts:151`) returns the selection — every
output since the record's start, newest first with ties broken by the higher iid (`:156`), the
windowed subset (`:157`), the merged ones, the edit facts, the blocks. `totalsOf` folds it into
counters (`src/server/poller/derive/counters.ts:167`); `sourcesOf` projects the same structure
into the list (`src/server/poller/derive/sources.ts:10`). The single entry point returns both
from one call: `src/server/poller/derive/sources.ts:41` "A record's counters and the outputs
behind them, from one tally."

## The list says what did not count, and what could not be read

Each listed output carries whether it was in the window, and the excluded ones carry a closed
reason (`src/server/poller/derive/sources.ts:32` "reason: 'outside_window' as const"). Facts the
counts could not read are listed too — the ledger not read this poll, the revert policy not
stating a demotion, a merge with no edit fact, a merge the gate did not decide
(`src/server/poller/derive/sources.ts:21-25`) — and the corresponding counter is null rather
than zero (`src/server/poller/derive/counters.ts:2` "one nothing states stays null (never zero,
never a value that would make a class eligible)").

## The invariant is tested at both ends

`src/server/poller/derive/__tests__/sources.test.ts:41` asserts the counters from `recordOf`
equal `countRecord`'s ("one tally: the totals are countRecord's own"), then that the listed
in-window merges are exactly the three the rule reads as "3 / 5" (`:44-46`). The interface's
explanation is computed only from the sources (`src/lib/promotion/sources/explain.ts:1-3`, "the
demo agreement test totals it against the fixture's counters"), so the drill-down cannot
invent a filter of its own.

## Deviation recorded

The explanation re-derives "counted" from the listed outputs' `inWindow` flag
(`src/lib/promotion/sources/explain.ts:61`) rather than receiving the counted set; it agrees
because the flag came from the tally, but it is a second small selection on the client side,
and the place a future exclusion would have to be added twice.
