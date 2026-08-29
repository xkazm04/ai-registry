---
kind: harvest-lane
created: 2026-08-28
updated: 2026-08-28
---

# Harvest - the intake queue

A graded backlog of external sources worth mining, drained by
[`/harvest`](../../.claude/skills/harvest/SKILL.md) through the
[`/intake`](../../.claude/skills/intake/SKILL.md) method. The watchlist tracks *trees*
for the reconcile and scan loops; this lane tracks *sources* for the content loop. An
entry graduates by being mined (one line in [`sources/index.md`](../sources/index.md),
one note beside it) and its row here flips to a terminal status.

**A queue entry is a candidate, never an authorization.** The same law `/intake` runs
on: a source ORIGINATES a finding, it never AUTHORIZES one. Nothing lands from this
lane without the corroboration and strip-test discipline of the intake method.

## Map of content

| Note | Holds |
| --- | --- |
| [`queue.md`](queue.md) | The queue itself. One row per source: grade, class, target, status. |
| [`coverage-gaps.md`](coverage-gaps.md) | Topics the founding research could NOT find an elite source for - the follow-up research targets. |
| `evaluations.md` | Created by the first `/harvest evaluate` run: the A/B impact ledger, one row per evaluated landing. |
| [`specs.md`](specs.md) | The spec bank: operator-approved content deferred to a later attended landing, with anchors. Strike on landing. |

## The queue's contract

- **Elite bar.** An entry earns its row by being the reference a domain expert would
  name, not by being on topic. Padding the queue moves the triage cost downstream to
  every future run.
- **Statuses.** `queued` -> `batched` (selected for the next run) -> `mined`
  (ledgered; the ledger line is the authority) | `parked` (maps to no live gap right
  now; revisit when the gap opens) | `dropped` (dead link, superseded, or judged
  below the bar - with one clause of reason). Append-only on the reason columns;
  never delete a row, or the same URL returns looking new.
- **Dedupe is owed to the ledger.** Before a row is batched, grep
  [`sources/index.md`](../sources/index.md) and this file for the URL's host+path. A
  re-mined source costs a full extraction round to rediscover written-down declines.
- **Priority is advisory, gaps decide.** `pri` records the founding grade. What
  actually gets batched is decided each run by mapping rows against the live scan
  (`node scripts/librarian-scan.mjs --json`) - a pri-1 row aimed at a saturated
  subject loses to a pri-3 row aimed at a bleeding one.

## Provenance

Founded 2026-08-28 from a six-agent parallel research pass (gap-weighted across all
eight bundles plus the registry's own knowledge-ops craft), 177 sources after dedupe
against the source ledger and the watchlist. Every URL was seen in live search results
or fetched pages at collection time; none are constructed.
